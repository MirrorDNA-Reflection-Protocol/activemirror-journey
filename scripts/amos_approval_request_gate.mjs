#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const contractDir = path.join(repoRoot, '.mirror', 'CONTRACTS', 'amos');
const approvalDir = path.join(repoRoot, '.mirror', 'APPROVAL_REQUESTS');

const defaults = {
    state: path.join(contractDir, 'scd_state.approval.example.json'),
    workspace: path.join(contractDir, 'workspace_boundary.personal.example.json'),
    consent: path.join(contractDir, 'consent_ladder.default.json'),
    agent: path.join(contractDir, 'agent_contract.mirror_concierge.example.json'),
    action: path.join(contractDir, 'action_request.publish_public.approval.example.json'),
    outDir: approvalDir,
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

function approvalFilePath(args, action) {
    if (args.out) return args.out;
    return path.join(args.outDir, `${stamp(args)}-${action.id}.yaml`);
}

function yamlString(value) {
    return JSON.stringify(String(value));
}

function yamlArray(items, indent = '  ') {
    if (!items.length) return `${indent}- none`;
    return items.map((item) => `${indent}- ${yamlString(item)}`).join('\n');
}

function riskLevel(action) {
    if (action.consent_level === 'level_4' || action.reversibility === 'irreversible') return 'critical';
    if (['payment', 'client_data', 'publish'].includes(action.egress)) return 'high';
    if (action.reversibility === 'partly_reversible' || action.consent_level === 'level_3') return 'medium';
    return 'low';
}

function buildApprovalRequest(action, contract, args) {
    const now = stamp(args);
    const reasons = contract.approval_required.length
        ? contract.approval_required
        : ['approval required before consequential action'];

    return {
        approval_request: {
            id: `approval_${now.replace(/[^0-9TZ]/g, '').toLowerCase()}_${action.id}`,
            task_id: 'active_mirror_front_door_v1',
            requested_by: 'codex',
            requested_at: isoFromStamp(now),
            action: `${action.action}: ${action.intent}`,
            reason: reasons.join('; '),
            required_approval_from: 'Paul',
            risk_level: riskLevel(action),
            affected_paths: action.writes,
            checks: {
                tests_run: false,
                diff_reviewed: false,
                secrets_scan: false,
                rollback_plan: false,
            },
            checked_scope: contract.checked_scope,
            unchecked_scope: [
                'human approval',
                'final diff',
                'target environment',
                'rollback verification',
            ],
            allowed_only_if: [
                'human_approval_received',
                'required_checks_passed',
                'rollback_plan_attached',
            ],
            rollback: [
                'Do not execute the action while this request is pending.',
                'If an approved public change is later applied and fails, revert the changed artifact and record a rollback receipt.',
            ],
            human_summary: `Review required before ${action.action}; no external action has been performed.`,
            approval_required: true,
            status: 'pending',
        },
    };
}

function validateApprovalRequest(payload) {
    const errors = [];
    const item = payload.approval_request;
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return ['approval_request must be an object'];
    }

    for (const key of [
        'id',
        'task_id',
        'requested_by',
        'requested_at',
        'action',
        'reason',
        'required_approval_from',
        'risk_level',
        'human_summary',
        'status',
    ]) {
        if (typeof item[key] !== 'string' || !item[key].trim()) errors.push(`approval_request.${key} must be a non-empty string`);
    }

    for (const key of ['affected_paths', 'checked_scope', 'unchecked_scope', 'allowed_only_if', 'rollback']) {
        if (!Array.isArray(item[key]) || item[key].some((value) => typeof value !== 'string' || !value.trim())) {
            errors.push(`approval_request.${key} must be an array of strings`);
        }
    }

    if (!['low', 'medium', 'high', 'critical'].includes(item.risk_level)) errors.push('approval_request.risk_level is invalid');
    if (item.approval_required !== true) errors.push('approval_request.approval_required must be true');
    if (item.status !== 'pending') errors.push('approval_request.status must be pending');

    const checks = item.checks;
    if (!checks || typeof checks !== 'object' || Array.isArray(checks)) {
        errors.push('approval_request.checks must be an object');
    } else {
        for (const key of ['tests_run', 'diff_reviewed', 'secrets_scan', 'rollback_plan']) {
            if (typeof checks[key] !== 'boolean') errors.push(`approval_request.checks.${key} must be boolean`);
        }
    }

    return errors;
}

function approvalYaml(payload) {
    const item = payload.approval_request;
    return [
        'approval_request:',
        `  id: ${yamlString(item.id)}`,
        `  task_id: ${yamlString(item.task_id)}`,
        `  requested_by: ${yamlString(item.requested_by)}`,
        `  requested_at: ${yamlString(item.requested_at)}`,
        `  action: ${yamlString(item.action)}`,
        `  reason: ${yamlString(item.reason)}`,
        `  required_approval_from: ${yamlString(item.required_approval_from)}`,
        `  risk_level: ${yamlString(item.risk_level)}`,
        '  affected_paths:',
        yamlArray(item.affected_paths, '    '),
        '  checks:',
        `    tests_run: ${item.checks.tests_run ? 'true' : 'false'}`,
        `    diff_reviewed: ${item.checks.diff_reviewed ? 'true' : 'false'}`,
        `    secrets_scan: ${item.checks.secrets_scan ? 'true' : 'false'}`,
        `    rollback_plan: ${item.checks.rollback_plan ? 'true' : 'false'}`,
        '  checked_scope:',
        yamlArray(item.checked_scope, '    '),
        '  unchecked_scope:',
        yamlArray(item.unchecked_scope, '    '),
        '  allowed_only_if:',
        yamlArray(item.allowed_only_if, '    '),
        '  rollback:',
        yamlArray(item.rollback, '    '),
        `  human_summary: ${yamlString(item.human_summary)}`,
        `  approval_required: ${item.approval_required ? 'true' : 'false'}`,
        `  status: ${yamlString(item.status)}`,
        '',
    ].join('\n');
}

function createApprovalRequest(args) {
    const contract = runContractGate(args);
    if (contract.decision !== 'approval_required') {
        return {
            ok: false,
            decision: contract.decision,
            wrote: false,
            reason: contract.decision === 'allow' ? 'approval request not needed' : 'action is blocked',
            blocked_reason: contract.failures.length ? contract.failures : contract.approval_required,
            contract,
        };
    }

    const actionPayload = readJson(args.action, 'action request');
    const action = actionPayload.action_request || {};
    const approval = buildApprovalRequest(action, contract, args);
    const errors = validateApprovalRequest(approval);
    if (errors.length) {
        return {
            ok: false,
            decision: 'block',
            wrote: false,
            reason: 'approval request failed local shape validation',
            blocked_reason: errors,
            contract,
        };
    }

    const file = approvalFilePath(args, action);
    const yaml = approvalYaml(approval);

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
        approval_request: approval.approval_request,
        contract: {
            checked_scope: contract.checked_scope,
            approval_required: contract.approval_required,
            action_id: contract.action_id,
            workspace: contract.workspace,
            agent: contract.agent,
        },
    };
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function selfTest() {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'active-mirror-approval-request-'));
    const approval = createApprovalRequest({
        ...defaults,
        outDir: temp,
        timestamp: '20260707T000000Z',
        write: true,
    });
    assert(approval.ok, 'approval-required action should write request');
    assert(approval.wrote, 'approval-required action should write file');
    assert(fs.existsSync(approval.file), 'approval request file should exist');
    const written = fs.readFileSync(approval.file, 'utf8');
    assert(written.includes('approval_required: true'), 'approval request must require approval');
    assert(written.includes('status: "pending"'), 'approval request must be pending');

    const blocked = createApprovalRequest({
        ...defaults,
        state: path.join(contractDir, 'scd_state.example.json'),
        action: path.join(contractDir, 'action_request.blocked.example.json'),
        outDir: temp,
        timestamp: '20260707T000001Z',
        write: true,
    });
    assert(!blocked.ok, 'blocked action should not write request');
    assert(!blocked.wrote, 'blocked action should write nothing');

    const allowed = createApprovalRequest({
        ...defaults,
        state: path.join(contractDir, 'scd_state.example.json'),
        action: path.join(contractDir, 'action_request.allowed.example.json'),
        outDir: temp,
        timestamp: '20260707T000002Z',
        write: true,
    });
    assert(!allowed.ok, 'allowed action should not write approval request');
    assert(!allowed.wrote, 'allowed action should write nothing');

    return {
        ok: true,
        checks: [
            { name: 'approval-required action writes pending request', decision: approval.decision, wrote: approval.wrote },
            { name: 'blocked action writes nothing', decision: blocked.decision, wrote: blocked.wrote },
            { name: 'allowed action writes nothing', decision: allowed.decision, wrote: allowed.wrote },
        ],
    };
}

try {
    const args = parseArgs(process.argv.slice(2));
    const result = args.selfTest ? selfTest() : createApprovalRequest(args);
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.ok ? 0 : 2);
} catch (error) {
    console.error(JSON.stringify({ ok: false, decision: 'error', error: error.message }, null, 2));
    process.exit(1);
}
