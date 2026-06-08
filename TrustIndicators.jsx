import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CallerInfoPanel from './components/CallerInfoPanel';
import TranslationDisplay from './components/TranslationDisplay';
import AudioControls from './components/AudioControls';
import MessageTakingPanel from './components/MessageTakingPanel';
import TranslationCorrection from './components/TranslationCorrection';
import { getStructuredTranslation } from '../../services/openaiService';

const ActiveCallInterface = () => {
  const navigate = useNavigate();

  // Call state
  const [callDuration, setCallDuration] = useState('00:00');
  const [connectionQuality, setConnectionQuality] = useState('excellent');
  const [isRecording, setIsRecording] = useState(true);

  // Audio state
  const [isMuted, setIsMuted] = useState(false);
  const [inputVolume, setInputVolume] = useState(75);
  const [outputVolume, setOutputVolume] = useState(80);

  // Translation state
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationConfidence, setTranslationConfidence] = useState(92);
  const [conversations, setConversations] = useState([]);
  const [translationServiceStatus, setTranslationServiceStatus] = useState('ready'); // ready, error, unavailable

  // UI state
  const [showMessagePanel, setShowMessagePanel] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionData, setCorrectionData] = useState(null);
  const [isTransferring, setIsTransferring] = useState(false);

  // Caller information
  const callerInfo = {
    name: "María González",
    phone: "+1 (555) 123-4567",
    location: "Los Angeles, CA"
  };

  // Simulate incoming Spanish audio for translation
  const simulateIncomingSpanish = async () => {
    const spanishPhrases = [
    "Hola, necesito hablar con un abogado sobre un problema con mi contrato de trabajo.",
    "Mi empleador no me está pagando las horas extras que trabajé el mes pasado.",
    "¿Pueden ayudarme con este caso? Es muy urgente para mí.",
    "Trabajo en una fábrica y creo que me están discriminando por mi nacionalidad.",
    "¿Cuánto cobran por una consulta legal sobre derechos laborales?"];


    for (let i = 0; i < spanishPhrases.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 8000 + i * 2000)); // Stagger the phrases

      const spanishText = spanishPhrases[i];
      setIsTranslating(true);
      setTranslationServiceStatus('ready');

      try {
        const translation = await getStructuredTranslation(spanishText);

        const newConversation = {
          id: Date.now() + i,
          spanish: translation.original,
          english: translation.translated,
          timestamp: translation.timestamp,
          confidence: translation.confidence,
          isLive: i === spanishPhrases.length - 1, // Mark last one as live
          success: translation.success,
          error: translation.error || null,
          errorType: translation.errorType || null
        };

        setConversations((prev) => [...prev, newConversation]);
        setTranslationConfidence(translation.confidence);
        setIsTranslating(false);

        // Update service status based on translation success
        if (!translation.success) {
          setTranslationServiceStatus('error');
          
          // Show user notification for specific errors
          if (translation.errorType === 'QUOTA_EXCEEDED') {
            // You could trigger a toast notification here
            console.warn('Translation quota exceeded - showing fallback message');
          }
        } else {
          setTranslationServiceStatus('ready');
        }

      } catch (error) {
        console.error('Translation failed:', error);
        setIsTranslating(false);
        setTranslationServiceStatus('error');

        // Enhanced fallback conversation with error details
        const fallbackConversation = {
          id: Date.now() + i,
          spanish: spanishText,
          english: "⚠️ Translation service temporarily unavailable. Please check your connection or contact support.",
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          confidence: 0,
          isLive: false,
          success: false,
          error: "Service unavailable",
          errorType: "UNKNOWN_ERROR"
        };
        setConversations((prev) => [...prev, fallbackConversation]);
      }
    }
  };

  // Initialize translations
  useEffect(() => {
    // Start simulating conversations after a short delay
    const timer = setTimeout(() => {
      simulateIncomingSpanish();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Call duration timer
  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
      const seconds = (elapsed % 60).toString().padStart(2, '0');
      setCallDuration(`${minutes}:${seconds}`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simulate translation activity
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTranslating((prev) => !prev);
      setTranslationConfidence(Math.floor(Math.random() * 20) + 80);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (type, value) => {
    if (type === 'input') {
      setInputVolume(parseInt(value));
    } else {
      setOutputVolume(parseInt(value));
    }
  };

  const handleEmergencyTransfer = () => {
    setIsTransferring(true);
    setTimeout(() => {
      setIsTransferring(false);
      alert('Call transferred to supervisor successfully');
    }, 2000);
  };

  const handleEndCall = () => {
    if (window.confirm('Are you sure you want to end this call?')) {
      navigate('/call-history-transcripts');
    }
  };

  const handleCorrection = (index) => {
    const conversation = conversations[index];
    setCorrectionData({
      index,
      original: conversation.spanish,
      translated: conversation.english
    });
    setShowCorrectionModal(true);
  };

  const handleSaveCorrection = (correctionInfo) => {
    const updatedConversations = [...conversations];
    updatedConversations[correctionData.index].english = correctionInfo.corrected;
    updatedConversations[correctionData.index].corrected = true;
    setConversations(updatedConversations);
    setShowCorrectionModal(false);
    setCorrectionData(null);
  };

  const handleSaveMessage = (messageData) => {
    console.log('Message saved:', messageData);
    setShowMessagePanel(false);
    alert('Message saved successfully');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Caller Information Panel */}
      <CallerInfoPanel
        callerInfo={callerInfo}
        callDuration={callDuration}
        connectionQuality={connectionQuality}
        isRecording={isRecording} />

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Translation Display */}
        <TranslationDisplay
          conversations={conversations}
          isTranslating={isTranslating}
          translationConfidence={translationConfidence}
          onCorrection={handleCorrection} className="fixed right-6 bottom-[68px] w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-floating hover:bg-primary/90 transition-professional focus:ring-4 focus:ring-primary/20 z-40" />

        {/* Message Taking Panel */}
        <MessageTakingPanel
          isVisible={showMessagePanel}
          onClose={() => setShowMessagePanel(false)}
          onSaveMessage={handleSaveMessage}
          callerInfo={callerInfo} />
      </div>

      {/* Audio Controls */}
      <AudioControls
        isMuted={isMuted}
        onMuteToggle={handleMuteToggle}
        inputVolume={inputVolume}
        outputVolume={outputVolume}
        onVolumeChange={handleVolumeChange}
        onEmergencyTransfer={handleEmergencyTransfer}
        onEndCall={handleEndCall}
        isTransferring={isTransferring} />

      {/* Floating Action Button for Message Taking */}
      <button
        onClick={() => setShowMessagePanel(true)}
        className="fixed right-6 bottom-[68px] w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-floating hover:bg-primary/90 transition-professional focus:ring-4 focus:ring-primary/20 z-40"
        title="Take Message">

        <div className="flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <path d="M8 10h8" />
            <path d="M8 14h6" />
          </svg>
        </div>
      </button>

      {/* Translation Correction Modal */}
      <TranslationCorrection
        isVisible={showCorrectionModal}
        originalText={correctionData?.original}
        translatedText={correctionData?.translated}
        onSave={handleSaveCorrection}
        onCancel={() => {
          setShowCorrectionModal(false);
          setCorrectionData(null);
        }} />

      {/* Bottom UI Elements - Side by Side */}
      <div className="fixed bottom-4 left-4 right-4 flex justify-between items-end z-30">
        {/* Enhanced AI Translation Status with Error Handling */}
        <div className="bg-surface border border-border rounded-lg p-3 shadow-professional flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              translationServiceStatus === 'error' ? 'bg-destructive' : isTranslating ?'bg-primary animate-pulse' : 'bg-success'
            }`}></div>
            <span className="text-sm font-medium text-foreground">
              {translationServiceStatus === 'error' ? 'AI Service Error' : isTranslating ?'AI Translating...' : 'AI Ready'}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {translationServiceStatus === 'error' ? 'Check quota/connection' : 'OpenAI GPT-4o'}
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="bg-surface border border-border rounded-lg p-3 shadow-professional">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Space</kbd>
              <span>Toggle Mute</span>
            </div>
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-muted rounded text-xs">M</kbd>
              <span>Take Message</span>
            </div>
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd>
              <span>End Call</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveCallInterface;