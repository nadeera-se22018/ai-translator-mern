import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: 'dark', // 'dark' or 'light'
  fontSize: 'text-2xl', // 'text-xl', 'text-2xl', 'text-3xl'
  fontColor: 'text-slate-800 dark:text-slate-100', // Tailwind text color class
  fontFamily: 'font-serif', // 'font-sans', 'font-serif', 'font-mono'
  isSettingsOpen: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
    setFontSize: (state, action) => {
      state.fontSize = action.payload;
    },
    setFontColor: (state, action) => {
      state.fontColor = action.payload;
    },
    setFontFamily: (state, action) => {
      state.fontFamily = action.payload;
    },
    toggleSettings: (state) => {
      state.isSettingsOpen = !state.isSettingsOpen;
    },
  },
});

export const { toggleTheme, setFontSize, setFontColor, setFontFamily, toggleSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
