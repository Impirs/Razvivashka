import React, { ReactNode, ButtonHTMLAttributes } from 'react';
import Icon from '@/components/icon/icon';
import { cn } from '../../utils/cn';
// Use SCSS classes from src_ts/styles/components/_buttons.scss

export type ButtonSize = 'large' | 'small'; // | 'text' ?

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    // Optional children to render inside the label
    children?: ReactNode;
    // Button size aka visual appearance preset
    size?: ButtonSize;
    // icon name from assets (without extension)
    leftIcon?: string;
    // render only the icon (use with size="small")
    iconOnly?: boolean;
};

function Button({ children, size = 'large', leftIcon, iconOnly = false, className, ...props }: ButtonProps) {
     const classes = cn('ui-button', size, className);
     const showLabel = !iconOnly && children != null;

    return (
         <button className={classes} {...props}>
            {leftIcon && (
                <span className={cn('nav-btn-icon', 'ui-button__icon')} aria-hidden>
                    <Icon name={leftIcon} masked />
                </span>
            )}
            {showLabel && <h2 className={cn('ui-button__label')}>{children}</h2>}
        </button>
    );
}

export default Button;
