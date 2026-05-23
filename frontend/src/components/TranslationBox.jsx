import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setInputText, 
  setSourceLanguage, 
  setTargetLanguage, 
  swapLanguages,
  translateText,
  clearError
} from '../features/translation/translationSlice';
import LanguageSelector from './LanguageSelector';

const TranslationBox = () => {
  const dispatch = useDispatch();
  const { 
    inputText, 
    translatedText, 
    sourceLanguage, 
    targetLanguage, 
    isLoading, 
    error 
  } = useSelector((state) => state.translation);

  const debounceTimer = useRef(null);

  const handleInputChange = (e) => {
    dispatch(setInputText(e.target.value));
  };

  const handleTranslate = () => {
    if (!inputText.trim()) return;
    dispatch(translateText({ inputText, sourceLanguage, targetLanguage }));
  };

  const handleSwap = () => {
    dispatch(swapLanguages());
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-8">
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Translation Error</h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
          <button onClick={() => dispatch(clearError())} className="text-red-500 hover:text-red-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row">
        
        {/* Source Section */}
        <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
          <div className="border-b border-slate-100 dark:border-slate-800 p-2 flex items-center justify-between">
            <div className="w-48">
              <LanguageSelector 
                value={sourceLanguage} 
                onChange={(lang) => dispatch(setSourceLanguage(lang))}
                label="Source Language"
              />
            </div>
            
            {/* Mobile Swap Button */}
            <button 
              onClick={handleSwap}
              className="md:hidden p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
            </button>
          </div>
          <div className="p-4 flex-1 relative">
            <textarea
              className="w-full h-48 md:h-64 resize-none bg-transparent outline-none text-xl md:text-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 leading-relaxed"
              placeholder="Type to translate..."
              value={inputText}
              onChange={handleInputChange}
            />
            {inputText && (
              <button 
                onClick={() => dispatch(setInputText(''))}
                className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        </div>

        {/* Desktop Swap Button Overlay */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <button 
            onClick={handleSwap}
            className="p-3 rounded-full bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 text-indigo-500 hover:text-indigo-600 hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          </button>
        </div>

        {/* Target Section */}
        <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900/50">
          <div className="border-b border-slate-100 dark:border-slate-800 p-2">
            <div className="w-48">
              <LanguageSelector 
                value={targetLanguage} 
                onChange={(lang) => dispatch(setTargetLanguage(lang))}
                label="Target Language"
              />
            </div>
          </div>
          <div className="p-4 flex-1 relative">
            <div className={`w-full h-48 md:h-64 text-xl md:text-2xl text-slate-800 dark:text-slate-100 leading-relaxed overflow-y-auto ${isLoading ? 'animate-pulse text-slate-400' : ''}`}>
              {translatedText || (
                <span className="text-slate-400 dark:text-slate-500">Translation</span>
              )}
            </div>
            
            {/* Translate Button */}
            <div className="absolute bottom-6 right-6">
              <button
                onClick={handleTranslate}
                disabled={isLoading || !inputText.trim()}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white transition-all duration-300 shadow-lg 
                  ${(isLoading || !inputText.trim()) 
                    ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 hover:shadow-indigo-500/30 hover:-translate-y-0.5'
                  }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Translating...
                  </>
                ) : (
                  <>
                    Translate
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TranslationBox;
