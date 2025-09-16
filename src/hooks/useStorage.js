// Path: src/hooks/useStorage.js
import { useState } from 'react';

// Use the VITE_CLOUDFLARE_R2_PUBLIC_URL for the public-facing image URL.
const R2_PUBLIC_URL = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL || 'https://placehold.co';

// The API endpoints for upload and delete
const API_ENDPOINTS = {
  uploadUrl: '/api/upload-url',
  deleteFile: '/api/delete-file',
};

export const useStorage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetches a pre-signed URL from the backend to upload a file to R2.
   * @param {string} key - The desired file path in the R2 bucket.
   * @param {string} contentType - The MIME type of the file.
   * @returns {Promise<{success: boolean, url?: string, error?: string}>}
   */
  const getR2UploadUrl = async (key, contentType) => {
    try {
      const response = await fetch(API_ENDPOINTS.uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, contentType }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to get upload URL');
      }

      return { success: true, url: result.url };
    } catch (err) {
      console.error('Error fetching R2 upload URL:', err);
      return { success: false, error: err.message };
    }
  };

  /**
   * Uploads a file to R2 using a pre-signed URL.
   * @param {string} uploadUrl - The pre-signed URL from the backend.
   * @param {File} file - The file to upload.
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const uploadFileDirectly = async (uploadUrl, file) => {
    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to upload file to R2');
      }

      return { success: true };
    } catch (err) {
      console.error('Error uploading file to R2:', err);
      return { success: false, error: err.message };
    }
  };

  /**
   * Uploads a file and returns its public URL.
   * This function orchestrates the whole process.
   * @param {string} path - The desired file path in the R2 bucket.
   * @param {File} file - The file to upload.
   * @returns {Promise<{success: boolean, url?: string, error?: string}>}
   */
  const uploadFile = async (path, file) => {
    setLoading(true);
    setError(null);

    try {
      const { success: getUrlSuccess, url: uploadUrl, error: getUrlError } = await getR2UploadUrl(path, file.type);
      if (!getUrlSuccess) {
        throw new Error(getUrlError);
      }

      const { success: uploadSuccess, error: uploadError } = await uploadFileDirectly(uploadUrl, file);
      if (!uploadSuccess) {
        throw new Error(uploadError);
      }

      const publicUrl = `${R2_PUBLIC_URL}/${path}`;
      setLoading(false);
      return { success: true, url: publicUrl, path };
    } catch (err) {
      setLoading(false);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  /**
   * Deletes a file from R2 via the backend.
   * @param {string} path - The file path in the R2 bucket.
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const deleteFile = async (path) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.deleteFile, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: path }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete file');
      }

      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const uploadProfileImage = async (userId, file) => {
    const filePath = `users/${userId}/profile/${Date.now()}_${file.name}`;
    return await uploadFile(filePath, file);
  };

  const uploadBannerImage = async (userId, file) => {
    const filePath = `users/${userId}/banner/${Date.now()}_${file.name}`;
    return await uploadFile(filePath, file);
  };

  const uploadPostMedia = async (postId, file) => {
    const filePath = `posts/${postId}/${Date.now()}_${file.name}`;
    return await uploadFile(filePath, file);
  };

  return {
    loading,
    error,
    uploadFile,
    uploadProfileImage,
    uploadBannerImage,
    uploadPostMedia,
    deleteFile,
  };
};
