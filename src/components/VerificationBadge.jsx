import React from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle, HelpCircle } from 'lucide-react';

/**
 * VerificationBadge - Displays the verification status of an AI response
 * 
 * States:
 * - verified: Green checkmark, response passed all checks
 * - pending: Yellow clock, verification in progress
 * - rejected: Red X, response failed verification
 * - unavailable: Gray, verification service not available
 * 
 * Part of SC1 Canaryd Phase 1 implementation
 */

const BADGE_STATES = {
    verified: {
        icon: CheckCircle,
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500/30',
        label: 'Verified',
        tooltip: 'This response passed independent verification by a second node.'
    },
    pending: {
        icon: Clock,
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/20',
        borderColor: 'border-amber-500/30',
        label: 'Verifying...',
        tooltip: 'Verification in progress. The response is being checked by an independent node.'
    },
    rejected: {
        icon: XCircle,
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/30',
        label: 'Rejected',
        tooltip: 'This response failed verification. It may have been filtered or modified.'
    },
    unavailable: {
        icon: AlertCircle,
        color: 'text-zinc-500',
        bgColor: 'bg-zinc-500/20',
        borderColor: 'border-zinc-500/30',
        label: 'Unverified',
        tooltip: 'Verification service is currently unavailable.'
    }
};

export const VerificationBadge = ({
    status = 'unavailable',
    policyVersion = null,
    verifiedAt = null,
    showDetails = false,
    size = 'md',
    onClick = null
}) => {
    const state = BADGE_STATES[status] || BADGE_STATES.unavailable;
    const Icon = state.icon;

    const sizeClasses = {
        sm: 'text-xs px-2 py-1 gap-1',
        md: 'text-sm px-3 py-1.5 gap-1.5',
        lg: 'text-base px-4 py-2 gap-2'
    };

    const iconSizes = {
        sm: 12,
        md: 14,
        lg: 18
    };

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            // Default: link to /trust page
            window.location.href = '/trust';
        }
    };

    return (
        <div className="relative group">
            {/* Badge Button */}
            <button
                onClick={handleClick}
                className={`
                    inline-flex items-center rounded-full border
                    ${state.bgColor} ${state.borderColor} ${state.color}
                    ${sizeClasses[size]}
                    hover:opacity-80 transition-opacity cursor-pointer
                `}
                aria-label={state.tooltip}
            >
                <Icon size={iconSizes[size]} />
                <span className="font-medium">{state.label}</span>
                {status === 'verified' && <span className="opacity-75">⟡</span>}
            </button>

            {/* Tooltip */}
            <div className={`
                absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                opacity-0 group-hover:opacity-100 pointer-events-none
                transition-opacity duration-200 z-50
            `}>
                <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl max-w-xs">
                    <p className="text-zinc-300 text-sm">{state.tooltip}</p>

                    {showDetails && status === 'verified' && (
                        <div className="mt-2 pt-2 border-t border-zinc-700 text-xs text-zinc-500">
                            {policyVersion && (
                                <p>Policy: {policyVersion}</p>
                            )}
                            {verifiedAt && (
                                <p>Verified: {new Date(verifiedAt).toLocaleTimeString()}</p>
                            )}
                        </div>
                    )}

                    <p className="mt-2 text-xs text-violet-400 flex items-center gap-1">
                        <HelpCircle size={10} />
                        Click to learn more
                    </p>
                </div>

                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                    <div className="border-8 border-transparent border-t-zinc-900" />
                </div>
            </div>
        </div>
    );
};

/**
 * Inline version for use within message bubbles
 */
export const InlineVerificationBadge = ({ status = 'verified' }) => {
    const state = BADGE_STATES[status] || BADGE_STATES.unavailable;
    const Icon = state.icon;

    return (
        <a
            href="/trust"
            className={`inline-flex items-center gap-1 ${state.color} hover:underline`}
            title={state.tooltip}
        >
            <Icon size={12} />
            <span className="text-xs">{state.label}</span>
            {status === 'verified' && <span className="text-xs opacity-75">⟡</span>}
        </a>
    );
};

export default VerificationBadge;
