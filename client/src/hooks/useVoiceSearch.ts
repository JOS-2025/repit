import { useState, useEffect, useRef } from 'react';

interface UseVoiceSearchProps {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
  language?: string;
}

interface VoiceSearchState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
}

export function useVoiceSearch({ onResult, onError, language = 'en-US' }: UseVoiceSearchProps) {
  const [state, setState] = useState<VoiceSearchState>({
    isListening: false,
    isSupported: false,
    transcript: '',
    error: null,
  });

  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if Speech Recognition is supported
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setState(prev => ({ ...prev, isSupported: true }));
      
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setState(prev => ({ ...prev, isListening: true, error: null }));
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        
        setState(prev => ({ ...prev, transcript }));
        
        // If final result, stop listening and call onResult
        if (event.results[event.results.length - 1].isFinal) {
          onResult(transcript.trim());
          stopListening();
        }
      };

      recognition.onerror = (event: any) => {
        const errorMessage = getErrorMessage(event.error);
        setState(prev => ({ 
          ...prev, 
          error: errorMessage, 
          isListening: false 
        }));
        onError?.(errorMessage);
      };

      recognition.onend = () => {
        setState(prev => ({ ...prev, isListening: false }));
      };

      recognitionRef.current = recognition;
    } else {
      setState(prev => ({ 
        ...prev, 
        isSupported: false, 
        error: 'Speech recognition not supported in this browser' 
      }));
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [language, onResult, onError]);

  const startListening = () => {
    if (!recognitionRef.current || state.isListening) return;

    try {
      setState(prev => ({ ...prev, transcript: '', error: null }));
      recognitionRef.current.start();
      
      // Auto-stop after 10 seconds
      timeoutRef.current = setTimeout(() => {
        stopListening();
      }, 10000);
    } catch (error) {
      const errorMessage = 'Failed to start voice recognition';
      setState(prev => ({ ...prev, error: errorMessage }));
      onError?.(errorMessage);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop();
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setState(prev => ({ ...prev, isListening: false }));
  };

  const toggleListening = () => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return {
    ...state,
    startListening,
    stopListening,
    toggleListening,
  };
}

function getErrorMessage(error: string): string {
  switch (error) {
    case 'no-speech':
      return 'No speech detected. Please try again.';
    case 'audio-capture':
      return 'Microphone not accessible. Please check permissions.';
    case 'not-allowed':
      return 'Microphone permission denied. Please enable microphone access.';
    case 'network':
      return 'Network error occurred. Please check your connection.';
    case 'language-not-supported':
      return 'Language not supported for voice recognition.';
    case 'service-not-allowed':
      return 'Voice recognition service not allowed.';
    default:
      return 'Voice recognition error occurred. Please try again.';
  }
}

// Extend the Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}