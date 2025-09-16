// src/components/common/Notifications.jsx
import React, { useState, useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';
import { 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaInfoCircle, 
  FaExclamationTriangle 
} from 'react-icons/fa';
import { useUI } from '../../hooks/useUI';

const Toast = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Animate in and set auto-close timer
  useEffect(() => {
    // Animate in
    setIsVisible(true);

    const timer = setTimeout(() => {
      handleClose();
    }, 5000); // Increased duration to 5 seconds for better readability
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  const handleClose = () => {
    setIsVisible(false);
    // Wait for the fade-out animation to complete before removing from DOM
    setTimeout(() => {
      onClose();
    }, 300); 
  };

  const theme = {
    success: {
      icon: <FaCheckCircle className="text-green-500" />,
      bg: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-500/30',
    },
    error: {
      icon: <FaExclamationCircle className="text-red-500" />,
      bg: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-500/30',
    },
    info: {
      icon: <FaInfoCircle className="text-blue-500" />,
      bg: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-500/30',
    },
    warning: {
      icon: <FaExclamationTriangle className="text-yellow-500" />,
      bg: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-500/30',
    }
  };
  
  const currentTheme = theme[type] || theme.info;
  
  return (
    <div 
      role="alert"
      aria-live="assertive"
      className={`
        flex items-start justify-between
        w-full max-w-xs sm:max-w-sm
        p-3 mb-3
        border rounded-lg shadow-lg
        transform transition-all duration-300 ease-in-out
        ${currentTheme.bg}
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
      `}
    >
      <div className="flex items-start min-w-0">
        <div className="flex-shrink-0 w-5 h-5 mt-0.5">
          {currentTheme.icon}
        </div>
        <div className="ml-3 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">
            {message}
          </p>
        </div>
      </div>
      <button
        type="button"
        className="ml-3 -mr-1 -mt-1 p-1 flex-shrink-0 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-black/10 dark:hover:bg-white/10"
        onClick={handleClose}
        aria-label="Close notification"
      >
        <IoMdClose className="w-5 h-5" />
      </button>
    </div>
  );
};

const Notifications = () => {
  const { toastMessage } = useUI();
  const [toasts, setToasts] = useState([]);
  
  // Add new toast when global toastMessage changes
  useEffect(() => {
    if (toastMessage) {
      // Prevent duplicate toasts from appearing in quick succession
      setToasts(prev => {
        if (prev.find(t => t.id === toastMessage.id)) return prev;
        return [...prev, toastMessage];
      });
    }
  }, [toastMessage]);
  
  // Remove toast by its ID
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  if (toasts.length === 0) return null;
  
  return (
    // **THE FIX**: Increased z-index to ensure it's on top of modals (which are z-50)
    <div className="fixed top-5 right-5 z-[100] flex flex-col items-end pointer-events-none">
      <div className="pointer-events-auto">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.text}
            type={toast.type || 'info'}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Notifications;
