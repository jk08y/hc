// src/utils/dateFormat.js
import { formatDistanceToNow, format, isToday, isYesterday, isThisYear, isValid } from 'date-fns';

/**
 * Format date for display in posts and notifications
 * Similar to Twitter/X date formatting
 */
export const formatPostDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (!isValid(date)) {
    return '';
  }
  
  if (isToday(date)) {
    // If date is today, show time
    return format(date, 'h:mm a');
  } else if (isYesterday(date)) {
    // If date is yesterday, show "Yesterday"
    return 'Yesterday';
  } else if (isThisYear(date)) {
    // If date is this year, show month and day
    return format(date, 'MMM d');
  } else {
    // If date is before this year, show month, day, and year
    return format(date, 'MMM d, yyyy');
  }
};

/**
 * Format date for display in user profiles
 */
export const formatJoinDate = (dateString) => {
  if (!dateString) return '';
  
  // Handle Firebase Timestamp objects
  let date;
  if (typeof dateString === 'object' && dateString.toDate) {
    // It's a Firebase Timestamp
    date = dateString.toDate();
  } else {
    // It's a regular date string
    date = new Date(dateString);
  }
  
  if (!isValid(date)) {
    return 'Recently joined';
  }
  
  return format(date, 'MMMM yyyy');
};

/**
 * Format date as relative time for recent dates
 * Similar to Twitter/X "time ago" formatting
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  
  let date;
  if (typeof dateString === 'object' && dateString.toDate) {
    // It's a Firebase Timestamp
    date = dateString.toDate();
  } else {
    // It's a regular date string
    date = new Date(dateString);
  }
  
  if (!isValid(date)) {
    return 'Recently';
  }
  
  const now = new Date();
  
  // Get seconds difference
  const diffSeconds = Math.floor((now - date) / 1000);
  
  if (diffSeconds < 30) {
    return 'now';
  } else if (diffSeconds < 60) {
    return `${diffSeconds}s`;
  } else if (diffSeconds < 3600) {
    const minutes = Math.floor(diffSeconds / 60);
    return `${minutes}m`;
  } else if (diffSeconds < 86400) {
    const hours = Math.floor(diffSeconds / 3600);
    return `${hours}h`;
  } else if (isThisYear(date)) {
    return format(date, 'MMM d');
  } else {
    return format(date, 'MMM d, yyyy');
  }
};

/**
 * Format date for full detailed display
 */
export const formatFullDate = (dateString) => {
  if (!dateString) return '';
  
  let date;
  if (typeof dateString === 'object' && dateString.toDate) {
    // It's a Firebase Timestamp
    date = dateString.toDate();
  } else {
    // It's a regular date string
    date = new Date(dateString);
  }
  
  if (!isValid(date)) {
    return '';
  }
  
  return format(date, 'h:mm a · MMM d, yyyy');
};

/**
 * Format date for timestamps in conversations
 */
export const formatMessageTime = (dateString) => {
  if (!dateString) return '';
  
  let date;
  if (typeof dateString === 'object' && dateString.toDate) {
    // It's a Firebase Timestamp
    date = dateString.toDate();
  } else {
    // It's a regular date string
    date = new Date(dateString);
  }
  
  if (!isValid(date)) {
    return '';
  }
  
  if (isToday(date)) {
    return format(date, 'h:mm a');
  } else if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'h:mm a')}`;
  } else {
    return format(date, 'MMM d, yyyy h:mm a');
  }
};