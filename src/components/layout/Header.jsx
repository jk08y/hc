// src/components/layout/Header.jsx
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaArrowLeft, FaBars, FaSearch } from 'react-icons/fa';
import { useUI } from '../../hooks/useUI';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../common/Avatar';

const Header = () => {
  const location = useLocation();
  const { currentTab, setCurrentTab, toggleMobileMenu, openAuthModal } = useUI();
  const { user, userData } = useAuth();
  
  // Determine if we're on a nested route (not home)
  const isNestedRoute = location.pathname !== '/';
  
  // Get page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/') {
      return 'Home';
    } else if (path === '/explore') {
      return 'Explore';
    } else if (path === '/notifications') {
      return 'Notifications';
    } else if (path === '/messages') {
      return 'Messages';
    } else if (path === '/bookmarks') {
      return 'Bookmarks';
    } else if (path === '/settings') {
      return 'Settings';
    } else if (path.includes('/post/')) {
      return 'Post';
    } else if (path.includes('/status/')) {
      return 'Post';
    } else {
      return 'Profile';
    }
  };
  
  // Home tabs
  const renderHomeTabs = () => {
    if (location.pathname !== '/') return null;
    
    return (
      <div className="flex border-b border-secondary-extraLight dark:border-dark-border">
        <button
          className={`flex-1 py-3 text-center font-medium relative ${
            currentTab === 'for-you' 
              ? 'text-gray-900 dark:text-white' 
              : 'text-secondary hover:bg-gray-100 dark:hover:bg-dark-light'
          }`}
          onClick={() => setCurrentTab('for-you')}
        >
          For you
          {currentTab === 'for-you' && (
            <div className="absolute bottom-0 left-1/2 w-16 h-1 bg-primary rounded-full transform -translate-x-1/2"></div>
          )}
        </button>
        <button
          className={`flex-1 py-3 text-center font-medium relative ${
            currentTab === 'following' 
              ? 'text-gray-900 dark:text-white' 
              : 'text-secondary hover:bg-gray-100 dark:hover:bg-dark-light'
          }`}
          onClick={() => setCurrentTab('following')}
        >
          Following
          {currentTab === 'following' && (
            <div className="absolute bottom-0 left-1/2 w-16 h-1 bg-primary rounded-full transform -translate-x-1/2"></div>
          )}
        </button>
      </div>
    );
  };
  
  return (
    <header className="sticky top-0 z-10 bg-white/90 dark:bg-dark/90 backdrop-blur-sm">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center flex-1 min-w-0">
          {/* Hamburger menu (mobile only) */}
          <button 
            className="p-2 mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-light md:hidden"
            onClick={toggleMobileMenu}
          >
            <FaBars className="text-gray-700 dark:text-gray-300" />
          </button>
          
          {/* Back button or title */}
          {isNestedRoute ? (
            <div className="flex items-center">
              <Link to="/" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-light">
                <FaArrowLeft className="text-gray-700 dark:text-gray-300" />
              </Link>
              <h1 className="ml-2 text-xl font-bold text-gray-900 dark:text-white truncate">
                {getPageTitle()}
              </h1>
            </div>
          ) : (
            <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
              {getPageTitle()}
            </h1>
          )}
        </div>
        
        {/* Right side actions */}
        <div className="flex items-center">
          {/* Quick search button (mobile) */}
          <Link to="/explore" className="p-2 mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-light md:hidden">
            <FaSearch className="text-gray-700 dark:text-gray-300" />
          </Link>
          
          {/* Profile avatar for mobile quick access */}
          {user ? (
            <Link to={`/${userData?.username}`} className="md:hidden">
              <Avatar user={userData} size="sm" />
            </Link>
          ) : (
            <button 
              onClick={openAuthModal}
              className="text-sm font-medium px-3 py-1.5 bg-primary text-white rounded-full md:hidden"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
      
      {renderHomeTabs()}
    </header>
  );
};

export default Header;