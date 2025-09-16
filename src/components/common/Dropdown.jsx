// src/components/common/Dropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import { IoMdArrowDropdown } from 'react-icons/io';

const Dropdown = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
  error = '',
  icon = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);
  
  // Find the selected option
  const selectedOption = options.find(option => option.value === value);
  
  // Toggle dropdown
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };
  
  // Handle option select
  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <div
        className={`
          flex items-center justify-between
          w-full p-2 sm:p-2.5 px-3 sm:px-4
          bg-white dark:bg-dark-light
          border rounded-lg cursor-pointer
          ${error ? 'border-danger' : 'border-secondary-light dark:border-dark-border'}
          ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-primary'}
          text-sm sm:text-base
        `}
        onClick={toggleDropdown}
      >
        <div className="flex items-center min-w-0">
          {icon && (
            <span className="mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0">
              {React.cloneElement(icon, { className: 'w-4 h-4 sm:w-5 sm:h-5' })}
            </span>
          )}
          
          <span className={`
            truncate
            ${!selectedOption ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}
          `}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        
        <IoMdArrowDropdown className={`
          text-gray-500 dark:text-gray-400 transform transition-transform duration-200 flex-shrink-0
          ${isOpen ? 'rotate-180' : ''}
          w-5 h-5 sm:w-6 sm:h-6
        `} />
      </div>
      
      {error && (
        <p className="mt-1 text-xs sm:text-sm text-danger">{error}</p>
      )}
      
      {isOpen && (
        <div className="
          absolute z-10 w-full mt-1
          bg-white dark:bg-dark-light
          border border-secondary-light dark:border-dark-border
          rounded-lg shadow-lg
          max-h-48 sm:max-h-60 overflow-y-auto
        ">
          {options.length > 0 ? (
            options.map((option) => (
              <div
                key={option.value}
                className={`
                  p-2 sm:p-2.5 px-3 sm:px-4 cursor-pointer
                  ${option.value === value ? 'bg-primary/10 text-primary' : 'text-gray-700 dark:text-gray-300'}
                  hover:bg-gray-100 dark:hover:bg-dark-border
                  text-sm sm:text-base
                `}
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="p-2 sm:p-2.5 px-3 sm:px-4 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
              No options available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dropdown;