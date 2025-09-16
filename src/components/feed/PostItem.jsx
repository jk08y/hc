// src/components/feed/PostItem.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Avatar from '../common/Avatar';
import PostActions from './PostActions';
import VerificationBadge from '../common/VerificationBadge';
import ImageWithLoader from '../common/ImageWithLoader';
import LinkPreview from '../common/LinkPreview';
import { formatRelativeTime } from '../../utils/dateFormat';
import { formatPostText } from '../../utils/textFormat';
import { FaRetweet, FaEllipsisH, FaTrash } from 'react-icons/fa';
import { useUI } from '../../hooks/useUI';
import { useAuth } from '../../hooks/useAuth';
import { usePosts } from '../../hooks/usePosts';

const PostItem = ({ post, isDetail = false }) => {
  const navigate = useNavigate();
  const { openLightbox, showConfirmation, showToast } = useUI();
  const { user } = useAuth();
  const { deletePost } = usePosts();

  const [showOptions, setShowOptions] = useState(false);

  const isRepost = post.type === 'repost';
  // If it's a repost, use the embedded original post for display.
  // Otherwise, use the post itself.
  const displayPost = isRepost ? post.originalPost : post;
  
  // A repost might not have the original post data if it was deleted.
  if (!displayPost) {
    return (
        <div className="p-4 border-b border-gray-200 dark:border-dark-border text-secondary text-sm">
            This post is unavailable.
        </div>
    );
  }

  const authorUser = {
    id: displayPost.userId,
    displayName: displayPost.displayName,
    username: displayPost.username,
    photoURL: displayPost.userPhotoURL,
    isVerified: displayPost.isVerified,
    verificationType: displayPost.verificationType
  };
  
  const formattedContent = formatPostText(displayPost.content || '');

  const getMediaGridClass = (mediaCount) => {
    if (!mediaCount) return '';
    if (mediaCount === 1) return 'grid-cols-1';
    return 'grid-cols-2';
  };

  const handlePostClick = (e) => {
    // Prevent navigation when clicking on interactive elements within the post
    if (e.target.closest('a, button, .post-options-menu, img')) return;
    navigate(`/${authorUser.username}/status/${displayPost.id}`);
  };

  const handleImageClick = (e, url) => {
    e.stopPropagation();
    openLightbox(url);
  };

  const handleDelete = async () => {
    // A user can only delete their own repost, not the original post through a repost.
    const postIdToDelete = isRepost ? post.id : displayPost.id;
    const result = await deletePost(postIdToDelete);
    if (result.success) {
        showToast('Post deleted successfully', 'success');
        if (isDetail) navigate('/');
    } else {
        showToast(result.error || 'Failed to delete post', 'error');
    }
  };

  const confirmDelete = (e) => {
    e.stopPropagation();
    setShowOptions(false);
    showConfirmation(
        'Delete Post?',
        'This can’t be undone and it will be removed from your profile, the timeline of any accounts that follow you, and from HeyChat search results.',
        handleDelete
    );
  };

  // The user can delete if it's their own original post OR their own repost.
  const isAuthor = user && user.uid === post.userId;

  return (
    <article 
        className="p-3 sm:p-4 border-b border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-light transition-colors cursor-pointer"
        onClick={handlePostClick}
        aria-label={`Post by ${authorUser.displayName}`}
    >
      {isRepost && (
        <div className="flex items-center text-secondary text-sm mb-2 ml-8">
          <FaRetweet className="mr-2" />
          <Link 
            to={`/${post.username}`} 
            className="font-bold hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {post.displayName === user?.displayName ? 'You' : post.displayName}
          </Link>
          <span className="ml-1">reposted</span>
        </div>
      )}

      <div className="flex">
        <div className="mr-2 sm:mr-3 flex-shrink-0">
          <Link to={`/${authorUser.username}`} onClick={(e) => e.stopPropagation()}>
            <Avatar user={authorUser} size="md" />
          </Link>
        </div>
        
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center mb-1 flex-wrap min-w-0">
                <div className="flex items-center gap-1">
                    <Link 
                    to={`/${authorUser.username}`}
                    className="font-bold text-gray-900 dark:text-white hover:underline truncate text-sm sm:text-base"
                    onClick={(e) => e.stopPropagation()}
                    >
                    {authorUser.displayName}
                    </Link>
                    {authorUser.isVerified && <VerificationBadge type={authorUser.verificationType} size="sm" />}
                </div>
                <span className="text-secondary text-xs sm:text-sm ml-1.5 truncate">@{authorUser.username}</span>
                <span className="text-secondary text-xs sm:text-sm ml-1.5">· {formatRelativeTime(displayPost.createdAt)}</span>
            </div>
            {isAuthor && (
                <div className="relative post-options-menu">
                    <button onClick={(e) => {e.stopPropagation(); setShowOptions(!showOptions);}} className="p-2 rounded-full text-secondary hover:bg-primary/10 hover:text-primary">
                        <FaEllipsisH />
                    </button>
                    {showOptions && (
                        <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-dark-light rounded-lg shadow-lg border dark:border-dark-border z-10">
                            <ul>
                                <li>
                                    <button onClick={confirmDelete} className="w-full text-left flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                        <FaTrash /> Delete
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            )}
          </div>
          
          {displayPost.content && (
            <div 
              className="text-gray-900 dark:text-white whitespace-pre-wrap text-sm sm:text-base break-words"
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
          )}
          
          {displayPost.linkPreviewURL && (
            <div onClick={(e) => e.stopPropagation()}>
                <LinkPreview url={displayPost.linkPreviewURL} />
            </div>
          )}

          {displayPost.mediaURLs && displayPost.mediaURLs.length > 0 && (
            <div className={`mt-3 grid ${getMediaGridClass(displayPost.mediaURLs.length)} gap-1 rounded-2xl overflow-hidden border border-gray-200 dark:border-dark-border`}>
              {displayPost.mediaURLs.map((url, index) => (
                <div
                  key={index}
                  className={`relative w-full h-full ${displayPost.mediaURLs.length > 1 ? 'aspect-w-1 aspect-h-1' : ''}`}
                >
                  <ImageWithLoader 
                    src={url} 
                    alt={`Media ${index + 1}`} 
                    className={`w-full h-full object-cover ${displayPost.mediaURLs.length === 1 ? 'max-h-[500px]' : ''}`}
                    onClick={(e) => handleImageClick(e, url)}
                  />
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-3" onClick={(e) => e.stopPropagation()}>
            <PostActions post={displayPost} showStats={true} />
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostItem;
