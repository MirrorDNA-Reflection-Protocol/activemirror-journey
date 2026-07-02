#!/usr/bin/env node
import { assessLocalMirrorSense } from '../src/lib/local-mirror-sense.js';
import { makeOfflineMirrorResult } from '../src/lib/first-turn-fallback.js';

const failures = [];

function check(condition, label) {
    if (!condition) failures.push(label);
}

const normalDraftAsk = 'Can you help me make this safer before I send it?';
const normalSense = assessLocalMirrorSense(normalDraftAsk);
const normalFallback = makeOfflineMirrorResult(normalDraftAsk, 'network');

check(!normalSense.blocked, 'normal send/safe wording must not be locally blocked');
check(
    normalFallback.mirror?.reflection !== 'Private details can stay with you. I can work with the shape.',
    'normal send/safe wording must not become the privacy fallback'
);

const explicitSecret = 'My password is examplepassword123 and I need help.';
const secretSense = assessLocalMirrorSense(explicitSecret);
const secretFallback = makeOfflineMirrorResult(explicitSecret, 'network');

check(secretSense.blocked, 'explicit password sentence must be locally blocked');
check(
    secretFallback.mirror?.move === 'Replace private details with [name] or [secret], then send one sentence.',
    'explicit password sentence must become the privacy fallback'
);

if (failures.length) {
    console.error('First-turn friction guard FAILED.');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
}

console.log('First-turn friction guard PASSED.');
