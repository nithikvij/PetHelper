"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

// Check if browser supports speech recognition
const isSpeechRecognitionSupported = () => {
  if (typeof window === "undefined") return false;
  return !!(
    window.SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition: unknown }).webkitSpeechRecognition
  );
};

export function VoiceInput({ onTranscript, disabled = false }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsSupported(isSpeechRecognitionSupported());

    if (isSpeechRecognitionSupported()) {
      const SpeechRecognition =
        window.SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition: typeof window.SpeechRecognition }).webkitSpeechRecognition;

      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Send final transcript to parent
        if (finalTranscript) {
          onTranscript(finalTranscript);
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);

        switch (event.error) {
          case "not-allowed":
            setError("Microphone access denied. Please allow microphone access.");
            break;
          case "no-speech":
            setError("No speech detected. Please try again.");
            break;
          case "network":
            setError("Network error. Please check your connection.");
            break;
          default:
            setError("An error occurred. Please try again.");
        }

        // Clear error after 3 seconds
        setTimeout(() => setError(null), 3000);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [onTranscript]);

  const toggleListening = useCallback(() => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setError(null);
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
        setError("Failed to start voice input. Please try again.");
      }
    }
  }, [recognition, isListening]);

  if (!isSupported) {
    return null; // Don't show button if not supported
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant={isListening ? "destructive" : "outline"}
        size="icon"
        onClick={toggleListening}
        disabled={disabled}
        className={`relative ${isListening ? "animate-pulse" : ""}`}
        title={isListening ? "Stop recording" : "Start voice input"}
      >
        {isListening ? (
          // Stop icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          // Microphone icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
        )}
      </Button>

      {/* Recording indicator */}
      {isListening && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      )}

      {/* Error tooltip */}
      {error && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded whitespace-nowrap z-10">
          {error}
        </div>
      )}
    </div>
  );
}
