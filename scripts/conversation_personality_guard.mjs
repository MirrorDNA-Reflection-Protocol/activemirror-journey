#!/usr/bin/env node
import fs from 'node:fs';
import {
    CONVERSATION_PERSONALITY_CONTRACT,
    SESSION_CONTEXT_MAX_MESSAGES,
    assessLocalMirrorSense,
    buildSessionContextEnvelope,
    conversationRouteFor,
} from '../src/lib/local-mirror-sense.js';
import {
    getSessionHomeChat,
    saveHomeChatThread,
    saveSessionHomeChat,
    setHomeChatContinuityEnabled,
} from '../src/lib/mirror-state.js';

const failures = [];

function check(condition, label) {
    if (!condition) failures.push(label);
}

function memoryStorage() {
    const values = new Map();
    return {
        getItem: (key) => values.has(key) ? values.get(key) : null,
        setItem: (key, value) => values.set(key, String(value)),
        removeItem: (key) => values.delete(key),
        clear: () => values.clear(),
    };
}

globalThis.localStorage = memoryStorage();
globalThis.sessionStorage = memoryStorage();

for (const intent of [
    'I just want to talk. No advice.',
    'Hey, how are you?',
    'Tell me a joke and be silly with me.',
]) {
    check(conversationRouteFor(intent) === 'chat', `typed conversation should use chat: ${intent}`);
}

for (const intent of [
    'Help me decide between these options.',
    'What should my next move be?',
    'No advice, just talk, but help me decide between A and B.',
    'I am building solo with a rough idea for a weekly customer brief, but no dashboard or signup flow yet.',
]) {
    check(conversationRouteFor(intent) === 'reflection', `decision or next-move ask should use reflection: ${intent}`);
}

check(
    conversationRouteFor('Just chat with me.', { source: 'follow_up' }) === 'reflection',
    'only a typed user message may switch into conversation routing'
);

const setupSense = assessLocalMirrorSense('Just talk with me.', {
    seed: {
        archetypeName: 'The Connector',
        preferences: [{ preference: 'reply_style', answer: 'Warm' }],
    },
});
const messages = [
    { role: 'user', content: 'user 1' },
    { role: 'assistant', content: 'assistant 1' },
    { role: 'user', content: 'user 2' },
    { role: 'assistant', content: 'assistant 2' },
    { role: 'user', content: 'Email me at paul@example.com with token=abcdef123456' },
    { role: 'assistant', content: `assistant 3 ${'x'.repeat(600)}` },
];
const context = buildSessionContextEnvelope({
    mode: 'conversation',
    tone: setupSense.toneCue,
    messages,
});

check(SESSION_CONTEXT_MAX_MESSAGES === 4, 'session context contract must cap prior messages at four');
check(context.schema_version === 'session_context.v0_1', 'session context must be versioned');
check(context.mode === 'conversation', 'session context must declare conversation mode');
check(context.tone === 'warm', 'setup tone must become an allowlisted session cue');
check(context.source === 'session', 'session context source must be session');
check(context.durable === false, 'session context must explicitly remain non-durable');
check(context.turns.length === 4 && context.turns[0].content === 'user 2', 'session context must retain only the newest four messages');
check(context.turns.every((message) => message.content.length <= 480), 'session context messages must stay within 480 characters');
check(!JSON.stringify(context.turns).includes('paul@example.com'), 'session context must mask email addresses');
check(!JSON.stringify(context.turns).includes('abcdef123456'), 'session context must mask credential-shaped values');
check(
    CONVERSATION_PERSONALITY_CONTRACT.voice === 'curious, calm, perceptive, lightly opinionated, occasionally playful',
    'personality voice contract must remain stable'
);
check(CONVERSATION_PERSONALITY_CONTRACT.boundaries === 'never a guru or therapist', 'personality boundary must remain stable');

const thread = {
    lastIntent: 'A normal conversation turn',
    result: {
        ok: true,
        mirror: { reflection: 'A normal answer.' },
        session_context: { should: 'never persist' },
    },
    sessionContextMessages: messages,
};
saveSessionHomeChat(thread);
const restoredSession = getSessionHomeChat();
check(restoredSession?.sessionContextMessages?.length === 4, 'tab session must restore bounded conversation context');

setHomeChatContinuityEnabled(true, thread);
saveHomeChatThread(thread);
const durableState = localStorage.getItem('mirrorState_v1') || '';
check(!durableState.includes('sessionContextMessages'), 'kept chats must exclude ephemeral context messages');
check(!durableState.includes('session_context'), 'durable state must recursively strip request context envelopes');
check(!durableState.includes('paul@example.com'), 'durable state must not contain ephemeral email context');

const homePage = fs.readFileSync(new URL('../src/pages/HomePage.jsx', import.meta.url), 'utf8');
check(homePage.includes('VITE_ACTIVE_MIRROR_GATEWAY_ORIGIN'), 'home page must accept the local QA origin override');
check(homePage.includes("const DEFAULT_MIRROR_API_ORIGIN = 'https://gateway.activemirror.ai'"), 'production origin must remain the default');
check(homePage.includes('route: gatewayRoute'), 'gateway request must use the selected chat or reflection route');
check(homePage.includes('...(sessionContext ? { session_context: sessionContext } : {})'), 'only chat requests may include session context');
check(homePage.includes('responseMode: data.responseMode || data.response_mode || responseMode'), 'response mode must be normalized defensively');
check(homePage.includes('function isConversationResult'), 'home page must recognize conversation responses');
check(homePage.includes('function makeOfflineConversationResult'), 'network fallback must preserve conversation voice');
check(homePage.includes('No homework, no timer, and no stealth coaching.'), 'just-talk fallback must avoid mechanical coaching');
check(homePage.includes('!isConversation && focusText') && homePage.includes('!isConversation && moveText'), 'conversation response must not force question or move panels');
check(homePage.includes('!isConversationResult(result)') && homePage.includes("!['privacy_hold', 'setup_ready', 'artifact_first']"), 'conversation response must not force action follow-ups');
check(homePage.includes('currentChatSnapshot({ includeSessionContext: true })'), 'tab recovery must include ephemeral context explicitly');
check(homePage.includes('setSessionContextMessages([])'), 'restored durable chats must start without hidden prior-turn context');
check(
    (homePage.match(/createDisabledSourceAdapterProjection/g) || []).length === 1,
    'disabled source adapter must remain import-only and uninvoked'
);

if (failures.length) {
    console.error('Conversation personality guard FAILED.');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
}

console.log('Conversation personality guard PASSED.');
