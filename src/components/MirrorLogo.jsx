import React from 'react';

export default function MirrorLogo({ className = "w-8 h-8", alt = "Active Mirror" }) {
    return (
        <img
            src="/assets/active-mirror-icon.png"
            alt={alt}
            className={`${className} object-contain`}
            loading="eager"
        />
    );
}
