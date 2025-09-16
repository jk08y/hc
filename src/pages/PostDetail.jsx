// src/pages/PostDetail.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { usePosts } from '../hooks/usePosts';
import PostItem from '../components/feed/PostItem';
import CommentList from '../components/feed/CommentList';
import PostComposer from '../components/feed/PostComposer';
import Loading from '../components/common/Loading';
import { useAuth } from '../hooks/useAuth';
import { useUI } from '../hooks/useUI'; // Import useUI

const PostDetail = () => {
  const { postId } = useParams();
  const { getPost } = usePosts();
  const { user } = useAuth();
  const { openComposer } = useUI(); // Get openComposer from context
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); 
  
  const fetchPost = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getPost(postId);
      
      if (result.success) {
        setPost(result.data);
      } else {
        setError(result.error || 'Failed to fetch post');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [getPost, postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);
  
  const handleCommentSuccess = () => {
    setRefreshKey(prevKey => prevKey + 1);
    setPost(prevPost => ({
        ...prevPost,
        commentCount: (prevPost.commentCount || 0) + 1
    }));
  };

  // **THE FIX**: When the composer on this page is used, it's explicitly for replying to the main post.
  // We now pass the correct `replyToId` and `replyToPost` props.
  const handleReplyFromDetail = (newReply) => {
    // This function can be used to optimistically add the new reply to the list
    // For now, we just refresh the comment list
    handleCommentSuccess();
  }
  
  if (loading) {
    return <Loading text="Loading post..." />;
  }
  
  if (error || !post) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error || 'Post not found'}</p>
        <button 
          className="mt-2 text-primary hover:underline"
          onClick={fetchPost}
        >
          Try again
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="border-b border-gray-200 dark:border-dark-border">
        <PostItem post={post} isDetail={true} />
      </div>
      
      {user && (
        <div className="p-4 border-b border-gray-200 dark:border-dark-border">
          {/* **THE FIX**: The PostComposer is now correctly configured for replying to the main post */}
          <PostComposer 
            replyToId={post.id} 
            replyToPost={post} 
            onSuccess={handleReplyFromDetail} 
          />
        </div>
      )}
      
      <div>
        <CommentList postId={post.id} key={refreshKey} />
      </div>
    </div>
  );
};

export default PostDetail;
