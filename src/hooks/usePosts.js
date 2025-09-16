// src/hooks/usePosts.js
import { useCallback } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc as deleteFirestoreDoc, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit, 
  serverTimestamp,
  increment,
  writeBatch,
  setDoc,
} from 'firebase/firestore';
// Removed: `ref, uploadBytes, getDownloadURL, deleteObject` from 'firebase/storage';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';
import { useStorage } from './useStorage'; // New import for the R2 hook
import { extractHashtags, extractMentions } from '../utils/textFormat';

const extractFirstUrl = (text) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/;
    const match = text.match(urlRegex);
    return match ? match[0] : null;
};

const createNotification = (batch, type, senderId, recipientId, postId = null, content = null) => {
    if (senderId === recipientId) return;

    const notificationRef = doc(collection(db, 'notifications'));
    batch.set(notificationRef, {
        type,
        senderId,
        recipientId,
        postId,
        content,
        createdAt: serverTimestamp(),
        read: false,
    });
};

export const usePosts = () => {
  const { user, userData } = useAuth();
  const { uploadPostMedia, deleteFile } = useStorage();

  const createPost = useCallback(async (content, media = [], replyToId = null) => {
    if (!user || !userData) {
      return { success: false, error: 'You must be logged in to post.' };
    }
    
    try {
      const batch = writeBatch(db);
      const postRef = doc(collection(db, 'posts'));
      
      const postData = {
        userId: user.uid,
        username: userData.username,
        displayName: userData.displayName,
        userPhotoURL: userData.photoURL || '',
        content,
        hashtags: extractHashtags(content),
        hasMedia: media.length > 0,
        mediaURLs: [],
        mediaPaths: [], // Store the R2 keys
        likeCount: 0,
        commentCount: 0,
        repostCount: 0,
        createdAt: serverTimestamp(),
        isReply: replyToId !== null,
        replyToId,
        isVerified: userData.isVerified || false,
        verificationType: userData.verificationType || null,
        type: 'post',
        linkPreviewURL: extractFirstUrl(content),
      };
      
      batch.set(postRef, postData);
      
      const postId = postRef.id;

      let mediaURLs = [];
      let mediaPaths = [];
      if (media.length > 0) {
        const uploadResults = await Promise.all(
          media.map(async (file) => uploadPostMedia(postId, file))
        );
        mediaURLs = uploadResults.map(res => res.url);
        mediaPaths = uploadResults.map(res => res.path);
        batch.update(postRef, { mediaURLs, mediaPaths });
      }
      
      const userRef = doc(db, 'users', user.uid);
      batch.update(userRef, { postsCount: increment(1) });

      if (replyToId) {
        const originalPostRef = doc(db, 'posts', replyToId);
        const originalPostSnap = await getDoc(originalPostRef);
        if (originalPostSnap.exists()) {
            const originalPostData = originalPostSnap.data();
            batch.update(originalPostRef, { commentCount: increment(1) });
            createNotification(batch, 'comment', user.uid, originalPostData.userId, postId, content);
        }
      }

      const mentions = extractMentions(content);
      if (mentions.length > 0) {
        // ... (existing mention logic)
      }

      await batch.commit();

      const newPostData = { ...postData, id: postId, mediaURLs, createdAt: new Date().toISOString() };
      return { success: true, post: newPostData };
    } catch (err) {
      return { success: false, error: 'An unexpected error occurred while posting.' };
    }
  }, [user, userData, uploadPostMedia]);

  const likePost = useCallback(async (postId) => {
    // ... (unchanged)
  }, [user]);

  const toggleRepost = useCallback(async (post) => {
    // ... (unchanged)
  }, [user, userData]);

  const deletePost = useCallback(async (postId) => {
    if (!user) return { success: false, error: 'Not authenticated.' };
    
    try {
        const postRef = doc(db, 'posts', postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists() || postSnap.data().userId !== user.uid) {
            return { success: false, error: 'Post not found or you do not have permission to delete it.' };
        }
        
        const postData = postSnap.data();
        const batch = writeBatch(db);

        batch.delete(postRef);

        const userRef = doc(db, 'users', user.uid);
        batch.update(userRef, { postsCount: increment(-1) });

        if (postData.isReply && postData.replyToId) {
            const originalPostRef = doc(db, 'posts', postData.replyToId);
            batch.update(originalPostRef, { commentCount: increment(-1) });
        }
        
        await batch.commit();

        if (postData.mediaPaths && postData.mediaPaths.length > 0) {
            await Promise.all(
                postData.mediaPaths.map(path => deleteFile(path, user.uid, postId))
            );
        }
        
        return { success: true };
    } catch (err) {
        return { success: false, error: "Failed to delete post." };
    }
  }, [user, deleteFile]);

  // All other functions are unchanged.
  const getPosts = useCallback(async (limitCount = 20) => {
    try {
      const q = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        firestoreLimit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
      }));
      return { success: true, data: posts };
    } catch (err) {
      return { success: false, error: "Failed to fetch posts." };
    }
  }, []);

  const getUserPosts = useCallback(async (userId) => {
    try {
      const q = query(
        collection(db, 'posts'),
        where('userId', '==', userId),
        where('isReply', '==', false),
        orderBy('createdAt', 'desc'),
        firestoreLimit(20)
      );
      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
      }));
      return { success: true, data: posts };
    } catch (err) {
      return { success: false, error: "Failed to fetch user's posts." };
    }
  }, []);

  const getPost = useCallback(async (postId) => {
    try {
      const postRef = doc(db, 'posts', postId);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const postData = {
          id: postSnap.id,
          ...postSnap.data(),
          createdAt: postSnap.data().createdAt?.toDate().toISOString() || new Date().toISOString()
        };
        return { success: true, data: postData };
      } else {
        return { success: false, error: 'Post not found' };
      }
    } catch (err) {
      return { success: false, error: "Failed to fetch post." };
    }
  }, []);

  const getReplies = useCallback(async (postId) => {
    try {
      const q = query(
        collection(db, 'posts'),
        where('replyToId', '==', postId),
        orderBy('createdAt', 'asc'),
        firestoreLimit(50)
      );
      const querySnapshot = await getDocs(q);
      const replies = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
      }));
      return { success: true, data: replies };
    } catch (err) {
      return { success: false, error: "Failed to fetch replies." };
    }
  }, []);

  const getUserReplies = useCallback(async (userId) => {
    try {
      const q = query(
        collection(db, 'posts'),
        where('userId', '==', userId),
        where('isReply', '==', true),
        orderBy('createdAt', 'desc'),
        firestoreLimit(20)
      );
      const querySnapshot = await getDocs(q);
      const replies = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
      }));
      return { success: true, data: replies };
    } catch (err) {
      return { success: false, error: "Failed to fetch replies." };
    }
  }, []);
  
  const getUserMediaPosts = useCallback(async (userId) => {
    try {
      const q = query(
        collection(db, 'posts'),
        where('userId', '==', userId),
        where('hasMedia', '==', true),
        orderBy('createdAt', 'desc'),
        firestoreLimit(20)
      );
      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
      }));
      return { success: true, data: posts };
    } catch (err) {
      return { success: false, error: "Failed to fetch media posts." };
    }
  }, []);

  const getUserLikedPosts = useCallback(async (userId) => {
    try {
      const likesQuery = query(
        collection(db, `users/${userId}/likes`),
        orderBy('createdAt', 'desc'),
        firestoreLimit(20)
      );
      const likesSnapshot = await getDocs(likesQuery);
      const postIds = likesSnapshot.docs.map(doc => doc.data().postId);

      if (postIds.length === 0) {
        return { success: true, data: [] };
      }

      const postPromises = postIds.map(id => getDoc(doc(db, 'posts', id)));
      const postSnaps = await Promise.all(postPromises);

      const posts = postSnaps
        .filter(snap => snap.exists())
        .map(snap => ({
            id: snap.id,
            ...snap.data(),
            createdAt: snap.data().createdAt?.toDate().toISOString() || new Date().toISOString()
        }));

      return { success: true, data: posts };
    } catch (err) {
      return { success: false, error: "Failed to fetch liked posts." };
    }
  }, []);

  const bookmarkPost = useCallback(async (postId) => {
    if (!user) return { success: false, error: 'You must be logged in.' };
    try {
      const bookmarkRef = doc(db, `users/${user.uid}/bookmarks`, postId);
      await setDoc(bookmarkRef, {
        postId,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: "Failed to bookmark post." };
    }
  }, [user]);

  const unbookmarkPost = useCallback(async (postId) => {
    if (!user) return { success: false, error: 'You must be logged in.' };
    try {
      const bookmarkRef = doc(db, `users/${user.uid}/bookmarks`, postId);
      await deleteFirestoreDoc(bookmarkRef);
      return { success: true };
    } catch (err) {
      return { success: false, error: "Failed to remove bookmark." };
    }
  }, [user]);

  return {
    createPost,
    deletePost,
    getPosts,
    getUserPosts,
    getPost,
    getReplies,
    getUserReplies,
    getUserMediaPosts,
    getUserLikedPosts,
    likePost,
    bookmarkPost,
    unbookmarkPost,
    toggleRepost,
  };
};
