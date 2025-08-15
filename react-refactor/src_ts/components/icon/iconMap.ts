import React from 'react';

export type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

// React components via SVGR
const componentMods = (import.meta as any).glob('/src_ts/assets/icons/*.svg?react', { eager: true }) as Record<
  string,
  { default: IconComponent } | IconComponent
>;

export const iconComponents: Record<string, IconComponent> = {};
for (const path in componentMods) {
  const mod = componentMods[path] as any;
  const name = path.split('/').pop()?.replace('.svg?react', '').replace('.svg', '') ?? path;
  iconComponents[name] = (mod?.default ?? mod) as IconComponent;
}

// Raw URLs fallback in case SVGR fails
const urlMods = (import.meta as any).glob('/src_ts/assets/icons/*.svg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
export const iconUrls: Record<string, string> = {};
for (const path in urlMods) {
  const name = path.split('/').pop()?.replace('.svg', '') ?? path;
  iconUrls[name] = urlMods[path];
}

export const availableIcons = Array.from(new Set([ ...Object.keys(iconComponents), ...Object.keys(iconUrls) ]));
