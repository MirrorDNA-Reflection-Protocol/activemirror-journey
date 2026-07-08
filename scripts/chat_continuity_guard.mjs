#!/usr/bin/env node
import fs from 'node:fs';

const homePage = fs.readFileSync(new URL('../src/pages/HomePage.jsx', import.meta.url), 'utf8');
const mirrorState = fs.readFileSync(new URL('../src/lib/mirror-state.js', import.meta.url), 'utf8');

const required = [
    [mirrorState, 'homeChat:', 'state includes explicit home chat continuity slot'],
    [mirrorState, 'export function getHomeChatContinuity', 'state exports chat continuity reader'],
    [mirrorState, 'export function setHomeChatContinuityEnabled', 'state exports opt-in toggle'],
    [mirrorState, 'export function saveHomeChatContinuity', 'state exports gated chat writer'],
    [mirrorState, 'export function clearHomeChatContinuity', 'state exports chat clear function'],
    [mirrorState, "if (!current.homeChat?.enabled) return", 'chat writer refuses hidden memory writes'],
    [mirrorState, "result?.kind === 'privacy_hold'", 'privacy-hold turns do not persist sensitive intent'],
    [homePage, 'getHomeChatContinuity()', 'home page reads chat continuity on boot'],
    [homePage, 'saveHomeChatContinuity({', 'home page persists only through state API'],
    [homePage, 'setHomeChatContinuityEnabled(true', 'home page has explicit enable path'],
    [homePage, 'clearHomeChatContinuity({ keepEnabled:', 'home page can clear current chat'],
    [homePage, 'Keep chat', 'visible opt-in copy stays plain'],
    [homePage, 'Chat kept here', 'visible enabled state is plain'],
    [homePage, 'Clear', 'visible clear control exists'],
];

const failures = required
    .filter(([text, needle]) => !text.includes(needle))
    .map(([, , label]) => label);

if (failures.length) {
    console.error('Chat continuity guard FAILED.');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
}

console.log('Chat continuity guard PASSED.');
