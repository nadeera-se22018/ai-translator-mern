import React from 'react';

const LANGUAGES = [
  'English', 'Sinhala', 'Spanish', 'French', 'German', 
  'Italian', 'Portuguese', 'Russian', 'Japanese', 'Korean', 
  'Chinese (Simplified)', 'Arabic', 'Hindi'
];

const LanguageSelector = ({ value, onChange, label }) => {
  return (
    <div className="relative inline-block w-48">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-slate-100/50 hover:bg-slate-200/80 dark:bg-slate-800/50 dark:hover:bg-slate-700/80 transition-all duration-200 text-slate-800 dark:text-slate-100 font-semibold text-lg py-2 pl-4 pr-10 rounded-xl outline-none cursor-pointer border border-transparent focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 shadow-sm"
        aria-label={label}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang} value={lang} className="text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900">
            {lang}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default LanguageSelector;
