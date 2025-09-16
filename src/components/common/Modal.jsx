// src/components/common/Modal.jsx
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IoMdClose } from 'react-icons/io';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = ''
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'max-w-xs w-full',
    md: 'max-w-md w-full',
    lg: 'max-w-lg w-full',
    xl: 'max-w-xl w-full',
    '2xl': 'max-w-2xl w-full',
    '3xl': 'max-w-3xl w-full',
    '4xl': 'max-w-4xl w-full',
    '5xl': 'max-w-5xl w-full',
    full: 'max-w-full w-full sm:max-w-md md:max-w-lg lg:max-w-3xl'
  };

  const modalRef = useRef(null);

  // Handle ESC key press
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      // Restore body scroll
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target) && closeOnOverlayClick) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, closeOnOverlayClick]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm transition-opacity p-4 sm:p-6"
      onClick={handleOverlayClick}
    >
      <div 
        ref={modalRef}
        className={`
          relative mx-auto my-8 bg-white dark:bg-dark-light rounded-xl shadow-xl
          transform transition-all duration-300 ease-in-out
          ${sizeClasses[size]}
          ${className}
        `}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-3 sm:p-4 border-b dark:border-dark-border">
            {title && (
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white pr-8">
                {title}
              </h3>
            )}
            {showCloseButton && (
              <button
                type="button"
                className="p-1 ml-auto bg-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-full absolute right-3 top-3"
                onClick={onClose}
                aria-label="Close"
              >
                <IoMdClose size={20} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-3 sm:p-4 overflow-y-auto max-h-[70vh]">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;