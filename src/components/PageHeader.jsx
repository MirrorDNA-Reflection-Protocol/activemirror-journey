/**
 * ⟡ Page Header
 * Simple, consistent navigation header for all pages
 * Shows page title, description, and back-to-home button
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ChevronLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

const PageHeader = ({ title, description, showBack = true, icon: Icon }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <header className={`fixed top-0 left-0 right-0 z-40 border-b backdrop-blur-xl transition-colors ${
            isDark
                ? 'border-white/[0.08] bg-[#08080a]/90'
                : 'border-zinc-200 bg-white/90'
        }`}>
            <div className="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">
                {/* Left: Back button */}
                <div className="flex items-center gap-3">
                    {showBack && (
                        <Link
                            to="/"
                            className={`p-2 rounded-lg transition-colors ${
                                isDark
                                    ? 'hover:bg-white/10 text-white/60 hover:text-white'
                                    : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800'
                            }`}
                            aria-label="Go home"
                        >
                            <Home size={20} />
                        </Link>
                    )}

                    {/* Title & description */}
                    <div>
                        <div className="flex items-center gap-2">
                            {Icon && (
                                <Icon size={18} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
                            )}
                            <h1 className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                {title}
                            </h1>
                        </div>
                        {description && (
                            <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right: Theme toggle */}
                <ThemeToggle />
            </div>
        </header>
    );
};

export default PageHeader;
