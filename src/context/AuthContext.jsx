// src/context/AuthContext.jsx
import React, { createContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  runTransaction,
  updateDoc
} from 'firebase/firestore';
import { auth, db, adminEmail } from '../config/firebase';

export const AuthContext = createContext();

const checkUsernameExists = async (username) => {
    const usernameRef = doc(db, 'usernames', username.toLowerCase());
    const docSnap = await getDoc(usernameRef);
    return docSnap.exists();
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUserDocReady, setIsUserDocReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVerifyingAdmin, setIsVerifyingAdmin] = useState(true);

  const fetchUserData = useCallback(async (authUser, displayName) => {
    if (!authUser) {
        setIsUserDocReady(false);
        setUserData(null);
        setIsAdmin(false);
        return null;
    }
    const userDocRef = doc(db, 'users', authUser.uid);
    let docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const fetchedData = { id: docSnap.id, ...docSnap.data() };
      setUserData(fetchedData);
      setIsUserDocReady(true);
      setIsAdmin(fetchedData.email?.toLowerCase() === adminEmail?.toLowerCase());
      return fetchedData;
    } else {
      // **THE FIX**: This is the new, robust username generation logic.
      setIsUserDocReady(false);

      // 1. Sanitize and get the base username from the email.
      let baseUsername = (authUser.email?.split('@')[0] || 'user')
        .replace(/[^a-zA-Z0-9_]/g, '') // Remove invalid characters.
        .toLowerCase(); // Use lowercase for consistency.

      // 2. Adjust length to fit within 4-15 character limits.
      // If too long, truncate it, leaving room for random numbers.
      if (baseUsername.length > 12) {
        baseUsername = baseUsername.slice(0, 12);
      }
      // If too short, pad it with random numbers to meet the minimum length.
      if (baseUsername.length < 4) {
          const needed = 4 - baseUsername.length;
          for (let i = 0; i < needed; i++) {
              baseUsername += Math.floor(Math.random() * 10);
          }
      }

      // 3. Ensure the generated username is unique.
      let finalUsername = baseUsername;
      let isUsernameUnique = !(await checkUsernameExists(finalUsername));
      let attempts = 0;
      const maxAttempts = 10;

      // Keep trying with random suffixes until a unique name is found.
      while (!isUsernameUnique && attempts < maxAttempts) {
        finalUsername = `${baseUsername}${Math.floor(100 + Math.random() * 900)}`;
        // Ensure the new name doesn't exceed the max length.
        if (finalUsername.length > 15) {
            finalUsername = finalUsername.slice(0, 15);
        }
        isUsernameUnique = !(await checkUsernameExists(finalUsername));
        attempts++;
      }

      // As a final fallback, use a timestamp-based username.
      if (!isUsernameUnique) {
          finalUsername = `user${Date.now()}`.slice(0, 15);
      }

      const newUserData = {
        uid: authUser.uid,
        displayName: displayName || authUser.displayName || finalUsername,
        email: authUser.email,
        photoURL: authUser.photoURL || '',
        username: finalUsername,
        usernameLastUpdatedAt: null,
        bio: '',
        location: '',
        website: '',
        joinedAt: serverTimestamp(),
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        isVerified: false,
        verificationType: null,
        status: 'active'
      };

      try {
        await runTransaction(db, async (transaction) => {
            const usernameRef = doc(db, 'usernames', finalUsername.toLowerCase());
            transaction.set(userDocRef, newUserData);
            transaction.set(usernameRef, { userId: authUser.uid });
        });
        const createdUserData = { id: userDocRef.id, ...newUserData };
        setUserData(createdUserData);
        setIsUserDocReady(true);
        setIsAdmin(createdUserData.email?.toLowerCase() === adminEmail?.toLowerCase());
        return createdUserData;
      } catch (error) {
        setIsUserDocReady(false);
      }
    }
    return null;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setIsVerifyingAdmin(true);
      if (authUser) {
        setUser(authUser);
        const fetchedData = await fetchUserData(authUser);
        if (fetchedData?.premium?.isVerified) {
            const expiresAt = fetchedData.premium.expiresAt?.toDate();
            if (expiresAt && new Date() > expiresAt) {
                const userRef = doc(db, 'users', authUser.uid);
                await updateDoc(userRef, {
                    'premium.isVerified': false,
                    'premium.status': 'expired',
                    isVerified: false,
                    verificationType: null
                });
                await fetchUserData(authUser);
            }
        }
      } else {
        setUser(null);
        setUserData(null);
        setIsUserDocReady(false);
        setIsAdmin(false);
      }
      setLoading(false);
      setIsVerifyingAdmin(false);
    });
    return () => unsubscribe();
  }, [fetchUserData]);

  const updateUserContent = async (userId, updatedData) => {
    const batch = writeBatch(db);
    const postsQuery = query(collection(db, 'posts'), where('userId', '==', userId));
    const postsSnapshot = await getDocs(postsQuery);
    postsSnapshot.forEach(doc => batch.update(doc.ref, updatedData));
    try {
        await batch.commit();
        return { success: true };
    } catch (error) {
        return { success: false, error: "Could not update all user content." };
    }
  };

  const updateUserProfile = async (data) => {
    if (!user || !userData) return { success: false, error: "Not authenticated" };
    try {
        await runTransaction(db, async (transaction) => {
            const userDocRef = doc(db, 'users', user.uid);
            const currentData = (await transaction.get(userDocRef)).data();
            const currentUsername = currentData.username;
            const newUsername = data.username;
            const updatePayload = { ...data };

            if (newUsername && newUsername.toLowerCase() !== currentUsername.toLowerCase()) {
                if (currentData.usernameLastUpdatedAt) {
                    const lastUpdated = currentData.usernameLastUpdatedAt.toDate();
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    if (lastUpdated > thirtyDaysAgo) {
                        throw new Error("You can only change your username once every 30 days.");
                    }
                }
                const newUsernameRef = doc(db, 'usernames', newUsername.toLowerCase());
                const oldUsernameRef = doc(db, 'usernames', currentUsername.toLowerCase());
                const usernameDoc = await transaction.get(newUsernameRef);
                if (usernameDoc.exists()) {
                    throw new Error("Username is already taken.");
                }
                transaction.delete(oldUsernameRef);
                transaction.set(newUsernameRef, { userId: user.uid });
                updatePayload.usernameLastUpdatedAt = serverTimestamp();
            }
            transaction.update(userDocRef, updatePayload);
        });
        const contentUpdatePayload = { displayName: data.displayName, username: data.username, userPhotoURL: data.photoURL, isVerified: userData.isVerified, verificationType: userData.verificationType };
        await updateUserContent(user.uid, contentUpdatePayload);
        await fetchUserData(user);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await fetchUserData(result.user, result.user.displayName);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to sign in with Google." };
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Invalid email or password." };
    }
  };

  const registerWithEmail = async (email, password, displayName) => {
    try {
      const emailCheckResponse = await fetch(`https://disposable.debounce.io/?email=${email}`);
      const emailCheckResult = await emailCheckResponse.json();
      if (emailCheckResult.disposable === "true") {
        return { success: false, error: "Disposable or temporary emails are not allowed." };
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const authUser = userCredential.user;
      await updateProfile(authUser, { displayName });
      await fetchUserData(authUser, displayName);
      return { success: true };
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        return { success: false, error: "This email address is already in use." };
      }
      return { success: false, error: "Could not create account. Please try again." };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to sign out." };
    }
  };

  const value = {
    user,
    userData,
    loading,
    isUserDocReady,
    isAdmin,
    isVerifyingAdmin,
    fetchUserData,
    signInWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout,
    updateUserProfile,
    checkUsernameExists,
    updateUserContent,
    isSuspended: userData?.status === 'suspended',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
