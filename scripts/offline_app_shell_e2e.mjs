#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const baseUrl = String(process.env.ACTIVE_MIRROR_E2E_BASE_URL || 'http://127.0.0.1:4179/app/');
const outputDir = path.resolve(process.env.ACTIVE_MIRROR_E2E_OUTPUT || 'outputs/offline-app-shell-e2e');

async function sha256(filePath) {
    const contents = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(contents).digest('hex');
}

await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputDir, { recursive: true });

const paths = {
    trace: path.join(outputDir, 'playwright-trace.zip'),
    onlineScreenshot: path.join(outputDir, 'online-mobile.png'),
    offlineScreenshot: path.join(outputDir, 'offline-mobile.png'),
    screenshotManifest: path.join(outputDir, 'screenshots.json'),
    console: path.join(outputDir, 'console-logs.json'),
    network: path.join(outputDir, 'network-failures.json'),
    report: path.join(outputDir, 'test-report.json'),
    evidence: path.join(outputDir, 'evidence-manifest.json'),
};

const consoleEvents = [];
const pageErrors = [];
const networkFailures = [];
let browser;
let context;
let page;
let report;

try {
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
    page = await context.newPage();

    page.on('console', (message) => {
        consoleEvents.push({ type: message.type(), text: message.text() });
    });
    page.on('pageerror', (error) => {
        pageErrors.push(error.message);
    });
    page.on('requestfailed', (request) => {
        networkFailures.push({
            method: request.method(),
            url: request.url(),
            error: request.failure()?.errorText || 'unknown',
        });
    });

    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await page.getByText('What do you want?', { exact: true }).waitFor({ state: 'visible' });
    await page.evaluate(async () => {
        await navigator.serviceWorker.ready;
    });
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), null, { timeout: 15000 });
    const onlineState = await page.evaluate(async () => ({
        controlled: Boolean(navigator.serviceWorker.controller),
        registrations: (await navigator.serviceWorker.getRegistrations()).map((registration) => registration.scope),
        caches: await caches.keys(),
        viewportFits: document.documentElement.scrollWidth <= window.innerWidth,
    }));
    await page.screenshot({ path: paths.onlineScreenshot, fullPage: true });

    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByText('What do you want?', { exact: true }).waitFor({ state: 'visible' });
    const offlineState = await page.evaluate(() => ({
        online: navigator.onLine,
        controlled: Boolean(navigator.serviceWorker.controller),
        viewportFits: document.documentElement.scrollWidth <= window.innerWidth,
        bodyText: document.body.innerText.slice(0, 300),
    }));
    await page.screenshot({ path: paths.offlineScreenshot, fullPage: true });

    const errorConsoleEvents = consoleEvents.filter((event) => event.type === 'error');
    const assertions = {
        serviceWorkerRegistered: onlineState.registrations.some((scope) => scope.endsWith('/app/')),
        appShellCachePresent: onlineState.caches.some((name) => name.startsWith('active-mirror-app-shell-')),
        onlineViewportFits: onlineState.viewportFits,
        offlineReloadRendered: offlineState.bodyText.includes('What do you want?'),
        offlineBrowserState: offlineState.online === false,
        offlineServiceWorkerControlled: offlineState.controlled,
        offlineViewportFits: offlineState.viewportFits,
        consoleErrorsAbsent: errorConsoleEvents.length === 0 && pageErrors.length === 0,
    };
    const failedAssertions = Object.entries(assertions).filter(([, passed]) => !passed).map(([name]) => name);
    report = {
        schema_version: 'active-mirror.offline-app-shell-e2e/v1',
        base_url: baseUrl,
        status: failedAssertions.length ? 'FAIL' : 'PASS',
        assertions,
        failed_assertions: failedAssertions,
        console_error_count: errorConsoleEvents.length + pageErrors.length,
        network_failure_count: networkFailures.length,
        online_state: onlineState,
        offline_state: { ...offlineState, bodyText: undefined },
        checked_scope: [
            'mobile production bundle render',
            'service worker registration and /app scope',
            'bounded app-shell cache presence',
            'offline reload after browser network disable',
            'horizontal viewport fit',
            'browser console and page errors',
        ],
        unchecked_scope: [
            'first installation without any network access',
            'private recall model download and inference',
            'all device/browser combinations',
            'full accessibility audit',
        ],
    };

    await fs.writeFile(paths.console, `${JSON.stringify({ consoleEvents, pageErrors }, null, 2)}\n`);
    await fs.writeFile(paths.network, `${JSON.stringify(networkFailures, null, 2)}\n`);
    await fs.writeFile(
        paths.screenshotManifest,
        `${JSON.stringify({ screenshots: [path.basename(paths.onlineScreenshot), path.basename(paths.offlineScreenshot)] }, null, 2)}\n`,
    );
    await fs.writeFile(paths.report, `${JSON.stringify(report, null, 2)}\n`);
    await context.tracing.stop({ path: paths.trace });
    await context.close();
    await browser.close();
    context = undefined;
    browser = undefined;

    const evidenceFiles = [
        ['playwright_trace', paths.trace],
        ['screenshots', paths.screenshotManifest],
        ['console_logs', paths.console],
        ['network_failures', paths.network],
        ['test_report', paths.report],
    ];
    const evidence = [];
    for (const [type, filePath] of evidenceFiles) {
        evidence.push({ type, path: path.basename(filePath), sha256: await sha256(filePath) });
    }
    await fs.writeFile(paths.evidence, `${JSON.stringify({ evidence }, null, 2)}\n`);

    console.log(JSON.stringify({ ...report, evidence_manifest: paths.evidence }, null, 2));
    if (report.status !== 'PASS') process.exitCode = 1;
} catch (error) {
    report = {
        schema_version: 'active-mirror.offline-app-shell-e2e/v1',
        base_url: baseUrl,
        status: 'FAIL',
        error: error instanceof Error ? error.message : String(error),
        checked_scope: [],
        unchecked_scope: ['offline app-shell journey did not complete'],
    };
    await fs.writeFile(paths.console, `${JSON.stringify({ consoleEvents, pageErrors }, null, 2)}\n`);
    await fs.writeFile(paths.network, `${JSON.stringify(networkFailures, null, 2)}\n`);
    if (page) await page.screenshot({ path: path.join(outputDir, 'failure.png'), fullPage: true }).catch(() => {});
    if (context) await context.tracing.stop({ path: paths.trace }).catch(() => {});
    await fs.writeFile(paths.report, `${JSON.stringify(report, null, 2)}\n`);
    console.error(JSON.stringify(report, null, 2));
    process.exitCode = 1;
} finally {
    if (context) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
}
