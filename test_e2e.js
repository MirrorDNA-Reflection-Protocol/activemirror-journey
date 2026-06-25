#!/usr/bin/env node
/**
 * ⟡ Active Mirror E2E Test Suite
 * 
 * Tests the full flow: Auth → Message → MirrorGate → Response
 * Run: node test_e2e.js
 */

const BASE_URL = 'http://localhost:8082';
const PROD_URL = 'https://proxy.activemirror.ai';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
  dim: '\x1b[2m'
};

function log(status, message) {
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⏳';
  const color = status === 'pass' ? colors.green : status === 'fail' ? colors.red : colors.yellow;
  console.log(`${color}${icon} ${message}${colors.reset}`);
}

async function fetchJSON(url, options = {}) {
  try {
    const res = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers }
    });
    return { ok: res.ok, status: res.status, data: await res.json() };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function fetchStream(url, body) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    if (!res.ok) return { ok: false, status: res.status };
    
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    const chunks = [];
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value);
      text.split('\n').filter(Boolean).forEach(line => {
        try {
          chunks.push(JSON.parse(line));
        } catch {}
      });
    }
    
    return { ok: true, chunks };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

async function testHealth(url, name) {
  log('running', `${name}: Health check...`);
  const res = await fetchJSON(`${url}/health`);
  
  if (res.ok && res.data?.status === 'ok') {
    log('pass', `${name}: Health OK (v${res.data.version} - ${res.data.codename})`);
    return true;
  } else {
    log('fail', `${name}: Health check failed`);
    return false;
  }
}

async function testRules(url) {
  log('running', 'Fetching rules...');
  const res = await fetchJSON(`${url}/rules`);
  
  if (res.ok && res.data?.input_rules && res.data?.output_rules) {
    log('pass', `Rules: ${res.data.input_rules.length} input, ${res.data.output_rules.length} output`);
    return true;
  } else {
    log('fail', 'Failed to fetch rules');
    return false;
  }
}

async function testMirrorEndpoint(url) {
  log('running', 'Testing /mirror endpoint...');
  
  const res = await fetchStream(`${url}/mirror`, {
    message: 'I feel overwhelmed with work',
    history: [],
    dial: 0.5
  });
  
  if (!res.ok) {
    log('fail', 'Mirror endpoint failed');
    return false;
  }
  
  // Check for audit header
  const audit = res.chunks.find(c => c.audit);
  if (!audit) {
    log('fail', 'No audit header in response');
    return false;
  }
  
  // Check for content chunks
  const content = res.chunks.filter(c => c.status === 'chunk');
  if (content.length === 0) {
    log('fail', 'No content chunks in response');
    return false;
  }
  
  const fullResponse = content.map(c => c.content).join('');
  log('pass', `Mirror response: "${fullResponse.substring(0, 50)}..."`);
  log('pass', `Audit: gate=${audit.audit.gate}, rules_checked=${audit.audit.rules_checked}`);
  
  return true;
}

async function testFlightLog(url) {
  log('running', 'Checking flight log...');
  const res = await fetchJSON(`${url}/flight-log?limit=5`);
  
  if (res.ok && Array.isArray(res.data?.events)) {
    log('pass', `Flight log: ${res.data.events.length} recent events`);
    return true;
  } else {
    log('fail', 'Failed to fetch flight log');
    return false;
  }
}

async function testConfessions(url) {
  log('running', 'Checking confessions endpoint...');
  const res = await fetchJSON(`${url}/confessions?limit=5`);
  
  if (res.ok && res.data?.booth === 'confession') {
    log('pass', `Confessions: ${res.data.count} archived`);
    return true;
  } else {
    log('fail', 'Failed to fetch confessions');
    return false;
  }
}

async function testSuperego(url) {
  log('running', 'Checking superego status...');
  const res = await fetchJSON(`${url}/superego-status`);
  
  if (res.ok && res.data?.surveillance) {
    log('pass', `Superego: surveillance=${res.data.surveillance}, strikes=${res.data.current_strikes}`);
    return true;
  } else {
    log('fail', 'Failed to fetch superego status');
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
  console.log('\n⟡ Active Mirror E2E Tests\n');
  console.log(`${colors.dim}Local: ${BASE_URL}`);
  console.log(`Prod:  ${PROD_URL}${colors.reset}\n`);
  
  const results = {
    local: { passed: 0, failed: 0 },
    prod: { passed: 0, failed: 0 }
  };
  
  // Local tests
  console.log('─── Local Tests ───\n');
  
  for (const [name, test] of Object.entries({
    'Health': () => testHealth(BASE_URL, 'Local'),
    'Rules': () => testRules(BASE_URL),
    'Mirror': () => testMirrorEndpoint(BASE_URL),
    'Flight Log': () => testFlightLog(BASE_URL),
    'Confessions': () => testConfessions(BASE_URL),
    'Superego': () => testSuperego(BASE_URL),
  })) {
    const passed = await test();
    if (passed) results.local.passed++;
    else results.local.failed++;
  }
  
  // Prod tests (lighter)
  console.log('\n─── Production Tests ───\n');
  
  for (const [name, test] of Object.entries({
    'Health': () => testHealth(PROD_URL, 'Prod'),
    'Rules': () => testRules(PROD_URL),
    'Superego': () => testSuperego(PROD_URL),
  })) {
    const passed = await test();
    if (passed) results.prod.passed++;
    else results.prod.failed++;
  }
  
  // Summary
  console.log('\n─── Summary ───\n');
  console.log(`Local:  ${results.local.passed} passed, ${results.local.failed} failed`);
  console.log(`Prod:   ${results.prod.passed} passed, ${results.prod.failed} failed`);
  
  const totalFailed = results.local.failed + results.prod.failed;
  process.exit(totalFailed > 0 ? 1 : 0);
}

main().catch(console.error);
