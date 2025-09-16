// src/components/common/Input.jsx
import React, { useState } from 'react';

const Input = ({
  type = 'text',
  label = '',
  name,
  value,
  onChange,
  placeholder = '',
  error = '',
  className = '',
  disabled = false,
  required = false,
  icon = null,
  endIcon = null,
  autoFocus = false,
  maxLength,
  onFocus,
  onBlur,
  onKeyDown
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };
  
  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };
  
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      
      <div className={`
        relative flex items-center
        bg-white dark:bg-dark-light
        border rounded-lg
        ${error ? 'border-danger' : 'border-secondary-light dark:border-dark-border'}
        ${isFocused ? 'ring-1 ring-primary' : ''}
        ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
      `}>
        {icon && (
          <span className="absolute left-2.5 text-gray-500 dark:text-gray-400">
            {React.cloneElement(icon, { className: 'w-4 h-4 sm:w-5 sm:h-5' })}
          </span>
        )}
        
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          maxLength={maxLength}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={onKeyDown}
          className={`
            w-full
            py-2 px-3 sm:px-4
            bg-transparent
            text-gray-900 dark:text-white
            placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none
            disabled:cursor-not-allowed
            text-sm sm:text-base
            ${icon ? 'pl-8 sm:pl-10' : ''}
            ${endIcon ? 'pr-8 sm:pr-10' : ''}
          `}
        />
        
        {endIcon && (
          <span className="absolute right-2.5 text-gray-500 dark:text-gray-400">
            {React.cloneElement(endIcon, { className: 'w-4 h-4 sm:w-5 sm:h-5' })}
          </span>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-xs sm:text-sm text-danger">{error}</p>
      )}
      
      {maxLength && (
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
          {value ? value.length : 0}/{maxLength}
        </div>
      )}
    </div>
  );
};

export default Input;