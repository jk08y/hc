// src/components/profile/ProfileHeader.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaLink, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import VerificationBadge from '../common/VerificationBadge';
import ImageWithLoader from '../common/ImageWithLoader';
import { formatJoinDate } from '../../utils/dateFormat';
import { useFollows } from '../../hooks/useFollows';
import { useMessaging } from '../../hooks/useMessaging'; // **THE FIX**: Corrected the import path
import { useUI } from '../../hooks/useUI';
import { useAuth } from '../../hooks/useAuth';
import { formatNumber } from '../../utils/textFormat';
import FollowersList from './FollowersList';
import FollowingList from './FollowingList';

const ProfileHeader = ({ 
  user: profileUserData, 
  isFollowing, 
  isCurrentUser,
  onFollowStatusChange
}) => {
  const { followUser } = useFollows();
  const { createOrGetConversation } = useMessaging();
  const { showToast, openAuthModal } = useUI();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(false);
  
  const formattedWebsite = profileUserData?.website ? (
    profileUserData.website.startsWith('http') ? profileUserData.website : `https://${profileUserData.website}`
  ) : '';
  
  const handleFollow = async () => {
    if (!currentUser) return openAuthModal();
    setLoadingFollow(true);
    try {
      const result = await followUser(profileUserData.id);
      if (result.success) {
        onFollowStatusChange(result.following);
        showToast(result.following ? `Following @${profileUserData.username}` : `Unfollowed @${profileUserData.username}`, 'success');
      } else {
        showToast(result.error || 'Failed to update follow status', 'error');
      }
    } catch (err) {
      showToast('An unexpected error occurred', 'error');
    } finally {
      setLoadingFollow(false);
    }
  };

  const handleMessage = async () => {
    if (!currentUser) return openAuthModal();
    setLoadingMessage(true);
    try {
        const result = await createOrGetConversation(profileUserData.id);
        if (result.success) {
            navigate(`/messages?id=${result.conversationId}`);
        } else {
            showToast(result.error || 'Could not start conversation.', 'error');
        }
    } catch (err) {
        showToast('An unexpected error occurred', 'error');
    } finally {
        setLoadingMessage(false);
    }
  };
  
  if (!profileUserData) {
    return <div className="animate-pulse h-60 bg-gray-200 dark:bg-gray-700"></div>;
  }
  
  return (
    <div>
      <div className="h-32 sm:h-48 bg-secondary-extraLight dark:bg-dark-light relative">
        {profileUserData.bannerURL && (
          <ImageWithLoader src={profileUserData.bannerURL} alt={`${profileUserData.displayName}'s banner`} className="w-full h-full object-cover" />
        )}
      </div>
      
      <div className="px-4 flex justify-between items-start mb-4">
        <div className="transform -translate-y-1/3">
          <Avatar 
            user={profileUserData}
            size="2xl"
            className="border-4 border-white dark:border-dark rounded-full"
            showVerification={false}
          />
        </div>
        <div className="pt-3 flex items-center gap-2">
            {isCurrentUser ? (
              <Button variant="outline" rounded="full" onClick={() => navigate('/settings/profile')}>Edit profile</Button>
            ) : (
              <>
                <Button variant="outline" rounded="full" onClick={handleMessage} disabled={loadingMessage} icon={<FaEnvelope />}>
                    {loadingMessage ? '...' : ''}
                </Button>
                <Button variant={isFollowing ? 'outline' : 'primary'} rounded="full" onClick={handleFollow} disabled={loadingFollow}>
                  {loadingFollow ? '...' : isFollowing ? 'Following' : 'Follow'}
                </Button>
              </>
            )}
        </div>
      </div>
      
      <div className="px-4 pb-4 -mt-10 sm:-mt-12">
        <div className="flex items-center gap-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{profileUserData.displayName}</h1>
          {profileUserData.isVerified && <VerificationBadge type={profileUserData.verificationType} size="md" />}
        </div>
        <p className="text-secondary text-base">@{profileUserData.username}</p>
        
        {profileUserData.bio && (
          <p className="mt-3 text-gray-900 dark:text-white whitespace-pre-wrap break-words">{profileUserData.bio}</p>
        )}
        
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {profileUserData.location && (
            <div className="flex items-center text-secondary"><FaMapMarkerAlt className="mr-1.5" />{profileUserData.location}</div>
          )}
          {formattedWebsite && (
            <div className="flex items-center text-primary"><FaLink className="mr-1.5" /><a href={formattedWebsite} target="_blank" rel="noopener noreferrer" className="hover:underline">{formattedWebsite.replace(/https?:\/\/(www\.)?/, '')}</a></div>
          )}
          {profileUserData.joinedAt && <div className="flex items-center text-secondary"><FaCalendarAlt className="mr-1.5 flex-shrink-0" /><span className="text-sm">Joined {formatJoinDate(profileUserData.joinedAt)}</span></div>}
        </div>
        
        <div className="mt-3 flex gap-x-4 text-sm">
          <button className="hover:underline" onClick={() => setShowFollowing(true)}>
            <span className="font-bold text-gray-900 dark:text-white">{formatNumber(profileUserData.followingCount || 0)}</span>{' '}
            <span className="text-secondary">Following</span>
          </button>
          <button className="hover:underline" onClick={() => setShowFollowers(true)}>
            <span className="font-bold text-gray-900 dark:text-white">{formatNumber(profileUserData.followersCount || 0)}</span>{' '}
            <span className="text-secondary">Followers</span>
          </button>
        </div>
      </div>
      
      {showFollowers && <FollowersList userId={profileUserData.id} username={profileUserData.username} isOpen={showFollowers} onClose={() => setShowFollowers(false)} />}
      {showFollowing && <FollowingList userId={profileUserData.id} username={profileUserData.username} isOpen={showFollowing} onClose={() => setShowFollowing(false)} />}
    </div>
  );
};

export default ProfileHeader;
