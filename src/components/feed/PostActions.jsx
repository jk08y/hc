// src/components/feed/PostActions.jsx
import React, { useState, useEffect } from 'react';
import { FaRegComment, FaComment, FaRetweet, FaRegHeart, FaHeart, FaBookmark, FaRegBookmark, FaShare } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../hooks/useUI';
import { usePosts } from '../../hooks/usePosts';
import { formatNumber } from '../../utils/textFormat';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

const PostActions = ({ post, showStats = false, className = '' }) => {
  const { user, isUserDocReady } = useAuth();
  const { openAuthModal, openComposer, showToast } = useUI();
  const { likePost, bookmarkPost, unbookmarkPost, toggleRepost } = usePosts();
  
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isReposted, setIsReposted] = useState(false);

  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [repostCount, setRepostCount] = useState(post.repostCount || 0);
  
  useEffect(() => {
    if (!user || !isUserDocReady) return;

    const checkStatus = async () => {
      try {
        const likeRef = doc(db, `users/${user.uid}/likes`, post.id);
        const likeSnap = await getDoc(likeRef);
        setIsLiked(likeSnap.exists());

        const bookmarkRef = doc(db, `users/${user.uid}/bookmarks`, post.id);
        const bookmarkSnap = await getDoc(bookmarkRef);
        setIsBookmarked(bookmarkSnap.exists());
        
        const repostQuery = query(
            collection(db, 'posts'),
            where('type', '==', 'repost'),
            where('userId', '==', user.uid),
            where('originalPostId', '==', post.id)
        );
        const repostSnap = await getDocs(repostQuery);
        setIsReposted(!repostSnap.empty);

      } catch (error) {
        // Safe to ignore, can happen on first load for new users.
      }
    };
    checkStatus();
  }, [user, post.id, isUserDocReady]);


  const iconClass = "w-4 h-4 sm:w-5 sm:h-5";
  
  const handleLike = async () => {
    if (!user) return openAuthModal();
    
    const originalLiked = isLiked;
    setIsLiked(!originalLiked);
    setLikeCount(prev => originalLiked ? prev - 1 : prev + 1);

    try {
      await likePost(post.id);
    } catch (error) {
      setIsLiked(originalLiked);
      setLikeCount(prev => originalLiked ? prev + 1 : prev - 1);
      showToast("Couldn't update like.", "error");
    }
  };

  const handleRepost = async () => {
    if (!user) return openAuthModal();

    const originalReposted = isReposted;
    setIsReposted(!originalReposted);
    setRepostCount(prev => originalReposted ? prev - 1 : prev + 1);

    try {
        const result = await toggleRepost(post);
        if (!result.success) {
            throw new Error(result.error);
        }
        showToast(result.reposted ? 'Post reposted!' : 'Repost removed.', 'success');
    } catch (error) {
        setIsReposted(originalReposted);
        setRepostCount(prev => originalReposted ? prev + 1 : prev - 1);
        showToast(error.message || "Couldn't update repost.", "error");
    }
  };
  
  // **THE FIX**: This now passes the full post object to the composer.
  const handleReply = () => {
    if (!user) return openAuthModal();
    openComposer(post);
  };
  
  const handleBookmark = async () => {
    if (!user) return openAuthModal();
    
    const originalBookmarked = isBookmarked;
    setIsBookmarked(!originalBookmarked);
    try {
      if (originalBookmarked) {
        await unbookmarkPost(post.id);
        showToast('Bookmark removed.', 'success');
      } else {
        await bookmarkPost(post.id);
        showToast('Post bookmarked!', 'success');
      }
    } catch (error) {
      setIsBookmarked(originalBookmarked);
      showToast("Couldn't update bookmark.", "error");
    }
  };
  
  const handleShare = () => {
    const url = `${window.location.origin}/${post.username}/status/${post.id}`;
    if (navigator.share) {
      navigator.share({
        title: `${post.displayName} on HeyChat`,
        text: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
        url: url
      }).catch(err => {});
    } else {
      navigator.clipboard.writeText(url);
      showToast('Link copied to clipboard!', 'success');
    }
  };
  
  return (
    <div className={`flex justify-between ${className}`}>
      <button 
        className="group flex items-center text-secondary hover:text-primary"
        onClick={handleReply}
        aria-label="Reply"
      >
        <div className="p-1.5 rounded-full group-hover:bg-primary/10">
          <FaRegComment className={iconClass} />
        </div>
        {showStats && (
          <span className="ml-1 text-xs sm:text-sm group-hover:text-primary">
            {formatNumber(post.commentCount || 0)}
          </span>
        )}
      </button>
      
      <button 
        className="group flex items-center text-secondary hover:text-green-500"
        aria-label={isReposted ? "Undo repost" : "Repost"}
        onClick={handleRepost}
      >
        <div className="p-1.5 rounded-full group-hover:bg-green-500/10">
          <FaRetweet className={`${iconClass} ${isReposted ? 'text-green-500' : ''}`} />
        </div>
        {showStats && (
          <span className={`ml-1 text-xs sm:text-sm ${isReposted ? 'text-green-500' : 'group-hover:text-green-500'}`}>
            {formatNumber(repostCount)}
          </span>
        )}
      </button>
      
      <button 
        className="group flex items-center text-secondary hover:text-red-500"
        onClick={handleLike}
        aria-label={isLiked ? "Unlike" : "Like"}
      >
        <div className="p-1.5 rounded-full group-hover:bg-red-500/10">
          {isLiked ? 
            <FaHeart className={`${iconClass} text-red-500`} /> : 
            <FaRegHeart className={iconClass} />
          }
        </div>
        {showStats && (
          <span className={`ml-1 text-xs sm:text-sm ${isLiked ? 'text-red-500' : 'group-hover:text-red-500'}`}>
            {formatNumber(likeCount)}
          </span>
        )}
      </button>
      
      <div className="flex items-center">
        <button 
            className="group flex items-center text-secondary hover:text-primary"
            onClick={handleBookmark}
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
        >
            <div className="p-1.5 rounded-full group-hover:bg-primary/10">
            {isBookmarked ? 
                <FaBookmark className={`${iconClass} text-primary`} /> : 
                <FaRegBookmark className={iconClass} />
            }
            </div>
        </button>
        
        <button 
            className="group flex items-center text-secondary hover:text-primary"
            onClick={handleShare}
            aria-label="Share"
        >
            <div className="p-1.5 rounded-full group-hover:bg-primary/10">
            <FaShare className={iconClass} />
            </div>
        </button>
      </div>
    </div>
  );
};

export default PostActions;
