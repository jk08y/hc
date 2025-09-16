// src/pages/Premium.jsx
import React, { useState } from 'react';
import { usePremium } from '../hooks/usePremium';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Premium = () => {
  // **THE FIX**: The component is now much simpler. It just calls the hook
  // and reacts to the `paymentStatus`.
  const { initiatePayment, loading, paymentStatus, setPaymentStatus } = usePremium();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const navigate = useNavigate();

  const plans = {
    monthly: { type: 'monthly', amount: 99, price: 'KES 99/mo', save: null },
    yearly: { type: 'yearly', amount: 999, price: 'KES 999/yr', save: 'Save 17%' }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!/^(07|01)\d{8}$/.test(phoneNumber)) {
      setPhoneError('Please enter a valid Safaricom number (e.g., 0712345678).');
      return;
    }
    setPhoneError('');
    await initiatePayment(phoneNumber, plans[selectedPlan]);
  };

  const handleModalClose = () => {
    const isSuccess = paymentStatus === 'success';
    // Reset the status to 'idle', which will close the modal.
    setPaymentStatus('idle');
    if (isSuccess) {
      navigate('/settings'); // Navigate to a different page on success.
    }
  };

  return (
    <>
      <div className="max-w-md mx-auto p-4 sm:p-6">
          <div className="text-center">
              <h1 className="text-3xl font-extrabold mb-2">Subscribe to Premium</h1>
              <p className="text-secondary mb-8">Choose a plan to unlock exclusive features and get verified.</p>
          </div>

          <div className="flex gap-4 mb-8">
              {Object.keys(plans).map(planKey => (
                  <div
                      key={planKey}
                      onClick={() => setSelectedPlan(planKey)}
                      className={`flex-1 p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedPlan === planKey ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-dark-border hover:border-primary/50'}`}
                  >
                      <h2 className="font-bold text-lg capitalize">{plans[planKey].type}</h2>
                      <p className="font-bold text-2xl my-1">{plans[planKey].price}</p>
                      {plans[planKey].save && <p className="text-sm text-green-600 font-semibold">{plans[planKey].save}</p>}
                  </div>
              ))}
          </div>

          <form onSubmit={handlePayment} className="p-6 border dark:border-dark-border rounded-2xl bg-white dark:bg-dark-light">
            <h2 className="font-bold text-xl">Complete Payment</h2>
            <Input
              type="tel"
              label="M-Pesa Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="0712345678"
              error={phoneError}
              disabled={loading}
              required
            />
            <Button type="submit" variant="primary" fullWidth disabled={loading} className="mt-4 py-3 text-base">
              {loading ? 'Processing...' : `Pay ${plans[selectedPlan].price}`}
            </Button>
          </form>
      </div>

      {/* This modal's visibility is controlled by `paymentStatus` not being 'idle'.
          It shows different content based on the status.
      */}
      <Modal
        isOpen={paymentStatus !== 'idle'}
        onClose={handleModalClose}
        closeOnOverlayClick={paymentStatus !== 'pending'}
        showCloseButton={paymentStatus !== 'pending'}
      >
        {paymentStatus === 'pending' && (
            <div className="text-center p-8 flex flex-col items-center justify-center min-h-[250px]">
                <Loading text="Check your phone to complete the M-Pesa payment..." size="lg" />
                <p className="text-sm text-secondary mt-4">Waiting for payment confirmation...</p>
                <p className="text-xs text-secondary mt-2">(This may take up to 1 minute)</p>
            </div>
        )}
        {paymentStatus === 'success' && (
            <div className="text-center p-8 flex flex-col items-center justify-center min-h-[250px]">
                <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
                <h3 className="text-2xl font-bold">Payment Successful!</h3>
                <p className="text-secondary mt-2">Your account is now verified. Enjoy the premium benefits!</p>
                <Button variant="primary" onClick={handleModalClose} className="mt-6">
                    Awesome!
                </Button>
            </div>
        )}
        {paymentStatus === 'error' && (
             <div className="text-center p-8 flex flex-col items-center justify-center min-h-[250px]">
                <FaTimesCircle className="text-danger text-6xl mx-auto mb-4" />
                <h3 className="text-2xl font-bold">Payment Failed</h3>
                <p className="text-secondary mt-2">The payment was not completed. This could be due to a timeout or cancellation on your phone.</p>
                <Button variant="outline" onClick={handleModalClose} className="mt-6">
                    Try Again
                </Button>
            </div>
        )}
      </Modal>
    </>
  );
};

export default Premium;
