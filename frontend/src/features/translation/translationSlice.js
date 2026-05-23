import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for the translation API call
export const translateText = createAsyncThunk(
  'translation/translateText',
  async ({ inputText, sourceLanguage, targetLanguage }, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5000/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputText, sourceLanguage, targetLanguage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.error || 'Failed to translate');
      }

      const result = await response.json();
      return result.data; // { inputText, translatedText, sourceLanguage, targetLanguage, _id, createdAt }
    } catch (error) {
      return rejectWithValue(error.message || 'Network error occurred');
    }
  }
);

const initialState = {
  inputText: '',
  translatedText: '',
  sourceLanguage: 'English',
  targetLanguage: 'Sinhala',
  isLoading: false,
  error: null,
  history: [],
};

const translationSlice = createSlice({
  name: 'translation',
  initialState,
  reducers: {
    setInputText: (state, action) => {
      state.inputText = action.payload;
      // Clear translated text and errors when input changes significantly
      if (action.payload === '') {
        state.translatedText = '';
        state.error = null;
      }
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
      
      // Also swap texts if they exist
      if (state.translatedText) {
        state.inputText = state.translatedText;
        state.translatedText = '';
      }
    },
    clearError: (state) => {
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
        // Add to history
        state.history.unshift(action.payload);
        // Keep history at a reasonable size (e.g., 20 items)
        if (state.history.length > 20) {
          state.history.pop();
        }
      })
      .addCase(translateText.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.translatedText = '';
      });
  },
});

export const { 
  setInputText, 
  setSourceLanguage, 
  setTargetLanguage, 
  swapLanguages,
  clearError
} = translationSlice.actions;

export default translationSlice.reducer;
