// src/context/UIContext.jsx
import React, { createContext, useState } from 'react';

export const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  // **THE FIX**: State to hold the post/comment being replied to.
  const [replyingTo, setReplyingTo] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('for-you');
  const [lightboxImage, setLightboxImage] = useState(null);
  const [confirmation, setConfirmation] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showToast = (message, type = 'info', duration = 3000) => {
    setToastMessage({ text: message, type, id: Date.now() });
  };

  const openAuthModal = () => setShowAuthModal(true);
  const closeAuthModal = () => setShowAuthModal(false);
  
  // **THE FIX**: Updated functions to handle the reply state.
  const openComposer = (postToReply = null) => {
    setReplyingTo(postToReply); // Set the post to reply to, or null for a new post
    setIsComposerOpen(true);
  };

  const closeComposer = () => {
    setIsComposerOpen(false);
    setReplyingTo(null); // Clear the reply state when closing
  };
  
  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const openLightbox = (imageUrl) => setLightboxImage(imageUrl);
  const closeLightbox = () => setLightboxImage(null);

  const showConfirmation = (title, message, onConfirm, confirmText = 'Confirm', confirmVariant = 'danger') => {
    setConfirmation({ isOpen: true, title, message, onConfirm, confirmText, confirmVariant });
  };
  const closeConfirmation = () => {
    setConfirmation({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  };

  const value = {
    showAuthModal,
    openAuthModal,
    closeAuthModal,
    toastMessage,
    showToast,
    isComposerOpen,
    openComposer,
    closeComposer,
    replyingTo, // Expose the replyingTo state
    isMobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu,
    currentTab,
    setCurrentTab,
    lightboxImage,
    openLightbox,
    closeLightbox,
    confirmation,
    showConfirmation,
    closeConfirmation,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};
