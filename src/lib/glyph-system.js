export const glyphs = {
    truth: '⟡',
    decision: '△',
    pattern: '◈',
    synthesis: '⧉',
};

export const glyphLabels = {
    truth: 'Truth',
    decision: 'Decision',
    pattern: 'Pattern',
    synthesis: 'Synthesis',
};

export const glyphMeanings = {
    truth: 'Identity, trust, and anchor.',
    decision: 'Action, routing, and execution.',
    pattern: 'Memory, continuity, and recurrence.',
    synthesis: 'Connection, orchestration, and mesh.',
};

export const mirrorBrainPalette = {
    dark: {
        background: '#07141f',
        surface: '#102131',
        surfaceElevated: '#173247',
        surfaceMuted: '#0d1b29',
        textPrimary: '#f8fafc',
        textSecondary: '#a6b7c8',
        textMuted: '#6b7b8c',
        accentPrimary: '#74d7cb',
        accentLight: '#c6fff6',
        accentDark: '#1f8d86',
        accentSecondary: '#f2b880',
        border: '#284052',
        online: '#3ddc97',
        offline: '#546170',
        warning: '#ffb44c',
        error: '#ff6b6b',
        glyphTruth: '#8ce3d8',
        glyphDecision: '#f2b880',
        glyphPattern: '#d7c4ff',
        glyphSynthesis: '#9fd2ff',
        chromeTop: 'rgba(12, 34, 51, 0.92)',
        chromeBottom: 'rgba(7, 20, 31, 0.98)',
    },
    light: {
        background: '#f4efe7',
        surface: '#fbf7ef',
        surfaceElevated: '#ffffff',
        surfaceMuted: '#ece3d6',
        textPrimary: '#101820',
        textSecondary: '#5a6572',
        textMuted: '#8492a0',
        accentPrimary: '#2e938b',
        accentLight: '#7fded2',
        accentDark: '#155b57',
        accentSecondary: '#cf8d52',
        border: '#d8d0c4',
        online: '#18a362',
        offline: '#8492a0',
        warning: '#d8933b',
        error: '#dc5f5f',
        glyphTruth: '#38a99d',
        glyphDecision: '#cf8d52',
        glyphPattern: '#9c7cc7',
        glyphSynthesis: '#5aa9dd',
        chromeTop: 'rgba(255, 255, 255, 0.92)',
        chromeBottom: 'rgba(244, 239, 231, 0.96)',
    },
};

export function getMirrorBrainPalette(theme = 'dark') {
    return theme === 'light' ? mirrorBrainPalette.light : mirrorBrainPalette.dark;
}

export const glyphChapters = [
    { key: 'truth', glyph: glyphs.truth, label: glyphLabels.truth, description: glyphMeanings.truth },
    { key: 'decision', glyph: glyphs.decision, label: glyphLabels.decision, description: glyphMeanings.decision },
    { key: 'pattern', glyph: glyphs.pattern, label: glyphLabels.pattern, description: glyphMeanings.pattern },
    { key: 'synthesis', glyph: glyphs.synthesis, label: glyphLabels.synthesis, description: glyphMeanings.synthesis },
];
