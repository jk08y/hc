// src/pages/Profile.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { usePosts } from '../hooks/usePosts';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileTabs from '../components/profile/ProfileTabs';
import Loading from '../components/common/Loading';
import PostList from '../components/feed/PostList';
import PostComposer from '../components/feed/PostComposer';
import PostListSkeleton from '../components/feed/PostListSkeleton';

const Profile = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const { getUserPosts, getUserReplies, getUserMediaPosts, getUserLikedPosts } = usePosts();
  
  const [profileUser, setProfileUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const isCurrentUser = user && user.uid === profileUser?.id;

  const fetchTabData = useCallback(async (tab, userId) => {
    if (!userId) return;
    setLoadingPosts(true);
    setError(null);
    setPosts([]);
    let result;
    switch (tab) {
      case 'posts':
        result = await getUserPosts(userId);
        break;
      case 'replies':
        result = await getUserReplies(userId);
        break;
      case 'media':
        result = await getUserMediaPosts(userId);
        break;
      case 'likes':
        result = await getUserLikedPosts(userId);
        break;
      default:
        result = { success: true, data: [] };
    }
    if (result.success) {
      setPosts(result.data);
    } else {
      setError(result.error || `Failed to fetch ${tab}`);
    }
    setLoadingPosts(false);
  }, [getUserPosts, getUserReplies, getUserMediaPosts, getUserLikedPosts]);
  
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const usersQuery = query(collection(db, 'users'), where('username', '==', username));
        const userSnapshot = await getDocs(usersQuery);

        if (!userSnapshot.empty) {
          const userData = { id: userSnapshot.docs[0].id, ...userSnapshot.docs[0].data() };
          setProfileUser(userData);
          await fetchTabData(activeTab, userData.id);
        } else {
          setError('User not found');
        }
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [username]);

  useEffect(() => {
    if (profileUser) {
        fetchTabData(activeTab, profileUser.id);
    }
  }, [activeTab, profileUser, fetchTabData]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handlePostSuccess = (newPost) => {
    if (activeTab === 'posts') {
        setPosts(prevPosts => [newPost, ...prevPosts]);
    }
    setProfileUser(prev => ({ ...prev, postsCount: (prev.postsCount || 0) + 1 }));
  };

  const renderTabContent = () => {
    if (loadingPosts) return <PostListSkeleton />;
    // **THE FIX**: This will now display the detailed error from the console.
    if (error) return <div className="text-center py-8 text-red-500"><p>{error}</p></div>;
    if (posts.length === 0) return <div className="text-center py-8 text-gray-500">{`@${username} hasn't posted any ${activeTab} yet.`}</div>;
    return <PostList posts={posts} />;
  };

  if (loading) return <Loading text="Loading profile..." />;
  if (!profileUser && !loading) return <div className="text-center py-8 text-red-500"><p>User not found</p></div>;

  return (
    <div>
      <ProfileHeader 
        user={profileUser}
        isFollowing={isFollowing}
        isCurrentUser={isCurrentUser}
        onFollowStatusChange={setIsFollowing}
      />
      
      <ProfileTabs activeTab={activeTab} onChange={handleTabChange} />
      
      {isCurrentUser && activeTab === 'posts' && (
        <div className="border-b border-gray-200 dark:border-dark-border">
            <PostComposer onSuccess={handlePostSuccess} />
        </div>
      )}

      <div className="mt-1">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Profile;
