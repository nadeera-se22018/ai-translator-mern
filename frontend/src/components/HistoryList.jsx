import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleFavorite, setHistoryTab } from '../features/translation/translationSlice';

const HistoryList = () => {
  const dispatch = useDispatch();
  const { history, favorites, historyTab } = useSelector((state) => state.translation);
  const activeTab = historyTab || 'history';

  if (history.length === 0 && favorites.length === 0) return null;

  const currentList = activeTab === 'history' ? history : favorites;

  const isFavorite = (item) => {
    return favorites.some(fav => fav.inputText === item.inputText && fav.translatedText === item.translatedText);
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-8 sm:mt-12 mb-8 px-2 sm:px-4">
      <div className="flex items-center gap-4 mb-6 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => dispatch(setHistoryTab('history'))}
          className={`pb-3 px-2 sm:px-4 text-sm sm:text-lg font-bold transition-all relative ${activeTab === 'history' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Recent Translations
          {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400"></div>}
        </button>
        <button
          onClick={() => dispatch(setHistoryTab('favorites'))}
          className={`pb-3 px-2 sm:px-4 text-sm sm:text-lg font-bold transition-all relative ${activeTab === 'favorites' ? 'text-yellow-500 dark:text-yellow-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Favorites
          {activeTab === 'favorites' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-500 dark:bg-yellow-400"></div>}
        </button>
      </div>

      {currentList.length === 0 ? (
        <div className="text-center py-10 text-slate-400 dark:text-slate-500">
          No {activeTab} yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentList.map((item, index) => (
            <div
              key={item._id || index}
              className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow relative group"
            >
              <button
                onClick={() => dispatch(toggleFavorite(item))}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
              >
                <svg className={`w-5 h-5 ${isFavorite(item) ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300 dark:text-slate-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>

              <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 pr-6">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{item.sourceLanguage}</span>
                  <span>&rarr;</span>
                  <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{item.targetLanguage}</span>
                </div>
                {item.mode && (
                  <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider 
                    ${item.mode === 'normal' 
                      ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/30 dark:border-blue-800/30' 
                      : item.mode === 'gemini'
                      ? 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/30 dark:border-indigo-800/30'
                      : 'bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200/30 dark:border-orange-800/30'
                    }`}
                  >
                    {item.mode === 'normal' ? 'Normal' : item.mode === 'gemini' ? 'AI Gemini' : 'AI Groq'}
                  </span>
                )}
              </div>

              <div className="space-y-3 text-sm sm:text-base">
                <div>
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{item.inputText}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/50">
                  <p className="text-blue-600 dark:text-blue-400 font-semibold whitespace-pre-wrap">{item.translatedText}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryList;
