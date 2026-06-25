/**
 * Theme Context — Light/Dark Mode Toggle
 * Persists preference to localStorage
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('mirror-theme');
            if (saved) return saved;
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'dark';
    });

    useEffect(() => {
        localStorage.setItem('mirror-theme', theme);
        document.documentElement.setAttribute('data-theme', theme);

        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

// Theme color definitions
export const themes = {
    dark: {
        bg: 'bg-[#08080a]',
        bgSecondary: 'bg-[#0f0f12]',
        bgTertiary: 'bg-[#16161a]',
        text: 'text-white',
        textSecondary: 'text-zinc-400',
        textMuted: 'text-zinc-500',
        border: 'border-white/10',
        borderAccent: 'border-white/20',
        glass: 'bg-white/[0.03] backdrop-blur-xl',
        glassStrong: 'bg-white/[0.08] backdrop-blur-xl',
        input: 'bg-white/5 border-white/10 text-white placeholder-zinc-500',
        card: 'bg-white/[0.02] border-white/[0.06]',
    },
    light: {
        bg: 'bg-[#fafafa]',
        bgSecondary: 'bg-white',
        bgTertiary: 'bg-zinc-50',
        text: 'text-zinc-900',
        textSecondary: 'text-zinc-600',
        textMuted: 'text-zinc-500',
        border: 'border-zinc-200',
        borderAccent: 'border-zinc-300',
        glass: 'bg-white/80 backdrop-blur-xl',
        glassStrong: 'bg-white/90 backdrop-blur-xl',
        input: 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400',
        card: 'bg-white border-zinc-200 shadow-sm',
    }
};
