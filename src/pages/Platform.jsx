import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Boxes, CheckCircle2, Database, Layers3, ShieldCheck } from 'lucide-react';
import SiteShell, { SectionShell } from '../components/marketing/SiteShell';
import { moduleGroups, platformLayers, platformVerbs } from '../lib/flagshipContent';

const flowSteps = [
    {
        title: 'Public or operator input',
        body: 'A user starts with Chetana, a public route, or an internal surface that needs a decision.',
    },
    {
        title: 'Verification and policy',
        body: 'Signals and rules shape the next action before the system asks for trust.',
    },
    {
        title: 'Continuity and trace',
        body: 'State, identity, and prior context stay available instead of resetting every session.',
    },
    {
        title: 'Review and override',
        body: 'Trust comes with a review path, not a black-box verdict.',
    },
];

export default function Platform() {
    return (
        <SiteShell>
            <SectionShell
                eyebrow="Platform"
                title="The system below Chetana is built around verify, remember, and govern."
                description="Active Mirror is not one isolated utility. It is a platform for trust-heavy AI surfaces that need evidence, continuity, and visible control."
                className="pt-12"
            >
                <div className="grid gap-5 lg:grid-cols-3">
                    {platformVerbs.map((verb, index) => (
                        <div key={verb.key} className={`rounded-[32px] border p-6 shadow-[0_24px_80px_rgba(13,21,34,0.04)] ${index === 0 ? 'border-[#d7e4ff] bg-[#f7fbff]' : index === 1 ? 'border-[#d9eee6] bg-[#f7fbf9]' : 'border-[#f1e2c8] bg-[#fdf9f1]'}`}>
                            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f6787]">{verb.title}</div>
                            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#152033]">{verb.title}</h2>
                            <p className="mt-3 text-sm leading-7 text-[#5b6776]">{verb.body}</p>
                        </div>
                    ))}
                </div>
            </SectionShell>

            <SectionShell
                eyebrow="Module map"
                title="A cleaner way to understand the stack."
                description="Instead of a flat catalog, the platform is easier to read when modules are grouped by what they do."
            >
                <div className="grid gap-5 lg:grid-cols-3">
                    {moduleGroups.map((group, index) => {
                        const Icon = index === 0 ? CheckCircle2 : index === 1 ? Database : ShieldCheck;
                        return (
                            <div key={group.title} className="rounded-[32px] border border-[#e7dfd4] bg-white p-6 shadow-[0_24px_80px_rgba(13,21,34,0.04)]">
                                <div className="inline-flex rounded-2xl border border-[#d8dfe7] bg-[#f7fbff] p-3">
                                    <Icon size={20} className="text-[#2855d9]" />
                                </div>
                                <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#152033]">{group.title}</h2>
                                <p className="mt-3 text-sm leading-7 text-[#5b6776]">{group.body}</p>
                                <div className="mt-5 space-y-3">
                                    {group.items.map((item) => (
                                        <div key={item} className="rounded-2xl border border-[#ebeff4] bg-[#fbfcfd] px-4 py-3 text-sm text-[#364255]">
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </SectionShell>

            <SectionShell
                eyebrow="Architecture layers"
                title="Chetana is one product in a deeper system."
                description="Chetana makes the value obvious. The deeper layers are what keep the system inspectable and governable."
            >
                <div className="rounded-[32px] border border-[#e7dfd4] bg-white p-5 shadow-[0_24px_80px_rgba(13,21,34,0.04)]">
                    <div className="grid gap-4">
                        {platformLayers.map((layer, index) => (
                            <div
                                key={layer.title}
                                className="grid gap-4 rounded-[24px] border px-5 py-5 sm:grid-cols-[minmax(0,0.82fr)_minmax(0,1fr)]"
                                style={{ borderColor: ['#d7e4ff', '#d9eee6', '#f1e2c8', '#f2d8d4'][index], backgroundColor: ['#f7fbff', '#f7fbf9', '#fdf9f1', '#fff8f7'][index] }}
                            >
                                <div>
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f6787]">Layer {index + 1}</div>
                                    <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#152033]">{layer.title}</h3>
                                    <p className="mt-3 text-sm leading-7 text-[#5b6776]">{layer.body}</p>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    {layer.items.map((item) => (
                                        <div key={item} className="rounded-[20px] border border-white/70 bg-white/90 px-4 py-4 text-sm font-medium text-[#263247]">
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </SectionShell>

            <SectionShell
                eyebrow="Evidence and control flow"
                title="The point is not to sound governed. The point is to show where control actually lives."
                description="These flows explain how a public product can still sit on top of stronger memory and control layers."
            >
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
                    <div className="rounded-[32px] border border-[#d8dfe7] bg-white p-6 shadow-[0_24px_80px_rgba(13,21,34,0.04)]">
                        <div className="space-y-4">
                            {flowSteps.map((step, index) => (
                                <div key={step.title} className="flex gap-4 rounded-[22px] border border-[#ebeff4] bg-[#fbfcfd] p-4">
                                    <div className="grid h-8 w-8 place-items-center rounded-full bg-[#132033] text-sm font-semibold text-white">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-[#152033]">{step.title}</div>
                                        <div className="mt-1 text-sm leading-7 text-[#5b6776]">{step.body}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-5">
                        <div className="overflow-hidden rounded-[32px] border border-[#d8dfe7] bg-white shadow-[0_24px_80px_rgba(13,21,34,0.04)]">
                            <img src="/images/home/operator-browser-dashboard.png" alt="Active Mirror browser operator surface" className="h-full w-full object-cover" />
                        </div>
                        <div className="overflow-hidden rounded-[32px] border border-[#d8dfe7] bg-white shadow-[0_24px_80px_rgba(13,21,34,0.04)]">
                            <img src="/images/home/operator-floating-dashboard.png" alt="MirrorBrain mobile style control surface" className="h-full w-full object-cover" />
                        </div>
                    </div>
                </div>
            </SectionShell>

            <SectionShell
                eyebrow="Deployment"
                title="Different trust requirements imply different operating modes."
                description="The public web product is one mode. Team control surfaces and self-hosted environments are different modes with different constraints."
            >
                <div className="grid gap-5 lg:grid-cols-3">
                    {[
                        {
                            title: 'Public utility',
                            body: 'Fastest way to experience public trust checking and the product behavior directly.',
                            cta: { label: 'Try Chetana', href: 'https://chetana.activemirror.ai', external: true },
                        },
                        {
                            title: 'Team / platform',
                            body: 'For operators who need continuity, governance, and a clearer internal control surface.',
                            cta: { label: 'Book a walkthrough', href: '/about/contact' },
                        },
                        {
                            title: 'Self-hosted / regulated',
                            body: 'For environments that need tighter control, review posture, or infrastructure sovereignty.',
                            cta: { label: 'See self-hosting', href: '/docs/self-hosting' },
                        },
                    ].map((item) => (
                        <div key={item.title} className="rounded-[32px] border border-[#e7dfd4] bg-white p-6 shadow-[0_24px_80px_rgba(13,21,34,0.04)]">
                            <div className="inline-flex rounded-2xl border border-[#d8dfe7] bg-[#f7fbff] p-3">
                                <Layers3 size={20} className="text-[#2855d9]" />
                            </div>
                            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#152033]">{item.title}</h2>
                            <p className="mt-3 text-sm leading-7 text-[#5b6776]">{item.body}</p>
                            {'external' in item.cta && item.cta.external ? (
                                <a href={item.cta.href} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#152033] transition-colors hover:text-[#2855d9]">
                                    {item.cta.label}
                                    <ArrowRight size={15} />
                                </a>
                            ) : (
                                <Link to={item.cta.href} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#152033] transition-colors hover:text-[#2855d9]">
                                    {item.cta.label}
                                    <ArrowRight size={15} />
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            </SectionShell>
        </SiteShell>
    );
}
