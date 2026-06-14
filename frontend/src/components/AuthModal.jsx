import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser, resetAuth, toggleAuthModal } from '../features/auth/authSlice';
import { toast } from 'react-hot-toast';
import { fetchHistory } from '../features/translation/translationSlice';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ai-translator-backend-six.vercel.app';

const AuthModal = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const { name, email, password } = formData;

  const dispatch = useDispatch();
  const { login: contextLogin } = useAuth();

  const { isLoading, isError, isSuccess, message, showAuthModal, user } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      setTimeout(() => dispatch(resetAuth()), 3000);
    }
    
    // If successfully logged in, close modal
    if (isSuccess && user) {
      dispatch(resetAuth());
    }
  }, [isError, isSuccess, user, message, dispatch]);

  if (!showAuthModal) return null;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (isLogin) {
      const userData = { email, password };
      dispatch(loginUser(userData));
    } else {
      const userData = { name, email, password };
      dispatch(registerUser(userData));
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.error || 'Google login failed');
        return;
      }

      const data = await res.json();
      contextLogin(data);
      dispatch(toggleAuthModal());
    } catch (err) {
      console.error('Google Auth Error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300">
      <div 
        className="fixed inset-0" 
        onClick={() => dispatch(toggleAuthModal())}
      ></div>
      
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <button 
            onClick={() => dispatch(toggleAuthModal())}
            className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {isError && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800/50">
              {message}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={onChange}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white transition-all"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={onChange}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
                isLoading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98]'
              }`}
            >
              {isLoading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 dark:text-slate-500 font-semibold">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.log('Google Sign-In Failed')}
              theme="filled_blue"
              shape="pill"
              width="100%"
            />
          </div>

          <div className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
