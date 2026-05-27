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

        <footer className="py-6 text-center text-xs sm:text-sm font-medium text-slate-500/80 mt-auto">
          <p>&copy; {new Date().getFullYear()} LkTranslaterAI. Modern Edition.</p>
        </footer>
      </div>

      <SettingsModal />
      <AuthModal />
    </div>
  );
}

export default App;
