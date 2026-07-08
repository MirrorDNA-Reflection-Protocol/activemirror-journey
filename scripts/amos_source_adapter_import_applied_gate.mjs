#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const contractDir = path.join(repoRoot, '.mirror', 'CONTRACTS', 'amos');
const receiptDir = path.join(repoRoot, '.mirror', 'RUNTIME_DRY_RUNS');
const approvalDir = path.join(repoRoot, '.mirror', 'APPROVAL_REQUESTS');
const srcRoot = path.join(repoRoot, 'src');

const defaults = {
  request: path.join(contractDir, 'source_adapter_import_applied.request.example.json'),
  outDir: receiptDir,
  out: '',
  timestamp: '',
  expect: '',
  write: false,
  dryRun: false,
  selfTest: false,
};

const adapterImport = "import { createDisabledSourceAdapterProjection } from '../lib/amos-disabled-source-adapter';";
const adapterSymbol = 'createDisabledSourceAdapterProjection';

const requiredGates = [
  'guard:disabled-source-adapter',
  'guard:front-door',
  'guard:receipt-chain',
];

const gateCommands = {
  'guard:disabled-source-adapter': ['scripts/amos_disabled_source_adapter_gate.mjs', '--self-test'],
  'guard:front-door': ['scripts/front_door_guard.mjs'],
  'guard:receipt-chain': ['scripts/amos_receipt_chain_gate.mjs', '--verify'],
};

const requiredBlockedClaims = [
  'Source adapter import performed live runtime work.',
  'Source adapter import called a model.',
  'Source adapter import used the network.',
  'Source adapter import wrote durable memory.',
  'Source adapter import changed app routes.',
  'Source adapter import changed gateway behavior.',
  'Source adapter import deployed public assets.',
  'Source adapter import executed arbitrary generated UI.',
];

const blockedCapabilities = [
  'invoke_adapter',
  'live_runtime_action',
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
  const request = payload.source_adapter_import_applied_request;
  if (!request || typeof request !== 'object' || Array.isArray(request)) {
    return { errors: ['source_adapter_import_applied_request must be an object'], request: {} };
  }

  if (request.schema_version !== 'source_adapter_import_applied_request.v0_1') errors.push('source_adapter_import_applied_request.schema_version must be source_adapter_import_applied_request.v0_1');
  const id = requireString(request, 'id', 'source_adapter_import_applied_request', errors);
  if (id && !/^[a-z0-9][a-z0-9_-]{2,80}$/.test(id)) errors.push('source_adapter_import_applied_request.id must be a lowercase slug');
  const surface = requireString(request, 'surface', 'source_adapter_import_applied_request', errors);
  const mode = requireString(request, 'mode', 'source_adapter_import_applied_request', errors);
  const adapter = requireString(request, 'adapter', 'source_adapter_import_applied_request', errors);
  const route = requireString(request, 'route', 'source_adapter_import_applied_request', errors);
  const sourceFile = requireString(request, 'source_file', 'source_adapter_import_applied_request', errors);
  const targetFile = requireString(request, 'target_file', 'source_adapter_import_applied_request', errors);
  const approvalEvidence = requireString(request, 'approval_evidence', 'source_adapter_import_applied_request', errors);
  const approvalRequest = requireString(request, 'approval_request', 'source_adapter_import_applied_request', errors);
  const requiredGateList = requireStringArray(request, 'required_gates', 'source_adapter_import_applied_request', errors);
  const outputType = requireString(request, 'output_type', 'source_adapter_import_applied_request', errors);
  const claimBoundary = requireStringArray(request, 'claim_boundary', 'source_adapter_import_applied_request', errors);
  const blockedClaims = requireStringArray(request, 'blocked_claims', 'source_adapter_import_applied_request', errors);

  for (const key of ['import_present_required', 'adapter_invocation_enabled', 'live_import_enabled', 'model_call_enabled', 'network_enabled', 'durable_memory_write_enabled', 'route_change_enabled', 'gateway_change_enabled', 'public_deploy_enabled', 'arbitrary_ui_enabled']) {
    if (typeof request[key] !== 'boolean') errors.push(`source_adapter_import_applied_request.${key} must be boolean`);
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
      approval_evidence: approvalEvidence,
      approval_request: approvalRequest,
      import_present_required: request.import_present_required,
      adapter_invocation_enabled: request.adapter_invocation_enabled,
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

function validateRequest(request) {
  const failures = [];
  if (request.surface !== 'consumer_app') failures.push(`surface must be consumer_app; got ${request.surface}`);
  if (request.mode !== 'source_imported_inert') failures.push(`mode must be source_imported_inert; got ${request.mode}`);
  if (request.adapter !== 'amos_disabled_source_adapter') failures.push(`adapter must be amos_disabled_source_adapter; got ${request.adapter}`);
  if (request.route !== '/app/') failures.push(`route must be /app/; got ${request.route}`);
  if (request.source_file !== 'src/lib/amos-disabled-source-adapter.js') failures.push('source_file must be src/lib/amos-disabled-source-adapter.js');
  if (request.target_file !== 'src/pages/HomePage.jsx') failures.push('target_file must be src/pages/HomePage.jsx');
  if (request.import_present_required !== true) failures.push('import_present_required must be true');
  if (request.adapter_invocation_enabled !== false) failures.push('adapter_invocation_enabled must be false');
  if (request.live_import_enabled !== false) failures.push('live_import_enabled must be false');
  if (request.model_call_enabled !== false) failures.push('model_call_enabled must be false');
  if (request.network_enabled !== false) failures.push('network_enabled must be false');
  if (request.durable_memory_write_enabled !== false) failures.push('durable_memory_write_enabled must be false');
  if (request.route_change_enabled !== false) failures.push('route_change_enabled must be false');
  if (request.gateway_change_enabled !== false) failures.push('gateway_change_enabled must be false');
  if (request.public_deploy_enabled !== false) failures.push('public_deploy_enabled must be false');
  if (request.arbitrary_ui_enabled !== false) failures.push('arbitrary_ui_enabled must be false');
  if (request.approval_request !== '.mirror/APPROVAL_REQUESTS/20260707T153055Z-source_adapter_import.yaml') failures.push('approval_request must point to the existing pending source adapter import approval request');
  if (!/^user_chat_approval_/.test(request.approval_evidence)) failures.push('approval_evidence must record the explicit chat approval source');
  if (request.output_type !== 'source_adapter_import_applied_receipt') failures.push(`output_type must be source_adapter_import_applied_receipt; got ${request.output_type}`);
  for (const missing of missingFrom(request.required_gates, requiredGates)) failures.push(`missing required gate ${missing}`);
  for (const missing of missingFrom(request.blocked_claims, requiredBlockedClaims)) failures.push(`missing blocked claim ${missing}`);
  if (!request.claim_boundary.some((claim) => /source import is present/i.test(claim))) failures.push('claim_boundary must state the source import is present');
  if (!request.claim_boundary.some((claim) => /adapter is not invoked/i.test(claim))) failures.push('claim_boundary must state the adapter is not invoked');
  if (!request.claim_boundary.some((claim) => /does not call a model/i.test(claim))) failures.push('claim_boundary must state this does not call a model');
  if (!request.claim_boundary.some((claim) => /does not use the network/i.test(claim))) failures.push('claim_boundary must state this does not use the network');
  return failures;
}

function validateSourceInvariants(sourceText) {
  const failures = [];
  for (const snippet of [
    'enabled: false',
    'liveRuntime: false',
    'canCallModel: false',
    'canUseNetwork: false',
    'canWriteDurableMemory: false',
    'canChangeRoute: false',
    'canChangeGateway: false',
    'canDeployPublicAsset: false',
    'canExecuteArbitraryUi: false',
    'performedLiveAction: false',
  ]) {
    if (!sourceText.includes(snippet)) failures.push(`source file missing disabled invariant ${snippet}`);
  }
  for (const forbidden of ['fetch(', 'XMLHttpRequest', 'localStorage.setItem', 'sessionStorage.setItem', 'navigator.sendBeacon']) {
    if (sourceText.includes(forbidden)) failures.push(`source file contains forbidden runtime primitive ${forbidden}`);
  }
  return failures;
}

function scanTarget(targetText) {
  const lines = targetText.split(/\r?\n/);
  const importLines = lines
    .map((line, index) => ({ line: line.trim(), line_number: index + 1 }))
    .filter((item) => item.line === adapterImport);
  const invocationPattern = new RegExp(`\\b${adapterSymbol}\\s*\\(`, 'g');
  return {
    import_line_count: importLines.length,
    import_lines: importLines,
    adapter_invocation_count: [...targetText.matchAll(invocationPattern)].length,
  };
}

function validateApprovalEvidence(filePath) {
  const failures = [];
  if (!fs.existsSync(filePath)) return { ok: false, status: '', file: relativeToRepo(filePath), failures: [`approval request missing: ${relativeToRepo(filePath)}`] };
  const text = fs.readFileSync(filePath, 'utf8');
  const status = /status:\s*"([^"]+)"/.exec(text)?.[1] || '';
  if (!text.includes('required_approval_from: "Paul"')) failures.push('approval request must require Paul approval');
  if (!text.includes('human_approval_received')) failures.push('approval request must list human_approval_received condition');
  if (status !== 'pending') failures.push(`approval request status must remain pending; got ${status || 'missing'}`);
  return { ok: failures.length === 0, status, file: relativeToRepo(filePath), failures };
}

function receiptFilePath(args, request) {
  if (args.out) return args.out;
  return path.join(args.outDir, `${stamp(args)}-${request.id}.json`);
}

function assertSafeOutput(filePath) {
  const target = path.resolve(filePath);
  const relative = path.relative(receiptDir, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`receipt output must stay under ${receiptDir}`);
  }
}

function buildReceipt(request, state, args, decision) {
  const now = stamp(args);
  return {
    source_adapter_import_applied_receipt: {
      schema_version: 'source_adapter_import_applied_receipt.v0_1',
      id: `source_adapter_import_applied_receipt_${now.replace(/[^0-9TZ]/g, '').toLowerCase()}_${request.id}`,
      request_id: request.id,
      created_at: isoFromStamp(now),
      decision,
      approval_scope: 'chat_approved_source_import_only',
      approval_evidence: request.approval_evidence || '',
      approval_request_result: state.approval_request_result,
      source_file: request.source_file || '',
      source_hash: state.source_hash || '0'.repeat(64),
      target_file: request.target_file || '',
      target_hash: state.target_hash || '0'.repeat(64),
      import_scan: state.import_scan,
      adapter_invoked: false,
      performed_live_action: false,
      checked_scope: [
        'source_adapter_import_applied_request_shape',
        'source_file_exists',
        'target_file_exists',
        'target_import_present_once',
        'adapter_not_invoked',
        'source_disabled_invariants',
        'pending_approval_request_file',
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
      blocked_capabilities: blockedCapabilities,
      output: {
        type: 'source_adapter_import_applied_receipt',
        message: decision === 'imported_disabled'
          ? 'Disabled source adapter import is present once and is not invoked.'
          : 'Disabled source adapter import application blocked without live action.',
      },
    },
  };
}

function gateSourceAdapterImportApplied(payload, args) {
  const { errors, request } = validateShape(payload);
  const failures = [...errors];
  const state = {
    source_hash: '',
    target_hash: '',
    import_scan: { import_line_count: 0, import_lines: [], adapter_invocation_count: 0 },
    approval_request_result: { ok: false, status: '', file: '' },
    gate_results: [],
  };

  if (!errors.length) {
    failures.push(...validateRequest(request));
    let sourcePath = '';
    let targetPath = '';
    let approvalPath = '';
    if (!failures.length) {
      try {
        sourcePath = safeRepoPath(request.source_file, srcRoot, 'source_file');
        targetPath = safeRepoPath(request.target_file, srcRoot, 'target_file');
        approvalPath = safeRepoPath(request.approval_request, approvalDir, 'approval_request');
      } catch (error) {
        failures.push(error.message);
      }
    }
    if (!failures.length) {
      if (!fs.existsSync(sourcePath)) failures.push(`source_file does not exist: ${request.source_file}`);
      if (!fs.existsSync(targetPath)) failures.push(`target_file does not exist: ${request.target_file}`);
    }
    if (!failures.length) {
      const sourceText = fs.readFileSync(sourcePath, 'utf8');
      const targetText = fs.readFileSync(targetPath, 'utf8');
      state.source_hash = sha256File(sourcePath);
      state.target_hash = sha256File(targetPath);
      state.import_scan = scanTarget(targetText);
      failures.push(...validateSourceInvariants(sourceText));
      if (state.import_scan.import_line_count !== 1) failures.push(`target must import disabled source adapter exactly once; found ${state.import_scan.import_line_count}`);
      if (state.import_scan.adapter_invocation_count !== 0) failures.push('target must not invoke createDisabledSourceAdapterProjection yet');
    }
    if (!failures.length) {
      const approval = validateApprovalEvidence(approvalPath);
      state.approval_request_result = {
        ok: approval.ok,
        status: approval.status,
        file: approval.file,
      };
      failures.push(...approval.failures);
    }
    if (!failures.length) {
      state.gate_results = requiredGates.map(runGate);
      for (const gate of state.gate_results) {
        if (!gate.ok) failures.push(`${gate.id} failed with decision ${gate.decision}`);
      }
    }
  }

  const decision = failures.length ? 'block' : 'imported_disabled';
  const receipt = errors.length ? null : buildReceipt(request, state, args, decision);
  let file = '';
  let wrote = false;
  if (decision === 'imported_disabled' && args.write) {
    file = receiptFilePath(args, request);
    assertSafeOutput(file);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${JSON.stringify(receipt, null, 2)}\n`);
    wrote = true;
  } else if (decision === 'imported_disabled') {
    file = receiptFilePath(args, request);
  }

  return {
    ok: decision === 'imported_disabled',
    decision,
    wrote,
    file,
    failures,
    warnings: decision === 'imported_disabled' ? [
      'source import is present, but the adapter is not invoked',
      'this is not live runtime wiring',
      'no live app, gateway, model, network, route, deploy, arbitrary UI, or durable memory action was performed',
    ] : [],
    request_id: request.id || '',
    surface: request.surface || '',
    performed_live_action: false,
    import_scan: state.import_scan,
    gate_results: state.gate_results,
    receipt,
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function selfTest() {
  const allowed = gateSourceAdapterImportApplied(readJson(defaults.request, 'source adapter import applied request'), { ...defaults, timestamp: '20260708T090000Z' });
  assert(allowed.ok, 'source adapter import applied request should pass');
  assert(allowed.decision === 'imported_disabled', 'source adapter import applied request should be imported_disabled');
  assert(allowed.import_scan.import_line_count === 1, 'source adapter import should be present once');
  assert(allowed.import_scan.adapter_invocation_count === 0, 'source adapter should not be invoked');

  const blocked = gateSourceAdapterImportApplied(readJson(path.join(contractDir, 'source_adapter_import_applied.live_blocked.example.json'), 'blocked source adapter import applied request'), { ...defaults, timestamp: '20260708T090001Z' });
  assert(!blocked.ok, 'live applied source adapter request should block');
  assert(blocked.failures.some((failure) => failure.includes('model_call_enabled')), 'blocked request should fail on model calls');

  const unsafePath = JSON.parse(JSON.stringify(readJson(defaults.request, 'source adapter import applied request')));
  unsafePath.source_adapter_import_applied_request.target_file = '../outside.jsx';
  const unsafe = gateSourceAdapterImportApplied(unsafePath, { ...defaults, timestamp: '20260708T090002Z' });
  assert(!unsafe.ok, 'unsafe target path should block');

  return {
    ok: true,
    checks: [
      { name: 'source adapter import present and inert', decision: allowed.decision },
      { name: 'live applied source adapter request blocks', decision: blocked.decision },
      { name: 'unsafe target path blocks', decision: unsafe.decision },
    ],
  };
}

try {
  const args = parseArgs(process.argv.slice(2));
  const result = args.selfTest
    ? selfTest()
    : gateSourceAdapterImportApplied(readJson(args.request, 'source adapter import applied request'), args);
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
