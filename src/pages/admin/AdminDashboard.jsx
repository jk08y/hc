// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { Link } from 'react-router-dom';
import { FaUsers, FaFileAlt, FaDollarSign, FaCheckCircle } from 'react-icons/fa';
import { format } from 'date-fns';
import Avatar from '../../components/common/Avatar';
import VerificationBadge from '../../components/common/VerificationBadge';

// A reusable card for displaying key statistics.
const StatCard = ({ icon, title, value, loading, formatAsCurrency = false }) => (
    <div className="bg-white dark:bg-dark-light p-5 rounded-xl shadow-sm flex items-center">
        <div className="p-3 bg-primary/10 rounded-full mr-4 text-primary">
            {icon}
        </div>
        <div>
            <p className="text-sm text-secondary font-medium">{title}</p>
            {loading ? (
                <div className="h-8 w-24 bg-gray-200 dark:bg-dark-border animate-pulse rounded-md mt-1"></div>
            ) : (
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {formatAsCurrency ? `KES ${value.toLocaleString()}` : value.toLocaleString()}
                </p>
            )}
        </div>
    </div>
);

const AdminDashboard = () => {
  const { getDashboardStats, getRecentUsers, getRecentPayments, loading, error } = useAdmin();
  const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0, totalRevenue: 0, successfulPayments: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      // Fetch all dashboard data in parallel for faster loading.
      const [statsResult, usersResult, paymentsResult] = await Promise.all([
          getDashboardStats(),
          getRecentUsers(5),
          getRecentPayments(5)
      ]);

      if (statsResult.success) setStats(statsResult.stats);
      if (usersResult.success) setRecentUsers(usersResult.data);
      if (paymentsResult.success) setRecentPayments(paymentsResult.data);
    };
    fetchAllData();
  }, [getDashboardStats, getRecentUsers, getRecentPayments]);

  if (error) {
    return <div className="text-center text-danger p-4">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

      {/* Top statistics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={<FaUsers size={22} />} title="Total Users" value={stats.totalUsers} loading={loading} />
        <StatCard icon={<FaFileAlt size={22} />} title="Total Posts" value={stats.totalPosts} loading={loading} />
        <StatCard icon={<FaDollarSign size={22} />} title="Total Revenue" value={stats.totalRevenue} loading={loading} formatAsCurrency={true} />
        <StatCard icon={<FaCheckCircle size={22} />} title="Successful Payments" value={stats.successfulPayments} loading={loading} />
      </div>

      {/* Recent activity sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Signups Card */}
        <div className="bg-white dark:bg-dark-light p-5 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Recent Signups</h2>
          <div className="space-y-4">
            {loading && recentUsers.length === 0 ? (
                <p className="text-secondary text-sm">Loading users...</p>
            ) : recentUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between">
                <Link to={`/${user.username}`} className="flex items-center gap-3 group">
                  <Avatar user={user} size="md" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold group-hover:underline">{user.displayName}</p>
                      {user.isVerified && <VerificationBadge type={user.verificationType} />}
                    </div>
                    <p className="text-sm text-secondary">@{user.username}</p>
                  </div>
                </Link>
                <p className="text-sm text-secondary">{user.joinedAt ? format(user.joinedAt.toDate(), 'MMM d') : ''}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments Card */}
        <div className="bg-white dark:bg-dark-light p-5 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Recent Payments</h2>
          <div className="space-y-3">
             {loading && recentPayments.length === 0 ? (
                <p className="text-secondary text-sm">Loading payments...</p>
            ) : recentPayments.map(payment => (
              <div key={payment.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-dark-border">
                <div>
                  <p className="font-semibold">KES {payment.amount.toLocaleString()}</p>
                  <p className="text-xs text-secondary">{payment.mpesaReference}</p>
                </div>
                <p className="text-sm text-secondary">{payment.createdAt ? format(payment.createdAt.toDate(), 'MMM d, h:mm a') : ''}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
