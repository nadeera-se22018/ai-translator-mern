const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const Groq = require('groq-sdk');
const translateGoogle = require('translate-google');
const Translation = require('../models/Translation');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// @desc    Get user translation history
// @route   GET /api/translate/history
router.get('/history', protect, async (req, res) => {
  try {
    const history = await Translation.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    
    // Parse translatedText JSON string back into an object before sending to frontend
    const parsedHistory = history.map(item => {
      const itemObj = item.toObject();
      try {
        itemObj.translatedText = JSON.parse(itemObj.translatedText);
      } catch (e) {
        // Fallback if it's not a JSON string (e.g. older legacy records)
        itemObj.translatedText = {
          best: itemObj.translatedText,
          alternatives: []
        };
      }
      return itemObj;
    });

    res.json(parsedHistory);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// @desc    Get autocomplete suggestions with translation
// @route   GET /api/translate/suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { q, sourceLanguage = 'English', targetLanguage = 'Sinhala' } = req.query;
    if (!q || !q.trim()) {
      return res.json([]);
    }

    // Fetch autocomplete suggestions from Google (free, no token cost)
    const autocompleteUrl = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(q.trim())}`;
    const response = await fetch(autocompleteUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch suggestions from Google');
    }
    const data = await response.json();
    const suggestions = (data[1] || []).slice(0, 3);

    const languageCodes = {
      'English': 'en', 'Sinhala': 'si', 'Spanish': 'es', 'French': 'fr', 'German': 'de', 
      'Italian': 'it', 'Portuguese': 'pt', 'Russian': 'ru', 'Japanese': 'ja', 'Korean': 'ko', 
      'Chinese (Simplified)': 'zh-cn', 'Arabic': 'ar', 'Hindi': 'hi'
    };
    const fromCode = languageCodes[sourceLanguage] || 'en';
    const toCode = languageCodes[targetLanguage] || 'si';

    const results = await Promise.all(
      suggestions.map(async (phrase) => {
        try {
          const translated = await translateGoogle(phrase, { from: fromCode, to: toCode });
          return { phrase, translated };
        } catch (error) {
          console.error(`Error translating suggestion "${phrase}":`, error);
          return { phrase, translated: '' };
        }
      })
    );

    res.json(results);
  } catch (error) {
    console.error('Suggestions Error:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// Helper function to safely parse LLM JSON responses, cleaning up markdown code block markers
function parseLLMJson(text) {
  try {
    let cleaned = text.trim();
    // Strip markdown code block wrapper if present (e.g. ```json ... ``` or ``` ... ```)
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
    }
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn('[parseLLMJson] Standard parsing failed, attempting regex extraction:', err);
    try {
      const startIdx = text.indexOf('{');
      const endIdx = text.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        const jsonSub = text.substring(startIdx, endIdx + 1);
        return JSON.parse(jsonSub);
      }
    } catch (regexErr) {
      console.error('[parseLLMJson] Regex JSON extraction failed:', regexErr);
    }
    // Fallback if parsing fails entirely
    return {
      best: text,
      alternatives: []
    };
  }
}

// @desc    Translate text and optionally save to user history
// @route   POST /api/translate
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { inputText, sourceLanguage, targetLanguage, mode = 'ai' } = req.body;

    if (!inputText || !sourceLanguage || !targetLanguage) {
      return res.status(400).json({ error: 'inputText, sourceLanguage, and targetLanguage are required.' });
    }

    let parsedObject = { best: '', alternatives: [] };

    if (mode === 'normal') {
      const languageCodes = {
        'English': 'en', 'Sinhala': 'si', 'Spanish': 'es', 'French': 'fr', 'German': 'de', 
        'Italian': 'it', 'Portuguese': 'pt', 'Russian': 'ru', 'Japanese': 'ja', 'Korean': 'ko', 
        'Chinese (Simplified)': 'zh-cn', 'Arabic': 'ar', 'Hindi': 'hi'
      };
      const fromCode = languageCodes[sourceLanguage] || 'en';
      const toCode = languageCodes[targetLanguage] || 'si';

      let myMemoryData;
      try {
        const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(inputText)}&langpair=${fromCode}|${toCode}`;
        const response = await fetch(myMemoryUrl);
        if (!response.ok) {
          throw new Error(`MyMemory API returned status: ${response.status}`);
        }
        myMemoryData = await response.json();
      } catch (err) {
        console.error('MyMemory API failed, falling back to translate-google:', err);
        // Fallback to translate-google if MyMemory fails
        const fallbackTranslation = await translateGoogle(inputText, { from: fromCode, to: toCode });
        myMemoryData = {
          responseData: { translatedText: fallbackTranslation },
          matches: [{ translation: fallbackTranslation }]
        };
      }

      const bestTranslation = myMemoryData.responseData?.translatedText || '';
      const alternativesList = (myMemoryData.matches || [])
        .map(m => m.translation?.trim())
        .filter(t => t && t.toLowerCase() !== bestTranslation.toLowerCase())
        .filter((value, index, self) => self.indexOf(value) === index)
        .slice(0, 2);

      parsedObject = {
        best: bestTranslation,
        alternatives: alternativesList
      };

    } else if (mode === 'microsoft') {
      const languageCodes = {
        'English': 'en', 'Sinhala': 'si', 'Spanish': 'es', 'French': 'fr', 'German': 'de', 
        'Italian': 'it', 'Portuguese': 'pt', 'Russian': 'ru', 'Japanese': 'ja', 'Korean': 'ko', 
        'Chinese (Simplified)': 'zh-Hans', 'Arabic': 'ar', 'Hindi': 'hi'
      };
      const fromCode = languageCodes[sourceLanguage] || 'en';
      const toCode = languageCodes[targetLanguage] || 'si';

      const key = process.env.MS_TRANSLATOR_KEY;
      const region = process.env.MS_TRANSLATOR_REGION || 'southeastasia';

      if (!key) {
        throw new Error('Microsoft Translator Key is not configured on the server.');
      }

      const msUrl = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${fromCode}&to=${toCode}`;
      const response = await fetch(msUrl, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': key,
          'Ocp-Apim-Subscription-Region': region,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([{ text: inputText }])
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Microsoft Translator API failed: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      const bestTranslation = data[0]?.translations[0]?.text || '';

      // Fetch alternative translations using MyMemory API
      let alternativesList = [];
      try {
        const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(inputText)}&langpair=${fromCode === 'zh-Hans' ? 'zh-CN' : fromCode}|${toCode === 'zh-Hans' ? 'zh-CN' : toCode}`;
        const alternativesResponse = await fetch(myMemoryUrl);
        if (alternativesResponse.ok) {
          const myMemoryData = await alternativesResponse.json();
          alternativesList = (myMemoryData.matches || [])
            .map(m => m.translation?.trim())
            .filter(t => t && t.toLowerCase() !== bestTranslation.toLowerCase())
            .filter((value, index, self) => self.indexOf(value) === index)
            .slice(0, 2);
        }
      } catch (err) {
        console.error('Failed to fetch alternatives from MyMemory for Microsoft mode:', err);
      }

      parsedObject = {
        best: bestTranslation,
        alternatives: alternativesList
      };

    } else if (mode === 'gemini') {
      // Initialize Gemini client
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const systemPrompt = `You are an expert, professional translator. Your task is to accurately translate the provided text from ${sourceLanguage} to ${targetLanguage}. Maintain the original tone and context.
You MUST provide the translation and exactly 2 alternative similar translations (including Singlish if applicable).
You MUST return the output ONLY as a valid JSON object matching this schema:
{
  "best": "The most accurate translation string",
  "alternatives": ["Alternative 1", "Alternative 2"]
}
Do NOT include any markdown formatting, code block markers (like \`\`\`json), or explanations. Return ONLY the raw JSON string.`;

      let responseText = '';
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: inputText,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.3,
            responseMimeType: 'application/json'
          }
        });
        responseText = response.text.trim();
        parsedObject = parseLLMJson(responseText);
      } catch (err) {
        console.warn('Gemini translation failed, attempting Groq fallback:', err.message || err);
        if (process.env.GROQ_API_KEY) {
          try {
            const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
            const response = await groq.chat.completions.create({
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: inputText }
              ],
              model: 'llama-3.3-70b-versatile',
              temperature: 0.3,
              response_format: { type: "json_object" }
            });
            responseText = response.choices[0].message.content.trim();
            parsedObject = parseLLMJson(responseText);
            console.log('[Translation] Groq fallback translation succeeded.');
          } catch (groqErr) {
            console.error('[Translation] Groq fallback translation also failed:', groqErr.message || groqErr);
            throw err;
          }
        } else {
          throw err;
        }
      }

    } else {
      // Initialize Groq client (default AI mode or explicitly selected)
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

      const systemPrompt = `You are an expert, professional translator. Your task is to accurately translate the provided text from ${sourceLanguage} to ${targetLanguage}. Maintain the original tone and context.
You MUST provide the translation and exactly 2 alternative similar translations (including Singlish if applicable).
You MUST return the output ONLY as a valid JSON object matching this schema:
{
  "best": "The most accurate translation string",
  "alternatives": ["Alternative 1", "Alternative 2"]
}
Do NOT include any markdown formatting, code block markers (like \`\`\`json), or explanations. Return ONLY the raw JSON string.`;

      let responseText = '';
      try {
        const response = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: inputText }
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.3,
          response_format: { type: "json_object" }
        });
        responseText = response.choices[0].message.content.trim();
        parsedObject = parseLLMJson(responseText);
      } catch (err) {
        console.error('Groq translation failed:', err);
        throw err;
      }
    }

    // Save to database as stringified JSON
    let savedTranslation = null;
    const dbTranslatedText = JSON.stringify(parsedObject);
    try {
      const newTranslation = new Translation({
        inputText,
        translatedText: dbTranslatedText,
        sourceLanguage,
        targetLanguage,
        mode,
        user: req.user ? req.user._id : undefined
      });
      savedTranslation = await newTranslation.save();
    } catch (dbError) {
      console.error("MongoDB save failed/timed out:", dbError.message);
    }

    // Return the result with the parsed JSON object sent directly to the React frontend
    return res.status(201).json({
      success: true,
      data: {
        _id: savedTranslation ? savedTranslation._id : undefined,
        inputText,
        translatedText: parsedObject, // Send the parsed JSON object directly to the React frontend
        sourceLanguage,
        targetLanguage,
        mode,
        createdAt: savedTranslation ? savedTranslation.createdAt : new Date()
      }
    });

  } catch (error) {
    console.error("Translation Controller Error:", error);
    
    // Check if it's a rate limit error (429)
    let errorMessage = error.message || 'An error occurred during translation from AI API.';
    if (errorMessage.includes('429') || errorMessage.includes('Quota exceeded')) {
      errorMessage = 'AI API free tier limit reached. Please wait a minute before trying again.';
    } else if (error.status === 429) {
      errorMessage = 'AI API free tier limit reached. Please wait a minute before trying again.';
    }

    return res.status(500).json({ 
      success: false, 
      error: errorMessage
    });
  }
});

// @desc    Transcribe speech to text using Groq Whisper (Universal Cross-Browser Fallback)
// @route   POST /api/translate/transcribe
router.post('/transcribe', express.raw({ type: 'audio/*', limit: '10mb' }), async (req, res) => {
  let tempFilePath = null;
  const fs = require('fs');
  const path = require('path');
  
  try {
    const audioBuffer = req.body;
    if (!audioBuffer || audioBuffer.length === 0) {
      return res.status(400).json({ error: 'No audio data received.' });
    }

    const sourceLang = req.headers['x-source-language'] || 'English';

    // Map language names to ISO codes for Whisper hint
    const languageCodes = {
      'English': 'en', 'Sinhala': 'si', 'Spanish': 'es', 'French': 'fr', 'German': 'de', 
      'Italian': 'it', 'Portuguese': 'pt', 'Russian': 'ru', 'Japanese': 'ja', 'Korean': 'ko', 
      'Chinese (Simplified)': 'zh', 'Arabic': 'ar', 'Hindi': 'hi'
    };
    const langCode = languageCodes[sourceLang] || 'en';

    // Save buffer to a temporary file
    tempFilePath = path.join(__dirname, `../temp_speech_${Date.now()}.webm`);
    fs.writeFileSync(tempFilePath, audioBuffer);

    // Initialize Groq client
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Transcribe using whisper-large-v3
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: 'whisper-large-v3',
      language: langCode,
      response_format: 'json'
    });

    // Delete temporary file
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
      tempFilePath = null;
    }

    res.json({
      success: true,
      text: transcription.text
    });

  } catch (error) {
    console.error('Transcription API Error:', error);
    // Cleanup on error
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (err) {
        console.error('Failed to delete temp file:', err);
      }
    }
    res.status(500).json({ error: 'Failed to transcribe audio: ' + error.message });
  }
});

// @desc    Check English spelling and get correction suggestions
// @route   POST /api/translate/spellcheck
router.post('/spellcheck', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.json({ errors: [] });
    }

    const systemPrompt = `You are a precise English spell checker. Identify misspelled words in the text. For each misspelled word, suggest 1 to 3 corrections. Ignore proper nouns (like names, places), abbreviations, or tech terms unless they are clearly typos of common words.
Return ONLY a JSON object matching this schema:
{
  "errors": [
    { "word": "spellling", "suggestions": ["spelling", "spelled"] }
  ]
}
If there are no misspelled words, return {"errors": []}. Do NOT return markdown block formatting, code block markers, or explanations.`;

    let parsed;

    // 1. Try Microsoft Bing Spell Check if a dedicated key is configured
    if (process.env.MS_SPELLCHECK_KEY) {
      try {
        const key = process.env.MS_SPELLCHECK_KEY;
        const response = await fetch(`https://api.bing.microsoft.com/v7.0/spellcheck?text=${encodeURIComponent(text)}&mode=proof`, {
          method: 'GET',
          headers: {
            'Ocp-Apim-Subscription-Key': key
          }
        });
        
        if (response.ok) {
          const bingData = await response.json();
          const mappedErrors = (bingData.flaggedTokens || []).map(item => ({
            word: item.token,
            suggestions: (item.suggestions || []).map(s => s.suggestion)
          }));
          parsed = { errors: mappedErrors };
          console.log('[SpellCheck] Successfully used Microsoft Bing Spell Check');
        } else {
          console.warn(`[SpellCheck] Microsoft spellcheck API returned status: ${response.status}`);
        }
      } catch (msError) {
        console.warn('[SpellCheck] Microsoft spellcheck failed, falling back to Groq:', msError.message || msError);
      }
    }

    // 2. If Microsoft is not configured or failed, use Groq AI
    if (!parsed && process.env.GROQ_API_KEY) {
      try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const response = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text }
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.1,
          response_format: { type: "json_object" }
        });
        const responseText = response.choices[0].message.content.trim();
        parsed = parseLLMJson(responseText);
        console.log('[SpellCheck] Successfully used Groq AI (Llama 70B)');
      } catch (groqError) {
        console.error('[SpellCheck] Groq spellcheck failed:', groqError.message || groqError);
      }
    }

    if (!parsed) {
      throw new Error('All spellcheck providers failed or are not configured.');
    }

    res.json(parsed);
  } catch (error) {
    console.error('Spellcheck Error:', error);
    res.status(500).json({ error: 'Spellcheck failed' });
  }
});


// @desc    Toggle favorite status of a translation
// @route   PATCH /api/translate/history/:id/favorite
router.patch('/history/:id/favorite', protect, async (req, res) => {
  try {
    const translation = await Translation.findOne({ _id: req.params.id, user: req.user._id });
    if (!translation) {
      return res.status(404).json({ error: 'Translation not found' });
    }
    translation.isFavorite = !translation.isFavorite;
    await translation.save();
    res.json(translation);
  } catch (error) {
    console.error('Favorite Toggle Error:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
