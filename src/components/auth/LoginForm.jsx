// src/components/auth/LoginForm.jsx
import React, { useState } from 'react';
import { FaGoogle, FaEnvelope, FaLock } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../hooks/useUI';
import { isValidEmail } from '../../utils/validators';
import Button from '../common/Button';
import Input from '../common/Input';

const LoginForm = ({ onSwitchToSignup, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { loginWithEmail, signInWithGoogle } = useAuth();
  const { showToast } = useUI();
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const result = await loginWithEmail(email, password);
      
      if (result.success) {
        showToast('Logged in successfully!', 'success');
        if (onSuccess) onSuccess();
      } else {
        showToast(result.error || 'Login failed. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('An unexpected error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    setLoading(true);
    
    try {
      const result = await signInWithGoogle();
      
      if (result.success) {
        showToast('Logged in with Google successfully!', 'success');
        if (onSuccess) onSuccess();
      } else {
        showToast(result.error || 'Google login failed. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Google login error:', error);
      showToast('An unexpected error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="w-full">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">
        Log in to HeyChat
      </h2>
      
      <form onSubmit={handleEmailLogin} className="space-y-3 sm:space-y-4">
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
          placeholder="Enter your password"
          icon={<FaLock />}
          error={errors.password}
          required
          disabled={loading}
        />
        
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={loading}
          className="mt-4 sm:mt-6"
        >
          {loading ? 'Logging in...' : 'Log in'}
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
        onClick={handleGoogleLogin}
        disabled={loading}
        className="mt-4"
        icon={<FaGoogle />}
      >
        Continue with Google
      </Button>
      
      <p className="mt-5 text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-primary hover:underline font-medium"
          disabled={loading}
        >
          Sign up
        </button>
      </p>
    </div>
  );
};

export default LoginForm;