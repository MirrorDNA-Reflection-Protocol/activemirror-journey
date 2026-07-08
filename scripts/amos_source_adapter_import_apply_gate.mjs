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
const receiptDir = path.join(repoRoot, '.mirror', 'RUNTIME_DRY_RUNS');
const patchDir = path.join(repoRoot, '.mirror', 'PATCH_PROPOSALS');
const approvalDir = path.join(repoRoot, '.mirror', 'APPROVAL_REQUESTS');
const rollbackDir = path.join(repoRoot, '.mirror', 'ROLLBACKS');
const srcRoot = path.join(repoRoot, 'src');

const defaults = {
  request: path.join(contractDir, 'source_adapter_import_apply.request.example.json'),
  outDir: receiptDir,
  rollbackOutDir: rollbackDir,
  out: '',
  rollbackOut: '',
  timestamp: '',
  expect: '',
  write: false,
  dryRun: false,
  selfTest: false,
};

const requiredGates = [
  'guard:source-adapter-import-patch',
  'guard:front-door',
  'guard:receipt-chain',
];

const gateCommands = {
  'guard:source-adapter-import-patch': ['scripts/amos_source_adapter_import_patch_gate.mjs', '--self-test'],
  'guard:front-door': ['scripts/front_door_guard.mjs'],
  'guard:receipt-chain': ['scripts/amos_receipt_chain_gate.mjs', '--verify'],
};

const requiredBlockedClaims = [
  'Source adapter import was applied.',
  'Source adapter import is live in the public app.',
  'Source adapter import changed app routes.',
  'Source adapter import changed gateway behavior.',
  'Source adapter import called a model.',
  'Source adapter import used the network.',
  'Source adapter import wrote durable memory.',
  'Source adapter import deployed public assets.',
  'Source adapter import executed arbitrary generated UI.',
];

const blockedCapabilities = [
  'apply_patch',
  'apply_import',
  'live_import',
  'model_call',
  'network',
  'durable_memory_write',
  'route_change',
  'gateway_change',
  'public_deploy',
  'arbitrary_generated_ui',
];

const adapterImport = "import { createDisabledSourceAdapterProjection } from '../lib/amos-disabled-source-adapter';";

function resolvePath(value) {
  return path.isAbsolute(value) ? value : path.resolve(process.cwd(), value);
}

function parseArgs(argv) {
  const args = { ...defaults };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--write') args.write = true;
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--self-test') args.selfTest = true;
    else if (arg.startsWith('--') && argv[index + 1]) {
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

function validateShape(payload) {
  const errors = [];
  const request = payload.source_adapter_import_apply_request;
  if (!request || typeof request !== 'object' || Array.isArray(request)) {
    return { errors: ['source_adapter_import_apply_request must be an object'], request: {} };
  }

  if (request.schema_version !== 'source_adapter_import_apply_request.v0_1') errors.push('source_adapter_import_apply_request.schema_version must be source_adapter_import_apply_request.v0_1');
  const id = requireString(request, 'id', 'source_adapter_import_apply_request', errors);
  if (id && !/^[a-z0-9][a-z0-9_-]{2,80}$/.test(id)) errors.push('source_adapter_import_apply_request.id must be a lowercase slug');
  const surface = requireString(request, 'surface', 'source_adapter_import_apply_request', errors);
  const mode = requireString(request, 'mode', 'source_adapter_import_apply_request', errors);
  const adapter = requireString(request, 'adapter', 'source_adapter_import_apply_request', errors);
  const route = requireString(request, 'route', 'source_adapter_import_apply_request', errors);
  const sourceFile = requireString(request, 'source_file', 'source_adapter_import_apply_request', errors);
  const targetFile = requireString(request, 'target_file', 'source_adapter_import_apply_request', errors);
  const patchFile = requireString(request, 'patch_file', 'source_adapter_import_apply_request', errors);
  const patchReceipt = requireString(request, 'patch_receipt', 'source_adapter_import_apply_request', errors);
  const approvalRequest = requireString(request, 'approval_request', 'source_adapter_import_apply_request', errors);
  const approvalScope = requireString(request, 'approval_scope', 'source_adapter_import_apply_request', errors);
  const requiredGateList = requireStringArray(request, 'required_gates', 'source_adapter_import_apply_request', errors);
  const outputType = requireString(request, 'output_type', 'source_adapter_import_apply_request', errors);
  const claimBoundary = requireStringArray(request, 'claim_boundary', 'source_adapter_import_apply_request', errors);
  const blockedClaims = requireStringArray(request, 'blocked_claims', 'source_adapter_import_apply_request', errors);

  for (const key of ['write_rollback_enabled', 'apply_patch_enabled', 'live_import_enabled', 'model_call_enabled', 'network_enabled', 'durable_memory_write_enabled', 'route_change_enabled', 'gateway_change_enabled', 'public_deploy_enabled', 'arbitrary_ui_enabled']) {
    if (typeof request[key] !== 'boolean') errors.push(`source_adapter_import_apply_request.${key} must be boolean`);
  }

  return {
    errors,
    request: {
      id,
      surface,
      mode,
      adapter,
      route,
      source_file: sourceFile,
      target_file: targetFile,
      patch_file: patchFile,
      patch_receipt: patchReceipt,
      approval_request: approvalRequest,
      approval_scope: approvalScope,
      write_rollback_enabled: request.write_rollback_enabled,
      apply_patch_enabled: request.apply_patch_enabled,
      live_import_enabled: request.live_import_enabled,
      model_call_enabled: request.model_call_enabled,
      network_enabled: request.network_enabled,
      durable_memory_write_enabled: request.durable_memory_write_enabled,
      route_change_enabled: request.route_change_enabled,
      gateway_change_enabled: request.gateway_change_enabled,
      public_deploy_enabled: request.public_deploy_enabled,
      arbitrary_ui_enabled: request.arbitrary_ui_enabled,
      required_gates: requiredGateList,
      output_type: outputType,
      claim_boundary: claimBoundary,
      blocked_claims: blockedClaims,
    },
  };
}

function safeRepoPath(value, root, label) {
  const target = path.resolve(repoRoot, value);
  const relative = path.relative(root, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label} must stay under ${root}`);
  }
  return target;
}

function relativeToRepo(filePath) {
  const relative = path.relative(repoRoot, filePath);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
    ? relative
    : filePath;
}

function sha256Text(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function runNodeCommand(command) {
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
  return { parsed, ok };
}

function runGate(id) {
  const command = gateCommands[id];
  if (!command) return { id, ok: false, decision: 'missing_command' };
  const { parsed, ok } = runNodeCommand(command);
  const decision = parsed?.decision || (ok ? 'pass' : 'fail');
  return { id, ok, decision };
}

function runGitApplyCheck(patchPath) {
  const result = spawnSync('git', ['apply', '--check', patchPath], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  return {
    ok: result.status === 0,
    command: 'git apply --check',
    exit_code: result.status ?? 1,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
  };
}

function validateApprovalRequest(filePath) {
  const failures = [];
  if (!fs.existsSync(filePath)) return { ok: false, status: '', approval_required: false, failures: [`approval request missing: ${relativeToRepo(filePath)}`] };
  const text = fs.readFileSync(filePath, 'utf8');
  const status = /status:\s*"([^"]+)"/.exec(text)?.[1] || '';
  const approvalRequired = /approval_required:\s*true/.test(text);
  for (const snippet of [
    'approval_request:',
    'action: "source_adapter_import:',
    'required_approval_from: "Paul"',
    'allowed_only_if:',
    'human_approval_received',
  ]) {
    if (!text.includes(snippet)) failures.push(`approval request missing ${snippet}`);
  }
  if (status !== 'pending') failures.push(`approval request status must remain pending; got ${status || 'missing'}`);
  if (!approvalRequired) failures.push('approval request must require approval');
  return {
    ok: failures.length === 0,
    status,
    approval_required: approvalRequired,
    failures,
  };
}

function validatePatchReceipt(filePath, request) {
  const failures = [];
  if (!fs.existsSync(filePath)) return { ok: false, decision: '', patch_written: false, target_modified: true, performed_live_action: true, failures: [`patch receipt missing: ${relativeToRepo(filePath)}`] };
  const payload = readJson(filePath, 'source adapter import patch receipt');
  const receipt = payload.source_adapter_import_patch_receipt || {};
  if (receipt.schema_version !== 'source_adapter_import_patch_receipt.v0_1') failures.push('patch receipt schema_version is invalid');
  if (receipt.decision !== 'patch_prepared') failures.push('patch receipt decision must be patch_prepared');
  if (receipt.approval_scope !== 'patch_proposal_only') failures.push('patch receipt approval_scope must be patch_proposal_only');
  if (receipt.patch_written !== true) failures.push('patch receipt must show patch file was written');
  if (receipt.patch_file !== request.patch_file) failures.push('patch receipt patch_file must match request patch_file');
  if (receipt.target_file !== request.target_file) failures.push('patch receipt target_file must match request target_file');
  if (receipt.source_file !== request.source_file) failures.push('patch receipt source_file must match request source_file');
  if (receipt.target_modified !== false) failures.push('patch receipt must show target_modified false');
  if (receipt.performed_live_action !== false) failures.push('patch receipt must show performed_live_action false');
  return {
    ok: failures.length === 0,
    decision: receipt.decision || '',
    patch_written: receipt.patch_written === true,
    target_modified: receipt.target_modified === true,
    performed_live_action: receipt.performed_live_action === true,
    file: relativeToRepo(filePath),
    failures,
  };
}

function validateRequest(request) {
  const failures = [];
  if (request.surface !== 'consumer_app') failures.push(`surface must be consumer_app; got ${request.surface}`);
  if (request.mode !== 'apply_readiness_with_rollback') failures.push(`mode must be apply_readiness_with_rollback; got ${request.mode}`);
  if (request.adapter !== 'amos_disabled_source_adapter') failures.push(`adapter must be amos_disabled_source_adapter; got ${request.adapter}`);
  if (request.route !== '/app/') failures.push(`route must be /app/; got ${request.route}`);
  if (request.source_file !== 'src/lib/amos-disabled-source-adapter.js') failures.push('source_file must be src/lib/amos-disabled-source-adapter.js');
  if (request.target_file !== 'src/pages/HomePage.jsx') failures.push('target_file must be src/pages/HomePage.jsx');
  if (request.patch_file !== '.mirror/PATCH_PROPOSALS/20260707T160235Z-disabled_source_adapter_import_patch.diff') failures.push('patch_file must be the prepared source adapter import patch proposal');
  if (request.patch_receipt !== '.mirror/RUNTIME_DRY_RUNS/20260707T160235Z-disabled_source_adapter_import_patch.json') failures.push('patch_receipt must be the prepared source adapter import patch receipt');
  if (request.approval_request !== '.mirror/APPROVAL_REQUESTS/20260707T153055Z-source_adapter_import.yaml') failures.push('approval_request must be the pending source adapter import approval request');
  if (request.approval_scope !== 'apply_readiness_only') failures.push('approval_scope must be apply_readiness_only');
  if (request.write_rollback_enabled !== true) failures.push('write_rollback_enabled must be true');
  if (request.apply_patch_enabled !== false) failures.push('apply_patch_enabled must be false');
  if (request.live_import_enabled !== false) failures.push('live_import_enabled must be false');
  if (request.model_call_enabled !== false) failures.push('model_call_enabled must be false');
  if (request.network_enabled !== false) failures.push('network_enabled must be false');
  if (request.durable_memory_write_enabled !== false) failures.push('durable_memory_write_enabled must be false');
  if (request.route_change_enabled !== false) failures.push('route_change_enabled must be false');
  if (request.gateway_change_enabled !== false) failures.push('gateway_change_enabled must be false');
  if (request.public_deploy_enabled !== false) failures.push('public_deploy_enabled must be false');
  if (request.arbitrary_ui_enabled !== false) failures.push('arbitrary_ui_enabled must be false');
  if (request.output_type !== 'source_adapter_import_apply_receipt') failures.push(`output_type must be source_adapter_import_apply_receipt; got ${request.output_type}`);
  for (const missing of missingFrom(request.required_gates, requiredGates)) failures.push(`missing required gate ${missing}`);
  for (const missing of missingFrom(request.blocked_claims, requiredBlockedClaims)) failures.push(`missing blocked claim ${missing}`);
  if (!request.claim_boundary.some((claim) => /apply cleanly/i.test(claim))) failures.push('claim_boundary must state this verifies the patch can apply cleanly');
  if (!request.claim_boundary.some((claim) => /rollback plan/i.test(claim))) failures.push('claim_boundary must state this writes a rollback plan');
  if (!request.claim_boundary.some((claim) => /does not apply/i.test(claim))) failures.push('claim_boundary must state this does not apply the patch');
  if (!request.claim_boundary.some((claim) => /does not import/i.test(claim))) failures.push('claim_boundary must state this does not import the adapter');
  return failures;
}

function assertSafeOutput(filePath, root, label) {
  const target = path.resolve(filePath);
  const relative = path.relative(path.resolve(root), target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label} must stay under ${path.resolve(root)}`);
  }
}

function rollbackFilePath(args, request) {
  if (args.rollbackOut) return args.rollbackOut;
  return path.join(args.rollbackOutDir, `${stamp(args)}-${request.id}_rollback.yaml`);
}

function receiptFilePath(args, request) {
  if (args.out) return args.out;
  return path.join(args.outDir, `${stamp(args)}-${request.id}.json`);
}

function buildInversePatch(targetFile) {
  return [
    `diff --git a/${targetFile} b/${targetFile}`,
    `--- a/${targetFile}`,
    `+++ b/${targetFile}`,
    '@@ -25,4 +25,3 @@',
    " } from '../lib/mirror-state';",
    " import { getPrivacySessionId, trackEvent } from '../lib/privacy-events';",
    " import { copyText } from '../lib/sendable-actions';",
    `-${adapterImport}`,
  ].join('\n');
}

function yamlString(value) {
  return JSON.stringify(String(value));
}

function yamlArray(items, indent = '  ') {
  return items.map((item) => `${indent}- ${yamlString(item)}`).join('\n');
}

function buildRollbackYaml(request, state, args) {
  const inversePatch = buildInversePatch(request.target_file);
  const now = stamp(args);
  return [
    'rollback_plan:',
    `  id: ${yamlString(`rollback_${now}_${request.id}`)}`,
    '  task_id: "active_mirror_front_door_v1"',
    `  created_at: ${yamlString(isoFromStamp(now))}`,
    '  change: "Future application of disabled source adapter import to HomePage.jsx."',
    '  affected_paths:',
    yamlArray([request.target_file], '    '),
    '  restore_steps:',
    yamlArray([
      'If the future apply step imports the disabled source adapter, remove that import using the inverse_patch below.',
      'Run git apply --check against the inverse patch before using it.',
      'Run npm run guard:source-adapter-import-apply after restore to confirm the active source is back to the pending state.',
    ], '    '),
    '  verification_after_restore:',
    yamlArray([
      'git diff -- src/pages/HomePage.jsx',
      'npm run guard:source-adapter-import-apply',
      'npm run guard:front-door',
    ], '    '),
    '  risk_if_not_restored:',
    yamlArray([
      'The disabled source adapter import may stay in active source without an explicit apply receipt.',
      'Future agents may mistake readiness for a live integration.',
    ], '    '),
    '  evidence:',
    yamlArray([
      `patch_file=${request.patch_file}`,
      `patch_file_hash=${state.patch_file_hash}`,
      `target_hash_before=${state.target_hash_before}`,
    ], '    '),
    '  inverse_patch: |',
    ...inversePatch.split('\n').map((line) => `    ${line}`),
    '  owner: "codex"',
    '',
  ].join('\n');
}

function buildReceipt(request, state, args, decision) {
  const now = stamp(args);
  return {
    source_adapter_import_apply_receipt: {
      schema_version: 'source_adapter_import_apply_receipt.v0_1',
      id: `source_adapter_import_apply_receipt_${now.replace(/[^0-9TZ]/g, '').toLowerCase()}_${request.id}`,
      request_id: request.id,
      created_at: isoFromStamp(now),
      decision,
      approval_scope: 'apply_readiness_only',
      patch_file: request.patch_file,
      patch_file_hash: state.patch_file_hash || '0'.repeat(64),
      patch_receipt: request.patch_receipt,
      rollback_written: state.rollback_written,
      rollback_file: state.rollback_file || '',
      rollback_file_hash: state.rollback_file_hash || '',
      target_file: request.target_file,
      target_hash_before: state.target_hash_before || '0'.repeat(64),
      target_hash_after: state.target_hash_after || '0'.repeat(64),
      target_modified: false,
      source_file: request.source_file,
      source_hash: state.source_hash || '0'.repeat(64),
      patch_applied: false,
      performed_live_action: false,
      checked_scope: [
        'source_adapter_import_apply_request_shape',
        'patch_proposal_file',
        'patch_proposal_receipt',
        'pending_approval_request_file',
        'source_file_exists',
        'target_file_exists',
        'git_apply_check_only',
        'rollback_plan_write',
        'target_hash_unchanged',
        'no_apply_patch',
        'no_live_import',
        'no_model_call',
        'no_network',
        'no_durable_memory_write',
        'no_route_change',
        'no_gateway_change',
        'no_public_deploy',
        'no_arbitrary_ui',
        'required_local_gates',
      ],
      gate_results: state.gate_results,
      approval_request_result: state.approval_request_result,
      patch_receipt_result: state.patch_receipt_result,
      git_apply_check: {
        ok: state.git_apply_check.ok,
        command: state.git_apply_check.command,
        exit_code: state.git_apply_check.exit_code,
      },
      rollback_summary: {
        kind: 'inverse_import_line_patch',
        removes_import: true,
        requires_future_apply_state: true,
      },
      blocked_capabilities: blockedCapabilities,
      output: {
        type: 'source_adapter_import_apply_receipt',
        message: state.rollback_written
          ? 'Patch is apply-ready and a rollback plan was written, but no source file was changed.'
          : 'Patch is apply-ready, but no source file was changed and no rollback file was written without --write.',
      },
    },
  };
}

function gateSourceAdapterImportApply(payload, args) {
  const { errors, request } = validateShape(payload);
  const failures = [...errors];
  const state = {
    patch_file_hash: '',
    rollback_written: false,
    rollback_file: '',
    rollback_file_hash: '',
    target_hash_before: '',
    target_hash_after: '',
    source_hash: '',
    gate_results: [],
    approval_request_result: { ok: false, status: '', approval_required: false, file: '' },
    patch_receipt_result: { ok: false, decision: '', patch_written: false, target_modified: true, performed_live_action: true, file: '' },
    git_apply_check: { ok: false, command: 'git apply --check', exit_code: 1 },
  };

  if (!errors.length) {
    failures.push(...validateRequest(request));
    let sourcePath = '';
    let targetPath = '';
    let patchPath = '';
    let patchReceiptPath = '';
    let approvalPath = '';
    if (!failures.length) {
      try {
        sourcePath = safeRepoPath(request.source_file, srcRoot, 'source_file');
        targetPath = safeRepoPath(request.target_file, srcRoot, 'target_file');
        patchPath = safeRepoPath(request.patch_file, patchDir, 'patch_file');
        patchReceiptPath = safeRepoPath(request.patch_receipt, receiptDir, 'patch_receipt');
        approvalPath = safeRepoPath(request.approval_request, approvalDir, 'approval_request');
      } catch (error) {
        failures.push(error.message);
      }
    }
    if (!failures.length) {
      if (!fs.existsSync(sourcePath)) failures.push(`source_file does not exist: ${request.source_file}`);
      if (!fs.existsSync(targetPath)) failures.push(`target_file does not exist: ${request.target_file}`);
      if (!fs.existsSync(patchPath)) failures.push(`patch_file does not exist: ${request.patch_file}`);
      if (!fs.existsSync(patchReceiptPath)) failures.push(`patch_receipt does not exist: ${request.patch_receipt}`);
    }
    if (!failures.length) {
      const patchText = fs.readFileSync(patchPath, 'utf8');
      const patchLines = patchText.split(/\r?\n/);
      const addedSourceLines = patchLines.filter((line) => line.startsWith('+') && !line.startsWith('+++'));
      const removedSourceLines = patchLines.filter((line) => line.startsWith('-') && !line.startsWith('---'));
      if (!patchText.includes(adapterImport)) failures.push('patch file must add the disabled source adapter import');
      if (addedSourceLines.length !== 1) failures.push('patch file must add exactly one line');
      if (removedSourceLines.length !== 0) failures.push('patch file must not remove source lines');
      state.patch_file_hash = sha256File(patchPath);
    }
    if (!failures.length) {
      const approval = validateApprovalRequest(approvalPath);
      state.approval_request_result = {
        ok: approval.ok,
        status: approval.status,
        approval_required: approval.approval_required,
        file: relativeToRepo(approvalPath),
      };
      failures.push(...approval.failures);

      const patchReceipt = validatePatchReceipt(patchReceiptPath, request);
      state.patch_receipt_result = {
        ok: patchReceipt.ok,
        decision: patchReceipt.decision,
        patch_written: patchReceipt.patch_written,
        target_modified: patchReceipt.target_modified,
        performed_live_action: patchReceipt.performed_live_action,
        file: patchReceipt.file,
      };
      failures.push(...patchReceipt.failures);
    }
    if (!failures.length) {
      state.source_hash = sha256File(sourcePath);
      state.target_hash_before = sha256File(targetPath);
      state.git_apply_check = runGitApplyCheck(patchPath);
      if (!state.git_apply_check.ok) failures.push(`git apply --check failed: ${state.git_apply_check.stderr || state.git_apply_check.stdout || 'no output'}`);
    }
    if (!failures.length) {
      state.gate_results = requiredGates.map(runGate);
      for (const gate of state.gate_results) {
        if (!gate.ok) failures.push(`${gate.id} failed with decision ${gate.decision}`);
      }
    }
    if (!failures.length && args.write) {
      const rollbackPath = rollbackFilePath(args, request);
      assertSafeOutput(rollbackPath, args.rollbackOutDir, 'rollback output');
      const rollbackYaml = buildRollbackYaml(request, state, args);
      fs.mkdirSync(path.dirname(rollbackPath), { recursive: true });
      fs.writeFileSync(rollbackPath, rollbackYaml);
      state.rollback_written = true;
      state.rollback_file = relativeToRepo(rollbackPath);
      state.rollback_file_hash = sha256Text(rollbackYaml);
    } else if (!failures.length) {
      state.rollback_file = relativeToRepo(rollbackFilePath(args, request));
    }
    if (!failures.length) {
      state.target_hash_after = sha256File(targetPath);
      if (state.target_hash_after !== state.target_hash_before) failures.push('target source changed while checking apply readiness');
    }
  }

  const decision = failures.length ? 'block' : 'apply_ready';
  const receipt = errors.length ? null : buildReceipt(request, state, args, decision);
  let file = '';
  let wrote = false;
  if (decision === 'apply_ready' && args.write) {
    file = receiptFilePath(args, request);
    assertSafeOutput(file, args.outDir, 'receipt output');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${JSON.stringify(receipt, null, 2)}\n`);
    wrote = true;
  } else if (decision === 'apply_ready') {
    file = receiptFilePath(args, request);
  }

  return {
    ok: decision === 'apply_ready',
    decision,
    wrote,
    file,
    rollback_file: state.rollback_file,
    rollback_written: state.rollback_written,
    failures,
    warnings: decision === 'apply_ready' ? [
      'apply readiness is local-only and does not apply the patch',
      'rollback plan is preparatory and only useful after a future explicit apply',
      'target source file hash stayed unchanged',
      'no live app, gateway, model, network, route, deploy, arbitrary UI, or durable memory action was performed',
    ] : [],
    request_id: request.id || '',
    surface: request.surface || '',
    approval_scope: request.approval_scope || '',
    performed_live_action: false,
    patch_applied: false,
    target_modified: false,
    git_apply_check: state.git_apply_check,
    gate_results: state.gate_results,
    receipt,
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function selfTest() {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'active-mirror-source-import-apply-'));
  const proposed = gateSourceAdapterImportApply(readJson(defaults.request, 'source adapter import apply request'), {
    ...defaults,
    timestamp: '20260708T000900Z',
    outDir: temp,
    rollbackOutDir: temp,
    write: true,
  });
  assert(proposed.ok, 'source adapter import apply readiness should pass');
  assert(proposed.decision === 'apply_ready', 'source adapter import apply readiness should be apply_ready');
  assert(proposed.rollback_written === true, 'source adapter import apply readiness should write temp rollback');
  assert(proposed.rollback_file.includes(temp), 'self-test rollback should stay in temp');
  assert(proposed.git_apply_check.ok, 'self-test should run git apply --check');

  const blocked = gateSourceAdapterImportApply(readJson(path.join(contractDir, 'source_adapter_import_apply.live_blocked.example.json'), 'blocked source adapter import apply request'), { ...defaults, timestamp: '20260708T000901Z' });
  assert(!blocked.ok, 'live source adapter import apply request should block');
  assert(blocked.failures.some((failure) => failure.includes('apply_patch_enabled')), 'blocked request should fail on apply_patch_enabled');

  const unsafePath = JSON.parse(JSON.stringify(readJson(defaults.request, 'source adapter import apply request')));
  unsafePath.source_adapter_import_apply_request.target_file = '../outside.jsx';
  const unsafe = gateSourceAdapterImportApply(unsafePath, { ...defaults, timestamp: '20260708T000902Z' });
  assert(!unsafe.ok, 'unsafe target path should block');

  return {
    ok: true,
    checks: [
      { name: 'source adapter import apply readiness writes temp rollback', decision: proposed.decision, rollback_written: proposed.rollback_written },
      { name: 'live source adapter import apply blocks', decision: blocked.decision },
      { name: 'unsafe source adapter import apply path blocks', decision: unsafe.decision },
    ],
  };
}

try {
  const args = parseArgs(process.argv.slice(2));
  const result = args.selfTest
    ? selfTest()
    : gateSourceAdapterImportApply(readJson(args.request, 'source adapter import apply request'), args);
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
