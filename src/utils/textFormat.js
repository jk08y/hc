// src/utils/textFormat.js

export const formatPostText = (text) => {
    if (!text) return '';
  
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const hashtagRegex = /#(\w+)/g;
    const mentionRegex = /@(\w+)/g;
  
    let formattedText = text;
  
    formattedText = formattedText.replace(urlRegex, (url) => {
      const displayUrl = url.length > 30 ? url.slice(0, 27) + '...' : url;
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${displayUrl}</a>`;
    });
  
    formattedText = formattedText.replace(hashtagRegex, (match, hashtag) => {
      return `<a href="/explore?q=%23${hashtag}" class="text-primary hover:underline">${match}</a>`;
    });
  
    formattedText = formattedText.replace(mentionRegex, (match, username) => {
      return `<a href="/${username}" class="text-primary hover:underline">${match}</a>`;
    });
  
    return formattedText;
};
  
export const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};
  
export const extractHashtags = (text) => {
    if (!text) return [];
    
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex) || [];
    
    return matches.map(tag => tag.substring(1).toLowerCase());
};
  
/**
 * **THE FIX**: Extracts mentions from text.
 * Returns an array of lowercase usernames without the '@'.
 * @param {string} text - The text to extract mentions from
 * @returns {string[]} Array of mentions
 */
export const extractMentions = (text) => {
    if (!text) return [];
    
    const mentionRegex = /@(\w+)/g;
    const matches = text.match(mentionRegex) || [];

    return matches.map(mention => mention.substring(1).toLowerCase());
};
  
export const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    
    if (num < 1000) {
      return num.toString();
    } else if (num < 1000000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    } else {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
};
