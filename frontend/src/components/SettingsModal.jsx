import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setFontSize, setFontColor, setFontFamily, toggleSettings } from '../features/settings/settingsSlice';

const SettingsModal = () => {
  const dispatch = useDispatch();
  const { isSettingsOpen, fontSize, fontColor, fontFamily } = useSelector((state) => state.settings);

  if (!isSettingsOpen) return null;

  const fontSizes = [
    { label: 'Medium', value: 'text-2xl lg:text-3xl' },
    { label: 'Large', value: 'text-3xl lg:text-4xl' },
    { label: 'Extra Large', value: 'text-4xl lg:text-5xl' },
  ];

  const fontColors = [
    { label: 'Default', value: 'text-slate-800 dark:text-slate-100', color: '#f1f5f9' },
    { label: 'Blue', value: 'text-blue-600 dark:text-blue-400', color: '#3b82f6' },
    { label: 'Emerald', value: 'text-emerald-600 dark:text-emerald-400', color: '#10b981' },
    { label: 'Purple', value: 'text-purple-600 dark:text-purple-400', color: '#a855f7' },
    { label: 'Rose', value: 'text-rose-600 dark:text-rose-400', color: '#f43f5e' },
  ];

  const fontFamilies = [
    { label: 'Sans (Modern)', value: 'font-sans' },
    { label: 'Serif (Classic)', value: 'font-serif' },
    { label: 'Mono (Code)', value: 'font-mono' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl w-full max-w-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-white/5 p-8 sm:p-10 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">Appearance</h2>
          <button 
            onClick={() => dispatch(toggleSettings())}
            className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-8">
          
          {/* Font Family Settings */}
          <div>
            <h3 className="text-sm font-extrabold text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-widest">Font Style</h3>
            <div className="grid grid-cols-3 gap-3">
              {fontFamilies.map((family) => (
                <button
                  key={family.value}
                  onClick={() => dispatch(setFontFamily(family.value))}
                  className={`py-4 px-4 rounded-xl border-2 font-medium transition-all text-center ${family.value} ${
                    fontFamily === family.value 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 shadow-sm' 
                      : 'border-slate-100 dark:border-slate-800/50 text-slate-600 dark:text-slate-300 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {family.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size Settings */}
          <div>
            <h3 className="text-sm font-extrabold text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-widest">Font Size</h3>
            <div className="grid grid-cols-3 gap-3">
              {fontSizes.map((size) => (
                <button
                  key={size.value}
                  onClick={() => dispatch(setFontSize(size.value))}
                  className={`py-3.5 px-4 rounded-xl border-2 font-bold text-xs sm:text-sm md:text-base transition-all duration-300 ${
                    fontSize === size.value 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 shadow-sm' 
                      : 'border-slate-100 dark:border-slate-800/50 text-slate-600 dark:text-slate-300 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Color Settings */}
          <div>
            <h3 className="text-sm font-extrabold text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-widest">Font Color</h3>
            <div className="grid grid-cols-5 gap-2">
              {fontColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => dispatch(setFontColor(color.value))}
                  className={`py-3 px-2 rounded-xl border-2 font-medium transition-all flex flex-col items-center justify-center gap-2 ${
                    fontColor === color.value 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 shadow-sm' 
                      : 'border-slate-100 dark:border-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                  title={color.label}
                >
                  <span 
                    className={`w-6 h-6 rounded-full shadow-sm ${
                      color.value.includes('slate-800') 
                        ? 'bg-slate-800 dark:bg-slate-100 border border-slate-200 dark:border-slate-700' 
                        : ''
                    }`}
                    style={!color.value.includes('slate-800') ? { backgroundColor: color.color } : {}}
                  ></span>
                  <span className="text-slate-700 dark:text-slate-200 text-xs font-semibold">{color.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10">
          <button 
            onClick={() => dispatch(toggleSettings())}
            className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] text-white font-black text-lg rounded-2xl transition-all shadow-lg shadow-blue-500/25"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
