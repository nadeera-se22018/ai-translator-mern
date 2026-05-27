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
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// @desc    Translate text and optionally save to user history
// @route   POST /api/translate
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { inputText, sourceLanguage, targetLanguage, mode = 'ai' } = req.body;

    if (!inputText || !sourceLanguage || !targetLanguage) {
      return res.status(400).json({ error: 'inputText, sourceLanguage, and targetLanguage are required.' });
    }

    let translatedText = '';

    if (mode === 'normal') {
      const languageCodes = {
        'English': 'en', 'Sinhala': 'si', 'Spanish': 'es', 'French': 'fr', 'German': 'de', 
        'Italian': 'it', 'Portuguese': 'pt', 'Russian': 'ru', 'Japanese': 'ja', 'Korean': 'ko', 
        'Chinese (Simplified)': 'zh-cn', 'Arabic': 'ar', 'Hindi': 'hi'
      };
      const fromCode = languageCodes[sourceLanguage] || 'en';
      const toCode = languageCodes[targetLanguage] || 'si';

      translatedText = await translateGoogle(inputText, { from: fromCode, to: toCode });
    } else if (mode === 'gemini') {
      // Initialize Gemini client
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const systemPrompt = `You are an expert, professional translator. Your task is to accurately translate the provided text from ${sourceLanguage} to ${targetLanguage}. Maintain the original tone and context. Return ONLY the translated text without any conversational filler, markdown formatting, or additional explanations.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: inputText,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.3,
        }
      });

      translatedText = response.text.trim();
    } else {
      // Initialize Groq client (default AI mode or explicitly selected)
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

      const systemPrompt = `You are an expert, professional translator. Your task is to accurately translate the provided text from ${sourceLanguage} to ${targetLanguage}. Maintain the original tone and context. Return ONLY the translated text without any conversational filler, markdown formatting, or additional explanations.`;

      const response = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: inputText }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
      });

      translatedText = response.choices[0].message.content.trim();
    }

    // Save to database
    let savedTranslation = null;
    try {
      const newTranslation = new Translation({
        inputText,
        translatedText,
        sourceLanguage,
        targetLanguage,
        mode,
        user: req.user ? req.user._id : undefined
      });
      savedTranslation = await newTranslation.save();
    } catch (dbError) {
      console.error("MongoDB save failed/timed out:", dbError.message);
    }

    // Return the result
    return res.status(201).json({
      success: true,
      data: savedTranslation || {
        inputText,
        translatedText,
        sourceLanguage,
        targetLanguage,
        mode
      }
    });

  } catch (error) {
    console.error("Gemini API Error:", error);
    
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

module.exports = router;
