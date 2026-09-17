/**
 * Multilingual Translation & Explanation Service (English, Hindi, Marathi)
 * Translates AI-generated explanations and summaries into target regional languages
 * while strictly preserving verbatim English legal contract quotes.
 */

import { getGeminiClient } from './aiAnalyzer.js';

export const SUPPORTED_LANGUAGES = {
  en: { code: 'en', name: 'English', nativeName: 'English' },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  mr: { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
};

/**
 * Detect language intent from query string (e.g. "मराठीत सांग", "हिंदी में बताएं")
 */
export function detectLanguageIntent(queryText = '') {
  const q = queryText.toLowerCase();
  if (/मराठी|marathi|मराठीत/i.test(q)) return 'mr';
  if (/हिंदी|हिन्दी|hindi|हिंदी में/i.test(q)) return 'hi';
  return 'en';
}

/**
 * Translate legal explanation into Hindi or Marathi using Gemini Flash AI,
 * preserving exact quotes intact.
 */
export async function translateLegalExplanation(explanationText, targetLang = 'en', verbatimQuote = '') {
  if (!explanationText || targetLang === 'en' || !SUPPORTED_LANGUAGES[targetLang]) {
    return explanationText;
  }

  const ai = getGeminiClient();
  if (!ai) {
    return explanationText;
  }

  try {
    const targetName = SUPPORTED_LANGUAGES[targetLang].name;
    const prompt = `Task: Translate the following legal summary/explanation into accurate, clear ${targetName} for a consumer.
STRICT RULE: Keep any quoted English verbatim contract terms (enclosed in quotes or blockquotes) EXACTLY in English so legal precision is not lost.

Text to translate:
${explanationText}

Return ONLY the translated ${targetName} text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
      },
    });

    if (response.text && response.text.trim()) {
      return response.text.trim();
    }
  } catch (err) {
    console.warn(`Multilingual translation to ${targetLang} failed:`, err);
  }

  return explanationText;
}
