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
  request: path.join(contractDir, 'source_adapter_import.proposal.example.json'),
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
  'guard:disabled-source-adapter',
  'guard:ui-harness',
  'guard:front-door',
  'guard:receipt-chain',
];

const gateCommands = {
  'guard:runtime-integration': ['scripts/amos_runtime_integration_gate.mjs', '--expect', 'allow'],
  'guard:disabled-source-adapter': ['scripts/amos_disabled_source_adapter_gate.mjs', '--self-test'],
  'guard:ui-harness': ['scripts/amos_ui_harness_gate.mjs', '--self-test'],
  'guard:front-door': ['scripts/front_door_guard.mjs'],
  'guard:receipt-chain': ['scripts/amos_receipt_chain_gate.mjs', '--verify'],
};

const requiredBlockedClaims = [
  'Source adapter import is live in the public app.',
  'Source adapter import was applied.',
  'Source adapter import was approved.',
  'Source adapter import called a model.',
  'Source adapter import used the network.',
  'Source adapter import wrote durable memory.',
  'Source adapter import changed app routes.',
  'Source adapter import changed gateway behavior.',
  'Source adapter import deployed public assets.',
  'Source adapter import executed arbitrary generated UI.',
];

const blockedCapabilities = [
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
  const request = payload.source_adapter_import_request;
  if (!request || typeof request !== 'object' || Array.isArray(request)) {
    return { errors: ['source_adapter_import_request must be an object'], request: {} };
  }

  if (request.schema_version !== 'source_adapter_import_request.v0_1') errors.push('source_adapter_import_request.schema_version must be source_adapter_import_request.v0_1');
  const id = requireString(request, 'id', 'source_adapter_import_request', errors);
  if (id && !/^[a-z0-9][a-z0-9_-]{2,80}$/.test(id)) errors.push('source_adapter_import_request.id must be a lowercase slug');
  const surface = requireString(request, 'surface', 'source_adapter_import_request', errors);
  const mode = requireString(request, 'mode', 'source_adapter_import_request', errors);
  const adapter = requireString(request, 'adapter', 'source_adapter_import_request', errors);
  const route = requireString(request, 'route', 'source_adapter_import_request', errors);
  const sourceFile = requireString(request, 'source_file', 'source_adapter_import_request', errors);
  const targetFiles = requireStringArray(request, 'target_files', 'source_adapter_import_request', errors);
  const disabledSourceAdapterRequest = requireString(request, 'disabled_source_adapter_request', 'source_adapter_import_request', errors);
  const approvalStatus = requireString(request, 'approval_status', 'source_adapter_import_request', errors);
  const requiredGateList = requireStringArray(request, 'required_gates', 'source_adapter_import_request', errors);
  const outputType = requireString(request, 'output_type', 'source_adapter_import_request', errors);
  const claimBoundary = requireStringArray(request, 'claim_boundary', 'source_adapter_import_request', errors);
  const blockedClaims = requireStringArray(request, 'blocked_claims', 'source_adapter_import_request', errors);

  for (const key of ['approval_required', 'apply_import_enabled', 'live_import_enabled', 'model_call_enabled', 'network_enabled', 'durable_memory_write_enabled', 'route_change_enabled', 'gateway_change_enabled', 'public_deploy_enabled', 'arbitrary_ui_enabled']) {
    if (typeof request[key] !== 'boolean') errors.push(`source_adapter_import_request.${key} must be boolean`);
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
      target_files: targetFiles,
      disabled_source_adapter_request: disabledSourceAdapterRequest,
      approval_required: request.approval_required,
      approval_status: approvalStatus,
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

function runDisabledSourceAdapter(requestPath) {
  const { parsed, ok } = runCommand(['scripts/amos_disabled_source_adapter_gate.mjs', '--request', requestPath, '--expect', 'allow']);
  return {
    ok,
    decision: parsed?.decision || (ok ? 'allow' : 'fail'),
    request_id: parsed?.request_id || '',
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

function importLinesForAdapter(filePath, sourceFile) {
  const sourceBase = path.basename(sourceFile);
  const relativeSource = path.relative(srcRoot, sourceFile);
  const text = fs.readFileSync(filePath, 'utf8');
  return text
    .split(/\r?\n/)
    .filter((line) => /\bimport\b/.test(line))
    .filter((line) => line.includes(sourceBase) || line.includes(relativeSource))
    .map((line) => line.trim());
}

function scanActiveImports(sourceFile) {
  const activeImports = [];
  for (const file of listSourceFiles(srcRoot)) {
    if (file === sourceFile) continue;
    for (const line of importLinesForAdapter(file, sourceFile)) {
      activeImports.push(`${relativeToRepo(file)}: ${line}`);
    }
  }
  return {
    import_allowed: false,
    active_import_count: activeImports.length,
    active_imports: activeImports,
  };
}

function targetFileInfo(filePath, sourceFile) {
  return {
    file: relativeToRepo(filePath),
    hash: hashFile(filePath),
    imports_adapter: importLinesForAdapter(filePath, sourceFile).length > 0,
  };
}

function validateRequest(request) {
  const failures = [];
  if (request.surface !== 'consumer_app') failures.push(`surface must be consumer_app; got ${request.surface}`);
  if (request.mode !== 'approval_required_import_proposal') failures.push(`mode must be approval_required_import_proposal; got ${request.mode}`);
  if (request.adapter !== 'amos_disabled_source_adapter') failures.push(`adapter must be amos_disabled_source_adapter; got ${request.adapter}`);
  if (request.route !== '/app/') failures.push(`route must be /app/; got ${request.route}`);
  if (request.source_file !== 'src/lib/amos-disabled-source-adapter.js') failures.push('source_file must be src/lib/amos-disabled-source-adapter.js');
  if (request.approval_required !== true) failures.push('approval_required must be true');
  if (request.approval_status !== 'pending') failures.push('approval_status must be pending');
  if (request.apply_import_enabled !== false) failures.push('apply_import_enabled must be false');
  if (request.live_import_enabled !== false) failures.push('live_import_enabled must be false');
  if (request.model_call_enabled !== false) failures.push('model_call_enabled must be false');
  if (request.network_enabled !== false) failures.push('network_enabled must be false');
  if (request.durable_memory_write_enabled !== false) failures.push('durable_memory_write_enabled must be false');
  if (request.route_change_enabled !== false) failures.push('route_change_enabled must be false');
  if (request.gateway_change_enabled !== false) failures.push('gateway_change_enabled must be false');
  if (request.public_deploy_enabled !== false) failures.push('public_deploy_enabled must be false');
  if (request.arbitrary_ui_enabled !== false) failures.push('arbitrary_ui_enabled must be false');
  if (request.output_type !== 'source_adapter_import_receipt') failures.push(`output_type must be source_adapter_import_receipt; got ${request.output_type}`);
  for (const missing of missingFrom(request.required_gates, requiredGates)) failures.push(`missing required gate ${missing}`);
  for (const missing of missingFrom(request.blocked_claims, requiredBlockedClaims)) failures.push(`missing blocked claim ${missing}`);
  if (!request.claim_boundary.some((claim) => /import proposal only/i.test(claim))) failures.push('claim_boundary must state this is an import proposal only');
  if (!request.claim_boundary.some((claim) => /does not import/i.test(claim))) failures.push('claim_boundary must state this does not import the adapter');
  if (!request.claim_boundary.some((claim) => /requires explicit approval/i.test(claim))) failures.push('claim_boundary must state explicit approval is required');
  if (!request.claim_boundary.some((claim) => /performs no live app action/i.test(claim))) failures.push('claim_boundary must state this performs no live app action');
  if (!request.claim_boundary.some((claim) => /does not call a model/i.test(claim))) failures.push('claim_boundary must state this does not call a model');
  if (!request.claim_boundary.some((claim) => /does not use the network/i.test(claim))) failures.push('claim_boundary must state this does not use the network');
  return failures;
}

function buildReceipt(request, sourceHash, targetFiles, importScan, disabledAdapterResult, gateResults, args, decision) {
  const now = stamp(args);
  return {
    source_adapter_import_receipt: {
      schema_version: 'source_adapter_import_receipt.v0_1',
      id: `source_adapter_import_receipt_${now.replace(/[^0-9TZ]/g, '').toLowerCase()}_${request.id}`,
      request_id: request.id,
      created_at: isoFromStamp(now),
      decision,
      approval_required: true,
      approval_status: 'pending',
      performed_live_action: false,
      checked_scope: [
        'source_adapter_import_request_shape',
        'approval_required_pending',
        'source_file_exists',
        'target_files_exist',
        'active_import_scan',
        'target_file_import_scan',
        'disabled_source_adapter_gate',
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
      gate_results: gateResults,
      source_file: request.source_file,
      source_hash: sourceHash || '0'.repeat(64),
      target_files: targetFiles,
      import_scan: importScan,
      disabled_adapter_result: disabledAdapterResult,
      blocked_capabilities: blockedCapabilities,
      output: {
        type: 'source_adapter_import_receipt',
        message: decision === 'approval_required'
          ? 'Source adapter import is proposed only, pending approval, and not active in app source.'
          : 'Source adapter import proposal blocked without live action.',
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

function gateSourceAdapterImport(payload, args) {
  const { errors, request } = validateShape(payload);
  const failures = [...errors];
  let gateResults = [];
  let sourceHash = '';
  let targetFiles = [];
  let importScan = { import_allowed: false, active_import_count: 0, active_imports: [] };
  let disabledAdapterResult = { ok: false, decision: 'not_run', request_id: '' };

  if (!errors.length) {
    failures.push(...validateRequest(request));
    let sourcePath = '';
    let disabledRequestPath = '';
    let targetPaths = [];
    if (!failures.length) {
      try {
        sourcePath = safeRepoPath(request.source_file, srcRoot, 'source_file');
        disabledRequestPath = safeRepoPath(request.disabled_source_adapter_request, contractDir, 'disabled_source_adapter_request');
        targetPaths = request.target_files.map((targetFile) => safeRepoPath(targetFile, srcRoot, 'target_file'));
      } catch (error) {
        failures.push(error.message);
      }
    }
    if (!failures.length) {
      if (!fs.existsSync(sourcePath)) failures.push(`source_file does not exist: ${request.source_file}`);
      if (!fs.existsSync(disabledRequestPath)) failures.push(`disabled_source_adapter_request does not exist: ${request.disabled_source_adapter_request}`);
      for (const targetPath of targetPaths) {
        if (!fs.existsSync(targetPath)) failures.push(`target_file does not exist: ${relativeToRepo(targetPath)}`);
      }
    }
    if (!failures.length) {
      sourceHash = hashFile(sourcePath);
      importScan = scanActiveImports(sourcePath);
      if (importScan.active_import_count > 0) failures.push('disabled source adapter is already imported by active app source');
      targetFiles = targetPaths.map((targetPath) => targetFileInfo(targetPath, sourcePath));
      for (const targetFile of targetFiles) {
        if (targetFile.imports_adapter) failures.push(`target file already imports adapter: ${targetFile.file}`);
      }
    }
    if (!failures.length) {
      disabledAdapterResult = runDisabledSourceAdapter(disabledRequestPath);
      if (!disabledAdapterResult.ok) failures.push(`disabled source adapter gate failed with decision ${disabledAdapterResult.decision}`);
    }
    if (!failures.length) {
      gateResults = requiredGates.map(runGate);
      for (const gate of gateResults) {
        if (!gate.ok) failures.push(`${gate.id} failed with decision ${gate.decision}`);
      }
    }
  }

  const decision = failures.length ? 'block' : 'approval_required';
  const receipt = errors.length ? null : buildReceipt(request, sourceHash, targetFiles, importScan, disabledAdapterResult, gateResults, args, decision);
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
      'source adapter import is proposal-only and pending approval',
      'disabled source adapter is still not imported by active app source',
      'no live app, gateway, model, network, route, deploy, arbitrary UI, or durable memory action was performed',
    ] : [],
    request_id: request.id || '',
    surface: request.surface || '',
    approval_required: true,
    approval_status: 'pending',
    performed_live_action: false,
    import_scan: importScan,
    disabled_adapter_result: disabledAdapterResult,
    gate_results: gateResults,
    receipt,
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function selfTest() {
  const proposed = gateSourceAdapterImport(readJson(defaults.request, 'source adapter import request'), { ...defaults, timestamp: '20260707T000500Z' });
  assert(proposed.ok, 'source adapter import proposal should pass as approval_required');
  assert(proposed.decision === 'approval_required', 'source adapter import proposal should require approval');
  assert(proposed.import_scan.active_import_count === 0, 'source adapter import should not be active');

  const blocked = gateSourceAdapterImport(readJson(path.join(contractDir, 'source_adapter_import.live_blocked.example.json'), 'blocked source adapter import request'), { ...defaults, timestamp: '20260707T000501Z' });
  assert(!blocked.ok, 'live source adapter import request should block');
  assert(blocked.failures.some((failure) => failure.includes('apply_import_enabled')), 'blocked request should fail on apply import');

  const unsafePath = JSON.parse(JSON.stringify(readJson(defaults.request, 'source adapter import request')));
  unsafePath.source_adapter_import_request.target_files = ['../outside.jsx'];
  const unsafe = gateSourceAdapterImport(unsafePath, { ...defaults, timestamp: '20260707T000502Z' });
  assert(!unsafe.ok, 'unsafe target path should block');

  return {
    ok: true,
    checks: [
      { name: 'source adapter import proposal requires approval', decision: proposed.decision },
      { name: 'live source adapter import request blocks', decision: blocked.decision },
      { name: 'unsafe target path blocks', decision: unsafe.decision },
    ],
  };
}

try {
  const args = parseArgs(process.argv.slice(2));
  const result = args.selfTest
    ? selfTest()
    : gateSourceAdapterImport(readJson(args.request, 'source adapter import request'), args);
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
