import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { cn } from './ui/utils';

export interface BountyInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
}

export const BountyInput = forwardRef<HTMLInputElement, BountyInputProps>(
  ({ className, label, error, success, type = 'text', ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);
    
    const handleFocus = () => setIsFocused(true);
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(!!e.target.value);
      props.onBlur?.(e);
    };
    
    const hasError = !!error;
    const isFloating = isFocused || hasValue;
    
    return (
      <div className="relative w-full">
        <div className="relative">
          <input
            ref={ref}
            type={type}
            className={cn(
              'w-full px-4 py-3 text-base bg-input-background border-2 rounded-lg',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'placeholder:text-transparent',
              hasError && 'border-error focus:ring-error',
              success && 'border-success focus:ring-success',
              !hasError && !success && 'border-input focus:border-primary focus:ring-primary/20',
              className
            )}
            placeholder={label || props.placeholder}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          
          {label && (
            <label
              className={cn(
                'absolute left-4 transition-all duration-200 pointer-events-none',
                'text-muted-foreground',
                isFloating
                  ? 'top-1 text-xs font-medium'
                  : 'top-1/2 -translate-y-1/2 text-base',
                isFocused && 'text-primary',
                hasError && 'text-error',
                success && 'text-success'
              )}
            >
              {label}
            </label>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-xs text-error font-medium">{error}</p>
        )}
        
        {success && !error && (
          <p className="mt-1 text-xs text-success font-medium">Looks good!</p>
        )}
      </div>
    );
  }
);

BountyInput.displayName = 'BountyInput';
