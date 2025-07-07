// src/utils/translate.js
// src/utils/translate.js

const API_KEY = "AIzaSyAdndizRJhdwcQzzcJaU7HeO0MijmF_f90"; // <-- Replace with your key

const GOOGLE_TRANSLATE_URL = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;

// Map your language codes to Google Translate codes
export const GOOGLE_LANG_CODES = {
  en: "en",
  hi: "hi",
  kn: "kn",
  ta: "ta",
  te: "te",
};

export async function translateText(text, targetLang) {
  const body = {
    q: text,
    target: GOOGLE_LANG_CODES[targetLang],
    format: "text"
    // Optionally, add "source": "auto"
  };

  const response = await fetch(GOOGLE_TRANSLATE_URL, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" }
  });

  if (!response.ok) {
    throw new Error("Translation failed");
  }

  const data = await response.json();
  return data.data.translations[0].translatedText;
}



