/**
 * SpeechPonyfillChat Component (Tab 1: Speech Ponyfill)
 * =====================================================
 * FROZEN: Feb 6, 2026
 *
 * Web Chat component using Direct Line + Speech Ponyfill for voice integration.
 * Connects DIRECTLY to Copilot Studio (no proxy bot).
 *
 * Architecture: Browser → Direct Line → Copilot Studio
 *              Browser → Azure Speech SDK ponyfill → speakers/microphone
 *
 * Settings wired in this component:
 * - continuousRecognition → styleOptions.speechRecognitionContinuous (useMemo)
 * - autoStartMic → Ctrl+M keyboard event 500ms after 'connected' (useEffect)
 * - autoResumeListening → Ctrl+M 300ms after speechActivity 'speaking'→'idle' (useEffect)
 * - bargeInEnabled/Sensitivity → BargeInController.setConfig() (useEffect)
 * - onStopSpeaking → speechSynthesisRef.current.cancel() (passed to middleware)
 *
 * Settings wired in the hook (useDirectLinePonyfillConnection):
 * - locale, voice, speechRate, speechPitch (see hook docs)
 *
 * Settings NOT wired (displayed in panel but non-functional):
 * - interimResults — Web Chat DictateComposer internal
 * - silenceTimeoutMs — Azure Speech SDK recognizer internal
 *
 * Barge-in status: ⚠️ EXPERIMENTAL
 * The BargeInController monitors mic volume and calls speechSynthesis.cancel()
 * on the ponyfill's instance. This stops audio but Web Chat's internal state
 * may not fully update.
 *
 * @see docs/SPEECH_PONYFILL.md for detailed explanation
 * @see utils/textUtils.ts for middleware and BargeInController docs
 */

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import ReactWebChat, { createStore } from 'botframework-webchat';
import { useDirectLinePonyfillConnection } from '../hooks/useDirectLinePonyfillConnection';
import DebugPanel from './DebugPanel';
import KeyboardShortcuts from './KeyboardShortcuts';
import VoiceSettingsPanel from './VoiceSettingsPanel';
import type { PonyfillSettings } from './VoiceSettingsPanel';
import sounds, { setSoundEnabled } from '../utils/sounds';
import { createSpeechMiddleware, BargeInController } from '../utils/textUtils';
import PonyfillInfoPanels from './PonyfillInfoPanels';

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
 * Base styles for Web Chat - Citizen Advice branding (Ponyfill mode)
 * Note: speechRecognitionContinuous and other dynamic settings are applied
 * in the component via useMemo based on ponyfillSettings
 */
const baseWebChatStyleOptions = {
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
  timestampFormat: 'relative',
};

/**
 * SpeechPonyfillChat Component
 */
export const SpeechPonyfillChat: React.FC = () => {
  // State for enhanced features
  const [selectedLocale, setSelectedLocale] = useState('en-US');
  const [selectedVoice, setSelectedVoice] = useState('en-US-JennyNeural');
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [ponyfillSettings, setPonyfillSettings] = useState<PonyfillSettings>(DEFAULT_PONYFILL_SETTINGS);
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [interimText] = useState('');
  const [showCallModal, setShowCallModal] = useState(false);
  const [chatKey, setChatKey] = useState(0); // For clearing chat
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [innerTab, setInnerTab] = useState<'chat' | 'architecture' | 'connection' | 'resources'>('chat');
  const webChatRef = useRef<HTMLDivElement>(null);
  // Create barge-in controller immediately (synchronously) so it's available for store creation
  const bargeInControllerRef = useRef<BargeInController>(new BargeInController());
  const prevConnectionStatus = useRef<string>('idle');
  const prevSpeechActivity = useRef<string>('idle'); // Track previous speech activity for autoResumeListening

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
    speechSynthesisRef,
    connect,
    retry,
    disconnect,
  } = useDirectLinePonyfillConnection({
    // Optional: customize user identity
    userName: 'Demo User',
    locale: selectedLocale,
    voice: selectedVoice,
    // Pass all speech settings from ponyfillSettings
    speechRate: ponyfillSettings.speechRate,
    speechPitch: ponyfillSettings.speechPitch,
    interimResults: ponyfillSettings.interimResults,
    continuousRecognition: ponyfillSettings.continuousRecognition,
    silenceTimeoutMs: ponyfillSettings.silenceTimeoutMs,
  });

  // Store connect in ref to avoid stale closure
  const connectRef = useRef(connect);
  connectRef.current = connect;

  // Connect on mount - only once
  useEffect(() => {
    console.log('🔌 SpeechPonyfillChat mounted, calling connect()...');
    connectRef.current();
  }, []);

  // Play sound effects on connection status change
  useEffect(() => {
    if (prevConnectionStatus.current !== connectionStatus) {
      if (connectionStatus === 'connected' && prevConnectionStatus.current !== 'connected') {
        sounds.connected();
        
        // Auto-start mic if enabled in settings
        if (ponyfillSettings.autoStartMic) {
          console.log('🎤 Auto-starting microphone...');
          // Use a small delay to ensure Web Chat is fully rendered
          setTimeout(() => {
            // Programmatically click the mic button in Web Chat
            const micBtn = webChatRef.current?.querySelector('button[aria-label*="Microphone"]') as HTMLButtonElement
              || webChatRef.current?.querySelector('button[title*="Microphone"]') as HTMLButtonElement
              || webChatRef.current?.querySelector('.webchat__microphone-button button') as HTMLButtonElement
              || webChatRef.current?.querySelector('[class*="microphone"] button') as HTMLButtonElement;
            if (micBtn) {
              console.log('🎤 Found mic button, clicking...');
              micBtn.click();
            } else {
              console.warn('🎤 Mic button not found in Web Chat DOM');
            }
          }, 800);
        }
      } else if (connectionStatus === 'error') {
        sounds.error();
      }
      prevConnectionStatus.current = connectionStatus;
    }
  }, [connectionStatus, ponyfillSettings.autoStartMic]);

  // Auto-resume listening when bot finishes speaking (if enabled)
  useEffect(() => {
    // Only resume if:
    // 1. autoResumeListening is enabled
    // 2. We just finished speaking (was 'speaking', now 'idle')
    // 3. We're connected
    if (
      ponyfillSettings.autoResumeListening &&
      prevSpeechActivity.current === 'speaking' &&
      speechActivity === 'idle' &&
      connectionStatus === 'connected'
    ) {
      console.log('🎤 Auto-resuming listening after bot finished speaking...');
      setTimeout(() => {
        const micBtn = webChatRef.current?.querySelector('button[aria-label*="Microphone"]') as HTMLButtonElement
          || webChatRef.current?.querySelector('button[title*="Microphone"]') as HTMLButtonElement
          || webChatRef.current?.querySelector('.webchat__microphone-button button') as HTMLButtonElement
          || webChatRef.current?.querySelector('[class*="microphone"] button') as HTMLButtonElement;
        if (micBtn) {
          micBtn.click();
        }
      }, 300);
    }
    prevSpeechActivity.current = speechActivity;
  }, [speechActivity, ponyfillSettings.autoResumeListening, connectionStatus]);

  // Debug: log connection status changes
  useEffect(() => {
    console.log(`📊 Connection status: ${connectionStatus}, directLine: ${!!directLine}, ponyfill: ${!!webSpeechPonyfillFactory}`);
  }, [connectionStatus, directLine, webSpeechPonyfillFactory]);

  // Memoize style options - now dynamic based on ponyfillSettings
  const styleOptions = useMemo(() => ({
    ...baseWebChatStyleOptions,
    // Apply dynamic settings from ponyfillSettings
    speechRecognitionContinuous: ponyfillSettings.continuousRecognition,
  } as any), [ponyfillSettings.continuousRecognition]);

  // Initialize barge-in controller audio (controller already created in ref)
  useEffect(() => {
    const controller = bargeInControllerRef.current;
    controller.setConfig(ponyfillSettings.bargeInEnabled, ponyfillSettings.bargeInSensitivity);
    
    // Initialize audio asynchronously
    controller.initialize().then(() => {
      console.log('🎤 Barge-in controller audio initialized');
    });
    
    return () => {
      controller.destroy();
    };
  }, []);

  // Update barge-in controller when settings change
  useEffect(() => {
    bargeInControllerRef.current.setConfig(
      ponyfillSettings.bargeInEnabled,
      ponyfillSettings.bargeInSensitivity
    );
  }, [ponyfillSettings.bargeInEnabled, ponyfillSettings.bargeInSensitivity]);

  // Create Web Chat store with speech middleware and barge-in support
  // Re-create store when chatKey changes (on clear) to reset all state
  // Barge-in now dispatches WEB_CHAT/STOP_SPEAKING_ACTIVITY through the store directly
  const store = useMemo(() => createStore(
    {},
    createSpeechMiddleware({
      onSpeechActivity: (activity) => {
        console.log(`🎙️ Speech activity changed: ${activity}`);
        setSpeechActivity(activity);
      },
      bargeInController: bargeInControllerRef.current,
      onStopSpeaking: () => {
        console.log('🛑 Cancelling ponyfill speechSynthesis directly');
        speechSynthesisRef.current?.cancel();
      },
    })
  ), [chatKey, speechSynthesisRef]);

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
    // Check if any settings that require reconnection changed
    const localeChanged = newSettings.locale !== selectedLocale;
    const voiceChanged = newSettings.voice !== selectedVoice;
    const speechRateChanged = newSettings.speechRate !== ponyfillSettings.speechRate;
    const speechPitchChanged = newSettings.speechPitch !== ponyfillSettings.speechPitch;
    const silenceTimeoutChanged = newSettings.silenceTimeoutMs !== ponyfillSettings.silenceTimeoutMs;
    const continuousChanged = newSettings.continuousRecognition !== ponyfillSettings.continuousRecognition;
    const interimChanged = newSettings.interimResults !== ponyfillSettings.interimResults;
    
    const needsReconnect = localeChanged || voiceChanged || speechRateChanged || 
                           speechPitchChanged || silenceTimeoutChanged || 
                           continuousChanged || interimChanged;
    
    // Update state first
    setPonyfillSettings(newSettings);
    
    if (localeChanged) {
      setSelectedLocale(newSettings.locale);
    }
    if (voiceChanged) {
      setSelectedVoice(newSettings.voice);
    }
    
    if (needsReconnect) {
      console.log(`🔄 Settings changed - reconnecting with new settings...`);
      console.log(`   Locale: ${newSettings.locale}, Voice: ${newSettings.voice}`);
      console.log(`   Rate: ${newSettings.speechRate}, Pitch: ${newSettings.speechPitch}`);
      // Show feedback and close settings panel
      setShowSettingsPanel(false);
      setSettingsMessage(`🔄 Applying new settings (voice: ${newSettings.voice.split('-').slice(2).join(' ')})...`);
      setTimeout(() => setSettingsMessage(null), 3000);
      // Reconnect with new settings - use ref to get latest connect function
      disconnect();
      setTimeout(() => connectRef.current(), 500);
    }
  }, [selectedLocale, selectedVoice, ponyfillSettings, disconnect]);

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
      {/* Inner Sub-Tab Navigation */}
      <nav className="inner-tab-nav ponyfill-accent">
        {([
          { id: 'chat', icon: '💬', label: 'ChatBot' },
          { id: 'architecture', icon: '🏗️', label: 'Architecture' },
          { id: 'connection', icon: '🔌', label: 'Connection Flow' },
          { id: 'resources', icon: '📚', label: 'Resources' },
        ] as const).map(tab => (
          <button
            key={tab.id}
            className={`inner-tab-btn ${innerTab === tab.id ? 'active' : ''}`}
            onClick={() => setInnerTab(tab.id)}
          >
            <span className="inner-tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {innerTab === 'chat' ? (
      <>
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

      {/* Settings change feedback */}
      {settingsMessage && (
        <div style={{ padding: '8px 16px', background: '#fff4ce', color: '#856404', borderRadius: 8, margin: '8px 16px 0', fontSize: '0.9rem', textAlign: 'center', animation: 'fadeIn 0.3s' }}>
          {settingsMessage}
        </div>
      )}

      {/* Welcome Message */}
      {renderWelcome()}

      {/* Main Content Area */}
      <div className="chat-with-code-container">
        <div className="chat-main-area">
          <div className="webchat-wrapper">
            {connectionStatus === 'error' && renderError()}
            {(connectionStatus === 'idle' || connectionStatus === 'fetching-tokens' || connectionStatus === 'connecting') && renderLoading()}
            {connectionStatus === 'connected' && renderWebChat()}
          </div>
        </div>
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
      </>
      ) : (
        <PonyfillInfoPanels activeTab={innerTab} />
      )}
    </div>
  );
};

export default SpeechPonyfillChat;
