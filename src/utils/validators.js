// src/utils/validators.js

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Validate username format
   * @param {string} username - Username to validate
   * @returns {boolean} Whether username is valid
   */
  export const isValidUsername = (username) => {
    // Only letters, numbers, and underscores, 4-15 characters
    const usernameRegex = /^[a-zA-Z0-9_]{4,15}$/;
    return usernameRegex.test(username);
  };
  
  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {object} Validation result with strength and message
   */
  export const validatePassword = (password) => {
    if (!password) {
      return { valid: false, strength: 'none', message: 'Password is required' };
    }
    
    if (password.length < 8) {
      return { valid: false, strength: 'weak', message: 'Password must be at least 8 characters' };
    }
    
    // Check for complexity
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const complexityScore = [hasLowercase, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;
    
    if (complexityScore < 3) {
      return { 
        valid: false, 
        strength: 'medium', 
        message: 'Password should contain at least 3 of: lowercase, uppercase, numbers, special characters' 
      };
    }
    
    return { valid: true, strength: 'strong', message: 'Password is strong' };
  };
  
  /**
   * Validate URL format
   * @param {string} url - URL to validate
   * @returns {boolean} Whether URL is valid
   */
  export const isValidURL = (url) => {
    if (!url) return true; // Allow empty URL
    
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  /**
   * Validate post content
   * @param {string} text - Post text to validate
   * @param {number} maxLength - Maximum allowed length
   * @returns {object} Validation result
   */
  export const validatePostContent = (text, maxLength = 280) => {
    if (!text || text.trim() === '') {
      return { valid: false, message: 'Post cannot be empty' };
    }
    
    if (text.length > maxLength) {
      return { valid: false, message: `Post cannot exceed ${maxLength} characters` };
    }
    
    return { valid: true, message: '' };
  };
  
  /**
   * Validate image file
   * @param {File} file - File to validate
   * @param {number} maxSizeMB - Maximum file size in MB
   * @returns {object} Validation result
   */
  export const validateImage = (file, maxSizeMB = 4) => {
    if (!file) {
      return { valid: false, message: 'No file provided' };
    }
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return { valid: false, message: 'File must be a valid image (JPEG, PNG, GIF, WEBP)' };
    }
    
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { valid: false, message: `Image size must not exceed ${maxSizeMB}MB` };
    }
    
    return { valid: true, message: '' };
  };
  
  /**
   * Validate video file
   * @param {File} file - File to validate
   * @param {number} maxSizeMB - Maximum file size in MB
   * @returns {object} Validation result
   */
  export const validateVideo = (file, maxSizeMB = 20) => {
    if (!file) {
      return { valid: false, message: 'No file provided' };
    }
    
    // Check file type
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      return { valid: false, message: 'File must be a valid video (MP4, WebM, QuickTime)' };
    }
    
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { valid: false, message: `Video size must not exceed ${maxSizeMB}MB` };
    }
    
    return { valid: true, message: '' };
  };