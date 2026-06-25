import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import ScrollToTop from './components/ScrollToTop';

// Main pages
import HomePage from './pages/HomePage';
import Landing from './pages/Landing';
import ProofPage from './pages/ProofPage';
import Demo from './pages/Demo';
import MirrorPage from './pages/MirrorPage';
import MirrorWithAuth from './pages/MirrorWithAuth';
import Pricing from './pages/Pricing';
import Legal from './pages/Legal';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Trust from './pages/Trust';
import Platform from './pages/Platform';
import ChetanaLanding from './pages/ChetanaLanding';
import TestLab from './pages/TestLab';
import Hub from './pages/Hub';
import DashGen from './pages/DashGen';
import Confessions from './pages/Confessions';
import NotFound from './pages/NotFound';
import MirrorAmbient from './pages/MirrorAmbient';
import Research from './pages/Research';
import Scan from './pages/Scan';
import Twins from './pages/Twins';
import Brief from './pages/Brief';
import Cast from './pages/Cast';
import Start from './pages/Start';
import Setup from './pages/Setup';
import Ecosystem from './pages/Ecosystem';
import Skills from './pages/Skills';
import Features from './pages/Features';
import Builds from './pages/Builds';
import Status from './pages/Status';
import LivePulse from './pages/LivePulse';
import AppShell from './pages/AppShell.jsx';

// Products
import ProductsIndex from './pages/products/index';
import MirrorGate from './pages/products/MirrorGate';
import MirrorBrain from './pages/products/MirrorBrain';
import LingOS from './pages/products/LingOS';
import MirrorRecall from './pages/products/MirrorRecall';
import GlyphTrail from './pages/products/GlyphTrail';
import TrustByDesign from './pages/products/TrustByDesign';
import AgentDNA from './pages/products/AgentDNA';
import Vault from './pages/products/Vault';
import MirrorBalance from './pages/products/MirrorBalance';
import CognitiveDashboard from './pages/products/CognitiveDashboard';
import Kavach from './pages/products/Kavach';
import Chetana from './pages/products/Chetana';

// Use Cases
import UseCasesIndex from './pages/use-cases/index';
import Individuals from './pages/use-cases/Individuals';
import Teams from './pages/use-cases/Teams';
import Enterprise from './pages/use-cases/Enterprise';
import Government from './pages/use-cases/Government';
import Healthcare from './pages/use-cases/Healthcare';
import Education from './pages/use-cases/Education';

// Docs
import DocsIndex from './pages/docs/index';
import Architecture from './pages/docs/Architecture';
import SelfHosting from './pages/docs/SelfHosting';
import APIDoc from './pages/docs/API';

// About
import AboutIndex from './pages/about/index';
import Roadmap from './pages/about/Roadmap';
import Contact from './pages/about/Contact';

export default function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <ScrollToTop />
                <Routes>
                    {/* Main pages */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/proof" element={<ProofPage />} />
                    <Route path="/start" element={<Start />} />
                    <Route path="/setup" element={<Setup />} />
                    <Route path="/preview" element={<Landing />} />
                    <Route path="/legal" element={<Legal />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/trust" element={<Trust />} />
                    <Route path="/platform" element={<Platform />} />
                    <Route path="/chetana" element={<ChetanaLanding />} />
                    <Route path="/mirror" element={<MirrorAmbient />} />
                    <Route path="/mirror-beta" element={<MirrorWithAuth />} />
                    <Route path="/demo" element={<Demo />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/lab" element={<TestLab />} />
                    <Route path="/hub" element={<Hub />} />
                    <Route path="/dashgen" element={<DashGen />} />
                    <Route path="/confessions" element={<Confessions />} />
                    <Route path="/prism" element={<MirrorPage />} />
                    <Route path="/research" element={<Research />} />
                    <Route path="/scan" element={<Scan />} />
                    <Route path="/twins" element={<Twins />} />
                    <Route path="/brief" element={<Brief />} />
                    <Route path="/cast" element={<Cast />} />
                    <Route path="/ecosystem" element={<Ecosystem />} />
                    <Route path="/skills" element={<Skills />} />
                    <Route path="/features" element={<Features />} />
                    <Route path="/builds" element={<Builds />} />
                    <Route path="/status" element={<Status />} />
                    <Route path="/live" element={<LivePulse />} />
                    <Route path="/app" element={<AppShell />} />

                    {/* Products */}
                    <Route path="/products" element={<ProductsIndex />} />
                    <Route path="/products/mirrorgate" element={<MirrorGate />} />
                    <Route path="/products/mirrorbrain" element={<MirrorBrain />} />
                    <Route path="/products/lingos" element={<LingOS />} />
                    <Route path="/products/mirrorrecall" element={<MirrorRecall />} />
                    <Route path="/products/glyphtrail" element={<GlyphTrail />} />
                    <Route path="/products/trustbydesign" element={<TrustByDesign />} />
                    <Route path="/products/agentdna" element={<AgentDNA />} />
                    <Route path="/products/vault" element={<Vault />} />
                    <Route path="/products/mirrorbalance" element={<MirrorBalance />} />
                    <Route path="/products/cognitive-dashboard" element={<CognitiveDashboard />} />
                    <Route path="/products/kavach" element={<Kavach />} />
                    <Route path="/products/chetana" element={<Chetana />} />

                    {/* Use Cases */}
                    <Route path="/use-cases" element={<UseCasesIndex />} />
                    <Route path="/use-cases/individuals" element={<Individuals />} />
                    <Route path="/use-cases/teams" element={<Teams />} />
                    <Route path="/use-cases/enterprise" element={<Enterprise />} />
                    <Route path="/use-cases/government" element={<Government />} />
                    <Route path="/use-cases/healthcare" element={<Healthcare />} />
                    <Route path="/use-cases/education" element={<Education />} />

                    {/* Docs */}
                    <Route path="/docs" element={<DocsIndex />} />
                    <Route path="/docs/getting-started" element={<Navigate to="/docs" replace />} />
                    <Route path="/docs/architecture" element={<Architecture />} />
                    <Route path="/docs/self-hosting" element={<SelfHosting />} />
                    <Route path="/docs/api" element={<APIDoc />} />

                    {/* About */}
                    <Route path="/about" element={<AboutIndex />} />
                    <Route path="/about/roadmap" element={<Roadmap />} />
                    <Route path="/about/contact" element={<Contact />} />

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}
