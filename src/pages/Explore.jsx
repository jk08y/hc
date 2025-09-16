// src/pages/Explore.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import Loading from '../components/common/Loading';
import PostList from '../components/feed/PostList';
import Avatar from '../components/common/Avatar';
import { Link } from 'react-router-dom';
import Trends from '../components/common/Trends';

const Explore = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('top');
  const [searchResults, setSearchResults] = useState({ posts: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const performSearch = useCallback(async (queryText) => {
    if (!queryText) {
      setSearchResults({ posts: [], users: [] });
      return;
    }
    setLoading(true);
    setError(null);
    
    try {
      let posts = [];
      let users = [];
      
      // FIX: Handle hashtag search using the 'hashtags' array field
      if (queryText.startsWith('#')) {
        const hashtag = queryText.slice(1).toLowerCase();
        const postsQuery = query(
          collection(db, 'posts'),
          where('hashtags', 'array-contains', hashtag),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        const postsSnapshot = await getDocs(postsQuery);
        posts = postsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
        }));
      } else {
        // For non-hashtag searches, search both posts and users
        // Post search (basic prefix search on content)
        const postsQuery = query(
          collection(db, 'posts'),
          where('content', '>=', queryText),
          where('content', '<=', queryText + '\uf8ff'),
          orderBy('content'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const postsSnapshot = await getDocs(postsQuery);
        posts = postsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
        }));

        // User search
        const usersQuery = query(
          collection(db, 'users'),
          where('username', '>=', queryText.toLowerCase()),
          where('username', '<=', queryText.toLowerCase() + '\uf8ff'),
          limit(10)
        );
        const usersSnapshot = await getDocs(usersQuery);
        users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      
      setSearchResults({ posts, users });
    } catch (err) {
      console.error('Error performing search:', err);
      setError('An error occurred while searching');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get search query from URL params on initial load and on change
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const q = queryParams.get('q') || '';
    setSearchQuery(q);
    performSearch(q);
  }, [location.search, performSearch]);
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  const renderContent = () => {
    if (loading) {
      return <Loading text="Searching..." />;
    }
    
    if (error) {
      return <div className="text-center py-8 text-red-500"><p>{error}</p></div>;
    }
    
    const hasResults = searchResults.posts.length > 0 || searchResults.users.length > 0;

    if (searchQuery && !hasResults) {
      return (
        <div className="text-center py-8 text-gray-500">
          No results found for "{searchQuery}"
        </div>
      );
    }
    
    // If there's no search query, show default trends
    if (!searchQuery) {
        return <Trends />;
    }

    // Render different content based on active tab
    switch (activeTab) {
      case 'top':
        return (
          <>
            {searchResults.users.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">People</h2>
                <div className="space-y-2">
                  {searchResults.users.slice(0, 3).map((user) => (
                    <Link key={user.id} to={`/${user.username}`} className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-dark-light rounded-lg transition-colors">
                      <Avatar user={user} size="md" />
                      <div className="ml-3">
                        <p className="font-bold text-gray-900 dark:text-white">{user.displayName}</p>
                        <p className="text-secondary">@{user.username}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {searchResults.posts.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Posts</h2>
                <PostList posts={searchResults.posts} />
              </div>
            )}
          </>
        );
      case 'latest':
        return <PostList posts={searchResults.posts} />;
      case 'people':
        return (
            <div className="space-y-2">
                {searchResults.users.map((user) => (
                    <Link key={user.id} to={`/${user.username}`} className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-dark-light rounded-lg transition-colors">
                        <Avatar user={user} size="md" />
                        <div className="ml-3">
                            <p className="font-bold text-gray-900 dark:text-white">{user.displayName}</p>
                            <p className="text-secondary">@{user.username}</p>
                            {user.bio && <p className="mt-1 text-gray-700 dark:text-gray-300 text-sm">{user.bio}</p>}
                        </div>
                    </Link>
                ))}
            </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div>
      <div className="p-4">
        <form onSubmit={handleSearchSubmit}>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
              <FaSearch />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search HeyChat"
              className="w-full bg-gray-100 dark:bg-dark-light border-none rounded-full py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary"
            />
          </div>
        </form>
      </div>
      
      {searchQuery && (
        <div className="border-b border-gray-200 dark:border-dark-border">
          <div className="flex justify-around">
            {['top', 'latest', 'people'].map((tab) => (
              <button
                key={tab}
                className={`flex-1 py-3 text-center font-medium relative ${activeTab === tab ? 'text-gray-900 dark:text-white' : 'text-secondary hover:bg-gray-100 dark:hover:bg-dark-light'}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full"></div>}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-4">{renderContent()}</div>
    </div>
  );
};

export default Explore;
