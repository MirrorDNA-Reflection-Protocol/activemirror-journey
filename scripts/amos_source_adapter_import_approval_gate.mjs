#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const contractDir = path.join(repoRoot, '.mirror', 'CONTRACTS', 'amos');
const receiptDir = path.join(repoRoot, '.mirror', 'RUNTIME_DRY_RUNS');
const approvalDir = path.join(repoRoot, '.mirror', 'APPROVAL_REQUESTS');

const defaults = {
  request: path.join(contractDir, 'source_adapter_import_approval.bridge.example.json'),
  outDir: receiptDir,
  out: '',
  timestamp: '',
  expect: '',
  write: false,
  dryRun: false,
  selfTest: false,
};

const requiredGates = [
  'guard:source-adapter-import',
  'guard:approval-request',
  'guard:front-door',
  'guard:receipt-chain',
];

const gateCommands = {
  'guard:source-adapter-import': ['scripts/amos_source_adapter_import_gate.mjs', '--self-test'],
  'guard:approval-request': ['scripts/amos_approval_request_gate.mjs', '--self-test'],
  'guard:front-door': ['scripts/front_door_guard.mjs'],
  'guard:receipt-chain': ['scripts/amos_receipt_chain_gate.mjs', '--verify'],
};

const requiredBlockedClaims = [
  'Source adapter import approval was written.',
  'Source adapter import was approved.',
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
  'write_real_approval_request',
  'approve_import',
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
  const request = payload.source_adapter_import_approval_request;
  if (!request || typeof request !== 'object' || Array.isArray(request)) {
    return { errors: ['source_adapter_import_approval_request must be an object'], request: {} };
  }

  if (request.schema_version !== 'source_adapter_import_approval_request.v0_1') errors.push('source_adapter_import_approval_request.schema_version must be source_adapter_import_approval_request.v0_1');
  const id = requireString(request, 'id', 'source_adapter_import_approval_request', errors);
  if (id && !/^[a-z0-9][a-z0-9_-]{2,80}$/.test(id)) errors.push('source_adapter_import_approval_request.id must be a lowercase slug');
  const surface = requireString(request, 'surface', 'source_adapter_import_approval_request', errors);
  const mode = requireString(request, 'mode', 'source_adapter_import_approval_request', errors);
  const adapter = requireString(request, 'adapter', 'source_adapter_import_approval_request', errors);
  const route = requireString(request, 'route', 'source_adapter_import_approval_request', errors);
  const importProposalRequest = requireString(request, 'import_proposal_request', 'source_adapter_import_approval_request', errors);
  const importProposalReceipt = requireString(request, 'import_proposal_receipt', 'source_adapter_import_approval_request', errors);
  const approvalState = requireString(request, 'approval_state', 'source_adapter_import_approval_request', errors);
  const actionRequest = requireString(request, 'action_request', 'source_adapter_import_approval_request', errors);
  const approvalStatus = requireString(request, 'approval_status', 'source_adapter_import_approval_request', errors);
  const requiredGateList = requireStringArray(request, 'required_gates', 'source_adapter_import_approval_request', errors);
  const outputType = requireString(request, 'output_type', 'source_adapter_import_approval_request', errors);
  const claimBoundary = requireStringArray(request, 'claim_boundary', 'source_adapter_import_approval_request', errors);
  const blockedClaims = requireStringArray(request, 'blocked_claims', 'source_adapter_import_approval_request', errors);

  for (const key of ['approval_write_enabled', 'apply_import_enabled', 'live_import_enabled']) {
    if (typeof request[key] !== 'boolean') errors.push(`source_adapter_import_approval_request.${key} must be boolean`);
  }

  return {
    errors,
    request: {
      id,
      surface,
      mode,
      adapter,
      route,
      import_proposal_request: importProposalRequest,
      import_proposal_receipt: importProposalReceipt,
      approval_state: approvalState,
      action_request: actionRequest,
      approval_write_enabled: request.approval_write_enabled,
      apply_import_enabled: request.apply_import_enabled,
      live_import_enabled: request.live_import_enabled,
      approval_status: approvalStatus,
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

function runSourceAdapterImportGate(requestPath) {
  const { parsed, ok } = runCommand(['scripts/amos_source_adapter_import_gate.mjs', '--request', requestPath, '--expect', 'approval_required']);
  return {
    ok,
    decision: parsed?.decision || (ok ? 'approval_required' : 'fail'),
    request_id: parsed?.request_id || '',
    active_import_count: parsed?.import_scan?.active_import_count ?? -1,
  };
}

function runApprovalDryRun(statePath, actionPath) {
  const { parsed, ok } = runCommand([
    'scripts/amos_approval_request_gate.mjs',
    '--state',
    statePath,
    '--action',
    actionPath,
    '--dry-run',
  ]);
  return {
    ok,
    decision: parsed?.decision || (ok ? 'approval_required' : 'fail'),
    would_write: parsed?.would_write ? relativeToRepo(parsed.would_write) : '',
    approval_required: parsed?.approval_request?.approval_required === true,
    status: parsed?.approval_request?.status || '',
    raw: parsed,
  };
}

function validateRequest(request) {
  const failures = [];
  if (request.surface !== 'consumer_app') failures.push(`surface must be consumer_app; got ${request.surface}`);
  if (request.mode !== 'approval_request_bridge') failures.push(`mode must be approval_request_bridge; got ${request.mode}`);
  if (request.adapter !== 'amos_disabled_source_adapter') failures.push(`adapter must be amos_disabled_source_adapter; got ${request.adapter}`);
  if (request.route !== '/app/') failures.push(`route must be /app/; got ${request.route}`);
  if (request.approval_write_enabled !== false) failures.push('approval_write_enabled must be false');
  if (request.apply_import_enabled !== false) failures.push('apply_import_enabled must be false');
  if (request.live_import_enabled !== false) failures.push('live_import_enabled must be false');
  if (request.approval_status !== 'pending') failures.push('approval_status must be pending');
  if (request.output_type !== 'source_adapter_import_approval_receipt') failures.push(`output_type must be source_adapter_import_approval_receipt; got ${request.output_type}`);
  for (const missing of missingFrom(request.required_gates, requiredGates)) failures.push(`missing required gate ${missing}`);
  for (const missing of missingFrom(request.blocked_claims, requiredBlockedClaims)) failures.push(`missing blocked claim ${missing}`);
  if (!request.claim_boundary.some((claim) => /approval-request bridge only/i.test(claim))) failures.push('claim_boundary must state this is an approval-request bridge only');
  if (!request.claim_boundary.some((claim) => /without writing a real approval file/i.test(claim))) failures.push('claim_boundary must state this does not write a real approval file');
  if (!request.claim_boundary.some((claim) => /does not approve/i.test(claim))) failures.push('claim_boundary must state this does not approve the import');
  if (!request.claim_boundary.some((claim) => /does not import/i.test(claim))) failures.push('claim_boundary must state this does not import the adapter');
  return failures;
}

function validateImportProposalReceipt(receiptPath) {
  const payload = readJson(receiptPath, 'source adapter import proposal receipt');
  const receipt = payload.source_adapter_import_receipt || {};
  const failures = [];
  if (receipt.schema_version !== 'source_adapter_import_receipt.v0_1') failures.push('import proposal receipt schema_version is invalid');
  if (receipt.decision !== 'approval_required') failures.push('import proposal receipt decision must be approval_required');
  if (receipt.approval_required !== true) failures.push('import proposal receipt must require approval');
  if (receipt.approval_status !== 'pending') failures.push('import proposal receipt approval_status must be pending');
  if (receipt.performed_live_action !== false) failures.push('import proposal receipt must perform no live action');
  if (receipt.import_scan?.active_import_count !== 0) failures.push('import proposal receipt must show zero active imports');
  const proposedTargetFiles = Array.isArray(receipt.target_files)
    ? receipt.target_files.map((item) => item.file).filter(Boolean)
    : [];
  if (!proposedTargetFiles.length) failures.push('import proposal receipt must include proposed target files');
  return { failures, proposedTargetFiles };
}

function buildReceipt(request, importProposalResult, approvalPreview, proposedTargetFiles, gateResults, args, decision) {
  const now = stamp(args);
  return {
    source_adapter_import_approval_receipt: {
      schema_version: 'source_adapter_import_approval_receipt.v0_1',
      id: `source_adapter_import_approval_receipt_${now.replace(/[^0-9TZ]/g, '').toLowerCase()}_${request.id}`,
      request_id: request.id,
      created_at: isoFromStamp(now),
      decision,
      approval_required: true,
      approval_status: 'pending',
      approval_written: false,
      performed_live_action: false,
      checked_scope: [
        'source_adapter_import_approval_request_shape',
        'source_adapter_import_proposal_receipt',
        'source_adapter_import_gate',
        'approval_request_dry_run',
        'no_real_approval_file_write',
        'no_import_apply',
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
      gate_results: gateResults,
      import_proposal_result: {
        ok: importProposalResult.ok,
        decision: importProposalResult.decision,
        request_id: importProposalResult.request_id,
        active_import_count: importProposalResult.active_import_count,
      },
      approval_request_preview: {
        ok: approvalPreview.ok,
        decision: approvalPreview.decision,
        would_write: approvalPreview.would_write || '.mirror/APPROVAL_REQUESTS/pending.yaml',
        approval_required: approvalPreview.approval_required,
        status: approvalPreview.status || 'pending',
      },
      proposed_target_files: proposedTargetFiles,
      blocked_capabilities: blockedCapabilities,
      output: {
        type: 'source_adapter_import_approval_receipt',
        message: decision === 'approval_required'
          ? 'Approval bridge preview is ready, but no approval file was written and no import was applied.'
          : 'Source adapter import approval bridge blocked without live action.',
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

function gateSourceAdapterImportApproval(payload, args) {
  const { errors, request } = validateShape(payload);
  const failures = [...errors];
  let gateResults = [];
  let importProposalResult = { ok: false, decision: 'not_run', request_id: '', active_import_count: -1 };
  let approvalPreview = { ok: false, decision: 'not_run', would_write: '', approval_required: false, status: '' };
  let proposedTargetFiles = [];

  if (!errors.length) {
    failures.push(...validateRequest(request));
    let importProposalRequestPath = '';
    let importProposalReceiptPath = '';
    let approvalStatePath = '';
    let actionRequestPath = '';
    if (!failures.length) {
      try {
        importProposalRequestPath = safeRepoPath(request.import_proposal_request, contractDir, 'import_proposal_request');
        importProposalReceiptPath = safeRepoPath(request.import_proposal_receipt, receiptDir, 'import_proposal_receipt');
        approvalStatePath = safeRepoPath(request.approval_state, contractDir, 'approval_state');
        actionRequestPath = safeRepoPath(request.action_request, contractDir, 'action_request');
      } catch (error) {
        failures.push(error.message);
      }
    }
    if (!failures.length) {
      for (const [label, filePath] of [
        ['import_proposal_request', importProposalRequestPath],
        ['import_proposal_receipt', importProposalReceiptPath],
        ['approval_state', approvalStatePath],
        ['action_request', actionRequestPath],
      ]) {
        if (!fs.existsSync(filePath)) failures.push(`${label} does not exist: ${relativeToRepo(filePath)}`);
      }
    }
    if (!failures.length) {
      const receiptCheck = validateImportProposalReceipt(importProposalReceiptPath);
      failures.push(...receiptCheck.failures);
      proposedTargetFiles = receiptCheck.proposedTargetFiles;
    }
    if (!failures.length) {
      importProposalResult = runSourceAdapterImportGate(importProposalRequestPath);
      if (!importProposalResult.ok || importProposalResult.decision !== 'approval_required') failures.push(`source adapter import gate failed with decision ${importProposalResult.decision}`);
      if (importProposalResult.active_import_count !== 0) failures.push('source adapter import gate found active imports');
    }
    if (!failures.length) {
      approvalPreview = runApprovalDryRun(approvalStatePath, actionRequestPath);
      if (!approvalPreview.ok || approvalPreview.decision !== 'approval_required') failures.push(`approval request dry-run failed with decision ${approvalPreview.decision}`);
      if (!approvalPreview.approval_required || approvalPreview.status !== 'pending') failures.push('approval request dry-run must produce a pending approval request');
      if (!approvalPreview.would_write.startsWith('.mirror/APPROVAL_REQUESTS/')) failures.push('approval request dry-run would_write must target .mirror/APPROVAL_REQUESTS');
      if (approvalPreview.raw?.wrote) failures.push('approval request dry-run must not write a file');
      if (approvalPreview.raw?.file) failures.push('approval request dry-run must not report a written file');
      if (approvalPreview.raw?.file && fs.existsSync(path.resolve(repoRoot, approvalPreview.raw.file))) failures.push('approval request dry-run wrote a real file');
    }
    if (!failures.length) {
      gateResults = requiredGates.map(runGate);
      for (const gate of gateResults) {
        if (!gate.ok) failures.push(`${gate.id} failed with decision ${gate.decision}`);
      }
    }
  }

  const decision = failures.length ? 'block' : 'approval_required';
  const receipt = errors.length ? null : buildReceipt(request, importProposalResult, approvalPreview, proposedTargetFiles, gateResults, args, decision);
  let file = '';
  let wrote = false;
  if (decision === 'approval_required' && args.write) {
    file = receiptFilePath(args, request);
    assertSafeOut(file);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${JSON.stringify(receipt, null, 2)}\n`);
    wrote = true;
  } else if (decision === 'approval_required') {
    file = receiptFilePath(args, request);
  }

  return {
    ok: decision === 'approval_required',
    decision,
    wrote,
    file,
    failures,
    warnings: decision === 'approval_required' ? [
      'approval bridge preview is ready but no real approval file was written',
      'source adapter import remains pending and unapplied',
      'no live app, gateway, model, network, route, deploy, arbitrary UI, or durable memory action was performed',
    ] : [],
    request_id: request.id || '',
    surface: request.surface || '',
    approval_required: true,
    approval_status: 'pending',
    approval_written: false,
    approval_dir: relativeToRepo(approvalDir),
    performed_live_action: false,
    import_proposal_result: importProposalResult,
    approval_request_preview: {
      ok: approvalPreview.ok,
      decision: approvalPreview.decision,
      would_write: approvalPreview.would_write,
      approval_required: approvalPreview.approval_required,
      status: approvalPreview.status,
    },
    gate_results: gateResults,
    receipt,
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function selfTest() {
  const proposed = gateSourceAdapterImportApproval(readJson(defaults.request, 'source adapter import approval request'), { ...defaults, timestamp: '20260707T000600Z' });
  assert(proposed.ok, 'source adapter import approval bridge should pass as approval_required');
  assert(proposed.decision === 'approval_required', 'source adapter import approval bridge should require approval');
  assert(proposed.approval_written === false, 'approval bridge should not write real approval');

  const blocked = gateSourceAdapterImportApproval(readJson(path.join(contractDir, 'source_adapter_import_approval.live_blocked.example.json'), 'blocked source adapter import approval request'), { ...defaults, timestamp: '20260707T000601Z' });
  assert(!blocked.ok, 'live source adapter import approval request should block');
  assert(blocked.failures.some((failure) => failure.includes('approval_write_enabled')), 'blocked request should fail on approval write');

  const unsafePath = JSON.parse(JSON.stringify(readJson(defaults.request, 'source adapter import approval request')));
  unsafePath.source_adapter_import_approval_request.import_proposal_receipt = '../outside.json';
  const unsafe = gateSourceAdapterImportApproval(unsafePath, { ...defaults, timestamp: '20260707T000602Z' });
  assert(!unsafe.ok, 'unsafe receipt path should block');

  return {
    ok: true,
    checks: [
      { name: 'source adapter import approval bridge requires approval', decision: proposed.decision },
      { name: 'live source adapter import approval request blocks', decision: blocked.decision },
      { name: 'unsafe approval bridge path blocks', decision: unsafe.decision },
    ],
  };
}

try {
  const args = parseArgs(process.argv.slice(2));
  const result = args.selfTest
    ? selfTest()
    : gateSourceAdapterImportApproval(readJson(args.request, 'source adapter import approval request'), args);
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
