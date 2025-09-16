// src/components/feed/PostComposer.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FaImage, FaSmile, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { usePosts } from '../../hooks/usePosts';
import { useUI } from '../../hooks/useUI';
import Avatar from '../common/Avatar';
import { validatePostContent, validateImage } from '../../utils/validators';
import Modal from '../common/Modal';
import Button from '../common/Button';

const PostComposer = ({ isModal = false, onSuccess = null, replyToPost = null }) => {
  // **THE FIX**: Correctly called the useAuth() hook as a function.
  const { user, userData, isSuspended } = useAuth();
  const { createPost } = usePosts();
  const { showToast, isComposerOpen, closeComposer, replyingTo } = useUI();
  
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const postBeingRepliedTo = replyToPost || replyingTo;

  const MAX_CHARS = 280;
  const MAX_MEDIA = 4;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);
  
  const handleContentChange = (e) => {
    setContent(e.target.value);
    if (error) setError('');
  };
  
  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    if (mediaFiles.length + files.length > MAX_MEDIA) {
      showToast(`You can only upload up to ${MAX_MEDIA} images.`, 'error');
      return;
    }
    const validFiles = [];
    const validPreviewUrls = [];
    files.forEach(file => {
      const validation = validateImage(file);
      if (validation.valid) {
        validFiles.push(file);
        validPreviewUrls.push(URL.createObjectURL(file));
      } else {
        showToast(validation.message, 'error');
      }
    });
    setMediaFiles(prev => [...prev, ...validFiles]);
    setMediaPreviewUrls(prev => [...prev, ...validPreviewUrls]);
  };
  
  const removeMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(mediaPreviewUrls[index]);
    setMediaPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async () => {
    const replyToId = postBeingRepliedTo ? postBeingRepliedTo.id : null;
    const validation = validatePostContent(content, MAX_CHARS);
    if (!validation.valid && mediaFiles.length === 0) {
      setError(validation.message);
      return;
    }
    setLoading(true);
    try {
      const result = await createPost(content, mediaFiles, replyToId);
      if (result.success) {
        setContent('');
        setMediaFiles([]);
        setMediaPreviewUrls([]);
        showToast(replyToId ? 'Reply posted!' : 'Your post was sent!', 'success');
        if (onSuccess) onSuccess(result.post);
        if (isModal) closeComposer();
      } else {
        setError(result.error || 'Failed to create post.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };
  
  if (isSuspended) {
    return null;
  }

  const composerContent = (
    <div className="w-full">
      {postBeingRepliedTo && (
        <div className="mb-2 pl-12 text-sm text-secondary">
          Replying to <span className="text-primary">@{postBeingRepliedTo.username}</span>
        </div>
      )}
      <div className="flex">
        <div className="mr-3 shrink-0">
          <Avatar user={userData} size="md" />
        </div>
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            placeholder={postBeingRepliedTo ? "Post your reply" : "What's happening?!"}
            value={content}
            onChange={handleContentChange}
            className="w-full bg-transparent border-none resize-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 text-xl overflow-y-hidden p-0"
            rows={1}
            disabled={loading}
          />
          {mediaPreviewUrls.length > 0 && (
            <div className={`grid gap-2 mt-3 rounded-2xl overflow-hidden border border-gray-200 dark:border-dark-border ${mediaPreviewUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {mediaPreviewUrls.map((url, index) => (
                <div key={index} className="relative aspect-video">
                  <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                  <button type="button" className="absolute top-1.5 right-1.5 p-1 bg-black/60 text-white rounded-full hover:bg-black/80" onClick={() => removeMedia(index)}>
                    <FaTimes size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {error && <p className="text-danger text-sm mt-2">{error}</p>}
          <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-200 dark:border-dark-border">
            <div className="flex items-center space-x-1">
              <button type="button" className="p-2 text-primary rounded-full hover:bg-primary/10 disabled:opacity-50" onClick={() => fileInputRef.current.click()} disabled={loading || mediaFiles.length >= MAX_MEDIA}>
                <FaImage size={20} />
              </button>
              <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleMediaUpload} className="hidden" />
              <button type="button" className="p-2 text-primary rounded-full hover:bg-primary/10 disabled:opacity-50" disabled={loading}>
                <FaSmile size={20} />
              </button>
            </div>
            <div className="flex items-center">
              <div className={`mr-3 text-sm font-medium ${content.length > MAX_CHARS ? 'text-danger' : 'text-gray-500'}`}>
                {content.length > 0 && `${content.length} / ${MAX_CHARS}`}
              </div>
              <Button variant="primary" size="sm" rounded="full" onClick={handleSubmit} disabled={loading || (!content.trim() && mediaFiles.length === 0) || content.length > MAX_CHARS}>
                {loading ? 'Posting...' : (postBeingRepliedTo ? 'Reply' : 'Post')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  if (isModal) {
    return (
      <Modal isOpen={isComposerOpen} onClose={closeComposer} title="" size="md" className="p-0">
        <div className="p-4">{composerContent}</div>
      </Modal>
    );
  }
  
  return (
    <div className="p-4 border-b border-gray-200 dark:border-dark-border">
      {composerContent}
    </div>
  );
};

export default PostComposer;
