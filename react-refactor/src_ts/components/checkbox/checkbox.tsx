
import React, { ReactNode } from 'react';

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children?: ReactNode;
  id?: string;
  className?: string;
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
