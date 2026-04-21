/**
 * useVoiceInput — Web Speech API integration for voice-to-text.
 * Falls back gracefully if browser doesn't support SpeechRecognition.
 */

import { useState, useCallback, useRef, useEffect } from "react";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export function useVoiceInput({ onResult, language = "en-IN" } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const supported = !!SpeechRecognition;

  // Initialize recognition instance
  useEffect(() => {
    if (!supported) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += t;
        } else {
          interim += t;
        }
      }
      setTranscript(final || interim);
      if (final && onResult) {
        onResult(final.trim());
      }
    };

    recognition.onerror = (event) => {
      // "no-speech" and "aborted" are expected, don't surface them
      if (event.error === "no-speech" || event.error === "aborted") {
        setIsListening(false);
        return;
      }
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try { recognition.abort(); } catch { /* ignore */ }
    };
  }, [supported, language]); // intentionally exclude onResult to avoid re-init

  const startListening = useCallback(() => {
    if (!supported || !recognitionRef.current) {
      setError("Speech recognition not supported in this browser");
      return;
    }
    setTranscript("");
    setError(null);
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      // If already started, restart
      try {
        recognitionRef.current.abort();
        recognitionRef.current.start();
        setIsListening(true);
      } catch { setError("Could not start voice input"); }
    }
  }, [supported]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch { /* ignore */ }
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    transcript,
    error,
    supported,
    startListening,
    stopListening,
    toggleListening,
  };
}
