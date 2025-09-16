// src/components/common/Lightbox.jsx
import React from 'react';
import { IoMdClose } from 'react-icons/io';
import { useUI } from '../../hooks/useUI';

const Lightbox = () => {
  const { lightboxImage, closeLightbox } = useUI();

  if (!lightboxImage) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity"
      onClick={closeLightbox}
    >
      <button
        className="absolute top-4 right-4 p-2 text-white bg-black/50 rounded-full hover:bg-black/70 z-50"
        onClick={closeLightbox}
        aria-label="Close image view"
      >
        <IoMdClose size={24} />
      </button>
      <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        <img
          src={lightboxImage}
          alt="Enlarged view"
          className="max-w-full max-h-full object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
        />
      </div>
    </div>
  );
};

export default Lightbox;
