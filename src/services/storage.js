// src/services/storage.js
import { 
    ref, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject 
  } from 'firebase/storage';
  import { storage } from '../config/firebase';
  
  // Upload a file to Firebase Storage
  export const uploadFile = async (path, file, metadata = {}) => {
    try {
      const storageRef = ref(storage, path);
      
      // Upload file with optional metadata
      const snapshot = await uploadBytes(storageRef, file, metadata);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return { success: true, url: downloadURL, path };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  // Upload a profile image
  export const uploadProfileImage = async (userId, file) => {
    // Generate unique file name using timestamp
    const fileName = `${Date.now()}_${file.name}`;
    const path = `users/${userId}/profile/${fileName}`;
    
    // Set proper metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        purpose: 'profile'
      }
    };
    
    return await uploadFile(path, file, metadata);
  };
  
  // Upload a banner image
  export const uploadBannerImage = async (userId, file) => {
    // Generate unique file name using timestamp
    const fileName = `${Date.now()}_${file.name}`;
    const path = `users/${userId}/banner/${fileName}`;
    
    // Set proper metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        purpose: 'banner'
      }
    };
    
    return await uploadFile(path, file, metadata);
  };
  
  // Upload post media (image or video)
  export const uploadPostMedia = async (postId, file) => {
    // Generate unique file name using timestamp
    const fileName = `${Date.now()}_${file.name}`;
    const path = `posts/${postId}/${fileName}`;
    
    // Set proper metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        purpose: 'post'
      }
    };
    
    return await uploadFile(path, file, metadata);
  };
  
  // Delete a file from Firebase Storage
  export const deleteFile = async (path) => {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  // Get file metadata
  export const getFileMetadata = async (path) => {
    try {
      const storageRef = ref(storage, path);
      const metadata = await getMetadata(storageRef);
      
      return { success: true, metadata };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };