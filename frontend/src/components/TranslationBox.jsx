import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setInputText, 
  setSourceLanguage, 
  setTargetLanguage, 
  swapLanguages,
  translateText,
  clearError,
  toggleFavorite,
  setTranslationMode,
  setTranslatedText
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
    error,
    favorites,
    history,
    translationMode
  } = useSelector((state) => state.translation);

  const { fontSize, fontColor, fontFamily } = useSelector((state) => state.settings);

  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechUtteranceRef = useRef(null);

  const LANGUAGE_LOCALES = {
    'English': 'en-US',
    'Sinhala': 'si-LK',
    'Spanish': 'es-ES',
    'French': 'fr-FR',
    'German': 'de-DE',
    'Italian': 'it-IT',
    'Portuguese': 'pt-PT',
    'Russian': 'ru-RU',
    'Japanese': 'ja-JP',
    'Korean': 'ko-KR',
    'Chinese (Simplified)': 'zh-CN',
    'Arabic': 'ar-SA',
    'Hindi': 'hi-IN'
  };

  useEffect(() => {
    // Cleanup synthesis on unmount
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    // Cancel speaking if translated text changes or is cleared
    if (window.speechSynthesis && !translatedText) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [translatedText]);

  const handleSpeak = () => {
    if (!window.speechSynthesis) {
      alert('Text-to-Speech is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = translatedText.trim();
    if (!textToSpeak) return;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    speechUtteranceRef.current = utterance;

    const locale = LANGUAGE_LOCALES[targetLanguage] || 'en-US';
    const voices = window.speechSynthesis.getVoices();
    
    // Find matching voice or language prefix
    let voice = voices.find(v => v.lang.toLowerCase() === locale.toLowerCase() || v.lang.toLowerCase().startsWith(locale.toLowerCase().split('-')[0]));
    
    if (voice) {
      utterance.voice = voice;
    }
    utterance.lang = locale;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = () => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    dispatch(setInputText(''));
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const currentIsFavorite = favorites && favorites.some(
    (fav) => fav.inputText === inputText && fav.translatedText === translatedText
  );

  const handleInputChange = (e) => {
    dispatch(setInputText(e.target.value));
  };

  const handleTranslate = () => {
    // RULE 3 & 4: Strict Button Click ONLY. This handler is strictly bound to the onClick event.
    console.log('[TranslationBox] Translate button explicitly clicked.');
    
    const trimmedInput = inputText.trim();
    if (!trimmedInput) return;

    // RULE: Prevent Spam and Duplicate Calls
    // This saves Gemini API free tier limits by blocking duplicate requests.
    if (history && history.length > 0) {
      const lastTranslation = history[0];
      if (
        lastTranslation.inputText === trimmedInput &&
        lastTranslation.sourceLanguage === sourceLanguage &&
        lastTranslation.targetLanguage === targetLanguage &&
        lastTranslation.mode === translationMode
      ) {
        // The text is already translated with the exact same parameters and engine. Do not hit the API again.
        console.warn('[TranslationBox] Prevented duplicate API call for identical text and mode.');
        return;
      }
    }

    console.log(`[TranslationBox] Dispatching translation request to backend using ${translationMode.toUpperCase()} mode...`);
    dispatch(translateText({ inputText: trimmedInput, sourceLanguage, targetLanguage, mode: translationMode }));
  };

  const handleSwap = () => {
    dispatch(swapLanguages());
  };

  const handleFavorite = () => {
    if (inputText && translatedText) {
      dispatch(toggleFavorite({ inputText, translatedText, sourceLanguage, targetLanguage }));
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-2 sm:my-4 px-4 sm:px-6 lg:px-8">
      
      {/* Mode Toggle Switch */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-slate-200/50 dark:bg-slate-800/50 backdrop-blur-md p-1 rounded-xl sm:rounded-2xl shadow-inner border border-slate-300/30 dark:border-slate-700/30 gap-0.5 sm:gap-1">
          <button
            onClick={() => dispatch(setTranslationMode('normal'))}
            className={`px-2.5 sm:px-5 py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm md:text-base transition-all duration-300 flex items-center gap-1.5 sm:gap-2 ${
              translationMode === 'normal' 
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md transform scale-100' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 scale-95 hover:scale-100'
            }`}
          >
            <svg className="hidden sm:block w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
            Normal
          </button>
          
          <button
            onClick={() => dispatch(setTranslationMode('gemini'))}
            className={`px-2.5 sm:px-5 py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm md:text-base transition-all duration-300 flex items-center gap-1.5 sm:gap-2 ${
              translationMode === 'gemini' 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md transform scale-100' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 scale-95 hover:scale-100'
            }`}
          >
            <svg className="hidden sm:block w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.096L15 15l-5.187.904zM19.071 4.929l-.707 3.535-.707-3.535L14.12 4.22l3.536-.707.707-3.535.707 3.535 3.536.707-3.536.708z" /></svg>
            AI Gemini
          </button>
 
          <button
            onClick={() => dispatch(setTranslationMode('groq'))}
            className={`px-2.5 sm:px-5 py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm md:text-base transition-all duration-300 flex items-center gap-1.5 sm:gap-2 ${
              translationMode === 'groq' 
                ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-md transform scale-100' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 scale-95 hover:scale-100'
            }`}
          >
            <svg className="hidden sm:block w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            AI Groq
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 sm:gap-4">
          <div className="p-1.5 sm:p-2 bg-red-500/20 rounded-lg sm:rounded-xl">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 mt-0.5 sm:mt-1">
            <p className="text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400">Translation Failed</p>
            <p className="mt-1 text-xs sm:text-sm text-red-700 dark:text-red-300/80">{error}</p>
          </div>
          <button onClick={() => dispatch(clearError())} className="mt-0.5 sm:mt-1 p-1 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Unified Translation Card - High Performance Optimized Glassmorphism - GPU Accelerated */}
      <div className={`bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-200/60 dark:border-slate-800/80 overflow-hidden relative transition-all duration-300 flex flex-col md:flex-row min-h-[300px] md:min-h-[350px] lg:min-h-[400px] transform-gpu ${fontFamily}`}>
          
        {/* Source Box */}
        <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800/60">
          {/* Header: Language Selector */}
          <div className="relative px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-center border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
            <LanguageSelector 
              value={sourceLanguage} 
              onChange={(lang) => dispatch(setSourceLanguage(lang))}
              label="Source Language"
            />
            <button 
              onClick={handleSwap}
              className="md:hidden absolute right-4 sm:right-6 p-2 sm:p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-500 transition-colors"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            </button>
          </div>
          
          {/* Input Area */}
          <div className="relative flex-1 p-4 sm:p-6 flex flex-col">
            <textarea
              className={`w-full flex-1 resize-none bg-transparent outline-none font-medium placeholder-slate-400/70 transition-all duration-300 leading-relaxed ${fontSize} ${fontColor}`}
              placeholder="Translate..."
              value={inputText}
              // RULE 2: No OnChange Fetching. Only updates local state, NEVER triggers API.
              onChange={handleInputChange}
            />
            {inputText && (
              <button 
                onClick={() => dispatch(setInputText(''))}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-1.5 sm:p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-all"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        </div>

        {/* Target Box */}
        <div className="flex-1 flex flex-col bg-slate-50/30 dark:bg-[#13151f]/30">
          {/* Header: Language Selector */}
          <div className="relative px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20 flex justify-center items-center">
            <LanguageSelector 
              value={targetLanguage} 
              onChange={(lang) => dispatch(setTargetLanguage(lang))}
              label="Target Language"
            />
            {translatedText && (
              <div className="absolute right-4 sm:right-6 flex items-center gap-1 sm:gap-2">
                {/* Speaker/Listen Button */}
                <button 
                  onClick={handleSpeak}
                  className={`p-1.5 sm:p-2 rounded-full transition-all duration-200 cursor-pointer ${
                    isSpeaking 
                      ? 'text-blue-500 bg-blue-500/10 dark:bg-blue-500/20 animate-pulse' 
                      : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-500'
                  }`}
                  title={isSpeaking ? "Stop speaking" : "Listen to translation"}
                >
                  {isSpeaking ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H10a1 1 0 01-1-1v-4z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </button>

                {/* Copy Button */}
                <button 
                  onClick={handleCopy}
                  className="p-1.5 sm:p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all duration-200 cursor-pointer"
                  title="Copy translation"
                >
                  {copied ? (
                    <svg className="w-5 h-5 text-emerald-500 scale-110 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-5 h-5 hover:text-blue-500 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  )}
                </button>

                {/* Favorite Button */}
                <button 
                  onClick={handleFavorite} 
                  className="p-1.5 sm:p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all duration-200" 
                  title="Favorite translation"
                >
                  <svg 
                    className={`w-5 h-5 transition-all duration-300 ${currentIsFavorite ? 'text-yellow-500 scale-110' : 'text-slate-400 hover:text-yellow-500 hover:scale-110'}`} 
                    fill={currentIsFavorite ? 'currentColor' : 'none'} 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          {/* Output Area */}
          <div className="relative flex-1 p-4 sm:p-6 flex flex-col">
            <div className={`w-full flex-1 overflow-y-auto font-medium transition-all duration-300 leading-relaxed ${fontSize} ${isLoading ? 'animate-pulse text-blue-400 dark:text-blue-500/50' : fontColor.replace('text-slate-800', 'text-blue-900').replace('text-slate-100', 'text-blue-100')}`}>
              {translatedText || (
                <span className="text-slate-400/50 dark:text-slate-500/40 italic text-lg sm:text-xl">Translation</span>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Swap Button Overlay */}
        <div className="hidden md:flex absolute left-1/2 top-[52px] -translate-x-1/2 -translate-y-1/2 z-10">
          <button 
            onClick={handleSwap}
            className="p-3 rounded-full bg-white dark:bg-[#1a1d27] border border-slate-200 dark:border-slate-700/80 text-slate-400 hover:text-blue-500 shadow-lg hover:shadow-blue-500/20 transition-all hover:scale-110 active:scale-95"
            title="Swap languages"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          </button>
        </div>
      </div>

      {/* Action Area - Centered on Page */}
      <div className="mt-4 sm:mt-6 flex justify-center gap-3 sm:gap-4 w-full md:w-auto">
        {/* Clear Button */}
        <button
          onClick={handleClear}
          disabled={!inputText.trim()}
          className={`flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg border-2 transition-all duration-300 min-w-[120px] sm:min-w-[150px]
            ${!inputText.trim() 
              ? 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed bg-transparent' 
              : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98]'
            }`}
        >
          Clear
        </button>

        {/* Translate Button */}
        <button
          onClick={handleTranslate}
          // RULE 4: Prevent Spam by functionally disabling button while loading
          disabled={isLoading || !inputText.trim()}
          className={`flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg text-white transition-all duration-300 min-w-[160px] sm:min-w-[200px] shadow-lg
            ${(isLoading || !inputText.trim()) 
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] hover:shadow-blue-500/20'
            }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6 text-white/70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Translating...
            </>
          ) : (
            <>
              Translate
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </>
          )}
        </button>
      </div>

    </div>
  );
};

export default TranslationBox;
