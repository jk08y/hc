// src/components/common/ImageWithLoader.jsx
import React, { useState } from 'react';

const ImageWithLoader = ({ src, alt, className, onClick }) => {
  const [loading, setLoading] = useState(true);

  return (
    <div className={`relative ${className}`} onClick={onClick}>
      {loading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-dark-border animate-pulse"></div>
      )}
      <img
        src={src}
        alt={alt}
        className={`transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'} ${className}`}
        onLoad={() => setLoading(false)}
        onError={() => setLoading(false)} // Also stop loading on error
        loading="lazy" // Improves performance by deferring off-screen image loading
      />
    </div>
  );
};

export default ImageWithLoader;
