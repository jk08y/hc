// src/components/profile/FollowersList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFollows } from '../../hooks/useFollows';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Loading from '../common/Loading';
import VerificationBadge from '../common/VerificationBadge'; // Import the badge

const FollowersList = ({ userId, username, isOpen, onClose }) => {
  const { getFollowers } = useFollows();
  const { user } = useAuth();

  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFollowers = async () => {
      if (!userId) return;

      setLoading(true);
      setError(null);

      try {
        const result = await getFollowers(userId);

        if (result.success) {
          setFollowers(result.data);
        } else {
          setError(result.error || 'Failed to fetch followers');
        }
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchFollowers();
    }
  }, [getFollowers, userId, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`People following ${username}`}
      size="md"
    >
      {loading ? (
        <Loading text="Loading followers..." />
      ) : error ? (
        <div className="text-center py-4 text-red-500">
          <p>{error}</p>
        </div>
      ) : followers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          @{username} doesn't have any followers yet
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-dark-border">
          {followers.map((follower) => (
            <div key={follower.id} className="py-4 px-2">
              <div className="flex items-center justify-between">
                <Link
                  to={`/${follower.username}`}
                  className="flex items-center"
                  onClick={onClose}
                >
                  <Avatar user={follower} size="md" />
                  <div className="ml-3">
                    {/* **THE FIX**: Added a flex container to place the badge next to the name. */}
                    <div className="flex items-center gap-1">
                        <p className="font-bold text-gray-900 dark:text-white">{follower.displayName}</p>
                        {follower.isVerified && <VerificationBadge type={follower.verificationType} size="sm" />}
                    </div>
                    <p className="text-secondary text-sm">@{follower.username}</p>
                  </div>
                </Link>

                {user && user.uid !== follower.id && (
                  <FollowButton userId={follower.id} />
                )}
              </div>

              {follower.bio && (
                <p className="mt-2 text-gray-700 dark:text-gray-300">
                  {follower.bio}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

// Helper component for follow/unfollow button
const FollowButton = ({ userId }) => {
  const { followUser, isFollowing } = useFollows();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFollowStatus = async () => {
      const status = await isFollowing(userId);
      setFollowing(status);
      setLoading(false);
    };

    checkFollowStatus();
  }, [isFollowing, userId]);

  const handleFollowClick = async () => {
    setLoading(true);
    try {
      const result = await followUser(userId);
      if (result.success) {
        setFollowing(result.following);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Button variant="outline" size="sm" disabled>Loading...</Button>;
  }

  return (
    <Button
      variant={following ? 'outline' : 'primary'}
      size="sm"
      onClick={handleFollowClick}
    >
      {following ? 'Following' : 'Follow'}
    </Button>
  );
};

export default FollowersList;
