import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClass = 'modern-button';
  
  const variantClasses = {
    primary: 'modern-button--primary',
    secondary: 'modern-button--secondary',
    outline: 'modern-button--outline',
  };

  const sizeClasses = {
    sm: 'modern-button--sm',
    md: 'modern-button--md', 
    lg: 'modern-button--lg',
  };

  const classes = `${baseClass} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <div className="loading-spinner-sm mr-2"></div>
      )}
      {children}
    </button>
  );
};
