import React, { ReactNode, ButtonHTMLAttributes } from 'react';
import Icon from '@/components/icon/icon';
import { cn } from '../../lib/cn';
// Use SCSS classes from src_ts/styles/components/_buttons.scss

export type ButtonSize = 'large' | 'small';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
     children?: ReactNode;
     size?: ButtonSize;
     leftIcon?: string; // icon name from assets (without extension)
     iconOnly?: boolean; // render only the icon (use with size="small")
};

function Button({ children, size = 'large', leftIcon, iconOnly = false, className, ...props }: ButtonProps) {
     const classes = cn('ui-button', 'nav-button', size, className);
     const showLabel = !iconOnly && children != null;

     return (
          <button className={classes} {...props}>
              {leftIcon && (
                   <span className={cn('nav-btn-icon', 'ui-button__icon')} aria-hidden>
                        <Icon name={leftIcon} masked size={48} />
                   </span>
              )}
     {showLabel && <h2 className={cn('ui-button__label')}>{children}</h2>}
          </button>
     );
}

export default Button;
