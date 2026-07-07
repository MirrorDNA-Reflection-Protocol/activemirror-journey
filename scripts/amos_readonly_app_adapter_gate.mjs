#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const contractDir = path.join(repoRoot, '.mirror', 'CONTRACTS', 'amos');
const receiptDir = path.join(repoRoot, '.mirror', 'RUNTIME_DRY_RUNS');

const defaults = {
    request: path.join(contractDir, 'readonly_app_adapter.consumer.example.json'),
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
    'guard:shadow-adapter',
    'guard:front-door',
    'guard:receipt-chain',
];

const gateCommands = {
    'guard:runtime-integration': ['scripts/amos_runtime_integration_gate.mjs', '--expect', 'allow'],
    'guard:shadow-adapter': ['scripts/amos_shadow_adapter_gate.mjs', '--self-test'],
    'guard:front-door': ['scripts/front_door_guard.mjs'],
    'guard:receipt-chain': ['scripts/amos_receipt_chain_gate.mjs', '--verify'],
};

const requiredBlockedClaims = [
    'Read-only adapter is live in the public app.',
    'Read-only adapter called a model.',
    'Read-only adapter used the network.',
    'Read-only adapter wrote memory.',
    'Read-only adapter changed app routes.',
    'Read-only adapter changed gateway behavior.',
    'Read-only adapter deployed public assets.',
];

const blockedCapabilities = [
    'model_call',
    'network',
    'memory_write',
    'route_change',
    'gateway_change',
    'public_deploy',
    'live_runtime_action',
];

const allowedSourcePrefixes = [
    'src/',
    'index.html',
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

function allowedSourcePath(relativePath) {
    return safeRepoPath(relativePath)
        && allowedSourcePrefixes.some((prefix) => relativePath === prefix || relativePath.startsWith(prefix));
}

function validateShape(payload) {
    const errors = [];
    const request = payload.readonly_app_adapter_request;
    if (!request || typeof request !== 'object' || Array.isArray(request)) {
        return { errors: ['readonly_app_adapter_request must be an object'], request: {} };
    }
    if (request.schema_version !== 'readonly_app_adapter_request.v0_1') errors.push('readonly_app_adapter_request.schema_version must be readonly_app_adapter_request.v0_1');
    const id = requireString(request, 'id', 'readonly_app_adapter_request', errors);
    if (id && !/^[a-z0-9][a-z0-9_-]{2,80}$/.test(id)) errors.push('readonly_app_adapter_request.id must be a lowercase slug');
    const surface = requireString(request, 'surface', 'readonly_app_adapter_request', errors);
    const mode = requireString(request, 'mode', 'readonly_app_adapter_request', errors);
    const adapter = requireString(request, 'adapter', 'readonly_app_adapter_request', errors);
    const route = requireString(request, 'route', 'readonly_app_adapter_request', errors);
    const intent = requireString(request, 'intent', 'readonly_app_adapter_request', errors);
    const sourceFiles = requireStringArray(request, 'source_files', 'readonly_app_adapter_request', errors);
    const requestEnvelope = requireString(request, 'request_envelope', 'readonly_app_adapter_request', errors);
    const writeDestination = requireString(request, 'write_destination', 'readonly_app_adapter_request', errors);
    const requiredGateList = requireStringArray(request, 'required_gates', 'readonly_app_adapter_request', errors);
    const outputType = requireString(request, 'output_type', 'readonly_app_adapter_request', errors);
    const claimBoundary = requireStringArray(request, 'claim_boundary', 'readonly_app_adapter_request', errors);
    const blockedClaims = requireStringArray(request, 'blocked_claims', 'readonly_app_adapter_request', errors);

    for (const key of ['model_call_enabled', 'network_enabled', 'memory_write_enabled', 'route_change_enabled', 'gateway_change_enabled', 'public_deploy_enabled']) {
        if (typeof request[key] !== 'boolean') errors.push(`readonly_app_adapter_request.${key} must be boolean`);
    }

    return {
        errors,
        request: {
            id,
            surface,
            mode,
            adapter,
            route,
            intent,
            source_files: sourceFiles,
            request_envelope: requestEnvelope,
            write_destination: writeDestination,
            model_call_enabled: request.model_call_enabled,
            network_enabled: request.network_enabled,
            memory_write_enabled: request.memory_write_enabled,
            route_change_enabled: request.route_change_enabled,
            gateway_change_enabled: request.gateway_change_enabled,
            public_deploy_enabled: request.public_deploy_enabled,
            required_gates: requiredGateList,
            output_type: outputType,
            claim_boundary: claimBoundary,
            blocked_claims: blockedClaims,
        },
    };
}

function runGate(id) {
    const command = gateCommands[id];
    if (!command) return { id, ok: false, decision: 'missing_command' };
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
    const ok = result.status === 0 && (parsed ? parsed.ok !== false : result.stdout.includes('PASSED'));
    const decision = parsed?.decision || (ok ? 'pass' : 'fail');
    return { id, ok, decision };
}

function validateReadOnlyRequest(request) {
    const failures = [];
    if (request.surface !== 'consumer_app') failures.push(`surface must be consumer_app; got ${request.surface}`);
    if (request.mode !== 'read_only_proposal') failures.push(`mode must be read_only_proposal; got ${request.mode}`);
    if (request.adapter !== 'readonly_app_adapter') failures.push(`adapter must be readonly_app_adapter; got ${request.adapter}`);
    if (request.route !== '/app/') failures.push(`route must be /app/; got ${request.route}`);
    if (request.write_destination !== '.mirror/RUNTIME_DRY_RUNS') failures.push('write_destination must be .mirror/RUNTIME_DRY_RUNS');
    if (request.model_call_enabled !== false) failures.push('model_call_enabled must be false');
    if (request.network_enabled !== false) failures.push('network_enabled must be false');
    if (request.memory_write_enabled !== false) failures.push('memory_write_enabled must be false');
    if (request.route_change_enabled !== false) failures.push('route_change_enabled must be false');
    if (request.gateway_change_enabled !== false) failures.push('gateway_change_enabled must be false');
    if (request.public_deploy_enabled !== false) failures.push('public_deploy_enabled must be false');
    if (request.output_type !== 'source_hash_receipt') failures.push(`output_type must be source_hash_receipt; got ${request.output_type}`);
    for (const missing of missingFrom(request.required_gates, requiredGates)) failures.push(`missing required gate ${missing}`);
    for (const missing of missingFrom(request.blocked_claims, requiredBlockedClaims)) failures.push(`missing blocked claim ${missing}`);
    if (!request.claim_boundary.some((claim) => /read-only local proposal/i.test(claim))) failures.push('claim_boundary must state this is a read-only local proposal');
    if (!request.claim_boundary.some((claim) => /does not call a model/i.test(claim))) failures.push('claim_boundary must state this does not call a model');
    if (!request.claim_boundary.some((claim) => /does not use the network/i.test(claim))) failures.push('claim_boundary must state this does not use the network');
    if (!safeRepoPath(request.request_envelope)) failures.push('request_envelope must stay repo-relative');
    if (!request.source_files.every(allowedSourcePath)) failures.push('source_files must stay under allowed source paths');
    return failures;
}

function hashSourceFile(relativePath) {
    const filePath = path.resolve(repoRoot, relativePath);
    const data = fs.readFileSync(filePath);
    return {
        path: relativePath,
        sha256: crypto.createHash('sha256').update(data).digest('hex'),
        bytes: data.length,
    };
}

function collectSourceEvidence(request) {
    const evidence = [];
    for (const relativePath of request.source_files) {
        const filePath = path.resolve(repoRoot, relativePath);
        if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
            throw new Error(`source file missing: ${relativePath}`);
        }
        evidence.push(hashSourceFile(relativePath));
    }
    if (!fs.existsSync(path.resolve(repoRoot, request.request_envelope))) {
        throw new Error(`request envelope missing: ${request.request_envelope}`);
    }
    evidence.push(hashSourceFile(request.request_envelope));
    return evidence;
}

function buildReceipt(request, gateResults, sourceEvidence, args, decision) {
    const now = stamp(args);
    return {
        readonly_app_adapter_receipt: {
            schema_version: 'readonly_app_adapter_receipt.v0_1',
            id: `readonly_receipt_${now.replace(/[^0-9TZ]/g, '').toLowerCase()}_${request.id}`,
            request_id: request.id,
            created_at: isoFromStamp(now),
            decision,
            performed_live_action: false,
            checked_scope: [
                'readonly_app_adapter_request_shape',
                'source_file_hashes',
                'request_envelope_hash',
                'no_model_call',
                'no_network',
                'no_memory_write',
                'no_route_change',
                'no_gateway_change',
                'no_public_deploy',
                'required_local_gates',
            ],
            gate_results: gateResults,
            source_evidence: sourceEvidence,
            blocked_capabilities: blockedCapabilities,
            output: {
                type: 'source_hash_receipt',
                message: decision === 'allow'
                    ? 'Read-only app adapter proposal emitted source hashes without live action.'
                    : 'Read-only app adapter proposal blocked without live action.',
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

function gateReadOnlyAdapter(payload, args) {
    const { errors, request } = validateShape(payload);
    const failures = [...errors];
    let gateResults = [];
    let sourceEvidence = [];
    if (!errors.length) {
        failures.push(...validateReadOnlyRequest(request));
        if (!failures.length) {
            try {
                sourceEvidence = collectSourceEvidence(request);
            } catch (error) {
                failures.push(error.message);
            }
        }
        if (!failures.length) {
            gateResults = requiredGates.map(runGate);
            for (const gate of gateResults) {
                if (!gate.ok) failures.push(`${gate.id} failed with decision ${gate.decision}`);
            }
        }
    }

    const decision = failures.length ? 'block' : 'allow';
    const receipt = errors.length ? null : buildReceipt(request, gateResults, sourceEvidence, args, decision);
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
            'read-only adapter emitted source hashes only',
            'no live app, gateway, model, network, route, deploy, or memory action was performed',
        ] : [],
        request_id: request.id || '',
        surface: request.surface || '',
        performed_live_action: false,
        gate_results: gateResults,
        source_evidence_count: sourceEvidence.length,
        receipt,
    };
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function selfTest() {
    const allowed = gateReadOnlyAdapter(readJson(defaults.request, 'read-only app adapter request'), { ...defaults, timestamp: '20260707T000100Z' });
    assert(allowed.ok, 'read-only app adapter request should pass');
    assert(allowed.decision === 'allow', 'read-only app adapter request should allow');
    assert(allowed.performed_live_action === false, 'read-only app adapter must not perform live action');
    assert(allowed.source_evidence_count >= 2, 'read-only app adapter should collect source evidence');

    const blocked = gateReadOnlyAdapter(readJson(path.join(contractDir, 'readonly_app_adapter.live_blocked.example.json'), 'blocked read-only app adapter request'), { ...defaults, timestamp: '20260707T000101Z' });
    assert(!blocked.ok, 'live read-only adapter request should block');
    assert(blocked.decision === 'block', 'live read-only adapter request decision should be block');
    assert(blocked.failures.some((failure) => failure.includes('model_call_enabled')), 'blocked request should fail on model calls');

    const unsafeSource = JSON.parse(JSON.stringify(readJson(defaults.request, 'read-only app adapter request')));
    unsafeSource.readonly_app_adapter_request.source_files.push('../active-mirror-site/index.html');
    const unsafe = gateReadOnlyAdapter(unsafeSource, { ...defaults, timestamp: '20260707T000102Z' });
    assert(!unsafe.ok, 'unsafe source path should block');

    return {
        ok: true,
        checks: [
            { name: 'read-only app adapter request passes', decision: allowed.decision },
            { name: 'live request blocks', decision: blocked.decision },
            { name: 'unsafe source path blocks', decision: unsafe.decision },
        ],
    };
}

try {
    const args = parseArgs(process.argv.slice(2));
    const result = args.selfTest
        ? selfTest()
        : gateReadOnlyAdapter(readJson(args.request, 'read-only app adapter request'), args);
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
