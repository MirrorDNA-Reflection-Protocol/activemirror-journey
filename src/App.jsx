import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import ScrollToTop from './components/ScrollToTop';

import HomePage from './pages/HomePage';

const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Start = lazy(() => import('./pages/Start'));
const DeviceExperience = lazy(() => import('./pages/DeviceExperience'));
const Enterprise = lazy(() => import('./pages/Enterprise'));
const Research = lazy(() => import('./pages/Research'));
const FeedbackDashboard = lazy(() => import('./pages/FeedbackDashboard'));

const staleRoutes = [
    '/about',
    '/about/*',
    '/brief',
    '/builds',
    '/cast',
    '/chetana',
    '/confessions',
    '/dashgen',
    '/demo',
    '/docs',
    '/docs/*',
    '/ecosystem',
    '/features',
    '/hub',
    '/lab',
    '/live',
    '/mirror-ambient',
    '/mirror-beta',
    '/platform',
    '/preview',
    '/pricing',
    '/prism',
    '/products',
    '/products/*',
    '/proof',
    '/setup',
    '/skills',
    '/status',
    '/trust',
    '/twins',
    '/use-cases',
    '/use-cases/*',
    '/workspace',
];

export default function App() {
    const basename = import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '');

    return (
        <ThemeProvider>
            <BrowserRouter basename={basename}>
                <ScrollToTop />
                <Suspense fallback={<div className="min-h-screen bg-black text-white" />}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/id" element={<Start />} />
                        <Route path="/start" element={<Navigate to="/id" replace />} />
                        <Route path="/device" element={<DeviceExperience />} />
                        <Route path="/enterprise" element={<Enterprise />} />
                        <Route path="/consulting" element={<Enterprise />} />
                        <Route path="/research" element={<Research />} />
                        <Route path="/feedback" element={<FeedbackDashboard />} />
                        <Route path="/mirror" element={<Navigate to="/" replace />} />
                        <Route path="/privacy" element={<Privacy />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/legal" element={<Navigate to="/privacy" replace />} />
                        <Route path="/mirrorseed" element={<Navigate to="/id" replace />} />
                        <Route path="/scan" element={<Navigate to="/id" replace />} />
                        <Route path="/brainscan" element={<Navigate to="/id" replace />} />
                        <Route path="/reflect" element={<Navigate to="/" replace />} />
                        <Route path="/index.html" element={<Navigate to="/" replace />} />

                        {staleRoutes.map((path) => (
                            <Route key={path} path={path} element={<Navigate to="/" replace />} />
                        ))}

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </ThemeProvider>
    );
}
