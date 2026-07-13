import { once } from 'node:events';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';

const MIME_TYPES = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.js': 'text/javascript; charset=utf-8',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.json': 'application/json; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.mp4': 'video/mp4',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain; charset=utf-8',
    '.wasm': 'application/wasm',
    '.webp': 'image/webp',
};

function normalizeBasePath(value = '/app/') {
    const raw = String(value || '/app/').trim() || '/app/';
    const withLeadingSlash = raw.startsWith('/') ? raw : `/${raw}`;
    return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

function isInsideRoot(root, candidate) {
    return candidate === root || candidate.startsWith(`${root}${path.sep}`);
}

function send(response, status, body = '') {
    response.statusCode = status;
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    response.end(body);
}

async function sendFile(request, response, filePath) {
    const content = await fs.readFile(filePath);
    response.statusCode = 200;
    response.setHeader('Content-Type', MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Content-Length', content.byteLength);
    response.end(request.method === 'HEAD' ? undefined : content);
}

function isNavigationRequest(request, requestPath) {
    return request.headers.accept?.includes('text/html') || !path.extname(requestPath);
}

export async function startProductionBundleServer({
    root = path.resolve('dist'),
    host = '127.0.0.1',
    port = 0,
    basePath = '/app/',
} = {}) {
    const bundleRoot = path.resolve(root);
    const appBasePath = normalizeBasePath(basePath);
    const appPrefix = appBasePath.slice(0, -1);
    const indexPath = path.join(bundleRoot, 'index.html');
    const serviceWorkerPath = path.join(bundleRoot, 'service-worker.js');

    await Promise.all([fs.access(indexPath), fs.access(serviceWorkerPath)]);

    const server = http.createServer(async (request, response) => {
        if (!['GET', 'HEAD'].includes(request.method || '')) {
            send(response, 405, 'Method not allowed');
            return;
        }

        let pathname;
        try {
            pathname = decodeURIComponent(new URL(request.url || '/', `http://${host}`).pathname);
        } catch {
            send(response, 400, 'Bad request');
            return;
        }

        if (pathname === appPrefix) pathname = appBasePath;
        if (!pathname.startsWith(appBasePath)) {
            send(response, 404, 'Not found');
            return;
        }

        const requestPath = pathname.slice(appPrefix.length) || '/';
        const candidate = path.resolve(bundleRoot, `.${requestPath === '/' ? '/index.html' : requestPath}`);

        try {
            const stat = isInsideRoot(bundleRoot, candidate) ? await fs.stat(candidate) : null;
            if (stat?.isFile()) {
                await sendFile(request, response, candidate);
                return;
            }
        } catch {
            // Client-side routes fall back to the app shell below.
        }

        if (isNavigationRequest(request, requestPath)) {
            await sendFile(request, response, indexPath);
            return;
        }

        send(response, 404, 'Not found');
    });

    server.listen({ host, port });
    await once(server, 'listening');
    const address = server.address();
    if (!address || typeof address === 'string') {
        await new Promise((resolve) => server.close(resolve));
        throw new Error('Production bundle server did not expose a TCP address.');
    }

    return {
        baseUrl: new URL(appBasePath, `http://${host}:${address.port}`).href,
        async close() {
            await new Promise((resolve, reject) => {
                server.close((error) => (error ? reject(error) : resolve()));
            });
        },
    };
}
