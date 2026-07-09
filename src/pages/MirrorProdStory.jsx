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
        title: 'Proof and FAQ',
        promise: 'Answer the real objections before the viewer asks.',
        hook: 'Three buyer questions, one clean preorder answer.',
        risk: 'Review',
        bestFor: 'Product cut, FAQ reel, sales reply',
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
    ['6', 'vertical episodes'],
    ['6', 'WhatsApp cuts'],
    ['2', 'language passes'],
    ['1', 'review receipt'],
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

function mediaUrl(kind, fileName) {
    return mediaAssets[kind]?.[fileName] || '';
}

function makeReceipt(brief, selectedAngle) {
    return [
        ['Campaign', 'Monsoon Cafe Box'],
        ['Angle', selectedAngle.title],
        ['Claim sources', brief.assets],
        ['Forbidden claims', brief.guardrails],
        ['Approval state', 'Draft only until owner approval'],
        ['Distribution', 'Reels, Shorts, WhatsApp status, WhatsApp reply cut'],
    ];
}

function makeCampaignBrief(brief, selectedAngle, performanceRead) {
    return [
        'MirrorProd Story Sprint',
        'Campaign: Monsoon Cafe Box',
        `Goal: ${brief.goal}`,
        `Audience: ${brief.audience}`,
        `Language: ${brief.language}`,
        `Offer: ${brief.offer}`,
        `Selected angle: ${selectedAngle.title}`,
        `Hook: ${selectedAngle.hook}`,
        `Source assets: ${brief.assets}`,
        `Guardrails: ${brief.guardrails}`,
        `Next episode read: ${performanceRead}`,
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
    const [angleId, setAngleId] = useState('drama');
    const [performance, setPerformance] = useState(performanceDefaults);
    const [copyState, setCopyState] = useState('idle');

    const selectedAngle = storyAngles.find((angle) => angle.id === angleId) || storyAngles[0];
    const receipt = useMemo(() => makeReceipt(brief, selectedAngle), [brief, selectedAngle]);
    const performanceRead = useMemo(() => getPerformanceRead(performance), [performance]);
    const campaignBrief = useMemo(
        () => makeCampaignBrief(brief, selectedAngle, performanceRead),
        [brief, selectedAngle, performanceRead],
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
                    <h1>Turn one offer into a short-video series.</h1>
                    <p>
                        India-first business microdramas: lock the brief, choose the angle, build six scenes, review
                        claims, and learn the next cut.
                    </p>
                    <div className="mps-hero-actions">
                        <a href="#brief-lock" className="mps-primary">
                            <ClipboardCheck size={18} aria-hidden="true" />
                            Start the demo brief
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

            <section className="mps-section mps-brief-grid" id="brief-lock">
                <div className="mps-section-head">
                    <p>Brief lock</p>
                    <h2>The video starts from business truth, not a blank prompt.</h2>
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
                        <li><FileCheck2 size={17} aria-hidden="true" /> Six episode scripts and scene notes</li>
                        <li><MessageCircle size={17} aria-hidden="true" /> WhatsApp share copy and reply starter</li>
                        <li><Languages size={17} aria-hidden="true" /> {brief.language}</li>
                        <li><ShieldCheck size={17} aria-hidden="true" /> Claims held for owner review</li>
                    </ul>
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
                    {campaignBrief.split('\n').slice(0, 9).map((line) => (
                        <p key={line}>{line}</p>
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
                    This screen proves the product loop: brief, angle, episode board, approval state, pack, and learning.
                    It does not generate new video, upload source files, or publish a campaign.
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
