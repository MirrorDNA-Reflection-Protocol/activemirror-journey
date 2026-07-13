import { spawn } from 'node:child_process';
import process from 'node:process';

const target = process.argv[2] || 'all';
const testScripts = {
    design: 'scripts/design_system_e2e.mjs',
    offline: 'scripts/offline_app_shell_e2e.mjs',
};

const selectedTargets = target === 'all'
    ? ['offline', 'design']
    : [target];

if (selectedTargets.some((name) => !testScripts[name])) {
    throw new Error(`Unknown production E2E target: ${target}`);
}

function run(command, args) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            cwd: process.cwd(),
            env: process.env,
            stdio: 'inherit',
        });
        child.once('error', reject);
        child.once('exit', (code, signal) => {
            if (code === 0) {
                resolve();
                return;
            }
            reject(new Error(`${command} ${args.join(' ')} exited with ${signal || code || 'an unknown status'}`));
        });
    });
}

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

try {
    if (!String(process.env.ACTIVE_MIRROR_E2E_BASE_URL || '').trim()) {
        await run(npmCommand, ['run', 'build:deploy']);
    }

    for (const name of selectedTargets) {
        await run(process.execPath, [testScripts[name]]);
    }
} catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
}
