#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const contractDir = path.join(repoRoot, '.mirror', 'CONTRACTS', 'amos');
const proposalDir = path.join(repoRoot, '.mirror', 'MEMORY_UPDATE_PROPOSALS');

const defaults = {
    state: path.join(contractDir, 'scd_state.example.json'),
    workspace: path.join(contractDir, 'workspace_boundary.personal.example.json'),
    consent: path.join(contractDir, 'consent_ladder.default.json'),
    agent: path.join(contractDir, 'agent_contract.mirror_concierge.example.json'),
    action: path.join(contractDir, 'action_request.memory_proposal.example.json'),
    request: path.join(contractDir, 'memory_proposal_request.example.json'),
    outDir: proposalDir,
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
            args[key] = ['timestamp'].includes(key) ? argv[index + 1] : resolvePath(argv[index + 1]);
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

function requireString(object, key, label, errors) {
    if (typeof object[key] !== 'string' || !object[key].trim()) {
        errors.push(`${label}.${key} must be a non-empty string`);
        return '';
    }
    return object[key].trim();
}

function validateMemoryProposalRequest(payload) {
    const errors = [];
    const request = payload.memory_proposal_request;
    if (!request || typeof request !== 'object' || Array.isArray(request)) {
        errors.push('memory_proposal_request must be an object');
        return { errors, request: {} };
    }

    if (request.schema_version !== 'memory_proposal_request.v0_1') {
        errors.push('memory_proposal_request.schema_version must be memory_proposal_request.v0_1');
    }

    const fields = ['id', 'project', 'proposal', 'source', 'confidence', 'timescale', 'human_summary'];
    for (const field of fields) requireString(request, field, 'memory_proposal_request', errors);

    if (!/^[a-z0-9][a-z0-9_-]{2,80}$/.test(request.id || '')) {
        errors.push('memory_proposal_request.id must be a lowercase slug');
    }
    if (!['confirmed', 'likely', 'provisional'].includes(request.confidence)) {
        errors.push('memory_proposal_request.confidence must be confirmed, likely, or provisional');
    }
    if (!['session', 'project', 'durable'].includes(request.timescale)) {
        errors.push('memory_proposal_request.timescale must be session, project, or durable');
    }

    return { errors, request };
}

function runContractGate(args) {
    const gate = path.join(scriptDir, 'amos_contract_gate.mjs');
    const gateArgs = [
        gate,
        '--state', args.state,
        '--workspace', args.workspace,
        '--consent', args.consent,
        '--agent', args.agent,
        '--action', args.action,
    ];
    const result = spawnSync(process.execPath, gateArgs, {
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

function proposalFilePath(args, request) {
    if (args.out) return args.out;
    return path.join(args.outDir, `${stamp(args)}-${request.id}.yaml`);
}

function yamlString(value) {
    return JSON.stringify(String(value));
}

function proposalYaml(proposal) {
    const item = proposal.memory_update_proposal;
    return [
        'memory_update_proposal:',
        `  id: ${yamlString(item.id)}`,
        `  glyph: ${yamlString(item.glyph)}`,
        `  project: ${yamlString(item.project)}`,
        `  proposal: ${yamlString(item.proposal)}`,
        `  source: ${yamlString(item.source)}`,
        `  confidence: ${yamlString(item.confidence)}`,
        `  timescale: ${yamlString(item.timescale)}`,
        `  approval_required: ${item.approval_required ? 'true' : 'false'}`,
        `  human_summary: ${yamlString(item.human_summary)}`,
        '',
    ].join('\n');
}

function buildProposal(request, args) {
    const id = `mem_prop_${stamp(args).replace(/[^0-9TZ]/g, '').toLowerCase()}_${request.id}`;
    return {
        memory_update_proposal: {
            id,
            glyph: 'proposal',
            project: request.project,
            proposal: request.proposal,
            source: request.source,
            confidence: request.confidence,
            timescale: request.timescale,
            approval_required: true,
            human_summary: request.human_summary,
        },
    };
}

function createProposal(args) {
    const contract = runContractGate(args);
    if (contract.decision !== 'allow') {
        return {
            ok: false,
            decision: contract.decision,
            wrote: false,
            blocked_reason: contract.failures.length ? contract.failures : contract.approval_required,
            contract,
        };
    }

    const payload = readJson(args.request, 'memory proposal request');
    const { errors, request } = validateMemoryProposalRequest(payload);
    if (errors.length) {
        return {
            ok: false,
            decision: 'block',
            wrote: false,
            blocked_reason: errors,
            contract,
        };
    }

    const proposal = buildProposal(request, args);
    const file = proposalFilePath(args, request);
    const yaml = proposalYaml(proposal);

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
        proposal,
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

function selfTest() {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'active-mirror-memory-proposal-'));
    const allowed = createProposal({
        ...defaults,
        outDir: temp,
        timestamp: '20260707T000000Z',
        write: true,
    });
    assert(allowed.ok, 'allowed proposal should pass');
    assert(allowed.wrote, 'allowed proposal should write');
    assert(fs.existsSync(allowed.file), 'allowed proposal file should exist');
    const written = fs.readFileSync(allowed.file, 'utf8');
    assert(written.includes('approval_required: true'), 'proposal must require approval');
    assert(written.includes('memory_update_proposal:'), 'proposal must use memory proposal schema');

    const blocked = createProposal({
        ...defaults,
        action: path.join(contractDir, 'action_request.blocked.example.json'),
        outDir: temp,
        timestamp: '20260707T000001Z',
        write: true,
    });
    assert(!blocked.ok, 'blocked action should not pass');
    assert(!blocked.wrote, 'blocked action should not write');

    return {
        ok: true,
        checks: [
            { name: 'allowed proposal writes after contract allow', decision: allowed.decision, wrote: allowed.wrote },
            { name: 'blocked action writes nothing', decision: blocked.decision, wrote: blocked.wrote },
        ],
    };
}

try {
    const args = parseArgs(process.argv.slice(2));
    const result = args.selfTest ? selfTest() : createProposal(args);
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.ok ? 0 : 2);
} catch (error) {
    console.error(JSON.stringify({ ok: false, decision: 'error', error: error.message }, null, 2));
    process.exit(1);
}
