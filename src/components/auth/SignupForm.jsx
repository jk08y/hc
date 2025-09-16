// src/components/auth/SignupForm.jsx
import React, { useState } from 'react';
import { FaGoogle, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../hooks/useUI';
import { isValidEmail, validatePassword } from '../../utils/validators';
import Button from '../common/Button';
import Input from '../common/Input';

const SignupForm = ({ onSwitchToLogin, onSuccess }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { registerWithEmail, signInWithGoogle } = useAuth();
  const { showToast } = useUI();
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    } else if (displayName.trim().length < 3) {
      newErrors.displayName = 'Display name must be at least 3 characters';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleEmailSignup = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const result = await registerWithEmail(email, password, displayName);
      
      if (result.success) {
        showToast('Account created successfully!', 'success');
        if (onSuccess) onSuccess();
      } else {
        showToast(result.error || 'Sign up failed. Please try again.', 'error');
      }
    } catch (error) {
      showToast('An unexpected error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        showToast('Signed up with Google successfully!', 'success');
        if (onSuccess) onSuccess();
      } else {
        showToast(result.error || 'Google sign up failed. Please try again.', 'error');
      }
    } catch (error) {
      showToast('An unexpected error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">
        Create your account
      </h2>
      
      <form onSubmit={handleEmailSignup} className="space-y-4">
        <Input
          type="text"
          name="displayName"
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter your name"
          icon={<FaUser />}
          error={errors.displayName}
          required
          disabled={loading}
        />
        
        <Input
          type="email"
          name="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          icon={<FaEnvelope />}
          error={errors.email}
          required
          disabled={loading}
        />
        
        <Input
          type="password"
          name="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
          icon={<FaLock />}
          error={errors.password}
          required
          disabled={loading}
        />
        
        <p className="text-xs text-gray-600 dark:text-gray-400">
          By signing up, you agree to our Terms, Privacy Policy, and Cookie Use.
        </p>
        
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={loading}
          className="mt-6"
        >
          {loading ? 'Creating account...' : 'Sign up'}
        </Button>
      </form>
      
      <div className="mt-4 flex items-center">
        <div className="flex-1 border-t border-gray-300 dark:border-gray-700"></div>
        <span className="mx-4 text-sm text-gray-500 dark:text-gray-400">or</span>
        <div className="flex-1 border-t border-gray-300 dark:border-gray-700"></div>
      </div>
      
      <Button
        variant="outline"
        fullWidth
        onClick={handleGoogleSignup}
        disabled={loading}
        className="mt-4"
        icon={<FaGoogle />}
      >
        Continue with Google
      </Button>      
      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-primary hover:underline font-medium"
          disabled={loading}
        >
          Log in
        </button>
      </p>
    </div>
  );
};

export default SignupForm;
