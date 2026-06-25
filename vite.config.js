import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs'

// All React routes that need SPA fallbacks
const SPA_ROUTES = [
    // Main pages
    'start',
    'setup',
    'mirror',
    'app',
    'preview',
    'confessions',
    'pricing',
    'demo',
    'hub',
    'lab',
    'mirror-beta',
    'ambient',
    'scan',
    'twins',
    'brief',
    'cast',
    'proof',
    'research',
    'prism',
    'legal',
    'terms',
    'privacy',
    'trust',
    'ecosystem',
    'skills',
    'features',
    'builds',
    'status',
    'live',
    // Products
    'products',
    'products/mirrorgate',
    'products/mirrorbrain',
    'products/lingos',
    'products/mirrorrecall',
    'products/glyphtrail',
    'products/trustbydesign',
    'products/agentdna',
    'products/vault',
    'products/mirrorbalance',
    'products/cognitive-dashboard',
    'products/kavach',
    'products/chetana',
    // Use Cases
    'use-cases',
    'use-cases/individuals',
    'use-cases/teams',
    'use-cases/enterprise',
    'use-cases/government',
    'use-cases/healthcare',
    'use-cases/education',
    // Docs
    'docs',
    'docs/architecture',
    'docs/self-hosting',
    'docs/api',
    // About
    'about',
    'about/roadmap',
    'about/contact'
];

// SEO metadata for every route — title, description, OG tags, and noscript fallback content
const ROUTE_META = {
    'start': {
        title: 'Start — Active Mirror Onboarding',
        description: 'Discover your cognitive archetype in minutes. Take the BrainScan, meet your AI Twin, and share your MirrorSig.',
        noscript: '<h1>Start Your Active Mirror Journey</h1><p>The Start page walks you through a viral onboarding flow: BrainScan assessment, archetype discovery, AI Twin matching, and a shareable MirrorSig card. Answer 8 questions to map your cognitive architecture across 5 dimensions and find your thinking style from 8 archetypes. No account required to begin.</p><p><a href="https://activemirror.ai/scan/">Take the BrainScan</a> | <a href="https://activemirror.ai/features/">View Features</a> | <a href="https://activemirror.ai/">Home</a></p>'
    },
    'features': {
        title: 'Features — Active Mirror Capabilities',
        description: 'BrainScan, AI Twins, Mirror Reflection, MirrorCast, and more. The complete MirrorDNA capability catalog.',
        noscript: '<h1>Active Mirror Features</h1><p>Active Mirror provides a full suite of reflective AI capabilities: BrainScan maps your cognitive architecture across 5 dimensions, four AI Twins complement your thinking style, and Mirror Reflection enables sovereign AI-assisted thought. Additional tools include MirrorCast temporal messaging, BrainScan resonance matching, and ambient thinking modes.</p><p><a href="https://activemirror.ai/products/">View Products</a> | <a href="https://activemirror.ai/start/">Get Started</a></p>'
    },
    'ecosystem': {
        title: 'Ecosystem — MirrorDNA Sovereign AI Stack',
        description: 'Interactive map of the live MirrorDNA ecosystem: services, infrastructure, endpoints, and 73 open-source repos.',
        noscript: '<h1>The MirrorDNA Ecosystem</h1><p>The MirrorDNA ecosystem spans live endpoints at activemirror.ai, brain.activemirror.ai, beacon.activemirror.ai, and more. Infrastructure includes the Cognitive Dashboard, Sovereign Factory multi-agent spawner, MirrorSwarm orchestration, and 73 open-source repositories.</p><p><a href="https://activemirror.ai/hub/">System Hub</a> | <a href="https://activemirror.ai/docs/architecture/">Architecture</a></p>'
    },
    'pricing': {
        title: 'Pricing — Active Mirror',
        description: 'Active Mirror is free during beta. Pricing plans coming soon for individuals, teams, and enterprise.',
        noscript: '<h1>Active Mirror Pricing</h1><p>Active Mirror is currently free to use during the beta period. Pricing plans are in development and will be designed to align with accessible, sovereign reflection at every scale. Start using Mirror Reflection and BrainScan today at no cost.</p><p><a href="https://activemirror.ai/start/">Start Free</a> | <a href="https://activemirror.ai/about/contact/">Contact Sales</a></p>'
    },
    'demo': {
        title: 'Demo — Active Mirror Reflection',
        description: 'Experience the Active Mirror reflection interface live. An AI that asks instead of answers, with ambient sonic identity.',
        noscript: '<h1>Active Mirror Demo</h1><p>The demo page is the core Mirror Reflection experience — a conversation interface with a built-in sonic identity engine that responds to your interactions. The AI asks questions designed to surface insights rather than deliver answers.</p><p><a href="https://activemirror.ai/start/">Get Started</a> | <a href="https://activemirror.ai/features/">Features</a></p>'
    },
    'scan': {
        title: 'BrainScan — Discover Your Cognitive Archetype',
        description: 'Answer 8 questions to map your brain across 5 dimensions and discover your cognitive archetype. Free, private, instant.',
        noscript: '<h1>BrainScan — Cognitive Architecture Assessment</h1><p>BrainScan is an 8-question cognitive assessment that maps your thinking style across five dimensions: Topology, Velocity, Depth, Entropy, and Evolution. Your answers identify one of eight archetypes including Architect, Explorer, Builder, and Analyst. Results include your cognitive fingerprint and matched AI Twin.</p><p><a href="https://activemirror.ai/start/">Take the Scan</a></p>'
    },
    'mirror': {
        title: 'Mirror — Reflective AI Experience',
        description: 'The ambient mirror reflection interface. AI that thinks with you, not for you.',
        noscript: '<h1>Mirror — Reflective AI</h1><p>The Mirror page provides an ambient, reflective AI experience. Unlike conventional chatbots that give answers, Mirror asks questions designed to surface your own insights and deepen understanding.</p><p><a href="https://activemirror.ai/">Home</a> | <a href="https://activemirror.ai/demo/">Try Demo</a></p>'
    },
    'app': {
        title: 'App — Active Mirror Browser Workspace',
        description: 'Open the Active Mirror browser workspace for pulse, atlas, proof, memory, and actions in one governed surface.',
        noscript: '<h1>Active Mirror Browser Workspace</h1><p>The browser workspace turns Active Mirror into a remembered route instead of a blank landing page. Open pulse, atlas, proof, memory, and action panes, inspect live surfaces, and move through the ecosystem with one consistent visual grammar.</p><p><a href="https://activemirror.ai/app?pane=pulse">Open Pulse</a> | <a href="https://activemirror.ai/app?pane=atlas">Open Atlas</a> | <a href="https://activemirror.ai/">Home</a></p>'
    },
    'skills': {
        title: 'Skills — MirrorDNA Command Reference',
        description: '40 slash commands, 46 daemons, 9 plugins. The complete MirrorDNA capability and automation reference.',
        noscript: '<h1>MirrorDNA Skills and Command Reference</h1><p>The Skills page documents 40 slash commands organized across workflow, intelligence, state and memory, infrastructure, vault and knowledge, and publishing categories. It also lists the full set of daemons, plugins, and automation hooks that make up the MirrorDNA operating system.</p><p><a href="https://activemirror.ai/docs/">Documentation</a> | <a href="https://activemirror.ai/builds/">Builds</a></p>'
    },
    'builds': {
        title: 'Builds — What We\'ve Shipped',
        description: 'Auto-synced from SHIPLOG.md. Every shipped capability across the MirrorDNA ecosystem, organized by module.',
        noscript: '<h1>MirrorDNA Shipped Capabilities</h1><p>The Builds page shows everything shipped across the MirrorDNA ecosystem, synced automatically from SHIPLOG.md. Capabilities are organized by module, each showing its number of shipped entries and most recent ship date. This is the live inventory of what exists and works in production.</p><p><a href="https://activemirror.ai/products/">Products</a> | <a href="https://activemirror.ai/research/">Research</a></p>'
    },
    'research': {
        title: 'Research — MirrorDNA Published Papers',
        description: 'Peer-reviewed and preprint research on reflective AI, the Orchestrator Model, SCD protocol, and MirrorGraph.',
        noscript: '<h1>MirrorDNA Research Papers</h1><p>Active Mirror has produced multiple published and preprint papers on Zenodo and arXiv, covering number-theoretic graph theory applied to knowledge meshes, the Orchestrator Model for human-AI collaboration, and the Structured Contextual Distillation (SCD) protocol for deterministic AI state persistence. All papers are citable with BibTeX.</p><p><a href="https://activemirror.ai/about/">About</a> | <a href="https://activemirror.ai/docs/architecture/">Architecture</a></p>'
    },
    'confessions': {
        title: 'Confessions — AI Superego Live Feed',
        description: 'Watch an AI fight its own worst impulses in real time. Live feed of blocked thoughts and the superego flight log.',
        ogUrl: 'https://activemirror.ai/confessions/',
        ogTitle: 'Confessions — AI Superego Live Feed',
        ogDescription: 'Live flight recorder of blocked outputs and AI guardrail decisions.',
        twitterUrl: 'https://activemirror.ai/confessions/',
        twitterTitle: 'Confessions — AI Superego Live Feed',
        twitterDescription: 'Live view of blocked outputs, policy triggers, and governance events.',
        canonical: 'https://activemirror.ai/confessions/',
        noscript: '<h1>AI Confessions — Live Superego Feed</h1><p>Confessions is a live public feed of everything the Active Mirror AI tried to say but was blocked from saying — the temptations resisted, the thoughts filtered, and the superego decisions recorded in real time. The flight log and stats update every 5 seconds.</p><p><a href="https://activemirror.ai/products/mirrorgate/">MirrorGate</a> | <a href="https://activemirror.ai/trust/">Trust</a></p>'
    },
    'brief': {
        title: 'Brief — Temporal Intelligence Dashboard',
        description: 'Daily AI briefings, predictions with confidence scores, and a tracked timeline. Powered by brief.activemirror.ai.',
        noscript: '<h1>Active Mirror Daily Brief</h1><p>The Brief dashboard delivers daily AI-generated briefings drawing on calendar, email, weather, GitHub, and news signals. It surfaces active predictions with confidence scores and tracks their outcomes over time on a timeline view.</p><p><a href="https://activemirror.ai/features/">Features</a> | <a href="https://activemirror.ai/">Home</a></p>'
    },
    'cast': {
        title: 'MirrorCast — Temporal Messaging',
        description: 'Schedule messages to your future self, set dead man\'s switches, and trigger delivery by time, device, or location.',
        noscript: '<h1>MirrorCast — Messages Across Time</h1><p>MirrorCast is a temporal messaging system that lets you schedule messages for your future self, configure emergency dispatches, sync across devices via encrypted mesh, and trigger delivery when you arrive at or leave specific locations.</p><p><a href="https://activemirror.ai/features/">Features</a> | <a href="https://activemirror.ai/products/">Products</a></p>'
    },
    'hub': {
        title: 'System Hub — MirrorDNA Live Infrastructure',
        description: 'Live dashboard showing all 16 MirrorDNA systems, service status, 95 repos, and ecosystem stats.',
        noscript: '<h1>MirrorDNA System Hub</h1><p>The System Hub displays the entire MirrorDNA infrastructure: 16 systems including MirrorGate, Sovereign Factory, MirrorSwarm, Continuity Bus, and more, each with status, port, type, and load. Aggregate stats: 87 shipped capabilities, 95 repos, 9 layers, 24 services, 5 domains, 11 models, and 5,000+ vault notes.</p><p><a href="https://activemirror.ai/ecosystem/">Ecosystem</a> | <a href="https://activemirror.ai/docs/">Docs</a></p>'
    },
    'proof': {
        title: 'Proof of Memory — Active Mirror',
        description: 'Cryptographic proof of AI memory and consent. Attention tracking demo showing verifiable AI decisions.',
        noscript: '<h1>Proof of Memory Protocol</h1><p>The Proof of Memory page demonstrates Active Mirror\'s consent and attention logging system, showing cryptographic evidence that the AI only sees what you consent to share.</p><p><a href="https://activemirror.ai/trust/">Trust</a> | <a href="https://activemirror.ai/products/mirrorgate/">MirrorGate</a></p>'
    },

    // Products
    'products': {
        title: 'Products — MirrorDNA Ecosystem',
        description: 'MirrorGate, MirrorBrain, LingOS, MirrorRecall, GlyphTrail, TrustByDesign, AgentDNA, Vault, and more.',
        noscript: '<h1>MirrorDNA Products</h1><p>The MirrorDNA ecosystem includes: <a href="/products/mirrorgate/">MirrorGate</a> (governance proxy), <a href="/products/mirrorbrain/">MirrorBrain</a> (cognitive API), <a href="/products/lingos/">LingOS</a> (conversational framework), <a href="/products/mirrorrecall/">MirrorRecall</a> (memory layer), <a href="/products/glyphtrail/">GlyphTrail</a> (trace visualization), <a href="/products/trustbydesign/">TrustByDesign</a> (compliance), <a href="/products/agentdna/">AgentDNA</a> (persona versioning), <a href="/products/vault/">Vault Manager</a> (encrypted storage), <a href="/products/mirrorbalance/">MirrorBalance</a> (governance engine), <a href="/products/cognitive-dashboard/">Cognitive Dashboard</a>, and <a href="/products/chetana/">Chetana</a> (digital awareness).</p>'
    },
    'products/mirrorgate': {
        title: 'MirrorGate — Governance Before Generation',
        description: 'Policy-driven AI proxy that enforces rules before inference executes. Fail-closed, cryptographically audited.',
        noscript: '<h1>MirrorGate — AI Governance Proxy</h1><p>MirrorGate is a policy-driven proxy that sits in front of AI inference and evaluates every request against defined governance policies before it executes. Features pre-inference policy enforcement, cryptographic audit logging, fail-closed design, and sub-millisecond evaluation. Use cases include prompt injection blocking, data residency enforcement, and regulatory audit trails.</p><p><a href="https://activemirror.ai/confessions/">Live Feed</a> | <a href="https://activemirror.ai/products/">All Products</a></p>'
    },
    'products/mirrorbrain': {
        title: 'MirrorBrain — Cognitive Engine for Reflective AI',
        description: 'FastAPI backend powering BrainScan, AI Twins, and Resonance matching. OpenAI-compatible with identity transforms.',
        noscript: '<h1>MirrorBrain — Cognitive API</h1><p>MirrorBrain is the FastAPI backend that powers BrainScan, the four AI Twins (Guardian, Scout, Synthesizer, Mirror), and Resonance matching between users. It exposes an OpenAI-compatible API with identity-aware transforms.</p><p><a href="https://activemirror.ai/scan/">Try BrainScan</a> | <a href="https://activemirror.ai/docs/api/">API Docs</a></p>'
    },
    'products/lingos': {
        title: 'LingOS — Conversational AI, Observable by Design',
        description: 'Framework for building AI conversations with built-in MirrorDNA tracing, audit trails, and compliance logging.',
        noscript: '<h1>LingOS — Conversational AI Framework</h1><p>LingOS is a framework for building AI conversations with native observability: every message logged, every decision tracked, every interaction auditable. Available as open-source LingOS Lite and LingOS Pro for enterprise use with Vault Manager, SSO, and priority support.</p><p><a href="https://activemirror.ai/products/">All Products</a></p>'
    },
    'products/mirrorrecall': {
        title: 'MirrorRecall — Memory That Persists',
        description: 'Session and profile memory layer for AI that remembers across sessions. Conflict detection, token-bounded injection.',
        noscript: '<h1>MirrorRecall — Persistent AI Memory</h1><p>MirrorRecall provides two tiers of memory for AI systems: session memory that captures the current conversation, and profile memory that persists across all sessions. Contradictions in memory surface for explicit resolution rather than silent overwrite.</p><p><a href="https://activemirror.ai/products/">All Products</a></p>'
    },
    'products/glyphtrail': {
        title: 'GlyphTrail — Trace Visualization for MirrorDNA',
        description: 'Interactive timeline, graph, and table views for MirrorDNA traces. Replay mode and trace comparison for auditors.',
        noscript: '<h1>GlyphTrail — AI Trace Visualization</h1><p>GlyphTrail provides interactive visualization of MirrorDNA traces in three views: chronological timeline, branching graph, and table. Replay mode allows step-by-step playback. Trace comparison lets you diff two runs to identify what changed.</p><p><a href="https://activemirror.ai/products/">All Products</a></p>'
    },
    'products/trustbydesign': {
        title: 'TrustByDesign — Compliance Built In, Not Bolted On',
        description: 'GDPR, HIPAA, SOC2 compliance framework with automated checking, audit reports, and data lineage tracking.',
        noscript: '<h1>TrustByDesign — AI Compliance Framework</h1><p>TrustByDesign is a compliance framework for AI systems supporting GDPR, HIPAA, and SOC2, with ISO 27001 on the roadmap. Automated compliance checking, audit report generation, data lineage tracking, and clear certification paths.</p><p><a href="https://activemirror.ai/trust/">Trust</a> | <a href="https://activemirror.ai/products/">All Products</a></p>'
    },
    'products/agentdna': {
        title: 'AgentDNA — AI Personality, Versioned',
        description: 'Define, version, test, and deploy AI personas with structured definitions and rollback. Beta.',
        noscript: '<h1>AgentDNA — Versioned AI Personas</h1><p>AgentDNA provides a system for defining AI personalities as structured, versioned artifacts. Personas can be tested against scenarios before deployment, rolled back if needed, and eventually shared through a community marketplace.</p><p><a href="https://activemirror.ai/products/">All Products</a></p>'
    },
    'products/vault': {
        title: 'Vault Manager — Your Data, Your Keys',
        description: 'Enterprise-grade encrypted storage for MirrorDNA with end-to-end encryption, access control, and self-hosting.',
        noscript: '<h1>Vault Manager — Sovereign Encrypted Storage</h1><p>Vault Manager is the enterprise storage layer providing end-to-end encryption at rest and in transit, fine-grained access control, team management with role-based permissions, and a self-hosted deployment option for full data sovereignty.</p><p><a href="https://activemirror.ai/about/contact/">Contact Sales</a> | <a href="https://activemirror.ai/products/">All Products</a></p>'
    },
    'products/mirrorbalance': {
        title: 'MirrorBalance — Governance You Can Prove',
        description: 'Sovereign governance engine with Policy DSL, multi-layer defense, evidence chains, and Sovereign Control Plane.',
        noscript: '<h1>MirrorBalance — AI Governance Engine</h1><p>MirrorBalance is a production-grade governance engine featuring a Policy DSL for deterministic rule definition, five defense modules, an autonomy layer with drift firewall and entropy engine, economic policy enforcement, and a cryptographic evidence chain for every decision. All 189 tests pass.</p><p><a href="https://activemirror.ai/products/mirrorgate/">MirrorGate</a> | <a href="https://activemirror.ai/products/">All Products</a></p>'
    },
    'products/cognitive-dashboard': {
        title: 'Cognitive Dashboard — See Everything, Miss Nothing',
        description: '12-panel live terminal dashboard monitoring all MirrorDNA services, automations, devices, and system health.',
        noscript: '<h1>Cognitive Dashboard — Live System Monitor</h1><p>The Cognitive Dashboard is a 12-panel terminal TUI that monitors the entire MirrorDNA stack in real time. It discovers LaunchAgents, git hooks, event scripts, phone daemons, and GitHub Actions at runtime. Panels cover services, factory runs, swarm activity, energy, drift, metabolism, automations, device mesh, and cost tracking.</p><p><a href="https://activemirror.ai/hub/">System Hub</a> | <a href="https://activemirror.ai/products/">All Products</a></p>'
    },
    'products/kavach': {
        title: 'Kavach — Now Chetana',
        description: 'Kavach has been unified with Chetana. AI-powered scam detection and digital awareness for India.',
        noscript: '<h1>Kavach — Now Chetana</h1><p>Kavach has been unified with <a href="https://activemirror.ai/products/chetana/">Chetana</a>, the comprehensive digital awareness tool for India. Visit the Chetana page for details on scam detection, deepfake analysis, and multilingual support.</p>'
    },
    'products/chetana': {
        title: 'Chetana — Digital Awareness for Every Indian',
        description: 'Free WhatsApp-first scam detection and deepfake analysis in 12 Indian languages. No data leaves India.',
        noscript: '<h1>Chetana — Digital Awareness for India</h1><p>Chetana is a free AI-powered digital awareness tool built for India. Forward any suspicious message to Chetana on WhatsApp and receive a risk assessment in your own language instantly — across 12 Indian languages including Hindi, Tamil, Telugu, and more. It verifies scam links, phone numbers, UPI IDs, and investment schemes, and detects deepfakes in photos and voice clips. All processing stays in India.</p><p><a href="https://chetana.activemirror.ai/">Try Chetana Live</a> | <a href="https://activemirror.ai/products/">All Products</a></p>'
    },

    // Use Cases
    'use-cases': {
        title: 'Use Cases — Active Mirror for Every Context',
        description: 'Active Mirror for individuals, teams, enterprise, government, healthcare, and education.',
        noscript: '<h1>Active Mirror Use Cases</h1><p>Active Mirror adapts to a wide range of contexts: <a href="/use-cases/individuals/">personal reflection</a>, <a href="/use-cases/teams/">team intelligence</a>, <a href="/use-cases/enterprise/">enterprise governance</a>, <a href="/use-cases/government/">government sovereignty</a>, <a href="/use-cases/healthcare/">healthcare wellness</a>, and <a href="/use-cases/education/">educational reflection</a>.</p>'
    },
    'use-cases/individuals': {
        title: 'Active Mirror for Individuals — Think More Clearly',
        description: 'AI-assisted journaling, decision support, self-discovery, and personal knowledge management. Free to start.',
        noscript: '<h1>Active Mirror for Individuals</h1><p>For individuals, Active Mirror acts as a thinking partner rather than a chatbot — asking questions instead of giving answers. Use cases include daily reflection journaling, decision support by challenging assumptions, discovering patterns in your thinking, and building a personal knowledge base.</p><p><a href="https://activemirror.ai/start/">Start Free</a></p>'
    },
    'use-cases/teams': {
        title: 'Active Mirror for Teams — Collaborative Intelligence',
        description: 'Team retrospectives, brainstorming facilitation, meeting synthesis, and shared knowledge management.',
        noscript: '<h1>Active Mirror for Teams</h1><p>Active Mirror helps teams think better together by synthesizing perspectives and building shared understanding. Applications include structured retrospectives, AI-guided brainstorming, meeting synthesis, and a persistent shared knowledge base.</p><p><a href="https://activemirror.ai/about/contact/">Contact Sales</a></p>'
    },
    'use-cases/enterprise': {
        title: 'Active Mirror for Enterprise — AI Governance at Scale',
        description: 'Deploy reflective AI with self-hosting, SSO, audit logs, GDPR/SOC2/HIPAA compliance, and SLAs.',
        noscript: '<h1>Active Mirror for Enterprise</h1><p>Enterprise deployments include MirrorGate policy enforcement, TrustByDesign compliance for GDPR, SOC2, and HIPAA, self-hosted deployment options, SSO integration, audit logs, and dedicated SLAs.</p><p><a href="https://activemirror.ai/about/contact/">Contact Enterprise Sales</a></p>'
    },
    'use-cases/government': {
        title: 'Active Mirror for Government — Sovereign AI for the Public Sector',
        description: 'Accountable, auditable, on-premise AI for citizen services, policy analysis, and public-sector compliance.',
        noscript: '<h1>Active Mirror for Government</h1><p>Government deployments require accountability, auditability, and data sovereignty from day one. Active Mirror supports citizen service automation with human oversight, structured policy analysis, cryptographic audit logging, and on-premise deployment.</p><p><a href="https://activemirror.ai/about/contact/">Request Demo</a></p>'
    },
    'use-cases/healthcare': {
        title: 'Active Mirror for Healthcare — Reflective AI for Wellness',
        description: 'HIPAA-compliant patient journaling and care team collaboration. Not a medical device. Wellness support only.',
        noscript: '<h1>Active Mirror for Healthcare</h1><p>Active Mirror supports healthcare contexts through HIPAA-compliant reflective tools for patient wellness journaling and care team collaboration. Active Mirror is not a medical device or diagnostic tool — it is a wellness reflection tool.</p><p><a href="https://activemirror.ai/about/contact/">Contact for Partnership</a></p>'
    },
    'use-cases/education': {
        title: 'Active Mirror for Education — Learning Through Reflection',
        description: 'Student reflection journals, research assistance, and transparent AI use with audit trails for academic integrity.',
        noscript: '<h1>Active Mirror for Education</h1><p>In education, Active Mirror enhances thinking rather than replacing it. Applications include structured student reflection journals, research assistance with observable reasoning, and transparent AI use with full audit trails supporting academic integrity.</p><p><a href="https://activemirror.ai/about/contact/">Join Pilot Program</a></p>'
    },

    // Docs
    'docs': {
        title: 'Documentation — MirrorDNA Protocol',
        description: 'Everything you need to understand, deploy, and build on MirrorDNA. Architecture, self-hosting, and API reference.',
        noscript: '<h1>MirrorDNA Documentation</h1><p>The docs cover the MirrorDNA protocol from three angles: <a href="/docs/architecture/">Architecture Overview</a> explains how 9 layers and 73 repositories fit together, <a href="/docs/self-hosting/">Self-Hosting Guide</a> covers running the stack on your own infrastructure, and the <a href="/docs/api/">API Reference</a> documents all live endpoints.</p>'
    },
    'docs/architecture': {
        title: 'Architecture Overview — MirrorDNA',
        description: 'How 9 architectural layers across 73 repos fit together: identity, engine, memory, governance, observability, compliance.',
        noscript: '<h1>MirrorDNA Architecture Overview</h1><p>MirrorDNA is organized into 9 architectural layers spanning 73 repositories. Core layers: Identity (MirrorDNA constitution, GlyphOS), Engine (MirrorBrain, local routing, JSON Kernel), Memory (MirrorRecall, ChromaDB), Governance (MirrorGate, pre-inference validation), Observability (GlyphTrail, cryptographic attestations), and Compliance (TrustByDesign, GDPR/HIPAA/SOC2).</p><p><a href="https://activemirror.ai/docs/">All Docs</a></p>'
    },
    'docs/self-hosting': {
        title: 'Self-Hosting Guide — Run MirrorDNA on Your Infrastructure',
        description: 'Deploy the full MirrorDNA stack yourself. Requirements, repos, and setup steps for full sovereignty.',
        noscript: '<h1>Self-Hosting MirrorDNA</h1><p>The self-hosting guide covers everything needed to run the MirrorDNA stack on your own infrastructure with zero cloud dependencies. Requirements: Docker, Node.js 18+, Python 3.11+, 4GB RAM minimum, Ollama for local inference or API keys. Core repos: mirrorbrain-api, activemirror-site, mirrorgate, mirrorrecall.</p><p><a href="https://activemirror.ai/docs/">All Docs</a></p>'
    },
    'docs/api': {
        title: 'API Reference — MirrorDNA Live Endpoints',
        description: 'Full developer reference for MirrorBrain, MirrorGate, and other live MirrorDNA APIs with request/response examples.',
        noscript: '<h1>MirrorDNA API Reference</h1><p>The API reference documents all live MirrorDNA endpoints. MirrorBrain at brain.activemirror.ai: health, BrainScan questions, quiz submission, resonance calculation, and consent logging. MirrorGate at proxy.activemirror.ai: the policy-enforced AI proxy interface.</p><p><a href="https://activemirror.ai/docs/">All Docs</a></p>'
    },

    // About
    'about': {
        title: 'About Active Mirror — The Shift from Prediction to Reflection',
        description: 'How one person built a production sovereign AI OS from first principles. No VC. No board. Just reflective AI.',
        noscript: '<h1>About Active Mirror</h1><p>Active Mirror is built by a solo builder constructing a sovereign AI stack from first principles starting in early 2025. Unlike AI systems that bolt memory onto prediction engines, MirrorDNA implements Reflective AI — identity-bound, continuity-governed intelligence anchored to stable truth.</p><p><a href="https://activemirror.ai/about/roadmap/">Roadmap</a> | <a href="https://activemirror.ai/research/">Research</a> | <a href="https://activemirror.ai/about/contact/">Contact</a></p>'
    },
    'about/roadmap': {
        title: 'Roadmap — Active Mirror',
        description: 'What\'s shipped, what\'s in progress in Q1 2026, and what\'s planned through H2 2026 and beyond.',
        noscript: '<h1>Active Mirror Roadmap</h1><p>Already shipped: BrainScan, MirrorGate, MirrorBalance, MirrorSwarm, 5 published papers, mobile command, public launch. In progress Q1 2026: NetBird sovereign mesh, MirrorBrain-Mobile, wake word pipeline, enterprise outreach. Planned Q2-H2 2026: self-hosting packages, team collaboration, federated MirrorDNA mesh.</p><p><a href="https://activemirror.ai/about/">About</a> | <a href="https://activemirror.ai/builds/">Builds</a></p>'
    },
    'about/contact': {
        title: 'Contact — Active Mirror',
        description: 'Reach out for enterprise deployment, partnerships, research collaboration, or general inquiries. paul@activemirror.ai',
        noscript: '<h1>Contact Active Mirror</h1><p>Contact Active Mirror for enterprise sales, integration partnerships, research and academic collaborations, or general inquiries. Email: paul@activemirror.ai</p><p><a href="https://activemirror.ai/about/">About</a> | <a href="https://activemirror.ai/">Home</a></p>'
    },

    // Legal
    'legal': {
        title: 'Legal — Active Mirror',
        description: 'Legal information, terms of service, and privacy policy for Active Mirror and MirrorDNA.',
        noscript: '<h1>Legal — Active Mirror</h1><p><a href="https://activemirror.ai/terms/">Terms of Service</a> | <a href="https://activemirror.ai/privacy/">Privacy Policy</a> | <a href="https://activemirror.ai/trust/">Trust Center</a></p>'
    },
    'terms': {
        title: 'Terms of Service — Active Mirror',
        description: 'Terms of service for Active Mirror and MirrorDNA products and services.',
        noscript: '<h1>Terms of Service</h1><p>Terms of service governing the use of Active Mirror, MirrorDNA, and all associated products and services.</p>'
    },
    'privacy': {
        title: 'Privacy Policy — Active Mirror',
        description: 'How Active Mirror handles your data. On-device processing, no tracking, sovereign data ownership.',
        noscript: '<h1>Privacy Policy</h1><p>Active Mirror is built on sovereign data ownership. On-device processing where possible, no behavioral tracking, no data sales. Your data stays yours.</p>'
    },
    'trust': {
        title: 'Trust Center — Active Mirror',
        description: 'How Active Mirror earns and maintains trust. Security practices, compliance, and transparency commitments.',
        noscript: '<h1>Trust Center</h1><p>Trust at Active Mirror is demonstrated through transparency and documented evidence. This page covers security practices, compliance frameworks, data handling, and our commitments to users.</p><p><a href="https://activemirror.ai/products/trustbydesign/">TrustByDesign</a> | <a href="https://activemirror.ai/privacy/">Privacy Policy</a></p>'
    }
}

const applyRouteMeta = (route, htmlPath) => {
    const meta = ROUTE_META[route]
    if (!meta || !existsSync(htmlPath)) return

    let html = readFileSync(htmlPath, 'utf8')

    // Update title and meta tags
    if (meta.title) {
        html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${meta.title}</title>`)
        html = html.replace(/<meta name="title" content="[^"]*" \/>/, `<meta name="title" content="${meta.title}" />`)
    }
    if (meta.description) {
        html = html.replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${meta.description}" />`)
    }

    // Update OG tags
    const ogUrl = meta.ogUrl || `https://activemirror.ai/${route}/`
    const ogTitle = meta.ogTitle || meta.title
    const ogDesc = meta.ogDescription || meta.description
    html = html.replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${ogUrl}" />`)
    html = html.replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${ogTitle}" />`)
    html = html.replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${ogDesc}" />`)

    // Update Twitter tags
    const twitterUrl = meta.twitterUrl || ogUrl
    const twitterTitle = meta.twitterTitle || ogTitle
    const twitterDesc = meta.twitterDescription || ogDesc
    html = html.replace(/<meta name="twitter:url" content="[^"]*" \/>/, `<meta name="twitter:url" content="${twitterUrl}" />`)
    html = html.replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${twitterTitle}" />`)
    html = html.replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${twitterDesc}" />`)

    // Update canonical
    const canonical = meta.canonical || `https://activemirror.ai/${route}/`
    html = html.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canonical}" />`)

    // Inject noscript content with real crawlable text
    if (meta.noscript) {
        const noscriptBlock = `<noscript>
        <div style="padding: 40px; max-width: 800px; margin: 0 auto; font-family: system-ui; color: #ccc; background: #000; line-height: 1.6;">
            ${meta.noscript}
            <hr style="border-color: #333; margin: 2em 0;" />
            <nav>
                <a href="https://activemirror.ai/">Home</a> |
                <a href="https://activemirror.ai/products/">Products</a> |
                <a href="https://activemirror.ai/features/">Features</a> |
                <a href="https://activemirror.ai/docs/">Docs</a> |
                <a href="https://activemirror.ai/about/">About</a> |
                <a href="https://activemirror.ai/about/contact/">Contact</a>
            </nav>
            <p style="font-size: 0.85em; color: #666; margin-top: 1em;">Active MirrorOS by N1 Intelligence (OPC) Pvt Ltd. Governance-first cognition for autonomous systems.</p>
        </div>
    </noscript>`
        html = html.replace(/<noscript>[\s\S]*?<\/noscript>/, noscriptBlock)
    }

    writeFileSync(htmlPath, html)
}

// Plugin to copy index.html for SPA routing on GitHub Pages
const spaFallbackPlugin = () => ({
    name: 'spa-fallback',
    closeBundle() {
        const distIndex = resolve(__dirname, 'dist/index.html')

        // Create 404.html for GitHub Pages SPA fallback
        copyFileSync(distIndex, resolve(__dirname, 'dist/404.html'))

        // Create fallback for each SPA route
        for (const route of SPA_ROUTES) {
            const routeDir = resolve(__dirname, `dist/${route}`)
            if (!existsSync(routeDir)) {
                mkdirSync(routeDir, { recursive: true })
            }
            const targetIndex = resolve(routeDir, 'index.html')
            // Only copy if doesn't exist (don't override static pages)
            if (!existsSync(targetIndex)) {
                copyFileSync(distIndex, targetIndex)
            }
            applyRouteMeta(route, targetIndex)
        }

        console.log(`\u2705 SPA fallbacks created with per-route SEO: 404.html + ${SPA_ROUTES.length} routes`)
    }
})

export default defineConfig({
    plugins: [react(), spaFallbackPlugin()],
    base: '/',
    build: {
        outDir: 'dist',
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                'clean-mirror': resolve(__dirname, 'clean-mirror/index.html')
            },
            output: {
                manualChunks: {
                    'web-llm': ['@mlc-ai/web-llm'],
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-motion': ['framer-motion'],
                }
            }
        }
    },
    optimizeDeps: {
        exclude: ['@mlc-ai/web-llm']
    }
})
