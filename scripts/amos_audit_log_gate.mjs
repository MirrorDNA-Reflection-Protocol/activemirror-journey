#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const contractDir = path.join(repoRoot, '.mirror', 'CONTRACTS', 'amos');
const auditDir = path.join(repoRoot, '.mirror', 'AUDIT_LOGS');

const defaults = {
    state: path.join(contractDir, 'scd_state.example.json'),
    workspace: path.join(contractDir, 'workspace_boundary.personal.example.json'),
    consent: path.join(contractDir, 'consent_ladder.default.json'),
    agent: path.join(contractDir, 'agent_contract.mirror_concierge.example.json'),
    action: path.join(contractDir, 'action_request.audit_log.example.json'),
    request: path.join(contractDir, 'audit_log_request.example.json'),
    outDir: auditDir,
    out: '',
    timestamp: '',
    write: false,
    dryRun: false,
    selfTest: false,
};

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
    return object[key].map((item) => item.trim());
}

function validateAuditRequest(payload) {
    const errors = [];
    const request = payload.audit_log_request;
    if (!request || typeof request !== 'object' || Array.isArray(request)) {
        return { errors: ['audit_log_request must be an object'], request: {} };
    }

    if (request.schema_version !== 'audit_log_request.v0_1') {
        errors.push('audit_log_request.schema_version must be audit_log_request.v0_1');
    }
    const id = requireString(request, 'id', 'audit_log_request', errors);
    if (id && !/^[a-z0-9][a-z0-9_-]{2,80}$/.test(id)) {
        errors.push('audit_log_request.id must be a lowercase slug');
    }
    const action = requireString(request, 'action', 'audit_log_request', errors);
    const checkedScope = requireStringArray(request, 'checked_scope', 'audit_log_request', errors);
    const uncheckedScope = requireStringArray(request, 'unchecked_scope', 'audit_log_request', errors);
    const evidence = requireStringArray(request, 'evidence', 'audit_log_request', errors);
    const badNews = requireStringArray(request, 'bad_news', 'audit_log_request', errors);
    const followUp = requireStringArray(request, 'follow_up', 'audit_log_request', errors);
    if (!['pass', 'partial', 'fail'].includes(request.decision)) {
        errors.push('audit_log_request.decision must be pass, partial, or fail');
    }

    return {
        errors,
        request: {
            id,
            action,
            checked_scope: checkedScope,
            unchecked_scope: uncheckedScope,
            evidence,
            bad_news: badNews,
            decision: request.decision,
            follow_up: followUp,
        },
    };
}

function yamlString(value) {
    return JSON.stringify(String(value));
}

function yamlArray(items, indent = '  ') {
    return items.map((item) => `${indent}- ${yamlString(item)}`).join('\n');
}

function auditFilePath(args, request) {
    if (args.out) return args.out;
    return path.join(args.outDir, `${stamp(args)}-${request.id}.yaml`);
}

function auditYaml(payload) {
    const item = payload.audit_log;
    return [
        'audit_log:',
        `  id: ${yamlString(item.id)}`,
        `  task_id: ${yamlString(item.task_id)}`,
        `  created_at: ${yamlString(item.created_at)}`,
        `  actor: ${yamlString(item.actor)}`,
        `  action: ${yamlString(item.action)}`,
        '  checked_scope:',
        yamlArray(item.checked_scope, '    '),
        '  unchecked_scope:',
        yamlArray(item.unchecked_scope, '    '),
        '  evidence:',
        yamlArray(item.evidence, '    '),
        '  bad_news:',
        yamlArray(item.bad_news, '    '),
        `  decision: ${yamlString(item.decision)}`,
        '  follow_up:',
        yamlArray(item.follow_up, '    '),
        '',
    ].join('\n');
}

function buildAuditLog(request, args) {
    const now = stamp(args);
    return {
        audit_log: {
            id: `audit_${now.replace(/[^0-9TZ]/g, '').toLowerCase()}_${request.id}`,
            task_id: 'active_mirror_front_door_v1',
            created_at: isoFromStamp(now),
            actor: 'codex',
            action: request.action,
            checked_scope: request.checked_scope,
            unchecked_scope: request.unchecked_scope,
            evidence: request.evidence,
            bad_news: request.bad_news,
            decision: request.decision,
            follow_up: request.follow_up,
        },
    };
}

function validateAuditLog(payload) {
    const errors = [];
    const item = payload.audit_log;
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return ['audit_log must be an object'];
    }
    for (const key of ['id', 'task_id', 'created_at', 'actor', 'action', 'decision']) {
        if (typeof item[key] !== 'string' || !item[key].trim()) errors.push(`audit_log.${key} must be a non-empty string`);
    }
    for (const key of ['checked_scope', 'unchecked_scope', 'evidence', 'bad_news', 'follow_up']) {
        if (!Array.isArray(item[key]) || !item[key].length || item[key].some((entry) => typeof entry !== 'string' || !entry.trim())) {
            errors.push(`audit_log.${key} must be a non-empty array of strings`);
        }
    }
    if (!['pass', 'partial', 'fail'].includes(item.decision)) errors.push('audit_log.decision is invalid');
    return errors;
}

function createAuditLog(args) {
    const contract = runContractGate(args);
    if (contract.decision !== 'allow') {
        return {
            ok: false,
            decision: contract.decision,
            wrote: false,
            reason: contract.decision === 'approval_required' ? 'approval required before audit log write' : 'action is blocked',
            blocked_reason: contract.failures.length ? contract.failures : contract.approval_required,
            contract,
        };
    }

    const payload = readJson(args.request, 'audit log request');
    const { errors, request } = validateAuditRequest(payload);
    if (errors.length) {
        return {
            ok: false,
            decision: 'block',
            wrote: false,
            reason: 'audit log request failed local shape validation',
            blocked_reason: errors,
            contract,
        };
    }

    const audit = buildAuditLog(request, args);
    const auditErrors = validateAuditLog(audit);
    if (auditErrors.length) {
        return {
            ok: false,
            decision: 'block',
            wrote: false,
            reason: 'audit log failed local schema validation',
            blocked_reason: auditErrors,
            contract,
        };
    }

    const file = auditFilePath(args, request);
    const yaml = auditYaml(audit);
    if (args.write) {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, yaml);
    }

    return {
        ok: true,
        decision: contract.decision,
        wrote: args.write,
        file: args.write ? file : '',
        would_write: args.write ? '' : file,
        audit_log: audit.audit_log,
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
    const file = path.join(os.tmpdir(), `active-mirror-audit-request-${cryptoRandom()}.json`);
    fs.writeFileSync(file, JSON.stringify(payload, null, 2));
    return file;
}

function cryptoRandom() {
    return Math.random().toString(16).slice(2);
}

function selfTest() {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'active-mirror-audit-log-'));
    const allowed = createAuditLog({
        ...defaults,
        outDir: temp,
        timestamp: '20260707T000000Z',
        write: true,
    });
    assert(allowed.ok, 'allowed audit log should pass');
    assert(allowed.wrote, 'allowed audit log should write');
    assert(fs.existsSync(allowed.file), 'audit log file should exist');
    const written = fs.readFileSync(allowed.file, 'utf8');
    assert(written.includes('audit_log:'), 'audit log should use audit_log schema');
    assert(written.includes('decision: "partial"'), 'audit log should record decision');

    const blocked = createAuditLog({
        ...defaults,
        action: path.join(contractDir, 'action_request.blocked.example.json'),
        outDir: temp,
        timestamp: '20260707T000001Z',
        write: true,
    });
    assert(!blocked.ok, 'blocked action should not write audit log');
    assert(!blocked.wrote, 'blocked action should write nothing');

    const malformedRequest = writeTempRequest({
        audit_log_request: {
            schema_version: 'audit_log_request.v0_1',
            id: 'bad_audit',
            action: 'Missing evidence',
            checked_scope: [],
            unchecked_scope: ['not checked'],
            evidence: [],
            bad_news: ['missing evidence'],
            decision: 'partial',
            follow_up: ['fix request'],
        },
    });
    const malformed = createAuditLog({
        ...defaults,
        request: malformedRequest,
        outDir: temp,
        timestamp: '20260707T000002Z',
        write: true,
    });
    assert(!malformed.ok, 'malformed request should not write audit log');
    assert(!malformed.wrote, 'malformed request should write nothing');

    return {
        ok: true,
        checks: [
            { name: 'allowed audit log writes receipt', decision: allowed.decision, wrote: allowed.wrote },
            { name: 'blocked action writes nothing', decision: blocked.decision, wrote: blocked.wrote },
            { name: 'malformed request writes nothing', decision: malformed.decision, wrote: malformed.wrote },
        ],
    };
}

try {
    const args = parseArgs(process.argv.slice(2));
    const result = args.selfTest ? selfTest() : createAuditLog(args);
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.ok ? 0 : 2);
} catch (error) {
    console.error(JSON.stringify({ ok: false, decision: 'error', error: error.message }, null, 2));
    process.exit(1);
}
