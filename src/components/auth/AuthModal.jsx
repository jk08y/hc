// src/components/auth/AuthModal.jsx
import React, { useState } from 'react';
import { useUI } from '../../hooks/useUI';
import Modal from '../common/Modal';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const AuthModal = () => {
  const [activeTab, setActiveTab] = useState('login');
  const { showAuthModal, closeAuthModal } = useUI();
  
  const handleSuccess = () => {
    closeAuthModal();
  };
  
  const renderForm = () => {
    switch (activeTab) {
      case 'login':
        return (
          <LoginForm 
            onSwitchToSignup={() => setActiveTab('signup')}
            onSuccess={handleSuccess}
          />
        );
      case 'signup':
        return (
          <SignupForm 
            onSwitchToLogin={() => setActiveTab('login')}
            onSuccess={handleSuccess}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <Modal
      isOpen={showAuthModal}
      onClose={closeAuthModal}
      size="sm"
      className="p-0 max-w-sm w-full"
    >
      <div className="flex flex-col p-4 sm:p-6">
        {renderForm()}
      </div>
    </Modal>
  );
};

export default AuthModal;