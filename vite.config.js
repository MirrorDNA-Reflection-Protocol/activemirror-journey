import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { build as bundleWithEsbuild } from 'esbuild'

const PRIVATE_RECALL_WASM_FILES = [
  'litert_wasm_compat_internal.js',
  'litert_wasm_compat_internal.wasm',
  'litert_wasm_internal.js',
  'litert_wasm_internal.wasm',
]

function privateRecallRuntimeAssets() {
  return {
    name: 'active-mirror-private-recall-runtime',
    configureServer(server) {
      server.middlewares.use('/__private_recall_worker.js', async (_request, response) => {
        try {
          const result = await bundleWithEsbuild({
            entryPoints: [resolve('src/workers/private-recall.worker.js')],
            bundle: true,
            format: 'iife',
            platform: 'browser',
            target: 'es2022',
            write: false,
            sourcemap: 'inline',
            logLevel: 'silent',
            define: {
              'import.meta.env.BASE_URL': JSON.stringify('/'),
            },
          })
          const contents = result.outputFiles[0].contents
          response.statusCode = 200
          response.setHeader('Content-Type', 'text/javascript; charset=utf-8')
          response.setHeader('Cache-Control', 'no-store')
          response.setHeader('Content-Length', contents.byteLength)
          response.end(contents)
        } catch (error) {
          response.statusCode = 500
          response.end(`Private recall worker build failed: ${error.message}`)
        }
      })
    },
    async writeBundle() {
      const source = resolve('node_modules/@litertjs/core/wasm')
      const target = resolve('dist/assets/litert/wasm')
      await mkdir(target, { recursive: true })
      await Promise.all(PRIVATE_RECALL_WASM_FILES.map((file) => (
        copyFile(resolve(source, file), resolve(target, file))
      )))
    },
  }
}

function appShellServiceWorker() {
  let base = '/'

  return {
    name: 'active-mirror-app-shell-service-worker',
    configResolved(config) {
      base = config.base
    },
    generateBundle(_options, bundle) {
      const shellFiles = [...new Set([
        'index.html',
        ...Object.values(bundle)
          .map((entry) => entry.fileName)
          .filter((fileName) => fileName.endsWith('.js') || fileName.endsWith('.css')),
      ])].sort()
      const shellUrls = shellFiles.map((fileName) => `${base}${fileName}`)
      const revision = createHash('sha256').update(shellUrls.join('\n')).digest('hex').slice(0, 16)
      const cachePrefix = 'active-mirror-app-shell-'
      const cacheName = `${cachePrefix}${revision}`
      const appIndex = `${base}index.html`
      const privateRecallRuntimePrefix = `${base}assets/litert/wasm/`

      const source = `const CACHE_PREFIX = ${JSON.stringify(cachePrefix)};
const CACHE_NAME = ${JSON.stringify(cacheName)};
const APP_INDEX = ${JSON.stringify(appIndex)};
const PRIVATE_RECALL_RUNTIME_CACHE = 'active-mirror-private-recall-runtime-v1';
const PRIVATE_RECALL_RUNTIME_PREFIX = ${JSON.stringify(privateRecallRuntimePrefix)};
const APP_SHELL = ${JSON.stringify(shellUrls, null, 2)};

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names
          .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith(${JSON.stringify(`${base}v1/`)})) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(APP_INDEX)));
    return;
  }

  if (url.pathname.startsWith(PRIVATE_RECALL_RUNTIME_PREFIX)) {
    event.respondWith(
      caches.open(PRIVATE_RECALL_RUNTIME_CACHE).then(async (cache) => {
        const cached = await cache.match(request, { ignoreVary: true });
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) await cache.put(request, response.clone());
        return response;
      }),
    );
    return;
  }

  if (!APP_SHELL.includes(url.pathname)) return;
  event.respondWith(caches.match(request, { ignoreVary: true }).then((cached) => cached || fetch(request)));
});
`

      this.emitFile({
        type: 'asset',
        fileName: 'service-worker.js',
        source,
      })
    },
  }
}

// Clean single-page build for the Active Mirror reflect app.
// The old multi-entry build (a second `clean-mirror` entry that dragged in the
// 5.5MB @mlc-ai/web-llm, plus a 56-route SEO/noscript plugin for the old site)
// is intentionally gone. This app is one page; its only graph is index.html ->
// src/main.jsx -> React. base is passed at build time (e.g. --base=/app/).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const localGateway = String(env.VITE_ACTIVE_MIRROR_DEV_PROXY_TARGET || '').trim()

  return {
    plugins: [react(), privateRecallRuntimeAssets(), appShellServiceWorker()],
    ...(localGateway ? {
      server: {
        proxy: {
          '/v1': {
            target: localGateway,
            changeOrigin: true,
          },
        },
      },
    } : {}),
  }
})
