/**
 * SpeechPonyfillChat Component
 * ============================
 * Web Chat component using Direct Line + Speech Ponyfill for voice integration.
 * 
 * This is the ALTERNATIVE voice integration approach that:
 * - Uses standard Direct Line for all messaging
 * - Adds speech capabilities via a Web Speech API ponyfill
 * - Keeps messaging and speech as separate layers
 * 
 * When to use this approach:
 * - You have an existing Direct Line bot and want to add voice
 * - You need full conversation history available in Direct Line
 * - Voice is optional or an add-on feature
 * - You need custom speech configuration
 * 
 * The component connects to the same Copilot Studio agent as the text demo,
 * demonstrating that the same agent can be accessed via different channels.
 * 
 * DEMO TIPS:
 * - Compare the network traffic with Direct Line Speech mode
 * - Show that messages go through standard Direct Line endpoints
 * - Explain the trade-offs between the two approaches
 * 
 * @see docs/SPEECH_PONYFILL.md for detailed explanation
 */

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import ReactWebChat, { createStore } from 'botframework-webchat';
import { useDirectLinePonyfillConnection } from '../hooks/useDirectLinePonyfillConnection';
import DebugPanel from './DebugPanel';
import KeyboardShortcuts from './KeyboardShortcuts';
import CodePanel from './CodePanel';
import type { ActiveCodeSection } from './CodePanel';
import VoiceSettingsPanel from './VoiceSettingsPanel';
import type { PonyfillSettings } from './VoiceSettingsPanel';
import sounds, { setSoundEnabled } from '../utils/sounds';
import { createSpeechMiddleware, BargeInController } from '../utils/textUtils';

// Default Ponyfill settings
const DEFAULT_PONYFILL_SETTINGS: PonyfillSettings = {
  locale: 'en-US',
  voice: 'en-US-JennyNeural',
  bargeInEnabled: true,
  bargeInSensitivity: 'medium',
  continuousRecognition: true,
  interimResults: true,
  speechRate: 1.0,
  speechPitch: 1.0,
  autoStartMic: false,
  autoResumeListening: true,
  silenceTimeoutMs: 3000,
};

// Quick reply suggestions
const QUICK_REPLIES = [
  'What can you help me with?',
  'Tell me about benefits',
  'I need housing advice',
  'How do I contact you?',
];

/**
 * Custom styles for Web Chat - Citizen Advice branding (Ponyfill mode)
 * Different accent color to distinguish from Direct Line Speech mode
 */
const webChatStyleOptions = {
  // Colors - Citizen Advice green accent for ponyfill mode
  primaryFont: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  accent: '#00a878',  // Citizen Advice green (alternative mode)
  
  // Bubble styling - Enhanced
  bubbleBackground: '#f8f9fa',
  bubbleBorderRadius: 18,
  bubbleFromUserBackground: 'linear-gradient(135deg, #0078d4 0%, #106ebe 100%)',
  bubbleFromUserTextColor: '#ffffff',
  bubbleFromUserBorderRadius: 18,
  bubbleNubSize: 0,
  bubbleNubOffset: 0,
  
  // Avatar - Citizen Advice
  botAvatarInitials: 'CA',  // Citizen Advice
  userAvatarInitials: 'You',
  botAvatarBackgroundColor: '#00a878',
  userAvatarBackgroundColor: '#0078d4',
  
  // Hide upload button
  hideUploadButton: true,
  
  // Suggested actions
  suggestedActionsHeight: 40,
  suggestedActionsStackedHeight: 120,
  suggestedActionBackground: 'white',
  suggestedActionBorder: '2px solid #00a878',
  suggestedActionBorderRadius: 20,
  suggestedActionTextColor: '#00a878',
  
  // Microphone button styling
  microphoneButtonColorOnDictate: '#004b88',  // Citizen Advice blue
  
  // New 4.18.x features for voice
  speechRecognitionContinuous: true,  // Keep mic open for natural conversation
  
  // Send box
  sendBoxBackground: '#f8f9fa',
  sendBoxBorderTop: '1px solid #e8e8e8',
  sendBoxButtonColor: '#00a878',
  sendBoxHeight: 50,
  
  // Timestamps
  groupTimestamp: true,
  timestampFormat: 'relative' as const,
};

/**
 * SpeechPonyfillChat Component
 */
export const SpeechPonyfillChat: React.FC = () => {
  // State for enhanced features
  const [selectedLocale, setSelectedLocale] = useState('en-US');
  const [selectedVoice, setSelectedVoice] = useState('en-US-JennyNeural');
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [showCodePanel, setShowCodePanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [ponyfillSettings, setPonyfillSettings] = useState<PonyfillSettings>(DEFAULT_PONYFILL_SETTINGS);
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [interimText] = useState('');
  const [showCallModal, setShowCallModal] = useState(false);
  const [chatKey, setChatKey] = useState(0); // For clearing chat
  const webChatRef = useRef<HTMLDivElement>(null);
  const bargeInControllerRef = useRef<BargeInController | null>(null);
  const prevConnectionStatus = useRef<string>('idle');

  // Track speech activity from Web Chat events
  const [speechActivity, setSpeechActivity] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  
  const {
    directLine,
    webSpeechPonyfillFactory,
    connectionStatus,
    errorMessage,
    listeningStatus: _hookListeningStatus, // We'll use our own tracked state
    conversationId,
    locale,
    connect,
    retry,
    disconnect,
  } = useDirectLinePonyfillConnection({
    // Optional: customize user identity
    userName: 'Demo User',
    locale: selectedLocale,
    voice: selectedVoice,
  });

  // Connect on mount
  useEffect(() => {
    console.log('🔌 SpeechPonyfillChat mounted, calling connect()...');
    connect();
  }, [connect]);

  // Play sound effects on connection status change
  useEffect(() => {
    if (prevConnectionStatus.current !== connectionStatus) {
      if (connectionStatus === 'connected' && prevConnectionStatus.current !== 'connected') {
        sounds.connected();
      } else if (connectionStatus === 'error') {
        sounds.error();
      }
      prevConnectionStatus.current = connectionStatus;
    }
  }, [connectionStatus]);

  // Debug: log connection status changes
  useEffect(() => {
    console.log(`📊 Connection status: ${connectionStatus}, directLine: ${!!directLine}, ponyfill: ${!!webSpeechPonyfillFactory}`);
  }, [connectionStatus, directLine, webSpeechPonyfillFactory]);

  // Memoize style options
  const styleOptions = useMemo(() => webChatStyleOptions, []);

  // Initialize barge-in controller
  useEffect(() => {
    const controller = new BargeInController();
    controller.initialize().then(() => {
      controller.setConfig(ponyfillSettings.bargeInEnabled, ponyfillSettings.bargeInSensitivity);
      bargeInControllerRef.current = controller;
    });
    
    return () => {
      controller.destroy();
    };
  }, []);

  // Update barge-in controller when settings change
  useEffect(() => {
    if (bargeInControllerRef.current) {
      bargeInControllerRef.current.setConfig(
        ponyfillSettings.bargeInEnabled,
        ponyfillSettings.bargeInSensitivity
      );
    }
  }, [ponyfillSettings.bargeInEnabled, ponyfillSettings.bargeInSensitivity]);

  // Function to stop speech synthesis (for barge-in)
  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      console.log('🛑 Speech synthesis cancelled (barge-in)');
    }
  }, []);

  // Create Web Chat store with speech middleware and barge-in support
  // Re-create store when chatKey changes (on clear) to reset all state
  const store = useMemo(() => createStore(
    {},
    createSpeechMiddleware({
      onSpeechActivity: (activity) => {
        console.log(`🎙️ Speech activity changed: ${activity}`);
        setSpeechActivity(activity);
      },
      bargeInController: bargeInControllerRef.current ?? undefined,
      onStopSpeaking: stopSpeaking,
    })
  ), [stopSpeaking, chatKey]);

  // Derive active code section for CodePanel using our tracked speech activity
  const activeCodeSection = useMemo((): ActiveCodeSection => {
    if (connectionStatus === 'error') return 'error';
    if (connectionStatus === 'fetching-tokens') return 'fetching-tokens';
    if (connectionStatus === 'connecting') return 'connecting';
    if (connectionStatus === 'connected') {
      if (speechActivity === 'listening') return 'listening';
      if (speechActivity === 'processing') return 'processing';
      if (speechActivity === 'speaking') return 'speaking';
      return 'connected';
    }
    return 'idle';
  }, [connectionStatus, speechActivity]);

  // Handle clear chat
  const handleClearChat = useCallback(() => {
    sounds.clear();
    disconnect();
    setSpeechActivity('idle'); // Reset speech activity for CodePanel
    setChatKey(prev => prev + 1);
    setShowWelcome(true);
    setTimeout(() => connect(), 100);
  }, [disconnect, connect]);

  // Handle toggle sound
  const handleToggleSound = useCallback(() => {
    const newState = !soundEnabled;
    setSoundEnabledState(newState);
    setSoundEnabled(newState);
  }, [soundEnabled]);

  // Handle quick reply click
  const handleQuickReply = useCallback((text: string) => {
    // Web Chat doesn't expose a direct way to send messages,
    // but we can use the store if available. For now, we'll copy to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setShowWelcome(false);
  }, []);


  // Handle settings change from the settings panel
  const handlePonyfillSettingsChange = useCallback((newSettings: PonyfillSettings) => {
    setPonyfillSettings(newSettings);
    // Sync locale and voice with component state
    if (newSettings.locale !== selectedLocale) {
      setSelectedLocale(newSettings.locale);
      disconnect();
      setTimeout(() => connect(), 100);
    }
    if (newSettings.voice !== selectedVoice) {
      setSelectedVoice(newSettings.voice);
    }
  }, [selectedLocale, selectedVoice, disconnect, connect]);

  // Hide welcome when user starts typing
  useEffect(() => {
    if (speechActivity === 'listening' || speechActivity === 'processing') {
      setShowWelcome(false);
    }
  }, [speechActivity]);

  /**
   * Render status bar showing connection and voice states
   */
  const renderStatusBar = () => {
    const getStatusText = () => {
      switch (connectionStatus) {
        case 'idle':
          return 'Ready to connect';
        case 'fetching-tokens':
          return 'Getting credentials...';
        case 'connecting':
          return 'Connecting...';
        case 'connected':
          return 'Connected';
        case 'error':
          return 'Connection failed';
        case 'disconnected':
          return 'Disconnected';
        default:
          return 'Unknown';
      }
    };

    const getListeningText = () => {
      switch (speechActivity) {
        case 'listening':
          return '🎤 Listening...';
        case 'processing':
          return '⏳ Processing...';
        case 'speaking':
          return '🔊 Speaking...';
        default:
          return 'Ready';
      }
    };

    const getStatusClass = () => {
      switch (connectionStatus) {
        case 'connected': return 'connected';
        case 'connecting':
        case 'fetching-tokens': return 'connecting';
        case 'error': return 'error';
        default: return 'disconnected';
      }
    };

    return (
      <div className="status-bar">
        {/* Connection Status Badge */}
        <div className={`connection-status-badge ${getStatusClass()}`}>
          <span className={`status-dot ${connectionStatus} status-pulse`} />
          <span>{getStatusText()}</span>
        </div>

        {connectionStatus === 'connected' && (
          <>
            <div className="voice-indicator">
              <span>{getListeningText()}</span>
            </div>
            {conversationId && (
              <div style={{ fontSize: '0.75rem', color: '#605e5c' }}>
                Conv: {conversationId.substring(0, 8)}...
              </div>
            )}
          </>
        )}

        {/* Sound toggle */}
        <button
          onClick={handleToggleSound}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            opacity: soundEnabled ? 1 : 0.5,
          }}
          title={soundEnabled ? 'Sound on' : 'Sound off'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>

        {/* Clear chat button */}
        <button className="clear-chat-btn" onClick={handleClearChat} title="Clear chat (Ctrl+L)">
          🗑️ Clear
        </button>

        {/* Toggle code panel button */}
        <button 
          className={`toggle-code-btn ${showCodePanel ? 'active' : ''}`}
          onClick={() => setShowCodePanel(prev => !prev)}
          title="Toggle code view (Ctrl+K)"
        >
          <span className="code-icon">{'</>'}</span>
          {showCodePanel ? 'Hide Code' : 'Show Code'}
        </button>

        <button 
          className="phone-call-btn"
          onClick={() => setShowCallModal(true)}
          title="Call via phone: +1 (786) 687-0264"
        >
           Call
        </button>

        {/* Settings button */}
        <button 
          className="settings-btn"
          onClick={() => setShowSettingsPanel(true)}
          title="Voice settings"
        >
          <span className="settings-icon">⚙️</span>
          Settings
        </button>
      </div>
    );
  };

  /**
   * Render speech recognition display (interim results)
   */
  const renderSpeechDisplay = () => {
    const isActive = speechActivity === 'listening' || speechActivity === 'processing';
    
    return (
      <div className={`speech-recognition-display ${isActive ? 'active' : 'idle'}`}>
        <div className="mic-visual">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="mic-bar" />
          ))}
        </div>
        <span className={interimText ? 'interim-text' : ''}>
          {speechActivity === 'listening' 
            ? (interimText || 'Listening... speak now')
            : speechActivity === 'processing'
            ? 'Processing your speech...'
            : 'Click the microphone or press Ctrl+M to speak'}
        </span>
      </div>
    );
  };

  /**
   * Render welcome message
   */
  const renderWelcome = () => {
    if (!showWelcome || connectionStatus !== 'connected') return null;
    
    return (
      <div className="welcome-message">
        <h4>👋 Welcome to Citizen Advice!</h4>
        <p>
          I'm here to help you with benefits, housing, employment, and more.
          You can type your question or click the microphone to speak.
        </p>
        <div className="quick-replies">
          {QUICK_REPLIES.map((reply, idx) => (
            <button 
              key={idx}
              className="quick-reply-btn"
              onClick={() => handleQuickReply(reply)}
            >
              {reply}
            </button>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Render loading state with steps
   */
  const renderLoading = () => {
    const steps = [
      { id: 'tokens', label: 'Fetching tokens', completed: connectionStatus !== 'fetching-tokens' && connectionStatus !== 'idle' },
      { id: 'directline', label: 'Connecting to Direct Line', completed: connectionStatus === 'connected' },
      { id: 'speech', label: 'Initializing speech services', completed: connectionStatus === 'connected' },
    ];
    
    const activeStep = connectionStatus === 'fetching-tokens' ? 0 : connectionStatus === 'connecting' ? 1 : 2;
    
    return (
      <div className="loading-container enhanced">
        <div className="loading-spinner enhanced" />
        <p style={{ fontWeight: 600, marginTop: '16px' }}>
          {connectionStatus === 'fetching-tokens'
            ? 'Fetching Direct Line & Speech tokens...'
            : 'Connecting to Copilot Studio...'}
        </p>
        <div className="loading-steps">
          {steps.map((step, idx) => (
            <div 
              key={step.id}
              className={`loading-step ${step.completed ? 'completed' : idx === activeStep ? 'active' : 'pending'}`}
            >
              <span className="step-icon">
                {step.completed ? '✓' : idx === activeStep ? '⟳' : '○'}
              </span>
              <span>{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Render error state with suggestions
   */
  const renderError = () => (
    <div className="error-container enhanced">
      <h3>❌ Connection Failed</h3>
      <p>{errorMessage || 'Unable to connect to the service'}</p>
      <div className="error-details">
        <code>{errorMessage}</code>
      </div>
      <ul className="error-suggestions">
        <li>Check your internet connection</li>
        <li>Verify the backend server is running (port 3001)</li>
        <li>Ensure Azure credentials are configured</li>
        <li>Check the browser console for details</li>
      </ul>
      <button onClick={retry}>🔄 Try Again</button>
    </div>
  );

  /**
   * Render the Web Chat
   */
  const renderWebChat = () => {
    if (!directLine || !webSpeechPonyfillFactory) return null;

    return (
      <div ref={webChatRef} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ReactWebChat
          key={chatKey}
          directLine={directLine as any}
          webSpeechPonyfillFactory={webSpeechPonyfillFactory as any}
          store={store}
          styleOptions={styleOptions}
          locale={selectedLocale}
        />
      </div>
    );
  };

  return (
    <div className="chat-container">
      {/* Info Panel */}
      <div className="info-panel">
        <h3>🔊 Speech Ponyfill ({selectedLocale === 'en-US' ? 'US' : selectedLocale === 'en-GB' ? 'UK' : selectedLocale})</h3>
        <p>
          Using Direct Line for messaging + Azure Speech Services for voice.
          Click <strong>Settings</strong> to configure voice and language options.
        </p>
      </div>

      {/* Speech Recognition Display */}
      {connectionStatus === 'connected' && renderSpeechDisplay()}

      {/* Status Bar */}
      {renderStatusBar()}

      {/* Welcome Message */}
      {renderWelcome()}

      {/* Main Content Area - Side by Side with Code Panel */}
      <div className={`chat-with-code-container ${showCodePanel ? 'code-visible' : ''}`}>
        {/* Chat Area */}
        <div className="chat-main-area">
          <div className="webchat-wrapper">
            {connectionStatus === 'error' && renderError()}
            {(connectionStatus === 'idle' || connectionStatus === 'fetching-tokens' || connectionStatus === 'connecting') && renderLoading()}
            {connectionStatus === 'connected' && renderWebChat()}
          </div>
        </div>

        {/* Code Panel */}
        <CodePanel
          mode="ponyfill"
          activeSection={activeCodeSection}
          isVisible={showCodePanel}
          onClose={() => setShowCodePanel(false)}
          conversationId={conversationId}
          region="eastus"
          locale={selectedLocale}
        />
      </div>

      {/* Debug Panel */}
      {showDebugPanel && (
        <DebugPanel
          connectionStatus={connectionStatus}
          conversationId={conversationId}
          locale={locale}
          listeningStatus={speechActivity}
          speechRegion="eastus"
        />
      )}

      {/* Voice Settings Panel */}
      <VoiceSettingsPanel
        mode="ponyfill"
        isVisible={showSettingsPanel}
        onClose={() => setShowSettingsPanel(false)}
        ponyfillSettings={{
          ...ponyfillSettings,
          locale: selectedLocale,
          voice: selectedVoice,
        }}
        onPonyfillSettingsChange={handlePonyfillSettingsChange}
      />

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts
        onClearChat={handleClearChat}
        onToggleDebug={() => setShowDebugPanel(prev => !prev)}
        onToggleSound={handleToggleSound}
      />

      {/* Call Modal */}
      {showCallModal && (
        <div className="call-modal-overlay" onClick={() => setShowCallModal(false)}>
          <div className="call-modal" onClick={(e) => e.stopPropagation()}>
            <button className="call-modal-close" onClick={() => setShowCallModal(false)}>✕</button>
            <h2>📞 Call the Bot</h2>
            <p>Scan the QR code or dial the number:</p>
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=tel:+17866870264" 
              alt="QR Code"
              className="call-modal-qr"
            />
            <div className="call-modal-number">+1 (786) 687-0264</div>
            <a href="tel:+17866870264" className="call-modal-btn">📱 Open Phone App</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeechPonyfillChat;
