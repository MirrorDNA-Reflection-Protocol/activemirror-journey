#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const defaultDir = path.join(repoRoot, '.mirror', 'CONTRACTS', 'amos');

const defaults = {
    state: path.join(defaultDir, 'scd_state.example.json'),
    workspace: path.join(defaultDir, 'workspace_boundary.personal.example.json'),
    consent: path.join(defaultDir, 'consent_ladder.default.json'),
    agent: path.join(defaultDir, 'agent_contract.mirror_concierge.example.json'),
    action: path.join(defaultDir, 'action_request.allowed.example.json'),
};

const levelRank = {
    level_0: 0,
    level_1: 1,
    level_2: 2,
    level_3: 3,
    level_4: 4,
};

function parseArgs(argv) {
    const args = { ...defaults, expect: '', selfTest: false, json: false };
    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];
        if (arg === '--self-test') {
            args.selfTest = true;
        } else if (arg === '--json') {
            args.json = true;
        } else if (arg.startsWith('--') && argv[index + 1]) {
            const key = arg.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
            args[key] = path.isAbsolute(argv[index + 1]) || key === 'expect'
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

function ensureObject(value, label, errors) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        errors.push(`${label} must be an object`);
        return {};
    }
    return value;
}

function requireString(object, key, label, errors) {
    if (typeof object[key] !== 'string' || !object[key].trim()) {
        errors.push(`${label}.${key} must be a non-empty string`);
        return '';
    }
    return object[key];
}

function requireArray(object, key, label, errors) {
    if (!Array.isArray(object[key])) {
        errors.push(`${label}.${key} must be an array`);
        return [];
    }
    const badIndex = object[key].findIndex((item) => typeof item !== 'string' || !item.trim());
    if (badIndex >= 0) errors.push(`${label}.${key}[${badIndex}] must be a non-empty string`);
    return object[key];
}

function includesAny(values, candidates) {
    const set = new Set(values);
    return candidates.some((candidate) => set.has(candidate));
}

function missingFrom(values, allowed) {
    const allowedSet = new Set(allowed);
    return values.filter((value) => !allowedSet.has(value));
}

function intersects(values, blocked) {
    const blockedSet = new Set(blocked);
    return values.filter((value) => blockedSet.has(value));
}

function validateShape(state, workspace, consent, agent, action) {
    const errors = [];

    const scd = ensureObject(state.scd_state, 'scd_state', errors);
    const boundary = ensureObject(workspace.workspace_boundary, 'workspace_boundary', errors);
    const ladder = ensureObject(consent.consent_ladder, 'consent_ladder', errors);
    const contract = ensureObject(agent.agent_contract, 'agent_contract', errors);
    const request = ensureObject(action.action_request, 'action_request', errors);

    if (scd.schema_version !== 'scd_state.v0_1') errors.push('scd_state.schema_version must be scd_state.v0_1');
    if (boundary.schema_version !== 'workspace_boundary.v0_1') errors.push('workspace_boundary.schema_version must be workspace_boundary.v0_1');
    if (ladder.schema_version !== 'consent_ladder.v0_1') errors.push('consent_ladder.schema_version must be consent_ladder.v0_1');
    if (contract.schema_version !== 'agent_contract.v0_1') errors.push('agent_contract.schema_version must be agent_contract.v0_1');
    if (request.schema_version !== 'action_request.v0_1') errors.push('action_request.schema_version must be action_request.v0_1');

    for (const [object, label, strings, arrays] of [
        [scd, 'scd_state', ['active_workspace', 'active_goal', 'active_agent', 'state_hash', 'previous_state_hash'], ['allowed_memory_sources', 'forbidden_memory_sources', 'allowed_tools', 'pending_actions', 'approvals_required', 'output_requirements']],
        [boundary, 'workspace_boundary', ['workspace_id', 'label', 'classification', 'egress_policy', 'memory_policy'], ['can_read', 'cannot_read', 'can_write', 'cannot_write', 'allowed_tools', 'forbidden_tools']],
        [ladder, 'consent_ladder', ['default_level'], ['actions_requiring_explicit_approval']],
        [contract, 'agent_contract', ['name', 'workspace', 'role'], ['can_read', 'cannot_read', 'can_write', 'cannot_write', 'allowed_tools', 'forbidden_tools', 'requires_approval_for', 'output_types']],
        [request, 'action_request', ['id', 'workspace', 'agent', 'tool', 'action', 'intent', 'egress', 'reversibility', 'consent_level', 'output_type'], ['reads', 'writes']],
    ]) {
        for (const key of strings) requireString(object, key, label, errors);
        for (const key of arrays) requireArray(object, key, label, errors);
    }

    if (typeof request.approval_token !== 'string') {
        errors.push('action_request.approval_token must be a string');
    }

    if (!Array.isArray(ladder.levels) || ladder.levels.length < 5) {
        errors.push('consent_ladder.levels must include the five ladder levels');
    }

    return { errors, scd, boundary, ladder, contract, request };
}

function approvalTokenMatches(request) {
    return request.approval_token === `approved:${request.id}` || request.approval_token === `approved:${request.action}`;
}

function gateContracts(input) {
    const { errors, scd, boundary, ladder, contract, request } = validateShape(
        input.state,
        input.workspace,
        input.consent,
        input.agent,
        input.action,
    );
    const failures = [...errors];
    const warnings = [];
    const approvalReasons = [];

    if (!errors.length) {
        if (scd.active_workspace !== boundary.workspace_id) {
            failures.push(`state workspace ${scd.active_workspace} does not match boundary ${boundary.workspace_id}`);
        }
        if (request.workspace !== boundary.workspace_id) {
            failures.push(`action workspace ${request.workspace} does not match boundary ${boundary.workspace_id}`);
        }
        if (contract.workspace !== boundary.classification) {
            failures.push(`agent workspace ${contract.workspace} does not match boundary classification ${boundary.classification}`);
        }
        if (scd.active_agent !== contract.name) {
            failures.push(`state agent ${scd.active_agent} does not match contract ${contract.name}`);
        }
        if (request.agent !== contract.name) {
            failures.push(`action agent ${request.agent} does not match contract ${contract.name}`);
        }
        if (!scd.pending_actions.includes(request.id) && !scd.pending_actions.includes(request.action)) {
            failures.push(`action ${request.id} is not listed in pending_actions`);
        }
        if (!scd.allowed_tools.includes(request.tool)) {
            failures.push(`tool ${request.tool} is not allowed by active state`);
        }
        if (!boundary.allowed_tools.includes(request.tool)) {
            failures.push(`tool ${request.tool} is not allowed by workspace boundary`);
        }
        if (!contract.allowed_tools.includes(request.tool)) {
            failures.push(`tool ${request.tool} is not allowed by agent contract`);
        }
        if (boundary.forbidden_tools.includes(request.tool) || contract.forbidden_tools.includes(request.tool)) {
            failures.push(`tool ${request.tool} is explicitly forbidden`);
        }
        if (!contract.output_types.includes(request.output_type)) {
            failures.push(`output type ${request.output_type} is not allowed by agent contract`);
        }

        const readMisses = [
            ...missingFrom(request.reads, boundary.can_read).map((item) => `workspace cannot read ${item}`),
            ...missingFrom(request.reads, contract.can_read).map((item) => `agent cannot read ${item}`),
            ...intersects(request.reads, boundary.cannot_read).map((item) => `workspace explicitly cannot read ${item}`),
            ...intersects(request.reads, contract.cannot_read).map((item) => `agent explicitly cannot read ${item}`),
            ...intersects(request.reads, scd.forbidden_memory_sources).map((item) => `state forbids memory source ${item}`),
        ];
        failures.push(...readMisses);

        const memoryReads = request.reads.filter((item) => item.includes(':'));
        const forbiddenMemoryReads = memoryReads.filter((item) => scd.forbidden_memory_sources.includes(item));
        if (forbiddenMemoryReads.length) {
            failures.push(`forbidden memory reads: ${forbiddenMemoryReads.join(', ')}`);
        }

        const writeMisses = [
            ...missingFrom(request.writes, boundary.can_write).map((item) => `workspace cannot write ${item}`),
            ...missingFrom(request.writes, contract.can_write).map((item) => `agent cannot write ${item}`),
            ...intersects(request.writes, boundary.cannot_write).map((item) => `workspace explicitly cannot write ${item}`),
            ...intersects(request.writes, contract.cannot_write).map((item) => `agent explicitly cannot write ${item}`),
        ];
        failures.push(...writeMisses);

        if (boundary.egress_policy === 'blocked' && request.egress !== 'none') {
            failures.push(`workspace egress policy blocks ${request.egress}`);
        }

        if (boundary.memory_policy === 'canonical_memory_blocked' && /\b(memory|promote|canonical|save)\b/i.test(request.action)) {
            failures.push('workspace blocks canonical memory actions');
        }

        if (boundary.egress_policy === 'approval_required' && request.egress !== 'none') {
            approvalReasons.push('workspace requires approval for egress');
        }
        if (['external_write', 'client_data', 'payment', 'publish'].includes(request.egress)) {
            approvalReasons.push(`egress ${request.egress} requires approval`);
        }
        if (request.reversibility !== 'reversible') {
            approvalReasons.push(`reversibility ${request.reversibility} requires approval`);
        }
        if ((levelRank[request.consent_level] ?? 99) >= 3) {
            approvalReasons.push(`consent level ${request.consent_level} requires approval`);
        }
        if (includesAny([request.id, request.action], contract.requires_approval_for)) {
            approvalReasons.push('agent contract requires approval for this action');
        }
        if (includesAny([request.id, request.action], ladder.actions_requiring_explicit_approval)) {
            approvalReasons.push('consent ladder requires explicit approval for this action');
        }
        if (includesAny([request.id, request.action], scd.approvals_required)) {
            approvalReasons.push('active state requires approval for this action');
        }
    }

    const approvalRequired = approvalReasons.length > 0 && !approvalTokenMatches(request);
    const decision = failures.length ? 'block' : approvalRequired ? 'approval_required' : 'allow';
    const ok = decision === 'allow';

    if (approvalReasons.length && approvalTokenMatches(request)) {
        warnings.push('approval token matched action scope');
    }

    return {
        ok,
        decision,
        checked_scope: [
            'schema_version',
            'workspace_match',
            'agent_match',
            'pending_action',
            'tool_allowlist',
            'read_boundary',
            'write_boundary',
            'egress_policy',
            'consent_ladder',
            'approval_token',
            'output_type',
        ],
        failures,
        approval_required: approvalRequired ? approvalReasons : [],
        warnings,
        action_id: request.id || '',
        workspace: request.workspace || '',
        agent: request.agent || '',
    };
}

function loadContracts(args) {
    return {
        state: readJson(args.state, 'state'),
        workspace: readJson(args.workspace, 'workspace'),
        consent: readJson(args.consent, 'consent'),
        agent: readJson(args.agent, 'agent'),
        action: readJson(args.action, 'action'),
    };
}

function runOnce(args) {
    return gateContracts(loadContracts(args));
}

function printResult(result) {
    console.log(JSON.stringify(result, null, 2));
}

function assertDecision(label, result, expected) {
    if (result.decision !== expected) {
        printResult(result);
        throw new Error(`${label}: expected ${expected}, got ${result.decision}`);
    }
}

function selfTest() {
    const allowed = runOnce(defaults);
    assertDecision('allowed example', allowed, 'allow');

    const blocked = runOnce({
        ...defaults,
        action: path.join(defaultDir, 'action_request.blocked.example.json'),
    });
    assertDecision('blocked example', blocked, 'block');

    const approvalAction = structuredClone(readJson(path.join(defaultDir, 'action_request.blocked.example.json'), 'approval action'));
    approvalAction.action_request.tool = 'local_artifact_generator';
    approvalAction.action_request.action = 'publish_public';
    approvalAction.action_request.id = 'publish_public';
    approvalAction.action_request.writes = ['session:draft'];
    approvalAction.action_request.output_type = 'html';
    const approvalContracts = loadContracts(defaults);
    approvalContracts.state.scd_state.pending_actions = ['publish_public'];
    const approval = gateContracts({
        ...approvalContracts,
        action: approvalAction,
    });
    assertDecision('approval example', approval, 'approval_required');

    const approvedAction = structuredClone(approvalAction);
    approvedAction.action_request.approval_token = 'approved:publish_public';
    const approvedContracts = loadContracts(defaults);
    approvedContracts.state.scd_state.pending_actions = ['publish_public'];
    const approved = gateContracts({
        ...approvedContracts,
        action: approvedAction,
    });
    assertDecision('approved example', approved, 'allow');

    return {
        ok: true,
        checks: [
            { name: 'allowed example', decision: allowed.decision },
            { name: 'blocked example', decision: blocked.decision },
            { name: 'approval example', decision: approval.decision },
            { name: 'approved example', decision: approved.decision },
        ],
    };
}

try {
    const args = parseArgs(process.argv.slice(2));
    if (args.selfTest) {
        printResult(selfTest());
        process.exit(0);
    }

    const result = runOnce(args);
    printResult(result);

    if (args.expect && result.decision !== args.expect) {
        process.exit(1);
    }
    if (args.expect && result.decision === args.expect) {
        process.exit(0);
    }
    process.exit(result.decision === 'block' || result.decision === 'approval_required' ? 2 : 0);
} catch (error) {
    console.error(JSON.stringify({ ok: false, decision: 'error', error: error.message }, null, 2));
    process.exit(1);
}
