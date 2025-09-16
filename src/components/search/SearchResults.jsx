// src/components/search/SearchResults.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import Avatar from '../common/Avatar';
import PostItem from '../feed/PostItem';
import Loading from '../common/Loading';

const SearchResults = ({ searchQuery, onClose = null }) => {
  const [results, setResults] = useState({ users: [], posts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery.trim()) {
        setResults({ users: [], posts: [] });
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Search users
        const usersQuery = query(
          collection(db, 'users'),
          where('username', '>=', searchQuery.toLowerCase()),
          where('username', '<=', searchQuery.toLowerCase() + '\uf8ff'),
          limit(5)
        );
        
        const usersSnapshot = await getDocs(usersQuery);
        const users = [];
        
        usersSnapshot.forEach((doc) => {
          users.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        // Search by display name if less than 5 results
        if (users.length < 5) {
          const displayNameQuery = query(
            collection(db, 'users'),
            where('displayName', '>=', searchQuery),
            where('displayName', '<=', searchQuery + '\uf8ff'),
            limit(5 - users.length)
          );
          
          const displayNameSnapshot = await getDocs(displayNameQuery);
          
          displayNameSnapshot.forEach((doc) => {
            // Check if already added
            if (!users.some(user => user.id === doc.id)) {
              users.push({
                id: doc.id,
                ...doc.data()
              });
            }
          });
        }
        
        // Search posts by content
        const postsQuery = query(
          collection(db, 'posts'),
          where('content', '>=', searchQuery),
          where('content', '<=', searchQuery + '\uf8ff'),
          orderBy('content'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        
        const postsSnapshot = await getDocs(postsQuery);
        const posts = [];
        
        postsSnapshot.forEach((doc) => {
          posts.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
          });
        });
        
        setResults({ users, posts });
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError('An error occurred while searching');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [searchQuery]);
  
  if (loading) {
    return (
      <div className="p-3 sm:p-4">
        <Loading />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-3 sm:p-4 text-red-500 text-center text-sm sm:text-base">
        <p>{error}</p>
      </div>
    );
  }
  
  const { users, posts } = results;
  const hasResults = users.length > 0 || posts.length > 0;
  
  if (!hasResults) {
    return (
      <div className="p-3 sm:p-4 text-center text-gray-500 text-sm sm:text-base">
        <p>No results found for "{searchQuery}"</p>
      </div>
    );
  }
  
  const handleItemClick = () => {
    if (onClose) {
      onClose();
    }
  };
  
  return (
    <div className="divide-y divide-gray-200 dark:divide-dark-border">
      {/* Users section */}
      {users.length > 0 && (
        <div className="p-3 sm:p-4">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">People</h3>
          
          <div className="space-y-3 sm:space-y-4">
            {users.map((user) => (
              <Link
                key={user.id}
                to={`/${user.username}`}
                className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-dark-light rounded-lg transition-colors"
                onClick={handleItemClick}
              >
                <Avatar user={user} size="sm" className="sm:hidden" />
                <Avatar user={user} size="md" className="hidden sm:block" />
                <div className="ml-2 sm:ml-3 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                    {user.displayName}
                  </p>
                  <p className="text-secondary text-xs sm:text-sm truncate">@{user.username}</p>
                </div>
              </Link>
            ))}
          </div>
          
          <Link
            to={`/explore/people?q=${encodeURIComponent(searchQuery)}`}
            className="block mt-2 text-primary hover:underline text-sm"
            onClick={handleItemClick}
          >
            Show more people
          </Link>
        </div>
      )}
      
      {/* Posts section */}
      {posts.length > 0 && (
        <div className="p-3 sm:p-4">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Posts</h3>
          
          <div className="space-y-3 sm:space-y-4">
            {posts.map((post) => (
              <div key={post.id} onClick={handleItemClick}>
                <PostItem post={post} />
              </div>
            ))}
          </div>
          
          <Link
            to={`/explore?q=${encodeURIComponent(searchQuery)}`}
            className="block mt-2 text-primary hover:underline text-sm"
            onClick={handleItemClick}
          >
            Show more posts
          </Link>
        </div>
      )}
    </div>
  );
};

export default SearchResults;