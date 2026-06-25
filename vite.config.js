import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Clean single-page build for the Active Mirror reflect app.
// The old multi-entry build (a second `clean-mirror` entry that dragged in the
// 5.5MB @mlc-ai/web-llm, plus a 56-route SEO/noscript plugin for the old site)
// is intentionally gone. This app is one page; its only graph is index.html ->
// src/main.jsx -> React. base is passed at build time (e.g. --base=/app/).
export default defineConfig({
  plugins: [react()],
})
