import { configureStore } from '@reduxjs/toolkit';
import translationReducer from '../features/translation/translationSlice';
import settingsReducer from '../features/settings/settingsSlice';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    translation: translationReducer,
    settings: settingsReducer,
    auth: authReducer,
  },
});
