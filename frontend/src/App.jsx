import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchHistory } from './features/translation/translationSlice';
import Header from './components/Header';
import TranslationBox from './components/TranslationBox';
import HistoryList from './components/HistoryList';
import SettingsModal from './components/SettingsModal';
import AuthModal from './components/AuthModal';
import { Toaster } from 'react-hot-toast';

function App() {
  const dispatch = useDispatch();
  const { theme, fontFamily } = useSelector((state) => state.settings);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchHistory());
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-[#090b10] ${fontFamily} text-slate-900 dark:text-slate-100 flex flex-col relative overflow-x-hidden transition-colors duration-500`}>
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Stunning Mixed Color Wallpapers / Gradients - Highly Optimized Nested Radial Gradients (No Blur Filters) */}
      {theme === 'dark' ? (
        /* Dark Mode Cosmic Background - 100% GPU Accelerated Multi-Radial Gradient Layer */
        <div className="fixed inset-0 bg-[#090b10] bg-[radial-gradient(circle_at_0%_0%,rgba(37,99,235,0.04)_0%,transparent_50%),radial-gradient(circle_at_100%_100%,rgba(147,51,234,0.04)_0%,transparent_60%),radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.03)_0%,transparent_30%),radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.12)_0%,#090b10_80%)] pointer-events-none transform-gpu will-change-[transform]"></div>
      ) : (
        /* Light Mode Workspace - Clean, High-Contrast Multi-Radial Gradient Layer */
        <div className="fixed inset-0 bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.05)_0%,transparent_50%)] pointer-events-none transform-gpu will-change-[transform]"></div>
      )}
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 w-full flex flex-col items-center pt-2 sm:pt-4 pb-16 sm:pb-20">
          <TranslationBox />
          <div id="history-section" className="w-full">
            <HistoryList />
          </div>
        </main>

        <footer className="py-8 w-full mt-auto border-t border-slate-200/40 dark:border-white/5 bg-slate-50/50 dark:bg-[#090b10]/50 backdrop-blur-md">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-24 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm font-medium text-slate-500/80 dark:text-slate-400/80">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              <p>&copy; {new Date().getFullYear()} LkTranslaterAI. Modern Edition.</p>
            </div>
            
            <div className="flex items-center gap-1.5">
              <span>Designed & Developed by</span>
              <a 
                href="https://kasun-nadeera.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 relative group text-slate-800 dark:text-slate-200 font-bold hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300 cursor-pointer"
              >
                Kasun Nadeera
                <svg className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 group-hover:w-full transition-all duration-300 rounded-full"></span>
              </a>
            </div>
          </div>
        </footer>
      </div>

      <SettingsModal />
      <AuthModal />
    </div>
  );
}

export default App;
