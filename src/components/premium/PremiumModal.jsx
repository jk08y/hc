// src/components/premium/PremiumModal.jsx
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../hooks/useUI';
import { usePremium } from '../../hooks/usePremium';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Loading from '../common/Loading';
import { FaCheckCircle, FaStar } from 'react-icons/fa';

const PremiumModal = ({ isOpen, onClose }) => {
  const { showToast } = useUI();
  const { 
    initiatePayment, 
    loading, 
    paymentStatus 
  } = usePremium();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const handlePayment = async () => {
    // Basic Safaricom number validation
    if (!/^(07|01)\d{8}$/.test(phoneNumber)) {
      setPhoneError('Please enter a valid Safaricom number (e.g., 0712345678).');
      return;
    }
    setPhoneError('');
    await initiatePayment(phoneNumber);
  };

  const renderContent = () => {
    if (paymentStatus === 'pending') {
      return (
        <div className="text-center p-8 flex flex-col items-center justify-center min-h-[300px]">
          <Loading text="Check your phone to complete the M-Pesa payment..." size="lg" />
          <p className="text-sm text-secondary mt-4">Waiting for payment confirmation...</p>
        </div>
      );
    }

    if (paymentStatus === 'success') {
      return (
        <div className="text-center p-8 flex flex-col items-center justify-center min-h-[300px]">
          <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Payment Successful!</h3>
          <p className="text-secondary mt-2">You are now verified. Enjoy your premium features!</p>
          <Button variant="primary" onClick={onClose} className="mt-6">
            Awesome!
          </Button>
        </div>
      );
    }

    return (
      <div className="p-4 sm:p-6">
        <div className="text-center">
            <img src="/logo.svg" alt="HeyChat Logo" className="w-10 h-10 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Subscribe to Premium</h2>
            <p className="text-secondary mb-6">Unlock exclusive features and show your support.</p>
        </div>
        
        <div className="space-y-4 bg-gray-50 dark:bg-dark-border p-4 rounded-lg">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Premium Benefits</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-center"><FaCheckCircle className="text-primary mr-2" /> Verified badge on your profile</li>
                <li className="flex items-center"><FaStar className="text-yellow-400 mr-2" /> Priority in conversations</li>
                <li className="flex items-center"><FaCheckCircle className="text-primary mr-2" /> Support the platform</li>
            </ul>
        </div>

        <div className="mt-6 p-4 border dark:border-dark-border rounded-lg">
          <h3 className="font-bold text-gray-900 dark:text-white">Subscribe Monthly</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white my-2">
            KES 15<span className="text-base font-normal text-secondary">/mo</span>
          </p>
          <Input
            type="tel"
            label="M-Pesa Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="0712345678"
            error={phoneError}
            disabled={loading}
          />
          <Button variant="primary" fullWidth onClick={handlePayment} disabled={loading} className="mt-4">
            {loading ? 'Processing...' : 'Pay with M-Pesa'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" className="p-0">
      {renderContent()}
    </Modal>
  );
};

export default PremiumModal;
