#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const contractDir = path.join(repoRoot, '.mirror', 'CONTRACTS', 'amos');
const exportDir = path.join(repoRoot, '.mirror', 'ARTIFACT_EXPORTS');

const defaults = {
    state: path.join(contractDir, 'scd_state.example.json'),
    workspace: path.join(contractDir, 'workspace_boundary.personal.example.json'),
    consent: path.join(contractDir, 'consent_ladder.default.json'),
    agent: path.join(contractDir, 'agent_contract.mirror_concierge.example.json'),
    action: path.join(contractDir, 'action_request.artifact_export.example.json'),
    request: path.join(contractDir, 'artifact_export_request.example.json'),
    outDir: exportDir,
    out: '',
    timestamp: '',
    write: false,
    dryRun: false,
    selfTest: false,
};

const allowedContentTypes = new Set(['text/markdown', 'text/plain', 'application/json']);
const secretPatterns = [
    { name: 'private-key', pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
    { name: 'openai-key-like', pattern: /\bsk-(?:proj-|ant-|live-)?[A-Za-z0-9_-]{24,}\b/ },
    { name: 'aws-access-key-like', pattern: /\bAKIA[0-9A-Z]{16}\b/ },
    { name: 'bearer-token-like', pattern: /\bBearer\s+[A-Za-z0-9._~+/=-]{20,}\b/i },
    { name: 'absolute-user-path', pattern: /\/Users\/mirror-pro\// },
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
            args[key] = key === 'timestamp' ? argv[index + 1] : resolvePath(argv[index + 1]);
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

function runContractGate(args) {
    const gate = path.join(scriptDir, 'amos_contract_gate.mjs');
    const result = spawnSync(process.execPath, [
        gate,
        '--state', args.state,
        '--workspace', args.workspace,
        '--consent', args.consent,
        '--agent', args.agent,
        '--action', args.action,
    ], {
        cwd: repoRoot,
        encoding: 'utf8',
    });

    if (result.error) throw result.error;

    let parsed;
    try {
        parsed = JSON.parse(result.stdout);
    } catch (error) {
        throw new Error(`contract gate did not return JSON: ${error.message}`);
    }

    if (result.status === 1 || parsed.decision === 'error') {
        throw new Error(`contract gate error: ${parsed.error || result.stderr || 'unknown error'}`);
    }

    return parsed;
}

function stamp(args) {
    if (args.timestamp) return args.timestamp;
    return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function ensureRelativePath(value, label, errors) {
    if (typeof value !== 'string' || !value.trim()) {
        errors.push(`${label} must be a non-empty string`);
        return '';
    }
    if (value.includes('\0')) errors.push(`${label} contains a null byte`);
    if (path.isAbsolute(value)) errors.push(`${label} must be repo-relative, not absolute`);
    const normalized = path.normalize(value);
    if (normalized === '..' || normalized.startsWith(`..${path.sep}`)) {
        errors.push(`${label} must not traverse outside the repo`);
    }
    return normalized;
}

function isInside(child, parent) {
    const relative = path.relative(parent, child);
    return relative === '' || (!!relative && !relative.startsWith('..') && !path.isAbsolute(relative));
}

function realPathIfExists(filePath) {
    return fs.existsSync(filePath) ? fs.realpathSync(filePath) : '';
}

function validateRequestShape(payload) {
    const errors = [];
    const request = payload.artifact_export_request;
    if (!request || typeof request !== 'object' || Array.isArray(request)) {
        return { errors: ['artifact_export_request must be an object'], request: {} };
    }

    if (request.schema_version !== 'artifact_export_request.v0_1') {
        errors.push('artifact_export_request.schema_version must be artifact_export_request.v0_1');
    }
    if (!/^[a-z0-9][a-z0-9_-]{2,80}$/.test(request.artifact_id || '')) {
        errors.push('artifact_export_request.artifact_id must be a lowercase slug');
    }
    for (const key of ['source_path', 'allowed_root', 'export_root', 'public_name', 'content_type', 'source_classification']) {
        if (typeof request[key] !== 'string' || !request[key].trim()) errors.push(`artifact_export_request.${key} must be a non-empty string`);
    }
    if (!/^[A-Za-z0-9][A-Za-z0-9._ -]{0,120}$/.test(request.public_name || '')) {
        errors.push('artifact_export_request.public_name contains unsupported characters');
    }
    if (!allowedContentTypes.has(request.content_type)) {
        errors.push('artifact_export_request.content_type is not allowed');
    }
    if (!Number.isInteger(request.expires_after_minutes) || request.expires_after_minutes < 1 || request.expires_after_minutes > 1440) {
        errors.push('artifact_export_request.expires_after_minutes must be an integer from 1 to 1440');
    }
    if (request.signed_url !== false) errors.push('artifact_export_request.signed_url must be false for local exports');
    if (request.audited !== true) errors.push('artifact_export_request.audited must be true');
    if (!['session_draft', 'project_note', 'public_reference'].includes(request.source_classification)) {
        errors.push('artifact_export_request.source_classification is invalid');
    }

    ensureRelativePath(request.source_path || '', 'artifact_export_request.source_path', errors);
    ensureRelativePath(request.allowed_root || '', 'artifact_export_request.allowed_root', errors);
    ensureRelativePath(request.export_root || '', 'artifact_export_request.export_root', errors);

    return { errors, request };
}

function validateAndPrepareExport(args) {
    const payload = readJson(args.request, 'artifact export request');
    const { errors, request } = validateRequestShape(payload);
    if (errors.length) return { errors, request };

    const allowedRoot = path.resolve(repoRoot, path.normalize(request.allowed_root));
    const sourcePath = path.resolve(repoRoot, path.normalize(request.source_path));
    const exportRoot = args.outDir === defaults.outDir
        ? path.resolve(repoRoot, path.normalize(request.export_root))
        : args.outDir;

    if (!isInside(allowedRoot, repoRoot)) errors.push('allowed_root must stay inside the repo');
    if (!isInside(sourcePath, allowedRoot)) errors.push('source_path must stay inside allowed_root');
    if (args.outDir === defaults.outDir && !isInside(exportRoot, repoRoot)) errors.push('export_root must stay inside the repo');

    const allowedRootReal = realPathIfExists(allowedRoot);
    const sourceReal = realPathIfExists(sourcePath);
    if (!allowedRootReal) errors.push('allowed_root does not exist');
    if (!sourceReal) errors.push('source_path does not exist');
    if (allowedRootReal && sourceReal && !isInside(sourceReal, allowedRootReal)) {
        errors.push('source_path resolves outside allowed_root');
    }

    if (!errors.length && !fs.statSync(sourceReal).isFile()) {
        errors.push('source_path must resolve to a file');
    }

    const publicName = path.basename(request.public_name);
    if (publicName !== request.public_name) errors.push('public_name must not include directories');
    const artifactFile = `${stamp(args)}-${request.artifact_id}-${publicName}`;
    const exportPath = args.out || path.join(exportRoot, artifactFile);
    const manifestPath = `${exportPath}.manifest.yaml`;

    return {
        errors,
        request,
        paths: {
            allowedRoot,
            sourcePath,
            exportRoot,
            sourceReal,
            exportPath,
            manifestPath,
        },
    };
}

function scanText(bytes) {
    const text = bytes.toString('utf8');
    return secretPatterns
        .filter((item) => item.pattern.test(text))
        .map((item) => item.name);
}

function yamlString(value) {
    return JSON.stringify(String(value));
}

function yamlArray(items, indent = '  ') {
    if (!items.length) return `${indent}- none`;
    return items.map((item) => `${indent}- ${yamlString(item)}`).join('\n');
}

function relativeToRepo(filePath) {
    const relative = path.relative(repoRoot, filePath);
    return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
        ? relative
        : filePath;
}

function exportYaml(payload) {
    const item = payload.artifact_export;
    return [
        'artifact_export:',
        `  artifact_id: ${yamlString(item.artifact_id)}`,
        `  source_path: ${yamlString(item.source_path)}`,
        `  export_path: ${yamlString(item.export_path)}`,
        `  public_name: ${yamlString(item.public_name)}`,
        `  content_type: ${yamlString(item.content_type)}`,
        `  hash: ${yamlString(item.hash)}`,
        `  signed_url: ${item.signed_url ? 'true' : 'false'}`,
        `  expires_after_minutes: ${item.expires_after_minutes}`,
        `  audited: ${item.audited ? 'true' : 'false'}`,
        `  status: ${yamlString(item.status)}`,
        `  source_classification: ${yamlString(item.source_classification)}`,
        '  checked_scope:',
        yamlArray(item.checked_scope, '    '),
        '  local_checks:',
        yamlArray(item.local_checks, '    '),
        '',
    ].join('\n');
}

function createArtifactExport(args) {
    const contract = runContractGate(args);
    if (contract.decision !== 'allow') {
        return {
            ok: false,
            decision: contract.decision,
            wrote: false,
            reason: contract.decision === 'approval_required' ? 'approval required before export' : 'action is blocked',
            blocked_reason: contract.failures.length ? contract.failures : contract.approval_required,
            contract,
        };
    }

    const prepared = validateAndPrepareExport(args);
    if (prepared.errors.length) {
        return {
            ok: false,
            decision: 'block',
            wrote: false,
            reason: 'artifact export request failed local safety checks',
            blocked_reason: prepared.errors,
            contract,
        };
    }

    const bytes = fs.readFileSync(prepared.paths.sourceReal);
    const secretHits = scanText(bytes);
    if (secretHits.length) {
        return {
            ok: false,
            decision: 'block',
            wrote: false,
            reason: 'artifact source failed secret scan',
            blocked_reason: secretHits.map((name) => `secret pattern matched: ${name}`),
            contract,
        };
    }

    const hash = `sha256:${crypto.createHash('sha256').update(bytes).digest('hex')}`;
    const localChecks = [
        'path_canonicalized',
        'no_path_traversal',
        'no_absolute_user_path',
        'symlink_escape_checked',
        'allowed_root_enforced',
        'content_type_allowed',
        'secret_scan_passed',
        'sha256_recorded',
    ];
    const manifest = {
        artifact_export: {
            artifact_id: prepared.request.artifact_id,
            source_path: relativeToRepo(prepared.paths.sourcePath),
            export_path: relativeToRepo(prepared.paths.exportPath),
            public_name: prepared.request.public_name,
            content_type: prepared.request.content_type,
            hash,
            signed_url: false,
            expires_after_minutes: prepared.request.expires_after_minutes,
            audited: true,
            status: 'local_only',
            source_classification: prepared.request.source_classification,
            checked_scope: contract.checked_scope,
            local_checks: localChecks,
        },
    };

    if (args.write) {
        fs.mkdirSync(path.dirname(prepared.paths.exportPath), { recursive: true });
        fs.copyFileSync(prepared.paths.sourceReal, prepared.paths.exportPath);
        fs.writeFileSync(prepared.paths.manifestPath, exportYaml(manifest));
    }

    return {
        ok: true,
        decision: contract.decision,
        wrote: args.write,
        file: args.write ? prepared.paths.exportPath : '',
        manifest: args.write ? prepared.paths.manifestPath : '',
        would_write: args.write ? '' : prepared.paths.exportPath,
        would_write_manifest: args.write ? '' : prepared.paths.manifestPath,
        artifact_export: manifest.artifact_export,
        contract: {
            checked_scope: contract.checked_scope,
            action_id: contract.action_id,
            workspace: contract.workspace,
            agent: contract.agent,
        },
    };
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function writeTempRequest(payload) {
    const file = path.join(os.tmpdir(), `active-mirror-artifact-request-${crypto.randomUUID()}.json`);
    fs.writeFileSync(file, JSON.stringify(payload, null, 2));
    return file;
}

function selfTest() {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'active-mirror-artifact-export-'));
    const allowed = createArtifactExport({
        ...defaults,
        outDir: temp,
        timestamp: '20260707T000000Z',
        write: true,
    });
    assert(allowed.ok, 'allowed artifact export should pass');
    assert(allowed.wrote, 'allowed artifact export should write');
    assert(fs.existsSync(allowed.file), 'exported artifact should exist');
    assert(fs.existsSync(allowed.manifest), 'export manifest should exist');
    const manifest = fs.readFileSync(allowed.manifest, 'utf8');
    assert(manifest.includes('status: "local_only"'), 'manifest must stay local_only');
    assert(manifest.includes('hash: "sha256:'), 'manifest must record sha256');

    const traversalRequest = writeTempRequest({
        artifact_export_request: {
            schema_version: 'artifact_export_request.v0_1',
            artifact_id: 'bad_traversal',
            source_path: '../package.json',
            allowed_root: '.mirror/ARTIFACT_SOURCES',
            export_root: '.mirror/ARTIFACT_EXPORTS',
            public_name: 'package.json',
            content_type: 'application/json',
            expires_after_minutes: 60,
            signed_url: false,
            audited: true,
            source_classification: 'session_draft',
        },
    });
    const traversal = createArtifactExport({
        ...defaults,
        request: traversalRequest,
        outDir: temp,
        timestamp: '20260707T000001Z',
        write: true,
    });
    assert(!traversal.ok, 'path traversal should be blocked');
    assert(!traversal.wrote, 'path traversal should write nothing');

    const blocked = createArtifactExport({
        ...defaults,
        action: path.join(contractDir, 'action_request.blocked.example.json'),
        outDir: temp,
        timestamp: '20260707T000002Z',
        write: true,
    });
    assert(!blocked.ok, 'blocked action should not export');
    assert(!blocked.wrote, 'blocked action should write nothing');

    return {
        ok: true,
        checks: [
            { name: 'allowed local artifact export writes file and manifest', decision: allowed.decision, wrote: allowed.wrote },
            { name: 'path traversal writes nothing', decision: traversal.decision, wrote: traversal.wrote },
            { name: 'blocked action writes nothing', decision: blocked.decision, wrote: blocked.wrote },
        ],
    };
}

try {
    const args = parseArgs(process.argv.slice(2));
    const result = args.selfTest ? selfTest() : createArtifactExport(args);
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.ok ? 0 : 2);
} catch (error) {
    console.error(JSON.stringify({ ok: false, decision: 'error', error: error.message }, null, 2));
    process.exit(1);
}
