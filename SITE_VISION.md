# ⟡ Active Mirror Site Vision

## Current State

The site currently has:
- Home page with product features (BrainScan, Twins, Brief, Cast)
- Links to external MirrorDNA-Docs for technical content
- Legal pages (Terms, Privacy, Trust)
- AI interaction pages (Mirror, Demo, Lab)

## What's Missing

### 1. Ecosystem Showcase (Products)
The 95-repo ecosystem isn't visible on the site. Components like MirrorGate, MirrorBrain, LingOS deserve their own pages.

### 2. Use Case Pages
No audience-specific content for different users (individuals, teams, enterprise, government).

### 3. On-Site Documentation
Docs are external (MirrorDNA-Docs). Need at least overview content on the main site.

### 4. Roadmap/Vision
No public roadmap showing what's coming.

---

## The Dream: Full Site Architecture

```
activemirror.ai/
├── /                       # Home (current)
├── /start                  # Onboarding flow (current)
├── /mirror                 # Main reflection (current)
│
├── /products/              # NEW: Ecosystem showcase
│   ├── index               # Product overview grid
│   ├── mirrorgate          # Inference control plane
│   ├── mirrorbrain         # Cognitive engine API
│   ├── lingos              # Conversational AI framework
│   ├── mirrorrecall        # Session memory layer
│   ├── glyphtrail          # Trace visualization
│   ├── trustbydesign       # Compliance framework
│   ├── agentdna            # Persona engine
│   └── vault               # Secure storage
│
├── /use-cases/             # NEW: Audience-specific
│   ├── index               # Use case overview
│   ├── individuals         # Personal reflection, journaling
│   ├── teams               # Team collaboration
│   ├── enterprise          # Enterprise deployment
│   ├── government          # Public sector, citizen services
│   ├── healthcare          # Mental wellness (with disclaimers)
│   └── education           # Learning, research, academia
│
├── /solutions/             # NEW: Problem-specific
│   ├── sovereign-ai        # Self-hosted, privacy-first
│   ├── compliance          # GDPR, HIPAA, SOC2
│   └── integration         # API, SDK, plugins
│
├── /docs/                  # NEW: On-site documentation
│   ├── index               # Getting started
│   ├── architecture        # System overview
│   ├── self-hosting        # Run your own
│   ├── api                 # API reference
│   └── security            # Security model
│
├── /about/                 # NEW: Company info
│   ├── index               # Story, mission
│   ├── roadmap             # Public roadmap
│   └── contact             # Enterprise inquiries
│
├── /intelligence/          # Current features
│   ├── scan (/scan)        # BrainScan
│   ├── twins (/twins)      # AI Twins
│   ├── brief (/brief)      # Temporal intelligence
│   └── cast (/cast)        # Messages through time
│
├── /pricing                # Pricing tiers (current)
├── /research               # Research page (current)
├── /proof                  # Mirror Proof demo (current)
│
└── /legal/                 # Legal (current)
    ├── terms
    ├── privacy
    └── trust
```

---

## Product Pages Content

### MirrorGate
**Tagline:** Governance before generation.
**What:** Policy-driven proxy that governs AI requests before they execute.
**For:** Organizations needing infrastructure-level AI control.
**Key Features:**
- Pre-inference policy enforcement
- Cryptographically auditable control plane
- Fail-closed by default
- No bypass architecture

### MirrorBrain
**Tagline:** Cognitive engine for reflective AI.
**What:** FastAPI backend powering BrainScan, Twins, and Resonance.
**For:** Developers building on the MirrorDNA protocol.
**Key Features:**
- BrainScan quiz engine
- AI Twins (Guardian, Scout, Synthesizer, Mirror)
- Brain resonance matching
- OpenAI-compatible API

### LingOS
**Tagline:** Conversational AI, observable by design.
**What:** Framework for building AI conversations with built-in tracing.
**For:** Developers wanting transparent AI interactions.
**Key Features:**
- Lite (open source) and Pro versions
- MirrorDNA native integration
- Structured conversation memory
- Compliance-ready logging

### MirrorRecall
**Tagline:** Memory that persists.
**What:** Session and profile memory for AI that remembers.
**For:** Any AI system needing continuity.
**Key Features:**
- Session memory (per conversation)
- Profile memory (persistent user facts)
- Context assembly with token budgets
- Conflict detection and resolution

### GlyphTrail
**Tagline:** See what AI sees.
**What:** Interactive visualization for MirrorDNA traces.
**For:** Auditors, researchers, curious users.
**Key Features:**
- Timeline view
- Graph visualization
- Trace comparison
- Replay mode

### TrustByDesign
**Tagline:** Compliance built in, not bolted on.
**What:** Framework for GDPR, HIPAA, SOC2 compliance.
**For:** Regulated industries.
**Key Features:**
- Automated compliance checking
- Audit reporting
- Data residency controls
- Right to be forgotten

### AgentDNA
**Tagline:** Personality, versioned.
**What:** Persona engine for consistent AI personalities.
**For:** Anyone building AI with character.
**Key Features:**
- Persona definitions
- Version control
- A/B testing
- Persona marketplace

### Vault Manager
**Tagline:** Your data, your keys.
**What:** Encrypted storage for MirrorDNA data.
**For:** Privacy-conscious deployments.
**Key Features:**
- End-to-end encryption
- Key management
- Access control
- Compliance profiles

---

## Use Case Pages Content

### Individuals
**Hero:** "Your thoughts, reflected back with clarity."
**Use cases:**
- Daily journaling with AI reflection
- Decision-making support
- Self-discovery and pattern recognition
- Personal knowledge management
**CTA:** Start free with BrainScan

### Teams
**Hero:** "Collaborative intelligence for better decisions."
**Use cases:**
- Team retrospectives
- Brainstorming facilitation
- Meeting synthesis
- Shared knowledge base
**CTA:** Contact for team pricing

### Enterprise
**Hero:** "AI governance at scale."
**Use cases:**
- Employee wellness (non-clinical)
- Knowledge management
- Decision support systems
- AI policy enforcement
**CTA:** Talk to enterprise sales

### Government
**Hero:** "Sovereign AI for the public sector."
**Use cases:**
- Citizen service automation
- Policy analysis
- Internal knowledge management
- Compliance and audit trails
**CTA:** Request government demo

### Healthcare
**Hero:** "Reflective AI for wellness journeys."
**Use cases:**
- Patient journaling (non-diagnostic)
- Care team collaboration
- Research data collection
- HIPAA-compliant deployment
**Disclaimer:** NOT for diagnosis or treatment
**CTA:** Healthcare partnership inquiry

### Education
**Hero:** "Learning through reflection."
**Use cases:**
- Student reflection journals
- Research assistance
- Curriculum analysis
- Academic integrity (transparent AI use)
**CTA:** Education pilot program

---

## Roadmap Page Content

### Now (Live)
- ✅ BrainScan cognitive assessment
- ✅ AI Twins (Guardian, Scout, Synthesizer, Mirror)
- ✅ Mirror reflection engine
- ✅ Consent system with proof logging
- ✅ MirrorDNA protocol v15.3
- ✅ 95 open source repositories

### Q1 2026
- 🔄 MirrorGate public beta
- 🔄 LingOS Pro launch
- 🔄 Enterprise pilot program
- 🔄 Mobile apps (iOS, Android)

### Q2 2026
- 📋 Self-hosting packages
- 📋 Team collaboration features
- 📋 API v2 with webhooks
- 📋 Plugin marketplace

### Q3 2026
- 📋 On-premise enterprise deployment
- 📋 Government certification
- 📋 Healthcare partnership program
- 📋 Multi-language support

### Future
- 🔮 Federated MirrorDNA network
- 🔮 Hardware integration (local inference)
- 🔮 Research partnerships
- 🔮 Open governance model

---

## Navigation Structure

```
┌─────────────────────────────────────────────────────────────┐
│ ⟡ Active Mirror    Products ▼  Use Cases ▼  Docs  Pricing  │
└─────────────────────────────────────────────────────────────┘

Products dropdown:
├── Overview
├── ─────────────
├── MirrorGate      → Inference control
├── MirrorBrain     → Cognitive engine
├── LingOS          → Conversational AI
├── MirrorRecall    → Session memory
├── ─────────────
├── GlyphTrail      → Visualization
├── TrustByDesign   → Compliance
├── AgentDNA        → Personas
└── Vault Manager   → Storage

Use Cases dropdown:
├── Overview
├── ─────────────
├── Individuals     → Personal reflection
├── Teams           → Collaboration
├── Enterprise      → At scale
├── ─────────────
├── Government      → Public sector
├── Healthcare      → Wellness
└── Education       → Learning
```

---

## Implementation Priority

### Phase 1: Foundation (Week 1)
1. Create navigation component with dropdowns
2. Create /products index page with grid of all products
3. Create /use-cases index page with audience cards
4. Update Home page to link to new sections

### Phase 2: Product Pages (Week 2)
5. MirrorGate page
6. MirrorBrain page
7. LingOS page
8. MirrorRecall page
9. Other product pages

### Phase 3: Use Case Pages (Week 3)
10. Individuals page
11. Enterprise page
12. Teams page
13. Government, Healthcare, Education pages

### Phase 4: Documentation (Week 4)
14. /docs index (getting started)
15. Architecture overview
16. Self-hosting guide
17. API reference (or link to external)

### Phase 5: Company (Week 4)
18. /about page with story
19. /roadmap public roadmap
20. /contact enterprise form

---

## Design Principles

1. **Consistency** — All pages share the same visual language
2. **Progressive disclosure** — Overview → Details → Technical
3. **Clear CTAs** — Every page has a next step
4. **Mobile-first** — Works on all devices
5. **Accessibility** — WCAG 2.1 AA compliant
6. **Performance** — Fast load, minimal JS for static pages

---

## Content Tone

- **Confident but not arrogant** — We built something real
- **Technical but accessible** — Explain without jargon
- **Honest about limitations** — Not therapy, experimental
- **Vision-forward** — Where this is going

---

*Generated: 2026-02-03*
*For: Paul Desai / Active Mirror*
