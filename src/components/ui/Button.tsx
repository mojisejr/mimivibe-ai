import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'mystical';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className = '', ...props }, ref) => {
    const baseClasses = 'btn transition-all duration-200 ease-in-out';
    
    const variantClasses = {
      primary: 'btn-primary',
      secondary: 'btn-secondary', 
      accent: 'btn-accent',
      ghost: 'btn-ghost',
      outline: 'btn-outline',
      mystical: 'btn-mystical'
    };

    const sizeClasses = {
      sm: 'btn-sm',
      md: '',
      lg: 'btn-lg'
    };

    const classes = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      loading && 'loading',
      className
    ].filter(Boolean).join(' ');

    return (
      <button
        ref={ref}
        className={classes}
        disabled={loading}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';