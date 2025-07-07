import React, { useRef, useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import Webcam from "react-webcam";
import { translateText } from "../utils/translate";
import { googleTTS } from "../utils/tts";
import './OcrReader.css';

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 360;

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "kn", label: "Kannada" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
];

export default function OcrReader() {
  const [ocrText, setOcrText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [targetLang, setTargetLang] = useState("en");
  const [loading, setLoading] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastReadText, setLastReadText] = useState("");
  const webcamRef = useRef(null);
  const audioRef = useRef(null);

  // Capture and process image every 5 seconds if idle
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !ttsLoading && !isPlaying) {
        processImage();
      }
    }, 5000); // every 5 seconds

    return () => clearInterval(interval);
  }, [loading, ttsLoading, isPlaying, targetLang]);

  // OCR → Translate → TTS
  const processImage = async () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setLoading(true);
    setAudioUrl(null);
    setOcrText("");
    setTranslatedText("");

    try {
      // 1. OCR
      const { data: { text } } = await Tesseract.recognize(imageSrc, "eng");
      const trimmedText = text.trim();
      setOcrText(trimmedText);

      // 2. Skip if same or empty
      if (!trimmedText || trimmedText === lastReadText) {
        setLoading(false);
        return;
      }

      // 3. Translate
      const translated = await translateText(trimmedText, targetLang);
      setTranslatedText(translated);

      // 4. TTS
      setTtsLoading(true);
      const url = await googleTTS(translated, targetLang);
      setAudioUrl(url);
      setIsPlaying(true);
      setLastReadText(trimmedText);
    } catch (err) {
      console.error("OCR/Translation/TTS Error:", err);
      setOcrText("OCR/Translation/TTS failed.");
      setTranslatedText("");
      setAudioUrl(null);
      setIsPlaying(false);
      setLastReadText("");
    }

    setLoading(false);
    setTtsLoading(false);
  };

  // When TTS ends
  const handleAudioEnded = () => {
    setIsPlaying(false);
    setAudioUrl(null);
  };

  return (
    <div className="ocr-container">
      <div className="ocr-title">OCR Text Reader & Translator</div>
      <div className="ocr-desc">Automatically reads, translates, and speaks detected text.</div>

      <div className="ocr-section-title" style={{ marginTop: 24 }}>
        <span className="icon">🌐</span>Translate To
      </div>
      <select
        value={targetLang}
        onChange={e => setTargetLang(e.target.value)}
        className="ocr-btn"
        aria-label="Select target language"
        disabled={loading || ttsLoading || isPlaying}
      >
        {LANGUAGES.map(lang => (
          <option key={lang.code} value={lang.code}>{lang.label}</option>
        ))}
      </select>

      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/png"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        videoConstraints={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          facingMode: "environment" //Use back camera on mobile
        }}
      
        style={{ marginTop: 16 }}
      />

      <div className="ocr-section-title" style={{ marginTop: 24 }}>
        <span className="icon">📄</span>Extracted Text
      </div>
      <div className="ocr-result">{loading ? "Recognizing..." : ocrText}</div>

      <div className="ocr-section-title" style={{ marginTop: 24 }}>
        <span className="icon">🗣️</span>Translated & Spoken Text
      </div>
      <div className="ocr-result">
        {translatedText}
        {audioUrl && (
          <audio
            src={audioUrl}
            ref={audioRef}
            controls
            autoPlay
            onEnded={handleAudioEnded}
            style={{ display: "block", marginTop: 8 }}
          />
        )}
        {ttsLoading && <div>Preparing speech...</div>}
      </div>
    </div>
  );
}
