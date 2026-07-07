#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

const checks = [
    {
        id: 'contract_gate',
        label: 'Contract gate',
        args: ['scripts/amos_contract_gate.mjs', '--self-test'],
    },
    {
        id: 'memory_proposal_gate',
        label: 'Memory proposal gate',
        args: ['scripts/amos_memory_proposal_gate.mjs', '--self-test'],
    },
    {
        id: 'approval_request_gate',
        label: 'Approval request gate',
        args: ['scripts/amos_approval_request_gate.mjs', '--self-test'],
    },
    {
        id: 'artifact_export_gate',
        label: 'Artifact export gate',
        args: ['scripts/amos_artifact_export_gate.mjs', '--self-test'],
    },
    {
        id: 'audit_log_gate',
        label: 'Audit log gate',
        args: ['scripts/amos_audit_log_gate.mjs', '--self-test'],
    },
    {
        id: 'receipt_chain_gate',
        label: 'Receipt chain gate',
        args: ['scripts/amos_receipt_chain_gate.mjs', '--verify'],
    },
    {
        id: 'runtime_integration_gate',
        label: 'Runtime integration gate',
        args: ['scripts/amos_runtime_integration_gate.mjs', '--self-test'],
    },
    {
        id: 'shadow_adapter_gate',
        label: 'Shadow dry-run adapter gate',
        args: ['scripts/amos_shadow_adapter_gate.mjs', '--self-test'],
    },
    {
        id: 'readonly_app_adapter_gate',
        label: 'Read-only app adapter gate',
        args: ['scripts/amos_readonly_app_adapter_gate.mjs', '--self-test'],
    },
    {
        id: 'browser_runtime_adapter_gate',
        label: 'Browser-local runtime adapter gate',
        args: ['scripts/amos_browser_runtime_adapter_gate.mjs', '--self-test'],
    },
    {
        id: 'ui_harness_gate',
        label: 'Local UI harness gate',
        args: ['scripts/amos_ui_harness_gate.mjs', '--self-test'],
    },
    {
        id: 'disabled_source_adapter_gate',
        label: 'Disabled source adapter gate',
        args: ['scripts/amos_disabled_source_adapter_gate.mjs', '--self-test'],
    },
    {
        id: 'source_adapter_import_gate',
        label: 'Source adapter import proposal gate',
        args: ['scripts/amos_source_adapter_import_gate.mjs', '--self-test'],
    },
    {
        id: 'source_adapter_import_approval_gate',
        label: 'Source adapter import approval bridge',
        args: ['scripts/amos_source_adapter_import_approval_gate.mjs', '--self-test'],
    },
];

const localOnlyLimits = [
    'Local repo controls only; the live app and gateway do not consume AMOS contracts yet.',
    'Receipt chains are SHA-256 local tamper checks only; they are not signed or externally timestamped.',
    'Approval requests, memory proposals, artifact exports, and audit receipts are scaffolds until wired into a runtime.',
    'Runtime integration is contract-only; app and gateway adapters are declared disabled.',
    'Shadow adapter emits local dry-run receipts only; it performs no live app, gateway, model, network, or memory action.',
    'Read-only app adapter emits local source-hash receipts only; it performs no live app, gateway, model, network, route, deploy, or memory action.',
    'Browser-local runtime adapter emits local in-memory projection receipts only; it performs no live app, gateway, model, network, route, deploy, or durable memory action.',
    'Local UI harness emits local projection receipts only; it performs no live app, gateway, model, network, route, deploy, arbitrary UI, or durable memory action.',
    'Disabled source adapter is source-only and not imported by the active app; it performs no live app, gateway, model, network, route, deploy, arbitrary UI, or durable memory action.',
    'Source adapter import proposal is approval-required and writes local receipts only; it performs no active import, live app, gateway, model, network, route, deploy, arbitrary UI, or durable memory action.',
    'Source adapter import approval bridge previews pending approval only; it writes no real approval file and performs no active import, live app, gateway, model, network, route, deploy, arbitrary UI, or durable memory action.',
];

function parseArgs(argv) {
    const args = { json: false };
    for (const arg of argv) {
        if (arg === '--json') args.json = true;
        else throw new Error(`Unknown argument: ${arg}`);
    }
    return args;
}

function parseJson(stdout) {
    try {
        return JSON.parse(stdout);
    } catch {
        return null;
    }
}

function runCheck(check) {
    const result = spawnSync(process.execPath, check.args, {
        cwd: repoRoot,
        encoding: 'utf8',
    });
    const parsed = parseJson(result.stdout.trim());
    const ok = result.status === 0 && parsed && parsed.ok !== false;
    const summary = {
        id: check.id,
        label: check.label,
        ok,
        exit_code: result.status,
        command: `node ${check.args.join(' ')}`,
    };
    if (parsed) {
        summary.decision = parsed.decision || (parsed.ok ? 'pass' : 'fail');
        if (parsed.chain_hash) summary.chain_hash = parsed.chain_hash;
        if (Number.isInteger(parsed.entry_count)) summary.entry_count = parsed.entry_count;
        if (Array.isArray(parsed.unchecked_scope)) summary.unchecked_scope = parsed.unchecked_scope;
        if (Array.isArray(parsed.checks)) summary.check_count = parsed.checks.length;
    } else {
        summary.decision = 'fail';
        summary.bad_news = 'command did not return JSON';
    }
    if (!ok) {
        summary.stdout = result.stdout.trim().slice(0, 2000);
        summary.stderr = result.stderr.trim().slice(0, 2000);
    }
    return summary;
}

function gitStatus() {
    const result = spawnSync('git', ['status', '--short'], {
        cwd: repoRoot,
        encoding: 'utf8',
    });
    if (result.status !== 0) return [`git status failed: ${result.stderr.trim()}`];
    return result.stdout.split(/\r?\n/).map((line) => line.trimEnd()).filter(Boolean);
}

function readChain() {
    const file = path.join(repoRoot, '.mirror', 'RECEIPT_CHAINS', 'audit-log-chain.json');
    if (!fs.existsSync(file)) return null;
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
        return null;
    }
}

function buildReport() {
    const checkResults = checks.map(runCheck);
    const failed = checkResults.filter((item) => !item.ok);
    const chainCheck = checkResults.find((item) => item.id === 'receipt_chain_gate');
    const chain = readChain();
    const dirty = gitStatus();
    return {
        ok: failed.length === 0,
        decision: failed.length ? 'fail' : 'partial',
        repo: repoRoot,
        checked_scope: checks.map((item) => item.label),
        unchecked_scope: localOnlyLimits,
        bad_news: [
            ...localOnlyLimits,
            ...failed.map((item) => `${item.label} failed`),
        ],
        checks: checkResults,
        receipt_chain: {
            file: '.mirror/RECEIPT_CHAINS/audit-log-chain.json',
            chain_hash: chainCheck?.chain_hash || chain?.chain_hash || '',
            entry_count: chainCheck?.entry_count ?? chain?.entry_count ?? 0,
            verifier_ok: Boolean(chainCheck?.ok),
        },
        working_tree: dirty,
        next: failed.length
            ? ['Fix the failed local gate before claiming AMOS control-plane health.']
            : ['Use this report before live runtime wiring or public proof claims.'],
    };
}

function printReport(report) {
    console.log('AMOS CONTROL PLANE STATUS');
    console.log(`repo: ${report.repo}`);
    console.log(`decision: ${report.decision}`);
    console.log('');
    console.log('BAD_NEWS:');
    for (const item of report.bad_news) console.log(`- ${item}`);
    console.log('');
    console.log('CHECKS:');
    for (const item of report.checks) {
        const suffix = item.chain_hash ? ` chain=${item.chain_hash}` : '';
        console.log(`- ${item.ok ? 'pass' : 'fail'} ${item.label}${suffix}`);
    }
    console.log('');
    console.log('RECEIPT_CHAIN:');
    console.log(`- file: ${report.receipt_chain.file}`);
    console.log(`- entries: ${report.receipt_chain.entry_count}`);
    console.log(`- hash: ${report.receipt_chain.chain_hash || 'missing'}`);
    console.log('');
    console.log('WORKING_TREE:');
    if (!report.working_tree.length) console.log('- clean');
    else for (const line of report.working_tree) console.log(`- ${line}`);
    console.log('');
    console.log('NEXT:');
    for (const item of report.next) console.log(`- ${item}`);
}

try {
    const args = parseArgs(process.argv.slice(2));
    const report = buildReport();
    if (args.json) console.log(JSON.stringify(report, null, 2));
    else printReport(report);
    process.exit(report.ok ? 0 : 2);
} catch (error) {
    console.error(JSON.stringify({ ok: false, decision: 'error', error: error.message }, null, 2));
    process.exit(1);
}
