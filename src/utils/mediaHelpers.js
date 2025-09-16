// src/utils/mediaHelpers.js

/**
 * Resize an image before upload to reduce file size
 * @param {File} file - Original image file
 * @param {Object} options - Resize options
 * @param {number} options.maxWidth - Maximum width in pixels
 * @param {number} options.maxHeight - Maximum height in pixels
 * @param {number} options.quality - JPEG quality (0-1)
 * @returns {Promise<Blob>} Resized image as Blob
 */
export const resizeImage = (file, options = {}) => {
    const { 
      maxWidth = 1200, 
      maxHeight = 1200, 
      quality = 0.8 
    } = options;
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (readerEvent) => {
        const img = new Image();
        
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Canvas to Blob conversion failed'));
              }
            },
            file.type,
            quality
          );
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = readerEvent.target.result;
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };
  
  /**
   * Create a thumbnail from an image file
   * @param {File} file - Original image file
   * @param {number} size - Thumbnail size in pixels
   * @returns {Promise<Blob>} Thumbnail as Blob
   */
  export const createThumbnail = (file, size = 100) => {
    return resizeImage(file, {
      maxWidth: size,
      maxHeight: size,
      quality: 0.7
    });
  };
  
  /**
   * Get image dimensions
   * @param {File} file - Image file
   * @returns {Promise<{width: number, height: number}>} Image dimensions
   */
  export const getImageDimensions = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = readerEvent.target.result;
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };
  
  /**
   * Check if a file is an image
   * @param {File} file - File to check
   * @returns {boolean} Whether file is an image
   */
  export const isImageFile = (file) => {
    return file && file.type.startsWith('image/');
  };
  
  /**
   * Check if a file is a video
   * @param {File} file - File to check
   * @returns {boolean} Whether file is a video
   */
  export const isVideoFile = (file) => {
    return file && file.type.startsWith('video/');
  };
  
  /**
   * Generate a placeholder avatar for users without profile pictures.
   * This version uses improved SVG text attributes for perfect centering.
   * @param {string} displayName - User's display name
   * @returns {string} SVG data URL
   */
  export const generatePlaceholderAvatar = (displayName) => {
    if (!displayName) return '';
    
    const initials = displayName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    const hash = displayName.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const hue = Math.abs(hash % 360);
    const backgroundColor = `hsl(${hue}, 70%, 45%)`;
    
    // **THE FIX**: Improved SVG for perfect text centering.
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <rect width="100" height="100" fill="${backgroundColor}" />
        <text x="50%" y="50%" 
          font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
          font-size="45"
          font-weight="bold"
          fill="white" 
          text-anchor="middle"
          dominant-baseline="central">
          ${initials}
        </text>
      </svg>
    `;
    
    // Use encodeURIComponent for the SVG string to handle special characters correctly in the data URL.
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  };
