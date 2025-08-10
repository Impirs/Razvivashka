import React from 'react';
import { iconComponents, iconUrls } from './iconMap';

export type IconProps = React.SVGProps<SVGSVGElement> & {
	// Icon file name without extension, e.g., "home", "play"
	name: string;
	// Width/height convenience prop. Accepts number (px) or any CSS size string.
	size?: number | string;
	// Sets CSS `color`; works with icons using currentColor for fill/stroke.
	color?: string;
	// When true, render a span with id=name so mask styles from icons.scss apply
	masked?: boolean;
};

function Icon({ name, size = 24, color = 'currentColor', className, style, masked = false, ...rest }: IconProps) {
	const Svg = iconComponents[name];
	const url = iconUrls[name];

	const sizeStyle = typeof size === 'number' ? `${size}px` : size;

	// Masked variant: rely on `#<name>` mask rules from styles/_icons.scss
	if (masked) {
		return (
			<span
				id={name}
				className={className}
				style={{ width: sizeStyle, height: sizeStyle, display: 'inline-block', verticalAlign: 'middle', ...style }}
				aria-hidden={true}
			/>
		);
	}

	// Prefer SVG React component when available
	if (Svg) {
		return (
			<Svg
				className={className}
				style={{ width: sizeStyle, height: sizeStyle, color, display: 'inline-block', verticalAlign: 'middle', ...style }}
				focusable={rest.focusable ?? false}
				aria-hidden={rest['aria-label'] ? undefined : (rest['aria-hidden'] ?? true)}
				{...rest}
			/>
		);
	}

	// Fallback to <img src> when there is no React component
	if (url) {
		return (
			<img
				src={url}
				alt=""
				className={className}
				style={{ width: sizeStyle, height: sizeStyle, display: 'inline-block', verticalAlign: 'middle', ...style }}
				aria-hidden={rest['aria-label'] ? undefined : true}
			/>
		);
	}

	// In dev, log available icons from both sources
	if (process.env.NODE_ENV !== 'production') {
		const fromComponents = Object.keys(iconComponents);
		const fromUrls = Object.keys(iconUrls ?? {});
		const all = Array.from(new Set([ ...fromComponents, ...fromUrls ]));
		console.warn(`[Icon] Unknown icon: "${name}". Available: ${all.join(', ')}`);
	}

	return null;
}

export default Icon;

// Export the list of available icon names at runtime
export const availableIcons = Object.keys(iconComponents);

