// src/components/feed/PostSkeleton.jsx
import React from 'react';

const PostSkeleton = () => {
  return (
    <div className="p-4 border-b border-gray-200 dark:border-dark-border animate-pulse">
      <div className="flex">
        <div className="mr-3 flex-shrink-0">
          <div className="w-12 h-12 bg-gray-200 dark:bg-dark-border rounded-full"></div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center mb-2">
            <div className="h-4 bg-gray-200 dark:bg-dark-border rounded w-1/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-dark-border rounded w-1/3 ml-2"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-dark-border rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-dark-border rounded w-3/4"></div>
          </div>
          <div className="mt-4 h-32 bg-gray-200 dark:bg-dark-border rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
};

export default PostSkeleton;
