// src/pages/Home.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, getDocs, limit as firestoreLimit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useUI } from '../hooks/useUI';
import { useAuth } from '../hooks/useAuth';
import PostList from '../components/feed/PostList';
import PostComposer from '../components/feed/PostComposer';
import PostListSkeleton from '../components/feed/PostListSkeleton'; // Import the skeleton loader

const Home = () => {
  const { currentTab } = useUI();
  const { user } = useAuth();
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let finalPosts = [];
      
      if (currentTab === 'following' && user) {
        const followingQuery = query(collection(db, 'follows'), where('followerId', '==', user.uid));
        const followingSnapshot = await getDocs(followingQuery);
        const followingIds = followingSnapshot.docs.map(doc => doc.data().followingId);
        const allUserIds = [...new Set([...followingIds, user.uid])];

        if (allUserIds.length > 0) {
          const postsQuery = query(
            collection(db, 'posts'),
            where('userId', 'in', allUserIds.slice(0, 30)),
            orderBy('createdAt', 'desc'),
            firestoreLimit(30)
          );
          const postsSnapshot = await getDocs(postsQuery);
          finalPosts = postsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
          }));
        }
      } else {
        const popularPostsQuery = query(
            collection(db, 'posts'),
            where('isReply', '==', false),
            orderBy('likeCount', 'desc'),
            firestoreLimit(20)
        );
        const popularPostsSnapshot = await getDocs(popularPostsQuery);
        finalPosts = popularPostsSnapshot.docs.map(doc => ({
            id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate().toISOString()
        }));
      }
      
      setPosts(finalPosts);
    } catch (err) {
      setError('An unexpected error occurred while fetching posts.');
    } finally {
      setLoading(false);
    }
  }, [currentTab, user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);
  
  // **THE FIX**: Render the skeleton loader while `loading` is true.
  if (loading) {
    return (
        <div>
            {user && <PostComposer />}
            <PostListSkeleton />
        </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
        <button 
          className="mt-2 text-primary hover:underline"
          onClick={fetchPosts}
        >
          Try again
        </button>
      </div>
    );
  }
  
  return (
    <div>
      {user && (
        <PostComposer />
      )}
      
      {posts.length > 0 ? (
        <PostList posts={posts} />
      ) : (
        <div className="text-center py-8 text-gray-500 px-4">
          {currentTab === 'following' 
            ? "Your following feed is empty. Follow some accounts to see their posts here!" 
            : "Welcome to HeyChat! Start by following some accounts or exploring what's trending."}
        </div>
      )}
    </div>
  );
};

export default Home;
