#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const contractDir = path.join(repoRoot, '.mirror', 'CONTRACTS', 'amos');

const defaults = {
    manifest: path.join(contractDir, 'runtime_integration.contract_only.example.json'),
    expect: '',
    selfTest: false,
};

const requiredLocalGates = [
    'guard:amos-contracts',
    'guard:memory-proposal',
    'guard:approval-request',
    'guard:artifact-export',
    'guard:audit-log',
    'guard:receipt-chain',
    'amos:status',
];

const requiredBlockedClaims = [
    'AMOS runtime enforcement is live.',
    'The public app consumes AMOS contracts.',
    'The gateway consumes AMOS contracts.',
    'Receipt chains are signed or externally timestamped.',
    'Local gates are enterprise audit proof.',
];

function parseArgs(argv) {
    const args = { ...defaults };
    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];
        if (arg === '--self-test') {
            args.selfTest = true;
        } else if (arg.startsWith('--') && argv[index + 1]) {
            const key = arg.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
            if (!Object.hasOwn(args, key)) throw new Error(`Unknown argument: ${arg}`);
            args[key] = key === 'expect'
                ? argv[index + 1]
                : path.isAbsolute(argv[index + 1])
                    ? argv[index + 1]
                    : path.resolve(process.cwd(), argv[index + 1]);
            index += 1;
        } else {
            throw new Error(`Unknown argument: ${arg}`);
        }
    }
    return args;
}

function readJson(filePath, label) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        throw new Error(`${label}: cannot read JSON at ${filePath}: ${error.message}`);
    }
}

function requireString(value, label, errors) {
    if (typeof value !== 'string' || !value.trim()) errors.push(`${label} must be a non-empty string`);
}

function requireStringArray(value, label, errors) {
    if (!Array.isArray(value) || !value.length || value.some((item) => typeof item !== 'string' || !item.trim())) {
        errors.push(`${label} must be a non-empty array of strings`);
    }
}

function missingFrom(values, required) {
    const set = new Set(values);
    return required.filter((item) => !set.has(item));
}

function fileExists(relativePath) {
    if (typeof relativePath !== 'string' || !relativePath.trim()) return false;
    if (path.isAbsolute(relativePath)) return false;
    const target = path.resolve(repoRoot, path.normalize(relativePath));
    const relative = path.relative(repoRoot, target);
    if (relative.startsWith('..') || path.isAbsolute(relative)) return false;
    return fs.existsSync(target);
}

function validateShape(payload) {
    const errors = [];
    const manifest = payload.runtime_integration;
    if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
        return { errors: ['runtime_integration must be an object'], manifest: {} };
    }
    if (manifest.schema_version !== 'runtime_integration.v0_1') errors.push('runtime_integration.schema_version must be runtime_integration.v0_1');
    requireString(manifest.id, 'runtime_integration.id', errors);
    requireString(manifest.mode, 'runtime_integration.mode', errors);
    if (!['contract_only', 'shadow_dry_run', 'live'].includes(manifest.mode)) errors.push('runtime_integration.mode is invalid');
    if (typeof manifest.live_wiring_enabled !== 'boolean') errors.push('runtime_integration.live_wiring_enabled must be boolean');
    if (!Array.isArray(manifest.surfaces) || !manifest.surfaces.length) {
        errors.push('runtime_integration.surfaces must be a non-empty array');
    } else {
        manifest.surfaces.forEach((surface, index) => {
            if (!surface || typeof surface !== 'object' || Array.isArray(surface)) {
                errors.push(`runtime_integration.surfaces[${index}] must be an object`);
                return;
            }
            for (const key of ['name', 'repo', 'route', 'adapter', 'egress']) requireString(surface[key], `runtime_integration.surfaces[${index}].${key}`, errors);
            if (typeof surface.enabled !== 'boolean') errors.push(`runtime_integration.surfaces[${index}].enabled must be boolean`);
            for (const key of ['reads', 'writes', 'required_gates']) requireStringArray(surface[key], `runtime_integration.surfaces[${index}].${key}`, errors);
        });
    }
    for (const key of ['required_local_gates', 'required_receipts', 'claim_boundary', 'blocked_claims']) {
        requireStringArray(manifest[key], `runtime_integration.${key}`, errors);
    }
    requireString(manifest.next_allowed_step, 'runtime_integration.next_allowed_step', errors);
    return { errors, manifest };
}

function gateRuntimeIntegration(payload) {
    const { errors, manifest } = validateShape(payload);
    const failures = [...errors];
    const checkedScope = [
        'schema_version',
        'contract_only_mode',
        'live_wiring_disabled',
        'surface_adapters_disabled',
        'required_local_gates',
        'required_receipts_exist',
        'blocked_claims',
        'claim_boundary',
    ];

    if (!errors.length) {
        if (manifest.mode !== 'contract_only') failures.push(`mode must be contract_only until a shadow adapter is approved; got ${manifest.mode}`);
        if (manifest.live_wiring_enabled !== false) failures.push('live_wiring_enabled must be false');

        for (const surface of manifest.surfaces) {
            if (surface.enabled !== false) failures.push(`surface ${surface.name} must stay disabled`);
            if (surface.adapter !== 'none') failures.push(`surface ${surface.name} adapter must be none`);
        }

        for (const missing of missingFrom(manifest.required_local_gates, requiredLocalGates)) {
            failures.push(`missing required local gate ${missing}`);
        }

        for (const receipt of manifest.required_receipts) {
            if (!fileExists(receipt)) failures.push(`required receipt missing or unsafe path: ${receipt}`);
        }

        for (const missing of missingFrom(manifest.blocked_claims, requiredBlockedClaims)) {
            failures.push(`missing blocked claim ${missing}`);
        }

        if (!manifest.claim_boundary.some((claim) => /do not consume AMOS gates yet/i.test(claim))) {
            failures.push('claim_boundary must explicitly state public app/gateway do not consume AMOS gates yet');
        }
    }

    return {
        ok: failures.length === 0,
        decision: failures.length ? 'block' : 'allow',
        checked_scope: checkedScope,
        failures,
        warnings: failures.length ? [] : [
            'contract is local-only and does not enable runtime enforcement',
        ],
        manifest_id: manifest.id || '',
        mode: manifest.mode || '',
        live_wiring_enabled: manifest.live_wiring_enabled,
        surfaces: Array.isArray(manifest.surfaces)
            ? manifest.surfaces.map((surface) => ({
                name: surface.name,
                enabled: surface.enabled,
                adapter: surface.adapter,
            }))
            : [],
    };
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function selfTest() {
    const allowed = gateRuntimeIntegration(readJson(defaults.manifest, 'runtime integration manifest'));
    assert(allowed.ok, 'contract-only runtime integration should pass');
    assert(allowed.decision === 'allow', 'contract-only runtime integration should allow');

    const blocked = gateRuntimeIntegration(readJson(path.join(contractDir, 'runtime_integration.live_blocked.example.json'), 'blocked runtime integration manifest'));
    assert(!blocked.ok, 'live runtime integration example should block');
    assert(blocked.decision === 'block', 'live runtime integration example decision should be block');
    assert(blocked.failures.some((failure) => failure.includes('live_wiring_enabled')), 'blocked example should fail on live wiring');

    const missingReceipt = JSON.parse(JSON.stringify(readJson(defaults.manifest, 'runtime integration manifest')));
    missingReceipt.runtime_integration.required_receipts.push('.mirror/AUDIT_LOGS/missing.yaml');
    const missing = gateRuntimeIntegration(missingReceipt);
    assert(!missing.ok, 'missing receipt should block');

    return {
        ok: true,
        checks: [
            { name: 'contract-only manifest passes', decision: allowed.decision },
            { name: 'live manifest blocks', decision: blocked.decision },
            { name: 'missing receipt blocks', decision: missing.decision },
        ],
    };
}

try {
    const args = parseArgs(process.argv.slice(2));
    const result = args.selfTest
        ? selfTest()
        : gateRuntimeIntegration(readJson(args.manifest, 'runtime integration manifest'));
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
