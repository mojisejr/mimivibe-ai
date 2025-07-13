import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'mystical';
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ variant = 'default', error, label, className = '', ...props }, ref) => {
    const baseClasses = 'input w-full transition-all duration-200';
    
    const variantClasses = {
      default: 'input-bordered',
      mystical: 'input-mystical'
    };

    const errorClasses = error ? 'input-error' : '';

    const classes = [
      baseClasses,
      variantClasses[variant],
      errorClasses,
      className
    ].filter(Boolean).join(' ');

    return (
      <div className="form-control w-full">
        {label && (
          <label className="label">
            <span className="label-text">{label}</span>
          </label>
        )}
        <input
          ref={ref}
          className={classes}
          {...props}
        />
        {error && (
          <label className="label">
            <span className="label-text-alt text-error">{error}</span>
          </label>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'mystical';
  error?: string;
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ variant = 'default', error, label, className = '', ...props }, ref) => {
    const baseClasses = 'textarea w-full transition-all duration-200';
    
    const variantClasses = {
      default: 'textarea-bordered',
      mystical: 'textarea-mystical'
    };

    const errorClasses = error ? 'textarea-error' : '';

    const classes = [
      baseClasses,
      variantClasses[variant],
      errorClasses,
      className
    ].filter(Boolean).join(' ');

    return (
      <div className="form-control w-full">
        {label && (
          <label className="label">
            <span className="label-text">{label}</span>
          </label>
        )}
        <textarea
          ref={ref}
          className={classes}
          {...props}
        />
        {error && (
          <label className="label">
            <span className="label-text-alt text-error">{error}</span>
          </label>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';