export const trustChips = [
    'Built in India',
    'Governed execution',
    'Evidence chains',
    'Privacy-first',
    'Human override',
];

export const platformVerbs = [
    {
        key: 'verify',
        title: 'Verify',
        body: 'Catch risky links, UPI IDs, QR codes, suspicious messages, and trust gaps before action.',
        href: '/chetana',
        cta: 'See verification',
        accent: 'blue',
        visualTitle: 'Evidence trace',
        visualLines: ['Input checked', 'Signals gathered', 'Why flagged', 'Next step'],
    },
    {
        key: 'remember',
        title: 'Remember',
        body: 'Carry identity, continuity, and prior context so systems stay cumulative instead of disposable.',
        href: '/platform',
        cta: 'See continuity',
        accent: 'green',
        visualTitle: 'Recall surface',
        visualLines: ['Signature', 'Session state', 'Continuity', 'Open loops'],
    },
    {
        key: 'govern',
        title: 'Govern',
        body: 'Put rules, approvals, and visible controls in front of execution instead of after the damage.',
        href: '/platform',
        cta: 'See control plane',
        accent: 'amber',
        visualTitle: 'Rule firing',
        visualLines: ['Policy matched', 'Decision logged', 'Human path', 'Audit-ready'],
    },
];

export const platformLayers = [
    {
        title: 'Public products',
        body: 'Chetana and public-facing utilities that make the stack legible to real users.',
        items: ['Chetana', 'Browser Guard', 'Guided entry'],
    },
    {
        title: 'Control plane',
        body: 'Execution controls, policy surfaces, and decision rails that define what can happen next.',
        items: ['MirrorGate', 'MirrorBalance', 'Policy routes'],
    },
    {
        title: 'Memory and trace',
        body: 'Persistent identity, recall, and trace surfaces that keep systems stateful and inspectable.',
        items: ['MirrorRecall', 'GlyphTrail', 'Session continuity'],
    },
    {
        title: 'Trust and compliance',
        body: 'Trust posture, verification paths, and documentation needed for serious operators.',
        items: ['TrustByDesign', 'Vault', 'Docs and research'],
    },
];

export const proofCards = [
    {
        title: 'Chetana verdict',
        body: 'A verdict should explain why something looks risky, not just color it red.',
        accent: 'blue',
        lines: ['Risk: high', 'Signals: URL + payment mismatch', 'Action: verify before paying'],
    },
    {
        title: 'Evidence chain',
        body: 'Important claims need a trace from input to signal to conclusion.',
        accent: 'green',
        lines: ['Input recorded', 'Signals linked', 'Decision captured'],
    },
    {
        title: 'Memory conflict',
        body: 'Long-lived systems need a way to notice and resolve contradictions in state.',
        accent: 'amber',
        lines: ['Prior state', 'New claim', 'Conflict surfaced'],
    },
    {
        title: 'Governance event',
        body: 'Rules should fire before action, with visible consequences and a review path.',
        accent: 'red',
        lines: ['Policy matched', 'Action blocked', 'Review path ready'],
    },
];

export const useCases = [
    {
        title: 'Individuals',
        summary: 'People who need fast trust checks, clearer signals, and systems that explain themselves.',
        href: '/chetana',
    },
    {
        title: 'Merchants and Teams',
        summary: 'Operators who need safer verification flows, lower fraud friction, and clearer proof for support.',
        href: '/chetana#for-merchants',
    },
    {
        title: 'Regulated and Public Sector',
        summary: 'Teams that need governance, auditability, documentation, and human override paths.',
        href: '/trust',
    },
];

export const docsTrustTiles = [
    { title: 'Trust', body: 'What Active Mirror does, does not guarantee, and how review works.', href: '/trust' },
    { title: 'Docs', body: 'Architecture, API, and system documentation.', href: '/docs' },
    { title: 'Self-hosting', body: 'Run it on your own infrastructure when control requirements are tighter.', href: '/docs/self-hosting' },
    { title: 'API', body: 'Read the public and platform-facing interface surface.', href: '/docs/api' },
    { title: 'Pricing', body: 'Simple public, merchant, platform, and enterprise tiers.', href: '/pricing' },
];

export const chetanaChecks = [
    'Links and suspicious URLs',
    'UPI IDs and payment trust checks',
    'QR-code-related fraud patterns',
    'Phone numbers and scam signals',
    'Messages and scam pattern analysis',
    'Deepfake and media checks',
];

export const chetanaExamples = [
    {
        title: 'Payment screenshot',
        verdict: 'Needs verification',
        why: 'Message pressure and payment proof do not align cleanly.',
    },
    {
        title: 'QR / UPI request',
        verdict: 'High risk',
        why: 'Fast-pay request with fraud-like collection pattern.',
    },
    {
        title: 'Suspicious link',
        verdict: 'Flagged',
        why: 'Destination and wording look inconsistent with trusted behavior.',
    },
];

export const merchantPoints = [
    'Use Chetana as a first-pass trust check before support or payout workflows move forward.',
    'Reduce fake proof friction by pushing risky cases into review instead of guessing.',
    'Keep customer support, payment trust, and recovery guidance in one clearer workflow.',
];

export const pricingTiers = [
    {
        title: 'Public utility',
        price: 'Free',
        body: 'Public-facing access where immediate trust checking matters most.',
        points: ['Chetana public surface', 'Basic trust checks', 'Fast public entry'],
    },
    {
        title: 'Merchant',
        price: 'Contact',
        body: 'For businesses that need safer verification and support flows.',
        points: ['Merchant-oriented trust flows', 'Review paths', 'Support-oriented deployment'],
    },
    {
        title: 'Platform / team',
        price: 'Contact',
        body: 'For teams that need governance, continuity, and internal control surfaces.',
        points: ['Verify / remember / govern model', 'Docs + architecture access', 'Deployment discussion'],
    },
    {
        title: 'Enterprise / regulated',
        price: 'Contact',
        body: 'For regulated and public-sector environments that need stronger control and review.',
        points: ['Governance and auditability', 'Self-hosting paths', 'Human review expectations'],
    },
];

export const moduleGroups = [
    {
        title: 'Verify',
        body: 'Public trust checking and evidence-facing product routes.',
        items: ['Chetana', 'Browser Guard', 'API checks'],
    },
    {
        title: 'Remember',
        body: 'Continuity and state surfaces that stop the system from starting from zero every time.',
        items: ['MirrorRecall', 'GlyphTrail', 'Identity continuity'],
    },
    {
        title: 'Govern',
        body: 'Rules, approvals, and control planes that shape execution before it happens.',
        items: ['MirrorGate', 'MirrorBalance', 'TrustByDesign'],
    },
];
