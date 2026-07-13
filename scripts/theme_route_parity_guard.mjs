import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const appPath = path.join(root, 'src', 'App.jsx');
const cssPath = path.join(root, 'src', 'index.css');

const policies = {
    HomePage: { file: 'src/pages/HomePage.jsx', mode: 'adaptive' },
    Start: { file: 'src/pages/Start.jsx', mode: 'adaptive' },
    DeviceExperience: { file: 'src/pages/DeviceExperience.jsx', mode: 'compatibility' },
    Enterprise: { file: 'src/pages/Enterprise.jsx', mode: 'compatibility' },
    About: { file: 'src/pages/About.jsx', mode: 'compatibility' },
    Research: { file: 'src/pages/Research.jsx', mode: 'adaptive' },
    FeedbackDashboard: { file: 'src/pages/FeedbackDashboard.jsx', mode: 'compatibility' },
    Privacy: { file: 'src/pages/Privacy.jsx', mode: 'compatibility' },
    Terms: { file: 'src/pages/Terms.jsx', mode: 'compatibility' },
    NotFound: { file: 'src/pages/NotFound.jsx', mode: 'compatibility' },
    MirrorProdStory: { file: 'src/pages/MirrorProdStory.jsx', mode: 'self-contained-dark' },
};

function read(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

const appSource = read('src/App.jsx');
const routeComponents = new Set(
    [...appSource.matchAll(/element=\{<([A-Za-z][A-Za-z0-9_]*)\b/g)]
        .map((match) => match[1])
        .filter((name) => name !== 'Navigate'),
);
const failures = [];

for (const name of routeComponents) {
    if (!policies[name]) failures.push(`Route component ${name} has no theme policy.`);
}

for (const [name, policy] of Object.entries(policies)) {
    if (!routeComponents.has(name) && name !== 'NotFound') {
        failures.push(`Theme policy ${name} is not backed by an active route.`);
        continue;
    }

    const source = read(policy.file);
    if (policy.mode === 'adaptive' && !source.includes('useTheme')) {
        failures.push(`${name} must use the shared theme context.`);
    }
    if (policy.mode === 'compatibility' && !source.includes('am-theme-parity')) {
        failures.push(`${name} must opt into the legacy light-theme compatibility surface.`);
    }
    if (policy.mode === 'self-contained-dark' && !source.includes('mps-page')) {
        failures.push(`${name} lost its explicit self-contained dark surface.`);
    }
}

const css = fs.readFileSync(cssPath, 'utf8');
if (!css.includes('[data-theme="light"] .am-theme-parity')) {
    failures.push('The light-theme compatibility rules are missing.');
}
if (appSource.includes('fallback={<div className="min-h-screen bg-black text-white"')) {
    failures.push('The Suspense fallback still forces a dark-only surface.');
}

if (failures.length) {
    console.error('Theme route parity guard failed:');
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
}

console.log(`Theme route parity guard passed for ${routeComponents.size} route components.`);
