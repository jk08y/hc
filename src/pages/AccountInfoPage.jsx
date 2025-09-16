// src/pages/AccountInfoPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import { FaArrowLeft, FaUser, FaEnvelope, FaCalendarAlt, FaIdBadge } from 'react-icons/fa';
import { format } from 'date-fns';

const InfoRow = ({ icon, label, value }) => (
    <div className="py-4 border-b border-gray-200 dark:border-dark-border">
        <div className="flex items-center text-secondary">
            {icon}
            <span className="ml-3 text-sm font-medium">{label}</span>
        </div>
        <p className="mt-1 text-gray-900 dark:text-white">{value}</p>
    </div>
);

const AccountInfoPage = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();

  if (!userData) {
    return <Loading fullScreen text="Loading account info..." />;
  }

  return (
    <div className="max-w-2xl mx-auto">
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-dark/80 backdrop-blur-sm p-2 flex items-center gap-4 border-b dark:border-dark-border">
            <Button variant="ghost" rounded="full" onClick={() => navigate(-1)} className="p-2">
                <FaArrowLeft size={18} />
            </Button>
            <div>
                <h1 className="text-xl font-bold">Account Information</h1>
                <p className="text-sm text-secondary">@{userData.username}</p>
            </div>
        </div>

        <div className="p-4">
            <p className="text-sm text-secondary mb-4">
                This is your personal information. It will not be displayed publicly on your profile.
            </p>

            <div className="bg-white dark:bg-dark-light rounded-lg border border-gray-200 dark:border-dark-border p-4">
                <InfoRow 
                    icon={<FaIdBadge />} 
                    label="Username" 
                    value={`@${userData.username}`} 
                />
                <InfoRow 
                    icon={<FaEnvelope />} 
                    label="Email" 
                    value={userData.email} 
                />
                <InfoRow 
                    icon={<FaCalendarAlt />} 
                    label="Joined" 
                    value={userData.joinedAt ? format(userData.joinedAt.toDate(), 'MMMM d, yyyy') : 'Not available'} 
                />
            </div>

            <div className="mt-6">
                 <Button variant="outline" onClick={() => navigate('/settings/profile')}>
                    Edit Profile Information
                 </Button>
            </div>
        </div>
    </div>
  );
};

export default AccountInfoPage;
