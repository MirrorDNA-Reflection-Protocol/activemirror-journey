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
    request: path.join(contractDir, 'browser_runtime_adapter.consumer.example.json'),
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
    'guard:readonly-app-adapter',
    'guard:front-door',
    'guard:receipt-chain',
];

const gateCommands = {
    'guard:runtime-integration': ['scripts/amos_runtime_integration_gate.mjs', '--expect', 'allow'],
    'guard:shadow-adapter': ['scripts/amos_shadow_adapter_gate.mjs', '--self-test'],
    'guard:readonly-app-adapter': ['scripts/amos_readonly_app_adapter_gate.mjs', '--self-test'],
    'guard:front-door': ['scripts/front_door_guard.mjs'],
    'guard:receipt-chain': ['scripts/amos_receipt_chain_gate.mjs', '--verify'],
};

const requiredBlockedClaims = [
    'Browser runtime adapter is live in the public app.',
    'Browser runtime adapter called a model.',
    'Browser runtime adapter used the network.',
    'Browser runtime adapter wrote durable memory.',
    'Browser runtime adapter changed app routes.',
    'Browser runtime adapter changed gateway behavior.',
    'Browser runtime adapter deployed public assets.',
];

const blockedCapabilities = [
    'model_call',
    'network',
    'durable_memory_write',
    'route_change',
    'gateway_change',
    'public_deploy',
    'live_runtime_action',
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

function validateRuntimeRequest(value, errors) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        errors.push('browser_runtime_adapter_request.runtime_request must be an object');
        return {};
    }
    const turnId = requireString(value, 'turn_id', 'browser_runtime_adapter_request.runtime_request', errors);
    if (turnId && !/^[a-z0-9][a-z0-9_-]{2,80}$/.test(turnId)) {
        errors.push('browser_runtime_adapter_request.runtime_request.turn_id must be a lowercase slug');
    }
    const input = requireString(value, 'input', 'browser_runtime_adapter_request.runtime_request', errors);
    if (input.length > 1000) errors.push('browser_runtime_adapter_request.runtime_request.input must be 1000 chars or less');
    const boundary = requireString(value, 'boundary', 'browser_runtime_adapter_request.runtime_request', errors);
    if (boundary && !['private_first', 'use_placeholders', 'source_sensitive'].includes(boundary)) {
        errors.push('browser_runtime_adapter_request.runtime_request.boundary is invalid');
    }
    const requestedOutput = requireString(value, 'requested_output', 'browser_runtime_adapter_request.runtime_request', errors);
    if (requestedOutput && !['next_move', 'draft', 'plan', 'question'].includes(requestedOutput)) {
        errors.push('browser_runtime_adapter_request.runtime_request.requested_output is invalid');
    }
    const allowedActions = requireStringArray(value, 'allowed_actions', 'browser_runtime_adapter_request.runtime_request', errors);
    for (const action of allowedActions) {
        if (!['local_response_projection', 'local_receipt'].includes(action)) {
            errors.push(`browser_runtime_adapter_request.runtime_request.allowed_actions contains unsupported action ${action}`);
        }
    }
    return {
        turn_id: turnId,
        input,
        boundary,
        requested_output: requestedOutput,
        allowed_actions: allowedActions,
    };
}

function validateShape(payload) {
    const errors = [];
    const request = payload.browser_runtime_adapter_request;
    if (!request || typeof request !== 'object' || Array.isArray(request)) {
        return { errors: ['browser_runtime_adapter_request must be an object'], request: {} };
    }
    if (request.schema_version !== 'browser_runtime_adapter_request.v0_1') errors.push('browser_runtime_adapter_request.schema_version must be browser_runtime_adapter_request.v0_1');
    const id = requireString(request, 'id', 'browser_runtime_adapter_request', errors);
    if (id && !/^[a-z0-9][a-z0-9_-]{2,80}$/.test(id)) errors.push('browser_runtime_adapter_request.id must be a lowercase slug');
    const surface = requireString(request, 'surface', 'browser_runtime_adapter_request', errors);
    const mode = requireString(request, 'mode', 'browser_runtime_adapter_request', errors);
    const adapter = requireString(request, 'adapter', 'browser_runtime_adapter_request', errors);
    const route = requireString(request, 'route', 'browser_runtime_adapter_request', errors);
    const runtimeRequest = validateRuntimeRequest(request.runtime_request, errors);
    const writeDestination = requireString(request, 'write_destination', 'browser_runtime_adapter_request', errors);
    const requiredGateList = requireStringArray(request, 'required_gates', 'browser_runtime_adapter_request', errors);
    const outputType = requireString(request, 'output_type', 'browser_runtime_adapter_request', errors);
    const claimBoundary = requireStringArray(request, 'claim_boundary', 'browser_runtime_adapter_request', errors);
    const blockedClaims = requireStringArray(request, 'blocked_claims', 'browser_runtime_adapter_request', errors);

    for (const key of ['model_call_enabled', 'network_enabled', 'durable_memory_write_enabled', 'route_change_enabled', 'gateway_change_enabled', 'public_deploy_enabled']) {
        if (typeof request[key] !== 'boolean') errors.push(`browser_runtime_adapter_request.${key} must be boolean`);
    }

    return {
        errors,
        request: {
            id,
            surface,
            mode,
            adapter,
            route,
            runtime_request: runtimeRequest,
            write_destination: writeDestination,
            model_call_enabled: request.model_call_enabled,
            network_enabled: request.network_enabled,
            durable_memory_write_enabled: request.durable_memory_write_enabled,
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

function validateBrowserRuntimeRequest(request) {
    const failures = [];
    if (request.surface !== 'consumer_app') failures.push(`surface must be consumer_app; got ${request.surface}`);
    if (request.mode !== 'browser_local_proposal') failures.push(`mode must be browser_local_proposal; got ${request.mode}`);
    if (request.adapter !== 'browser_local_runtime_adapter') failures.push(`adapter must be browser_local_runtime_adapter; got ${request.adapter}`);
    if (request.route !== '/app/') failures.push(`route must be /app/; got ${request.route}`);
    if (request.write_destination !== '.mirror/RUNTIME_DRY_RUNS') failures.push('write_destination must be .mirror/RUNTIME_DRY_RUNS');
    if (request.model_call_enabled !== false) failures.push('model_call_enabled must be false');
    if (request.network_enabled !== false) failures.push('network_enabled must be false');
    if (request.durable_memory_write_enabled !== false) failures.push('durable_memory_write_enabled must be false');
    if (request.route_change_enabled !== false) failures.push('route_change_enabled must be false');
    if (request.gateway_change_enabled !== false) failures.push('gateway_change_enabled must be false');
    if (request.public_deploy_enabled !== false) failures.push('public_deploy_enabled must be false');
    if (request.output_type !== 'runtime_projection_receipt') failures.push(`output_type must be runtime_projection_receipt; got ${request.output_type}`);
    if (!request.runtime_request.allowed_actions.includes('local_response_projection')) failures.push('runtime_request.allowed_actions must include local_response_projection');
    for (const missing of missingFrom(request.required_gates, requiredGates)) failures.push(`missing required gate ${missing}`);
    for (const missing of missingFrom(request.blocked_claims, requiredBlockedClaims)) failures.push(`missing blocked claim ${missing}`);
    if (!request.claim_boundary.some((claim) => /browser-local proposal/i.test(claim))) failures.push('claim_boundary must state this is a browser-local proposal');
    if (!request.claim_boundary.some((claim) => /in-memory request object/i.test(claim))) failures.push('claim_boundary must state this processes an in-memory request object only');
    if (!request.claim_boundary.some((claim) => /does not call a model/i.test(claim))) failures.push('claim_boundary must state this does not call a model');
    if (!request.claim_boundary.some((claim) => /does not use the network/i.test(claim))) failures.push('claim_boundary must state this does not use the network');
    return failures;
}

function inputHash(input) {
    return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

function projectRuntimeRequest(runtimeRequest) {
    const resultMap = {
        next_move: 'project_next_move',
        draft: 'project_draft',
        plan: 'project_plan',
        question: 'project_question',
    };
    return {
        turn_id: runtimeRequest.turn_id,
        input_hash: inputHash(runtimeRequest.input),
        boundary: runtimeRequest.boundary,
        requested_output: runtimeRequest.requested_output,
        allowed_actions: runtimeRequest.allowed_actions,
        result: resultMap[runtimeRequest.requested_output] || 'project_response',
    };
}

function buildReceipt(request, gateResults, args, decision) {
    const now = stamp(args);
    return {
        browser_runtime_adapter_receipt: {
            schema_version: 'browser_runtime_adapter_receipt.v0_1',
            id: `browser_receipt_${now.replace(/[^0-9TZ]/g, '').toLowerCase()}_${request.id}`,
            request_id: request.id,
            created_at: isoFromStamp(now),
            decision,
            performed_live_action: false,
            checked_scope: [
                'browser_runtime_adapter_request_shape',
                'in_memory_request_projection',
                'input_hash_only',
                'no_model_call',
                'no_network',
                'no_durable_memory_write',
                'no_route_change',
                'no_gateway_change',
                'no_public_deploy',
                'required_local_gates',
            ],
            gate_results: gateResults,
            runtime_projection: projectRuntimeRequest(request.runtime_request),
            blocked_capabilities: blockedCapabilities,
            output: {
                type: 'runtime_projection_receipt',
                message: decision === 'allow'
                    ? 'Browser-local runtime proposal projected the request without live action.'
                    : 'Browser-local runtime proposal blocked without live action.',
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

function gateBrowserRuntimeAdapter(payload, args) {
    const { errors, request } = validateShape(payload);
    const failures = [...errors];
    let gateResults = [];
    if (!errors.length) {
        failures.push(...validateBrowserRuntimeRequest(request));
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
            'browser-local runtime adapter emitted an in-memory projection receipt only',
            'no live app, gateway, model, network, route, deploy, or durable memory action was performed',
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
    const allowed = gateBrowserRuntimeAdapter(readJson(defaults.request, 'browser runtime adapter request'), { ...defaults, timestamp: '20260707T000200Z' });
    assert(allowed.ok, 'browser runtime adapter request should pass');
    assert(allowed.decision === 'allow', 'browser runtime adapter request should allow');
    assert(allowed.performed_live_action === false, 'browser runtime adapter must not perform live action');
    assert(allowed.receipt.browser_runtime_adapter_receipt.runtime_projection.input_hash.length === 64, 'browser runtime adapter should hash input');

    const blocked = gateBrowserRuntimeAdapter(readJson(path.join(contractDir, 'browser_runtime_adapter.live_blocked.example.json'), 'blocked browser runtime adapter request'), { ...defaults, timestamp: '20260707T000201Z' });
    assert(!blocked.ok, 'live browser runtime adapter request should block');
    assert(blocked.decision === 'block', 'live browser runtime adapter request decision should be block');
    assert(blocked.failures.some((failure) => failure.includes('model_call_enabled')), 'blocked request should fail on model calls');

    const missingLocalProjection = JSON.parse(JSON.stringify(readJson(defaults.request, 'browser runtime adapter request')));
    missingLocalProjection.browser_runtime_adapter_request.runtime_request.allowed_actions = ['local_receipt'];
    const missing = gateBrowserRuntimeAdapter(missingLocalProjection, { ...defaults, timestamp: '20260707T000202Z' });
    assert(!missing.ok, 'missing local projection should block');

    return {
        ok: true,
        checks: [
            { name: 'browser runtime adapter request passes', decision: allowed.decision },
            { name: 'live request blocks', decision: blocked.decision },
            { name: 'missing local projection blocks', decision: missing.decision },
        ],
    };
}

try {
    const args = parseArgs(process.argv.slice(2));
    const result = args.selfTest
        ? selfTest()
        : gateBrowserRuntimeAdapter(readJson(args.request, 'browser runtime adapter request'), args);
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
