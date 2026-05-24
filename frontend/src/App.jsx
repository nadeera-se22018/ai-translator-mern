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
      
      {/* Stunning Mixed Color Wallpapers / Gradients */}
      {theme === 'dark' ? (
        <>
          {/* Dark Mode Cosmic Background - GPU Accelerated */}
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#090b10] to-[#090b10] pointer-events-none transform-gpu"></div>
          <div className="fixed top-0 left-0 w-[500px] h-[500px] sm:w-[800px] sm:h-[800px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2 transform-gpu"></div>
          <div className="fixed bottom-0 right-0 w-[600px] h-[600px] sm:w-[900px] sm:h-[900px] bg-purple-600/5 rounded-full blur-[150px] pointer-events-none translate-x-1/3 translate-y-1/3 transform-gpu"></div>
          <div className="fixed top-1/2 left-1/2 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2 transform-gpu"></div>
        </>
      ) : (
        <>
          {/* Light Mode - Clean, High-Contrast Workspace - GPU Accelerated */}
          <div className="fixed inset-0 bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] pointer-events-none transform-gpu"></div>
          {/* Single clean subtle blue glow for a highly modern tech aesthetic */}
          <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none transform-gpu"></div>
        </>
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
