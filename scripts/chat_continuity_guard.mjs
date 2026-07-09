#!/usr/bin/env node
import fs from 'node:fs';

const homePage = fs.readFileSync(new URL('../src/pages/HomePage.jsx', import.meta.url), 'utf8');
const mirrorState = fs.readFileSync(new URL('../src/lib/mirror-state.js', import.meta.url), 'utf8');

const required = [
    [mirrorState, 'homeChat:', 'state includes explicit home chat continuity slot'],
    [mirrorState, 'savedThreads: []', 'state includes explicit saved chat list'],
    [mirrorState, 'export function getHomeChatContinuity', 'state exports chat continuity reader'],
    [mirrorState, 'export function getSessionHomeChat', 'state exports session chat reader'],
    [mirrorState, 'export function saveSessionHomeChat', 'state exports refresh-recovery chat writer'],
    [mirrorState, 'export function clearSessionHomeChat', 'state exports refresh-recovery chat clearer'],
    [mirrorState, 'export function setHomeChatContinuityEnabled', 'state exports opt-in toggle'],
    [mirrorState, 'export function saveHomeChatContinuity', 'state exports gated chat writer'],
    [mirrorState, 'export function clearHomeChatContinuity', 'state exports chat clear function'],
    [mirrorState, 'export function saveHomeChatThread', 'state exports explicit saved chat writer'],
    [mirrorState, 'export function restoreHomeChatThread', 'state exports saved chat restore function'],
    [mirrorState, 'export function deleteHomeChatThread', 'state exports saved chat delete function'],
    [mirrorState, "if (!current.enabled) return current", 'chat writer refuses hidden memory writes'],
    [mirrorState, "result?.kind === 'privacy_hold'", 'privacy-hold turns do not persist sensitive intent'],
    [mirrorState, 'normalizeSavedHomeChats', 'saved chats are normalized through the state layer'],
    [homePage, 'getHomeChatContinuity()', 'home page reads chat continuity on boot'],
    [homePage, 'getSessionHomeChat()', 'home page reads refresh-recovery session chat on boot'],
    [homePage, 'saveSessionHomeChat(snapshot)', 'home page saves refresh-recovery chat through state API'],
    [homePage, 'clearSessionHomeChat()', 'home page clears refresh-recovery chat through state API'],
    [homePage, 'saveHomeChatContinuity({', 'home page persists only through state API'],
    [homePage, 'saveHomeChatThread(snapshot)', 'home page saves chats only through state API'],
    [homePage, 'restoreHomeChatThread(entry.id || entry.savedAt)', 'home page restores saved chats only through state API'],
    [homePage, 'deleteHomeChatThread(key)', 'home page deletes saved chats only through state API'],
    [homePage, 'setHomeChatContinuityEnabled(true', 'home page has explicit enable path'],
    [homePage, 'clearHomeChatContinuity({ keepEnabled:', 'home page can clear current chat'],
    [homePage, 'showKeepChatNudge', 'home page nudges after a useful answer instead of hiding the option'],
    [homePage, 'This chat survives refresh here. Keep it on this browser for later?', 'visible post-answer keep-chat nudge explains refresh recovery plainly'],
    [homePage, 'Keep it', 'visible post-answer enable action stays plain'],
    [homePage, 'Save chat', 'visible saved chat action stays plain'],
    [homePage, 'Saved chats', 'visible saved chat section stays plain'],
    [homePage, 'Open chat', 'visible saved chat restore action stays plain'],
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
