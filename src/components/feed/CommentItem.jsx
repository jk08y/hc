// src/components/feed/CommentItem.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Avatar from '../common/Avatar';
import PostActions from './PostActions';
import LinkPreview from '../common/LinkPreview';
import { formatRelativeTime } from '../../utils/dateFormat';
import { formatPostText } from '../../utils/textFormat';
import VerificationBadge from '../common/VerificationBadge'; // Import the badge

const CommentItem = ({ comment }) => {
  const navigate = useNavigate();
  const {
    id,
    userId,
    username,
    displayName,
    userPhotoURL,
    content,
    mediaURLs,
    createdAt,
    isVerified,
    verificationType,
    linkPreviewURL
  } = comment;
  
  const user = {
    id: userId,
    displayName,
    username,
    photoURL: userPhotoURL,
    isVerified,
    verificationType
  };
  
  const formattedContent = formatPostText(content);

  const handleCommentClick = (e) => {
    // Prevent navigation when clicking on interactive elements
    if (e.target.closest('a, button')) return;
    navigate(`/${username}/status/${id}`);
  };
  
  return (
    <div 
        className="p-4 hover:bg-gray-50 dark:hover:bg-dark-light transition-colors cursor-pointer"
        onClick={handleCommentClick}
    >
      <div className="flex">
        <div className="mr-3">
          <Link to={`/${username}`}>
            <Avatar user={user} size="md" />
          </Link>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center mb-1 flex-wrap">
            <Link 
              to={`/${username}`}
              className="font-bold text-gray-900 dark:text-white hover:underline mr-1 truncate"
            >
              {displayName}
            </Link>
            {/* **THE FIX**: Added the verification badge */}
            {isVerified && <VerificationBadge type={verificationType} size="sm" className="mr-1" />}
            <span className="text-secondary text-sm mr-1 truncate">@{username}</span>
            <span className="text-secondary text-sm">· {formatRelativeTime(createdAt)}</span>
          </div>
          
          <div 
            className="text-gray-900 dark:text-white whitespace-pre-wrap mb-2 break-words"
            dangerouslySetInnerHTML={{ __html: formattedContent }}
          />

          {linkPreviewURL && (
            <div onClick={(e) => e.stopPropagation()}>
                <LinkPreview url={linkPreviewURL} />
            </div>
          )}
          
          {mediaURLs && mediaURLs.length > 0 && (
            <div className="mb-3 rounded-xl overflow-hidden border dark:border-dark-border">
              {mediaURLs.map((url, index) => (
                <div key={index}>
                  <img 
                    src={url}
                    alt={`Media ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
          
          {/* **THE FIX**: PostActions now works for comments, allowing replies to comments */}
          <div onClick={(e) => e.stopPropagation()}>
            <PostActions
              post={comment}
              showStats={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
