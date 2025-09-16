// src/components/feed/PostListSkeleton.jsx
import React from 'react';
import PostSkeleton from './PostSkeleton';

const PostListSkeleton = ({ count = 5 }) => {
  return (
    <div>
      {Array.from({ length: count }).map((_, index) => (
        <PostSkeleton key={index} />
      ))}
    </div>
  );
};

export default PostListSkeleton;
