import React, { useState, useEffect, useRef } from 'react';
import './VoiceInput.css';

const VoiceInput = ({ onVoiceInput, onTranscription, disabled = false }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [language, setLanguage] = useState('en-IN');
  const [confidence, setConfidence] = useState(0);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);

  // Supported languages for Indian farmers
  const supportedLanguages = [
    { code: 'en-IN', name: 'English (India)', flag: '🇮🇳', script: 'Latin' },
    { code: 'hi-IN', name: 'हिंदी (Hindi)', flag: '🇮🇳', script: 'Devanagari' },
    { code: 'ta-IN', name: 'தமிழ் (Tamil)', flag: '🇮🇳', script: 'Tamil' },
    { code: 'te-IN', name: 'తెలుగు (Telugu)', flag: '🇮🇳', script: 'Telugu' },
    { code: 'bn-IN', name: 'বাংলা (Bengali)', flag: '🇮🇳', script: 'Bengali' },
    { code: 'mr-IN', name: 'मराठी (Marathi)', flag: '🇮🇳', script: 'Devanagari' },
    { code: 'gu-IN', name: 'ગુજરાતી (Gujarati)', flag: '🇮🇳', script: 'Gujarati' },
    { code: 'kn-IN', name: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳', script: 'Kannada' },
    { code: 'ml-IN', name: 'മലയാളം (Malayalam)', flag: '🇮🇳', script: 'Malayalam' },
    { code: 'pa-IN', name: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳', script: 'Gurmukhi' },
  ];

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      // Configure recognition
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 3;

      // Event handlers
      recognition.onstart = () => {
        console.log('🎤 Voice recognition started for language:', language);
        setIsListening(true);
        setTranscript('');
        setInterimTranscript('');
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        let maxConfidence = 0;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptSegment = event.results[i][0].transcript;
          const currentConfidence = event.results[i][0].confidence || 0.8;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcriptSegment;
            maxConfidence = Math.max(maxConfidence, currentConfidence);
          } else {
            interimTranscript += transcriptSegment;
          }
        }

        if (finalTranscript) {
          setTranscript(prev => {
            const newTranscript = prev + finalTranscript;
            // Call callback with transcription
            if (onTranscription) {
              onTranscription(finalTranscript);
            }
            return newTranscript;
          });
          setConfidence(maxConfidence);
        }

        setInterimTranscript(interimTranscript);

        // Reset silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        // Auto-stop after 3 seconds of silence
        silenceTimerRef.current = setTimeout(() => {
          if (recognitionRef.current && isListening) {
            stopListening();
          }
        }, 3000);
      };

      recognition.onerror = (event) => {
        console.error('🚫 Voice recognition error:', event.error);
        setIsListening(false);
        
        // Handle specific errors
        if (event.error === 'not-allowed') {
          alert('🎤 Microphone access denied. Please enable microphone permissions in your browser settings.');
        } else if (event.error === 'no-speech') {
          console.log('No speech detected, please try again...');
        } else if (event.error === 'network') {
          alert('🌐 Network error. Please check your internet connection.');
        } else if (event.error === 'language-not-supported') {
          alert(`🗣️ Language ${language} not supported. Please try English.`);
        }
      };

      recognition.onend = () => {
        console.log('🎤 Voice recognition ended');
        setIsListening(false);
        setInterimTranscript('');
        
        // Clear silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        
        // Send final transcript to parent
        if (transcript.trim() && onVoiceInput) {
          onVoiceInput(transcript.trim(), language, confidence);
          setTranscript('');
        }
      };

    } else {
      setIsSupported(false);
      console.warn('🚫 Speech Recognition not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [language]);

  const startListening = () => {
    if (recognitionRef.current && !isListening && !disabled) {
      setTranscript('');
      setInterimTranscript('');
      setConfidence(0);
      recognitionRef.current.lang = language;
      
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start recognition:', error);
        alert('Failed to start voice recognition. Please try again.');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    setConfidence(0);
  };

  const getLanguageInfo = () => {
    return supportedLanguages.find(lang => lang.code === language) || supportedLanguages[0];
  };

  if (!isSupported) {
    return (
      <div className="voice-input-container">
        <div className="voice-not-supported">
          <span className="voice-icon">🚫</span>
          <h3>Voice Input Not Supported</h3>
          <p>Your browser doesn't support voice recognition.</p>
          <small>Please use Chrome, Edge, or Safari for voice input.</small>
        </div>
      </div>
    );
  }

  const currentLang = getLanguageInfo();

  return (
    <div className="voice-input-container">
      <div className="voice-header">
        <div className="voice-title">
          <span className="voice-icon">🎤</span>
          <h3>Voice Input for AgriBot</h3>
          <span className="voice-badge">
            {currentLang.flag} {currentLang.script}
          </span>
        </div>
      </div>

      {/* Language Selection */}
      <div className="language-selector">
        <label htmlFor="language-select">
          <span className="label-icon">🗣️</span>
          Select Language:
        </label>
        <select
          id="language-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={isListening || disabled}
          className="language-select"
        >
          {supportedLanguages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Voice Controls */}
      <div className="voice-controls">
        <button
          className={`voice-button ${isListening ? 'listening' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={isListening ? stopListening : startListening}
          disabled={disabled}
          title={isListening ? 'Stop recording' : 'Start voice input'}
        >
          <span className="voice-icon">
            {isListening ? '🔴' : '🎤'}
          </span>
          <span className="voice-text">
            {isListening ? 'Stop Recording' : 'Start Voice Input'}
          </span>
          {isListening && (
            <div className="recording-indicator">
              <div className="pulse"></div>
            </div>
          )}
        </button>

        {(transcript || interimTranscript) && (
          <button
            className="clear-button"
            onClick={clearTranscript}
            title="Clear transcript"
            disabled={isListening}
          >
            <span className="clear-icon">🗑️</span>
            Clear
          </button>
        )}
      </div>

      {/* Transcript Display */}
      {(transcript || interimTranscript) && (
        <div className="transcript-display">
          <div className="transcript-header">
            <span className="transcript-icon">📝</span>
            <span>Voice Transcript:</span>
            {confidence > 0 && (
              <div className="confidence-indicator">
                <span className="confidence-label">Accuracy:</span>
                <div className="confidence-bar">
                  <div 
                    className="confidence-fill" 
                    style={{ width: `${confidence * 100}%` }}
                  ></div>
                </div>
                <span className="confidence-value">{Math.round(confidence * 100)}%</span>
              </div>
            )}
          </div>
          <div className="transcript-content">
            <span className="final-transcript">{transcript}</span>
            {interimTranscript && (
              <span className="interim-transcript">{interimTranscript}</span>
            )}
          </div>
        </div>
      )}

      {/* Voice Status */}
      {isListening && (
        <div className="voice-status">
          <div className="listening-indicator">
            <div className="sound-waves">
              <div className="wave"></div>
              <div className="wave"></div>
              <div className="wave"></div>
            </div>
            <span>🎤 Listening in {currentLang.name}... Speak now!</span>
          </div>
          <div className="voice-tips">
            <p>💡 Tips for better recognition:</p>
            <ul>
              <li>🗣️ Speak clearly and at normal pace</li>
              <li>🌾 Use farming terms in your selected language</li>
              <li>🔇 Minimize background noise</li>
              <li>📱 Hold device close to your mouth</li>
              <li>⏸️ Pause between sentences</li>
            </ul>
          </div>
        </div>
      )}

      {/* Example Phrases */}
      {!isListening && !transcript && (
        <div className="voice-examples">
          <h4>🎯 Try saying (in {currentLang.name}):</h4>
          <div className="example-phrases">
            {language === 'hi-IN' && (
              <>
                <span className="example">"धान की खेती कैसे करें?"</span>
                <span className="example">"गेहूं में कीट कैसे नियंत्रित करें?"</span>
                <span className="example">"NPK खाद कब डालें?"</span>
              </>
            )}
            {language === 'ta-IN' && (
              <>
                <span className="example">"நெல் சாகுபडি எப்படி செய்வது?"</span>
                <span className="example">"பருத्ति பயिर् में कीट नियंत्रण कैसे करें?"</span>
                <span className="example">"उर्वरक कब डालना चाहिए?"</span>
              </>
            )}
            {language === 'en-IN' && (
              <>
                <span className="example">"How to grow rice in monsoon?"</span>
                <span className="example">"Cotton pest control methods"</span>
                <span className="example">"Best fertilizer for wheat"</span>
                <span className="example">"Drip irrigation setup cost"</span>
              </>
            )}
            {!['hi-IN', 'ta-IN', 'en-IN'].includes(language) && (
              <>
                <span className="example">Ask about crop cultivation</span>
                <span className="example">Ask about pest control</span>
                <span className="example">Ask about fertilizers</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Browser Compatibility Note */}
      <div className="compatibility-note">
        <small>
          🌐 Voice input works best in Chrome, Edge, and Safari browsers.
          {navigator.userAgent.includes('Firefox') && 
            ' Firefox has limited voice recognition support.'
          }
        </small>
      </div>
    </div>
  );
};

export default VoiceInput;
