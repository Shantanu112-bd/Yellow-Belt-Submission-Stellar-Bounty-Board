import { HTMLAttributes, forwardRef } from 'react';
import { cn } from './ui/utils';

export interface BountyCardProps extends HTMLAttributes<HTMLDivElement> {
  shadow?: 'sm' | 'md' | 'lg';
  gradient?: boolean;
  hover?: boolean;
}

export const BountyCard = forwardRef<HTMLDivElement, BountyCardProps>(
  ({ className, shadow = 'md', gradient = false, hover = false, children, ...props }, ref) => {
    const shadows = {
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl bg-card border border-border/50 overflow-hidden',
          'transition-all duration-300',
          'flex flex-col h-full', // Added for mobile/responsive layout
          shadows[shadow],
          gradient && 'bg-gradient-to-br from-primary/5 to-secondary/5',
          hover && 'hover:shadow-xl hover:scale-[1.01] hover:border-primary/30',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BountyCard.displayName = 'BountyCard';

export const BountyCardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-6 space-y-1.5', className)}
      {...props}
    />
  )
);

BountyCardHeader.displayName = 'BountyCardHeader';

export const BountyCardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('font-bold text-xl text-card-foreground', className)}
      {...props}
    />
  )
);

BountyCardTitle.displayName = 'BountyCardTitle';

export const BountyCardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
);

BountyCardDescription.displayName = 'BountyCardDescription';

export const BountyCardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-6 pt-0', className)}
      {...props}
    />
  )
);

BountyCardContent.displayName = 'BountyCardContent';

export const BountyCardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
);

BountyCardFooter.displayName = 'BountyCardFooter';
