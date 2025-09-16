// src/hooks/useAdmin.js
import { useState, useCallback } from 'react';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  limit,
  getCountFromServer,
  where
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';

export const useAdmin = () => {
  const { updateUserContent } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getDashboardStats = useCallback(async () => {
    // This function remains for fetching the main counts for the stat cards.
    setLoading(true);
    try {
      const usersCol = collection(db, 'users');
      const postsCol = collection(db, 'posts');
      const paymentsCol = query(collection(db, 'payments'), where('status', '==', 'Success'));

      const [usersSnapshot, postsSnapshot, paymentsSnapshot] = await Promise.all([
        getCountFromServer(usersCol),
        getCountFromServer(postsCol),
        getDocs(paymentsCol) // getDocs to calculate sum
      ]);

      let totalRevenue = 0;
      paymentsSnapshot.forEach(doc => {
        totalRevenue += doc.data().amount || 0;
      });

      setLoading(false);
      return {
        success: true,
        stats: {
          totalUsers: usersSnapshot.data().count,
          totalPosts: postsSnapshot.data().count,
          totalRevenue: totalRevenue,
          successfulPayments: paymentsSnapshot.size,
        }
      };
    } catch (err) {
      setError('Failed to fetch dashboard stats.');
      setLoading(false);
      return { success: false, error: 'Failed to fetch dashboard stats.' };
    }
  }, []);

  // **THE FIX**: New function to get the most recent users for the dashboard.
  const getRecentUsers = useCallback(async (count = 5) => {
    setLoading(true);
    try {
        const usersQuery = query(
            collection(db, 'users'),
            orderBy('joinedAt', 'desc'),
            limit(count)
        );
        const querySnapshot = await getDocs(usersQuery);
        const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLoading(false);
        return { success: true, data: usersList };
    } catch (err) {
        setError('Failed to fetch recent users.');
        setLoading(false);
        return { success: false, error: 'Failed to fetch recent users.' };
    }
  }, []);

  // **THE FIX**: New function to get the most recent payments for the dashboard.
  const getRecentPayments = useCallback(async (count = 5) => {
    setLoading(true);
    try {
        const paymentsQuery = query(
            collection(db, 'payments'),
            where('status', '==', 'Success'),
            orderBy('createdAt', 'desc'),
            limit(count)
        );
        const querySnapshot = await getDocs(paymentsQuery);
        const paymentsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLoading(false);
        return { success: true, data: paymentsList };
    } catch (err) {
        setError('Failed to fetch recent payments.');
        setLoading(false);
        return { success: false, error: 'Failed to fetch recent payments.' };
    }
  }, []);


  // --- All other existing functions remain unchanged ---

  const getPaymentStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
        const paymentsQuery = query(
            collection(db, 'payments'),
            where('status', '==', 'Success'),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(paymentsQuery);
        let totalRevenue = 0;
        const paymentsList = [];
        querySnapshot.forEach(doc => {
            const data = doc.data();
            totalRevenue += data.amount || 0;
            paymentsList.push({ id: doc.id, ...data });
        });
        setLoading(false);
        return {
            success: true,
            stats: {
                totalRevenue: totalRevenue,
                successfulPayments: querySnapshot.size,
                payments: paymentsList
            }
        };
    } catch (err) {
        setError('Failed to fetch payment stats.');
        setLoading(false);
        return { success: false, error: 'Failed to fetch payment stats.' };
    }
  }, []);

  const getAllUsers = useCallback(async () => {
    setLoading(true);
    try {
      const usersQuery = query(collection(db, 'users'), orderBy('displayName'));
      const querySnapshot = await getDocs(usersQuery);
      const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLoading(false);
      return { success: true, data: usersList };
    } catch (err) {
      setError('Failed to fetch users.');
      setLoading(false);
      return { success: false, error: 'Failed to fetch users.' };
    }
  }, []);

  const updateUserStatus = useCallback(async (userId, newStatus) => {
    setLoading(true);
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { status: newStatus });
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError('Failed to update user status.');
      setLoading(false);
      return { success: false, error: 'Failed to update user status.' };
    }
  }, []);

  const updateUserVerification = useCallback(async (userId, verificationType) => {
    setLoading(true);
    try {
      const userRef = doc(db, 'users', userId);
      const isVerified = verificationType !== 'none';
      const newType = isVerified ? verificationType : null;
      await updateDoc(userRef, { isVerified, verificationType: newType });
      await updateUserContent(userId, { isVerified, verificationType: newType });
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError('Failed to update verification.');
      setLoading(false);
      return { success: false, error: 'Failed to update verification.' };
    }
  }, [updateUserContent]);

  const getAllPosts = useCallback(async () => {
    setLoading(true);
    try {
      const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(100));
      const querySnapshot = await getDocs(postsQuery);
      const postsList = querySnapshot.docs.map(p => ({ id: p.id, ...p.data() }));
      setLoading(false);
      return { success: true, data: postsList };
    } catch (err) {
      setError('Failed to fetch posts.');
      setLoading(false);
      return { success: false, error: 'Failed to fetch posts.' };
    }
  }, []);

  const deletePostAsAdmin = useCallback(async (postId) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'posts', postId));
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError('Failed to delete post.');
      setLoading(false);
      return { success: false, error: 'Failed to delete post.' };
    }
  }, []);

  return {
    loading,
    error,
    getDashboardStats,
    getPaymentStats,
    getAllUsers,
    updateUserStatus,
    updateUserVerification,
    getAllPosts,
    deletePostAsAdmin,
    getRecentUsers,
    getRecentPayments,
  };
};
