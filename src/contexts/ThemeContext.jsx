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
            return 'dark';
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
        bg: 'bg-[var(--am-canvas)]',
        bgSecondary: 'bg-[var(--am-surface)]',
        bgTertiary: 'bg-[var(--am-surface-subtle)]',
        text: 'text-[var(--am-ink)]',
        textSecondary: 'text-[var(--am-muted)]',
        textMuted: 'text-[var(--am-muted)]',
        border: 'border-[var(--am-border)]',
        borderAccent: 'border-[var(--am-focus)]',
        glass: 'bg-[var(--am-surface)]',
        glassStrong: 'bg-[var(--am-surface)]',
        input: 'bg-white/5 border-white/10 text-white placeholder-zinc-500',
        card: 'bg-[var(--am-surface)] border-[var(--am-border)]',
    },
    light: {
        bg: 'bg-[var(--am-canvas)]',
        bgSecondary: 'bg-[var(--am-surface)]',
        bgTertiary: 'bg-[var(--am-surface-subtle)]',
        text: 'text-[var(--am-ink)]',
        textSecondary: 'text-[var(--am-muted)]',
        textMuted: 'text-[var(--am-muted)]',
        border: 'border-[var(--am-border)]',
        borderAccent: 'border-[var(--am-focus)]',
        glass: 'bg-[var(--am-surface)]',
        glassStrong: 'bg-[var(--am-surface)]',
        input: 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400',
        card: 'bg-[var(--am-surface)] border-[var(--am-border)]',
    }
};
