// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { adminEmail } from './config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './config/firebase';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import Bookmarks from './pages/Bookmarks';
import Profile from './pages/Profile';
import PostDetail from './pages/PostDetail';
import Settings from './pages/Settings';
import Premium from './pages/Premium';
import EditProfilePage from './pages/EditProfilePage';
import AccountInfoPage from './pages/AccountInfoPage';
import Loading from './components/common/Loading';
import ThemeSync from './components/common/ThemeSync';

// Admin Imports
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import AdminPostManagement from './pages/admin/AdminPostManagement';
import AdminPayments from './pages/admin/AdminPayments'; // Import the new page

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <Loading fullScreen />;
    return user ? children : <Navigate to="/" />;
};

const AdminRouteWrapper = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyAdminStatus = async () => {
      if (authLoading) return;
      if (!user) {
        setIsAdmin(false);
        setIsVerifying(false);
        return;
      }
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().email?.toLowerCase() === adminEmail?.toLowerCase()) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setIsVerifying(false);
      }
    };
    verifyAdminStatus();
  }, [user, authLoading]);

  if (isVerifying) {
    return <Loading fullScreen text="Verifying access..." />;
  }
  
  return isAdmin ? <Outlet /> : <Navigate to="/" />;
};

const App = () => {
  const { loading } = useAuth();

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <>
      <ThemeSync />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="explore" element={<Explore />} />
          <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="premium" element={<ProtectedRoute><Premium /></ProtectedRoute>} />
          <Route path="settings/profile" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
          <Route path="settings/account" element={<ProtectedRoute><AccountInfoPage /></ProtectedRoute>} />
          <Route path=":username" element={<Profile />} />
          <Route path=":username/status/:postId" element={<PostDetail />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>

        <Route path="/app-admin" element={<AdminRouteWrapper />}>
            <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUserManagement />} />
                <Route path="posts" element={<AdminPostManagement />} />
                <Route path="payments" element={<AdminPayments />} />
            </Route>
        </Route>
      </Routes>
    </>
  );
};

export default App;
