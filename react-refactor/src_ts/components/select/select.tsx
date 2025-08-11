import React from 'react';
import { cn } from '@/utils/cn';
import { useLanguage } from '@/contexts/i18n';

export type SelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value' | 'defaultValue' | 'children'> & {
	// Required list of option values (string ids)
	options: string[];
	// Controlled value
	value?: string;
	// Uncontrolled initial value
	defaultValue?: string;
	// Accessible label for the select element
	ariaLabel: string;
	// Optional className to extend styling
	className?: string;
	// Translate option labels using prefix.key (e.g., types.math). Defaults to 'types'
	translationKeyPrefix?: string;
	// Provide a custom label renderer for options. If given, it overrides i18n translation.
	renderOptionLabel?: (opt: string) => string;
	// Convenience callback that receives only the selected value
	onValueChange?: (value: string) => void;
	// Native onChange is also supported for drop-in usage
	onChange?: React.ChangeEventHandler<HTMLSelectElement>;
};

function Select({
	options,
	value,
	defaultValue,
	ariaLabel,
	className,
	translationKeyPrefix = 'types',
	renderOptionLabel,
	onValueChange,
	onChange,
	...rest
}: SelectProps) {
	const { t } = useLanguage();

	const handleChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
		onChange?.(e);
		onValueChange?.(e.target.value);
	};

	return (
		<select
			aria-label={ariaLabel}
			value={value}
			defaultValue={defaultValue}
			onChange={handleChange}
			className={cn('ui-select', className)}
			{...rest}
		>
			{options.map((opt) => (
				<option key={opt} value={opt}>
					{renderOptionLabel ? renderOptionLabel(opt) : t(`${translationKeyPrefix}.${opt}` as any)}
				</option>
			))}
		</select>
	);
}

export default Select;