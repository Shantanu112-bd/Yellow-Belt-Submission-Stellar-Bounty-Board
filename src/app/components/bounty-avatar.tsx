import { HTMLAttributes, forwardRef } from 'react';
import { cn } from './ui/utils';
import { User } from 'lucide-react';

export interface BountyAvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
}

export const BountyAvatar = forwardRef<HTMLDivElement, BountyAvatarProps>(
  ({ className, src, alt, size = 'md', fallback, ...props }, ref) => {
    const sizes = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
      xl: 'w-16 h-16 text-xl',
    };
    
    const iconSizes = {
      sm: 16,
      md: 20,
      lg: 24,
      xl: 32,
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center rounded-full overflow-hidden',
          'bg-gradient-to-br from-primary to-secondary',
          'ring-2 ring-background shadow-md',
          sizes[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || 'Avatar'}
            className="w-full h-full object-cover"
          />
        ) : fallback ? (
          <span className="font-semibold text-white uppercase">
            {fallback}
          </span>
        ) : (
          <User size={iconSizes[size]} className="text-white" />
        )}
      </div>
    );
  }
);

BountyAvatar.displayName = 'BountyAvatar';
