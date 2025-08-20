import React from 'react';
import { cn } from '@/utils/cn';
import { useTranslationFunction } from '@/hooks/useSelectiveContext';

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

const Select = React.memo<SelectProps>(({
	options,
	value,
	defaultValue,
	ariaLabel,
	className,
	translationKeyPrefix = 'types',
	renderOptionLabel,
	onValueChange,
	onChange,
	disabled,
}) => {
	const t = useTranslationFunction();

	const isControlled = value !== undefined;
	const [open, setOpen] = React.useState(false);
	const [internalValue, setInternalValue] = React.useState<string | undefined>(defaultValue);
	const selectedValue = isControlled ? value : internalValue;

	const initialIndex = Math.max(0, options.findIndex((o) => o === selectedValue));
	const [activeIndex, setActiveIndex] = React.useState<number>(initialIndex >= 0 ? initialIndex : 0);

	const buttonRef = React.useRef<HTMLButtonElement | null>(null);
	const listRef = React.useRef<HTMLUListElement | null>(null);
	const menuId = React.useId();
	const btnId = React.useId();

	const labelFor = React.useCallback((opt: string) => (
		renderOptionLabel ? renderOptionLabel(opt) : t(`${translationKeyPrefix}.${opt}` as any)
	), [renderOptionLabel, t, translationKeyPrefix]);

	const emitChange = React.useCallback((val: string) => {
		// call native onChange signature with a fabricated event to preserve API
		if (onChange) {
			const fakeEvent = {
				target: { value: val },
			} as unknown as React.ChangeEvent<HTMLSelectElement>;
			onChange(fakeEvent);
		}
		onValueChange?.(val);
	}, [onChange, onValueChange]);

	const commitValue = React.useCallback((val: string) => {
		if (!isControlled) setInternalValue(val);
		emitChange(val);
	}, [isControlled, emitChange]);

	const openMenu = React.useCallback(() => {
		if (disabled) return;
		setOpen(true);
		const idx = Math.max(0, options.findIndex((o) => o === (selectedValue ?? options[0])));
		setActiveIndex(idx >= 0 ? idx : 0);
		setTimeout(() => listRef.current?.focus(), 0);
	}, [disabled, options, selectedValue]);

	const closeMenu = React.useCallback((focusButton = true) => {
		setOpen(false);
		if (focusButton) setTimeout(() => buttonRef.current?.focus(), 0);
	}, []);

	const onButtonKeyDown: React.KeyboardEventHandler = React.useCallback((e) => {
		if (disabled) return;
		switch (e.key) {
			case 'ArrowDown':
			case 'Enter':
			case ' ': // Space
				e.preventDefault();
				openMenu();
				break;
		}
	}, [disabled, openMenu]);

	const onOptionClick = React.useCallback((idx: number) => {
		commitValue(options[idx]);
		closeMenu();
	}, [commitValue, options, closeMenu]);

	React.useEffect(() => {
		if (!open) return;
		const onDocClick = (ev: MouseEvent) => {
			const target = ev.target as Node;
			if (buttonRef.current?.contains(target)) return;
			if (listRef.current?.contains(target)) return;
			closeMenu(false);
		};
		document.addEventListener('mousedown', onDocClick);
		return () => document.removeEventListener('mousedown', onDocClick);
	}, [open, closeMenu]);

	const activeId = `${menuId}-opt-${activeIndex}`;

	return (
		<div className={cn('ui-selectbox', className)}>
			<button
				id={btnId}
				ref={buttonRef}
				type="button"
				className={cn('ui-selectbox__button', disabled && 'is-disabled')}
				role="combobox"
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-controls={menuId}
				aria-label={ariaLabel}
				aria-activedescendant={activeId}
				onClick={() => (open ? closeMenu(false) : openMenu())}
				onKeyDown={onButtonKeyDown}
				disabled={disabled}
			>
				{selectedValue ? labelFor(selectedValue) : labelFor(options[0])}
			</button>
		
			{open && (
				<ul
					id={menuId}
					ref={listRef}
					className="ui-selectbox__list"
					role="listbox"
					aria-labelledby={btnId}
					aria-activedescendant={activeId}
					tabIndex={-1}
				>
					{options.map((opt, idx) => {
						const selected = opt === selectedValue;
						const isActive = idx === activeIndex;
						return (
							<li
								id={`${menuId}-opt-${idx}`}
								key={opt}
								role="option"
								aria-selected={selected}
								className={cn(
									'ui-selectbox__option',
									selected && 'is-selected',
									isActive && 'is-active',
								)}
								onMouseEnter={() => setActiveIndex(idx)}
								onClick={() => onOptionClick(idx)}
							>
								{labelFor(opt)}
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
});

Select.displayName = 'Select';

export default Select;