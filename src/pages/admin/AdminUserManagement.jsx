// src/pages/admin/AdminUserManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { useUI } from '../../hooks/useUI';
import Loading from '../../components/common/Loading';
import Avatar from '../../components/common/Avatar';
import VerificationBadge from '../../components/common/VerificationBadge';
import Button from '../../components/common/Button';
import { format } from 'date-fns';

const AdminUserManagement = () => {
  const { getAllUsers, updateUserStatus, updateUserVerification, loading, error } = useAdmin();
  const { showToast } = useUI();
  const [users, setUsers] = useState([]);

  const fetchUsers = useCallback(async () => {
    const result = await getAllUsers();
    if (result.success) {
      setUsers(result.data);
    } else {
      showToast(result.error, 'error');
    }
  }, [getAllUsers, showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleVerificationChange = async (userId, newVerificationType) => {
    const result = await updateUserVerification(userId, newVerificationType);
    if (result.success) {
      showToast("User verification updated!", "success");
      fetchUsers();
    } else {
      showToast(result.error, "error");
    }
  };

  const handleStatusChange = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    const result = await updateUserStatus(userId, newStatus);
    if (result.success) {
        showToast(`User account has been ${newStatus}.`, "success");
        fetchUsers();
    } else {
        showToast(result.error, "error");
    }
  };

  if (loading && users.length === 0) {
    return <Loading text="Fetching users..." />;
  }

  if (error) {
    return <div className="text-center text-danger p-4">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">User Management</h1>
      <div className="bg-white dark:bg-dark-light rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-dark-border dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">User</th>
                <th scope="col" className="px-6 py-3">Verification</th>
                <th scope="col" className="px-6 py-3">Joined</th>
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
                        <option value="individual">Individual</option>
                        <option value="organization">Organization</option>
                        <option value="government">Government</option>
                      </select>
                      {user.isVerified && <VerificationBadge type={user.verificationType} size="md" className="ml-3" />}
                    </div>
                  </td>
                  <td className="px-6 py-4">{user.joinedAt ? format(user.joinedAt.toDate(), 'MMM d, yyyy') : 'N/A'}</td>
                  <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'suspended' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {user.status || 'active'}
                      </span>
                  </td>
                  <td className="px-6 py-4">
                      <Button onClick={() => handleStatusChange(user.id, user.status)} variant={user.status === 'suspended' ? 'secondary' : 'danger'} size="sm">
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
  );
};

export default AdminUserManagement;
