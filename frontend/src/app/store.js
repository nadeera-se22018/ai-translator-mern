import { configureStore } from '@reduxjs/toolkit';
import translationReducer from '../features/translation/translationSlice';

export const store = configureStore({
  reducer: {
    translation: translationReducer,
  },
});
