import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'mirror_vault_reflections';

// Helper: Format Current Timestamp
const getTimestamp = () => new Date().toISOString();

// Helper: Check if date string is today
const isToday = (dateString) => {
    const d = new Date(dateString);
    const today = new Date();
    return d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();
};

export function useVault() {
    const [reflections, setReflections] = useState([]);
    const [stats, setStats] = useState({ count: 0, decisions: 0, deferrals: 0, firstEntry: null });

    // Load from Storage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setReflections(parsed);
                calculateStats(parsed);
            }
        } catch (e) {
            console.error("Vault Load Error:", e);
        }
    }, []);

    // Derived: Calculate Stats
    const calculateStats = (data) => {
        const count = data.length;
        const decisions = data.filter(r => r.outcome === 'Decide' || r.outcome === 'Next Action').length;
        const deferrals = data.filter(r => r.outcome === 'Defer' || r.outcome === 'Pause').length;
        const firstEntry = count > 0 ? data[count - 1].timestamp : null;
        setStats({ count, decisions, deferrals, firstEntry });
    };

    // Action: Save Reflection
    const saveReflection = useCallback((intent, chatHistory, outcome, modelMeta) => {
        const timestamp = getTimestamp();

        // Construct Markdown Content
        const markdown = `
# Reflection — ${timestamp}
## Intent
${intent}

## Outcome
${outcome}

## Decision
${outcome}

## Model Meta
- Model used: ${modelMeta.model}
- Online: ${modelMeta.online ? 'Yes' : 'No'}
- Identity: ${modelMeta.id || 'Anonymous'}

## Session Log
${chatHistory.map(m => `**${m.role.toUpperCase()}:** ${m.content}`).join('\n\n')}
        `.trim();

        const newEntry = {
            id: crypto.randomUUID(),
            timestamp,
            intent,
            outcome,
            markdown,
            modelMeta
        };

        setReflections(prev => {
            const updated = [newEntry, ...prev];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            calculateStats(updated);
            return updated;
        });

        return newEntry;
    }, []);

    // Check: Needs Daily Prompt?
    const hasReflectedToday = () => {
        if (reflections.length === 0) return false;
        return isToday(reflections[0].timestamp);
    };

    // Helper to clear vault (for testing)
    const clearVault = () => {
        localStorage.removeItem(STORAGE_KEY);
        setReflections([]);
        setStats({ count: 0, decisions: 0, deferrals: 0, firstEntry: null });
    };

    return {
        reflections,
        stats,
        saveReflection,
        hasReflectedToday: hasReflectedToday(),
        clearVault
    };
}
