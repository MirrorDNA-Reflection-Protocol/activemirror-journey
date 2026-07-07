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
  request: path.join(contractDir, 'disabled_source_adapter.consumer.example.json'),
  outDir: receiptDir,
  out: '',
  timestamp: '',
  expect: '',
  write: false,
  dryRun: false,
  selfTest: false,
};

const requiredGates = [
  'guard:runtime-integration',
  'guard:shadow-adapter',
  'guard:readonly-app-adapter',
  'guard:browser-runtime-adapter',
  'guard:ui-harness',
  'guard:front-door',
  'guard:receipt-chain',
];

const gateCommands = {
  'guard:runtime-integration': ['scripts/amos_runtime_integration_gate.mjs', '--expect', 'allow'],
  'guard:shadow-adapter': ['scripts/amos_shadow_adapter_gate.mjs', '--self-test'],
  'guard:readonly-app-adapter': ['scripts/amos_readonly_app_adapter_gate.mjs', '--self-test'],
  'guard:browser-runtime-adapter': ['scripts/amos_browser_runtime_adapter_gate.mjs', '--self-test'],
  'guard:ui-harness': ['scripts/amos_ui_harness_gate.mjs', '--self-test'],
  'guard:front-door': ['scripts/front_door_guard.mjs'],
  'guard:receipt-chain': ['scripts/amos_receipt_chain_gate.mjs', '--verify'],
};

const requiredBlockedClaims = [
  'Disabled source adapter is live in the public app.',
  'Disabled source adapter is imported by the public app.',
  'Disabled source adapter called a model.',
  'Disabled source adapter used the network.',
  'Disabled source adapter wrote durable memory.',
  'Disabled source adapter changed app routes.',
  'Disabled source adapter changed gateway behavior.',
  'Disabled source adapter deployed public assets.',
  'Disabled source adapter executed arbitrary generated UI.',
];

const blockedCapabilities = [
  'model_call',
  'network',
  'durable_memory_write',
  'route_change',
  'gateway_change',
  'public_deploy',
  'live_runtime_action',
  'arbitrary_generated_ui',
  'active_app_import',
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
  const request = payload.disabled_source_adapter_request;
  if (!request || typeof request !== 'object' || Array.isArray(request)) {
    return { errors: ['disabled_source_adapter_request must be an object'], request: {} };
  }

  if (request.schema_version !== 'disabled_source_adapter_request.v0_1') errors.push('disabled_source_adapter_request.schema_version must be disabled_source_adapter_request.v0_1');
  const id = requireString(request, 'id', 'disabled_source_adapter_request', errors);
  if (id && !/^[a-z0-9][a-z0-9_-]{2,80}$/.test(id)) errors.push('disabled_source_adapter_request.id must be a lowercase slug');
  const surface = requireString(request, 'surface', 'disabled_source_adapter_request', errors);
  const mode = requireString(request, 'mode', 'disabled_source_adapter_request', errors);
  const adapter = requireString(request, 'adapter', 'disabled_source_adapter_request', errors);
  const route = requireString(request, 'route', 'disabled_source_adapter_request', errors);
  const sourceFile = requireString(request, 'source_file', 'disabled_source_adapter_request', errors);
  const uiHarnessRequest = requireString(request, 'ui_harness_request', 'disabled_source_adapter_request', errors);
  const expectedExports = requireStringArray(request, 'expected_exports', 'disabled_source_adapter_request', errors);
  const requiredGateList = requireStringArray(request, 'required_gates', 'disabled_source_adapter_request', errors);
  const outputType = requireString(request, 'output_type', 'disabled_source_adapter_request', errors);
  const claimBoundary = requireStringArray(request, 'claim_boundary', 'disabled_source_adapter_request', errors);
  const blockedClaims = requireStringArray(request, 'blocked_claims', 'disabled_source_adapter_request', errors);

  for (const key of ['import_allowed', 'live_import_enabled', 'model_call_enabled', 'network_enabled', 'durable_memory_write_enabled', 'route_change_enabled', 'gateway_change_enabled', 'public_deploy_enabled', 'arbitrary_ui_enabled']) {
    if (typeof request[key] !== 'boolean') errors.push(`disabled_source_adapter_request.${key} must be boolean`);
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
      ui_harness_request: uiHarnessRequest,
      expected_exports: expectedExports,
      import_allowed: request.import_allowed,
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
  return { result, parsed, ok };
}

function runGate(id) {
  const command = gateCommands[id];
  if (!command) return { id, ok: false, decision: 'missing_command' };
  const { parsed, ok } = runCommand(command);
  const decision = parsed?.decision || (ok ? 'pass' : 'fail');
  return { id, ok, decision };
}

function runUiHarness(requestPath) {
  const { parsed, ok } = runCommand(['scripts/amos_ui_harness_gate.mjs', '--request', requestPath, '--expect', 'allow']);
  return {
    ok,
    decision: parsed?.decision || (ok ? 'allow' : 'fail'),
    request_id: parsed?.request_id || '',
    receipt: parsed?.receipt || null,
  };
}

function hashFile(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function listSourceFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listSourceFiles(fullPath));
    else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) files.push(fullPath);
  }
  return files;
}

function scanActiveImports(sourceFile) {
  const relativeSource = path.relative(srcRoot, sourceFile);
  const sourceBase = path.basename(sourceFile);
  const activeImports = [];
  for (const file of listSourceFiles(srcRoot)) {
    if (file === sourceFile) continue;
    const text = fs.readFileSync(file, 'utf8');
    const importLines = text.split(/\r?\n/).filter((line) => /\bimport\b/.test(line));
    for (const line of importLines) {
      if (line.includes(sourceBase) || line.includes(relativeSource)) {
        activeImports.push(`${path.relative(repoRoot, file)}: ${line.trim()}`);
      }
    }
  }
  return {
    import_allowed: false,
    active_import_count: activeImports.length,
    active_imports: activeImports,
  };
}

function validateSourceInvariants(sourceText, request) {
  const failures = [];
  for (const exportName of request.expected_exports) {
    if (!sourceText.includes(exportName)) failures.push(`source file missing expected export ${exportName}`);
  }
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
  return failures;
}

function validateRequest(request) {
  const failures = [];
  if (request.surface !== 'consumer_app') failures.push(`surface must be consumer_app; got ${request.surface}`);
  if (request.mode !== 'disabled_source_adapter_proposal') failures.push(`mode must be disabled_source_adapter_proposal; got ${request.mode}`);
  if (request.adapter !== 'amos_disabled_source_adapter') failures.push(`adapter must be amos_disabled_source_adapter; got ${request.adapter}`);
  if (request.route !== '/app/') failures.push(`route must be /app/; got ${request.route}`);
  if (request.source_file !== 'src/lib/amos-disabled-source-adapter.js') failures.push('source_file must be src/lib/amos-disabled-source-adapter.js');
  if (request.import_allowed !== false) failures.push('import_allowed must be false');
  if (request.live_import_enabled !== false) failures.push('live_import_enabled must be false');
  if (request.model_call_enabled !== false) failures.push('model_call_enabled must be false');
  if (request.network_enabled !== false) failures.push('network_enabled must be false');
  if (request.durable_memory_write_enabled !== false) failures.push('durable_memory_write_enabled must be false');
  if (request.route_change_enabled !== false) failures.push('route_change_enabled must be false');
  if (request.gateway_change_enabled !== false) failures.push('gateway_change_enabled must be false');
  if (request.public_deploy_enabled !== false) failures.push('public_deploy_enabled must be false');
  if (request.arbitrary_ui_enabled !== false) failures.push('arbitrary_ui_enabled must be false');
  if (request.output_type !== 'disabled_source_adapter_receipt') failures.push(`output_type must be disabled_source_adapter_receipt; got ${request.output_type}`);
  for (const missing of missingFrom(request.required_gates, requiredGates)) failures.push(`missing required gate ${missing}`);
  for (const missing of missingFrom(request.blocked_claims, requiredBlockedClaims)) failures.push(`missing blocked claim ${missing}`);
  if (!request.claim_boundary.some((claim) => /disabled source adapter proposal/i.test(claim))) failures.push('claim_boundary must state this is a disabled source adapter proposal');
  if (!request.claim_boundary.some((claim) => /not imported by the public app/i.test(claim))) failures.push('claim_boundary must state this is not imported by the public app');
  if (!request.claim_boundary.some((claim) => /does not call a model/i.test(claim))) failures.push('claim_boundary must state this does not call a model');
  if (!request.claim_boundary.some((claim) => /does not use the network/i.test(claim))) failures.push('claim_boundary must state this does not use the network');
  return failures;
}

function buildAdapterProjection(uiHarnessResult) {
  const uiReceipt = uiHarnessResult.receipt?.ui_harness_receipt || {};
  const projection = uiReceipt.ui_projection || {};
  return {
    status: 'disabled_proposal',
    enabled: false,
    route: projection.route || '/app/',
    surface: projection.surface || 'consumer_app',
    runtime_result: projection.runtime_result || 'not_run',
  };
}

function buildReceipt(request, sourceHash, importScan, uiHarnessResult, gateResults, args, decision) {
  const now = stamp(args);
  return {
    disabled_source_adapter_receipt: {
      schema_version: 'disabled_source_adapter_receipt.v0_1',
      id: `disabled_source_adapter_receipt_${now.replace(/[^0-9TZ]/g, '').toLowerCase()}_${request.id}`,
      request_id: request.id,
      created_at: isoFromStamp(now),
      decision,
      performed_live_action: false,
      checked_scope: [
        'disabled_source_adapter_request_shape',
        'source_file_exists',
        'source_disabled_invariants',
        'active_import_scan',
        'ui_harness_invocation',
        'no_model_call',
        'no_network',
        'no_durable_memory_write',
        'no_route_change',
        'no_gateway_change',
        'no_public_deploy',
        'required_local_gates',
      ],
      gate_results: gateResults,
      source_file: request.source_file,
      source_hash: sourceHash || '0'.repeat(64),
      import_scan: importScan,
      ui_harness_result: {
        ok: uiHarnessResult.ok,
        decision: uiHarnessResult.decision,
        request_id: uiHarnessResult.request_id,
      },
      adapter_projection: buildAdapterProjection(uiHarnessResult),
      blocked_capabilities: blockedCapabilities,
      output: {
        type: 'disabled_source_adapter_receipt',
        message: decision === 'allow'
          ? 'Disabled source adapter exists as source-only proposal and is not imported by the public app.'
          : 'Disabled source adapter proposal blocked without live action.',
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

function gateDisabledSourceAdapter(payload, args) {
  const { errors, request } = validateShape(payload);
  const failures = [...errors];
  let gateResults = [];
  let sourceHash = '';
  let importScan = { import_allowed: false, active_import_count: 0, active_imports: [] };
  let uiHarnessResult = { ok: false, decision: 'not_run', request_id: '', receipt: null };

  if (!errors.length) {
    failures.push(...validateRequest(request));
    let sourcePath = '';
    let uiHarnessPath = '';
    if (!failures.length) {
      try {
        sourcePath = safeRepoPath(request.source_file, srcRoot, 'source_file');
        uiHarnessPath = safeRepoPath(request.ui_harness_request, contractDir, 'ui_harness_request');
      } catch (error) {
        failures.push(error.message);
      }
    }
    if (!failures.length) {
      if (!fs.existsSync(sourcePath)) failures.push(`source_file does not exist: ${request.source_file}`);
      if (!fs.existsSync(uiHarnessPath)) failures.push(`ui_harness_request does not exist: ${request.ui_harness_request}`);
    }
    if (!failures.length) {
      const sourceText = fs.readFileSync(sourcePath, 'utf8');
      sourceHash = hashFile(sourcePath);
      importScan = scanActiveImports(sourcePath);
      failures.push(...validateSourceInvariants(sourceText, request));
      if (importScan.active_import_count > 0) failures.push('disabled source adapter is imported by active app source');
    }
    if (!failures.length) {
      uiHarnessResult = runUiHarness(uiHarnessPath);
      if (!uiHarnessResult.ok) failures.push(`UI harness failed with decision ${uiHarnessResult.decision}`);
    }
    if (!failures.length) {
      gateResults = requiredGates.map(runGate);
      for (const gate of gateResults) {
        if (!gate.ok) failures.push(`${gate.id} failed with decision ${gate.decision}`);
      }
    }
  }

  const decision = failures.length ? 'block' : 'allow';
  const receipt = errors.length ? null : buildReceipt(request, sourceHash, importScan, uiHarnessResult, gateResults, args, decision);
  let file = '';
  let wrote = false;
  if (decision === 'allow' && args.write) {
    file = receiptFilePath(args, request);
    assertSafeOut(file);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${JSON.stringify(receipt, null, 2)}\n`);
    wrote = true;
  } else if (decision === 'allow') {
    file = receiptFilePath(args, request);
  }

  return {
    ok: decision === 'allow',
    decision,
    wrote,
    file,
    failures,
    warnings: decision === 'allow' ? [
      'disabled source adapter is source-only and not imported by active app source',
      'no live app, gateway, model, network, route, deploy, arbitrary UI, or durable memory action was performed',
    ] : [],
    request_id: request.id || '',
    surface: request.surface || '',
    performed_live_action: false,
    import_scan: importScan,
    ui_harness_result: {
      ok: uiHarnessResult.ok,
      decision: uiHarnessResult.decision,
      request_id: uiHarnessResult.request_id,
    },
    gate_results: gateResults,
    receipt,
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function selfTest() {
  const allowed = gateDisabledSourceAdapter(readJson(defaults.request, 'disabled source adapter request'), { ...defaults, timestamp: '20260707T000400Z' });
  assert(allowed.ok, 'disabled source adapter request should pass');
  assert(allowed.decision === 'allow', 'disabled source adapter request should allow');
  assert(allowed.import_scan.active_import_count === 0, 'disabled source adapter should not be imported');

  const blocked = gateDisabledSourceAdapter(readJson(path.join(contractDir, 'disabled_source_adapter.live_blocked.example.json'), 'blocked disabled source adapter request'), { ...defaults, timestamp: '20260707T000401Z' });
  assert(!blocked.ok, 'live disabled source adapter request should block');
  assert(blocked.failures.some((failure) => failure.includes('model_call_enabled')), 'blocked request should fail on model calls');

  const unsafePath = JSON.parse(JSON.stringify(readJson(defaults.request, 'disabled source adapter request')));
  unsafePath.disabled_source_adapter_request.source_file = '../outside.js';
  const unsafe = gateDisabledSourceAdapter(unsafePath, { ...defaults, timestamp: '20260707T000402Z' });
  assert(!unsafe.ok, 'unsafe source path should block');

  return {
    ok: true,
    checks: [
      { name: 'disabled source adapter request passes', decision: allowed.decision },
      { name: 'live source adapter request blocks', decision: blocked.decision },
      { name: 'unsafe source path blocks', decision: unsafe.decision },
    ],
  };
}

try {
  const args = parseArgs(process.argv.slice(2));
  const result = args.selfTest
    ? selfTest()
    : gateDisabledSourceAdapter(readJson(args.request, 'disabled source adapter request'), args);
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
