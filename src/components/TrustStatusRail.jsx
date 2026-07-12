import {
    BadgeCheck,
    Clock3,
    ExternalLink,
    HardDrive,
    Network,
    OctagonX,
    PencilLine,
    Save,
    Undo2,
} from 'lucide-react';

const TRUST_STATES = {
    proposed: { label: 'Proposed', icon: Clock3 },
    verified: { label: 'Verified', icon: BadgeCheck },
    rejected: { label: 'Rejected', icon: OctagonX },
    rolled_back: { label: 'Rolled back', icon: Undo2 },
};

const BOUNDARIES = {
    local_device: { label: 'On this device', icon: HardDrive },
    private_mesh: { label: 'Private mesh', icon: Network },
    external_provider: { label: 'External provider', icon: ExternalLink },
};

export function TrustStateMark({ state = 'proposed' }) {
    const contract = TRUST_STATES[state] || TRUST_STATES.proposed;
    const Icon = contract.icon;

    return (
        <span className="am-trust-state" data-state={state} data-testid="trust-state">
            <Icon size={13} aria-hidden="true" />
            {contract.label}
        </span>
    );
}

export default function TrustStatusRail({
    processingBoundary = 'local_device',
    memoryEnabled = false,
}) {
    const boundary = BOUNDARIES[processingBoundary] || BOUNDARIES.local_device;
    const BoundaryIcon = boundary.icon;

    return (
        <div
            className="am-trust-rail"
            data-processing-boundary={processingBoundary}
            data-authority="draft"
            data-testid="trust-status-rail"
            role="status"
            aria-label="Current processing, authority, and memory status"
        >
            <span className="am-trust-rail__item" data-kind={processingBoundary} title="Where the current response was processed">
                <BoundaryIcon size={14} aria-hidden="true" />
                {boundary.label}
            </span>
            <span className="am-trust-rail__item" data-kind="draft" title="Active Mirror can draft here but cannot act for you">
                <PencilLine size={14} aria-hidden="true" />
                Draft only
            </span>
            <span className="am-trust-rail__item" data-kind={memoryEnabled ? 'saved_by_choice' : 'not_saved'} title="Memory changes only through your controls">
                <Save size={14} aria-hidden="true" />
                {memoryEnabled ? 'Saved by choice' : 'Not saved'}
            </span>
        </div>
    );
}
