
import React, { ReactNode } from 'react';

type CheckboxProps = {
    // ON / OFF state
    checked: boolean;
	// Native onChange is also supported for drop-in usage
    onChange: (checked: boolean) => void;
    // Optional children to render inside the label
    children?: ReactNode;
    // Unique ID for the checkbox
    id?: string;
    // Optional className to extend styling
    className?: string;
    // Accessible label for the checkbox
    ariaLabel?: string;
};

function Checkbox({ checked, onChange, children, id, className, ariaLabel }: CheckboxProps) {
    return (
        <label className={className} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <span className="checkbox" onClick={() => onChange(!checked)} role="checkbox" aria-checked={checked} aria-label={ariaLabel}>
                <div className={checked ? 'active' : ''} />
            </span>
            {children}
            {/* Hidden native input for accessibility and forms if needed */}
            <input
                type="checkbox"
                checked={checked}
                onChange={e => onChange(e.target.checked)}
                id={id}
                aria-hidden
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
            />
        </label>
    );
}

export default Checkbox;
