// src/pages/Settings.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaMoon, FaBell, FaLock, FaTrash, FaSignOutAlt, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useUI } from '../hooks/useUI';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { format } from 'date-fns';

const Settings = () => {
  const { userData, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { showToast } = useUI();
  const navigate = useNavigate();
  
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  const handleLogout = async () => {
    try {
      await logout();
      showToast('Logged out successfully', 'success');
      window.location.href = '/';
    } catch (error) {
      showToast('Failed to log out', 'error');
    }
  };
  
  const settingsItems = [
    {
      id: 'profile',
      name: 'Your Account',
      description: 'See your account information and manage your profile',
      icon: <FaUser className="text-primary" />,
      action: () => navigate('/settings/account') 
    },
    {
      id: 'appearance',
      name: 'Display',
      description: 'Manage your display theme',
      icon: <FaMoon className="text-primary" />,
      component: (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Dark mode</h3>
            <p className="text-sm text-secondary">
              {isDarkMode ? 'Currently enabled' : 'Currently disabled'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={isDarkMode} 
              onChange={toggleTheme} 
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      )
    },
    {
      id: 'notifications',
      name: 'Notifications',
      description: 'Configure how you want to be notified',
      icon: <FaBell className="text-primary" />,
      action: () => showToast('Notification settings coming soon', 'info')
    },
    {
      id: 'privacy',
      name: 'Privacy and Security',
      description: 'Manage your privacy and security settings',
      icon: <FaLock className="text-primary" />,
      action: () => showToast('Privacy settings coming soon', 'info')
    },
    {
      id: 'delete',
      name: 'Delete Account',
      description: 'Permanently delete your account and all your data',
      icon: <FaTrash className="text-red-500" />,
      action: () => setShowDeleteConfirmation(true),
      danger: true
    }
  ];
  
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Settings</h1>
      
      <div className="space-y-6">
        <div className="p-4 bg-white dark:bg-dark-light rounded-lg border border-gray-200 dark:border-dark-border">
            <div className="flex items-start">
              <div className="mr-4 mt-1">
                <FaCheckCircle className="text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-gray-900 dark:text-white">Premium</h2>
                {userData?.premium?.isVerified ? (
                    <>
                        <p className="text-secondary text-sm mb-2">You are subscribed and verified!</p>
                        <div className="p-3 bg-gray-50 dark:bg-dark-border rounded-md text-sm">
                          <p>Your subscription renews on <span className="font-bold">{format(userData.premium.expiresAt.toDate(), 'MMMM d, yyyy')}</span>.</p>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-secondary text-sm mb-4">Subscribe to get a blue checkmark on your profile.</p>
                        <Button variant="outline" onClick={() => navigate('/premium')} size="sm">
                            {userData?.premium?.status === 'expired' ? 'Renew Subscription' : 'Get Verified'}
                        </Button>
                    </>
                )}
              </div>
            </div>
        </div>

        {settingsItems.map((item) => (
          <div 
            key={item.id}
            className={`p-4 bg-white dark:bg-dark-light rounded-lg border ${
              item.danger 
                ? 'border-red-200 dark:border-red-900/20' 
                : 'border-gray-200 dark:border-dark-border'
            }`}
          >
            <div className="flex items-start">
              <div className="mr-4 mt-1">
                {item.icon}
              </div>
              <div className="flex-1">
                <h2 className={`font-bold ${
                  item.danger ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                }`}>
                  {item.name}
                </h2>
                <p className="text-secondary text-sm mb-4">
                  {item.description}
                </p>
                {item.component ? item.component : (
                  <Button
                    variant={item.danger ? 'danger' : 'outline'}
                    onClick={item.action}
                    size="sm"
                  >
                    {item.danger ? 'Delete Account' : 'Manage'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        <div className="p-4 bg-white dark:bg-dark-light rounded-lg border border-gray-200 dark:border-dark-border">
          <div className="flex items-start">
            <div className="mr-4 mt-1">
              <FaSignOutAlt className="text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-gray-900 dark:text-white">Logout</h2>
              <p className="text-secondary text-sm mb-4">Sign out from your account</p>
              <Button variant="outline" onClick={handleLogout} size="sm">Log out</Button>
            </div>
          </div>
        </div>
      </div>
      
      <Modal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        title="Delete Account"
        size="md"
      >
        <div className="p-4">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => setShowDeleteConfirmation(false)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => {
                setShowDeleteConfirmation(false);
                showToast('Account deletion feature coming soon', 'info');
              }}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
