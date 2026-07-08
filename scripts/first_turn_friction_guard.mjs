#!/usr/bin/env node
import { assessLocalMirrorSense } from '../src/lib/local-mirror-sense.js';
import { makeOfflineMirrorResult } from '../src/lib/first-turn-fallback.js';
import fs from 'node:fs';

const failures = [];

function check(condition, label) {
    if (!condition) failures.push(label);
}

const normalDraftAsk = 'Can you help me make this safer before I send it?';
const normalSense = assessLocalMirrorSense(normalDraftAsk);
const normalFallback = makeOfflineMirrorResult(normalDraftAsk, 'network');
const softPrivateSense = assessLocalMirrorSense('My email is paul@example.com and I need a short reply.');
const todayActionFallback = makeOfflineMirrorResult('I need one sentence I can send to one person today.', 'network');
const currentFactFallback = makeOfflineMirrorResult('What are the latest competitors doing today?', 'network');
const tireShoppingFallback = makeOfflineMirrorResult('I am looking for tires online', 'network');
const vagueFallback = makeOfflineMirrorResult('website', 'network');
const resetFallback = makeOfflineMirrorResult('I keep going in circles and losing the thread.', 'network');
const startHelpFallback = makeOfflineMirrorResult('I do not know what to ask', 'network');

check(!normalSense.blocked, 'normal send/safe wording must not be locally blocked');
check(softPrivateSense.softPrivate && !softPrivateSense.blocked, 'soft personal details should be cautioned, not blocked');
check(
    normalFallback.mirror?.reflection !== 'Private details can stay with you. I can work with the shape.',
    'normal send/safe wording must not become the privacy fallback'
);
check(
    todayActionFallback.truth_state?.status !== 'needs_checking',
    'bare action timing like "send today" must not become a source-check warning'
);
check(
    currentFactFallback.truth_state?.status === 'needs_checking',
    'current competitor/fact asks must still trigger source-check warning'
);
check(
    tireShoppingFallback.truth_state?.status === 'needs_checking',
    'online shopping asks like tires must trigger answer-first source mode'
);
check(
    vagueFallback.mirror?.reflection === 'Give me one direction and I can start.',
    'short vague asks should feel startable, not scolded'
);
check(
    resetFallback.mirror?.reflection === 'There are too many things open. Make one of them lighter first.',
    'reset fallback should sound humane, not like internal thread management'
);
check(
    startHelpFallback.mirror?.move === 'Pick one below, or type one messy sentence.',
    'not-sure-what-to-ask fallback should offer starter choices instead of another question'
);

const explicitSecret = 'My password is examplepassword123 and I need help.';
const secretSense = assessLocalMirrorSense(explicitSecret);
const secretFallback = makeOfflineMirrorResult(explicitSecret, 'network');

check(secretSense.blocked, 'explicit password sentence must be locally blocked');
check(
    secretFallback.mirror?.move === 'Replace names, keys, or account details with [name], [secret], or [detail], then send the version you can share.',
    'explicit password sentence must become the privacy fallback'
);
check(
    !/held the turn|stuck point|private facts|sensitive context|what are you trying to move/i.test(JSON.stringify(secretFallback)),
    'privacy fallback must not sound scary, clinical, or accusatory'
);

const homePage = fs.readFileSync(new URL('../src/pages/HomePage.jsx', import.meta.url), 'utf8');
const deviceExperience = fs.readFileSync(new URL('../src/pages/DeviceExperience.jsx', import.meta.url), 'utf8');
const mirrorFeedback = fs.readFileSync(new URL('../src/components/MirrorFeedback.jsx', import.meta.url), 'utf8');
const mirrorState = fs.readFileSync(new URL('../src/lib/mirror-state.js', import.meta.url), 'utf8');
check(
    homePage.includes("createArtifact(item.artifactKind || 'draft', {") && homePage.includes('intent: item.intent,'),
    'artifact follow-up must pass its exact artifact instruction, not fall back to the old turn'
);
check(
    homePage.indexOf("action: 'artifact'") < homePage.indexOf("label: 'Another angle'"),
    'artifact follow-up should appear before another reflection angle'
);
check(
    !/Challenge it|what I may be avoiding/i.test(mirrorFeedback),
    'repair follow-up must check the answer without harsh motive-reading'
);
check(
    /label:\s*'Check it'/.test(mirrorFeedback),
    'repair follow-up should offer a plain answer check'
);
check(
    deviceExperience.includes('Start with one thing you want help with.') &&
    deviceExperience.includes('What do you want to move right now?') &&
    !deviceExperience.includes('What is one thing you are stuck on?'),
    'phone device page should invite the user instead of leading with stuck language'
);
check(
    homePage.includes('function makeStarterResult') && homePage.includes("setResult(makeStarterResult(item.kind))"),
    'starter buttons should use deterministic first-turn mirrors before model routing'
);
check(
    homePage.includes('function makeStarterFollowupResult') && homePage.includes('starterFollowupKind') && homePage.includes('setResult(starterResult)'),
    'starter second turns should be handled locally before generic model routing'
);
check(
    homePage.includes('function isAnswerFirstAsk') &&
    homePage.includes('function makeAnswerFirstSourceResult') &&
    homePage.includes('source_check_first') &&
    homePage.includes('autoCheck') &&
    homePage.includes('answerFirst'),
    'current info and shopping asks should route directly to answer-first source mode instead of showing a reflection questionnaire'
);
check(
    homePage.includes('function isStartHelpAsk') &&
    homePage.includes('function makeStartHelpResult') &&
    homePage.includes('start_help_result'),
    'not-sure-what-to-ask typed turns should route to a local start helper'
);
check(
    homePage.includes(".test(`${mirror?.reflection || ''} ${mirror?.question || ''} ${mirror?.move || ''}`)") &&
    homePage.includes("label: 'Make'") &&
    homePage.includes("label: 'Understand'"),
    'starter helper follow-ups should show starter choices, not generic repair buttons'
);
check(
    /tires\?\|tyres\?/.test(homePage),
    'source-heavy detector should include tire/tyre shopping language'
);
check(
    /poster\|flyer/.test(homePage) &&
    homePage.includes('const needThing =') &&
    homePage.includes('directAsk || needThing ||'),
    'poster/flyer asks should open creation first even without a magic verb'
);
check(
    homePage.includes("draft?.kind === 'image' && artifactHasImageMedia(draft)") &&
    !homePage.includes("draft?.kind === 'image' && (draft?.media?.data_url || draft?.media?.dataUrl)"),
    'image-ready note must work for stored media URLs, not only inline data URLs'
);
check(
    mirrorState.includes('continuityLedger: []') &&
    mirrorState.includes('export function saveContinuityEntry') &&
    mirrorState.includes('export function clearContinuityLedger'),
    'browser-local continuity must be explicit, user-approved, and clearable'
);
check(
    homePage.includes('saveContinuityEntry({') &&
    homePage.includes('Saved by you') &&
    homePage.includes('Only on this browser. Delete it anytime.') &&
    homePage.includes("['typed', 'follow_up', 'surface', 'saved_context']"),
    'saved continuity UI must stay user-owned, local, and source-check capable'
);
for (const starterPhrase of [
    'Make the first usable version',
    'Put the options side by side',
    'Do not fix the whole system',
    'Make it plain first',
    "Let's do something fun",
    'Good. Make it playful, but still make something you can use.',
    'Meet Active Mirror',
    'Think of me as the second pass before the world sees your first draft.',
    'Page is enough. Make the first screen, not the whole site.',
    'Clarity is the fix. Remove one choice',
]) {
    check(homePage.includes(starterPhrase), `starter mirror missing phrase: ${starterPhrase}`);
}

if (failures.length) {
    console.error('First-turn friction guard FAILED.');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
}

console.log('First-turn friction guard PASSED.');
