/**
 * ⟡ PROOF PAGE — Redirect to Proof-of-Memory Protocol
 *
 * Redirects to the static /proof/index.html which contains
 * the full Proof-of-Memory attention tracking demo.
 */

import { useEffect } from 'react';

const ProofPage = () => {
    useEffect(() => {
        // Redirect to the static proof page
        window.location.href = '/proof/index.html';
    }, []);

    return null;
};

export default ProofPage;
