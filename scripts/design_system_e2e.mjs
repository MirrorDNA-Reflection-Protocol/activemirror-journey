#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';
import { startProductionBundleServer } from './production_bundle_server.mjs';

let baseUrl = String(process.env.ACTIVE_MIRROR_E2E_BASE_URL || '').trim();
const outputDir = path.resolve(process.env.ACTIVE_MIRROR_E2E_OUTPUT || 'outputs/design-system-e2e');
const consoleEvents = [];
const pageErrors = [];
const networkFailures = [];
const eventRequests = [];
const assertions = {};
const journeys = [];

function assert(name, condition, detail = '') {
    assertions[name] = { passed: Boolean(condition), detail };
}

async function fileHash(filePath) {
    return crypto.createHash('sha256').update(await fs.readFile(filePath)).digest('hex');
}

async function inspectPage(page, label, reducedMotion, expectedTheme = 'dark', requireMirror = true) {
    const state = await page.evaluate(({ shouldReduce }) => {
        const visible = (element) => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return style.display !== 'none'
                && style.visibility !== 'hidden'
                && rect.width > 2
                && rect.height > 2
                && style.clipPath !== 'inset(50%)';
        };
        const nameFor = (element) => {
            const labelText = 'labels' in element && element.labels
                ? [...element.labels].map((label) => label.textContent || '').join(' ')
                : '';
            return (
                element.getAttribute('aria-label')
                || element.getAttribute('title')
                || labelText
                || element.textContent
                || element.getAttribute('value')
                || ''
            ).trim();
        };
        const parseColor = (value) => {
            const match = String(value).match(/rgba?\(([^)]+)\)/i);
            if (!match) return null;
            const parts = match[1].replaceAll(',', ' ').split(/\s+/).filter(Boolean).map(Number);
            if (parts.length < 3 || parts.slice(0, 3).some((part) => !Number.isFinite(part))) return null;
            return [parts[0], parts[1], parts[2], Number.isFinite(parts[3]) ? parts[3] : 1];
        };
        const blend = (foreground, background) => {
            const alpha = foreground[3] + (background[3] * (1 - foreground[3]));
            if (alpha === 0) return [0, 0, 0, 0];
            return [
                ((foreground[0] * foreground[3]) + (background[0] * background[3] * (1 - foreground[3]))) / alpha,
                ((foreground[1] * foreground[3]) + (background[1] * background[3] * (1 - foreground[3]))) / alpha,
                ((foreground[2] * foreground[3]) + (background[2] * background[3] * (1 - foreground[3]))) / alpha,
                alpha,
            ];
        };
        const channel = (value) => {
            const normalized = value / 255;
            return normalized <= 0.04045
                ? normalized / 12.92
                : ((normalized + 0.055) / 1.055) ** 2.4;
        };
        const luminance = (color) => (
            (0.2126 * channel(color[0]))
            + (0.7152 * channel(color[1]))
            + (0.0722 * channel(color[2]))
        );
        const contrast = (first, second) => {
            const firstLuminance = luminance(first);
            const secondLuminance = luminance(second);
            return (Math.max(firstLuminance, secondLuminance) + 0.05)
                / (Math.min(firstLuminance, secondLuminance) + 0.05);
        };
        const effectiveBackground = (element) => {
            const ancestry = [];
            for (let current = element; current; current = current.parentElement) ancestry.push(current);
            let result = [255, 255, 255, 1];
            for (const current of ancestry.reverse()) {
                const color = parseColor(getComputedStyle(current).backgroundColor);
                if (color && color[3] > 0) result = blend(color, result);
            }
            return result;
        };
        const directText = (element) => [...element.childNodes]
            .filter((node) => node.nodeType === Node.TEXT_NODE)
            .map((node) => node.textContent || '')
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
        const lowContrast = [...document.querySelectorAll('body *')]
            .filter(visible)
            .filter((element) => directText(element))
            .filter((element) => !element.closest('[aria-hidden="true"]'))
            .filter((element) => !element.closest('button:disabled, input:disabled, textarea:disabled, select:disabled'))
            .map((element) => {
                const style = getComputedStyle(element);
                const foreground = parseColor(style.color);
                const background = effectiveBackground(element);
                if (!foreground) return null;
                let opacity = 1;
                for (let current = element; current; current = current.parentElement) {
                    opacity *= Number.parseFloat(getComputedStyle(current).opacity) || 1;
                }
                foreground[3] *= opacity;
                const renderedForeground = blend(foreground, background);
                const ratio = contrast(renderedForeground, background);
                const fontSize = Number.parseFloat(style.fontSize) || 16;
                const weight = Number.parseInt(style.fontWeight, 10) || 400;
                const large = fontSize >= 24 || (fontSize >= 18.66 && weight >= 700);
                const floor = large ? 3 : 4.5;
                return ratio + 0.01 < floor
                    ? {
                        text: directText(element).slice(0, 90),
                        ratio: Number(ratio.toFixed(2)),
                        floor,
                        color: style.color,
                        background: background.slice(0, 3).map((value) => Math.round(value)).join(','),
                    }
                    : null;
            })
            .filter(Boolean)
            .slice(0, 30);
        const unnamedControls = [...document.querySelectorAll('a[href], button, input, textarea, select')]
            .filter(visible)
            .filter((element) => !nameFor(element))
            .map((element) => element.outerHTML.slice(0, 180));
        const deadLinks = [...document.querySelectorAll('a[href]')]
            .filter(visible)
            .filter((element) => ['', '#'].includes(element.getAttribute('href') || ''))
            .map((element) => nameFor(element));
        const gradients = [...document.querySelectorAll('body *')]
            .filter(visible)
            .filter((element) => /gradient/i.test(getComputedStyle(element).backgroundImage))
            .map((element) => element.className || element.tagName)
            .slice(0, 20);
        const externalFonts = performance.getEntriesByType('resource')
            .map((entry) => entry.name)
            .filter((url) => /fonts\.(?:googleapis|gstatic)\.com/i.test(url));
        const moving = shouldReduce
            ? [...document.querySelectorAll('body *')]
                .filter(visible)
                .filter((element) => {
                    const style = getComputedStyle(element);
                    const durations = `${style.animationDuration},${style.transitionDuration}`
                        .split(',')
                        .map((value) => value.trim())
                        .map((value) => value.endsWith('ms') ? Number.parseFloat(value) / 1000 : Number.parseFloat(value))
                        .filter(Number.isFinite);
                    return durations.some((duration) => duration > 0.02);
                })
                .map((element) => element.className || element.tagName)
                .slice(0, 20)
            : [];

        return {
            theme: document.documentElement.getAttribute('data-theme'),
            productMode: document.querySelector('[data-product-mode]')?.getAttribute('data-product-mode'),
            viewportFits: document.documentElement.scrollWidth <= window.innerWidth,
            trustRail: document.querySelector('[data-testid="trust-status-rail"]')?.textContent?.replace(/\s+/g, ' ').trim() || '',
            boundary: document.querySelector('[data-testid="trust-status-rail"]')?.getAttribute('data-processing-boundary'),
            authority: document.querySelector('[data-testid="trust-status-rail"]')?.getAttribute('data-authority'),
            unnamedControls,
            deadLinks,
            gradients,
            externalFonts,
            moving,
            lowContrast,
            nestedSemanticSurfaces: document.querySelectorAll('.am-surface .am-surface').length,
        };
    }, { shouldReduce: reducedMotion });

    assert(`${label}.expected_theme`, state.theme === expectedTheme, state.theme || 'missing');
    assert(`${label}.viewport_fit`, state.viewportFits, 'document width must fit viewport');
    if (requireMirror) {
        assert(`${label}.mirror_mode`, state.productMode === 'mirror', state.productMode || 'missing');
        assert(`${label}.boundary_visible`, state.boundary === 'local_device' && state.trustRail.includes('On this device'), state.trustRail);
        assert(`${label}.authority_visible`, state.authority === 'draft' && state.trustRail.includes('Draft only'), state.trustRail);
        assert(`${label}.memory_visible`, state.trustRail.includes('Not saved'), state.trustRail);
    }
    assert(`${label}.named_controls`, state.unnamedControls.length === 0, state.unnamedControls.join(' | '));
    assert(`${label}.no_dead_links`, state.deadLinks.length === 0, state.deadLinks.join(', '));
    assert(`${label}.no_gradients`, state.gradients.length === 0, state.gradients.join(', '));
    assert(`${label}.no_font_cdn`, state.externalFonts.length === 0, state.externalFonts.join(', '));
    assert(`${label}.composited_text_contrast`, state.lowContrast.length === 0, JSON.stringify(state.lowContrast));
    assert(`${label}.no_nested_surfaces`, state.nestedSemanticSurfaces === 0, String(state.nestedSemanticSurfaces));
    if (reducedMotion) assert(`${label}.reduced_motion`, state.moving.length === 0, state.moving.join(', '));

    return state;
}

async function keyboardReachPrimary(page, label) {
    await page.locator('body').click({ position: { x: 2, y: 2 } });
    const trail = [];
    let primary = null;
    for (let index = 0; index < 30; index += 1) {
        await page.keyboard.press('Tab');
        const active = await page.evaluate(() => {
            const element = document.activeElement;
            if (!(element instanceof HTMLElement)) return null;
            const style = getComputedStyle(element);
            return {
                name: (element.getAttribute('aria-label') || element.textContent || '').replace(/\s+/g, ' ').trim(),
                tag: element.tagName,
                outline: style.outlineStyle,
                outlineWidth: style.outlineWidth,
                boxShadow: style.boxShadow,
            };
        });
        if (!active) continue;
        trail.push(`${active.tag}:${active.name}`);
        if (active.tag === 'TEXTAREA' || /^Send$/i.test(active.name)) {
            primary = active;
            break;
        }
    }
    const focusVisible = primary && (
        (primary.outline !== 'none' && primary.outlineWidth !== '0px')
        || primary.boxShadow !== 'none'
    );
    assert(`${label}.primary_keyboard_reachable`, Boolean(primary), trail.join(' -> '));
    assert(`${label}.primary_focus_visible`, Boolean(focusVisible), primary ? JSON.stringify(primary) : 'primary not reached');
    return trail;
}

async function runJourney(browser, config) {
    const context = await browser.newContext({
        viewport: config.viewport,
        colorScheme: 'dark',
        locale: 'en-IN',
        reducedMotion: config.reducedMotion ? 'reduce' : 'no-preference',
    });
    await context.route('https://gateway.activemirror.ai/v1/mirror/enterprise-stream**', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'text/event-stream',
            headers: { 'Cache-Control': 'no-store', 'X-Active-Mirror-E2E-Fixture': 'enterprise-stream' },
            body: 'retry: 999999\n\n',
        });
    });
    await context.route('https://gateway.activemirror.ai/health', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: { 'Cache-Control': 'no-store', 'X-Active-Mirror-E2E-Fixture': 'gateway-health' },
            body: JSON.stringify({
                ok: true,
                guardrails: {
                    media_storage: 'edge_cache_ephemeral',
                    media_url_policy: 'short_lived_signed_links',
                    media_signing: 'receipt_hash_fallback',
                    image_session_daily_limit: 5,
                    image_network_daily_limit: 80,
                    image_session_window_limit: 2,
                    image_network_window_limit: 12,
                },
            }),
        });
    });
    await context.route('https://gateway.activemirror.ai/v1/events', async (route) => {
        const request = route.request();
        let payload = null;
        try {
            payload = JSON.parse(request.postData() || 'null');
        } catch {
            payload = null;
        }
        eventRequests.push({
            journey: config.label,
            method: request.method(),
            payload,
        });
        await route.fulfill({
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': new URL(baseUrl).origin,
                'Cache-Control': 'no-store',
                'X-Active-Mirror-E2E-Fixture': 'privacy-event',
            },
        });
    });
    await context.addInitScript(() => localStorage.setItem('mirror-theme', 'dark'));
    await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
    const page = await context.newPage();
    page.on('console', (message) => consoleEvents.push({ journey: config.label, type: message.type(), text: message.text() }));
    page.on('pageerror', (error) => pageErrors.push({ journey: config.label, message: error.message }));
    page.on('requestfailed', (request) => networkFailures.push({
        journey: config.label,
        method: request.method(),
        url: request.url(),
        error: request.failure()?.errorText || 'unknown',
    }));

    const tracePath = path.join(outputDir, `${config.label}-trace.zip`);
    const screenshotPath = path.join(outputDir, `${config.label}.png`);
    try {
        await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
        await page.getByRole('heading', { name: 'Bring the unfinished thing.' }).waitFor({ state: 'visible' });
        await page.locator('[data-testid="trust-status-rail"]').waitFor({ state: 'visible' });
        await page.waitForFunction(() => document.documentElement.getAttribute('data-theme') === 'dark');
        await page.waitForTimeout(100);
        const initial = await inspectPage(page, config.label, config.reducedMotion);
        const focusTrail = await keyboardReachPrimary(page, config.label);

        let language = null;
        if (config.testHindi) {
            await context.setOffline(true);
            const input = page.locator('#active-mirror-intent');
            await input.fill('मुझे आज एक कठिन फैसला छोटा करके समझना है।');
            await input.press('Enter');
            const response = page.locator('[data-response-language="hi"]');
            await response.waitFor({ state: 'visible' });
            language = await response.evaluate((element) => ({
                lang: element.getAttribute('lang'),
                fits: element.scrollWidth <= element.clientWidth,
                text: element.textContent?.replace(/\s+/g, ' ').trim().slice(0, 240) || '',
            }));
            assert(`${config.label}.hindi_language_bound`, language.lang === 'hi', language.lang || 'missing');
            assert(`${config.label}.hindi_text_fits`, language.fits, language.text);
            const postResponse = await inspectPage(page, `${config.label}.response`, config.reducedMotion);
            language.postResponse = postResponse;
        }

        if (config.testLightMode) {
            await page.getByRole('button', { name: 'Use light mode' }).click();
            await page.waitForFunction(() => document.documentElement.getAttribute('data-theme') === 'light');
            await page.waitForTimeout(350);
            await inspectPage(page, `${config.label}.light`, config.reducedMotion, 'light');
            const lightScreenshot = path.join(outputDir, `${config.label}-light.png`);
            await page.screenshot({ path: lightScreenshot, fullPage: true });
            assert(`${config.label}.light_mode_available`, true, path.basename(lightScreenshot));
            await page.getByRole('button', { name: 'Use dark mode' }).click();
            await page.waitForFunction(() => document.documentElement.getAttribute('data-theme') === 'dark');
            await page.waitForTimeout(350);
        }

        await page.screenshot({ path: screenshotPath, fullPage: true });
        const routeSweep = [];
        for (const route of config.routes || []) {
            const routeUrl = new URL(route.replace(/^\//, ''), baseUrl).href;
            const routeLabel = route.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '-') || 'home';
            await page.goto(routeUrl, { waitUntil: 'domcontentloaded' });
            await page.locator('h1').first().waitFor({ state: 'visible' });
            await page.waitForTimeout(100);
            const state = await inspectPage(
                page,
                `${config.label}.route.${routeLabel}`,
                config.reducedMotion,
                'dark',
                false,
            );
            const routeScreenshot = path.join(outputDir, `${config.label}-route-${routeLabel}.png`);
            await page.screenshot({ path: routeScreenshot, fullPage: true });
            routeSweep.push({ route, state, screenshot: path.basename(routeScreenshot) });
        }
        journeys.push({
            label: config.label,
            viewport: config.viewport,
            reduced_motion: config.reducedMotion,
            initial,
            focus_trail: focusTrail,
            language,
            route_sweep: routeSweep,
            screenshot: path.basename(screenshotPath),
            trace: path.basename(tracePath),
        });
    } finally {
        await context.tracing.stop({ path: tracePath }).catch(() => {});
        await context.close();
    }
}

await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputDir, { recursive: true });

let browser;
let bundleServer;
try {
    if (!baseUrl) {
        bundleServer = await startProductionBundleServer();
        baseUrl = bundleServer.baseUrl;
    }
    browser = await chromium.launch({ headless: true });
    await runJourney(browser, {
        label: 'desktop-1440',
        viewport: { width: 1440, height: 900 },
        reducedMotion: false,
        testHindi: false,
        testLightMode: true,
        routes: ['/id', '/device', '/enterprise', '/about', '/research', '/feedback', '/privacy', '/terms', '/missing'],
    });
    await runJourney(browser, {
        label: 'mobile-390',
        viewport: { width: 390, height: 844 },
        reducedMotion: true,
        testHindi: true,
        testLightMode: false,
    });
} catch (error) {
    assertions.harness_completed = {
        passed: false,
        detail: error instanceof Error ? error.stack || error.message : String(error),
    };
} finally {
    if (browser) await browser.close().catch(() => {});
    if (bundleServer) await bundleServer.close().catch(() => {});
}

const consoleErrors = consoleEvents.filter((event) => event.type === 'error');
const allowedEventKeys = new Set(['event', 'session', 'ts', 'page', 'surface']);
const invalidEventRequests = eventRequests.filter(({ method, payload }) => {
    if (method !== 'POST' || !payload || typeof payload !== 'object' || Array.isArray(payload)) return true;
    if (Object.keys(payload).some((key) => !allowedEventKeys.has(key))) return true;
    if (!/^[a-z0-9_]{1,64}$/.test(String(payload.event || ''))) return true;
    if (!/^[a-z0-9-]{1,64}$/i.test(String(payload.session || ''))) return true;
    if (Number.isNaN(Date.parse(String(payload.ts || '')))) return true;
    return ['page', 'surface'].some((key) => !/^[a-z0-9_-]{1,64}$/i.test(String(payload[key] || '')));
});
assert('browser.privacy_event_fixture_observed', eventRequests.length > 0, `${eventRequests.length}`);
assert('browser.privacy_event_metadata_only', invalidEventRequests.length === 0, JSON.stringify(invalidEventRequests));
assert('browser.console_errors_absent', consoleErrors.length === 0 && pageErrors.length === 0, JSON.stringify({ consoleErrors, pageErrors }));
assert('browser.unexpected_network_failures_absent', networkFailures.length === 0, JSON.stringify(networkFailures));

const failedAssertions = Object.entries(assertions)
    .filter(([, result]) => !result.passed)
    .map(([name]) => name);
const report = {
    schema_version: 'active-mirror.design-system-e2e/v1',
    base_url: baseUrl,
    status: failedAssertions.length ? 'FAIL' : 'PASS',
    assertions,
    failed_assertions: failedAssertions,
    journeys,
    console_error_count: consoleErrors.length + pageErrors.length,
    network_failure_count: networkFailures.length,
    checked_scope: [
        'desktop and mobile production rendering',
        'dark-first and optional light presentation',
        'trust rail processing, authority, and memory labels',
        'keyboard reachability and visible focus for the primary action',
        'visible control names and dead fragment links',
        'gradient, font-CDN, nested-surface, and horizontal-overflow runtime checks',
        'reduced motion at mobile viewport',
        'Hindi local fallback language binding and text fit',
        'isolated gateway fixtures for enterprise stream, health status, and metadata-only privacy events',
        'console, page, and network failures',
    ],
    unchecked_scope: [
        'Firefox and WebKit rendering',
        'screen-reader behavior on physical devices',
        'all supported Indian scripts',
        'pixel-perfect baselines from a ratified external design file',
    ],
};

await fs.writeFile(path.join(outputDir, 'console-logs.json'), `${JSON.stringify({ consoleEvents, pageErrors }, null, 2)}\n`);
await fs.writeFile(path.join(outputDir, 'privacy-event-requests.json'), `${JSON.stringify(eventRequests, null, 2)}\n`);
await fs.writeFile(path.join(outputDir, 'network-failures.json'), `${JSON.stringify(networkFailures, null, 2)}\n`);
await fs.writeFile(path.join(outputDir, 'test-report.json'), `${JSON.stringify(report, null, 2)}\n`);

const evidenceFiles = (await fs.readdir(outputDir)).sort();
const evidence = [];
for (const filename of evidenceFiles) {
    const filePath = path.join(outputDir, filename);
    const stat = await fs.stat(filePath);
    if (stat.isFile()) evidence.push({ filename, sha256: await fileHash(filePath), bytes: stat.size });
}
await fs.writeFile(path.join(outputDir, 'evidence-manifest.json'), `${JSON.stringify({ evidence }, null, 2)}\n`);

console.log(JSON.stringify({ ...report, evidence_manifest: path.join(outputDir, 'evidence-manifest.json') }, null, 2));
if (failedAssertions.length) process.exitCode = 1;
