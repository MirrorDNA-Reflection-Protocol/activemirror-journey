import React from 'react';

export default function MirrorLogo({ className = "w-8 h-8", alt = "Active Mirror" }) {
    return (
        <svg viewBox="0 0 24 24" className={className} role="img" aria-label={alt}>
            <path d="M12 3.4 19.5 7.7v8.6L12 20.6 4.5 16.3V7.7L12 3.4Z" fill="none" stroke="var(--am-primary-marker)" strokeWidth="1.6" />
            <path d="M12 7.8 16 10v4l-4 2.2L8 14v-4l4-2.2Z" fill="none" stroke="var(--am-focus)" strokeWidth="1.6" />
        </svg>
    );
}
