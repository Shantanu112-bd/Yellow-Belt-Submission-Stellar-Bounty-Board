import { HTMLAttributes, forwardRef } from 'react';
import { cn } from './ui/utils';

export interface BountyBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'status' | 'category' | 'new' | 'success' | 'error' | 'warning';
}

export const BountyBadge = forwardRef<HTMLSpanElement, BountyBadgeProps>(
  ({ className, variant = 'status', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-200';
    
    const variants = {
      status: 'bg-primary/10 text-primary border border-primary/20',
      category: 'bg-secondary/10 text-secondary border border-secondary/20',
      new: 'bg-gradient-to-r from-accent to-warning text-white shadow-md',
      success: 'bg-success/10 text-success border border-success/20',
      error: 'bg-error/10 text-error border border-error/20',
      warning: 'bg-warning/10 text-warning border border-warning/20',
    };
    
    return (
      <span
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

BountyBadge.displayName = 'BountyBadge';
