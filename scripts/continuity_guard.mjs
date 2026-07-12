#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

const files = {
  agents: 'AGENTS.md',
  ledger: 'docs/CONTINUITY_LEDGER.md',
  topicTemplate: 'docs/TOPIC_PACKET_TEMPLATE.md',
  topicPacketsReadme: 'docs/topic-packets/README.md',
  contextBuilder: 'scripts/mirror_context_pack_builder.mjs',
  packageJson: 'package.json',
  taskContract: '.mirror/TASK_CONTRACT.yaml',
  agentPolicy: '.mirror/AGENT_POLICY.yaml',
};

function read(relativePath) {
  const absolute = path.join(root, relativePath);
  if (!fs.existsSync(absolute)) {
    failures.push(`missing required continuity file: ${relativePath}`);
    return '';
  }
  return fs.readFileSync(absolute, 'utf8');
}

function requireIncludes(text, needle, label) {
  if (!text.includes(needle)) failures.push(`missing ${label}: ${needle}`);
}

function requireSection(text, heading, file) {
  requireIncludes(text, `## ${heading}`, `${file} section`);
}

function requireBullet(text, bullet, file) {
  requireIncludes(text, `- ${bullet}`, `${file} bullet`);
}

const agents = read(files.agents);
const ledger = read(files.ledger);
const topicTemplate = read(files.topicTemplate);
const topicPacketsReadme = read(files.topicPacketsReadme);
const contextBuilder = read(files.contextBuilder);
const packageJsonText = read(files.packageJson);
const taskContract = read(files.taskContract);
const agentPolicy = read(files.agentPolicy);

if (ledger) {
  for (const section of [
    'Current Lane',
    'Standing Rules',
    'Active Gates',
    'Current State: 2026-07-05',
    'Known Limits',
    'Current Local Dirt To Preserve',
    'Next Safe Move',
    'Topic Ingestion Protocol',
    'Topic Packets',
    'Update Rule',
    'Ledger Entries',
  ]) {
    requireSection(ledger, section, files.ledger);
  }

  for (const phrase of [
    'Product source repo: `/Users/mirror-pro/repos/activemirror-journey`',
    'Deploy bridge repo: `/Users/mirror-pro/repos/active-mirror-site`',
    'Live app: `https://activemirror.ai/app/`',
    'SWFI/client work: out of scope unless Paul explicitly switches lanes.',
    'Start from the user outcome, not the architecture.',
    'Keep the first screen simple: `Bring the unfinished thing.`',
    'Bad news, partial status, and limits must be stated before success language.',
    'For a topic that will last more than one session, create a topic packet from `docs/TOPIC_PACKET_TEMPLATE.md`, save it under `docs/topic-packets/`',
  ]) {
    requireIncludes(ledger, phrase, `${files.ledger} continuity phrase`);
  }

  for (const gate of [
    '`npm run guard:language`',
    '`npm run build:deploy`',
    '`npm run guard:dossiers`',
    '`npm run smoke:browser`',
    '`npm run canary:prod`',
  ]) {
    requireBullet(ledger, gate, files.ledger);
  }
}

if (topicTemplate) {
  requireIncludes(topicTemplate, 'Copy this file into `docs/topic-packets/<topic-slug>.md`', `${files.topicTemplate} destination rule`);
  for (const section of [
    'Topic',
    'User Outcome',
    'Why It Matters',
    'Source Material',
    'Rules And Boundaries',
    'Tools And Gates',
    'Current Proof',
    'Bad News',
    'Next Move',
    'Update Log',
  ]) {
    requireSection(topicTemplate, section, files.topicTemplate);
  }
}

if (topicPacketsReadme) {
  requireIncludes(topicPacketsReadme, '`npm run mirror:context` automatically includes every Markdown file in this folder', `${files.topicPacketsReadme} auto-ingest rule`);
}

if (agents) {
  requireIncludes(agents, 'docs/CONTINUITY_LEDGER.md', `${files.agents} ledger pointer`);
  requireIncludes(agents, 'docs/TOPIC_PACKET_TEMPLATE.md', `${files.agents} topic packet pointer`);
  requireIncludes(agents, 'docs/topic-packets/', `${files.agents} topic packet folder pointer`);
  requireIncludes(agents, '`npm run mirror:context` automatically includes those packets.', `${files.agents} context auto-ingest pointer`);
  requireIncludes(agents, 'Do not rely on chat memory alone.', `${files.agents} chat-memory warning`);
}

if (contextBuilder) {
  requireIncludes(contextBuilder, "const topicPacketDir = 'docs/topic-packets';", `${files.contextBuilder} topic packet directory`);
  requireIncludes(contextBuilder, "'docs/CONTINUITY_LEDGER.md'", `${files.contextBuilder} ledger automatic include`);
  requireIncludes(contextBuilder, "'docs/TOPIC_PACKET_TEMPLATE.md'", `${files.contextBuilder} template automatic include`);
  requireIncludes(contextBuilder, 'walkMarkdownFiles(topicPacketDir)', `${files.contextBuilder} topic packet discovery`);
  requireIncludes(contextBuilder, 'const outputPath =', `${files.contextBuilder} output path support`);
  requireIncludes(contextBuilder, 'function writeOutput(text)', `${files.contextBuilder} file output writer`);
  requireIncludes(contextBuilder, 'function renderBundle()', `${files.contextBuilder} readable bundle renderer`);
}

if (packageJsonText) {
  try {
    const scripts = JSON.parse(packageJsonText).scripts || {};
    if (scripts['mirror:context'] !== 'node scripts/mirror_context_pack_builder.mjs') {
      failures.push('package.json mirror:context does not point to scripts/mirror_context_pack_builder.mjs');
    }
    if (!String(scripts.prebuild || '').includes('npm run guard:continuity')) {
      failures.push('package.json prebuild does not run guard:continuity');
    }
    if (scripts['mirror:context:bundle'] !== 'node scripts/mirror_context_pack_builder.mjs --bundle --out outputs/active-mirror-context-bundle.md') {
      failures.push('package.json mirror:context:bundle is missing or changed');
    }
  } catch (error) {
    failures.push(`package.json is not valid JSON: ${error.message}`);
  }
}

if (taskContract && agentPolicy) {
  requireIncludes(taskContract, 'repo: /Users/mirror-pro/repos/activemirror-journey', `${files.taskContract} canonical source repo`);
  requireIncludes(taskContract, 'deploy_bridge_repo: /Users/mirror-pro/repos/active-mirror-site', `${files.taskContract} deploy bridge repo`);
  requireIncludes(agentPolicy, 'canonical_product_repo: /Users/mirror-pro/repos/activemirror-journey', `${files.agentPolicy} canonical source repo`);
  requireIncludes(agentPolicy, 'deploy_repo: /Users/mirror-pro/repos/active-mirror-site', `${files.agentPolicy} deploy repo`);
}

if (failures.length) {
  console.error('Continuity guard FAILED.');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Continuity guard PASSED.');
