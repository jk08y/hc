// src/components/layout/Sidebar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaHome, FaHashtag, FaBell, FaEnvelope, FaBookmark,
  FaUser, FaCog, FaPenNib, FaTimes, FaEllipsisH
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../hooks/useUI';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import FollowersList from '../profile/FollowersList';
import FollowingList from '../profile/FollowingList';
import VerificationBadge from '../common/VerificationBadge';

const Sidebar = ({ isMobile = false }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, userData, logout } = useAuth();
    const {
      openAuthModal,
      openComposer,
      isMobileMenuOpen,
      closeMobileMenu,
      showConfirmation,
      showToast
    } = useUI();
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);
    const menuRef = useRef(null);

    const handleLogout = async () => {
        await logout();
        navigate('/');
        closeMobileMenu();
    };

    const confirmLogout = () => {
        setShowAccountMenu(false);
        showConfirmation(
            'Log out of HeyChat?',
            'You can always log back in at any time.',
            handleLogout,
            'Log out',
            'primary'
        );
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowAccountMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    const menuItems = [
      { path: '/', label: 'Home', icon: <FaHome size={26} /> },
      { path: '/explore', label: 'Explore', icon: <FaHashtag size={26} /> },
      { path: '/notifications', label: 'Notifications', icon: <FaBell size={26} />, authRequired: true },
      { path: '/messages', label: 'Messages', icon: <FaEnvelope size={26} />, authRequired: true },
      { path: '/bookmarks', label: 'Bookmarks', icon: <FaBookmark size={26} />, authRequired: true },
      { path: user ? `/${userData?.username}` : '/profile', label: 'Profile', icon: <FaUser size={26} />, authRequired: true },
      { path: '/settings', label: 'Settings', icon: <FaCog size={26} />, authRequired: true }
    ];

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const handleItemClick = () => {
        if (isMobileMenuOpen) closeMobileMenu();
    };

    const sidebarContent = (
      // Container for desktop sidebar content
      <div className="flex flex-col h-full items-center lg:items-stretch">
        {/* Logo */}
        <div className="py-1">
            <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-full hover:bg-gray-200 dark:hover:bg-dark-light" onClick={handleItemClick}>
                <img src="/logo.svg" alt="HeyChat Logo" className="w-8 h-8" />
            </Link>
        </div>

        {/* Navigation - takes up remaining space and handles scrolling */}
        <div className="flex-1 overflow-y-auto w-full flex flex-col items-center lg:items-stretch">
            <nav className="mt-2 w-full">
                <ul className="space-y-1">
                    {menuItems.map((item) => {
                        if (item.authRequired && !user) return null;
                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center justify-center lg:justify-start p-3 rounded-full transition-colors duration-200 group w-auto lg:w-full ${isActive(item.path) ? 'font-bold' : ''} hover:bg-gray-100 dark:hover:bg-dark-border`}
                                    onClick={handleItemClick}
                                >
                                    {item.icon}
                                    <span className={`ml-5 text-xl hidden lg:inline group-hover:text-gray-900 dark:group-hover:text-white ${isActive(item.path) ? 'text-gray-900 dark:text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                                      {item.label}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Post Button - responsive size */}
            <div className="my-4 w-full flex justify-center lg:justify-start">
              {user ? (
                <Button
                  onClick={() => openComposer()}
                  variant="primary"
                  rounded="full"
                  className="w-[52px] h-[52px] lg:w-full text-lg font-bold"
                  aria-label="Create post"
                >
                  <FaPenNib size={20} className="lg:hidden" />
                  <span className="hidden lg:inline">Post</span>
                </Button>
              ) : (
                <Button
                  onClick={openAuthModal}
                  variant="primary"
                  rounded="full"
                  className="w-[52px] h-[52px] lg:w-full text-lg font-bold"
                >
                  <FaUser size={20} className="lg:hidden" />
                  <span className="hidden lg:inline">Sign In</span>
                </Button>
              )}
            </div>
        </div>

        {/* User Menu - sticks to bottom */}
        {user && (
            <div className="mt-auto mb-3 w-full" ref={menuRef}>
                <div className="relative">
                {showAccountMenu && (
                    <div className="absolute bottom-full mb-2 w-full min-w-[250px] bg-white dark:bg-dark-light rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border dark:border-dark-border py-2 z-10">
                        <ul>
                            <li><button onClick={() => showToast('Feature coming soon!', 'info')} className="w-full text-left px-4 py-3 font-bold hover:bg-gray-100 dark:hover:bg-dark-border">Add an existing account</button></li>
                            <li><button onClick={confirmLogout} className="w-full text-left px-4 py-3 font-bold hover:bg-gray-100 dark:hover:bg-dark-border">Log out @{userData?.username}</button></li>
                        </ul>
                    </div>
                )}
                <div
                  className="flex items-center justify-center lg:justify-between w-full p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-border cursor-pointer"
                  onClick={() => setShowAccountMenu(prev => !prev)}
                >
                    <div className="flex items-center min-w-0">
                      <Avatar user={userData} size="md" />
                      <div className={`ml-3 truncate hidden lg:block`}>
                          <div className="flex items-center gap-1">
                              <p className="font-bold truncate">{userData?.displayName}</p>
                              {userData?.isVerified && <VerificationBadge type={userData.verificationType} size="sm" />}
                          </div>
                          <p className="text-secondary text-sm truncate">@{userData?.username}</p>
                      </div>
                    </div>
                    <FaEllipsisH className={`text-secondary hidden lg:block`} />
                </div>
                </div>
            </div>
        )}
      </div>
    );

    // This part handles the separate mobile sidebar, which the user said was working fine.
    // It's preserved here to avoid breaking mobile functionality.
    if (isMobile) {
        const mobileSpecificContent = (
          <div className="flex flex-col h-full">
            <div className="flex-shrink-0">
                <div className="flex items-center justify-between p-4 border-b dark:border-dark-border">
                    <Link to="/" className="inline-flex items-center" onClick={handleItemClick}>
                        <img src="/logo.svg" alt="HeyChat Logo" className="w-8 h-8" />
                        <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">HeyChat</span>
                    </Link>
                    <button onClick={closeMobileMenu} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-border rounded-full">
                        <FaTimes size={18} />
                    </button>
                </div>
            </div>
    
            <div className="flex-1 overflow-y-auto">
                {user && (
                    <div className="p-4">
                        <Avatar user={userData} size="lg" />
                        <div className="flex items-center gap-1 mt-2">
                            <p className="font-extrabold text-lg">{userData?.displayName}</p>
                            {userData?.isVerified && <VerificationBadge type={userData.verificationType} size="sm" />}
                        </div>
                        <p className="text-secondary">@{userData?.username}</p>
                        <div className="flex gap-4 mt-2 text-sm">
                            <button onClick={() => setShowFollowing(true)} className="hover:underline">
                                <span className="font-bold text-gray-900 dark:text-white">{userData?.followingCount || 0}</span> Following
                            </button>
                            <button onClick={() => setShowFollowers(true)} className="hover:underline">
                                <span className="font-bold text-gray-900 dark:text-white">{userData?.followersCount || 0}</span> Followers
                            </button>
                        </div>
                    </div>
                )}
    
                <nav className="border-t dark:border-dark-border">
                    <ul className="space-y-1 p-2">
                        {menuItems.map((item) => {
                            if (item.authRequired && !user) return null;
                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`flex items-center py-3 px-3 rounded-full transition-colors duration-200 ${isActive(item.path) ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'} hover:bg-gray-100 dark:hover:bg-dark-border`}
                                        onClick={handleItemClick}
                                    >
                                        <span className="text-2xl">{item.icon}</span>
                                        <span className={`ml-4 text-xl`}>{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
    
            {user && (
                <div className="p-4 border-t dark:border-dark-border flex-shrink-0">
                    <Button variant="outline" fullWidth onClick={confirmLogout}>Log out</Button>
                </div>
            )}
            {showFollowers && <FollowersList userId={userData?.id} username={userData?.username} isOpen={showFollowers} onClose={() => setShowFollowers(false)} />}
            {showFollowing && <FollowingList userId={userData?.id} username={userData?.username} isOpen={showFollowing} onClose={() => setShowFollowing(false)} />}
          </div>
        );

        return (
            <>
                {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" onClick={closeMobileMenu}></div>}
                <aside className={`fixed inset-y-0 left-0 w-[280px] z-50 bg-white dark:bg-dark border-r border-gray-200 dark:border-dark-border transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    {mobileSpecificContent}
                </aside>
            </>
        );
    }

    // This is the desktop sidebar container
    return (
        <aside className="h-screen sticky top-0 px-2 lg:px-0">
            {sidebarContent}
        </aside>
    );
};

export default Sidebar;
