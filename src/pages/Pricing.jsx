import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import SiteShell, { SectionShell } from '../components/marketing/SiteShell';
import { pricingTiers } from '../lib/flagshipContent';

export default function Pricing() {
    return (
        <SiteShell>
            <SectionShell
                eyebrow="Pricing"
                title="Simple public, merchant, platform, and enterprise tiers."
                description="The public utility stays easy to try. Merchant, platform, and regulated deployments need a real conversation because the control requirements change."
                className="pt-12"
            >
                <div className="grid gap-5 xl:grid-cols-4">
                    {pricingTiers.map((tier, index) => (
                        <div
                            key={tier.title}
                            id={tier.title.toLowerCase().includes('merchant') ? 'merchant' : undefined}
                            className={`rounded-[32px] border p-6 shadow-[0_24px_80px_rgba(13,21,34,0.04)] ${index === 0 ? 'border-[#d9eee6] bg-[#f7fbf9]' : index === 1 ? 'border-[#d7e4ff] bg-[#f7fbff]' : index === 2 ? 'border-[#f1e2c8] bg-[#fdf9f1]' : 'border-[#f2d8d4] bg-[#fff8f7]'}`}
                        >
                            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4f6787]">{tier.title}</div>
                            <div className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-[#152033]">{tier.price}</div>
                            <p className="mt-4 text-sm leading-7 text-[#5b6776]">{tier.body}</p>
                            <div className="mt-5 space-y-3">
                                {tier.points.map((point) => (
                                    <div key={point} className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 text-sm text-[#364255]">
                                        <CheckCircle2 size={16} className="mt-0.5 text-[#2855d9]" />
                                        <span>{point}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </SectionShell>

            <SectionShell
                eyebrow="Choose a path"
                title="Pick the route that matches the problem."
                description="Public access works when you need a quick check. Merchant, team, and regulated paths begin when workflow, governance, or review needs get heavier."
            >
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.82fr)]">
                    <div className="rounded-[32px] border border-[#d8dfe7] bg-white p-6 shadow-[0_24px_80px_rgba(13,21,34,0.04)]">
                        <div className="space-y-4 text-sm leading-7 text-[#5b6776]">
                            <p>Public utility is the fastest way to see whether the product is useful.</p>
                            <p>Merchant plans exist for teams that need clearer review and safer verification flows around support, payments, or customer trust.</p>
                            <p>Platform and enterprise discussions begin when governance, continuity, self-hosting, or auditability matter more than simple access.</p>
                        </div>
                    </div>

                    <div className="rounded-[32px] border border-[#d7e4ff] bg-[#f7fbff] p-6 shadow-[0_24px_80px_rgba(13,21,34,0.04)]">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#2855d9]">Talk to us</div>
                        <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#152033]">Need the merchant or platform path?</h2>
                        <p className="mt-4 text-sm leading-7 text-[#5b6776]">
                            Use the contact route for merchant deployment questions, team pricing, regulated environments, or a platform walkthrough.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link to="/about/contact" className="inline-flex items-center gap-2 rounded-full bg-[#132033] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1d2d48]">
                                Contact Active Mirror
                                <ArrowRight size={16} />
                            </Link>
                            <a href="https://chetana.activemirror.ai" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#d8dfe7] bg-white px-5 py-3 text-sm font-medium text-[#152033] transition-colors hover:border-[#bdc8d7]">
                                Try Chetana
                            </a>
                        </div>
                    </div>
                </div>
            </SectionShell>
        </SiteShell>
    );
}
