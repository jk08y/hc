// src/components/common/Loading.jsx
import React from 'react';

const Loading = ({ 
  size = 'md', 
  color = 'primary',
  text = '',
  fullScreen = false,
  className = '' 
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4'
  };
  
  // Color classes
  const colorClasses = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    white: 'border-white',
    gray: 'border-gray-300 dark:border-gray-600'
  };
  
  // Add transparent border for the spinner effect
  const borderClass = `${colorClasses[color]} border-t-transparent`;
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-dark/80 backdrop-blur-sm">
        <div
          className={`
            rounded-full animate-spin
            ${sizeClasses[size]}
            ${borderClass}
            ${className}
          `}
        />
        {text && (
          <p className="mt-4 text-gray-700 dark:text-gray-300">{text}</p>
        )}
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`
          rounded-full animate-spin
          ${sizeClasses[size]}
          ${borderClass}
        `}
      />
      {text && (
        <p className="mt-2 text-gray-700 dark:text-gray-300 text-sm">{text}</p>
      )}
    </div>
  );
};

export default Loading;