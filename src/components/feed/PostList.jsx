// src/components/feed/PostList.jsx
import React from 'react';
import PostItem from './PostItem';

const PostList = ({ posts = [] }) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No posts to display
      </div>
    );
  }
  
  return (
    <div className="divide-y divide-gray-200 dark:divide-dark-border">
      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostList;