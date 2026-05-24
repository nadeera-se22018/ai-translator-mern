import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { logout } from '../auth/authSlice';

// Async thunk for the translation API call
export const translateText = createAsyncThunk(
  'translation/translateText',
  async ({ inputText, sourceLanguage, targetLanguage, mode }, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.auth.user ? state.auth.user.token : null;

      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('https://ai-translator-backend-six.vercel.app/api/translate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ inputText, sourceLanguage, targetLanguage, mode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return thunkAPI.rejectWithValue(errorData.error || 'Failed to translate');
      }

      const result = await response.json();
      return result.data; // { inputText, translatedText, sourceLanguage, targetLanguage, _id, createdAt }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || 'Network error occurred');
    }
  }
);

export const fetchHistory = createAsyncThunk(
  'translation/fetchHistory',
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.auth.user ? state.auth.user.token : null;

      if (!token) return thunkAPI.rejectWithValue('No token');

      const response = await fetch('https://ai-translator-backend-six.vercel.app/api/translate/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return thunkAPI.rejectWithValue('Failed to fetch history');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || 'Network error');
    }
  }
);

const initialState = {
  inputText: '',
  translatedText: '',
  sourceLanguage: 'English',
  targetLanguage: 'Sinhala',
  translationMode: 'groq', // 'normal', 'gemini', or 'groq'
  isLoading: false,
  error: null,
  history: [],
  favorites: [],
  historyTab: 'history', // 'history' or 'favorites'
  cachedTranslations: { normal: '', gemini: '', groq: '' } // Caches translations for current inputText
};

const translationSlice = createSlice({
  name: 'translation',
  initialState,
  reducers: {
    setInputText: (state, action) => {
      // Stale cache protection: only clear cache if the input text has actually changed or is cleared
      if (action.payload === '' || action.payload !== state.inputText) {
        state.translatedText = '';
        state.cachedTranslations = { normal: '', gemini: '', groq: '' };
      }
      state.inputText = action.payload;
      state.error = null;
    },
    setTranslationMode: (state, action) => {
      state.translationMode = action.payload;
      // Restore cached translation instantly when mode changes
      state.translatedText = state.cachedTranslations[action.payload] || '';
    },
    setTranslatedText: (state, action) => {
      state.translatedText = action.payload;
    },
    clearTranslationCache: (state) => {
      state.translatedText = '';
      state.cachedTranslations = { normal: '', gemini: '', groq: '' };
    },
    setSourceLanguage: (state, action) => {
      state.sourceLanguage = action.payload;
    },
    setTargetLanguage: (state, action) => {
      state.targetLanguage = action.payload;
    },
    swapLanguages: (state) => {
      const temp = state.sourceLanguage;
      state.sourceLanguage = state.targetLanguage;
      state.targetLanguage = temp;
      
      if (state.translatedText) {
        state.inputText = state.translatedText;
        state.translatedText = '';
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    toggleFavorite: (state, action) => {
      const existingIndex = state.favorites.findIndex(
        (fav) => fav.inputText === action.payload.inputText && fav.translatedText === action.payload.translatedText
      );
      if (existingIndex >= 0) {
        state.favorites.splice(existingIndex, 1);
      } else {
        state.favorites.unshift(action.payload);
      }
    },
    setHistoryTab: (state, action) => {
      state.historyTab = action.payload;
    },
    loadTranslation: (state, action) => {
      const { inputText, translatedText, sourceLanguage, targetLanguage, mode } = action.payload;
      state.inputText = inputText;
      state.translatedText = translatedText;
      state.sourceLanguage = sourceLanguage;
      state.targetLanguage = targetLanguage;
      if (mode) {
        state.translationMode = mode;
      }
      // Populate cache for the selected mode
      state.cachedTranslations[mode || state.translationMode] = translatedText;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(translateText.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(translateText.fulfilled, (state, action) => {
        state.isLoading = false;
        state.translatedText = action.payload.translatedText;
        // Save the successful translation in our cache for the current mode
        state.cachedTranslations[state.translationMode] = action.payload.translatedText;
        state.history.unshift(action.payload);
        if (state.history.length > 30) {
          state.history.pop();
        }
      })
      .addCase(translateText.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.translatedText = '';
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.history = action.payload;
      })
      .addCase(logout, (state) => {
        state.history = [];
      });
  },
});

export const { 
  setInputText, 
  setTranslationMode,
  setTranslatedText,
  clearTranslationCache,
  setSourceLanguage, 
  setTargetLanguage, 
  swapLanguages,
  clearError,
  toggleFavorite,
  setHistoryTab,
  loadTranslation
} = translationSlice.actions;

export default translationSlice.reducer;
