// src/components/common/Button.jsx
import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  rounded = 'full',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  icon = null,
  iconPosition = 'left'
}) => {
  // Variant classes
  const variantClasses = {
    primary: 'bg-primary hover:bg-primary-dark text-white',
    secondary: 'bg-secondary hover:bg-secondary/90 text-white',
    outline: 'border border-primary text-primary hover:bg-primary/10',
    danger: 'bg-danger hover:bg-danger/90 text-white',
    ghost: 'bg-transparent hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200',
    link: 'bg-transparent text-primary hover:underline p-0'
  };
  
  // Size classes
  const sizeClasses = {
    xs: 'text-xs py-1 px-2',
    sm: 'text-xs sm:text-sm py-1.5 px-3',
    md: 'text-sm sm:text-base py-2 px-4',
    lg: 'text-base sm:text-lg py-2 sm:py-2.5 px-4 sm:px-5',
    xl: 'text-lg sm:text-xl py-2.5 sm:py-3 px-5 sm:px-6'
  };
  
  // Rounded classes
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };
  
  // Icon spacing
  const iconSpacing = icon ? (iconPosition === 'left' ? 'space-x-1 sm:space-x-2' : 'space-x-reverse space-x-1 sm:space-x-2') : '';
  
  const buttonClasses = `
    inline-flex items-center justify-center
    font-medium
    transition-colors
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${roundedClasses[rounded]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;
  
  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
    >
      <span className={`flex items-center ${iconSpacing} ${iconPosition === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children && <span>{children}</span>}
      </span>
    </button>
  );
};

export default Button;