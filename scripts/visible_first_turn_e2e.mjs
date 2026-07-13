#!/usr/bin/env node

import assert from 'node:assert/strict';
import process from 'node:process';
import { chromium } from 'playwright';

const baseUrl = new URL(process.env.ACTIVE_MIRROR_E2E_BASE_URL || 'http://127.0.0.1:4179/app/').href;

const roughAsk = 'I am building solo: I have two customer interviews and a rough idea for a weekly retention brief for independent cafes, but no dashboard or signup flow yet.';
const workingRead = 'Working read: Skip the dashboard for now. The smallest credible loop is one weekly brief that turns the two interviews into a single test for one cafe owner.';
const nextDraft = 'Next draft: "Friday retention read: 1) the customer pattern, 2) the offer to test this week, 3) the reply to send today."';

const selectors = {
    moment: '[data-testid="mirror-moment"]',
    intentEcho: '[data-testid="mirror-intent-echo"]',
    observation: '[data-testid="mirror-moment-observation"]',
    sayThis: '[data-testid="mirror-moment-say-this"]',
    threadRecord: '[data-testid="mirror-thread-record"]',
    privateRecord: '[data-testid="mirror-private-record"]',
    evidence: '[data-testid="mirror-evidence"]',
};

const reflectionFixture = {
    ok: true,
    fallback: false,
    route: { capability: 'reflection', source: 'visible_first_turn_e2e' },
    mirror: {
        reflection: workingRead,
        question: 'What could you send after the next two interviews?',
        move: nextDraft,
        visual: {
            kind: 'reframe',
            left: 'Build a dashboard before learning the loop',
            right: 'Run one weekly brief with one owner first',
        },
        receipt: {
            context_used: 'Only the solo-builder rough ask in this test.',
            context_excluded: 'No private memory, saved notes, or external data.',
            memory_decision: 'Nothing saved.',
        },
    },
};

const viewports = [
    { label: 'desktop', viewport: { width: 1440, height: 900 } },
    { label: 'mobile', viewport: { width: 390, height: 844 } },
];

function compactText(value = '') {
    return String(value).replace(/\s+/g, ' ').trim();
}

function assertIncludes(actual, expected, label) {
    assert.ok(
        compactText(actual).includes(compactText(expected)),
        `${label} did not include the expected text. Actual: ${JSON.stringify(compactText(actual))}`,
    );
}

function errorDetail(error) {
    return error instanceof Error ? error.stack || error.message : String(error);
}

async function runViewport(browser, config) {
    const gatewayRequests = [];
    const pageErrors = [];
    const context = await browser.newContext({
        viewport: config.viewport,
        colorScheme: 'dark',
        locale: 'en-IN',
        serviceWorkers: 'block',
    });

    try {
        await context.route('**/v1/mirror/create**', async (route) => {
            const request = route.request();
            let payload = null;
            try {
                payload = request.postDataJSON();
            } catch {
                payload = request.postData();
            }
            gatewayRequests.push({ method: request.method(), url: request.url(), payload });
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'no-store',
                    'X-Active-Mirror-E2E-Fixture': 'visible-first-turn',
                },
                body: JSON.stringify(reflectionFixture),
            });
        });

        await context.route('**/v1/events**', async (route) => {
            await route.fulfill({
                status: 204,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'no-store',
                    'X-Active-Mirror-E2E-Fixture': 'privacy-event',
                },
            });
        });

        const page = await context.newPage();
        page.on('pageerror', (error) => pageErrors.push(error.message));

        await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
        const intentInput = page.locator('#active-mirror-intent');
        await intentInput.waitFor({ state: 'visible' });
        await intentInput.fill(roughAsk);

        const gatewayResponse = page.waitForResponse((response) => (
            response.request().method() === 'POST'
            && new URL(response.url()).pathname.endsWith('/v1/mirror/create')
        ));
        await intentInput.press('Enter');
        await gatewayResponse;

        const moment = page.locator(`${selectors.moment}:visible`).first();
        const intentEcho = page.locator(`${selectors.intentEcho}:visible`).first();
        const observation = page.locator(`${selectors.observation}:visible`).first();
        const sayThis = page.locator(`${selectors.sayThis}:visible`).first();
        const threadRecord = page.locator(`${selectors.threadRecord}:visible`).first();
        const evidence = page.locator(`${selectors.evidence}:visible`).first();
        await Promise.all([
            moment.waitFor({ state: 'visible' }),
            intentEcho.waitFor({ state: 'visible' }),
            observation.waitFor({ state: 'visible' }),
            sayThis.waitFor({ state: 'visible' }),
            threadRecord.waitFor({ state: 'visible' }),
            evidence.waitFor({ state: 'visible' }),
        ]);
        await moment.scrollIntoViewIfNeeded();

        const [momentText, echoedIntent, observationText, sayThisText, threadRecordText] = await Promise.all([
            moment.innerText(),
            intentEcho.innerText(),
            observation.innerText(),
            sayThis.innerText(),
            threadRecord.innerText(),
        ]);

        assert.equal(gatewayRequests.length, 1, `expected one reflection request, received ${gatewayRequests.length}`);
        assert.equal(gatewayRequests[0].method, 'POST', 'reflection request must use POST');
        assertIncludes(gatewayRequests[0].payload?.intent, roughAsk, 'gateway request intent');
        assertIncludes(echoedIntent, roughAsk, 'intent echo');
        assert.ok(compactText(observationText).length > 0, 'observation must not be empty');
        assertIncludes(observationText, workingRead, 'working read');
        assertIncludes(sayThisText, nextDraft, 'concrete next draft');
        assertIncludes(momentText, workingRead, 'mirror moment');
        assertIncludes(momentText, nextDraft, 'mirror moment');
        assertIncludes(threadRecordText, 'Still open', 'working record');
        assertIncludes(threadRecordText, 'Carry forward', 'working record');
        assert.equal(
            await page.getByRole('button', { name: 'Keep thread', exact: true }).count(),
            1,
            'an unkept result should present one clear Keep thread action',
        );

        await page.waitForTimeout(120);
        assert.equal(
            await page.evaluate(() => document.activeElement?.getAttribute('aria-label')),
            'Active Mirror result',
            'completed first turn should move focus to the result',
        );

        const copyControl = moment.getByRole('button', { name: /copy/i }).first();
        assert.ok(await moment.getByRole('button', { name: /copy/i }).count(), 'mirror moment needs an accessible Copy control');
        await copyControl.waitFor({ state: 'visible' });
        assert.ok(await copyControl.isEnabled(), 'Copy control must be enabled');
        for (const name of ['Challenge', 'Improve', 'Save note', 'Public draft']) {
            const control = moment.getByRole('button', { name, exact: true });
            assert.equal(await control.count(), 1, `mirror moment needs one ${name} control`);
            assert.ok(await control.isEnabled(), `${name} control must be enabled`);
        }

        const minimumActionHeight = await copyControl.evaluate((element) => element.getBoundingClientRect().height);
        assert.ok(minimumActionHeight >= 44, `Copy control must meet the 44px target, received ${minimumActionHeight}`);

        await evidence.locator('summary').click();
        assertIncludes(await evidence.innerText(), 'Used', 'evidence panel');
        assertIncludes(await evidence.innerText(), 'Excluded', 'evidence panel');
        assertIncludes(await evidence.innerText(), 'Memory', 'evidence panel');

        const saveNoteControl = moment.locator('[data-testid="mirror-save-note"]');
        await saveNoteControl.click();
        await page.waitForFunction((expectedWorkingRead) => {
            try {
                const state = JSON.parse(localStorage.getItem('mirrorState_v1') || '{}');
                return state?.continuityLedger?.some((entry) => entry?.workingRead === expectedWorkingRead)
                    && state?.mirrorDefaults?.some((entry) => entry?.workingRead === expectedWorkingRead);
            } catch {
                return false;
            }
        }, workingRead);
        assert.equal(await saveNoteControl.innerText(), 'Saved', 'save note should acknowledge explicit local storage');

        const privateRecord = moment.locator(selectors.privateRecord);
        await privateRecord.waitFor({ state: 'visible' });
        assertIncludes(await privateRecord.innerText(), 'Private record', 'private record');
        assertIncludes(await privateRecord.innerText(), 'Saved by you on this browser.', 'private record');
        assertIncludes(await privateRecord.innerText(), 'Sharing stays your choice.', 'private record');
        await privateRecord.getByRole('button', { name: 'Open saved record', exact: true }).click();
        const savedRecordDrawer = page.getByRole('dialog', { name: 'Saved here' });
        await savedRecordDrawer.waitFor({ state: 'visible' });
        const savedRecordText = await savedRecordDrawer.innerText();
        assertIncludes(savedRecordText, 'Private records', 'saved record drawer');
        assert.match(savedRecordText, /private record\s*·\s*sharing is your choice/i, 'saved record drawer did not show the private sharing boundary');
        await page.getByRole('button', { name: 'Close saved' }).last().click();

        const visualState = await page.evaluate((requiredSelectors) => {
            const visible = (element) => {
                const style = getComputedStyle(element);
                const rect = element.getBoundingClientRect();
                return style.display !== 'none'
                    && style.visibility !== 'hidden'
                    && Number.parseFloat(style.opacity || '1') > 0
                    && rect.width > 1
                    && rect.height > 1;
            };
            const entries = Object.entries(requiredSelectors).map(([name, selector]) => {
                const element = [...document.querySelectorAll(selector)].find(visible);
                if (!element) return { name, selector, found: false };
                const rect = element.getBoundingClientRect();
                return {
                    name,
                    selector,
                    found: true,
                    visible: visible(element),
                    fitsViewport: rect.left >= -1
                        && rect.right <= window.innerWidth + 1
                        && element.scrollWidth <= element.clientWidth + 1,
                    rect: {
                        left: Math.round(rect.left),
                        right: Math.round(rect.right),
                        width: Math.round(rect.width),
                        height: Math.round(rect.height),
                    },
                };
            });
            return {
                documentFitsViewport: document.documentElement.scrollWidth <= window.innerWidth + 1,
                entries,
            };
        }, selectors);

        assert.ok(visualState.documentFitsViewport, 'document must not horizontally overflow the viewport');
        for (const entry of visualState.entries) {
            assert.ok(entry.found && entry.visible, `${entry.name} must be visibly rendered`);
            assert.ok(entry.fitsViewport, `${entry.name} must fit within the viewport`);
        }

        await page.waitForTimeout(100);
        assert.deepEqual(pageErrors, [], `page errors: ${pageErrors.join(' | ')}`);

        return {
            label: config.label,
            viewport: config.viewport,
            gateway_request: gatewayRequests[0],
            copy_control: await copyControl.getAttribute('aria-label') || compactText(await copyControl.innerText()),
            visual_state: visualState,
        };
    } finally {
        await context.close();
    }
}

const report = {
    schema_version: 'active-mirror.visible-first-turn-e2e/v1',
    base_url: baseUrl,
    fixture: {
        rough_ask: roughAsk,
        working_read: workingRead,
        next_draft: nextDraft,
    },
    viewports: [],
};

let browser;
try {
    browser = await chromium.launch({ headless: true });
    for (const config of viewports) {
        try {
            report.viewports.push({ status: 'PASS', ...(await runViewport(browser, config)) });
        } catch (error) {
            report.viewports.push({
                status: 'FAIL',
                label: config.label,
                viewport: config.viewport,
                error: errorDetail(error),
            });
        }
    }
} catch (error) {
    report.harness_error = errorDetail(error);
} finally {
    if (browser) await browser.close().catch(() => {});
}

report.status = report.harness_error || report.viewports.some((result) => result.status !== 'PASS') ? 'FAIL' : 'PASS';
console.log(JSON.stringify(report, null, 2));
if (report.status !== 'PASS') process.exitCode = 1;
