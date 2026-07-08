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
const srcRoot = path.join(repoRoot, 'src');

const defaults = {
  request: path.join(contractDir, 'source_adapter_invocation_contract.request.example.json'),
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
  'guard:source-adapter-import-applied',
  'guard:ui-harness',
  'guard:front-door',
  'guard:receipt-chain',
];

const gateCommands = {
  'guard:source-adapter-import-applied': ['scripts/amos_source_adapter_import_applied_gate.mjs', '--self-test'],
  'guard:ui-harness': ['scripts/amos_ui_harness_gate.mjs', '--self-test'],
  'guard:front-door': ['scripts/front_door_guard.mjs'],
  'guard:receipt-chain': ['scripts/amos_receipt_chain_gate.mjs', '--verify'],
};

const requiredBlockedClaims = [
  'Source adapter invocation is live.',
  'Source adapter invocation called a model.',
  'Source adapter invocation used the network.',
  'Source adapter invocation wrote durable memory.',
  'Source adapter invocation changed app routes.',
  'Source adapter invocation changed gateway behavior.',
  'Source adapter invocation deployed public assets.',
  'Source adapter invocation executed arbitrary generated UI.',
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
  const request = payload.source_adapter_invocation_contract_request;
  if (!request || typeof request !== 'object' || Array.isArray(request)) {
    return { errors: ['source_adapter_invocation_contract_request must be an object'], request: {} };
  }

  if (request.schema_version !== 'source_adapter_invocation_contract_request.v0_1') errors.push('source_adapter_invocation_contract_request.schema_version must be source_adapter_invocation_contract_request.v0_1');
  const id = requireString(request, 'id', 'source_adapter_invocation_contract_request', errors);
  if (id && !/^[a-z0-9][a-z0-9_-]{2,80}$/.test(id)) errors.push('source_adapter_invocation_contract_request.id must be a lowercase slug');
  const surface = requireString(request, 'surface', 'source_adapter_invocation_contract_request', errors);
  const mode = requireString(request, 'mode', 'source_adapter_invocation_contract_request', errors);
  const adapter = requireString(request, 'adapter', 'source_adapter_invocation_contract_request', errors);
  const route = requireString(request, 'route', 'source_adapter_invocation_contract_request', errors);
  const sourceFile = requireString(request, 'source_file', 'source_adapter_invocation_contract_request', errors);
  const targetFile = requireString(request, 'target_file', 'source_adapter_invocation_contract_request', errors);
  const allowedInvoker = requireString(request, 'allowed_invoker', 'source_adapter_invocation_contract_request', errors);
  const allowedInputReceipt = requireString(request, 'allowed_input_receipt', 'source_adapter_invocation_contract_request', errors);
  const allowedOutput = requireString(request, 'allowed_output', 'source_adapter_invocation_contract_request', errors);
  const requiredGateList = requireStringArray(request, 'required_gates', 'source_adapter_invocation_contract_request', errors);
  const outputType = requireString(request, 'output_type', 'source_adapter_invocation_contract_request', errors);
  const claimBoundary = requireStringArray(request, 'claim_boundary', 'source_adapter_invocation_contract_request', errors);
  const blockedClaims = requireStringArray(request, 'blocked_claims', 'source_adapter_invocation_contract_request', errors);

  for (const key of ['invocation_enabled', 'model_call_enabled', 'network_enabled', 'durable_memory_write_enabled', 'route_change_enabled', 'gateway_change_enabled', 'public_deploy_enabled', 'arbitrary_ui_enabled']) {
    if (typeof request[key] !== 'boolean') errors.push(`source_adapter_invocation_contract_request.${key} must be boolean`);
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
      allowed_invoker: allowedInvoker,
      allowed_input_receipt: allowedInputReceipt,
      allowed_output: allowedOutput,
      invocation_enabled: request.invocation_enabled,
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

function validateRequest(request) {
  const failures = [];
  if (request.surface !== 'consumer_app') failures.push(`surface must be consumer_app; got ${request.surface}`);
  if (request.mode !== 'invocation_contract_declared_only') failures.push(`mode must be invocation_contract_declared_only; got ${request.mode}`);
  if (request.adapter !== 'amos_disabled_source_adapter') failures.push(`adapter must be amos_disabled_source_adapter; got ${request.adapter}`);
  if (request.route !== '/app/') failures.push(`route must be /app/; got ${request.route}`);
  if (request.source_file !== 'src/lib/amos-disabled-source-adapter.js') failures.push('source_file must be src/lib/amos-disabled-source-adapter.js');
  if (request.target_file !== 'src/pages/HomePage.jsx') failures.push('target_file must be src/pages/HomePage.jsx');
  if (request.allowed_invoker !== request.target_file) failures.push('allowed_invoker must match target_file');
  if (request.allowed_input_receipt !== 'ui_harness_receipt') failures.push('allowed_input_receipt must be ui_harness_receipt');
  if (request.allowed_output !== 'disabled_source_adapter_projection') failures.push('allowed_output must be disabled_source_adapter_projection');
  if (request.invocation_enabled !== false) failures.push('invocation_enabled must be false');
  if (request.model_call_enabled !== false) failures.push('model_call_enabled must be false');
  if (request.network_enabled !== false) failures.push('network_enabled must be false');
  if (request.durable_memory_write_enabled !== false) failures.push('durable_memory_write_enabled must be false');
  if (request.route_change_enabled !== false) failures.push('route_change_enabled must be false');
  if (request.gateway_change_enabled !== false) failures.push('gateway_change_enabled must be false');
  if (request.public_deploy_enabled !== false) failures.push('public_deploy_enabled must be false');
  if (request.arbitrary_ui_enabled !== false) failures.push('arbitrary_ui_enabled must be false');
  if (request.output_type !== 'source_adapter_invocation_contract_receipt') failures.push(`output_type must be source_adapter_invocation_contract_receipt; got ${request.output_type}`);
  for (const missing of missingFrom(request.required_gates, requiredGates)) failures.push(`missing required gate ${missing}`);
  for (const missing of missingFrom(request.blocked_claims, requiredBlockedClaims)) failures.push(`missing blocked claim ${missing}`);
  if (!request.claim_boundary.some((claim) => /future invocation contract only/i.test(claim))) failures.push('claim_boundary must state this declares a future invocation contract only');
  if (!request.claim_boundary.some((claim) => /adapter is not invoked/i.test(claim))) failures.push('claim_boundary must state the adapter is not invoked');
  if (!request.claim_boundary.some((claim) => /does not call a model/i.test(claim))) failures.push('claim_boundary must state this does not call a model');
  if (!request.claim_boundary.some((claim) => /does not use the network/i.test(claim))) failures.push('claim_boundary must state this does not use the network');
  return failures;
}

function safeRepoPath(value, root, label) {
  const target = path.resolve(repoRoot, value);
  const relative = path.relative(root, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label} must stay under ${root}`);
  }
  return target;
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
    'Object.freeze',
  ]) {
    if (!sourceText.includes(snippet)) failures.push(`source file missing invariant ${snippet}`);
  }
  for (const forbidden of ['fetch(', 'XMLHttpRequest', 'localStorage.setItem', 'sessionStorage.setItem', 'navigator.sendBeacon']) {
    if (sourceText.includes(forbidden)) failures.push(`source file contains forbidden runtime primitive ${forbidden}`);
  }
  return failures;
}

function scanTarget(targetText) {
  const importLineCount = targetText.split(/\r?\n/).filter((line) => line.trim() === adapterImport).length;
  const invocationPattern = new RegExp(`\\b${adapterSymbol}\\s*\\(`, 'g');
  return {
    import_line_count: importLineCount,
    adapter_invocation_count: [...targetText.matchAll(invocationPattern)].length,
  };
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
    source_adapter_invocation_contract_receipt: {
      schema_version: 'source_adapter_invocation_contract_receipt.v0_1',
      id: `source_adapter_invocation_contract_receipt_${now.replace(/[^0-9TZ]/g, '').toLowerCase()}_${request.id}`,
      request_id: request.id,
      created_at: isoFromStamp(now),
      decision,
      source_file: request.source_file || '',
      source_hash: state.source_hash || '0'.repeat(64),
      target_file: request.target_file || '',
      target_hash: state.target_hash || '0'.repeat(64),
      contract: {
        allowed_invoker: request.allowed_invoker || '',
        allowed_input_receipt: request.allowed_input_receipt || '',
        allowed_output: request.allowed_output || '',
        invocation_enabled: false,
      },
      import_scan: state.import_scan,
      source_invariants: {
        disabled_flags_ok: state.disabled_flags_ok,
        runtime_primitives_absent: state.runtime_primitives_absent,
      },
      performed_live_action: false,
      checked_scope: [
        'source_adapter_invocation_contract_request_shape',
        'source_file_exists',
        'target_file_exists',
        'target_import_present_once',
        'adapter_not_invoked',
        'source_disabled_invariants',
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
        type: 'source_adapter_invocation_contract_receipt',
        message: decision === 'contract_declared'
          ? 'Invocation contract declared, but the imported adapter remains uninvoked.'
          : 'Invocation contract blocked without live action.',
      },
    },
  };
}

function gateSourceAdapterInvocationContract(payload, args) {
  const { errors, request } = validateShape(payload);
  const failures = [...errors];
  const state = {
    source_hash: '',
    target_hash: '',
    import_scan: { import_line_count: 0, adapter_invocation_count: 0 },
    disabled_flags_ok: false,
    runtime_primitives_absent: false,
    gate_results: [],
  };

  if (!errors.length) {
    failures.push(...validateRequest(request));
    let sourcePath = '';
    let targetPath = '';
    if (!failures.length) {
      try {
        sourcePath = safeRepoPath(request.source_file, srcRoot, 'source_file');
        targetPath = safeRepoPath(request.target_file, srcRoot, 'target_file');
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
      const invariantFailures = validateSourceInvariants(sourceText);
      failures.push(...invariantFailures);
      state.disabled_flags_ok = !invariantFailures.some((failure) => failure.includes('missing invariant'));
      state.runtime_primitives_absent = !invariantFailures.some((failure) => failure.includes('forbidden runtime primitive'));
      if (state.import_scan.import_line_count !== 1) failures.push(`target must import disabled source adapter exactly once; found ${state.import_scan.import_line_count}`);
      if (state.import_scan.adapter_invocation_count !== 0) failures.push('target must not invoke createDisabledSourceAdapterProjection yet');
    }
    if (!failures.length) {
      state.gate_results = requiredGates.map(runGate);
      for (const gate of state.gate_results) {
        if (!gate.ok) failures.push(`${gate.id} failed with decision ${gate.decision}`);
      }
    }
  }

  const decision = failures.length ? 'block' : 'contract_declared';
  const receipt = errors.length ? null : buildReceipt(request, state, args, decision);
  let file = '';
  let wrote = false;
  if (decision === 'contract_declared' && args.write) {
    file = receiptFilePath(args, request);
    assertSafeOutput(file);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${JSON.stringify(receipt, null, 2)}\n`);
    wrote = true;
  } else if (decision === 'contract_declared') {
    file = receiptFilePath(args, request);
  }

  return {
    ok: decision === 'contract_declared',
    decision,
    wrote,
    file,
    failures,
    warnings: decision === 'contract_declared' ? [
      'invocation contract is declared, but the adapter is not invoked',
      'this is not live runtime wiring',
      'no live app, gateway, model, network, route, deploy, arbitrary UI, or durable memory action was performed',
    ] : [],
    request_id: request.id || '',
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
  const allowed = gateSourceAdapterInvocationContract(readJson(defaults.request, 'source adapter invocation contract request'), { ...defaults, timestamp: '20260708T093336Z' });
  assert(allowed.ok, 'source adapter invocation contract should pass');
  assert(allowed.decision === 'contract_declared', 'source adapter invocation contract should be declared');
  assert(allowed.import_scan.import_line_count === 1, 'source adapter import should be present once');
  assert(allowed.import_scan.adapter_invocation_count === 0, 'source adapter should not be invoked');

  const blocked = gateSourceAdapterInvocationContract(readJson(path.join(contractDir, 'source_adapter_invocation_contract.live_blocked.example.json'), 'blocked source adapter invocation contract request'), { ...defaults, timestamp: '20260708T093337Z' });
  assert(!blocked.ok, 'live invocation contract request should block');
  assert(blocked.failures.some((failure) => failure.includes('invocation_enabled')), 'blocked request should fail on invocation_enabled');

  const unsafePath = JSON.parse(JSON.stringify(readJson(defaults.request, 'source adapter invocation contract request')));
  unsafePath.source_adapter_invocation_contract_request.target_file = '../outside.jsx';
  const unsafe = gateSourceAdapterInvocationContract(unsafePath, { ...defaults, timestamp: '20260708T093338Z' });
  assert(!unsafe.ok, 'unsafe target path should block');

  return {
    ok: true,
    checks: [
      { name: 'invocation contract declared while adapter remains uninvoked', decision: allowed.decision },
      { name: 'live invocation request blocks', decision: blocked.decision },
      { name: 'unsafe target path blocks', decision: unsafe.decision },
    ],
  };
}

try {
  const args = parseArgs(process.argv.slice(2));
  const result = args.selfTest
    ? selfTest()
    : gateSourceAdapterInvocationContract(readJson(args.request, 'source adapter invocation contract request'), args);
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
