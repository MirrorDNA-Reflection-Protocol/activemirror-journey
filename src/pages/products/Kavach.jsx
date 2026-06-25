/**
 * ⟡ Kavach → redirects to Chetana (unified product)
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function KavachPage() {
    const navigate = useNavigate();
    useEffect(() => { navigate('/products/chetana', { replace: true }); }, [navigate]);
    return null;
}
