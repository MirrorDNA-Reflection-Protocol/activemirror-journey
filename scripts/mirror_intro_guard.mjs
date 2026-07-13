#!/usr/bin/env node
import fs from 'node:fs';

const homePage = fs.readFileSync(new URL('../src/pages/HomePage.jsx', import.meta.url), 'utf8');
const mirrorState = fs.readFileSync(new URL('../src/lib/mirror-state.js', import.meta.url), 'utf8');
const introPanel = fs.readFileSync(new URL('../src/components/MirrorIntroPanel.jsx', import.meta.url), 'utf8');
const failures = [];

function check(condition, label) {
    if (!condition) failures.push(label);
}

check(mirrorState.includes('mirrorIntro: null'), 'state must reserve an explicit local intro slot');
check(mirrorState.includes('export function getMirrorIntro'), 'state must expose an intro reader');
check(mirrorState.includes('export function saveMirrorIntro'), 'state must expose an explicit intro save action');
check(mirrorState.includes('export function deleteMirrorIntro'), 'state must expose an intro delete action');
check(mirrorState.includes("authority: 'draft'"), 'stored intros must remain draft-only');
check(mirrorState.includes('disclosure: true'), 'stored intros must carry disclosure');
check(mirrorState.includes("throw new Error('invalid_mirror_intro')"), 'intro saves must reject incomplete grants');

for (const phrase of [
    'Set exactly what Active Mirror can say in a first exchange.',
    'Always disclosed',
    'It says it is an AI representative.',
    'Draft only',
    'Nothing is sent from here.',
    'Human handoff',
    'It hands back before commitments or private disclosure.',
    'Saved only after you choose it, on this browser.',
    'Remove this intro from this browser?',
]) {
    check(introPanel.includes(phrase), `intro panel missing required disclosure: ${phrase}`);
}

check(!introPanel.includes('navigator.share'), 'intro panel must not expose native sharing');
check(!introPanel.includes('window.open'), 'intro panel must not open an external channel');
check(homePage.includes('MirrorIntroPanel'), 'home page must mount the intro panel');
check(homePage.includes('getMirrorIntro()'), 'home page must restore only the explicit local intro');
check(homePage.includes('saveMirrorIntro(draft)'), 'home page must save the intro through the state layer');
check(homePage.includes('deleteMirrorIntro()'), 'home page must delete the intro through the state layer');
check(homePage.includes("mirror_intro_saved") && homePage.includes("mirror_intro_deleted"), 'home page must leave non-content event receipts for save and delete');
check(homePage.includes("{mirrorIntro ? 'Intro ready' : 'Make an intro'}"), 'home page must expose the intro entry point without turning it into the primary CTA');

const refineStart = homePage.indexOf('function refineMirrorIntro(preview) {');
const refineEnd = homePage.indexOf('\n    function currentChatSnapshot', refineStart);
const refineBlock = refineStart >= 0 && refineEnd > refineStart
    ? homePage.slice(refineStart, refineEnd)
    : '';
check(Boolean(refineBlock), 'home page must provide a draft-to-chat refinement path');
check(refineBlock.includes('setText('), 'refine path must prefill the composer');
check(!refineBlock.includes('reflect('), 'refine path must not auto-send a representative message');

if (failures.length) {
    console.error('Mirror intro guard FAILED.');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
}

console.log('Mirror intro guard PASSED.');
