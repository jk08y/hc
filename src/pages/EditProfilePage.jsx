// src/pages/EditProfilePage.jsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCamera, FaInfoCircle, FaArrowLeft, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { useUI } from '../hooks/useUI';
import { useStorage } from '../hooks/useStorage';
import { isValidUsername, isValidURL } from '../utils/validators';
import { format } from 'date-fns';
import Loading from '../components/common/Loading';
import ImageWithLoader from '../components/common/ImageWithLoader';

const EditProfilePage = () => {
  const { userData, updateUserProfile, checkUsernameExists } = useAuth();
  const { showToast } = useUI();
  const { uploadProfileImage, uploadBannerImage } = useStorage();
  const navigate = useNavigate();
  
  if (!userData) {
    return <Loading fullScreen text="Loading profile..." />;
  }

  const [displayName, setDisplayName] = useState(userData.displayName || '');
  const [username, setUsername] = useState(userData.username || '');
  const [bio, setBio] = useState(userData.bio || '');
  const [location, setLocation] = useState(userData.location || '');
  const [website, setWebsite] = useState(userData.website || '');
  
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(userData.photoURL || '');
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [bannerImagePreview, setBannerImagePreview] = useState(userData.bannerURL || '');
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const originalUsername = userData.username;

  useEffect(() => {
    const handler = setTimeout(() => {
      if (username.toLowerCase() !== originalUsername.toLowerCase() && isValidUsername(username)) {
        setIsCheckingUsername(true);
        checkUsernameExists(username).then(isTaken => {
          setUsernameAvailable(!isTaken);
          setIsCheckingUsername(false);
        });
      } else {
        // If the username is the same as the original, it's "available" to the current user
        setUsernameAvailable(username.toLowerCase() === originalUsername.toLowerCase());
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [username, originalUsername, checkUsernameExists]);

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'profile') {
        setProfileImageFile(file);
        setProfileImagePreview(URL.createObjectURL(file));
      } else {
        setBannerImageFile(file);
        setBannerImagePreview(URL.createObjectURL(file));
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isValidUsername(username) || !usernameAvailable) {
        showToast('Please fix the errors before saving.', 'error');
        return;
    }
    
    setLoading(true);
    
    try {
      let photoURL = userData.photoURL;
      if (profileImageFile) {
        const result = await uploadProfileImage(userData.id, profileImageFile);
        if (result.success) photoURL = result.url;
      } else if (profileImagePreview === '') { photoURL = ''; }
      
      let bannerURL = userData.bannerURL;
      if (bannerImageFile) {
        const result = await uploadBannerImage(userData.id, bannerImageFile);
        if (result.success) bannerURL = result.url;
      } else if (bannerImagePreview === '') { bannerURL = ''; }
      
      const profileData = { displayName, username, bio, location, website, photoURL, bannerURL };
      const result = await updateUserProfile(profileData);
      
      if (result.success) {
        showToast('Profile updated successfully!', 'success');
        navigate(`/${username}`);
      } else {
        showToast(result.error || 'Failed to update profile', 'error');
      }
    } catch (err) {
      showToast('An unexpected error occurred', 'error');
    } finally {
        setLoading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
        <form id="edit-profile-form" onSubmit={handleSubmit}>
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-dark/80 backdrop-blur-sm p-2 flex items-center gap-4 border-b dark:border-dark-border">
                <Button variant="ghost" rounded="full" onClick={() => navigate(-1)} className="p-2"><FaArrowLeft size={18} /></Button>
                <h1 className="text-xl font-bold">Edit Profile</h1>
                <div className="ml-auto">
                    <Button type="submit" variant="primary" disabled={loading || isCheckingUsername || !usernameAvailable} rounded="full">
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>

            <div className="p-4">
                <div className="relative mb-16">
                  <div className="h-32 sm:h-48 bg-gray-200 dark:bg-dark-light relative rounded-lg group">
                    <ImageWithLoader src={bannerImagePreview || 'https://placehold.co/600x200/E1E8ED/E1E8ED?text=Banner'} alt="Banner Preview" className="w-full h-full object-cover rounded-lg" />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                      <label className="p-2 bg-black/50 rounded-full cursor-pointer text-white hover:bg-black/70"><FaCamera size={18} /><input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'banner')} className="hidden" /></label>
                    </div>
                  </div>
                  <div className="absolute -bottom-12 left-4 w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white dark:border-dark bg-gray-300 dark:bg-dark-light group">
                     <ImageWithLoader src={profileImagePreview || 'https://placehold.co/150/657786/FFFFFF?text=?'} alt="Profile Preview" className="w-full h-full object-cover rounded-full" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                      <label className="p-2 bg-black/50 rounded-full cursor-pointer text-white hover:bg-black/70"><FaCamera size={16} /><input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'profile')} className="hidden" /></label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Input label="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required disabled={loading} maxLength={50} />
                  
                  <div>
                    <Input 
                      label="Username" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                      required 
                      maxLength={15}
                    />
                    {isCheckingUsername && <p className="mt-1 text-xs text-secondary">Checking availability...</p>}
                    {username.toLowerCase() !== originalUsername.toLowerCase() && !isCheckingUsername && isValidUsername(username) && (
                        usernameAvailable ? 
                        <p className="mt-1 text-xs text-green-500 flex items-center gap-1"><FaCheckCircle /> Username is available</p> :
                        <p className="mt-1 text-xs text-danger flex items-center gap-1"><FaTimesCircle /> Username is taken</p>
                    )}
                    {!isValidUsername(username) && username.length > 0 && <p className="mt-1 text-xs text-danger">4-15 characters, letters, numbers, underscores only.</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Bio</label>
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full bg-white dark:bg-dark-light border border-gray-300 dark:border-dark-border rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-primary text-sm sm:text-base disabled:opacity-50" rows={3} maxLength={160} disabled={loading} />
                    <div className="text-right text-xs text-gray-500 dark:text-gray-400">{bio.length}/160</div>
                  </div>
                  
                  <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} disabled={loading} placeholder="e.g. Nairobi, Kenya" maxLength={30} />
                  <Input label="Website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" disabled={loading} />
                </div>
            </div>
        </form>
    </div>
  );
};

export default EditProfilePage;
