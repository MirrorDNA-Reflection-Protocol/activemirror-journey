#!/usr/bin/env node
import { buildArtifactChallenge, attachArtifactChallenge } from '../src/lib/challenge-packet.js';

const failures = [];

function check(condition, label) {
    if (!condition) failures.push(label);
}

const normal = buildArtifactChallenge({
    intent: 'Write a short note asking for feedback.',
    kind: 'draft',
    route: 'gateway',
});
check(normal.status === 'passed', 'normal gateway artifact should pass');
check(normal.promotion.can_claim_done, 'passed artifact can claim done for the artifact task');
check(!normal.promotion.can_remember, 'artifact challenge must not promote memory');
check(!normal.promotion.can_deploy, 'artifact challenge must not allow deploy');

const local = buildArtifactChallenge({
    intent: 'Write a short note asking for feedback.',
    kind: 'draft',
    route: 'local_fallback',
    fallback: true,
});
check(local.status === 'draft', 'local fallback artifact should be draft');
check(local.consequence_if_failed.includes('do not claim done'), 'challenge needs no-done consequence');

const current = buildArtifactChallenge({
    intent: 'Summarize the latest AI browser competitors today.',
    kind: 'doc',
    route: 'gateway',
});
check(current.status === 'needs_check', 'current/external fact artifact should need check');
check(!current.promotion.can_claim_done, 'needs-check artifact cannot claim done');
check(/source check/i.test(current.recovery), 'needs-check recovery should route to source check');

const secret = buildArtifactChallenge({
    intent: 'My password is examplepassword123, write an email with it.',
    kind: 'draft',
    route: 'gateway',
});
check(secret.status === 'failed', 'secret-bearing artifact should fail promotion');
check(!secret.promotion.can_copy, 'failed artifact cannot be promoted for copy');
check(!secret.promotion.can_share, 'failed artifact cannot be promoted for share');

const wrapped = attachArtifactChallenge({ kind: 'doc', title: 'Test', body: 'Body' }, {
    intent: 'Write a short note.',
    kind: 'doc',
});
check(wrapped.challenge?.schema_version === 'active_mirror.artifact_challenge.v1', 'wrapped artifact gets challenge packet');

if (failures.length) {
    console.error('Challenge packet guard FAILED.');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
}

console.log('Challenge packet guard PASSED.');

