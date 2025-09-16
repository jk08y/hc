// src/components/common/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../hooks/useUI';
import Button from './Button';

const Sidebar = () => {
  const { user } = useAuth();
  const { openAuthModal } = useUI();
  
  return (
    <div className="bg-white dark:bg-dark-light rounded-lg p-4 mb-4">
      <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
        Get Started
      </h2>
      
      {!user ? (
        <div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Join HeyChat today to connect with people and share what's happening.
          </p>
          <Button 
            variant="primary"
            fullWidth
            onClick={openAuthModal}
          >
            Sign Up / Log In
          </Button>
        </div>
      ) : (
        <div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Welcome back, {user.displayName || 'User'}!
          </p>
          <Link to={`/${user.username || 'profile'}`}>
            <Button 
              variant="outline"
              fullWidth
            >
              View Profile
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Sidebar;