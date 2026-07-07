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
const approvalDir = path.join(repoRoot, '.mirror', 'APPROVAL_REQUESTS');

const defaults = {
  request: path.join(contractDir, 'source_adapter_import_approval_create.request.example.json'),
  outDir: receiptDir,
  approvalOutDir: approvalDir,
  out: '',
  timestamp: '',
  expect: '',
  write: false,
  dryRun: false,
  selfTest: false,
};

const requiredGates = [
  'guard:source-adapter-import-approval',
  'guard:approval-request',
  'guard:front-door',
  'guard:receipt-chain',
];

const gateCommands = {
  'guard:source-adapter-import-approval': ['scripts/amos_source_adapter_import_approval_gate.mjs', '--self-test'],
  'guard:approval-request': ['scripts/amos_approval_request_gate.mjs', '--self-test'],
  'guard:front-door': ['scripts/front_door_guard.mjs'],
  'guard:receipt-chain': ['scripts/amos_receipt_chain_gate.mjs', '--verify'],
};

const requiredBlockedClaims = [
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
  const request = payload.source_adapter_import_approval_create_request;
  if (!request || typeof request !== 'object' || Array.isArray(request)) {
    return { errors: ['source_adapter_import_approval_create_request must be an object'], request: {} };
  }

  if (request.schema_version !== 'source_adapter_import_approval_create_request.v0_1') errors.push('source_adapter_import_approval_create_request.schema_version must be source_adapter_import_approval_create_request.v0_1');
  const id = requireString(request, 'id', 'source_adapter_import_approval_create_request', errors);
  if (id && !/^[a-z0-9][a-z0-9_-]{2,80}$/.test(id)) errors.push('source_adapter_import_approval_create_request.id must be a lowercase slug');
  const surface = requireString(request, 'surface', 'source_adapter_import_approval_create_request', errors);
  const mode = requireString(request, 'mode', 'source_adapter_import_approval_create_request', errors);
  const adapter = requireString(request, 'adapter', 'source_adapter_import_approval_create_request', errors);
  const route = requireString(request, 'route', 'source_adapter_import_approval_create_request', errors);
  const approvalBridgeRequest = requireString(request, 'approval_bridge_request', 'source_adapter_import_approval_create_request', errors);
  const approvalBridgeReceipt = requireString(request, 'approval_bridge_receipt', 'source_adapter_import_approval_create_request', errors);
  const approvalState = requireString(request, 'approval_state', 'source_adapter_import_approval_create_request', errors);
  const actionRequest = requireString(request, 'action_request', 'source_adapter_import_approval_create_request', errors);
  const approvalStatus = requireString(request, 'approval_status', 'source_adapter_import_approval_create_request', errors);
  const requiredGateList = requireStringArray(request, 'required_gates', 'source_adapter_import_approval_create_request', errors);
  const outputType = requireString(request, 'output_type', 'source_adapter_import_approval_create_request', errors);
  const claimBoundary = requireStringArray(request, 'claim_boundary', 'source_adapter_import_approval_create_request', errors);
  const blockedClaims = requireStringArray(request, 'blocked_claims', 'source_adapter_import_approval_create_request', errors);

  for (const key of ['approval_write_enabled', 'apply_import_enabled', 'live_import_enabled']) {
    if (typeof request[key] !== 'boolean') errors.push(`source_adapter_import_approval_create_request.${key} must be boolean`);
  }

  return {
    errors,
    request: {
      id,
      surface,
      mode,
      adapter,
      route,
      approval_bridge_request: approvalBridgeRequest,
      approval_bridge_receipt: approvalBridgeReceipt,
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

function runApprovalBridge(requestPath) {
  const { parsed, ok } = runCommand(['scripts/amos_source_adapter_import_approval_gate.mjs', '--request', requestPath, '--expect', 'approval_required']);
  return {
    ok,
    decision: parsed?.decision || (ok ? 'approval_required' : 'fail'),
    approval_written: parsed?.approval_written === true,
  };
}

function runApprovalRequest(statePath, actionPath, args) {
  const command = [
    'scripts/amos_approval_request_gate.mjs',
    '--state',
    statePath,
    '--action',
    actionPath,
    '--timestamp',
    stamp(args),
  ];
  if (args.write) command.push('--write');
  else command.push('--dry-run');
  if (args.approvalOutDir) command.push('--outDir', args.approvalOutDir);

  const { parsed, ok } = runCommand(command);
  return {
    ok,
    decision: parsed?.decision || (ok ? 'approval_required' : 'fail'),
    wrote: parsed?.wrote === true,
    file: parsed?.file ? relativeToRepo(parsed.file) : '',
    would_write: parsed?.would_write ? relativeToRepo(parsed.would_write) : '',
    approval_required: parsed?.approval_request?.approval_required === true,
    status: parsed?.approval_request?.status || '',
  };
}

function validateRequest(request) {
  const failures = [];
  if (request.surface !== 'consumer_app') failures.push(`surface must be consumer_app; got ${request.surface}`);
  if (request.mode !== 'real_approval_request_creation') failures.push(`mode must be real_approval_request_creation; got ${request.mode}`);
  if (request.adapter !== 'amos_disabled_source_adapter') failures.push(`adapter must be amos_disabled_source_adapter; got ${request.adapter}`);
  if (request.route !== '/app/') failures.push(`route must be /app/; got ${request.route}`);
  if (request.approval_write_enabled !== true) failures.push('approval_write_enabled must be true');
  if (request.apply_import_enabled !== false) failures.push('apply_import_enabled must be false');
  if (request.live_import_enabled !== false) failures.push('live_import_enabled must be false');
  if (request.approval_status !== 'pending') failures.push('approval_status must be pending');
  if (request.output_type !== 'source_adapter_import_approval_create_receipt') failures.push(`output_type must be source_adapter_import_approval_create_receipt; got ${request.output_type}`);
  for (const missing of missingFrom(request.required_gates, requiredGates)) failures.push(`missing required gate ${missing}`);
  for (const missing of missingFrom(request.blocked_claims, requiredBlockedClaims)) failures.push(`missing blocked claim ${missing}`);
  if (!request.claim_boundary.some((claim) => /pending approval request file only/i.test(claim))) failures.push('claim_boundary must state this creates a pending approval request file only');
  if (!request.claim_boundary.some((claim) => /does not approve/i.test(claim))) failures.push('claim_boundary must state this does not approve the import');
  if (!request.claim_boundary.some((claim) => /does not apply/i.test(claim))) failures.push('claim_boundary must state this does not apply the import');
  if (!request.claim_boundary.some((claim) => /does not import/i.test(claim))) failures.push('claim_boundary must state this does not import the adapter');
  return failures;
}

function validateApprovalBridgeReceipt(receiptPath) {
  const payload = readJson(receiptPath, 'source adapter import approval bridge receipt');
  const receipt = payload.source_adapter_import_approval_receipt || {};
  const failures = [];
  if (receipt.schema_version !== 'source_adapter_import_approval_receipt.v0_1') failures.push('approval bridge receipt schema_version is invalid');
  if (receipt.decision !== 'approval_required') failures.push('approval bridge receipt decision must be approval_required');
  if (receipt.approval_required !== true) failures.push('approval bridge receipt must require approval');
  if (receipt.approval_status !== 'pending') failures.push('approval bridge receipt approval_status must be pending');
  if (receipt.approval_written !== false) failures.push('approval bridge receipt must not write approval');
  if (receipt.performed_live_action !== false) failures.push('approval bridge receipt must perform no live action');
  if (receipt.import_proposal_result?.active_import_count !== 0) failures.push('approval bridge receipt must show zero active imports');
  return failures;
}

function validateApprovalFile(filePath) {
  const failures = [];
  if (!fs.existsSync(filePath)) return [`approval file does not exist: ${relativeToRepo(filePath)}`];
  const text = fs.readFileSync(filePath, 'utf8');
  for (const snippet of [
    'approval_request:',
    'action: "source_adapter_import:',
    'approval_required: true',
    'status: "pending"',
    'human_approval_received',
    'rollback_plan_attached',
  ]) {
    if (!text.includes(snippet)) failures.push(`approval file missing ${snippet}`);
  }
  return failures;
}

function validateApprovalRequestTarget(resultFile, args) {
  if (!resultFile) return ['approval request output path is missing'];

  const configuredOutDir = path.resolve(args.approvalOutDir || approvalDir);
  const target = path.resolve(repoRoot, resultFile);
  const relative = path.relative(configuredOutDir, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    return [`approval request output must stay under ${configuredOutDir}`];
  }

  if (configuredOutDir === approvalDir && !resultFile.startsWith('.mirror/APPROVAL_REQUESTS/')) {
    return ['approval request output must target .mirror/APPROVAL_REQUESTS'];
  }

  return [];
}

function buildReceipt(request, approvalBridgeResult, approvalRequestResult, args, decision) {
  const now = stamp(args);
  const approvalFile = approvalRequestResult.file || '';
  const approvalFilePath = approvalFile ? path.resolve(repoRoot, approvalFile) : '';
  const approvalFileHash = approvalFile && fs.existsSync(approvalFilePath) ? sha256File(approvalFilePath) : '';
  return {
    source_adapter_import_approval_create_receipt: {
      schema_version: 'source_adapter_import_approval_create_receipt.v0_1',
      id: `source_adapter_import_approval_create_receipt_${now.replace(/[^0-9TZ]/g, '').toLowerCase()}_${request.id}`,
      request_id: request.id,
      created_at: isoFromStamp(now),
      decision,
      approval_required: true,
      approval_status: 'pending',
      approval_written: approvalRequestResult.wrote === true,
      approval_file: approvalFile,
      approval_file_hash: approvalFileHash,
      performed_live_action: false,
      checked_scope: [
        'source_adapter_import_approval_create_request_shape',
        'source_adapter_import_approval_bridge_receipt',
        'source_adapter_import_approval_bridge_gate',
        'approval_request_write',
        'approval_file_shape',
        'no_import_approval',
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
      gate_results: [],
      approval_bridge_result: approvalBridgeResult,
      approval_request_result: {
        ok: approvalRequestResult.ok,
        decision: approvalRequestResult.decision,
        wrote: approvalRequestResult.wrote,
        file: approvalRequestResult.file || approvalRequestResult.would_write,
        approval_required: approvalRequestResult.approval_required,
        status: approvalRequestResult.status || 'pending',
      },
      blocked_capabilities: blockedCapabilities,
      output: {
        type: 'source_adapter_import_approval_create_receipt',
        message: decision === 'approval_required' && approvalRequestResult.wrote === true
          ? 'Pending approval request was created, but no approval was granted and no import was applied.'
          : decision === 'approval_required'
            ? 'Pending approval request can be created, but no approval was granted and no import was applied.'
            : 'Source adapter import approval request creation blocked without live action.',
      },
    },
  };
}

function receiptFilePath(args, request) {
  if (args.out) return args.out;
  return path.join(args.outDir, `${stamp(args)}-${request.id}.json`);
}

function assertSafeOut(filePath, args) {
  const target = path.resolve(filePath);
  const configuredOutDir = path.resolve(args.outDir || receiptDir);
  const relative = path.relative(configuredOutDir, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`receipt output must stay under ${configuredOutDir}`);
  }
}

function gateSourceAdapterImportApprovalCreate(payload, args) {
  const { errors, request } = validateShape(payload);
  const failures = [...errors];
  let gateResults = [];
  let approvalBridgeResult = { ok: false, decision: 'not_run', approval_written: false };
  let approvalRequestResult = { ok: false, decision: 'not_run', wrote: false, file: '', would_write: '', approval_required: false, status: '' };

  if (!errors.length) {
    failures.push(...validateRequest(request));
    let approvalBridgeRequestPath = '';
    let approvalBridgeReceiptPath = '';
    let approvalStatePath = '';
    let actionRequestPath = '';
    if (!failures.length) {
      try {
        approvalBridgeRequestPath = safeRepoPath(request.approval_bridge_request, contractDir, 'approval_bridge_request');
        approvalBridgeReceiptPath = safeRepoPath(request.approval_bridge_receipt, receiptDir, 'approval_bridge_receipt');
        approvalStatePath = safeRepoPath(request.approval_state, contractDir, 'approval_state');
        actionRequestPath = safeRepoPath(request.action_request, contractDir, 'action_request');
      } catch (error) {
        failures.push(error.message);
      }
    }
    if (!failures.length) {
      for (const [label, filePath] of [
        ['approval_bridge_request', approvalBridgeRequestPath],
        ['approval_bridge_receipt', approvalBridgeReceiptPath],
        ['approval_state', approvalStatePath],
        ['action_request', actionRequestPath],
      ]) {
        if (!fs.existsSync(filePath)) failures.push(`${label} does not exist: ${relativeToRepo(filePath)}`);
      }
    }
    if (!failures.length) {
      failures.push(...validateApprovalBridgeReceipt(approvalBridgeReceiptPath));
    }
    if (!failures.length) {
      approvalBridgeResult = runApprovalBridge(approvalBridgeRequestPath);
      if (!approvalBridgeResult.ok || approvalBridgeResult.decision !== 'approval_required') failures.push(`approval bridge gate failed with decision ${approvalBridgeResult.decision}`);
      if (approvalBridgeResult.approval_written) failures.push('approval bridge gate must not write approval');
    }
    if (!failures.length) {
      approvalRequestResult = runApprovalRequest(approvalStatePath, actionRequestPath, args);
      if (!approvalRequestResult.ok || approvalRequestResult.decision !== 'approval_required') failures.push(`approval request gate failed with decision ${approvalRequestResult.decision}`);
      if (args.write && !approvalRequestResult.wrote) failures.push('approval request gate must write when this gate writes');
      if (!args.write && approvalRequestResult.wrote) failures.push('approval request dry-run must not write');
      if (!approvalRequestResult.approval_required || approvalRequestResult.status !== 'pending') failures.push('approval request must stay pending and approval-required');
      const resultFile = approvalRequestResult.file || approvalRequestResult.would_write;
      failures.push(...validateApprovalRequestTarget(resultFile, args));
      if (args.write && approvalRequestResult.file) {
        failures.push(...validateApprovalFile(path.resolve(repoRoot, approvalRequestResult.file)));
      }
    }
    if (!failures.length) {
      gateResults = requiredGates.map(runGate);
      for (const gate of gateResults) {
        if (!gate.ok) failures.push(`${gate.id} failed with decision ${gate.decision}`);
      }
    }
  }

  const decision = failures.length ? 'block' : 'approval_required';
  const receipt = errors.length ? null : buildReceipt(request, approvalBridgeResult, approvalRequestResult, args, decision);
  if (receipt?.source_adapter_import_approval_create_receipt) {
    receipt.source_adapter_import_approval_create_receipt.gate_results = gateResults;
  }
  let file = '';
  let wrote = false;
  if (decision === 'approval_required' && args.write) {
    file = receiptFilePath(args, request);
    assertSafeOut(file, args);
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
      'pending approval request file exists only when --write is used',
      'pending approval is not approval',
      'source adapter import remains unapplied and not live',
      'no live app, gateway, model, network, route, deploy, arbitrary UI, or durable memory action was performed',
    ] : [],
    request_id: request.id || '',
    surface: request.surface || '',
    approval_required: true,
    approval_status: 'pending',
    approval_written: approvalRequestResult.wrote === true,
    approval_request_result: approvalRequestResult,
    approval_bridge_result: approvalBridgeResult,
    performed_live_action: false,
    gate_results: gateResults,
    receipt,
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function selfTest() {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'active-mirror-source-approval-create-'));
  const proposed = gateSourceAdapterImportApprovalCreate(readJson(defaults.request, 'source adapter import approval create request'), {
    ...defaults,
    timestamp: '20260707T000700Z',
    outDir: temp,
    approvalOutDir: temp,
    write: true,
  });
  assert(proposed.ok, 'source adapter import approval create should pass as approval_required');
  assert(proposed.decision === 'approval_required', 'source adapter import approval create should require approval');
  assert(proposed.approval_written === true, 'approval create should write a pending approval request in temp');
  assert(proposed.approval_request_result.file.includes(temp), 'self-test approval should stay in temp');

  const blocked = gateSourceAdapterImportApprovalCreate(readJson(path.join(contractDir, 'source_adapter_import_approval_create.live_blocked.example.json'), 'blocked source adapter import approval create request'), { ...defaults, timestamp: '20260707T000701Z' });
  assert(!blocked.ok, 'live source adapter import approval create request should block');
  assert(blocked.failures.some((failure) => failure.includes('apply_import_enabled')), 'blocked request should fail on apply import');

  const unsafePath = JSON.parse(JSON.stringify(readJson(defaults.request, 'source adapter import approval create request')));
  unsafePath.source_adapter_import_approval_create_request.approval_bridge_receipt = '../outside.json';
  const unsafe = gateSourceAdapterImportApprovalCreate(unsafePath, { ...defaults, timestamp: '20260707T000702Z' });
  assert(!unsafe.ok, 'unsafe approval create path should block');

  return {
    ok: true,
    checks: [
      { name: 'source adapter import approval create writes pending temp approval', decision: proposed.decision, approval_written: proposed.approval_written },
      { name: 'live source adapter import approval create blocks', decision: blocked.decision },
      { name: 'unsafe approval create path blocks', decision: unsafe.decision },
    ],
  };
}

try {
  const args = parseArgs(process.argv.slice(2));
  const result = args.selfTest
    ? selfTest()
    : gateSourceAdapterImportApprovalCreate(readJson(args.request, 'source adapter import approval create request'), args);
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
