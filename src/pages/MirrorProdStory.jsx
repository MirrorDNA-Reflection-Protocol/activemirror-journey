import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    BadgeCheck,
    BarChart3,
    Check,
    ClipboardCheck,
    Copy,
    FileCheck2,
    Languages,
    ListChecks,
    Mail,
    MessageCircle,
    PlaySquare,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import cafeScamPoster from '../assets/mirrorprod-story/posters/cafe-scam-alert.jpg';
import festivalOfferPoster from '../assets/mirrorprod-story/posters/mprod-festival-offer.jpg';
import flashSalePoster from '../assets/mirrorprod-story/posters/mprod-flash-sale.jpg';
import productDemoPoster from '../assets/mirrorprod-story/posters/mprod-product-demo.jpg';
import retailLaunchPoster from '../assets/mirrorprod-story/posters/mprod-retail-launch.jpg';
import serviceIntroPoster from '../assets/mirrorprod-story/posters/mprod-service-intro.jpg';
import cafeScamVideo from '../assets/mirrorprod-story/videos/cafe-scam-alert.mp4';
import festivalOfferVideo from '../assets/mirrorprod-story/videos/mprod-festival-offer.mp4';
import flashSaleVideo from '../assets/mirrorprod-story/videos/mprod-flash-sale.mp4';
import productDemoVideo from '../assets/mirrorprod-story/videos/mprod-product-demo.mp4';
import retailLaunchVideo from '../assets/mirrorprod-story/videos/mprod-retail-launch.mp4';
import serviceIntroVideo from '../assets/mirrorprod-story/videos/mprod-service-intro.mp4';
import './MirrorProdStory.css';

const mediaAssets = {
    posters: {
        'cafe-scam-alert.jpg': cafeScamPoster,
        'mprod-festival-offer.jpg': festivalOfferPoster,
        'mprod-flash-sale.jpg': flashSalePoster,
        'mprod-product-demo.jpg': productDemoPoster,
        'mprod-retail-launch.jpg': retailLaunchPoster,
        'mprod-service-intro.jpg': serviceIntroPoster,
    },
    videos: {
        'cafe-scam-alert.mp4': cafeScamVideo,
        'mprod-festival-offer.mp4': festivalOfferVideo,
        'mprod-flash-sale.mp4': flashSaleVideo,
        'mprod-product-demo.mp4': productDemoVideo,
        'mprod-retail-launch.mp4': retailLaunchVideo,
        'mprod-service-intro.mp4': serviceIntroVideo,
    },
};

const storyAngles = [
    {
        id: 'drama',
        title: 'Customer drama',
        promise: 'Make the product feel like a weekend moment, not an ad.',
        hook: 'Weekend plans changed when this cafe box reached the table.',
        risk: 'Low',
        bestFor: 'Reels, Shorts, WhatsApp status',
    },
    {
        id: 'founder',
        title: 'Founder constraint',
        promise: 'Use the owner story to make urgency feel earned.',
        hook: 'The owner almost cancelled the monsoon cafe menu.',
        risk: 'Medium',
        bestFor: 'Founder cut, story post, community update',
    },
    {
        id: 'proof',
        title: 'FAQ and objection',
        promise: 'Answer the real objections before the viewer asks.',
        hook: 'Three buyer questions, one clean preorder answer.',
        risk: 'Review',
        bestFor: 'Product cut, FAQ reel, sales reply',
    },
];

const offerPacks = [
    {
        id: 'preview',
        title: 'Guided Quote + Preview',
        band: 'Entry',
        timeline: '1-2 working days',
        promise: 'One campaign idea becomes a story-first concept, production note, and quote direction.',
        includes: ['story concept', 'shot list', 'quote direction', 'approval checklist'],
        next: 'Use this when the buyer is interested but not ready to hand over assets.',
    },
    {
        id: 'flagship',
        title: '24-30s Flagship Vertical',
        band: 'Core',
        timeline: '5-7 working days after source review',
        promise: 'A complete vertical commercial built around one local-business offer.',
        includes: ['hero reel', 'caption set', 'claim review', 'delivery handoff'],
        next: 'Use this when the business has source photos, owner approval, and one clear CTA.',
    },
    {
        id: 'variants',
        title: 'Variant Pack',
        band: 'Expansion',
        timeline: '2-4 working days after flagship lock',
        promise: 'Multiple hooks, endings, and local-language cuts for the same approved offer.',
        includes: ['3 hooks', '2 endings', 'language pass', 'performance read'],
        next: 'Use this after the first cut proves which promise and CTA viewers react to.',
    },
    {
        id: 'series',
        title: 'Story Series',
        band: 'Continuity',
        timeline: 'monthly sprint rhythm',
        promise: 'A repeatable campaign world instead of one-off files.',
        includes: ['episode map', 'offer calendar', 'asset reuse plan', 'monthly learning note'],
        next: 'Use this for brands that run offers, launches, or local trust campaigns on a repeat schedule.',
    },
];

const verticalPlays = [
    {
        id: 'food',
        title: 'Cafe and food',
        template: 'food promo reel',
        buyerMoment: 'weekend plan, delivery decision, group order',
        assetAsk: '3 food shots, offer, locality, pickup or delivery rule',
    },
    {
        id: 'beauty',
        title: 'Salon and wellness',
        template: 'salon transformation reel',
        buyerMoment: 'before-after curiosity, festive offer, appointment push',
        assetAsk: 'service photos, offer, staff approval, claim limits',
    },
    {
        id: 'coaching',
        title: 'Coaching and tuition',
        template: 'admission announcement',
        buyerMoment: 'parent concern, result cue, deadline reminder',
        assetAsk: 'classroom clips, result cue, admissions CTA, disclaimer copy',
    },
    {
        id: 'retail',
        title: 'Retail and D2C',
        template: 'flash sale countdown',
        buyerMoment: 'new arrival, price check, store visit',
        assetAsk: 'product shots, price rule, offer window, WhatsApp CTA',
    },
    {
        id: 'trust',
        title: 'Trust awareness',
        template: 'public safety microdrama',
        buyerMoment: 'risk hook, check turn, shareable warning',
        assetAsk: 'approved claim sources, forbidden claims, review URL',
    },
];

const trustModes = [
    {
        id: 'brief',
        title: 'Brief export',
        state: 'Advisory',
        detail: 'The buyer gets a signed brief, prompt pack, watermark guidance, and approval notes.',
    },
    {
        id: 'finalize',
        title: 'Certified finalization',
        state: 'Enforceable after return',
        detail: 'Rendered media comes back for watermarking, manifest, verification receipt, and final hash.',
    },
    {
        id: 'dfy',
        title: 'Done-for-you production',
        state: 'Controlled workflow',
        detail: 'MirrorProd owns the workflow from approved brief through delivery handoff.',
    },
];

const episodeBase = [
    {
        id: 1,
        hook: 'Weekend plans changed when the cafe offer hit the table.',
        scene: 'A customer sees the weekend box while friends are already ordering.',
        asset: 'cafe-scam-alert.mp4',
        poster: 'cafe-scam-alert.jpg',
        cta: 'Preorder for Saturday.',
        status: 'Ready',
    },
    {
        id: 2,
        hook: 'The first reply comes from a quiet table.',
        scene: 'A phone-led scene turns the cafe offer into a WhatsApp decision.',
        asset: 'mprod-flash-sale.mp4',
        poster: 'mprod-flash-sale.jpg',
        cta: 'Ask for the menu.',
        status: 'Needs voice',
    },
    {
        id: 3,
        hook: 'Two friends make the plan feel real.',
        scene: 'The offer is framed as a local weekend plan, not a discount blast.',
        asset: 'mprod-festival-offer.mp4',
        poster: 'mprod-festival-offer.jpg',
        cta: 'Reserve one box.',
        status: 'Ready',
    },
    {
        id: 4,
        hook: 'The customer asks the real question.',
        scene: 'Pickup, freshness, and prep details are shown without overclaiming.',
        asset: 'mprod-product-demo.mp4',
        poster: 'mprod-product-demo.jpg',
        cta: 'Message for delivery area.',
        status: 'Review',
    },
    {
        id: 5,
        hook: 'Only safe claims. No magic words.',
        scene: 'Price, timing, and availability stay reviewable before posting.',
        asset: 'mprod-retail-launch.mp4',
        poster: 'mprod-retail-launch.jpg',
        cta: 'See what is inside.',
        status: 'Claim check',
    },
    {
        id: 6,
        hook: 'Order before Friday.',
        scene: 'Owner voiceover turns the deadline into a direct WhatsApp action.',
        asset: 'mprod-service-intro.mp4',
        poster: 'mprod-service-intro.jpg',
        cta: 'Send preorder now.',
        status: 'Ready',
    },
];

const outputs = [
    ['4', 'offer tracks'],
    ['6', 'proof reels'],
    ['12', 'language lanes'],
    ['1', 'approval trail'],
];

const defaultBrief = {
    goal: 'Drive weekend preorders for a monsoon cafe box',
    audience: 'Families and young professionals nearby',
    assets: 'Product photos, cafe exterior clip, owner voice note, menu PDF',
    language: 'Hinglish first, Hindi cut',
    offer: 'Preorder by Friday evening for Saturday pickup or delivery',
    guardrails: 'No exaggerated health claims. No false scarcity. Price only if confirmed.',
};

const performanceDefaults = {
    hold: 42,
    replies: 18,
    saves: 11,
};

const sprintControls = [
    {
        label: 'Generate new video',
        state: 'Off',
        detail: 'This demo only reviews the story sprint.',
    },
    {
        label: 'Upload source assets',
        state: 'Off',
        detail: 'Source clips stay with the owner until scoped intake.',
    },
    {
        label: 'Use owner likeness',
        state: 'Consent required',
        detail: 'No face, voice, or public photo reuse without explicit approval.',
    },
    {
        label: 'Post to channels',
        state: 'Off',
        detail: 'Nothing posts from this screen.',
    },
    {
        label: 'WhatsApp distribution',
        state: 'Draft only',
        detail: 'Share copy and reply starter are reviewable handoff items.',
    },
    {
        label: 'Claim review',
        state: 'Required',
        detail: 'Price, scarcity, health, and performance claims need owner signoff.',
    },
];

const vaultSignals = [
    ['54', 'local demo cuts mapped'],
    ['18', 'Mini-generated cuts found'],
    ['6', 'buyer verticals templated'],
    ['3', 'trust modes ready to quote'],
];

function mediaUrl(kind, fileName) {
    return mediaAssets[kind]?.[fileName] || '';
}

function makeQuotePlan(selectedPack, selectedVertical, selectedTrustMode) {
    return {
        package: selectedPack.title,
        band: selectedPack.band,
        vertical: selectedVertical.title,
        template: selectedVertical.template,
        timeline: selectedPack.timeline,
        trust_mode: selectedTrustMode.title,
        first_deliverable: selectedPack.includes[0],
    };
}

function makeReceipt(brief, selectedAngle, selectedPack, selectedVertical, selectedTrustMode) {
    return [
        ['Campaign', 'Monsoon Cafe Box'],
        ['Offer track', selectedPack.title],
        ['Vertical', selectedVertical.title],
        ['Angle', selectedAngle.title],
        ['Trust mode', selectedTrustMode.title],
        ['Claim sources', brief.assets],
        ['Forbidden claims', brief.guardrails],
        ['Approval state', 'Draft only until owner approval'],
        ['Distribution', 'Reels, Shorts, WhatsApp status, WhatsApp reply cut'],
    ];
}

function makeSprintObjects(brief, selectedAngle, selectedPack, selectedVertical, selectedTrustMode, performanceRead) {
    return [
        ['offer_package', selectedPack.title],
        ['vertical_template', selectedVertical.template],
        ['business_offer', brief.offer],
        ['target_audience', brief.audience],
        ['source_assets', brief.assets],
        ['story_angle', selectedAngle.title],
        ['trust_mode', selectedTrustMode.title],
        ['claim_risks', brief.guardrails],
        ['consent_state', 'Owner approval required before likeness or source reuse'],
        ['output_formats', '6 vertical episodes, 6 WhatsApp cuts, 2 language passes'],
        ['next_signal', performanceRead],
    ];
}

function makeSprintReceipt(brief, selectedAngle, selectedPack, selectedVertical, selectedTrustMode, quotePlan, performanceRead) {
    return {
        schema: 'mirrorprod.sprint_receipt.v1',
        campaign: 'Monsoon Cafe Box',
        offer_package: selectedPack.title,
        quote_plan: quotePlan,
        business_offer: brief.offer,
        target_audience: brief.audience,
        vertical: selectedVertical.title,
        template: selectedVertical.template,
        story_angle: selectedAngle.title,
        trust_mode: selectedTrustMode.title,
        consent_state: 'owner_approval_required',
        capabilities: {
            generate_video: 'off',
            upload_source_assets: 'off',
            use_owner_likeness: 'consent_required',
            post_to_social: 'off',
            whatsapp_distribution: 'draft_only',
            claim_review: 'required',
        },
        next_signal: performanceRead,
    };
}

function makeCampaignBrief(brief, selectedAngle, selectedPack, selectedVertical, selectedTrustMode, quotePlan, performanceRead) {
    return [
        'MirrorProd Story Sprint',
        'Receipt schema: mirrorprod.sprint_receipt.v1',
        'Campaign: Monsoon Cafe Box',
        `Offer track: ${selectedPack.title} (${selectedPack.band})`,
        `Vertical: ${selectedVertical.title}`,
        `Template: ${selectedVertical.template}`,
        `Timeline: ${quotePlan.timeline}`,
        `Trust mode: ${selectedTrustMode.title} - ${selectedTrustMode.state}`,
        `Goal: ${brief.goal}`,
        `Audience: ${brief.audience}`,
        `Language: ${brief.language}`,
        `Offer: ${brief.offer}`,
        `Selected angle: ${selectedAngle.title}`,
        `Hook: ${selectedAngle.hook}`,
        `Source assets: ${brief.assets}`,
        `Guardrails: ${brief.guardrails}`,
        `Next episode read: ${performanceRead}`,
        'Capabilities: generate video off; upload source assets off; post to social off; owner likeness requires consent.',
        'Approval state: Draft only until owner approval. Nothing has been posted.',
    ].join('\n');
}

function makeMailto(briefText) {
    const subject = encodeURIComponent('MirrorProd Story Sprint');
    const body = encodeURIComponent(briefText);
    return `mailto:paul@activemirror.ai?subject=${subject}&body=${body}`;
}

async function copyText(value = '') {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return true;
    }

    const textArea = document.createElement('textarea');
    textArea.value = value;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(textArea);
    return copied;
}

function getPerformanceRead(values) {
    const hold = Number(values.hold) || 0;
    const replies = Number(values.replies) || 0;
    const saves = Number(values.saves) || 0;

    if (hold >= 45 && replies >= 15) {
        return 'Scale the customer-drama hook and make episode 2 answer price and pickup.';
    }

    if (saves > replies) {
        return 'The idea is interesting, but the CTA is weak. Make the next cut ask for one reply.';
    }

    return 'Retest the first three seconds with a stronger local character and clearer product reveal.';
}

export default function MirrorProdStory() {
    const [brief, setBrief] = useState(defaultBrief);
    const [packId, setPackId] = useState('preview');
    const [verticalId, setVerticalId] = useState('food');
    const [trustModeId, setTrustModeId] = useState('brief');
    const [angleId, setAngleId] = useState('drama');
    const [performance, setPerformance] = useState(performanceDefaults);
    const [copyState, setCopyState] = useState('idle');

    const selectedPack = offerPacks.find((pack) => pack.id === packId) || offerPacks[0];
    const selectedVertical = verticalPlays.find((vertical) => vertical.id === verticalId) || verticalPlays[0];
    const selectedTrustMode = trustModes.find((mode) => mode.id === trustModeId) || trustModes[0];
    const selectedAngle = storyAngles.find((angle) => angle.id === angleId) || storyAngles[0];
    const quotePlan = useMemo(
        () => makeQuotePlan(selectedPack, selectedVertical, selectedTrustMode),
        [selectedPack, selectedVertical, selectedTrustMode],
    );
    const receipt = useMemo(
        () => makeReceipt(brief, selectedAngle, selectedPack, selectedVertical, selectedTrustMode),
        [brief, selectedAngle, selectedPack, selectedVertical, selectedTrustMode],
    );
    const performanceRead = useMemo(() => getPerformanceRead(performance), [performance]);
    const sprintObjects = useMemo(
        () => makeSprintObjects(brief, selectedAngle, selectedPack, selectedVertical, selectedTrustMode, performanceRead),
        [brief, selectedAngle, selectedPack, selectedVertical, selectedTrustMode, performanceRead],
    );
    const sprintReceipt = useMemo(
        () => makeSprintReceipt(brief, selectedAngle, selectedPack, selectedVertical, selectedTrustMode, quotePlan, performanceRead),
        [brief, selectedAngle, selectedPack, selectedVertical, selectedTrustMode, quotePlan, performanceRead],
    );
    const campaignBrief = useMemo(
        () => makeCampaignBrief(brief, selectedAngle, selectedPack, selectedVertical, selectedTrustMode, quotePlan, performanceRead),
        [brief, selectedAngle, selectedPack, selectedVertical, selectedTrustMode, quotePlan, performanceRead],
    );
    const storySprintHref = useMemo(() => makeMailto(campaignBrief), [campaignBrief]);

    function updateBrief(field, value) {
        setBrief((current) => ({ ...current, [field]: value }));
    }

    function updatePerformance(field, value) {
        setPerformance((current) => ({ ...current, [field]: value }));
    }

    async function copyCampaignBrief() {
        try {
            const copied = await copyText(campaignBrief);
            setCopyState(copied ? 'copied' : 'failed');
        } catch {
            setCopyState('failed');
        }
        window.setTimeout(() => setCopyState('idle'), 1800);
    }

    return (
        <main className="mps-page">
            <nav className="mps-nav" aria-label="MirrorProd Story navigation">
                <Link to="/" className="mps-back">
                    <ArrowLeft size={17} aria-hidden="true" />
                    Active Mirror
                </Link>
                <a className="mps-nav-cta" href="#brief-lock">
                    Build the brief
                </a>
            </nav>

            <section className="mps-hero">
                <div className="mps-hero-copy">
                    <p className="mps-kicker">MirrorProd Story OS</p>
                    <h1>Short-drama commercials for Indian businesses.</h1>
                    <p>
                        One offer becomes a guided quote, a reviewable story sprint, proof reels, language cuts, and an
                        approval trail before anything is produced or posted.
                    </p>
                    <div className="mps-hero-actions">
                        <a href="#brief-lock" className="mps-primary">
                            <ClipboardCheck size={18} aria-hidden="true" />
                            Build a quote
                        </a>
                        <a href="#episode-board" className="mps-secondary">
                            <PlaySquare size={18} aria-hidden="true" />
                            View episode board
                        </a>
                    </div>
                </div>

                <div className="mps-hero-panel" aria-label="Monsoon Cafe Box campaign snapshot">
                    <div className="mps-phone-stack">
                        {episodeBase.slice(0, 3).map((episode) => (
                            <video
                                key={episode.id}
                                muted
                                playsInline
                                preload="metadata"
                                poster={mediaUrl('posters', episode.poster)}
                                src={mediaUrl('videos', episode.asset)}
                            />
                        ))}
                    </div>
                    <div className="mps-pack-card">
                        <span>Demo pack</span>
                        <strong>Monsoon Cafe Box</strong>
                        <p>{selectedAngle.hook}</p>
                    </div>
                </div>
            </section>

            <section className="mps-stats" aria-label="Production pack summary">
                {outputs.map(([number, label]) => (
                    <div key={label}>
                        <strong>{number}</strong>
                        <span>{label}</span>
                    </div>
                ))}
            </section>

            <section className="mps-section mps-offer-layout" id="offer-vault">
                <div className="mps-section-head">
                    <p>Offer vault</p>
                    <h2>Sell packages, not generic video generation.</h2>
                </div>
                <div className="mps-offer-grid">
                    {offerPacks.map((pack) => (
                        <button
                            key={pack.id}
                            type="button"
                            className={`mps-offer-card ${pack.id === packId ? 'is-selected' : ''}`}
                            onClick={() => setPackId(pack.id)}
                        >
                            <span>{pack.band}</span>
                            <strong>{pack.title}</strong>
                            <p>{pack.promise}</p>
                            <small>{pack.timeline}</small>
                        </button>
                    ))}
                </div>
                <div className="mps-quote-panel">
                    <div className="mps-pack-top">
                        <BadgeCheck size={30} aria-hidden="true" />
                        <div>
                            <span>Guided quote</span>
                            <h3>{selectedPack.title}</h3>
                        </div>
                    </div>
                    <dl className="mps-quote-list">
                        <div>
                            <dt>Vertical</dt>
                            <dd>{selectedVertical.title}</dd>
                        </div>
                        <div>
                            <dt>Timeline</dt>
                            <dd>{quotePlan.timeline}</dd>
                        </div>
                        <div>
                            <dt>First deliverable</dt>
                            <dd>{quotePlan.first_deliverable}</dd>
                        </div>
                        <div>
                            <dt>Trust mode</dt>
                            <dd>{selectedTrustMode.title}</dd>
                        </div>
                    </dl>
                    <p>{selectedPack.next}</p>
                </div>
            </section>

            <section className="mps-section mps-playbook-layout">
                <div className="mps-section-head">
                    <p>India playbook</p>
                    <h2>Pick the buyer moment before the camera style.</h2>
                </div>
                <div className="mps-vertical-grid">
                    {verticalPlays.map((vertical) => (
                        <button
                            key={vertical.id}
                            type="button"
                            className={`mps-vertical ${vertical.id === verticalId ? 'is-selected' : ''}`}
                            onClick={() => setVerticalId(vertical.id)}
                        >
                            <span>{vertical.template}</span>
                            <strong>{vertical.title}</strong>
                            <p>{vertical.buyerMoment}</p>
                            <small>{vertical.assetAsk}</small>
                        </button>
                    ))}
                </div>
                <div className="mps-vault-strip" aria-label="MirrorProd leverage inventory">
                    {vaultSignals.map(([value, label]) => (
                        <div key={label}>
                            <strong>{value}</strong>
                            <span>{label}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mps-section mps-brief-grid" id="brief-lock">
                <div className="mps-section-head">
                    <p>Guided brief</p>
                    <h2>The quote starts from business truth, not a blank prompt.</h2>
                </div>
                <form className="mps-form" aria-label="MirrorProd Story brief">
                    <label>
                        Business goal
                        <input value={brief.goal} onChange={(event) => updateBrief('goal', event.target.value)} />
                    </label>
                    <label>
                        Audience
                        <input value={brief.audience} onChange={(event) => updateBrief('audience', event.target.value)} />
                    </label>
                    <label>
                        Source assets
                        <textarea value={brief.assets} onChange={(event) => updateBrief('assets', event.target.value)} />
                    </label>
                    <label>
                        Language
                        <select value={brief.language} onChange={(event) => updateBrief('language', event.target.value)}>
                            <option>Hinglish first, Hindi cut</option>
                            <option>English first, Hindi cut</option>
                            <option>Hindi first, English cut</option>
                            <option>Telugu first, English cut</option>
                            <option>Tamil first, English cut</option>
                        </select>
                    </label>
                    <label>
                        Offer
                        <input value={brief.offer} onChange={(event) => updateBrief('offer', event.target.value)} />
                    </label>
                    <label>
                        Guardrails
                        <textarea value={brief.guardrails} onChange={(event) => updateBrief('guardrails', event.target.value)} />
                    </label>
                </form>
            </section>

            <section className="mps-section">
                <div className="mps-section-head">
                    <p>Story angles</p>
                    <h2>Pick the campaign shape before production starts.</h2>
                </div>
                <div className="mps-angle-grid">
                    {storyAngles.map((angle) => (
                        <button
                            key={angle.id}
                            type="button"
                            className={`mps-angle ${angle.id === angleId ? 'is-selected' : ''}`}
                            onClick={() => setAngleId(angle.id)}
                        >
                            <span>{angle.risk}</span>
                            <strong>{angle.title}</strong>
                            <p>{angle.promise}</p>
                            <small>{angle.bestFor}</small>
                        </button>
                    ))}
                </div>
            </section>

            <section className="mps-section" id="episode-board">
                <div className="mps-section-head">
                    <p>Episode board</p>
                    <h2>Six short scenes, each with a job.</h2>
                </div>
                <div className="mps-board">
                    {episodeBase.map((episode) => (
                        <article className="mps-episode" key={episode.id}>
                            <div className="mps-video-frame">
                                <video
                                    controls
                                    preload="metadata"
                                    poster={mediaUrl('posters', episode.poster)}
                                    src={mediaUrl('videos', episode.asset)}
                                />
                            </div>
                            <div className="mps-episode-copy">
                                <span>Episode {episode.id}</span>
                                <h3>{episode.hook}</h3>
                                <p>{episode.scene}</p>
                                <div>
                                    <b>{episode.cta}</b>
                                    <em>{episode.status}</em>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="mps-section mps-review-grid">
                <div className="mps-receipt">
                    <div className="mps-section-head">
                        <p>Review receipt</p>
                        <h2>Ready to discuss. Not approved to post.</h2>
                    </div>
                    <div className="mps-receipt-list">
                        {receipt.map(([label, value]) => (
                            <div key={label}>
                                <span>{label}</span>
                                <strong>{value}</strong>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mps-pack">
                    <div className="mps-pack-top">
                        <BadgeCheck size={30} aria-hidden="true" />
                        <div>
                            <span>Production pack</span>
                            <h3>{selectedAngle.title}</h3>
                        </div>
                    </div>
                    <ul>
                        <li><FileCheck2 size={17} aria-hidden="true" /> {selectedPack.includes.join(', ')}</li>
                        <li><MessageCircle size={17} aria-hidden="true" /> {selectedVertical.buyerMoment}</li>
                        <li><Languages size={17} aria-hidden="true" /> {brief.language}</li>
                        <li><ShieldCheck size={17} aria-hidden="true" /> {selectedTrustMode.detail}</li>
                    </ul>
                </div>
            </section>

            <section className="mps-section mps-trust-grid">
                <div className="mps-section-head">
                    <p>Trust layer</p>
                    <h2>Choose how far MirrorProd owns the proof.</h2>
                </div>
                <div className="mps-trust-list">
                    {trustModes.map((mode) => (
                        <button
                            key={mode.id}
                            type="button"
                            className={`mps-trust ${mode.id === trustModeId ? 'is-selected' : ''}`}
                            onClick={() => setTrustModeId(mode.id)}
                        >
                            <span>{mode.state}</span>
                            <strong>{mode.title}</strong>
                            <p>{mode.detail}</p>
                        </button>
                    ))}
                </div>
            </section>

            <section className="mps-section mps-control-grid" id="sprint-receipt">
                <div className="mps-section-head">
                    <p>Sprint receipt v1</p>
                    <h2>The story sprint has controls before it has automation.</h2>
                </div>
                <div className="mps-object-panel">
                    <span>Native objects</span>
                    <div className="mps-object-list">
                        {sprintObjects.map(([label, value]) => (
                            <div key={label}>
                                <small>{label}</small>
                                <strong>{value}</strong>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mps-switch-panel">
                    <span>Consent and capability switches</span>
                    <div className="mps-switch-list">
                        {sprintControls.map((control) => (
                            <div key={control.label}>
                                <b>{control.label}</b>
                                <strong>{control.state}</strong>
                                <p>{control.detail}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mps-json-panel" aria-label="MirrorProd sprint receipt preview">
                    <span>Handoff object</span>
                    <pre>{JSON.stringify(sprintReceipt, null, 2)}</pre>
                </div>
            </section>

            <section className="mps-section mps-performance">
                <div className="mps-section-head">
                    <p>Performance read</p>
                    <h2>The next episode changes from audience signal.</h2>
                </div>
                <div className="mps-performance-card">
                    <div className="mps-meters">
                        <label>
                            Hold rate
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={performance.hold}
                                onChange={(event) => updatePerformance('hold', event.target.value)}
                            />
                        </label>
                        <label>
                            Replies
                            <input
                                type="number"
                                min="0"
                                value={performance.replies}
                                onChange={(event) => updatePerformance('replies', event.target.value)}
                            />
                        </label>
                        <label>
                            Saves
                            <input
                                type="number"
                                min="0"
                                value={performance.saves}
                                onChange={(event) => updatePerformance('saves', event.target.value)}
                            />
                        </label>
                    </div>
                    <div className="mps-readout">
                        <BarChart3 size={26} aria-hidden="true" />
                        <span>Next episode recommendation</span>
                        <strong>{performanceRead}</strong>
                    </div>
                </div>
            </section>

            <section className="mps-section mps-action-grid" id="story-sprint">
                <div className="mps-section-head">
                    <p>Next action</p>
                    <h2>Turn the reviewed brief into a story sprint.</h2>
                </div>
                <div className="mps-brief-preview" aria-label="Campaign handoff brief">
                    {campaignBrief.split('\n').map((line, index) => (
                        <p key={`${index}-${line}`}>{line}</p>
                    ))}
                </div>
                <div className="mps-action-card">
                    <BadgeCheck size={30} aria-hidden="true" />
                    <h3>Ready for scoped intake.</h3>
                    <p>
                        Bring the business goal, source clips, owner approval rules, and one local-language priority.
                        This page sends no source files and posts nothing.
                    </p>
                    <div className="mps-action-buttons">
                        <button type="button" className="mps-primary" onClick={copyCampaignBrief}>
                            {copyState === 'copied' ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
                            {copyState === 'copied' ? 'Copied brief' : copyState === 'failed' ? 'Copy unavailable' : 'Copy brief'}
                        </button>
                        <a className="mps-secondary" href={storySprintHref}>
                            <Mail size={18} aria-hidden="true" />
                            Start story sprint
                        </a>
                    </div>
                </div>
            </section>

            <section className="mps-close">
                <Sparkles size={32} aria-hidden="true" />
                <h2>Review-first demo. Nothing posts from this page.</h2>
                <p>
                    This screen proves the product loop: offer vault, guided quote, brief, angle, episode board, consent
                    state, pack, proof mode, and learning. It does not generate new video, upload source files, or
                    publish a campaign.
                </p>
                <div className="mps-close-actions">
                    <a href="#brief-lock" className="mps-primary">
                        <ListChecks size={18} aria-hidden="true" />
                        Refine the brief
                    </a>
                    <Link to="/" className="mps-secondary">
                        Back to Active Mirror
                    </Link>
                </div>
            </section>
        </main>
    );
}
