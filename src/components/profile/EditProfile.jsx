// src/components/profile/EditProfile.jsx
import React, { useState, useMemo } from 'react';
import { FaCamera, FaTimes, FaInfoCircle } from 'react-icons/fa';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../hooks/useUI';
import { useStorage } from '../../hooks/useStorage';
import { isValidUsername, isValidURL } from '../../utils/validators';
import { format } from 'date-fns';

const EditProfile = ({ user, onClose }) => {
  const { updateUserProfile } = useAuth();
  const { showToast } = useUI();
  const { uploadProfileImage, uploadBannerImage } = useStorage();
  
  // Form state
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [username, setUsername] = useState(user.username || '');
  const [bio, setBio] = useState(user.bio || '');
  const [location, setLocation] = useState(user.location || '');
  const [website, setWebsite] = useState(user.website || '');
  
  // Image handling state
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(user.photoURL || '');
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [bannerImagePreview, setBannerImagePreview] = useState(user.bannerURL || '');
  
  // UI state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Memoize the calculation for username change availability
  const { isUsernameChangeAllowed, usernameChangeAvailableDate } = useMemo(() => {
    if (!user.usernameLastUpdatedAt) {
      return { isUsernameChangeAllowed: true, usernameChangeAvailableDate: null };
    }
    const lastUpdated = user.usernameLastUpdatedAt.toDate();
    const thirtyDaysLater = new Date(lastUpdated.setDate(lastUpdated.getDate() + 30));
    
    if (new Date() < thirtyDaysLater) {
      return { 
        isUsernameChangeAllowed: false, 
        usernameChangeAvailableDate: format(thirtyDaysLater, 'MMM d, yyyy') 
      };
    }
    return { isUsernameChangeAllowed: true, usernameChangeAvailableDate: null };
  }, [user.usernameLastUpdatedAt]);

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Add basic image validation if needed
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };
  
  const handleBannerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerImageFile(file);
      setBannerImagePreview(URL.createObjectURL(file));
    }
  };
  
  const removeProfileImage = () => {
    setProfileImageFile(null);
    setProfileImagePreview('');
  };
  
  const removeBannerImage = () => {
    setBannerImageFile(null);
    setBannerImagePreview('');
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!displayName.trim()) newErrors.displayName = 'Display name is required';
    if (displayName.length > 50) newErrors.displayName = 'Display name cannot exceed 50 characters';
    
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (!isValidUsername(username)) {
      newErrors.username = '4-15 characters, letters, numbers, and underscores only.';
    }
    
    if (bio.length > 160) newErrors.bio = 'Bio must not exceed 160 characters';
    if (location.length > 30) newErrors.location = 'Location cannot exceed 30 characters';
    
    if (website && !isValidURL(website)) newErrors.website = 'Please enter a valid URL (e.g., https://example.com)';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      let photoURL = user.photoURL;
      let bannerURL = user.bannerURL;
      
      // Upload new images if they exist
      if (profileImageFile) {
        const result = await uploadProfileImage(user.id, profileImageFile);
        if (result.success) photoURL = result.url;
      } else if (profileImagePreview === '') {
        photoURL = ''; // Handle image removal
      }
      
      if (bannerImageFile) {
        const result = await uploadBannerImage(user.id, bannerImageFile);
        if (result.success) bannerURL = result.url;
      } else if (bannerImagePreview === '') {
        bannerURL = ''; // Handle banner removal
      }
      
      const profileData = {
        displayName,
        username,
        bio,
        location,
        website,
        photoURL,
        bannerURL
      };

      // Use the new, robust updateUserProfile function
      const result = await updateUserProfile(profileData);
      
      if (result.success) {
        showToast('Profile updated successfully!', 'success');
        onClose();
      } else {
        // Display specific errors from the backend (e.g., username taken)
        setErrors(prev => ({ ...prev, form: result.error }));
        showToast(result.error || 'Failed to update profile', 'error');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setErrors(prev => ({ ...prev, form: 'An unexpected error occurred.' }));
      showToast('An unexpected error occurred', 'error');
      setLoading(false);
    }
  };
  
  return (
    <Modal isOpen onClose={onClose} title="Edit profile" size="lg">
      <form onSubmit={handleSubmit} className="px-1">
        {/* Banner and Profile Image Section */}
        <div className="relative mb-16">
          <div className="h-32 sm:h-48 bg-gray-200 dark:bg-dark-light relative rounded-lg group">
            {bannerImagePreview && (
              <img src={bannerImagePreview} alt="Banner Preview" className="w-full h-full object-cover rounded-lg" />
            )}
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
              <label className="p-2 bg-black/50 rounded-full cursor-pointer text-white hover:bg-black/70">
                <FaCamera size={18} />
                <input type="file" accept="image/*" onChange={handleBannerImageChange} className="hidden" />
              </label>
              {bannerImagePreview && (
                <button type="button" className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70" onClick={removeBannerImage}>
                  <FaTimes size={18} />
                </button>
              )}
            </div>
          </div>
          <div className="absolute -bottom-12 left-4 w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white dark:border-dark-light bg-gray-300 dark:bg-dark group">
             {profileImagePreview && (
              <img src={profileImagePreview} alt="Profile Preview" className="w-full h-full object-cover rounded-full" />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
              <label className="p-2 bg-black/50 rounded-full cursor-pointer text-white hover:bg-black/70">
                <FaCamera size={16} />
                <input type="file" accept="image/*" onChange={handleProfileImageChange} className="hidden" />
              </label>
            </div>
          </div>
        </div>
        
        {/* Form Fields Section */}
        <div className="space-y-4">
          <Input label="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} error={errors.displayName} required disabled={loading} maxLength={50} />
          
          <div>
            <Input 
              label="Username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              error={errors.username} 
              required 
              disabled={loading || !isUsernameChangeAllowed} 
              maxLength={15}
            />
            {!isUsernameChangeAllowed && (
              <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-md flex items-center gap-2">
                <FaInfoCircle />
                <span>You can change your username again after {usernameChangeAvailableDate}.</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full bg-white dark:bg-dark-light border border-gray-300 dark:border-dark-border rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-primary text-sm sm:text-base disabled:opacity-50" rows={3} maxLength={160} disabled={loading} />
            <div className="text-right text-xs text-gray-500 dark:text-gray-400">{bio.length}/160</div>
            {errors.bio && <p className="mt-1 text-xs text-danger">{errors.bio}</p>}
          </div>
          
          <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} error={errors.location} disabled={loading} placeholder="e.g. Nairobi, Kenya" maxLength={30} />
          <Input label="Website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" error={errors.website} disabled={loading} />
        </div>
        
        {errors.form && <p className="mt-4 text-sm text-center text-danger">{errors.form}</p>}
        
        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfile;
