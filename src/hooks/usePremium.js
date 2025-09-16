// src/hooks/usePremium.js
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useUI } from './useUI';
import { onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export const usePremium = () => {
  const { user } = useAuth();
  const { showToast } = useUI();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, pending, success, error

  useEffect(() => {
    if (paymentStatus !== 'pending' || !user) return;

    const unsub = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      const data = doc.data();
      if (data?.premium?.isVerified === true) {
        setPaymentStatus('success');
        unsub();
      }
    });

    const timeout = setTimeout(() => {
      unsub();
      if (paymentStatus === 'pending') {
        setPaymentStatus('error');
        showToast('Payment confirmation timed out. Please check your M-Pesa and try again.', 'error');
      }
    }, 120000); // 2 minute timeout

    return () => {
      unsub();
      clearTimeout(timeout);
    };

  }, [paymentStatus, user, showToast]);


  /**
   * Initiates the M-Pesa STK push and creates the temporary payment intent.
   * @param {string} phoneNumber - The user's M-Pesa phone number.
   * @param {object} plan - The selected subscription plan.
   */
  const initiatePayment = async (phoneNumber, plan) => {
    if (!user) {
        showToast('You must be logged in to subscribe.', 'error');
        return;
    }

    setLoading(true);
    setPaymentStatus('pending');

    try {
      const response = await fetch('https://payment.jet.co.ke/process_incoming_payment.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: plan.amount,
          phone: `+254${phoneNumber.substring(1)}`,
          // Note: We are no longer sending userId or a custom accountReference here,
          // as the PHP script ignores them. We rely on the response.
        }),
      });

      const result = await response.json();

      if (result.status === 'success' && result.reference) {
        // **THE FIX**: Create the mapping document in Firestore right after getting the reference.
        const orderReference = result.reference;
        const intentRef = doc(db, 'payment_intents', orderReference);
        await setDoc(intentRef, {
          userId: user.uid,
          status: 'pending',
          amount: plan.amount,
          createdAt: serverTimestamp()
        });

        showToast('Check your phone to enter your M-Pesa PIN.', 'info');
        // The useEffect will now wait for the webhook to update the user's profile.
      } else {
        throw new Error(result.message || 'Payment initiation failed. Please check the number and try again.');
      }
    } catch (error) {
      setPaymentStatus('error');
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    paymentStatus,
    setPaymentStatus,
    initiatePayment,
  };
};
