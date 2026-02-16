/**
 * DirectLineSpeechChat Component (Tab 2: Proxy Bot)
 * ==================================================
 * FROZEN: Feb 6, 2026
 *
 * Web Chat component using Proxy Bot for voice integration.
 * Messages go through the Proxy Bot; speech is client-side ponyfill.
 *
 * Architecture: Browser → Direct Line → Proxy Bot → Copilot Studio
 *              Browser → Azure Speech SDK ponyfill → speakers/microphone
 *
 * The Proxy Bot (thr505-dls-proxy-bot.azurewebsites.net) is an Azure Bot
 * Service app that receives messages via Direct Line and forwards them to
 * the Copilot Studio agent. This adds a middleware layer for logging,
 * auth, and message transformation.
 *
 * Settings wired in this component:
 * - continuousRecognition → styleOptions.speechRecognitionContinuous (useMemo)
 * - autoStartMic → Ctrl+M keyboard event 500ms after 'connected' (useEffect)
 * - autoResumeListening → Ctrl+M 300ms after speechActivity 'speaking'→'idle' (useEffect)
 * - bargeInEnabled/Sensitivity → BargeInController.setConfig() (useEffect)
 * - onStopSpeaking → speechSynthesisRef.current.cancel() (passed to middleware)
 *
 * Settings wired in the hook (useDirectLineSpeechConnection):
 * - locale, voice, speechRate, speechPitch (see hook docs)
 *
 * Settings NOT wired (displayed in panel but non-functional):
 * - interimResults — Web Chat DictateComposer internal
 * - silenceTimeoutMs — Azure Speech SDK recognizer internal
 *
 * Barge-in status: ⚠️ EXPERIMENTAL (same as Tab 1)
 *
 * DEMO TIPS:
 * - Show the microphone button in the Web Chat
 * - Explain the proxy bot middleware concept
 * - Compare with direct Copilot Studio connection (Tab 1)
 */

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import ReactWebChat, { createStore } from 'botframework-webchat';
import { useDirectLineSpeechConnection } from '../hooks/useDirectLineSpeechConnection';
import DebugPanel from './DebugPanel';
import KeyboardShortcuts from './KeyboardShortcuts';
import VoiceSettingsPanel, { DirectLineSpeechSettings, PonyfillSettings, VOICE_OPTIONS } from './VoiceSettingsPanel';
import sounds, { setSoundEnabled, isSoundEnabled } from '../utils/sounds';
import { createSpeechMiddleware, BargeInController } from '../utils/textUtils';
import ProxyBotInfoPanels from './ProxyBotInfoPanels';

// Default Ponyfill settings for Proxy Bot (Tab 2 uses Speech Ponyfill approach)
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

// Default Direct Line Speech settings (kept for reference)
const DEFAULT_DLS_SETTINGS: DirectLineSpeechSettings = {
  bargeInEnabled: true,
  bargeInSensitivity: 'medium',
  autoResumeListening: true,
  latencyMessageEnabled: true,
  latencyMessageText: 'Just a moment...',
  silenceTimeoutMs: 3000,
  ssmlEnabled: true,
  ssmlProsodyRate: 'medium',
  ssmlProsodyPitch: 'medium',
};

// Quick reply suggestions
const QUICK_REPLIES = [
  'What can you help me with?',
  'Tell me about benefits',
  'I need housing advice',
  'How do I contact you?',
];

/**
 * Custom styles for Web Chat - Citizen Advice branding
 * Colors based on Citizens Advice Bureau brand identity
 */
const webChatStyleOptions = {
  // Colors - Citizen Advice branding
  primaryFont: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  accent: '#004b88',  // Citizen Advice dark blue
  
  // Bubble styling - Enhanced
  bubbleBackground: '#f8f9fa',
  bubbleBorderRadius: 18,
  bubbleFromUserBackground: 'linear-gradient(135deg, #004b88 0%, #003366 100%)',
  bubbleFromUserTextColor: '#ffffff',
  bubbleFromUserBorderRadius: 18,
  bubbleNubSize: 0,
  
  // Avatar - Citizen Advice
  botAvatarInitials: 'CA',  // Citizen Advice
  userAvatarInitials: 'You',
  botAvatarBackgroundColor: '#004b88',
  userAvatarBackgroundColor: '#00a878',
  
  // Hide upload button (not needed for voice demo)
  hideUploadButton: true,
  
  // Suggested actions
  suggestedActionsHeight: 40,
  suggestedActionsStackedHeight: 120,
  suggestedActionBackground: 'white',
  suggestedActionBorder: '2px solid #004b88',
  suggestedActionBorderRadius: 20,
  suggestedActionTextColor: '#004b88',
  
  // Microphone button styling
  microphoneButtonColorOnDictate: '#00a878',  // Citizen Advice green accent
  
  // New 4.18.x features for voice
  speechRecognitionContinuous: true,  // Keep mic open for natural conversation
  
  // Send box
  sendBoxBackground: '#f8f9fa',
  sendBoxBorderTop: '1px solid #e8e8e8',
  sendBoxButtonColor: '#004b88',
};

/**
 * DirectLineSpeechChat Component
 */
export const DirectLineSpeechChat: React.FC = () => {
  // Enhanced state
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [ponyfillSettings, setPonyfillSettings] = useState<PonyfillSettings>(DEFAULT_PONYFILL_SETTINGS);
  const [selectedLocale, setSelectedLocale] = useState('en-US');
  const [selectedVoice, setSelectedVoice] = useState('en-US-JennyNeural');
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [chatKey, setChatKey] = useState(0);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [innerTab, setInnerTab] = useState<'chat' | 'architecture' | 'connection' | 'resources'>('chat');
  const prevConnectionStatus = useRef<string>('idle');
  const prevSpeechActivity = useRef<string>('idle'); // Track previous speech activity for autoResumeListening
  // Create barge-in controller immediately (synchronously) so it's available for store creation
  const bargeInControllerRef = useRef<BargeInController>(new BargeInController());
  
  // Track speech activity from Web Chat events
  const [speechActivity, setSpeechActivity] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');

  const {
    adapters,
    connectionStatus,
    speechSynthesisRef,
    errorMessage,
    listeningStatus: _hookListeningStatus, // We'll use our own tracked state
    region,
    locale,
    conversationId,
    connect,
    disconnect,
    retry,
  } = useDirectLineSpeechConnection({
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
    console.log('🔌 DirectLineSpeechChat mounted, calling connect()...');
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
          setTimeout(() => {
            const micBtn = document.querySelector('.chat-container button[aria-label*="Microphone"]') as HTMLButtonElement
              || document.querySelector('.chat-container button[title*="Microphone"]') as HTMLButtonElement
              || document.querySelector('.chat-container .webchat__microphone-button button') as HTMLButtonElement
              || document.querySelector('.chat-container [class*="microphone"] button') as HTMLButtonElement;
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
        const micBtn = document.querySelector('.chat-container button[aria-label*="Microphone"]') as HTMLButtonElement
          || document.querySelector('.chat-container button[title*="Microphone"]') as HTMLButtonElement
          || document.querySelector('.chat-container .webchat__microphone-button button') as HTMLButtonElement
          || document.querySelector('.chat-container [class*="microphone"] button') as HTMLButtonElement;
        if (micBtn) {
          micBtn.click();
        }
      }, 300);
    }
    prevSpeechActivity.current = speechActivity;
  }, [speechActivity, ponyfillSettings.autoResumeListening, connectionStatus]);

  // Memoize style options - dynamic based on ponyfillSettings
  const styleOptions = useMemo(() => ({
    ...webChatStyleOptions,
    speechRecognitionContinuous: ponyfillSettings.continuousRecognition,
  }), [ponyfillSettings.continuousRecognition]);

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
  }, [connect, disconnect]);

  // Handle toggle sound
  const handleToggleSound = useCallback(() => {
    const newState = !soundEnabled;
    setSoundEnabledState(newState);
    setSoundEnabled(newState);
  }, [soundEnabled]);

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

  // Handle quick reply click
  const handleQuickReply = useCallback((text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setShowWelcome(false);
  }, []);

  // Hide welcome when user starts talking
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
        case 'fetching-token':
          return 'Getting credentials...';
        case 'connecting':
          return 'Connecting to voice services...';
        case 'connected':
          return `Connected to ${region}`;
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
        case 'fetching-token': return 'connecting';
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

        {/* Settings button */}
        <button 
          className="settings-btn"
          onClick={() => setShowSettingsPanel(true)}
          title="Voice settings"
        >
          <span className="settings-icon">⚙️</span>
          Settings
        </button>

        {locale && (
          <div style={{ fontSize: '0.8rem', color: '#605e5c' }}>
            Locale: {locale}
          </div>
        )}
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
      { id: 'token', label: 'Fetching credentials', completed: connectionStatus !== 'fetching-token' },
      { id: 'connect', label: 'Connecting to voice services', completed: connectionStatus === 'connected' },
    ];
    
    const activeStep = connectionStatus === 'fetching-token' ? 0 : 1;
    
    return (
      <div className="loading-container enhanced">
        <div className="loading-spinner enhanced" />
        <p style={{ fontWeight: 600, marginTop: '16px' }}>
          {connectionStatus === 'fetching-token' 
            ? 'Fetching credentials...'
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
      <p>{errorMessage || 'Unable to connect to voice services'}</p>
      <div className="error-details">
        <code>{errorMessage}</code>
      </div>
      <ul className="error-suggestions">
        <li>Check your internet connection</li>
        <li>Verify the proxy bot is deployed and running</li>
        <li>Ensure Direct Line Speech is configured</li>
        <li>Check the browser console for details</li>
      </ul>
      <button onClick={retry}>🔄 Try Again</button>
    </div>
  );

  /**
   * Render the Web Chat
   */
  const renderWebChat = () => {
    if (!adapters) return null;

    return (
      <ReactWebChat
        key={chatKey}
        directLine={(adapters as any).directLine}
        webSpeechPonyfillFactory={(adapters as any).webSpeechPonyfillFactory}
        store={store}
        styleOptions={styleOptions}
        locale={selectedLocale}
      />
    );
  };

  // Get voice display name
  const getVoiceDisplayName = () => {
    const localeVoices = VOICE_OPTIONS[selectedLocale as keyof typeof VOICE_OPTIONS];
    const voice = localeVoices?.find(v => v.id === selectedVoice);
    return voice?.name || selectedVoice;
  };

  return (
    <div className="chat-container">
      {/* Inner Sub-Tab Navigation */}
      <nav className="inner-tab-nav proxy-accent">
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
        <h3>🤖 Proxy Bot ({selectedLocale === 'en-US' ? 'US' : selectedLocale === 'en-GB' ? 'UK' : selectedLocale})</h3>
        <p>
          Direct Line → Proxy Bot → Copilot Studio.
          Voice: <strong>{getVoiceDisplayName()}</strong>. Click <strong>Settings</strong> to change.
        </p>
      </div>

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
            {(connectionStatus === 'fetching-token' || connectionStatus === 'connecting') && renderLoading()}
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
          speechRegion={region}
        />
      )}

      {/* Voice Settings Panel - Using ponyfill mode since Tab 2 now uses Speech Ponyfill */}
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
      </>
      ) : (
        <ProxyBotInfoPanels activeTab={innerTab} />
      )}
    </div>
  );
};

export default DirectLineSpeechChat;
