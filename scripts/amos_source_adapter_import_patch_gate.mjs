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
const srcRoot = path.join(repoRoot, 'src');

const defaults = {
  request: path.join(contractDir, 'source_adapter_import_patch.request.example.json'),
  outDir: receiptDir,
  patchOutDir: patchDir,
  out: '',
  patchOut: '',
  timestamp: '',
  expect: '',
  write: false,
  dryRun: false,
  selfTest: false,
};

const requiredGates = [
  'guard:source-adapter-import-approval-create',
  'guard:front-door',
  'guard:receipt-chain',
];

const gateCommands = {
  'guard:source-adapter-import-approval-create': ['scripts/amos_source_adapter_import_approval_create_gate.mjs', '--self-test'],
  'guard:front-door': ['scripts/front_door_guard.mjs'],
  'guard:receipt-chain': ['scripts/amos_receipt_chain_gate.mjs', '--verify'],
};

const requiredBlockedClaims = [
  'Source adapter import patch was applied.',
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

const importAnchor = "import { copyText } from '../lib/sendable-actions';";
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
  const request = payload.source_adapter_import_patch_request;
  if (!request || typeof request !== 'object' || Array.isArray(request)) {
    return { errors: ['source_adapter_import_patch_request must be an object'], request: {} };
  }

  if (request.schema_version !== 'source_adapter_import_patch_request.v0_1') errors.push('source_adapter_import_patch_request.schema_version must be source_adapter_import_patch_request.v0_1');
  const id = requireString(request, 'id', 'source_adapter_import_patch_request', errors);
  if (id && !/^[a-z0-9][a-z0-9_-]{2,80}$/.test(id)) errors.push('source_adapter_import_patch_request.id must be a lowercase slug');
  const surface = requireString(request, 'surface', 'source_adapter_import_patch_request', errors);
  const mode = requireString(request, 'mode', 'source_adapter_import_patch_request', errors);
  const adapter = requireString(request, 'adapter', 'source_adapter_import_patch_request', errors);
  const route = requireString(request, 'route', 'source_adapter_import_patch_request', errors);
  const sourceFile = requireString(request, 'source_file', 'source_adapter_import_patch_request', errors);
  const targetFile = requireString(request, 'target_file', 'source_adapter_import_patch_request', errors);
  const pendingApprovalRequest = requireString(request, 'pending_approval_request', 'source_adapter_import_patch_request', errors);
  const approvalCreateReceipt = requireString(request, 'approval_create_receipt', 'source_adapter_import_patch_request', errors);
  const approvalBasis = requireString(request, 'approval_basis', 'source_adapter_import_patch_request', errors);
  const approvalScope = requireString(request, 'approval_scope', 'source_adapter_import_patch_request', errors);
  const requiredGateList = requireStringArray(request, 'required_gates', 'source_adapter_import_patch_request', errors);
  const outputType = requireString(request, 'output_type', 'source_adapter_import_patch_request', errors);
  const claimBoundary = requireStringArray(request, 'claim_boundary', 'source_adapter_import_patch_request', errors);
  const blockedClaims = requireStringArray(request, 'blocked_claims', 'source_adapter_import_patch_request', errors);

  for (const key of ['write_patch_enabled', 'apply_import_enabled', 'live_import_enabled', 'model_call_enabled', 'network_enabled', 'durable_memory_write_enabled', 'route_change_enabled', 'gateway_change_enabled', 'public_deploy_enabled', 'arbitrary_ui_enabled']) {
    if (typeof request[key] !== 'boolean') errors.push(`source_adapter_import_patch_request.${key} must be boolean`);
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
      pending_approval_request: pendingApprovalRequest,
      approval_create_receipt: approvalCreateReceipt,
      approval_basis: approvalBasis,
      approval_scope: approvalScope,
      write_patch_enabled: request.write_patch_enabled,
      apply_import_enabled: request.apply_import_enabled,
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
  return { parsed, ok };
}

function runGate(id) {
  const command = gateCommands[id];
  if (!command) return { id, ok: false, decision: 'missing_command' };
  const { parsed, ok } = runCommand(command);
  const decision = parsed?.decision || (ok ? 'pass' : 'fail');
  return { id, ok, decision };
}

function validateApprovalRequest(filePath) {
  const failures = [];
  if (!fs.existsSync(filePath)) return { ok: false, status: '', approval_required: false, failures: [`pending approval request missing: ${relativeToRepo(filePath)}`] };
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
  if (status !== 'pending') failures.push(`approval request status must remain pending for patch proposal; got ${status || 'missing'}`);
  if (!approvalRequired) failures.push('approval request must require approval');
  return {
    ok: failures.length === 0,
    status,
    approval_required: approvalRequired,
    failures,
  };
}

function validateApprovalCreateReceipt(filePath) {
  const failures = [];
  if (!fs.existsSync(filePath)) return { ok: false, decision: '', approval_written: false, performed_live_action: true, failures: [`approval creation receipt missing: ${relativeToRepo(filePath)}`] };
  const payload = readJson(filePath, 'source adapter import approval creation receipt');
  const receipt = payload.source_adapter_import_approval_create_receipt || {};
  if (receipt.schema_version !== 'source_adapter_import_approval_create_receipt.v0_1') failures.push('approval creation receipt schema_version is invalid');
  if (receipt.decision !== 'approval_required') failures.push('approval creation receipt decision must be approval_required');
  if (receipt.approval_written !== true) failures.push('approval creation receipt must show approval request file was written');
  if (receipt.approval_status !== 'pending') failures.push('approval creation receipt approval_status must be pending');
  if (receipt.performed_live_action !== false) failures.push('approval creation receipt must perform no live action');
  return {
    ok: failures.length === 0,
    decision: receipt.decision || '',
    approval_written: receipt.approval_written === true,
    performed_live_action: receipt.performed_live_action === true,
    file: relativeToRepo(filePath),
    failures,
  };
}

function validateRequest(request) {
  const failures = [];
  if (request.surface !== 'consumer_app') failures.push(`surface must be consumer_app; got ${request.surface}`);
  if (request.mode !== 'patch_proposal_only') failures.push(`mode must be patch_proposal_only; got ${request.mode}`);
  if (request.adapter !== 'amos_disabled_source_adapter') failures.push(`adapter must be amos_disabled_source_adapter; got ${request.adapter}`);
  if (request.route !== '/app/') failures.push(`route must be /app/; got ${request.route}`);
  if (request.source_file !== 'src/lib/amos-disabled-source-adapter.js') failures.push('source_file must be src/lib/amos-disabled-source-adapter.js');
  if (request.target_file !== 'src/pages/HomePage.jsx') failures.push('target_file must be src/pages/HomePage.jsx');
  if (request.approval_scope !== 'patch_proposal_only') failures.push('approval_scope must be patch_proposal_only');
  if (request.approval_basis !== 'user_chat_go_after_pending_request') failures.push('approval_basis must be user_chat_go_after_pending_request');
  if (request.write_patch_enabled !== true) failures.push('write_patch_enabled must be true');
  if (request.apply_import_enabled !== false) failures.push('apply_import_enabled must be false');
  if (request.live_import_enabled !== false) failures.push('live_import_enabled must be false');
  if (request.model_call_enabled !== false) failures.push('model_call_enabled must be false');
  if (request.network_enabled !== false) failures.push('network_enabled must be false');
  if (request.durable_memory_write_enabled !== false) failures.push('durable_memory_write_enabled must be false');
  if (request.route_change_enabled !== false) failures.push('route_change_enabled must be false');
  if (request.gateway_change_enabled !== false) failures.push('gateway_change_enabled must be false');
  if (request.public_deploy_enabled !== false) failures.push('public_deploy_enabled must be false');
  if (request.arbitrary_ui_enabled !== false) failures.push('arbitrary_ui_enabled must be false');
  if (request.output_type !== 'source_adapter_import_patch_receipt') failures.push(`output_type must be source_adapter_import_patch_receipt; got ${request.output_type}`);
  for (const missing of missingFrom(request.required_gates, requiredGates)) failures.push(`missing required gate ${missing}`);
  for (const missing of missingFrom(request.blocked_claims, requiredBlockedClaims)) failures.push(`missing blocked claim ${missing}`);
  if (!request.claim_boundary.some((claim) => /local patch proposal file only/i.test(claim))) failures.push('claim_boundary must state this creates a local patch proposal file only');
  if (!request.claim_boundary.some((claim) => /does not apply/i.test(claim))) failures.push('claim_boundary must state this does not apply the patch');
  if (!request.claim_boundary.some((claim) => /does not import/i.test(claim))) failures.push('claim_boundary must state this does not import the adapter');
  if (!request.claim_boundary.some((claim) => /does not grant approval/i.test(claim))) failures.push('claim_boundary must state this does not grant approval to ship or deploy');
  return failures;
}

function buildPatch(targetPath) {
  const text = fs.readFileSync(targetPath, 'utf8');
  if (text.includes(adapterImport)) throw new Error('target already contains adapter import');
  const lines = text.split(/\r?\n/);
  const anchorIndex = lines.indexOf(importAnchor);
  if (anchorIndex < 0) throw new Error(`target import anchor missing: ${importAnchor}`);
  const start = Math.max(0, anchorIndex - 2);
  const end = Math.min(lines.length - 1, anchorIndex + 1);
  const contextLines = lines.slice(start, end + 1);
  const targetRel = relativeToRepo(targetPath);
  const hunk = [
    `diff --git a/${targetRel} b/${targetRel}`,
    `--- a/${targetRel}`,
    `+++ b/${targetRel}`,
    `@@ -${start + 1},${contextLines.length} +${start + 1},${contextLines.length + 1} @@`,
    ...contextLines.flatMap((line) => (line === importAnchor ? [` ${line}`, `+${adapterImport}`] : [` ${line}`])),
    '',
  ];
  return hunk.join('\n');
}

function patchFilePath(args, request) {
  if (args.patchOut) return args.patchOut;
  return path.join(args.patchOutDir, `${stamp(args)}-${request.id}.diff`);
}

function receiptFilePath(args, request) {
  if (args.out) return args.out;
  return path.join(args.outDir, `${stamp(args)}-${request.id}.json`);
}

function assertSafeOutput(filePath, root, label) {
  const target = path.resolve(filePath);
  const relative = path.relative(path.resolve(root), target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label} must stay under ${path.resolve(root)}`);
  }
}

function buildReceipt(request, state, args, decision) {
  const now = stamp(args);
  const patchHash = state.patch_written && state.patch_file_path && fs.existsSync(state.patch_file_path)
    ? sha256File(state.patch_file_path)
    : state.patch_text
      ? sha256Text(state.patch_text)
      : '';
  return {
    source_adapter_import_patch_receipt: {
      schema_version: 'source_adapter_import_patch_receipt.v0_1',
      id: `source_adapter_import_patch_receipt_${now.replace(/[^0-9TZ]/g, '').toLowerCase()}_${request.id}`,
      request_id: request.id,
      created_at: isoFromStamp(now),
      decision,
      approval_scope: 'patch_proposal_only',
      patch_written: state.patch_written,
      patch_file: state.patch_file || '',
      patch_file_hash: patchHash,
      target_file: request.target_file,
      target_hash_before: state.target_hash_before || '0'.repeat(64),
      target_hash_after: state.target_hash_after || '0'.repeat(64),
      target_modified: false,
      source_file: request.source_file,
      source_hash: state.source_hash || '0'.repeat(64),
      performed_live_action: false,
      checked_scope: [
        'source_adapter_import_patch_request_shape',
        'pending_approval_request_file',
        'approval_creation_receipt',
        'source_file_exists',
        'target_file_exists',
        'target_import_anchor',
        'patch_file_write',
        'target_hash_unchanged',
        'no_apply_patch',
        'no_apply_import',
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
      approval_create_result: state.approval_create_result,
      patch_summary: {
        kind: 'import_line_only',
        adds_import: true,
        applies_patch: false,
      },
      blocked_capabilities: blockedCapabilities,
      output: {
        type: 'source_adapter_import_patch_receipt',
        message: state.patch_written
          ? 'Patch proposal file was created, but no source file was changed and no import was applied.'
          : 'Patch proposal can be created, but no source file was changed and no import was applied.',
      },
    },
  };
}

function gateSourceAdapterImportPatch(payload, args) {
  const { errors, request } = validateShape(payload);
  const failures = [...errors];
  const state = {
    patch_text: '',
    patch_written: false,
    patch_file: '',
    patch_file_path: '',
    target_hash_before: '',
    target_hash_after: '',
    source_hash: '',
    gate_results: [],
    approval_request_result: { ok: false, status: '', approval_required: false, file: '' },
    approval_create_result: { ok: false, decision: '', approval_written: false, performed_live_action: true, file: '' },
  };

  if (!errors.length) {
    failures.push(...validateRequest(request));
    let sourcePath = '';
    let targetPath = '';
    let approvalPath = '';
    let approvalReceiptPath = '';
    if (!failures.length) {
      try {
        sourcePath = safeRepoPath(request.source_file, srcRoot, 'source_file');
        targetPath = safeRepoPath(request.target_file, srcRoot, 'target_file');
        approvalPath = safeRepoPath(request.pending_approval_request, approvalDir, 'pending_approval_request');
        approvalReceiptPath = safeRepoPath(request.approval_create_receipt, receiptDir, 'approval_create_receipt');
      } catch (error) {
        failures.push(error.message);
      }
    }
    if (!failures.length) {
      if (!fs.existsSync(sourcePath)) failures.push(`source_file does not exist: ${request.source_file}`);
      if (!fs.existsSync(targetPath)) failures.push(`target_file does not exist: ${request.target_file}`);
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

      const approvalCreate = validateApprovalCreateReceipt(approvalReceiptPath);
      state.approval_create_result = {
        ok: approvalCreate.ok,
        decision: approvalCreate.decision,
        approval_written: approvalCreate.approval_written,
        performed_live_action: approvalCreate.performed_live_action,
        file: approvalCreate.file,
      };
      failures.push(...approvalCreate.failures);
    }
    if (!failures.length) {
      state.source_hash = sha256File(sourcePath);
      state.target_hash_before = sha256File(targetPath);
      try {
        state.patch_text = buildPatch(targetPath);
      } catch (error) {
        failures.push(error.message);
      }
    }
    if (!failures.length) {
      state.gate_results = requiredGates.map(runGate);
      for (const gate of state.gate_results) {
        if (!gate.ok) failures.push(`${gate.id} failed with decision ${gate.decision}`);
      }
    }
    if (!failures.length && args.write) {
      state.patch_file_path = patchFilePath(args, request);
      assertSafeOutput(state.patch_file_path, args.patchOutDir, 'patch output');
      fs.mkdirSync(path.dirname(state.patch_file_path), { recursive: true });
      fs.writeFileSync(state.patch_file_path, state.patch_text);
      state.patch_written = true;
      state.patch_file = relativeToRepo(state.patch_file_path);
    } else if (!failures.length) {
      state.patch_file_path = patchFilePath(args, request);
      state.patch_file = relativeToRepo(state.patch_file_path);
    }
    if (!failures.length) {
      state.target_hash_after = sha256File(targetPath);
      if (state.target_hash_after !== state.target_hash_before) failures.push('target source changed while preparing patch proposal');
    }
  }

  const decision = failures.length ? 'block' : 'patch_prepared';
  const receipt = errors.length ? null : buildReceipt(request, state, args, decision);
  let file = '';
  let wrote = false;
  if (decision === 'patch_prepared' && args.write) {
    file = receiptFilePath(args, request);
    assertSafeOutput(file, args.outDir, 'receipt output');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${JSON.stringify(receipt, null, 2)}\n`);
    wrote = true;
  } else if (decision === 'patch_prepared') {
    file = receiptFilePath(args, request);
  }

  return {
    ok: decision === 'patch_prepared',
    decision,
    wrote,
    file,
    patch_file: state.patch_file,
    patch_written: state.patch_written,
    failures,
    warnings: decision === 'patch_prepared' ? [
      'patch proposal is local-only and not applied',
      'pending approval request is not approval to deploy',
      'target source file hash stayed unchanged',
      'no live app, gateway, model, network, route, deploy, arbitrary UI, or durable memory action was performed',
    ] : [],
    request_id: request.id || '',
    surface: request.surface || '',
    approval_scope: request.approval_scope || '',
    performed_live_action: false,
    target_modified: false,
    gate_results: state.gate_results,
    receipt,
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function selfTest() {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'active-mirror-source-import-patch-'));
  const proposed = gateSourceAdapterImportPatch(readJson(defaults.request, 'source adapter import patch request'), {
    ...defaults,
    timestamp: '20260707T000800Z',
    outDir: temp,
    patchOutDir: temp,
    write: true,
  });
  assert(proposed.ok, 'source adapter import patch should pass as patch_prepared');
  assert(proposed.decision === 'patch_prepared', 'source adapter import patch should prepare a patch');
  assert(proposed.patch_written === true, 'source adapter import patch should write a temp patch');
  assert(proposed.patch_file.includes(temp), 'self-test patch should stay in temp');

  const blocked = gateSourceAdapterImportPatch(readJson(path.join(contractDir, 'source_adapter_import_patch.live_blocked.example.json'), 'blocked source adapter import patch request'), { ...defaults, timestamp: '20260707T000801Z' });
  assert(!blocked.ok, 'live source adapter import patch request should block');
  assert(blocked.failures.some((failure) => failure.includes('apply_import_enabled')), 'blocked request should fail on apply import');

  const unsafePath = JSON.parse(JSON.stringify(readJson(defaults.request, 'source adapter import patch request')));
  unsafePath.source_adapter_import_patch_request.target_file = '../outside.jsx';
  const unsafe = gateSourceAdapterImportPatch(unsafePath, { ...defaults, timestamp: '20260707T000802Z' });
  assert(!unsafe.ok, 'unsafe target path should block');

  return {
    ok: true,
    checks: [
      { name: 'source adapter import patch writes temp proposal', decision: proposed.decision, patch_written: proposed.patch_written },
      { name: 'live source adapter import patch blocks', decision: blocked.decision },
      { name: 'unsafe source adapter import patch path blocks', decision: unsafe.decision },
    ],
  };
}

try {
  const args = parseArgs(process.argv.slice(2));
  const result = args.selfTest
    ? selfTest()
    : gateSourceAdapterImportPatch(readJson(args.request, 'source adapter import patch request'), args);
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
