// src/components/profile/ProfileTabs.jsx
import React from 'react';

const ProfileTabs = ({ activeTab, onChange }) => {
  const tabs = [
    { id: 'posts', label: 'Posts' },
    { id: 'replies', label: 'Replies' },
    { id: 'media', label: 'Media' },
    { id: 'likes', label: 'Likes' }
  ];
  
  return (
    <div className="border-b border-gray-200 dark:border-dark-border overflow-x-auto scrollbar-none">
      <div className="flex min-w-max">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`
              flex-1 py-3 px-3 text-center font-medium relative min-w-[70px]
              ${activeTab === tab.id 
                ? 'text-gray-900 dark:text-white' 
                : 'text-secondary hover:bg-gray-100 dark:hover:bg-dark-light'}
              text-sm sm:text-base
            `}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-1/2 w-12 h-1 bg-primary rounded-full transform -translate-x-1/2"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileTabs;