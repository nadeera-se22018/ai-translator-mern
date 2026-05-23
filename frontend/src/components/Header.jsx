import React from 'react';

const Header = () => {
  return (
    <header className="w-full py-6 px-8 flex justify-between items-center glass-dark dark:glass-dark glass">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
          Lingo<span className="text-gradient">AI</span>
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        {/* We can add dark mode toggle here later if needed */}
        <div className="hidden sm:flex px-4 py-1.5 rounded-full bg-slate-200/50 dark:bg-slate-800/50 text-sm font-medium text-slate-600 dark:text-slate-300">
          Powered by Gemini 2.5
        </div>
      </div>
    </header>
  );
};

export default Header;
