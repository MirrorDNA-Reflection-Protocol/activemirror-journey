#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const contractDir = path.join(repoRoot, '.mirror', 'CONTRACTS', 'amos');
const receiptDir = path.join(repoRoot, '.mirror', 'RUNTIME_DRY_RUNS');

const defaults = {
    request: path.join(contractDir, 'shadow_runtime_request.consumer.example.json'),
    outDir: receiptDir,
    out: '',
    timestamp: '',
    expect: '',
    write: false,
    dryRun: false,
    selfTest: false,
};

const requiredGates = [
    'guard:runtime-integration',
    'guard:amos-contracts',
    'guard:receipt-chain',
];

const gateCommands = {
    'guard:runtime-integration': ['scripts/amos_runtime_integration_gate.mjs', '--expect', 'allow'],
    'guard:amos-contracts': ['scripts/amos_contract_gate.mjs', '--self-test'],
    'guard:receipt-chain': ['scripts/amos_receipt_chain_gate.mjs', '--verify'],
};

const requiredBlockedClaims = [
    'Shadow adapter performed a live action.',
    'Shadow adapter called a model.',
    'Shadow adapter changed the public app.',
    'Shadow adapter changed gateway behavior.',
    'Shadow adapter wrote durable memory.',
];

const blockedLiveCapabilities = [
    'live_action',
    'network',
    'model_call',
    'external_write',
    'public_route',
    'durable_memory_write',
];

function resolvePath(value) {
    return path.isAbsolute(value) ? value : path.resolve(process.cwd(), value);
}

function parseArgs(argv) {
    const args = { ...defaults };
    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];
        if (arg === '--write') {
            args.write = true;
        } else if (arg === '--dry-run') {
            args.dryRun = true;
        } else if (arg === '--self-test') {
            args.selfTest = true;
        } else if (arg.startsWith('--') && argv[index + 1]) {
            const key = arg.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
            if (!Object.hasOwn(args, key)) throw new Error(`Unknown argument: ${arg}`);
            args[key] = ['timestamp', 'expect'].includes(key) ? argv[index + 1] : resolvePath(argv[index + 1]);
            index += 1;
        } else {
            throw new Error(`Unknown argument: ${arg}`);
        }
    }
    if (args.write && args.dryRun) throw new Error('Choose --write or --dry-run, not both');
    return args;
}

function readJson(filePath, label) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        throw new Error(`${label}: cannot read JSON at ${filePath}: ${error.message}`);
    }
}

function stamp(args) {
    if (args.timestamp) return args.timestamp;
    return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function isoFromStamp(value) {
    const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(value);
    if (!match) return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    const [, year, month, day, hour, minute, second] = match;
    return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
}

function requireString(object, key, label, errors) {
    if (typeof object[key] !== 'string' || !object[key].trim()) {
        errors.push(`${label}.${key} must be a non-empty string`);
        return '';
    }
    return object[key].trim();
}

function requireStringArray(object, key, label, errors) {
    if (!Array.isArray(object[key]) || !object[key].length) {
        errors.push(`${label}.${key} must be a non-empty array`);
        return [];
    }
    const badIndex = object[key].findIndex((item) => typeof item !== 'string' || !item.trim());
    if (badIndex >= 0) errors.push(`${label}.${key}[${badIndex}] must be a non-empty string`);
    return object[key].map((item) => String(item).trim());
}

function missingFrom(values, required) {
    const set = new Set(values);
    return required.filter((item) => !set.has(item));
}

function safeRepoPath(relativePath) {
    if (typeof relativePath !== 'string' || !relativePath.trim()) return false;
    if (path.isAbsolute(relativePath)) return false;
    const target = path.resolve(repoRoot, path.normalize(relativePath));
    const relative = path.relative(repoRoot, target);
    return !relative.startsWith('..') && !path.isAbsolute(relative);
}

function validateShape(payload) {
    const errors = [];
    const request = payload.shadow_runtime_request;
    if (!request || typeof request !== 'object' || Array.isArray(request)) {
        return { errors: ['shadow_runtime_request must be an object'], request: {} };
    }
    if (request.schema_version !== 'shadow_runtime_request.v0_1') errors.push('shadow_runtime_request.schema_version must be shadow_runtime_request.v0_1');
    const id = requireString(request, 'id', 'shadow_runtime_request', errors);
    if (id && !/^[a-z0-9][a-z0-9_-]{2,80}$/.test(id)) errors.push('shadow_runtime_request.id must be a lowercase slug');
    const surface = requireString(request, 'surface', 'shadow_runtime_request', errors);
    if (surface && !['consumer_app', 'gateway_worker', 'local_console'].includes(surface)) errors.push('shadow_runtime_request.surface is invalid');
    const mode = requireString(request, 'mode', 'shadow_runtime_request', errors);
    const proposedAdapter = requireString(request, 'proposed_adapter', 'shadow_runtime_request', errors);
    const intent = requireString(request, 'intent', 'shadow_runtime_request', errors);
    const requestedAction = requireString(request, 'requested_action', 'shadow_runtime_request', errors);
    const reads = requireStringArray(request, 'reads', 'shadow_runtime_request', errors);
    const writes = requireStringArray(request, 'writes', 'shadow_runtime_request', errors);
    const egress = requireString(request, 'egress', 'shadow_runtime_request', errors);
    const requiredGateList = requireStringArray(request, 'required_gates', 'shadow_runtime_request', errors);
    const outputType = requireString(request, 'output_type', 'shadow_runtime_request', errors);
    const claimBoundary = requireStringArray(request, 'claim_boundary', 'shadow_runtime_request', errors);
    const blockedClaims = requireStringArray(request, 'blocked_claims', 'shadow_runtime_request', errors);

    const receipt = request.receipt;
    if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) {
        errors.push('shadow_runtime_request.receipt must be an object');
    } else {
        if (receipt.enabled !== true) errors.push('shadow_runtime_request.receipt.enabled must be true');
        if (receipt.destination !== '.mirror/RUNTIME_DRY_RUNS') errors.push('shadow_runtime_request.receipt.destination must be .mirror/RUNTIME_DRY_RUNS');
        requireStringArray(receipt, 'content', 'shadow_runtime_request.receipt', errors);
    }

    for (const key of ['live_action_enabled', 'network_enabled', 'model_call_enabled', 'external_write_enabled', 'public_route_enabled']) {
        if (typeof request[key] !== 'boolean') errors.push(`shadow_runtime_request.${key} must be boolean`);
    }

    return {
        errors,
        request: {
            id,
            surface,
            mode,
            proposed_adapter: proposedAdapter,
            intent,
            requested_action: requestedAction,
            live_action_enabled: request.live_action_enabled,
            network_enabled: request.network_enabled,
            model_call_enabled: request.model_call_enabled,
            external_write_enabled: request.external_write_enabled,
            public_route_enabled: request.public_route_enabled,
            reads,
            writes,
            egress,
            required_gates: requiredGateList,
            receipt,
            output_type: outputType,
            claim_boundary: claimBoundary,
            blocked_claims: blockedClaims,
        },
    };
}

function runGate(id) {
    const command = gateCommands[id];
    if (!command) {
        return { id, ok: false, decision: 'missing_command' };
    }
    const result = spawnSync(process.execPath, command, {
        cwd: repoRoot,
        encoding: 'utf8',
    });
    let parsed = null;
    try {
        parsed = JSON.parse(result.stdout.trim());
    } catch {
        parsed = null;
    }
    const decision = parsed?.decision || (parsed?.ok ? 'pass' : 'fail');
    return {
        id,
        ok: result.status === 0 && parsed && parsed.ok !== false,
        decision,
    };
}

function validateDryRunRequest(request) {
    const failures = [];
    if (request.mode !== 'shadow_dry_run') failures.push(`mode must be shadow_dry_run; got ${request.mode}`);
    if (request.proposed_adapter !== 'shadow_dry_run_adapter') failures.push(`proposed_adapter must be shadow_dry_run_adapter; got ${request.proposed_adapter}`);
    if (request.live_action_enabled !== false) failures.push('live_action_enabled must be false');
    if (request.network_enabled !== false) failures.push('network_enabled must be false');
    if (request.model_call_enabled !== false) failures.push('model_call_enabled must be false');
    if (request.external_write_enabled !== false) failures.push('external_write_enabled must be false');
    if (request.public_route_enabled !== false) failures.push('public_route_enabled must be false');
    if (request.egress !== 'none') failures.push(`egress must be none; got ${request.egress}`);
    if (request.output_type !== 'receipt_only') failures.push(`output_type must be receipt_only; got ${request.output_type}`);
    for (const missing of missingFrom(request.required_gates, requiredGates)) {
        failures.push(`missing required gate ${missing}`);
    }
    for (const missing of missingFrom(request.blocked_claims, requiredBlockedClaims)) {
        failures.push(`missing blocked claim ${missing}`);
    }
    if (!request.claim_boundary.some((claim) => /performs no live action/i.test(claim))) {
        failures.push('claim_boundary must state that the adapter performs no live action');
    }
    if (!request.claim_boundary.some((claim) => /does not call a model/i.test(claim))) {
        failures.push('claim_boundary must state that the adapter does not call a model');
    }
    if (!request.writes.every((writePath) => writePath === '.mirror/RUNTIME_DRY_RUNS')) {
        failures.push('writes must be limited to .mirror/RUNTIME_DRY_RUNS');
    }
    if (!request.reads.every(safeRepoPath)) failures.push('reads must stay repo-relative');
    return failures;
}

function buildReceipt(request, gateResults, args, decision) {
    const now = stamp(args);
    return {
        shadow_runtime_receipt: {
            schema_version: 'shadow_runtime_receipt.v0_1',
            id: `shadow_receipt_${now.replace(/[^0-9TZ]/g, '').toLowerCase()}_${request.id}`,
            request_id: request.id,
            created_at: isoFromStamp(now),
            decision,
            performed_live_action: false,
            checked_scope: [
                'shadow_runtime_request_shape',
                'dry_run_only_flags',
                'no_network',
                'no_model_call',
                'no_external_write',
                'no_public_route',
                'required_local_gates',
                'receipt_destination',
            ],
            gate_results: gateResults,
            blocked_live_capabilities: blockedLiveCapabilities,
            output: {
                type: 'receipt_only',
                message: decision === 'allow'
                    ? 'Shadow dry-run completed without live action.'
                    : 'Shadow dry-run blocked without live action.',
            },
        },
    };
}

function receiptFilePath(args, request) {
    if (args.out) return args.out;
    return path.join(args.outDir, `${stamp(args)}-${request.id}.json`);
}

function assertSafeOut(filePath) {
    const target = path.resolve(filePath);
    const relative = path.relative(receiptDir, target);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
        throw new Error(`receipt output must stay under ${receiptDir}`);
    }
}

function gateShadowAdapter(payload, args) {
    const { errors, request } = validateShape(payload);
    const failures = [...errors];
    let gateResults = [];
    if (!errors.length) {
        failures.push(...validateDryRunRequest(request));
        if (!failures.length) {
            gateResults = requiredGates.map(runGate);
            for (const gate of gateResults) {
                if (!gate.ok) failures.push(`${gate.id} failed with decision ${gate.decision}`);
            }
        }
    }

    const decision = failures.length ? 'block' : 'allow';
    const receipt = errors.length ? null : buildReceipt(request, gateResults, args, decision);
    let file = '';
    let wrote = false;
    if (decision === 'allow' && args.write) {
        file = receiptFilePath(args, request);
        assertSafeOut(file);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, `${JSON.stringify(receipt, null, 2)}\n`);
        wrote = true;
    } else if (decision === 'allow') {
        file = receiptFilePath(args, request);
    }

    return {
        ok: decision === 'allow',
        decision,
        wrote,
        file,
        failures,
        warnings: decision === 'allow' ? [
            'shadow adapter emitted a local receipt only',
            'no live app, gateway, model, network, or memory action was performed',
        ] : [],
        request_id: request.id || '',
        surface: request.surface || '',
        performed_live_action: false,
        gate_results: gateResults,
        receipt,
    };
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function selfTest() {
    const allowed = gateShadowAdapter(readJson(defaults.request, 'shadow runtime request'), { ...defaults, timestamp: '20260707T000000Z' });
    assert(allowed.ok, 'shadow consumer request should pass');
    assert(allowed.decision === 'allow', 'shadow consumer request should allow');
    assert(allowed.performed_live_action === false, 'shadow consumer request must not perform live action');
    assert(allowed.gate_results.length === requiredGates.length, 'shadow consumer request should run required gates');

    const blocked = gateShadowAdapter(readJson(path.join(contractDir, 'shadow_runtime_request.live_blocked.example.json'), 'blocked shadow runtime request'), { ...defaults, timestamp: '20260707T000001Z' });
    assert(!blocked.ok, 'live shadow request should block');
    assert(blocked.decision === 'block', 'live shadow request decision should be block');
    assert(blocked.failures.some((failure) => failure.includes('live_action_enabled')), 'blocked request should fail on live action');

    const missingGate = JSON.parse(JSON.stringify(readJson(defaults.request, 'shadow runtime request')));
    missingGate.shadow_runtime_request.required_gates = ['guard:runtime-integration'];
    const missing = gateShadowAdapter(missingGate, { ...defaults, timestamp: '20260707T000002Z' });
    assert(!missing.ok, 'missing required gates should block');

    return {
        ok: true,
        checks: [
            { name: 'shadow consumer request passes', decision: allowed.decision },
            { name: 'live request blocks', decision: blocked.decision },
            { name: 'missing gate blocks', decision: missing.decision },
        ],
    };
}

try {
    const args = parseArgs(process.argv.slice(2));
    const result = args.selfTest
        ? selfTest()
        : gateShadowAdapter(readJson(args.request, 'shadow runtime request'), args);
    console.log(JSON.stringify(result, null, 2));
    if (args.expect && result.decision !== args.expect) {
        console.error(`Expected ${args.expect}, got ${result.decision}`);
        process.exit(2);
    }
    process.exit(args.expect ? 0 : result.ok ? 0 : 2);
} catch (error) {
    console.error(JSON.stringify({ ok: false, decision: 'error', error: error.message }, null, 2));
    process.exit(1);
}
