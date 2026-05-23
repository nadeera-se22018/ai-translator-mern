const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const Translation = require('../models/Translation');

router.post('/', async (req, res) => {
  try {
    const { inputText, sourceLanguage, targetLanguage } = req.body;

    if (!inputText || !sourceLanguage || !targetLanguage) {
      return res.status(400).json({ error: 'inputText, sourceLanguage, and targetLanguage are required.' });
    }

    // Initialize Google Gen AI client
    // It will automatically use process.env.GEMINI_API_KEY if available,
    // but we can pass it explicitly for clarity.
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

    const translatedText = response.text.trim();

    // Save to database
    const newTranslation = new Translation({
      inputText,
      translatedText,
      sourceLanguage,
      targetLanguage
    });

    const savedTranslation = await newTranslation.save();

    // Return the result
    return res.status(201).json({
      success: true,
      data: savedTranslation
    });

  } catch (error) {
    console.error('Translation error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'An error occurred during translation.',
      details: error.message 
    });
  }
});

module.exports = router;
