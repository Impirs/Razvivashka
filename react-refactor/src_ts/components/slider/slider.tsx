import React from 'react';

export type SliderProps = {
	value: number;
	min?: number;
	max?: number;
	step?: number;
	disabled?: boolean;
	ariaLabel?: string;
	className?: string;
	onChange: (value: number) => void;
};

export const Slider = ({
	value,
	min = 0,
	max = 100,
	step = 1,
	disabled = false,
	ariaLabel,
	className = '',
	onChange,
} : SliderProps) => {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const next = Number(e.target.value);
		if (!Number.isNaN(next)) onChange(next);
	};

	return (
		<div className={`ui-slider ${className}`.trim()}>
			<input
				className="ui-slider__input"
				type="range"
				role="slider"
				aria-label={ariaLabel}
				aria-valuemin={min}
				aria-valuemax={max}
				aria-valuenow={value}
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={handleChange}
				disabled={disabled}
			/>
		</div>
	);
};

export default Slider;
