/**
 * ⟡ Consent Utility — Persistent consent management with versioning
 *
 * Features:
 * - localStorage persistence (survives browser close)
 * - 30-day expiry (re-consent after expiry)
 * - Version tracking (re-consent if terms change)
 * - Proof logging to backend
 */

// Current consent version - increment when terms change
export const CONSENT_VERSION = '1.0';

// Consent expiry in milliseconds (30 days)
const CONSENT_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

// Backend endpoint for logging (MirrorBrain instance)
const CONSENT_LOG_ENDPOINT = 'https://brain.activemirror.ai/consent/log';

// Check if user has valid full consent
export const hasSessionConsent = () => {
    try {
        const proof = localStorage.getItem('mirrorProof');
        if (!proof) return false;

        const data = JSON.parse(proof);

        // Check required fields
        if (!data.hash || !data.timestamp || !data.acks?.length >= 3) {
            return false;
        }

        // Check version - re-consent if version changed
        if (data.version !== CONSENT_VERSION) {
            console.log('[Consent] Version mismatch, re-consent required');
            return false;
        }

        // Check expiry
        const age = Date.now() - data.timestamp;
        if (age > CONSENT_EXPIRY_MS) {
            console.log('[Consent] Expired, re-consent required');
            localStorage.removeItem('mirrorProof');
            return false;
        }

        return true;
    } catch {
        return false;
    }
};

// Get the proof hash if it exists and is valid
export const getProofHash = () => {
    try {
        if (!hasSessionConsent()) return null;
        const proof = localStorage.getItem('mirrorProof');
        return JSON.parse(proof).hash;
    } catch {
        return null;
    }
};

// Get full proof data
export const getProofData = () => {
    try {
        const proof = localStorage.getItem('mirrorProof');
        if (!proof) return null;
        return JSON.parse(proof);
    } catch {
        return null;
    }
};

// Generate a proof hash
export const generateProofHash = (acks, timestamp) => {
    const data = `mirror:${acks.join(':')}:${timestamp}:${navigator.userAgent.slice(0, 20)}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `⟡${hex.slice(0, 4)}-${hex.slice(4, 8)}`.toUpperCase();
};

// Hash IP/identifier for privacy (simple hash, not crypto)
const hashForPrivacy = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
};

// Set consent (called after passing Mirror Proof)
export const setSessionConsent = async (hash, acks, page = window.location.pathname) => {
    const timestamp = Date.now();
    const proofData = {
        hash,
        timestamp,
        acks,
        version: CONSENT_VERSION,
        page
    };

    // Store locally
    localStorage.setItem('mirrorProof', JSON.stringify(proofData));

    // Log to backend (fire and forget)
    logConsentToBackend({
        ...proofData,
        user_agent: navigator.userAgent,
        screen: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        referrer: document.referrer || 'direct'
    });

    return proofData;
};

// Quick consent for lighter pages (single acknowledgment)
export const setQuickConsent = async (feature) => {
    // If already has full consent, no need
    if (hasSessionConsent()) return;

    const timestamp = Date.now();
    const quickData = {
        feature,
        timestamp,
        version: CONSENT_VERSION
    };

    localStorage.setItem('quickConsent', JSON.stringify(quickData));

    // Log to backend
    logConsentToBackend({
        type: 'quick',
        feature,
        timestamp,
        version: CONSENT_VERSION,
        page: window.location.pathname,
        user_agent: navigator.userAgent
    });
};

export const hasQuickConsent = (feature) => {
    if (hasSessionConsent()) return true; // Full consent covers everything

    try {
        const quick = localStorage.getItem('quickConsent');
        if (!quick) return false;

        const data = JSON.parse(quick);

        // Check version
        if (data.version !== CONSENT_VERSION) return false;

        // Check expiry (same as full consent)
        const age = Date.now() - data.timestamp;
        if (age > CONSENT_EXPIRY_MS) {
            localStorage.removeItem('quickConsent');
            return false;
        }

        return data.feature === feature || data.feature === 'all';
    } catch {
        return false;
    }
};

// Log consent proof to backend
const logConsentToBackend = async (proofData) => {
    try {
        // Add session fingerprint (hashed for privacy)
        const fingerprint = hashForPrivacy(
            navigator.userAgent +
            window.screen.width +
            window.screen.height +
            new Date().getTimezoneOffset()
        );

        await fetch(CONSENT_LOG_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...proofData,
                fingerprint,
                logged_at: new Date().toISOString()
            }),
            // Don't block on failure
            keepalive: true
        });
    } catch (err) {
        // Silent fail - don't break UX if logging fails
        console.warn('[Consent] Failed to log proof:', err.message);
    }
};

// Revoke consent (for user-initiated "forget me")
export const revokeConsent = () => {
    localStorage.removeItem('mirrorProof');
    localStorage.removeItem('quickConsent');
};

// Get consent status summary
export const getConsentStatus = () => {
    const full = hasSessionConsent();
    const proofData = getProofData();

    return {
        hasFullConsent: full,
        proofHash: proofData?.hash || null,
        consentedAt: proofData?.timestamp ? new Date(proofData.timestamp).toISOString() : null,
        version: proofData?.version || null,
        currentVersion: CONSENT_VERSION,
        needsReconsent: proofData?.version && proofData.version !== CONSENT_VERSION,
        expiresAt: proofData?.timestamp
            ? new Date(proofData.timestamp + CONSENT_EXPIRY_MS).toISOString()
            : null
    };
};
