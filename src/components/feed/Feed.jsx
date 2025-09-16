// src/components/feed/Feed.jsx
import React, { useState, useEffect } from 'react';
import { usePosts } from '../../hooks/usePosts';
import { useAuth } from '../../hooks/useAuth';
import PostList from './PostList';
import PostComposer from './PostComposer';
import Loading from '../common/Loading';
import { useUI } from '../../hooks/useUI';

const Feed = ({ username = null, isProfile = false }) => {
  const { user } = useAuth();
  const { getPosts, getUserPosts } = usePosts();
  const { currentTab } = useUI();
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let result;
        
        if (isProfile && username) {
          // Fetch user's posts for profile page
          result = await getUserPosts(username);
        } else {
          // Fetch feed posts
          // For 'following' tab, we would implement a different fetch
          // This is simplified for now
          result = await getPosts();
        }
        
        if (result.success) {
          setPosts(result.data);
        } else {
          setError(result.error || 'Failed to fetch posts');
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [getPosts, getUserPosts, username, isProfile, currentTab]);
  
  if (loading) {
    return <Loading text="Loading posts..." />;
  }
  
  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
        <button 
          className="mt-2 text-primary hover:underline"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  }
  
  return (
    <div>
      {user && !isProfile && (
        <PostComposer />
      )}
      
      {posts.length > 0 ? (
        <PostList posts={posts} />
      ) : (
        <div className="text-center py-8 text-gray-500">
          {isProfile 
            ? 'No posts yet' 
            : 'No posts in your feed. Follow more users to see their posts!'}
        </div>
      )}
    </div>
  );
};

export default Feed;