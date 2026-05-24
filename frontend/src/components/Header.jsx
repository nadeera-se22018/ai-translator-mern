import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme, toggleSettings } from '../features/settings/settingsSlice';
import { toggleAuthModal } from '../features/auth/authSlice';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

import { setHistoryTab } from '../features/translation/translationSlice';

const HeaderAvatar = ({ user, onLogout }) => {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div className="relative group">
      <button className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform flex-shrink-0 bg-slate-100 dark:bg-slate-800 cursor-pointer">
        {user.avatar && !imgError ? (
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm sm:text-base">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        )}
      </button>
      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
          <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
        </div>
        <button 
          onClick={onLogout}
          className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-b-xl transition-colors cursor-pointer"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

const Header = () => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.settings);
  const { user, login, logout } = useAuth();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'LkTranslaterAI',
          text: 'Check out this awesome AI Translator!',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const navigateToTab = (tabId) => {
    dispatch(setHistoryTab(tabId));
    document.getElementById('history-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch('https://ai-translator-backend-six.vercel.app/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || 'Google login failed');
        return;
      }

      const data = await res.json();
      login(data);
    } catch (err) {
      console.error('Google Auth Error:', err);
    }
  };

  return (
    <header className="w-full py-3.5 sm:py-5 px-3 sm:px-6 lg:px-12 xl:px-24 sticky top-0 z-50 bg-white/70 dark:bg-[#0f1117]/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 transition-colors duration-500">
      <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-2">
        
        {/* Logo Area */}
        <div className="flex items-center gap-2 sm:gap-4 cursor-pointer min-w-0" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform flex-shrink-0">
            <svg className="w-5 h-5 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
          </div>
          <h1 className="text-lg sm:text-2xl lg:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 truncate">
            <span className="hidden xs:inline">LkTranslater</span><span className="xs:hidden text-slate-800 dark:text-white">Lk</span><span className="text-blue-500">AI</span>
          </h1>
        </div>
 
        {/* Navigation Bar Icons */}
        <nav className="flex items-center gap-0.5 sm:gap-2">
          {/* Favorites */}
          <button onClick={() => navigateToTab('favorites')} className="p-2 sm:p-3 rounded-full text-slate-500 hover:text-yellow-500 dark:text-slate-400 dark:hover:text-yellow-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Favorites">
            <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
          </button>
          
          {/* History */}
          <button onClick={() => navigateToTab('history')} className="p-2 sm:p-3 rounded-full text-slate-500 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="History">
            <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>
 
          {/* Share */}
          <button onClick={handleShare} className="p-2 sm:p-3 rounded-full text-slate-500 hover:text-emerald-500 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Share App">
            <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          </button>
 
          <div className="hidden xs:block w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1.5 sm:mx-3"></div>
 
          {/* Theme Toggle */}
          <button onClick={() => dispatch(toggleTheme())} className="p-2 sm:p-3 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Toggle Theme">
            {theme === 'dark' ? (
              <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
 
          {/* Settings */}
          <button onClick={() => dispatch(toggleSettings())} className="p-2 sm:p-3 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Settings">
            <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
 
          <div className="hidden xs:block w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1.5 sm:mx-3"></div>
 
          {/* Auth Button */}
          {user ? (
            <HeaderAvatar user={user} onLogout={logout} />
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Premium custom Google login button with absolute SVG backdrop */}
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform cursor-pointer overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <div className="absolute inset-0 opacity-0 cursor-pointer">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => console.log('Google Sign-In Failed')}
                    type="icon"
                    shape="circle"
                    theme="outline"
                  />
                </div>
              </div>
              <button 
                onClick={() => dispatch(toggleAuthModal())}
                className="px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm transition-colors flex-shrink-0 cursor-pointer"
              >
                Login
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
