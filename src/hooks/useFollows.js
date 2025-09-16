// src/hooks/useFollows.js
import { useState, useCallback } from 'react';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  increment,
  writeBatch,
  addDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';

export const useFollows = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const isFollowing = useCallback(async (targetUserId) => {
    if (!user) return false;

    try {
      const q = query(
        collection(db, 'follows'),
        where('followerId', '==', user.uid),
        where('followingId', '==', targetUserId)
      );
      
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (err) {
      return false;
    }
  }, [user]);

  const followUser = useCallback(async (targetUserId) => {
    if (!user) {
      return { success: false, error: 'You must be logged in to follow users.' };
    }

    if (user.uid === targetUserId) {
      return { success: false, error: 'You cannot follow yourself.' };
    }

    setLoading(true);
    setError(null);

    const batch = writeBatch(db);
    const targetUserRef = doc(db, 'users', targetUserId);
    const currentUserRef = doc(db, 'users', user.uid);

    try {
      const q = query(
        collection(db, 'follows'),
        where('followerId', '==', user.uid),
        where('followingId', '==', targetUserId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // --- Unfollow Logic ---
        const followDoc = querySnapshot.docs[0];
        batch.delete(doc(db, 'follows', followDoc.id));
        batch.update(targetUserRef, { followersCount: increment(-1) });
        batch.update(currentUserRef, { followingCount: increment(-1) });
        
        await batch.commit();
        setLoading(false);
        return { success: true, following: false };
      } else {
        // --- Follow Logic ---
        const followData = {
          followerId: user.uid,
          followingId: targetUserId,
          createdAt: serverTimestamp()
        };
        const newFollowRef = doc(collection(db, 'follows'));
        batch.set(newFollowRef, followData);

        batch.update(targetUserRef, { followersCount: increment(1) });
        batch.update(currentUserRef, { followingCount: increment(1) });
        
        const notificationData = {
          type: 'follow',
          senderId: user.uid,
          recipientId: targetUserId,
          createdAt: serverTimestamp(),
          read: false
        };
        const newNotificationRef = doc(collection(db, 'notifications'));
        batch.set(newNotificationRef, notificationData);
        
        await batch.commit();
        setLoading(false);
        return { success: true, following: true };
      }
    } catch (err) {
      // FIX: Removed the console.error to keep the console clean.
      setError("Failed to update follow status. You may not have the required permissions.");
      setLoading(false);
      return { success: false, error: "Failed to update follow status. You may not have the required permissions." };
    }
  }, [user]);

  const getFollowers = useCallback(async (userId, limitCount = 20) => {
    setLoading(true);
    setError(null);

    try {
      const q = query(
        collection(db, 'follows'),
        where('followingId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const followers = [];
      
      for (const followDoc of querySnapshot.docs) {
        const followData = followDoc.data();
        const userRef = doc(db, 'users', followData.followerId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          followers.push({
            id: userSnap.id,
            ...userSnap.data(),
          });
        }
      }
      
      setLoading(false);
      return { success: true, data: followers };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: "Could not fetch followers." };
    }
  }, []);

  const getFollowing = useCallback(async (userId, limitCount = 20) => {
    setLoading(true);
    setError(null);

    try {
      const q = query(
        collection(db, 'follows'),
        where('followerId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const following = [];
      
      for (const followDoc of querySnapshot.docs) {
        const followData = followDoc.data();
        const userRef = doc(db, 'users', followData.followingId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          following.push({
            id: userSnap.id,
            ...userSnap.data(),
          });
        }
      }
      
      setLoading(false);
      return { success: true, data: following };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: "Could not fetch following list." };
    }
  }, []);

  return {
    loading,
    error,
    followUser,
    isFollowing,
    getFollowers,
    getFollowing,
  };
};

export default useFollows;
