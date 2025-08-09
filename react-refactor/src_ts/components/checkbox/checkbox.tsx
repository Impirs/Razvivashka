
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
    <label className={className} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        id={id}
        aria-label={ariaLabel}
        style={{ marginRight: 4 }}
      />
      {children}
    </label>
  );
}

export default Checkbox;
