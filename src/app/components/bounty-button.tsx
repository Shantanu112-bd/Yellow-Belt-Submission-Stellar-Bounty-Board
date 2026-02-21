import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from './ui/utils';

export interface BountyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const BountyButton = forwardRef<HTMLButtonElement, BountyButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2';

    const variants = {
      primary: 'bg-gradient-to-br from-primary to-purple-600 text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
      secondary: 'border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-white',
      ghost: 'text-foreground hover:bg-muted/50 hover:text-primary',
      outline: 'border border-border text-foreground bg-transparent hover:bg-muted',
      danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

BountyButton.displayName = 'BountyButton';
