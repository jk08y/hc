// src/components/common/Avatar.jsx
import React from 'react';
import { generatePlaceholderAvatar } from '../../utils/mediaHelpers';
import ImageWithLoader from './ImageWithLoader';

const Avatar = ({
  user,
  size = 'md',
  className = '',
  onClick
}) => {
  // Defines the pixel dimensions for different avatar sizes.
  const sizeClasses = {
    xs: 'w-6 h-6 min-w-6',
    sm: 'w-8 h-8 min-w-8',
    md: 'w-10 h-10 min-w-10',
    lg: 'w-14 h-14 min-w-14',
    xl: 'w-20 h-20 min-w-20',
    '2xl': 'w-24 h-24 sm:w-32 sm:h-32 sm:min-w-32'
  };

  // Determines the avatar source, falling back to a generated placeholder.
  const avatarSrc = user?.photoURL
    ? user.photoURL
    : (user?.displayName
      ? generatePlaceholderAvatar(user.displayName)
      : '');

  return (
    <div
      className={className}
      onClick={onClick}
    >
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 ${onClick ? 'cursor-pointer' : ''}`}
      >
        {avatarSrc ? (
          <ImageWithLoader
            src={avatarSrc}
            alt={user?.displayName || 'User'}
            className="w-full h-full object-cover"
          />
        ) : (
          // Fallback for users with no image or display name
          <div className={`${sizeClasses[size]} flex items-center justify-center bg-secondary text-white font-bold`}>
            {user?.displayName?.charAt(0).toUpperCase() || '?'}
          </div>
        )}
      </div>
      {/*
        **THE FIX**: The verification badge has been completely removed from this component.
        It will now be handled in components that display the user's name.
      */}
    </div>
  );
};

export default Avatar;
