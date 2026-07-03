#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const canonicalProductRepo = '/Users/mirror-pro/repos/activemirror-journey';
const canonicalDeployRepo = '/Users/mirror-pro/repos/active-mirror-site';

const requiredFiles = [
    '.mirror/README.md',
    '.mirror/STATUS.md',
    '.mirror/PLAN.md',
    '.mirror/DECISIONS.md',
    '.mirror/RISKS.md',
    '.mirror/TASK_CONTRACT.yaml',
    '.mirror/AGENT_POLICY.yaml',
    '.mirror/CONTEXT_PACK.yaml',
    '.mirror/schemas/task_contract.schema.json',
    '.mirror/schemas/agent_policy.schema.json',
    '.mirror/schemas/context_pack.schema.json',
    '.mirror/schemas/memory_update_proposal.schema.json',
    '.mirror/schemas/evaluation_report.schema.json',
    '.mirror/schemas/approval_request.schema.json',
    '.mirror/MEMORY_UPDATE_PROPOSALS/TEMPLATE.yaml',
    '.mirror/EVALS/TEMPLATE.yaml',
    '.mirror/APPROVAL_REQUESTS/TEMPLATE.yaml',
    '.mirror/FILE_EXPORT_REGISTRY.md',
];

const requiredDirs = [
    '.mirror/APPROVAL_REQUESTS',
    '.mirror/AUDIT_LOGS',
    '.mirror/EVALS',
    '.mirror/MEMORY_UPDATE_PROPOSALS',
    '.mirror/ROLLBACKS',
    '.mirror/SCREENSHOTS',
    '.mirror/SKILLS',
];

const activeTextFiles = [
    'AGENTS.md',
    'README.md',
    'CANONICAL_SITE.md',
    'llms.txt',
    'public/llms.txt',
];

const staleArchitectureClaims = [
    'Sovereign AI Infrastructure',
    'sovereign AI operating system',
    '141 Claude Code skills',
    'Zero cloud dependencies',
    'Full local inference via Ollama',
    'Cognitive Kernel',
    'Cryptographic SHA256 hash-chain provenance',
    'Temperature-as-Architecture',
];

function read(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function exists(relativePath) {
    return fs.existsSync(path.join(root, relativePath));
}

function requireFile(relativePath) {
    if (!exists(relativePath)) failures.push(`missing required control file: ${relativePath}`);
}

function requireDir(relativePath) {
    const full = path.join(root, relativePath);
    if (!fs.existsSync(full) || !fs.statSync(full).isDirectory()) {
        failures.push(`missing required control directory: ${relativePath}`);
    }
}

function requireIncludes(text, needle, label) {
    if (!text.includes(needle)) failures.push(`missing ${label}: ${needle}`);
}

function requireMatch(text, pattern, label) {
    if (!pattern.test(text)) failures.push(`missing ${label}: ${pattern}`);
}

function listValues(text, key) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = text.match(new RegExp(`^${escapedKey}:\\n((?:\\s+- .+\\n?)+)`, 'm'));
    if (!match) return [];
    return match[1]
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.startsWith('- '))
        .map((line) => line.slice(2).trim());
}

function requireListItems(text, key, items) {
    const values = listValues(text, key);
    if (!values.length) {
        failures.push(`missing list: ${key}`);
        return;
    }
    for (const item of items) {
        if (!values.includes(item)) failures.push(`missing ${key} item: ${item}`);
    }
}

function scalarValue(text, key) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = text.match(new RegExp(`^\\s*${escapedKey}:\\s*(.+?)\\s*$`, 'm'));
    return match ? match[1].trim().replace(/^["']|["']$/g, '') : '';
}

function loadPackageScripts(packagePath) {
    try {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        return pkg.scripts || {};
    } catch {
        return null;
    }
}

function listWorkflowFiles() {
    const workflowDir = path.join(root, '.github', 'workflows');
    if (!fs.existsSync(workflowDir)) return [];
    return fs.readdirSync(workflowDir)
        .filter((file) => /\.ya?ml$/i.test(file))
        .map((file) => path.join('.github', 'workflows', file));
}

function scriptNameFromCommand(command) {
    const match = String(command || '').match(/^npm run ([\w:.-]+)$/);
    return match ? match[1] : '';
}

function walkFiles(dir) {
    const out = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) out.push(...walkFiles(full));
        if (entry.isFile()) out.push(full);
    }
    return out;
}

function isIgnoredControlArtifact(relativePath) {
    const name = path.basename(relativePath);
    return name === '.DS_Store' || name.endsWith('.swp') || name.endsWith('.swo') || name.endsWith('~');
}

for (const file of requiredFiles) requireFile(file);
for (const dir of requiredDirs) requireDir(dir);

if (!failures.length) {
    for (const schemaPath of requiredFiles.filter((file) => file.endsWith('.schema.json'))) {
        try {
            JSON.parse(read(schemaPath));
        } catch (error) {
            failures.push(`invalid JSON schema ${schemaPath}: ${error.message}`);
        }
    }
}

if (exists('.mirror')) {
    for (const full of walkFiles(path.join(root, '.mirror'))) {
        const relative = path.relative(root, full);
        if (isIgnoredControlArtifact(relative)) continue;
        const bytes = fs.readFileSync(full);
        if (bytes.some((byte) => byte > 0x7f)) failures.push(`non-ASCII control file: ${relative}`);
        const text = bytes.toString('utf8');
        if (/\bsk-(?:ant|proj|live|test|[a-z0-9])[a-z0-9_-]{16,}\b/i.test(text)) {
            failures.push(`secret-like API key in control file: ${relative}`);
        }
        if (/-----BEGIN [A-Z ]*PRIVATE KEY-----/i.test(text)) {
            failures.push(`private key material in control file: ${relative}`);
        }
    }
}

if (exists('.mirror/TASK_CONTRACT.yaml')) {
    const task = read('.mirror/TASK_CONTRACT.yaml');
    const policy = exists('.mirror/AGENT_POLICY.yaml') ? read('.mirror/AGENT_POLICY.yaml') : '';
    requireIncludes(task, 'task_contract:', 'task contract root');
    requireIncludes(task, `repo: ${canonicalProductRepo}`, 'canonical repo path');
    requireIncludes(task, `deploy_bridge_repo: ${canonicalDeployRepo}`, 'deploy bridge repo path');
    requireListItems(task, '  allowed_paths', ['.mirror/', 'src/', 'scripts/', 'public/', 'docs/']);
    requireListItems(task, '  forbidden_paths', ['.env', 'secrets/', 'node_modules/', 'dist/']);
    requireListItems(task, '  forbidden_scopes', ['SWFI implementation', 'client confidential data', 'provider key disclosure']);
    requireListItems(task, '  required_outputs', ['changed_files', 'tests_or_checks_run', 'bad_news_or_limits', 'rollback_note']);
    requireListItems(task, '  approval_required_for', ['adding dependencies', 'changing provider secrets', 'durable memory promotion']);
    requireListItems(task, '    local', ['npm run guard:mirror', 'npm run guard:front-door', 'npm run guard:friction', 'npm run guard:redaction', 'npm run truth']);
    requireListItems(task, '    deploy_repo', ['npm run build', 'npm run copy:audit', 'npm run canary:prod']);

    if (policy) {
        const taskRepo = scalarValue(task, 'repo');
        const taskDeployRepo = scalarValue(task, 'deploy_bridge_repo');
        if (taskRepo !== scalarValue(policy, 'canonical_product_repo')) {
            failures.push('task repo and agent policy canonical_product_repo disagree');
        }
        if (taskDeployRepo !== scalarValue(policy, 'deploy_repo')) {
            failures.push('task deploy_bridge_repo and agent policy deploy_repo disagree');
        }

        const allowedPaths = listValues(task, '  allowed_paths');
        const writeAllowed = listValues(policy, '  write_allowed');
        for (const writePath of writeAllowed) {
            if (!allowedPaths.includes(writePath)) {
                failures.push(`agent write_allowed is outside task allowed_paths: ${writePath}`);
            }
        }
    }

    const localScripts = loadPackageScripts(path.join(root, 'package.json'));
    if (!localScripts) {
        failures.push('cannot read package.json scripts for local verification commands');
    } else {
        for (const command of listValues(task, '    local')) {
            const script = scriptNameFromCommand(command);
            if (!script) {
                failures.push(`local verification command must be an npm script: ${command}`);
            } else if (!localScripts[script]) {
                failures.push(`local verification script missing from package.json: ${script}`);
            }
        }
    }

    const deployRepo = scalarValue(task, 'deploy_bridge_repo');
    const deployPackagePath = path.join(deployRepo, 'package.json');
    const deployScripts = fs.existsSync(deployPackagePath) ? loadPackageScripts(deployPackagePath) : null;
    if (deployScripts) {
        for (const command of listValues(task, '    deploy_repo')) {
            const script = scriptNameFromCommand(command);
            if (!script) {
                failures.push(`deploy verification command must be an npm script: ${command}`);
            } else if (!deployScripts[script]) {
                failures.push(`deploy verification script missing from deploy package.json: ${script}`);
            }
        }
    }
}

if (exists('.mirror/AGENT_POLICY.yaml')) {
    const policy = read('.mirror/AGENT_POLICY.yaml');
    requireIncludes(policy, 'agent_policy:', 'agent policy root');
    requireIncludes(policy, 'lane: Active Mirror', 'active lane');
    requireIncludes(policy, `canonical_product_repo: ${canonicalProductRepo}`, 'canonical product repo');
    requireIncludes(policy, `deploy_repo: ${canonicalDeployRepo}`, 'deploy repo');
    requireListItems(policy, '  principles', [
        'user_outcome_before_architecture_explanation',
        'no_sycophancy',
        'no_assumptions_without_labeling',
        'source_sensitive_claims_need_checking',
        'artifacts_should_be_actual_outputs',
        'active_mirror_identity_only',
    ]);
    requireListItems(policy, '  blocked', [
        'provider key disclosure',
        'SWFI implementation inside this repo',
        'hidden memory mutation',
        'raw private vault export',
        'arbitrary generated UI execution',
    ]);
    requireIncludes(policy, 'product_source_first: true', 'product source first deploy rule');
    requireIncludes(policy, 'package_to_deploy_repo_after_checks: true', 'package after checks deploy rule');
    requireIncludes(policy, 'verify_public_hash_after_pages_deploy: true', 'public hash deploy rule');
}

if (exists('.mirror/CONTEXT_PACK.yaml')) {
    const context = read('.mirror/CONTEXT_PACK.yaml');
    requireIncludes(context, 'context_pack:', 'context pack root');
    requireListItems(context, '  include', [
        'AGENTS.md',
        '.mirror/STATUS.md',
        '.mirror/PLAN.md',
        '.mirror/DECISIONS.md',
        '.mirror/RISKS.md',
        '.mirror/TASK_CONTRACT.yaml',
        '.mirror/AGENT_POLICY.yaml',
        'src/pages/HomePage.jsx',
    ]);
    requireListItems(context, '  exclude', ['SWFI specs and implementation', 'provider secrets', 'unrelated untracked docs']);
    requireMatch(context, /^\s+app_url: https:\/\/activemirror\.ai\/app\/$/m, 'live app URL');
    requireMatch(context, /^\s+app_bundle: index-[A-Za-z0-9_-]+\.js$/m, 'live app bundle hash shape');
    requireMatch(context, /^\s+gateway_version: \d{4}-\d{2}-\d{2}-.+$/m, 'gateway version shape');

    for (const includePath of listValues(context, '  include')) {
        if (includePath.startsWith('/')) {
            failures.push(`context include must be repo-relative, not absolute: ${includePath}`);
        } else if (!exists(includePath)) {
            failures.push(`context include path does not exist: ${includePath}`);
        }
    }
}

if (exists('AGENTS.md')) {
    const agents = read('AGENTS.md');
    requireIncludes(agents, '.mirror/TASK_CONTRACT.yaml', 'AGENTS mirror task contract pointer');
    requireIncludes(agents, '.mirror/AGENT_POLICY.yaml', 'AGENTS mirror agent policy pointer');
    requireIncludes(agents, '.mirror/STATUS.md', 'AGENTS mirror status pointer');
    requireIncludes(agents, 'Keep SWFI/client work out of this repo.', 'AGENTS SWFI separation pointer');
}

if (exists('package.json')) {
    const pkg = JSON.parse(read('package.json'));
    if (pkg.name !== 'activemirror-journey') failures.push(`package.json name must be activemirror-journey, found ${pkg.name}`);
    if (!String(pkg.repository?.url || '').includes('activemirror-journey')) {
        failures.push('package.json repository must point to activemirror-journey');
    }
    if (/\bsovereign\b/i.test(String(pkg.description || ''))) {
        failures.push('package.json description must not use broad sovereign positioning');
    }
    const scripts = pkg.scripts || {};
    if (scripts['mirror:report'] !== 'node scripts/mirror_control_report.mjs') {
        failures.push('package.json must expose mirror:report');
    }
    if (scripts['mirror:context'] !== 'node scripts/mirror_context_pack_builder.mjs') {
        failures.push('package.json must expose mirror:context');
    }
}

if (exists('package-lock.json')) {
    const lock = JSON.parse(read('package-lock.json'));
    if (lock.name !== 'activemirror-journey') failures.push(`package-lock.json name must be activemirror-journey, found ${lock.name}`);
    if (lock.packages?.['']?.name !== 'activemirror-journey') {
        failures.push('package-lock root package name must be activemirror-journey');
    }
}

for (const workflowPath of listWorkflowFiles()) {
    const text = read(workflowPath);
    const forbiddenWorkflowMarkers = [
        { pattern: /\bcontents:\s*write\b/i, label: 'write permission' },
        { pattern: /\bgit push\b/i, label: 'git push' },
        { pattern: /\bOPENAI_API_KEY\b/i, label: 'provider secret' },
        { pattern: /actions-gh-pages/i, label: 'GitHub Pages publish action' },
        { pattern: /deploy-pages/i, label: 'GitHub Pages deploy action' },
        { pattern: /upload-pages-artifact/i, label: 'GitHub Pages artifact action' },
        { pattern: /^\s*cname\s*:/im, label: 'CNAME publish setting' },
    ];
    for (const marker of forbiddenWorkflowMarkers) {
        if (marker.pattern.test(text)) failures.push(`${workflowPath} contains forbidden product-source workflow marker: ${marker.label}`);
    }
}

for (const file of ['llms.txt', 'public/llms.txt']) {
    if (!exists(file)) continue;
    const text = read(file);
    for (const claim of staleArchitectureClaims) {
        if (text.includes(claim)) failures.push(`${file} contains stale architecture-first claim: ${claim}`);
    }
    requireIncludes(text, 'Canonical setup flow: https://activemirror.ai/app/id/', `${file} canonical setup flow`);
}

if (exists('README.md')) {
    const readme = read('README.md');
    requireIncludes(readme, 'Reflection route: `/` (`/mirror` redirects here)', 'README canonical reflection route');
    requireIncludes(readme, 'BrainScan / MirrorSeed route: `/id`, with aliases `/start`, `/mirrorseed`, `/brainscan`, and `/scan`', 'README canonical setup route');
}

if (exists('CANONICAL_SITE.md')) {
    const canonical = read('CANONICAL_SITE.md');
    requireIncludes(canonical, 'Build the product surface users touch first: `/`, `/id`,', 'CANONICAL_SITE active route list');
    if (/Build the product surface users touch first:.*\/mirror.*\/start/s.test(canonical)) {
        failures.push('CANONICAL_SITE still presents /mirror and /start as primary active routes');
    }
}

if (exists('.mirror/DECISIONS.md')) {
    requireIncludes(read('.mirror/DECISIONS.md'), 'SWFI remains separate from Active Mirror product language, memory, and UI.', 'SWFI separation decision');
}

if (exists('.mirror/RISKS.md')) {
    const risks = read('.mirror/RISKS.md');
    requireIncludes(risks, 'Check the public bundle hash after every deploy.', 'public bundle hash mitigation');
    requireIncludes(risks, 'Generated code/file features need sandbox and file export controls before public expansion.', 'generated-file risk');
}

if (exists('.mirror/FILE_EXPORT_REGISTRY.md')) {
    const registry = read('.mirror/FILE_EXPORT_REGISTRY.md');
    requireIncludes(registry, 'No public downloadable file export is active from this registry.', 'inactive file export registry status');
    requireIncludes(registry, 'Active Mirror must not let a model create raw download authority.', 'file export authority rule');
    requireIncludes(registry, 'Reject path traversal.', 'file export traversal check');
    requireIncludes(registry, 'Current Exports', 'file export current exports section');
    requireIncludes(registry, 'None.', 'file export empty current state');
}

if (exists('.mirror/APPROVAL_REQUESTS/TEMPLATE.yaml')) {
    const approval = read('.mirror/APPROVAL_REQUESTS/TEMPLATE.yaml');
    requireIncludes(approval, 'approval_request:', 'approval request root');
    requireIncludes(approval, 'approval_required: true', 'approval required flag');
    requireIncludes(approval, 'status: pending', 'approval pending status');
    requireListItems(approval, '  affected_paths', ['"repo-relative/path"']);
    requireListItems(approval, '  checked_scope', ['"What has already been checked."']);
    requireListItems(approval, '  unchecked_scope', ['"What remains unchecked."']);
    requireListItems(approval, '  rollback', ['"How to reverse this if it goes wrong."']);
}

if (exists('.mirror')) {
    const allowedSwfiLine = /\b(SWFI remains separate|SWFI\/client|SWFI specs and implementation|SWFI implementation|SWFI or client-specific implementation|SWFI separation|Keep SWFI|out of this repo|contaminate Active Mirror|forbidden_scopes)\b/i;
    const swfiScanFiles = [
        ...activeTextFiles.filter(exists),
        ...walkFiles(path.join(root, '.mirror')).map((full) => path.relative(root, full)),
    ].filter((relative) => !isIgnoredControlArtifact(relative));
    for (const relative of swfiScanFiles) {
        const text = read(relative);
        text.split(/\r?\n/).forEach((line, index) => {
            if (/\bSWFI\b/i.test(line) && !allowedSwfiLine.test(line)) {
                failures.push(`${relative}:${index + 1} SWFI mention must be boundary/forbidden/exclude language: ${line.trim()}`);
            }
        });
    }
}

if (failures.length) {
    console.error('Mirror control guard FAILED.');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
}

console.log('Mirror control guard PASSED.');
