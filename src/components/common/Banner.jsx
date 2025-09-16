// src/components/common/Banner.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTimes, FaStar } from 'react-icons/fa';

const Banner = ({ id, text, linkTo, linkText }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check localStorage to see if the user has already dismissed this banner.
    const dismissed = localStorage.getItem(`banner_${id}_dismissed`);
    if (!dismissed) {
      setIsVisible(true);
    }
  }, [id]);

  const handleDismiss = () => {
    // Hide the banner and save the dismissed state to localStorage.
    setIsVisible(false);
    localStorage.setItem(`banner_${id}_dismissed`, 'true');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-primary text-white text-sm relative z-40">
      {/* **THE FIX**: The container now centers its content on all screen sizes. */}
      <div className="container mx-auto flex items-center justify-center px-4 py-2">
        <div className="flex-1 text-center">
          <FaStar className="mr-2 inline-block align-middle" />
          <span className="align-middle">{text}</span>
          <Link to={linkTo} className="font-bold underline ml-1 sm:ml-2 hover:opacity-80 transition-opacity align-middle">
            {linkText}
          </Link>
        </div>
        <button 
          onClick={handleDismiss} 
          className="ml-4 p-2 rounded-full hover:bg-black/20 flex-shrink-0"
          aria-label="Dismiss banner"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default Banner;
