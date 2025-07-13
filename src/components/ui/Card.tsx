import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'mystical' | 'glass';
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', hoverable = true, children, className = '', ...props }, ref) => {
    const baseClasses = 'card bg-base-100 shadow-xl';
    
    const variantClasses = {
      default: '',
      mystical: 'card-mystical',
      glass: 'card-glass'
    };

    const hoverClasses = hoverable ? 'hover:shadow-2xl hover:-translate-y-1 transition-all duration-300' : '';

    const classes = [
      baseClasses,
      variantClasses[variant],
      hoverClasses,
      className
    ].filter(Boolean).join(' ');

    return (
      <div
        ref={ref}
        className={classes}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, className = '', ...props }, ref) => (
    <div ref={ref} className={`card-body ${className}`} {...props}>
      {children}
    </div>
  )
);

CardBody.displayName = 'CardBody';

export const CardActions = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, className = '', ...props }, ref) => (
    <div ref={ref} className={`card-actions ${className}`} {...props}>
      {children}
    </div>
  )
);

CardActions.displayName = 'CardActions';