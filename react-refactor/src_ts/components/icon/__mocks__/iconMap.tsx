import React from 'react';

export type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

export const iconComponents: Record<string, IconComponent> = {
  test: (props) => (
    <svg viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
    </svg>
  ),
};

// Provide empty URL map so code can safely read iconUrls[name]
export const iconUrls: Record<string, string> = {};

export const availableIcons = Object.keys(iconComponents);
