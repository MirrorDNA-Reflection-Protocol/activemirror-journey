import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import ScrollToTop from './components/ScrollToTop';

import HomePage from './pages/HomePage';
import ReflectChat from './pages/ReflectChat.jsx';

const Landing = lazy(() => import('./pages/Landing'));
const ProofPage = lazy(() => import('./pages/ProofPage'));
const Demo = lazy(() => import('./pages/Demo'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Legal = lazy(() => import('./pages/Legal'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Trust = lazy(() => import('./pages/Trust'));
const Platform = lazy(() => import('./pages/Platform'));
const ChetanaLanding = lazy(() => import('./pages/ChetanaLanding'));
const TestLab = lazy(() => import('./pages/TestLab'));
const Hub = lazy(() => import('./pages/Hub'));
const DashGen = lazy(() => import('./pages/DashGen'));
const Confessions = lazy(() => import('./pages/Confessions'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Research = lazy(() => import('./pages/Research'));
const Scan = lazy(() => import('./pages/Scan'));
const Twins = lazy(() => import('./pages/Twins'));
const Brief = lazy(() => import('./pages/Brief'));
const Cast = lazy(() => import('./pages/Cast'));
const Start = lazy(() => import('./pages/Start'));
const Setup = lazy(() => import('./pages/Setup'));
const Ecosystem = lazy(() => import('./pages/Ecosystem'));
const Skills = lazy(() => import('./pages/Skills'));
const Features = lazy(() => import('./pages/Features'));
const Builds = lazy(() => import('./pages/Builds'));
const Status = lazy(() => import('./pages/Status'));
const LivePulse = lazy(() => import('./pages/LivePulse'));
const MirrorAmbient = lazy(() => import('./pages/MirrorAmbient'));
const AppShell = lazy(() => import('./pages/AppShell.jsx'));
const MirrorPage = lazy(() => import('./pages/MirrorPage'));
const MirrorWithAuth = lazy(() => import('./pages/MirrorWithAuth'));
const ProductsIndex = lazy(() => import('./pages/products/index'));
const MirrorGate = lazy(() => import('./pages/products/MirrorGate'));
const MirrorBrain = lazy(() => import('./pages/products/MirrorBrain'));
const LingOS = lazy(() => import('./pages/products/LingOS'));
const MirrorRecall = lazy(() => import('./pages/products/MirrorRecall'));
const GlyphTrail = lazy(() => import('./pages/products/GlyphTrail'));
const TrustByDesign = lazy(() => import('./pages/products/TrustByDesign'));
const AgentDNA = lazy(() => import('./pages/products/AgentDNA'));
const Vault = lazy(() => import('./pages/products/Vault'));
const MirrorBalance = lazy(() => import('./pages/products/MirrorBalance'));
const CognitiveDashboard = lazy(() => import('./pages/products/CognitiveDashboard'));
const Kavach = lazy(() => import('./pages/products/Kavach'));
const Chetana = lazy(() => import('./pages/products/Chetana'));
const UseCasesIndex = lazy(() => import('./pages/use-cases/index'));
const Individuals = lazy(() => import('./pages/use-cases/Individuals'));
const Teams = lazy(() => import('./pages/use-cases/Teams'));
const Enterprise = lazy(() => import('./pages/use-cases/Enterprise'));
const Government = lazy(() => import('./pages/use-cases/Government'));
const Healthcare = lazy(() => import('./pages/use-cases/Healthcare'));
const Education = lazy(() => import('./pages/use-cases/Education'));
const DocsIndex = lazy(() => import('./pages/docs/index'));
const Architecture = lazy(() => import('./pages/docs/Architecture'));
const SelfHosting = lazy(() => import('./pages/docs/SelfHosting'));
const APIDoc = lazy(() => import('./pages/docs/API'));
const AboutIndex = lazy(() => import('./pages/about/index'));
const Roadmap = lazy(() => import('./pages/about/Roadmap'));
const Contact = lazy(() => import('./pages/about/Contact'));

function LazyRoute({ children }) {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black text-white" />}>
            {children}
        </Suspense>
    );
}

export default function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <ScrollToTop />
                <Suspense fallback={<div className="min-h-screen bg-black text-white" />}>
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
                    <Route path="/mirror" element={<ReflectChat />} />
                    <Route path="/mirror-ambient" element={<LazyRoute><MirrorAmbient /></LazyRoute>} />
                    <Route path="/mirror-beta" element={<LazyRoute><MirrorWithAuth /></LazyRoute>} />
                    <Route path="/demo" element={<Demo />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/lab" element={<TestLab />} />
                    <Route path="/hub" element={<Hub />} />
                    <Route path="/dashgen" element={<DashGen />} />
                    <Route path="/confessions" element={<Confessions />} />
                    <Route path="/prism" element={<LazyRoute><MirrorPage /></LazyRoute>} />
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
                    <Route path="/app" element={<ReflectChat />} />
                    <Route path="/workspace" element={<LazyRoute><AppShell /></LazyRoute>} />

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
                </Suspense>
            </BrowserRouter>
        </ThemeProvider>
    );
}
