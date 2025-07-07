const GOOGLE_TTS_URL = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.REACT_APP_GOOGLE_TTS_API_KEY}`;

const VOICE_MAP = {
  en: { languageCode: "en-US", name: "en-US-Standard-C" },
  hi: { languageCode: "hi-IN", name: "hi-IN-Standard-A" },
  kn: { languageCode: "kn-IN", name: "kn-IN-Standard-A" },
  ta: { languageCode: "ta-IN", name: "ta-IN-Standard-A" },
  te: { languageCode: "te-IN", name: "te-IN-Standard-A" },
};

export async function googleTTS(text, lang = "en") {
  const voice = VOICE_MAP[lang] || VOICE_MAP["en"];
  const body = {
    input: { text },
    voice: {
      languageCode: voice.languageCode,
      name: voice.name,
    },
    audioConfig: { audioEncoding: "MP3" }
  };

  const response = await fetch(GOOGLE_TTS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) throw new Error("TTS failed");

  const data = await response.json();
  return "data:audio/mp3;base64," + data.audioContent;
}
