#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const defaultVault = '/Users/mirror-pro/MirrorDNA-Vault';
const vaultRoot = process.env.ACTIVE_MIRROR_OBSIDIAN_VAULT || defaultVault;
const targetDir = process.env.ACTIVE_MIRROR_OBSIDIAN_WIKI_DIR
    || path.join(vaultRoot, '01_ACTIVE', 'ActiveMirror', 'Product Wiki');

const sourceSets = [
    {
        id: 'wiki',
        title: 'Wiki',
        sourceDir: path.join(repoRoot, 'docs', 'wiki'),
        canonicalSource: 'activemirror-journey/docs/wiki',
        targetSubdir: '',
    },
    {
        id: 'dossiers',
        title: 'Dossiers',
        sourceDir: path.join(repoRoot, 'docs', 'dossiers'),
        canonicalSource: 'activemirror-journey/docs/dossiers',
        targetSubdir: 'Dossiers',
    },
];

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');

function sha256(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
}

function writeFile(filePath, content) {
    if (dryRun) return;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
}

function gitValue(argsList) {
    try {
        return execFileSync('git', argsList, { cwd: repoRoot, encoding: 'utf8' }).trim();
    } catch {
        return 'unknown';
    }
}

if (!fs.existsSync(vaultRoot)) {
    console.error(`missing Obsidian vault root: ${vaultRoot}`);
    process.exit(1);
}

for (const sourceSet of sourceSets) {
    if (!fs.existsSync(sourceSet.sourceDir)) {
        console.error(`missing ${sourceSet.id} dir: ${sourceSet.sourceDir}`);
        process.exit(1);
    }
}

const syncedAt = new Date().toISOString();
const commit = gitValue(['rev-parse', '--short', 'HEAD']);
const branch = gitValue(['branch', '--show-current']);
const sourceRepo = repoRoot;
const records = [];

const titleMap = {
    'README.md': 'Start Here',
    'TEMPLATE.md': 'Template',
    'active-mirror-front-door.md': 'Active Mirror Front Door',
    'amos-proof-layer-intake.md': 'AMOS Proof Layer Intake',
    'build-and-deploy.md': 'Build And Deploy',
    'current-product-map.md': 'Current Product Map',
    'language-guide.md': 'Language Guide',
    'model-challenge-contract.md': 'Model Challenge Contract',
    'offline-online-owned-ai-position.md': 'Offline Online Owned AI Position',
    'open-questions.md': 'Open Questions',
    'user-flow.md': 'User Flow',
    'wiki-and-continuity.md': 'Wiki And Continuity',
};

for (const sourceSet of sourceSets) {
    const files = fs.readdirSync(sourceSet.sourceDir)
        .filter((file) => file.endsWith('.md'))
        .sort();

    if (!files.length) {
        console.error(`no markdown files found in ${sourceSet.sourceDir}`);
        process.exit(1);
    }

    for (const file of files) {
        const body = fs.readFileSync(path.join(sourceSet.sourceDir, file), 'utf8');
        const sourcePath = path.join(sourceSet.sourceDir, file);
        const sourceHash = sha256(body);
        const mirrored = [
            '---',
            'generated: true',
            'mirror_status: obsidian_reference_copy',
            `canonical_source: ${sourceSet.canonicalSource}`,
            `source_set: ${sourceSet.id}`,
            `source_file: ${sourcePath}`,
            `source_sha256: ${sourceHash}`,
            `source_commit: ${commit}`,
            `synced_at: ${syncedAt}`,
            'tags:',
            '  - active-mirror',
            '  - product-wiki',
            `  - ${sourceSet.id}`,
            '---',
            '',
            '> Reference copy. Edit the repo docs, then run `npm run wiki:obsidian` to refresh this note.',
            '',
            body.trimEnd(),
            '',
        ].join('\n');
        const targetPath = path.join(targetDir, sourceSet.targetSubdir, file);
        writeFile(targetPath, mirrored);
        records.push({
            set: sourceSet.id,
            file,
            title: titleMap[file] || file.replace(/\.md$/, ''),
            sourcePath,
            targetPath,
            sourceHash,
            bytes: Buffer.byteLength(mirrored),
        });
    }
}

const wikiRecords = records.filter((record) => record.set === 'wiki');
const dossierRecords = records.filter((record) => record.set === 'dossiers');

const indexLines = [
    '---',
    'generated: true',
    'mirror_status: obsidian_reference_index',
    'canonical_source: activemirror-journey/docs/wiki + activemirror-journey/docs/dossiers',
    `source_repo: ${sourceRepo}`,
    `source_branch: ${branch}`,
    `source_commit: ${commit}`,
    `synced_at: ${syncedAt}`,
    'tags:',
    '  - active-mirror',
    '  - product-wiki',
    '---',
    '',
    '# Active Mirror Product Wiki',
    '',
    'This is an Obsidian reference mirror of the repo-local product wiki and dossiers.',
    '',
    'Canonical sources:',
    '',
    '- `/Users/mirror-pro/repos/activemirror-journey/docs/wiki/`',
    '- `/Users/mirror-pro/repos/activemirror-journey/docs/dossiers/`',
    '',
    '## Wiki',
    '',
    ...wikiRecords.map((record) => `- [[${record.file.replace(/\.md$/, '')}|${record.title}]]`),
    '',
    '## Dossiers',
    '',
    ...dossierRecords.map((record) => `- [[Dossiers/${record.file.replace(/\.md$/, '')}|${record.title}]]`),
    '',
    '## Rule',
    '',
    'Edit the repo docs first. Refresh this mirror with:',
    '',
    '```bash',
    'npm run wiki:obsidian',
    '```',
    '',
];

writeFile(path.join(targetDir, 'Active Mirror Product Wiki.md'), indexLines.join('\n'));

const receiptLines = [
    '---',
    'generated: true',
    'mirror_status: obsidian_sync_receipt',
    'canonical_source: activemirror-journey/docs/wiki + activemirror-journey/docs/dossiers',
    `source_commit: ${commit}`,
    `source_branch: ${branch}`,
    `synced_at: ${syncedAt}`,
    'tags:',
    '  - active-mirror',
    '  - product-wiki',
    '  - receipt',
    '---',
    '',
    '# Active Mirror Wiki Sync Receipt',
    '',
    `- Source repo: \`${sourceRepo}\``,
    `- Source commit: \`${commit}\``,
    '- Source folders:',
    ...sourceSets.map((sourceSet) => `  - \`${sourceSet.sourceDir}\``),
    `- Target folder: \`${targetDir}\``,
    `- Mode: ${dryRun ? 'dry-run' : 'write'}`,
    '',
    '## Files',
    '',
    ...records.map((record) => `- \`${record.set}/${record.file}\` -> \`${path.relative(vaultRoot, record.targetPath)}\` sha256:\`${record.sourceHash}\``),
    '',
    '## Boundary',
    '',
    '- This sync copies public repo docs only.',
    '- It does not export private vault content.',
    '- It does not delete stale Obsidian notes.',
    '',
];

writeFile(path.join(targetDir, '_SYNC_RECEIPT.md'), receiptLines.join('\n'));

console.log(JSON.stringify({
    ok: true,
    dryRun,
    sources: sourceSets.map((sourceSet) => sourceSet.sourceDir),
    target: targetDir,
    source_commit: commit,
    files: records.map((record) => ({
        set: record.set,
        file: record.file,
        sha256: record.sourceHash,
        bytes: record.bytes,
    })),
}, null, 2));
