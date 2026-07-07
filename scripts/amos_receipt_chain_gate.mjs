#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

const defaults = {
    receiptDir: path.join(repoRoot, '.mirror', 'AUDIT_LOGS'),
    chainFile: path.join(repoRoot, '.mirror', 'RECEIPT_CHAINS', 'audit-log-chain.json'),
    timestamp: '',
    write: false,
    verify: false,
    dryRun: false,
    selfTest: false,
};

const requiredScalars = ['id', 'task_id', 'created_at', 'actor', 'action', 'decision'];
const requiredArrays = ['checked_scope', 'unchecked_scope', 'evidence', 'bad_news', 'follow_up'];

function resolvePath(value) {
    return path.isAbsolute(value) ? value : path.resolve(process.cwd(), value);
}

function parseArgs(argv) {
    const args = { ...defaults };
    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];
        if (arg === '--write') {
            args.write = true;
        } else if (arg === '--verify') {
            args.verify = true;
        } else if (arg === '--dry-run') {
            args.dryRun = true;
        } else if (arg === '--self-test') {
            args.selfTest = true;
        } else if (arg.startsWith('--') && argv[index + 1]) {
            const key = arg.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
            if (!Object.hasOwn(args, key)) throw new Error(`Unknown argument: ${arg}`);
            args[key] = key === 'timestamp' ? argv[index + 1] : resolvePath(argv[index + 1]);
            index += 1;
        } else {
            throw new Error(`Unknown argument: ${arg}`);
        }
    }
    const selectedModes = [args.write, args.verify, args.dryRun].filter(Boolean).length;
    if (selectedModes > 1) throw new Error('Choose only one of --write, --verify, or --dry-run');
    if (!args.write && !args.verify && !args.dryRun && !args.selfTest) args.dryRun = true;
    return args;
}

function stamp(args) {
    if (args.timestamp) return args.timestamp;
    return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function isoFromStamp(value) {
    const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(value);
    if (!match) return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    const [, year, month, day, hour, minute, second] = match;
    return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
}

function sha256(value) {
    return crypto.createHash('sha256').update(value).digest('hex');
}

function parseYamlValue(raw) {
    const value = raw.trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        try {
            return JSON.parse(value);
        } catch {
            return value.slice(1, -1);
        }
    }
    return value;
}

function parseAuditLogYaml(content, file) {
    const lines = content.split(/\r?\n/);
    const firstContentLine = lines.find((line) => line.trim());
    const errors = [];
    if (firstContentLine !== 'audit_log:') errors.push(`${file}: first content line must be audit_log:`);

    const audit = {};
    let currentArray = '';
    for (const line of lines.slice(1)) {
        if (!line.trim()) continue;
        const scalar = /^  ([a-z_]+):\s*(.*)$/.exec(line);
        if (scalar) {
            const [, key, raw] = scalar;
            if (raw.trim() === '') {
                audit[key] = [];
                currentArray = key;
            } else {
                audit[key] = parseYamlValue(raw);
                currentArray = '';
            }
            continue;
        }
        const arrayItem = /^    -\s*(.*)$/.exec(line);
        if (arrayItem && currentArray) {
            audit[currentArray].push(parseYamlValue(arrayItem[1]));
            continue;
        }
        errors.push(`${file}: unsupported line ${JSON.stringify(line)}`);
    }

    for (const key of requiredScalars) {
        if (typeof audit[key] !== 'string' || !audit[key].trim()) errors.push(`${file}: audit_log.${key} must be a non-empty string`);
    }
    for (const key of requiredArrays) {
        if (!Array.isArray(audit[key]) || !audit[key].length || audit[key].some((item) => typeof item !== 'string' || !item.trim())) {
            errors.push(`${file}: audit_log.${key} must be a non-empty array of strings`);
        }
    }
    if (audit.decision && !['pass', 'partial', 'fail'].includes(audit.decision)) {
        errors.push(`${file}: audit_log.decision must be pass, partial, or fail`);
    }
    return { audit, errors };
}

function relativeToRepo(filePath) {
    const relative = path.relative(repoRoot, filePath);
    return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
        ? relative
        : filePath;
}

function listReceiptFiles(receiptDir) {
    if (!fs.existsSync(receiptDir)) throw new Error(`receipt directory does not exist: ${receiptDir}`);
    return fs.readdirSync(receiptDir)
        .filter((name) => /\.(ya?ml)$/i.test(name))
        .filter((name) => name !== 'TEMPLATE.yaml')
        .sort()
        .map((name) => path.join(receiptDir, name));
}

function buildChain(args) {
    const files = listReceiptFiles(args.receiptDir);
    if (!files.length) {
        return {
            ok: false,
            decision: 'fail',
            reason: 'no audit receipts found to chain',
            receipt_dir: args.receiptDir,
        };
    }

    const errors = [];
    let chainHash = 'genesis';
    const entries = files.map((file, index) => {
        const content = fs.readFileSync(file, 'utf8');
        const { audit, errors: parseErrors } = parseAuditLogYaml(content, relativeToRepo(file));
        errors.push(...parseErrors);
        const contentHash = sha256(content);
        const entryHash = sha256(JSON.stringify({
            schema_version: 'receipt_chain_entry.v0_1',
            file: relativeToRepo(file),
            audit_id: audit.id || '',
            content_hash: contentHash,
        }));
        const previousChainHash = chainHash;
        chainHash = sha256(JSON.stringify({
            schema_version: 'receipt_chain_link.v0_1',
            previous_chain_hash: previousChainHash,
            entry_hash: entryHash,
            file: relativeToRepo(file),
        }));
        return {
            index,
            file: relativeToRepo(file),
            audit_id: audit.id || '',
            created_at: audit.created_at || '',
            decision: audit.decision || '',
            content_hash: contentHash,
            entry_hash: entryHash,
            previous_chain_hash: previousChainHash,
            chain_hash: chainHash,
        };
    });

    if (errors.length) {
        return {
            ok: false,
            decision: 'fail',
            reason: 'audit receipt shape validation failed',
            failures: errors,
        };
    }

    return {
        ok: true,
        decision: 'pass',
        wrote: false,
        verified: false,
        would_write: args.chainFile,
        chain: {
            schema_version: 'receipt_chain.v0_1',
            chain_id: 'active_mirror_audit_logs',
            created_at: isoFromStamp(stamp(args)),
            receipt_root: relativeToRepo(args.receiptDir),
            algorithm: 'sha256:audit_file_bytes_then_previous_hash_chain',
            entry_count: entries.length,
            chain_hash: chainHash,
            entries,
            unchecked_scope: [
                'no external timestamp authority',
                'no asymmetric signature',
                'no live app runtime verifier',
                'no gateway runtime verifier',
            ],
        },
    };
}

function comparableChain(chain) {
    return {
        schema_version: chain.schema_version,
        chain_id: chain.chain_id,
        receipt_root: chain.receipt_root,
        algorithm: chain.algorithm,
        entry_count: chain.entry_count,
        chain_hash: chain.chain_hash,
        entries: chain.entries,
    };
}

function verifyChain(args) {
    const built = buildChain(args);
    if (!built.ok) return built;
    if (!fs.existsSync(args.chainFile)) {
        return {
            ok: false,
            decision: 'fail',
            verified: false,
            reason: `chain file is missing: ${args.chainFile}`,
            expected_chain_hash: built.chain.chain_hash,
        };
    }

    let recorded;
    try {
        recorded = JSON.parse(fs.readFileSync(args.chainFile, 'utf8'));
    } catch (error) {
        return {
            ok: false,
            decision: 'fail',
            verified: false,
            reason: `cannot parse chain file: ${error.message}`,
        };
    }

    const expected = comparableChain(built.chain);
    const actual = comparableChain(recorded);
    const expectedJson = JSON.stringify(expected, null, 2);
    const actualJson = JSON.stringify(actual, null, 2);
    if (expectedJson !== actualJson) {
        return {
            ok: false,
            decision: 'fail',
            verified: false,
            reason: 'receipt chain mismatch',
            expected_chain_hash: built.chain.chain_hash,
            actual_chain_hash: recorded.chain_hash || '',
        };
    }

    return {
        ok: true,
        decision: 'pass',
        verified: true,
        chain_file: args.chainFile,
        chain_hash: built.chain.chain_hash,
        entry_count: built.chain.entry_count,
        unchecked_scope: built.chain.unchecked_scope,
    };
}

function writeChain(args) {
    const built = buildChain(args);
    if (!built.ok) return built;
    fs.mkdirSync(path.dirname(args.chainFile), { recursive: true });
    fs.writeFileSync(args.chainFile, `${JSON.stringify(built.chain, null, 2)}\n`);
    return {
        ok: true,
        decision: 'pass',
        wrote: true,
        chain_file: args.chainFile,
        chain_hash: built.chain.chain_hash,
        entry_count: built.chain.entry_count,
        unchecked_scope: built.chain.unchecked_scope,
    };
}

function receiptYaml(id, action) {
    return [
        'audit_log:',
        `  id: "${id}"`,
        '  task_id: "active_mirror_front_door_v1"',
        '  created_at: "2026-07-07T00:00:00Z"',
        '  actor: "codex"',
        `  action: "${action}"`,
        '  checked_scope:',
        '    - "self-test receipt"',
        '  unchecked_scope:',
        '    - "external verifier"',
        '  evidence:',
        '    - "self-test"',
        '  bad_news:',
        '    - "local test only"',
        '  decision: "partial"',
        '  follow_up:',
        '    - "none"',
        '',
    ].join('\n');
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function selfTest() {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'active-mirror-receipt-chain-'));
    const receiptDir = path.join(temp, 'audit');
    const chainFile = path.join(temp, 'chain.json');
    fs.mkdirSync(receiptDir, { recursive: true });
    fs.writeFileSync(path.join(receiptDir, '20260707T000000Z-a.yaml'), receiptYaml('audit_a', 'First test receipt'));
    fs.writeFileSync(path.join(receiptDir, '20260707T000001Z-b.yaml'), receiptYaml('audit_b', 'Second test receipt'));

    const write = writeChain({
        ...defaults,
        receiptDir,
        chainFile,
        timestamp: '20260707T000002Z',
    });
    assert(write.ok, 'chain write should pass');
    assert(write.wrote, 'chain write should write a chain file');

    const verify = verifyChain({
        ...defaults,
        receiptDir,
        chainFile,
    });
    assert(verify.ok, 'fresh chain should verify');
    assert(verify.verified, 'fresh chain should be marked verified');

    fs.appendFileSync(path.join(receiptDir, '20260707T000001Z-b.yaml'), '# tamper\n');
    const tampered = verifyChain({
        ...defaults,
        receiptDir,
        chainFile,
    });
    assert(!tampered.ok, 'tampered receipt should fail verification');

    return {
        ok: true,
        checks: [
            { name: 'write chain', decision: write.decision, entry_count: write.entry_count },
            { name: 'verify fresh chain', decision: verify.decision, verified: verify.verified },
            { name: 'detect tampered receipt', decision: tampered.decision, verified: tampered.verified },
        ],
    };
}

try {
    const args = parseArgs(process.argv.slice(2));
    let result;
    if (args.selfTest) result = selfTest();
    else if (args.write) result = writeChain(args);
    else if (args.verify) result = verifyChain(args);
    else result = buildChain(args);

    console.log(JSON.stringify(result, null, 2));
    process.exit(result.ok ? 0 : 2);
} catch (error) {
    console.error(JSON.stringify({ ok: false, decision: 'error', error: error.message }, null, 2));
    process.exit(1);
}
