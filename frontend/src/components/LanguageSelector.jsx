import React from 'react';

const LANGUAGES = [
  'English', 'Sinhala', 'Spanish', 'French', 'German', 
  'Italian', 'Portuguese', 'Russian', 'Japanese', 'Korean', 
  'Chinese (Simplified)', 'Arabic', 'Hindi'
];

const LanguageSelector = ({ value, onChange, label }) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 text-slate-800 dark:text-slate-200 font-medium py-3 pl-4 pr-10 rounded-xl outline-none cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
        aria-label={label}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang} value={lang} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
            {lang}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default LanguageSelector;
