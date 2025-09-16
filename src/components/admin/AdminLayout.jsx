// src/components/admin/AdminLayout.jsx
import React, { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaUsers,
  FaFileAlt,
  FaSignOutAlt,
  FaCreditCard,
  FaBars,
  FaTimes,
  FaSearch
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

const AdminLayout = () => {
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Navigation items for the admin panel
  const navItems = [
    { to: '/app-admin/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { to: '/app-admin/users', icon: <FaUsers />, label: 'Users' },
    { to: '/app-admin/posts', icon: <FaFileAlt />, label: 'Posts' },
    { to: '/app-admin/payments', icon: <FaCreditCard />, label: 'Payments' },
  ];

  // Reusable sidebar content component for both mobile and desktop
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-dark-light text-gray-800 dark:text-gray-200">
      {/* Header */}
      <div className="p-4 border-b dark:border-dark-border flex items-center justify-between h-16 flex-shrink-0">
        <Link to="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="HeyChat Logo" className="w-8 h-8" />
            <h1 className="text-xl font-bold">Admin</h1>
        </Link>
        {/* Close button for mobile view */}
        <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-dark-border"
            aria-label="Close menu"
        >
            <FaTimes />
        </button>
      </div>

      {/* Navigation - This section will scroll on short screens */}
      <nav className="flex-1 mt-4 px-2 space-y-2 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors duration-150 group ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-border'
              }`
            }
          >
            <span className="w-6 h-6 flex items-center justify-center mr-3 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer - Logout Button */}
      <div className="p-4 border-t dark:border-dark-border flex-shrink-0">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors"
          >
              <FaSignOutAlt className="mr-3" />
              Log Out
          </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark">
      {/* **THE FIX**: Mobile sidebar and overlay are now separate.
          The sidebar has a higher z-index (z-50) than the overlay (z-40),
          ensuring all its content, including links, is clickable. */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          aria-hidden="true"
        ></div>
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 shadow-lg transition-transform transform lg:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar (Fixed) */}
      <aside className="w-64 h-screen fixed top-0 left-0 shadow-md flex-col hidden lg:flex">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1">
          {/* Mobile Header */}
          <header className="lg:hidden sticky top-0 bg-white/90 dark:bg-dark-light/90 backdrop-blur-sm shadow-sm z-30 flex items-center justify-between p-2 h-16">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-border text-gray-600 dark:text-gray-300"
                aria-label="Open menu"
              >
                  <FaBars size={20} />
              </button>
              <div className="flex-1 mx-2">
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <FaSearch />
                    </span>
                    <input
                        type="search"
                        placeholder="Search..."
                        className="w-full bg-gray-100 dark:bg-dark-border border-transparent rounded-full py-2 pl-10 pr-4 focus:ring-primary focus:border-primary"
                    />
                </div>
              </div>
          </header>
          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
      </div>
    </div>
  );
};

export default AdminLayout;
