// Live Vercel backend endpoint
const API_BASE_URL = 'https://ai-translator-backend-six.vercel.app/api';

export const performTranslation = async (text, source, target, mode = 'normal') => {
  try {
    const response = await fetch(`${API_BASE_URL}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputText: text,
        sourceLanguage: source,
        targetLanguage: target,
        mode,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.log('Translation service error:', error);
    throw error;
  }
};
