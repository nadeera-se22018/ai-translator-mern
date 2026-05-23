import React from 'react';
import Header from './components/Header';
import TranslationBox from './components/TranslationBox';
import HistoryList from './components/HistoryList';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-x-hidden transition-colors duration-300 flex flex-col">
      {/* Abstract Background Elements for Aesthetics */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-indigo-100/50 to-transparent dark:from-indigo-900/20 dark:to-transparent pointer-events-none -z-10" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 dark:bg-purple-600/10 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-[100px] pointer-events-none -z-10" />

      <Header />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col items-center">
        <div className="text-center mb-10 max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            Break language barriers instantly.
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Powered by advanced AI models to provide natural, context-aware translations in milliseconds.
          </p>
        </div>

        <TranslationBox />
        
        <HistoryList />
      </main>

      <footer className="py-6 text-center text-sm text-slate-500 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800">
        <p>&copy; {new Date().getFullYear()} LingoAI Translator. Built with MERN & Tailwind CSS.</p>
      </footer>
    </div>
  );
}

export default App;
