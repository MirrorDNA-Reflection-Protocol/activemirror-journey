#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();

function read(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function exists(relativePath) {
    return fs.existsSync(path.join(root, relativePath));
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

function section(text, heading) {
    const lines = text.split(/\r?\n/);
    const target = `## ${heading}`;
    const start = lines.findIndex((line) => line.trim() === target);
    if (start === -1) return '';
    const body = [];
    for (let index = start + 1; index < lines.length; index += 1) {
        if (lines[index].startsWith('## ')) break;
        body.push(lines[index]);
    }
    return body.join('\n').trim();
}

function bullets(markdown) {
    return markdown
        .split(/\r?\n/)
        .map((line) => line.trim())
        .map((line) => {
            if (line.startsWith('- ')) return line.slice(2).trim();
            const numbered = line.match(/^\d+\.\s+(.+)$/);
            return numbered ? numbered[1].trim() : '';
        })
        .filter(Boolean);
}

function gitStatus() {
    try {
        return execFileSync('git', ['status', '--short'], { cwd: root, encoding: 'utf8' })
            .split(/\r?\n/)
            .map((line) => line.trimEnd())
            .filter(Boolean);
    } catch (error) {
        return [`git status failed: ${error.message}`];
    }
}

function printList(title, items) {
    console.log(`${title}:`);
    if (!items.length) {
        console.log('- none');
        return;
    }
    for (const item of items) console.log(`- ${item}`);
}

const status = exists('.mirror/STATUS.md') ? read('.mirror/STATUS.md') : '';
const risks = exists('.mirror/RISKS.md') ? read('.mirror/RISKS.md') : '';
const task = exists('.mirror/TASK_CONTRACT.yaml') ? read('.mirror/TASK_CONTRACT.yaml') : '';
const context = exists('.mirror/CONTEXT_PACK.yaml') ? read('.mirror/CONTEXT_PACK.yaml') : '';
const dirty = gitStatus();

const checkedScope = [
    ...bullets(section(status, 'Verified Checks')),
    ...listValues(task, '    local').map((command) => `required local check: ${command}`),
].filter(Boolean);

const uncheckedScope = [
    ...bullets(section(status, 'Bad News / Known Limits')),
    ...listValues(context, '  exclude').map((item) => `excluded from context pack: ${item}`),
].filter(Boolean);

const badNews = [
    ...bullets(section(status, 'Bad News / Known Limits')),
    ...bullets(section(status, 'Unrelated Local Dirt')).map((item) => `unrelated local dirt: ${item}`),
    ...dirty
        .filter((line) => !line.includes('.mirror/APPROVAL_REQUESTS/') && !line.includes('.mirror/schemas/approval_request.schema.json'))
        .map((line) => `working tree: ${line}`),
].filter(Boolean);

const next = exists('.mirror/PLAN.md')
    ? [...bullets(section(read('.mirror/PLAN.md'), 'Next Control-Plane Slice'))]
    : [];

console.log('ACTIVE MIRROR CONTROL REPORT');
console.log(`repo: ${root}`);
console.log('');
printList('CHECKED_SCOPE', checkedScope);
console.log('');
printList('UNCHECKED_SCOPE', uncheckedScope);
console.log('');
printList('BAD_NEWS', [...new Set(badNews)]);
console.log('');
printList('NEXT', next);
console.log('');
console.log(`risk_file_present: ${exists('.mirror/RISKS.md')}`);
console.log(`context_pack_present: ${exists('.mirror/CONTEXT_PACK.yaml')}`);
console.log(`approval_template_present: ${exists('.mirror/APPROVAL_REQUESTS/TEMPLATE.yaml')}`);
console.log(`file_export_registry_present: ${exists('.mirror/FILE_EXPORT_REGISTRY.md')}`);
