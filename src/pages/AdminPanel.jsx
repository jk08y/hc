// src/pages/AdminPanel.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/common/Loading';
import Avatar from '../components/common/Avatar';
import VerificationBadge from '../components/common/VerificationBadge';
import { useUI } from '../hooks/useUI';
import Button from '../components/common/Button';
import { format } from 'date-fns';

const AdminPanel = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useUI();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const usersQuery = query(collection(db, 'users'), orderBy('displayName'));
      const querySnapshot = await getDocs(usersQuery);
      const usersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
    } catch (err) {
      setError("Failed to fetch users. Please check permissions and network.");
      showToast("Failed to fetch users.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        navigate('/');
      } else {
        fetchUsers();
      }
    }
  }, [isAdmin, authLoading, navigate, fetchUsers]);

  const handleVerificationChange = async (userId, newVerificationType) => {
    try {
      const userRef = doc(db, 'users', userId);
      const isVerified = newVerificationType !== 'none';
      
      await updateDoc(userRef, {
        isVerified: isVerified,
        verificationType: isVerified ? newVerificationType : null
      });

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? { ...user, isVerified: isVerified, verificationType: isVerified ? newVerificationType : null }
            : user
        )
      );
      showToast("User verification updated successfully!", "success");
    } catch (err) {
      showToast("Failed to update verification.", "error");
    }
  };

  const handleStatusChange = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            status: newStatus
        });
        setUsers(prevUsers =>
            prevUsers.map(user =>
                user.id === userId ? { ...user, status: newStatus } : user
            )
        );
        showToast(`User account has been ${newStatus}.`, "success");
    } catch (err) {
        showToast("Failed to update user status.", "error");
    }
  };

  if (authLoading || loading) {
    return <Loading text="Loading Admin Panel..." fullScreen />;
  }

  if (error) {
    return <div className="p-4 text-center text-danger">{error}</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Admin Panel - User Management
        </h1>
        <div className="bg-white dark:bg-dark-light rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-dark-border dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">User</th>
                  <th scope="col" className="px-6 py-3">Verification</th>
                  <th scope="col" className="px-6 py-3">Premium Status</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="bg-white dark:bg-dark-light border-b dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-border">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center">
                        <Avatar user={user} size="md" />
                        <div className="ml-3">
                          <p className="font-bold">{user.displayName}</p>
                          <p className="text-secondary text-xs">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <select
                          value={user.verificationType || 'none'}
                          onChange={(e) => handleVerificationChange(user.id, e.target.value)}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-dark-border dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        >
                          <option value="none">None</option>
                          <option value="individual">Individual (Blue)</option>
                          <option value="organization">Organization (Gold)</option>
                          <option value="government">Government (Grey)</option>
                        </select>
                        {user.isVerified && (
                          <div className="ml-3 flex-shrink-0">
                            <VerificationBadge type={user.verificationType} size="md" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        {user.premium?.isVerified ? (
                            <div>
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    {user.premium.status}
                                </span>
                                <p className="text-xs text-secondary mt-1">
                                    Expires: {format(user.premium.expiresAt.toDate(), 'MMM d, yyyy')}
                                </p>
                            </div>
                        ) : 'Not Verified'}
                    </td>
                    <td className="px-6 py-4">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'suspended' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {user.status || 'active'}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        <Button
                            onClick={() => handleStatusChange(user.id, user.status)}
                            variant={user.status === 'suspended' ? 'secondary' : 'danger'}
                            size="sm"
                        >
                            {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                        </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
