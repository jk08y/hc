// src/services/firestore.js
import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    addDoc, 
    setDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    limit, 
    startAfter,
    increment,
    serverTimestamp 
  } from 'firebase/firestore';
  import { db } from '../config/firebase';
  
  // User related operations
  export const getUserByUsername = async (username) => {
    try {
      const q = query(
        collection(db, 'users'),
        where('username', '==', username),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return { success: true, data: { id: userDoc.id, ...userDoc.data() } };
      } else {
        return { success: false, error: 'User not found' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  export const getUserById = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { success: true, data: { id: userSnap.id, ...userSnap.data() } };
      } else {
        return { success: false, error: 'User not found' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  export const updateUser = async (userId, data) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  export const searchUsers = async (query, maxResults = 10) => {
    try {
      // Firebase doesn't support direct text search
      // This is a simple implementation that can be improved
      // For production, consider using a service like Algolia
      
      // Search by username (starts with)
      const usernameQuery = query(
        collection(db, 'users'),
        where('username', '>=', query),
        where('username', '<=', query + '\uf8ff'),
        limit(maxResults)
      );
      
      const usernameSnapshot = await getDocs(usernameQuery);
      const users = [];
      
      usernameSnapshot.forEach(doc => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // If we haven't reached max results, search by display name
      if (users.length < maxResults) {
        const displayNameQuery = query(
          collection(db, 'users'),
          where('displayName', '>=', query),
          where('displayName', '<=', query + '\uf8ff'),
          limit(maxResults - users.length)
        );
        
        const displayNameSnapshot = await getDocs(displayNameQuery);
        
        displayNameSnapshot.forEach(doc => {
          // Check if user already added (by username)
          if (!users.some(user => user.id === doc.id)) {
            users.push({
              id: doc.id,
              ...doc.data()
            });
          }
        });
      }
      
      return { success: true, data: users };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  // Post related operations
  export const getFeedPosts = async (lastVisible = null, pageSize = 10) => {
    try {
      let postsQuery;
      
      if (lastVisible) {
        postsQuery = query(
          collection(db, 'posts'),
          where('isReply', '==', false),
          orderBy('createdAt', 'desc'),
          startAfter(lastVisible),
          limit(pageSize)
        );
      } else {
        postsQuery = query(
          collection(db, 'posts'),
          where('isReply', '==', false),
          orderBy('createdAt', 'desc'),
          limit(pageSize)
        );
      }
      
      const querySnapshot = await getDocs(postsQuery);
      const posts = [];
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      
      querySnapshot.forEach(doc => {
        posts.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
        });
      });
      
      return { 
        success: true, 
        data: posts, 
        lastVisible: lastDoc,
        hasMore: posts.length === pageSize
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  export const getUserPosts = async (userId, lastVisible = null, pageSize = 10) => {
    try {
      let postsQuery;
      
      if (lastVisible) {
        postsQuery = query(
          collection(db, 'posts'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc'),
          startAfter(lastVisible),
          limit(pageSize)
        );
      } else {
        postsQuery = query(
          collection(db, 'posts'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(pageSize)
        );
      }
      
      const querySnapshot = await getDocs(postsQuery);
      const posts = [];
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      
      querySnapshot.forEach(doc => {
        posts.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
        });
      });
      
      return { 
        success: true, 
        data: posts, 
        lastVisible: lastDoc,
        hasMore: posts.length === pageSize
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  export const getPostById = async (postId) => {
    try {
      const postRef = doc(db, 'posts', postId);
      const postSnap = await getDoc(postRef);
      
      if (postSnap.exists()) {
        return { 
          success: true, 
          data: {
            id: postSnap.id,
            ...postSnap.data(),
            createdAt: postSnap.data().createdAt?.toDate().toISOString() || new Date().toISOString()
          }
        };
      } else {
        return { success: false, error: 'Post not found' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  export const createPost = async (userId, data) => {
    try {
      const postData = {
        userId,
        ...data,
        likes: 0,
        comments: 0,
        reposts: 0,
        createdAt: serverTimestamp()
      };
      
      const postRef = await addDoc(collection(db, 'posts'), postData);
      
      // Update user's post count
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        postsCount: increment(1)
      });
      
      return { success: true, id: postRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  export const deletePost = async (postId, userId) => {
    try {
      const postRef = doc(db, 'posts', postId);
      const postSnap = await getDoc(postRef);
      
      if (!postSnap.exists()) {
        return { success: false, error: 'Post not found' };
      }
      
      const postData = postSnap.data();
      
      // Check if user is the author
      if (postData.userId !== userId) {
        return { success: false, error: 'You cannot delete this post' };
      }
      
      await deleteDoc(postRef);
      
      // Update user's post count
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        postsCount: increment(-1)
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  // Trending topics
  export const getTrends = async (limit = 5) => {
    try {
      const trendsQuery = query(
        collection(db, 'trends'),
        orderBy('count', 'desc'),
        limit(limit)
      );
      
      const querySnapshot = await getDocs(trendsQuery);
      const trends = [];
      
      querySnapshot.forEach(doc => {
        trends.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return { success: true, data: trends };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  // Notifications
  export const getUserNotifications = async (userId, lastVisible = null, pageSize = 20) => {
    try {
      let notificationsQuery;
      
      if (lastVisible) {
        notificationsQuery = query(
          collection(db, 'notifications'),
          where('recipientId', '==', userId),
          orderBy('createdAt', 'desc'),
          startAfter(lastVisible),
          limit(pageSize)
        );
      } else {
        notificationsQuery = query(
          collection(db, 'notifications'),
          where('recipientId', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(pageSize)
        );
      }
      
      const querySnapshot = await getDocs(notificationsQuery);
      const notifications = [];
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      
      for (const notificationDoc of querySnapshot.docs) {
        const notificationData = notificationDoc.data();
        
        // Get sender info
        const senderRef = doc(db, 'users', notificationData.senderId);
        const senderSnap = await getDoc(senderRef);
        
        let senderInfo = null;
        if (senderSnap.exists()) {
          senderInfo = {
            id: senderSnap.id,
            displayName: senderSnap.data().displayName,
            username: senderSnap.data().username,
            photoURL: senderSnap.data().photoURL,
            isVerified: senderSnap.data().isVerified,
            verificationType: senderSnap.data().verificationType
          };
        }
        
        notifications.push({
          id: notificationDoc.id,
          ...notificationData,
          sender: senderInfo,
          createdAt: notificationData.createdAt?.toDate().toISOString() || new Date().toISOString()
        });
      }
      
      return { 
        success: true, 
        data: notifications, 
        lastVisible: lastDoc,
        hasMore: notifications.length === pageSize
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  export const markNotificationsAsRead = async (userId) => {
    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
        where('read', '==', false)
      );
      
      const querySnapshot = await getDocs(notificationsQuery);
      
      const batch = db.batch();
      querySnapshot.forEach(doc => {
        const notificationRef = doc.ref;
        batch.update(notificationRef, { read: true });
      });
      
      await batch.commit();
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };