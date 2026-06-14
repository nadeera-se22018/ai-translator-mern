import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { logout } from '../auth/authSlice';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ai-translator-backend-six.vercel.app';

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

      const response = await fetch(`${API_BASE_URL}/api/translate`, {
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

      const response = await fetch(`${API_BASE_URL}/api/translate/history`, {
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

export const toggleFavoriteDb = createAsyncThunk(
  'translation/toggleFavoriteDb',
  async (item, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.auth.user ? state.auth.user.token : null;

      if (token) {
        if (item._id) {
          const response = await fetch(`${API_BASE_URL}/api/translate/history/${item._id}/favorite`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            return thunkAPI.rejectWithValue('Failed to toggle favorite on database');
          }

          const updatedItem = await response.json();
          return { item, updatedItem, loggedIn: true };
        } else {
          const response = await fetch(`${API_BASE_URL}/api/translate/history/favorite`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputText: item.inputText,
              translatedText: item.translatedText,
              sourceLanguage: item.sourceLanguage,
              targetLanguage: item.targetLanguage,
              mode: item.mode
            }),
          });

          if (!response.ok) {
            return thunkAPI.rejectWithValue('Failed to save and toggle favorite on database');
          }

          const updatedItem = await response.json();
          return { item, updatedItem, loggedIn: true };
        }
      }

      // Guest flow: locally toggled
      return { item, loggedIn: false };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || 'Network error occurred');
    }
  }
);

export const syncFavorites = createAsyncThunk(
  'translation/syncFavorites',
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.auth.user ? state.auth.user.token : null;
      const localFavorites = state.translation.favorites;

      if (!token || localFavorites.length === 0) {
        return thunkAPI.rejectWithValue('No token or local favorites');
      }

      const response = await fetch(`${API_BASE_URL}/api/translate/history/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          },
        body: JSON.stringify({ localFavorites }),
      });

      if (!response.ok) {
        return thunkAPI.rejectWithValue('Failed to sync favorites');
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
  translatedText: { best: '', alternatives: [] },
  sourceLanguage: 'English',
  targetLanguage: 'Sinhala',
  translationMode: 'gemini', // 'normal', 'microsoft', 'gemini', or 'groq'
  isLoading: false,
  error: null,
  history: JSON.parse(localStorage.getItem('lk_history') || '[]'),
  favorites: JSON.parse(localStorage.getItem('lk_favorites') || '[]'),
  historyTab: 'history', // 'history' or 'favorites'
  cachedTranslations: { 
    normal: { best: '', alternatives: [] }, 
    microsoft: { best: '', alternatives: [] }, 
    gemini: { best: '', alternatives: [] }, 
    groq: { best: '', alternatives: [] } 
  } // Caches translations for current inputText
};

const translationSlice = createSlice({
  name: 'translation',
  initialState,
  reducers: {
    setInputText: (state, action) => {
      // Stale cache protection: only clear cache if the input text has actually changed or is cleared
      if (action.payload === '' || action.payload !== state.inputText) {
        state.translatedText = { best: '', alternatives: [] };
        state.cachedTranslations = { 
          normal: { best: '', alternatives: [] }, 
          microsoft: { best: '', alternatives: [] }, 
          gemini: { best: '', alternatives: [] }, 
          groq: { best: '', alternatives: [] } 
        };
      }
      state.inputText = action.payload;
      state.error = null;
    },
    setTranslationMode: (state, action) => {
      state.translationMode = action.payload;
      // Restore cached translation instantly when mode changes
      state.translatedText = state.cachedTranslations[action.payload] || { best: '', alternatives: [] };
    },
    setTranslatedText: (state, action) => {
      state.translatedText = action.payload || { best: '', alternatives: [] };
    },
    clearTranslationCache: (state) => {
      state.translatedText = { best: '', alternatives: [] };
      state.cachedTranslations = { 
        normal: { best: '', alternatives: [] }, 
        microsoft: { best: '', alternatives: [] }, 
        gemini: { best: '', alternatives: [] }, 
        groq: { best: '', alternatives: [] } 
      };
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
      
      if (state.translatedText && state.translatedText.best) {
        state.inputText = state.translatedText.best;
        state.translatedText = { best: '', alternatives: [] };
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setHistoryTab: (state, action) => {
      state.historyTab = action.payload;
    },
    loadTranslation: (state, action) => {
      const { inputText, translatedText, sourceLanguage, targetLanguage, mode } = action.payload;
      state.inputText = inputText;
      
      let parsedTranslation = translatedText;
      if (typeof translatedText === 'string') {
        try {
          parsedTranslation = JSON.parse(translatedText);
        } catch (e) {
          parsedTranslation = { best: translatedText, alternatives: [] };
        }
      }
      
      state.translatedText = parsedTranslation || { best: '', alternatives: [] };
      state.sourceLanguage = sourceLanguage;
      state.targetLanguage = targetLanguage;
      if (mode) {
        state.translationMode = mode;
      }
      // Populate cache for the selected mode
      state.cachedTranslations[mode || state.translationMode] = parsedTranslation || { best: '', alternatives: [] };
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
        
        let parsedTranslation = action.payload.translatedText;
        if (typeof parsedTranslation === 'string') {
          try {
            parsedTranslation = JSON.parse(parsedTranslation);
          } catch (e) {
            parsedTranslation = { best: parsedTranslation, alternatives: [] };
          }
        }
        
        state.translatedText = parsedTranslation || { best: '', alternatives: [] };
        // Save the successful translation in our cache for the current mode
        state.cachedTranslations[state.translationMode] = parsedTranslation || { best: '', alternatives: [] };
        
        // Push full history item with parsed translation object
        const historyItem = { ...action.payload, translatedText: parsedTranslation };
        state.history.unshift(historyItem);
        if (state.history.length > 30) {
          state.history.pop();
        }
        localStorage.setItem('lk_history', JSON.stringify(state.history));
      })
      .addCase(translateText.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.translatedText = { best: '', alternatives: [] };
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.history = action.payload;
        state.favorites = action.payload.filter(item => item.isFavorite);
        localStorage.setItem('lk_favorites', JSON.stringify(state.favorites));
        localStorage.setItem('lk_history', JSON.stringify(state.history));
      })
      .addCase(toggleFavoriteDb.pending, (state, action) => {
        const item = action.meta.arg;
        
        // Find if it's already in favorites
        const existingIndex = state.favorites.findIndex((fav) => {
          if (item._id && fav._id) {
            return fav._id === item._id;
          }
          const favText = typeof fav.translatedText === 'object' && fav.translatedText !== null ? fav.translatedText.best : fav.translatedText;
          const itemText = typeof item.translatedText === 'object' && item.translatedText !== null ? item.translatedText.best : item.translatedText;
          return fav.inputText === item.inputText && favText === itemText;
        });

        // Toggle isFavorite in history array
        const histIndex = state.history.findIndex(h => {
          if (item._id && h._id) {
            return h._id === item._id;
          }
          const hText = typeof h.translatedText === 'object' && h.translatedText !== null ? h.translatedText.best : h.translatedText;
          const itemText = typeof item.translatedText === 'object' && item.translatedText !== null ? item.translatedText.best : item.translatedText;
          return h.inputText === item.inputText && hText === itemText;
        });

        if (histIndex >= 0) {
          state.history[histIndex].isFavorite = !state.history[histIndex].isFavorite;
        }

        if (existingIndex >= 0) {
          state.favorites.splice(existingIndex, 1);
        } else {
          const newItem = { ...item, isFavorite: true };
          try {
            if (typeof newItem.translatedText === 'string') {
              newItem.translatedText = JSON.parse(newItem.translatedText);
            }
          } catch (e) {}
          state.favorites.unshift(newItem);
        }

        // Always save to localStorage immediately for low-latency persistence
        localStorage.setItem('lk_favorites', JSON.stringify(state.favorites));
        localStorage.setItem('lk_history', JSON.stringify(state.history));
      })
      .addCase(toggleFavoriteDb.fulfilled, (state, action) => {
        const { item, updatedItem, loggedIn } = action.payload;
        if (loggedIn && updatedItem) {
          let parsedUpdatedItem = { ...updatedItem };
          try {
            if (typeof parsedUpdatedItem.translatedText === 'string') {
              parsedUpdatedItem.translatedText = JSON.parse(parsedUpdatedItem.translatedText);
            }
          } catch (e) {
            parsedUpdatedItem.translatedText = { best: parsedUpdatedItem.translatedText, alternatives: [] };
          }
          
          // Update the item in the history array to have the correct DB fields (e.g. ID)
          const histIndex = state.history.findIndex(h => {
            if (h._id === parsedUpdatedItem._id) return true;
            const hText = typeof h.translatedText === 'object' && h.translatedText !== null ? h.translatedText.best : h.translatedText;
            const itemText = typeof parsedUpdatedItem.translatedText === 'object' && parsedUpdatedItem.translatedText !== null ? parsedUpdatedItem.translatedText.best : parsedUpdatedItem.translatedText;
            return h.inputText === parsedUpdatedItem.inputText && hText === itemText;
          });
          if (histIndex >= 0) {
            state.history[histIndex] = parsedUpdatedItem;
          }

          // Sync the favorites array
          const favIndex = state.favorites.findIndex(f => {
            if (f._id === parsedUpdatedItem._id) return true;
            const favText = typeof f.translatedText === 'object' && f.translatedText !== null ? f.translatedText.best : f.translatedText;
            const itemText = typeof parsedUpdatedItem.translatedText === 'object' && parsedUpdatedItem.translatedText !== null ? parsedUpdatedItem.translatedText.best : parsedUpdatedItem.translatedText;
            return f.inputText === parsedUpdatedItem.inputText && favText === itemText;
          });

          if (parsedUpdatedItem.isFavorite) {
            if (favIndex >= 0) {
              state.favorites[favIndex] = parsedUpdatedItem;
            } else {
              state.favorites.unshift(parsedUpdatedItem);
            }
          } else {
            if (favIndex >= 0) {
              state.favorites.splice(favIndex, 1);
            }
          }

          localStorage.setItem('lk_favorites', JSON.stringify(state.favorites));
          localStorage.setItem('lk_history', JSON.stringify(state.history));
        }
      })
      .addCase(toggleFavoriteDb.rejected, (state, action) => {
        const item = action.meta.arg;
        const wasFavorite = item.isFavorite;

        // Revert in history array
        const histIndex = state.history.findIndex(h => {
          if (item._id && h._id) {
            return h._id === item._id;
          }
          const hText = typeof h.translatedText === 'object' && h.translatedText !== null ? h.translatedText.best : h.translatedText;
          const itemText = typeof item.translatedText === 'object' && item.translatedText !== null ? item.translatedText.best : item.translatedText;
          return h.inputText === item.inputText && hText === itemText;
        });
        if (histIndex >= 0) {
          state.history[histIndex].isFavorite = wasFavorite;
        }

        // Revert in favorites array
        const favIndex = state.favorites.findIndex(f => {
          if (item._id && f._id) {
            return f._id === item._id;
          }
          const favText = typeof f.translatedText === 'object' && f.translatedText !== null ? f.translatedText.best : f.translatedText;
          const itemText = typeof item.translatedText === 'object' && item.translatedText !== null ? item.translatedText.best : item.translatedText;
          return f.inputText === item.inputText && favText === itemText;
        });

        if (wasFavorite) {
          if (favIndex < 0) {
            const newItem = { ...item, isFavorite: true };
            try {
              if (typeof newItem.translatedText === 'string') {
                newItem.translatedText = JSON.parse(newItem.translatedText);
              }
            } catch (e) {}
            state.favorites.unshift(newItem);
          }
        } else {
          if (favIndex >= 0) {
            state.favorites.splice(favIndex, 1);
          }
        }

        localStorage.setItem('lk_favorites', JSON.stringify(state.favorites));
        localStorage.setItem('lk_history', JSON.stringify(state.history));
      })
      .addCase(syncFavorites.fulfilled, (state, action) => {
        state.history = action.payload;
        state.favorites = action.payload.filter(item => item.isFavorite);
        localStorage.setItem('lk_favorites', JSON.stringify(state.favorites));
        localStorage.setItem('lk_history', JSON.stringify(state.history));
      })
      .addCase(logout, (state) => {
        state.history = [];
        state.favorites = [];
        localStorage.removeItem('lk_favorites');
        localStorage.removeItem('lk_history');
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
  setHistoryTab,
  loadTranslation
} = translationSlice.actions;

export default translationSlice.reducer;
