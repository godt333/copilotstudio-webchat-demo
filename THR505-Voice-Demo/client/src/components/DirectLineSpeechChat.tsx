/**
 * DirectLineSpeechChat Component (Proxy Bot Mode)
 * ================================================
 * Web Chat component using Proxy Bot for voice integration.
 * 
 * This demonstrates the BOT MIDDLEWARE architecture:
 * - Client connects to Proxy Bot via Direct Line
 * - Proxy Bot forwards messages to Copilot Studio
 * - Azure Speech Services for voice (STT/TTS)
 * 
 * Architecture: Client → Proxy Bot → Copilot Studio
 * 
 * Benefits of Proxy Bot:
 * - Custom middleware and logging
 * - Authentication/authorization layer
 * - Message transformation
 * - Analytics and telemetry
 * 
 * DEMO TIPS:
 * - Show the microphone button in the Web Chat
 * - Explain the proxy bot middleware concept
 * - Compare with direct Copilot Studio connection (Ponyfill tab)
 */

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import ReactWebChat, { createStore } from 'botframework-webchat';
import { useDirectLineSpeechConnection } from '../hooks/useDirectLineSpeechConnection';
import DebugPanel from './DebugPanel';
import KeyboardShortcuts from './KeyboardShortcuts';
import CodePanel, { ActiveCodeSection } from './CodePanel';
import VoiceSettingsPanel, { DirectLineSpeechSettings } from './VoiceSettingsPanel';
import sounds, { setSoundEnabled, isSoundEnabled } from '../utils/sounds';
import { createSpeechMiddleware, BargeInController } from '../utils/textUtils';

// Default Direct Line Speech settings
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
  const [showCodePanel, setShowCodePanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [dlsSettings, setDlsSettings] = useState<DirectLineSpeechSettings>(DEFAULT_DLS_SETTINGS);
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [chatKey, setChatKey] = useState(0);
  const prevConnectionStatus = useRef<string>('idle');
  const bargeInControllerRef = useRef<BargeInController | null>(null);
  
  // Track speech activity from Web Chat events
  const [speechActivity, setSpeechActivity] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');

  const {
    adapters,
    connectionStatus,
    errorMessage,
    listeningStatus: _hookListeningStatus, // We'll use our own tracked state
    region,
    locale,
    conversationId,
    connect,
    retry,
  } = useDirectLineSpeechConnection();

  // Connect on mount
  useEffect(() => {
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

  // Memoize style options to prevent unnecessary re-renders
  const styleOptions = useMemo(() => webChatStyleOptions, []);

  // Initialize barge-in controller
  useEffect(() => {
    const controller = new BargeInController();
    controller.initialize().then(() => {
      controller.setConfig(dlsSettings.bargeInEnabled, dlsSettings.bargeInSensitivity);
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
        dlsSettings.bargeInEnabled,
        dlsSettings.bargeInSensitivity
      );
    }
  }, [dlsSettings.bargeInEnabled, dlsSettings.bargeInSensitivity]);

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
    if (connectionStatus === 'fetching-token') return 'fetching-tokens';
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
    setSpeechActivity('idle'); // Reset speech activity for CodePanel
    setChatKey(prev => prev + 1);
    setShowWelcome(true);
    setTimeout(() => connect(), 100);
  }, [connect]);

  // Handle toggle sound
  const handleToggleSound = useCallback(() => {
    const newState = !soundEnabled;
    setSoundEnabledState(newState);
    setSoundEnabled(newState);
  }, [soundEnabled]);

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

        {/* Toggle code panel button */}
        <button 
          className={`toggle-code-btn ${showCodePanel ? 'active' : ''}`}
          onClick={() => setShowCodePanel(prev => !prev)}
          title="Toggle code view (Ctrl+K)"
        >
          <span className="code-icon">{'</>'}</span>
          {showCodePanel ? 'Hide Code' : 'Show Code'}
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
        locale={locale || 'en-GB'}
      />
    );
  };

  return (
    <div className="chat-container">
      {/* Info Panel */}
      <div className="info-panel">
        <h3>🎤 Direct Line (British English)</h3>
        <p>
          Using Direct Line Speech for unified messaging + voice.
          This mode uses <strong>British English</strong> with the Sonia voice.
        </p>
      </div>

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
            {(connectionStatus === 'fetching-token' || connectionStatus === 'connecting') && renderLoading()}
            {connectionStatus === 'connected' && renderWebChat()}
          </div>
        </div>

        {/* Code Panel */}
        <CodePanel
          mode="directlinespeech"
          activeSection={activeCodeSection}
          isVisible={showCodePanel}
          onClose={() => setShowCodePanel(false)}
          conversationId={conversationId}
          region={region}
          locale={locale}
        />
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

      {/* Voice Settings Panel */}
      <VoiceSettingsPanel
        mode="directlinespeech"
        isVisible={showSettingsPanel}
        onClose={() => setShowSettingsPanel(false)}
        dlsSettings={dlsSettings}
        onDlsSettingsChange={setDlsSettings}
      />

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts
        onClearChat={handleClearChat}
        onToggleDebug={() => setShowDebugPanel(prev => !prev)}
        onToggleSound={handleToggleSound}
      />
    </div>
  );
};

export default DirectLineSpeechChat;
