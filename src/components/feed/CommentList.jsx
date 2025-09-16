// src/components/feed/CommentList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { usePosts } from '../../hooks/usePosts';
import CommentItem from './CommentItem';
import Loading from '../common/Loading';

const CommentList = ({ postId }) => {
  const { getReplies } = usePosts(); // <-- Correctly using the hook
  
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    setError(null);
    
    try {
      const result = await getReplies(postId); // <-- Calling the function
      
      if (result.success) {
        setComments(result.data);
      } else {
        setError(result.error || 'Failed to fetch comments');
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [getReplies, postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);
  
  if (loading) {
    return <Loading text="Loading comments..." />;
  }
  
  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        <p>{error}</p>
        <button 
          className="mt-2 text-primary hover:underline"
          onClick={fetchComments}
        >
          Try again
        </button>
      </div>
    );
  }
  
  if (comments.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No comments yet. Be the first to reply!
      </div>
    );
  }
  
  return (
    <div className="divide-y divide-gray-200 dark:divide-dark-border">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
};

export default CommentList;
