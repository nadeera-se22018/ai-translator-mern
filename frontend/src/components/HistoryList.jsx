import React from 'react';
import { useSelector } from 'react-redux';

const HistoryList = () => {
  const { history } = useSelector((state) => state.translation);

  if (history.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto my-12 px-4">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Recent Translations
      </h2>
      
      <div className="space-y-4">
        {history.map((item, index) => (
          <div 
            key={item._id || index} 
            className="group glass dark:glass-dark rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
              <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800">{item.sourceLanguage}</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800">{item.targetLanguage}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="pr-4 border-r border-transparent md:border-slate-200 dark:md:border-slate-700">
                <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{item.inputText}</p>
              </div>
              <div className="pl-0 md:pl-4">
                <p className="text-indigo-600 dark:text-indigo-400 font-medium whitespace-pre-wrap">{item.translatedText}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;
