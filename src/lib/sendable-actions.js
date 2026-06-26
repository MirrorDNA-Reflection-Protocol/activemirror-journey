function fallbackCopy(text) {
    if (typeof document === 'undefined') return false;

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.select();

    try {
        return document.execCommand('copy');
    } finally {
        document.body.removeChild(textarea);
    }
}

export async function copyText(text) {
    const clean = String(text || '');
    if (!clean) return false;

    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(clean);
        return true;
    }

    return fallbackCopy(clean);
}

export function downloadTextFile(filename, text) {
    if (typeof document === 'undefined') return false;

    const blob = new Blob([String(text || '')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'active-mirror-draft.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
}

export async function shareText({ title = 'Active Mirror draft', text = '' } = {}) {
    const clean = String(text || '');
    if (!clean) return 'empty';

    if (navigator.share) {
        await navigator.share({ title, text: clean });
        return 'shared';
    }

    await copyText(clean);
    return 'copied';
}
