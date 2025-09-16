// src/pages/Bookmarks.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import PostList from '../components/feed/PostList';
import Loading from '../components/common/Loading';
import { FaBookmark } from 'react-icons/fa';

const Bookmarks = () => {
  const { user } = useAuth();
  
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // FIX: Query the user's private "bookmarks" subcollection
        const bookmarksQuery = query(
          collection(db, `users/${user.uid}/bookmarks`),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(bookmarksQuery);
        const postIds = querySnapshot.docs.map(doc => doc.data().postId);
        
        if (postIds.length === 0) {
          setBookmarkedPosts([]);
          setLoading(false);
          return;
        }

        // Fetch the actual posts using the retrieved postIds
        const posts = [];
        for (const postId of postIds) {
          const postRef = doc(db, 'posts', postId);
          const postSnap = await getDoc(postRef);
          
          if (postSnap.exists()) {
            posts.push({
              id: postSnap.id,
              ...postSnap.data(),
              createdAt: postSnap.data().createdAt?.toDate().toISOString() || new Date().toISOString(),
              // Manually set isBookmarked to true for the UI
              isBookmarked: true, 
            });
          }
        }
        
        setBookmarkedPosts(posts);
      } catch (err) {
        console.error('Error fetching bookmarks:', err);
        setError('An unexpected error occurred while fetching your bookmarks.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookmarks();
  }, [user]);
  
  if (loading) {
    return <Loading text="Loading bookmarks..." />;
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
      {bookmarkedPosts.length === 0 ? (
        <div className="text-center py-16 px-4">
          <FaBookmark className="mx-auto text-gray-300 dark:text-gray-700 text-6xl mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            You haven't saved any posts yet
          </h2>
          <p className="text-gray-500">
            When you bookmark a post, it will appear here.
          </p>
        </div>
      ) : (
        <PostList posts={bookmarkedPosts} />
      )}
    </div>
  );
};

export default Bookmarks;
