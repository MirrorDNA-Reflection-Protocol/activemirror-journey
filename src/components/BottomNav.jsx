/**
 * ⟡ Bottom Navigation Bar
 * Mobile-friendly tab navigation for the Intelligence Suite
 * Supports light/dark themes
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageCircle, Brain, Users, Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const NAV_ITEMS = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/start', label: 'Discover', icon: Sparkles },
    { path: '/mirror', label: 'Reflect', icon: MessageCircle },
    { path: '/twins', label: 'Twins', icon: Users },
    { path: '/scan', label: 'Scan', icon: Brain },
];

const BottomNav = () => {
    const location = useLocation();
    const currentPath = location.pathname;
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <nav className={`fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-xl safe-area-bottom transition-colors ${
            isDark
                ? 'border-white/[0.08] bg-[#08080a]/95'
                : 'border-zinc-200 bg-white/95'
        }`}>
            <div className="flex items-center justify-around px-2 py-1">
                {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
                    const isActive = path === '/'
                        ? currentPath === '/'
                        : currentPath === path || currentPath.startsWith(path + '/');

                    return (
                        <Link
                            key={path}
                            to={path}
                            className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
                                isActive
                                    ? isDark ? 'text-white' : 'text-purple-600'
                                    : isDark ? 'text-white/40 hover:text-white/60' : 'text-zinc-400 hover:text-zinc-600'
                            }`}
                        >
                            <div className={`p-1.5 rounded-lg transition-all ${
                                isActive
                                    ? isDark ? 'bg-white/10' : 'bg-purple-100'
                                    : ''
                            }`}>
                                <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                            </div>
                            <span className={`text-[10px] font-medium tracking-wide ${
                                isActive ? 'opacity-100' : 'opacity-80'
                            }`}>
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
