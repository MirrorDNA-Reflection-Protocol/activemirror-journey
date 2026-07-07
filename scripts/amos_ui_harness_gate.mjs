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
    request: path.join(contractDir, 'ui_harness.consumer.example.json'),
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
    'guard:browser-runtime-adapter',
    'guard:front-door',
    'guard:receipt-chain',
];

const gateCommands = {
    'guard:runtime-integration': ['scripts/amos_runtime_integration_gate.mjs', '--expect', 'allow'],
    'guard:shadow-adapter': ['scripts/amos_shadow_adapter_gate.mjs', '--self-test'],
    'guard:readonly-app-adapter': ['scripts/amos_readonly_app_adapter_gate.mjs', '--self-test'],
    'guard:browser-runtime-adapter': ['scripts/amos_browser_runtime_adapter_gate.mjs', '--self-test'],
    'guard:front-door': ['scripts/front_door_guard.mjs'],
    'guard:receipt-chain': ['scripts/amos_receipt_chain_gate.mjs', '--verify'],
};

const requiredBlockedClaims = [
    'UI harness is live in the public app.',
    'UI harness called a model.',
    'UI harness used the network.',
    'UI harness wrote durable memory.',
    'UI harness changed app routes.',
    'UI harness changed gateway behavior.',
    'UI harness deployed public assets.',
    'UI harness executed arbitrary generated UI.',
];

const requiredBlockedActions = [
    'call_model',
    'fetch_network',
    'write_durable_memory',
    'change_route',
    'change_gateway',
    'deploy_public_asset',
    'execute_arbitrary_ui',
];

const blockedCapabilities = [
    'model_call',
    'network',
    'durable_memory_write',
    'route_change',
    'gateway_change',
    'public_deploy',
    'live_runtime_action',
    'arbitrary_generated_ui',
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

function validateUiIntent(value, errors) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        errors.push('ui_harness_request.ui_intent must be an object');
        return {};
    }
    const entryQuestion = requireString(value, 'entry_question', 'ui_harness_request.ui_intent', errors);
    if (entryQuestion.length > 80) errors.push('ui_harness_request.ui_intent.entry_question must be 80 chars or less');
    const primaryAction = requireString(value, 'primary_action', 'ui_harness_request.ui_intent', errors);
    if (primaryAction && primaryAction !== 'local_chat_turn') errors.push('ui_harness_request.ui_intent.primary_action must be local_chat_turn');
    const responseSurface = requireString(value, 'response_surface', 'ui_harness_request.ui_intent', errors);
    if (responseSurface && !['inline_answer', 'small_canvas'].includes(responseSurface)) errors.push('ui_harness_request.ui_intent.response_surface is invalid');
    const secondarySurface = requireString(value, 'secondary_surface', 'ui_harness_request.ui_intent', errors);
    if (secondarySurface && !['none', 'receipt_status'].includes(secondarySurface)) errors.push('ui_harness_request.ui_intent.secondary_surface is invalid');
    const copyMode = requireString(value, 'copy_mode', 'ui_harness_request.ui_intent', errors);
    if (copyMode && copyMode !== 'plain_user_language') errors.push('ui_harness_request.ui_intent.copy_mode must be plain_user_language');
    return {
        entry_question: entryQuestion,
        primary_action: primaryAction,
        response_surface: responseSurface,
        secondary_surface: secondarySurface,
        copy_mode: copyMode,
    };
}

function validateShape(payload) {
    const errors = [];
    const request = payload.ui_harness_request;
    if (!request || typeof request !== 'object' || Array.isArray(request)) {
        return { errors: ['ui_harness_request must be an object'], request: {} };
    }
    if (request.schema_version !== 'ui_harness_request.v0_1') errors.push('ui_harness_request.schema_version must be ui_harness_request.v0_1');
    const id = requireString(request, 'id', 'ui_harness_request', errors);
    if (id && !/^[a-z0-9][a-z0-9_-]{2,80}$/.test(id)) errors.push('ui_harness_request.id must be a lowercase slug');
    const surface = requireString(request, 'surface', 'ui_harness_request', errors);
    const mode = requireString(request, 'mode', 'ui_harness_request', errors);
    const harness = requireString(request, 'harness', 'ui_harness_request', errors);
    const route = requireString(request, 'route', 'ui_harness_request', errors);
    const runtimeAdapterRequest = requireString(request, 'runtime_adapter_request', 'ui_harness_request', errors);
    const uiIntent = validateUiIntent(request.ui_intent, errors);
    const allowedUiActions = requireStringArray(request, 'allowed_ui_actions', 'ui_harness_request', errors);
    const blockedUiActions = requireStringArray(request, 'blocked_ui_actions', 'ui_harness_request', errors);
    const requiredGateList = requireStringArray(request, 'required_gates', 'ui_harness_request', errors);
    const outputType = requireString(request, 'output_type', 'ui_harness_request', errors);
    const claimBoundary = requireStringArray(request, 'claim_boundary', 'ui_harness_request', errors);
    const blockedClaims = requireStringArray(request, 'blocked_claims', 'ui_harness_request', errors);

    for (const key of ['model_call_enabled', 'network_enabled', 'durable_memory_write_enabled', 'route_change_enabled', 'gateway_change_enabled', 'public_deploy_enabled']) {
        if (typeof request[key] !== 'boolean') errors.push(`ui_harness_request.${key} must be boolean`);
    }

    return {
        errors,
        request: {
            id,
            surface,
            mode,
            harness,
            route,
            runtime_adapter_request: runtimeAdapterRequest,
            ui_intent: uiIntent,
            allowed_ui_actions: allowedUiActions,
            blocked_ui_actions: blockedUiActions,
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

function safeContractPath(value) {
    const target = path.resolve(repoRoot, value);
    const relative = path.relative(contractDir, target);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
        throw new Error(`runtime_adapter_request must stay under ${contractDir}`);
    }
    if (!relative.endsWith('.json')) throw new Error('runtime_adapter_request must point to a JSON contract');
    return target;
}

function runCommand(command) {
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
    return { result, parsed, ok };
}

function runGate(id) {
    const command = gateCommands[id];
    if (!command) return { id, ok: false, decision: 'missing_command' };
    const { parsed, ok } = runCommand(command);
    const decision = parsed?.decision || (ok ? 'pass' : 'fail');
    return { id, ok, decision };
}

function runRuntimeAdapter(requestPath) {
    const { parsed, ok, result } = runCommand(['scripts/amos_browser_runtime_adapter_gate.mjs', '--request', requestPath, '--expect', 'allow']);
    if (!ok || !parsed) {
        return {
            ok: false,
            decision: parsed?.decision || 'fail',
            request_id: parsed?.request_id || '',
            input_hash: '',
            result: 'runtime_adapter_failed',
            error: result.stderr.trim().slice(0, 500),
        };
    }
    const projection = parsed.receipt?.browser_runtime_adapter_receipt?.runtime_projection || {};
    return {
        ok: true,
        decision: parsed.decision || 'allow',
        request_id: parsed.request_id || '',
        input_hash: projection.input_hash || '',
        result: projection.result || 'project_response',
    };
}

function validateUiHarnessRequest(request) {
    const failures = [];
    if (request.surface !== 'consumer_app') failures.push(`surface must be consumer_app; got ${request.surface}`);
    if (request.mode !== 'local_ui_harness_proposal') failures.push(`mode must be local_ui_harness_proposal; got ${request.mode}`);
    if (request.harness !== 'chat_first_local_ui_harness') failures.push(`harness must be chat_first_local_ui_harness; got ${request.harness}`);
    if (request.route !== '/app/') failures.push(`route must be /app/; got ${request.route}`);
    if (request.model_call_enabled !== false) failures.push('model_call_enabled must be false');
    if (request.network_enabled !== false) failures.push('network_enabled must be false');
    if (request.durable_memory_write_enabled !== false) failures.push('durable_memory_write_enabled must be false');
    if (request.route_change_enabled !== false) failures.push('route_change_enabled must be false');
    if (request.gateway_change_enabled !== false) failures.push('gateway_change_enabled must be false');
    if (request.public_deploy_enabled !== false) failures.push('public_deploy_enabled must be false');
    if (request.output_type !== 'ui_harness_projection_receipt') failures.push(`output_type must be ui_harness_projection_receipt; got ${request.output_type}`);
    if (!request.allowed_ui_actions.includes('render_local_projection')) failures.push('allowed_ui_actions must include render_local_projection');
    for (const missing of missingFrom(request.blocked_ui_actions, requiredBlockedActions)) failures.push(`missing blocked UI action ${missing}`);
    for (const missing of missingFrom(request.required_gates, requiredGates)) failures.push(`missing required gate ${missing}`);
    for (const missing of missingFrom(request.blocked_claims, requiredBlockedClaims)) failures.push(`missing blocked claim ${missing}`);
    if (!request.claim_boundary.some((claim) => /local-only UI harness proposal/i.test(claim))) failures.push('claim_boundary must state this is a local-only UI harness proposal');
    if (!request.claim_boundary.some((claim) => /browser-local runtime adapter/i.test(claim))) failures.push('claim_boundary must state this calls the browser-local runtime adapter in dry-run mode only');
    if (!request.claim_boundary.some((claim) => /does not call a model/i.test(claim))) failures.push('claim_boundary must state this does not call a model');
    if (!request.claim_boundary.some((claim) => /does not use the network/i.test(claim))) failures.push('claim_boundary must state this does not use the network');
    return failures;
}

function buildUiProjection(request, runtimeResult) {
    return {
        route: request.route,
        surface: request.surface,
        entry_question: request.ui_intent.entry_question,
        primary_action: request.ui_intent.primary_action,
        response_surface: request.ui_intent.response_surface,
        secondary_surface: request.ui_intent.secondary_surface,
        copy_mode: request.ui_intent.copy_mode,
        safe_status_label: 'Local projection only',
        runtime_result: runtimeResult.result,
    };
}

function buildReceipt(request, gateResults, runtimeResult, args, decision) {
    const now = stamp(args);
    return {
        ui_harness_receipt: {
            schema_version: 'ui_harness_receipt.v0_1',
            id: `ui_harness_receipt_${now.replace(/[^0-9TZ]/g, '').toLowerCase()}_${request.id}`,
            request_id: request.id,
            created_at: isoFromStamp(now),
            decision,
            performed_live_action: false,
            checked_scope: [
                'ui_harness_request_shape',
                'browser_runtime_adapter_invocation',
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
            runtime_adapter_result: runtimeResult,
            ui_projection: buildUiProjection(request, runtimeResult),
            blocked_capabilities: blockedCapabilities,
            output: {
                type: 'ui_harness_projection_receipt',
                message: decision === 'allow'
                    ? 'Local UI harness projected the turn through the browser runtime adapter without live action.'
                    : 'Local UI harness blocked without live action.',
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

function gateUiHarness(payload, args) {
    const { errors, request } = validateShape(payload);
    const failures = [...errors];
    let gateResults = [];
    let runtimeResult = {
        ok: false,
        decision: 'not_run',
        request_id: '',
        input_hash: '0'.repeat(64),
        result: 'not_run',
    };

    if (!errors.length) {
        failures.push(...validateUiHarnessRequest(request));
        if (!failures.length) {
            let runtimeRequestPath = '';
            try {
                runtimeRequestPath = safeContractPath(request.runtime_adapter_request);
            } catch (error) {
                failures.push(error.message);
            }
            if (!failures.length) {
                runtimeResult = runRuntimeAdapter(runtimeRequestPath);
                if (!runtimeResult.ok) failures.push(`browser runtime adapter failed with decision ${runtimeResult.decision}`);
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
    const receipt = errors.length ? null : buildReceipt(request, gateResults, runtimeResult, args, decision);
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
            'local UI harness emitted a projection receipt only',
            'no live app, gateway, model, network, route, deploy, or durable memory action was performed',
        ] : [],
        request_id: request.id || '',
        surface: request.surface || '',
        performed_live_action: false,
        runtime_adapter_result: runtimeResult,
        gate_results: gateResults,
        receipt,
    };
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function selfTest() {
    const allowed = gateUiHarness(readJson(defaults.request, 'ui harness request'), { ...defaults, timestamp: '20260707T000300Z' });
    assert(allowed.ok, 'UI harness request should pass');
    assert(allowed.decision === 'allow', 'UI harness request should allow');
    assert(allowed.performed_live_action === false, 'UI harness must not perform live action');
    assert(allowed.runtime_adapter_result.input_hash.length === 64, 'UI harness should carry runtime input hash');
    assert(allowed.receipt.ui_harness_receipt.ui_projection.entry_question === 'What do you want?', 'UI harness should preserve entry question');

    const blocked = gateUiHarness(readJson(path.join(contractDir, 'ui_harness.live_blocked.example.json'), 'blocked ui harness request'), { ...defaults, timestamp: '20260707T000301Z' });
    assert(!blocked.ok, 'live UI harness request should block');
    assert(blocked.decision === 'block', 'live UI harness request decision should be block');
    assert(blocked.failures.some((failure) => failure.includes('model_call_enabled')), 'blocked request should fail on model calls');

    const unsafeRuntimePath = JSON.parse(JSON.stringify(readJson(defaults.request, 'ui harness request')));
    unsafeRuntimePath.ui_harness_request.runtime_adapter_request = '../outside.json';
    const unsafe = gateUiHarness(unsafeRuntimePath, { ...defaults, timestamp: '20260707T000302Z' });
    assert(!unsafe.ok, 'unsafe runtime adapter path should block');

    return {
        ok: true,
        checks: [
            { name: 'UI harness request passes', decision: allowed.decision },
            { name: 'live UI harness request blocks', decision: blocked.decision },
            { name: 'unsafe runtime adapter path blocks', decision: unsafe.decision },
        ],
    };
}

try {
    const args = parseArgs(process.argv.slice(2));
    const result = args.selfTest
        ? selfTest()
        : gateUiHarness(readJson(args.request, 'ui harness request'), args);
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
