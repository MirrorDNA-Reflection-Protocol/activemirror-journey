const SOURCE_HEAVY_PATTERN = /\b(latest|current|recent|online|web|source|sources|research|competitor|market|verify|check|claim|fact|facts|numbers|price|pricing|paper|study|studies|report|released|launched|who is doing|as of|today|right now|this week|this month|this year)\b/i;

const PRIVATE_PATTERN = /\bsk-(?:ant|proj|live|test|[a-z0-9])[a-z0-9_-]{16,}\b|\b(?:api[_-]?key|secret|token|password|passcode|private[_-]?key)\s*[:=]\s*\S{6,}|\b(?:my|the)\s+(?:password|passcode|otp|pin|token|api key|secret)\s+(?:is|=|:)\s*\S{4,}|-----BEGIN [A-Z ]*PRIVATE KEY-----/i;

function clean(value = '') {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function scrubRubberStampCopy(value = '') {
    return String(value || '')
        .replace(/\bperfect\b/gi, 'complete')
        .replace(/\bbrilliant\b/gi, 'clear')
        .replace(/\bgenius\b/gi, 'clever')
        .replace(/\bamazing\b/gi, 'strong');
}

function scrubArtifactCopy(artifact = {}) {
    return {
        ...artifact,
        title: scrubRubberStampCopy(artifact.title),
        body: scrubRubberStampCopy(artifact.body),
        checklist: Array.isArray(artifact.checklist)
            ? artifact.checklist.map((item) => scrubRubberStampCopy(item))
            : artifact.checklist,
        checks: Array.isArray(artifact.checks)
            ? artifact.checks.map((item) => scrubRubberStampCopy(item))
            : artifact.checks,
    };
}

function statusFor({ intent, route, fallback, kind }) {
    const text = clean(intent);
    if (PRIVATE_PATTERN.test(text)) {
        return {
            status: 'failed',
            label: 'Needs edit',
            note: 'Remove private details before using this.',
            reason: 'The request appears to include a credential or private secret.',
        };
    }

    if (SOURCE_HEAVY_PATTERN.test(text)) {
        return {
            status: 'needs_check',
            label: 'Check first',
            note: 'Use after a quick source check.',
            reason: 'The output depends on current or external facts.',
        };
    }

    if ((fallback || route === 'local_fallback') && kind === 'image') {
        return {
            status: 'draft',
            label: 'Prompt ready',
            note: 'Image generation is busy. Try again or use the prompt.',
            reason: 'The live image route was unavailable, so a usable prompt was made locally.',
        };
    }

    if (fallback || route === 'local_fallback') {
        return {
            status: 'draft',
            label: 'Draft',
            note: 'Rough first pass. Edit before sending.',
            reason: 'The live route was unavailable, so this was made locally.',
        };
    }

    return {
        status: 'passed',
        label: 'Ready',
        note: 'Ready. Review once before sending.',
        reason: 'The output passed the local promotion checks for this task.',
    };
}

export function buildArtifactChallenge({
    intent = '',
    kind = 'draft',
    route = 'gateway',
    fallback = false,
    source = 'artifact',
} = {}) {
    const state = statusFor({ intent, route, fallback, kind });
    const canPromote = state.status === 'passed' || state.status === 'draft';

    return {
        schema_version: 'active_mirror.artifact_challenge.v1',
        accepted: true,
        task: 'Create a useful output without overclaiming readiness.',
        source,
        artifact_kind: kind,
        status: state.status,
        label: state.label,
        user_note: state.note,
        reason: state.reason,
        checked_scope: [
            'artifact kind selected',
            'private-secret pattern checked',
            'current-fact pattern checked',
            'promotion status assigned',
        ],
        unchecked_scope: [
            'external factual accuracy',
            'legal, medical, or financial suitability',
            'recipient reaction',
        ],
        consequence_if_failed: [
            'do not claim done',
            'do not promote to durable memory',
            'do not deploy or publish',
            'repair or source-check before reuse',
        ],
        promotion: {
            can_copy: state.status !== 'failed',
            can_share: state.status === 'passed' || state.status === 'draft',
            can_claim_done: canPromote,
            can_remember: false,
            can_deploy: false,
        },
        recovery: state.status === 'failed'
            ? 'Remove private details and regenerate.'
            : state.status === 'needs_check'
                ? 'Run a source check before relying on it.'
                : 'Use it, then adjust after feedback.',
    };
}

export function attachArtifactChallenge(artifact, options = {}) {
    if (!artifact) return artifact;
    const safeArtifact = scrubArtifactCopy(artifact);
    const challenge = artifact.challenge || buildArtifactChallenge({
        ...options,
        kind: safeArtifact.kind || options.kind || 'draft',
    });
    return {
        ...safeArtifact,
        challenge,
    };
}
