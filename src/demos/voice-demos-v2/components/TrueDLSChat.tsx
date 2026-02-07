/**
 * TrueDLSChat Component
 * =====================
 * Web Chat component using TRUE Direct Line Speech for voice integration.
 * 
 * This is the TRUE Direct Line Speech approach that provides:
 * - Single WebSocket for both audio and messaging (unified channel)
 * - Server-side speech recognition (lower latency)
 * - Native barge-in support at the channel level
 * - Direct connection to Azure Bot Service DLS channel
 * 
 * ARCHITECTURE:
 * ┌─────────────────┐    ┌─────────────────────┐    ┌─────────────────┐
 * │   Web Client    │───▶│  Direct Line Speech │───▶│   Proxy Bot     │
 * │ (DLS SDK)       │◀───│  Channel (WebSocket)│◀───│ (Azure Bot Svc) │
 * └─────────────────┘    └─────────────────────┘    └────────┬────────┘
 *                                                            │
 *                              ┌─────────────────────────────┘
 *                              ▼
 *                        ┌─────────────────┐
 *                        │  Copilot Studio │
 *                        │     Agent       │
 *                        └─────────────────┘
 * 
 * REQUIREMENTS:
 * - Azure Bot Service with DLS channel enabled
 * - DLS proxy bot deployed (see proxy-bot folder)
 * - Speech resource with custom domain linked to DLS channel
 * 
 * This differs from Speech Ponyfill:
 * - Ponyfill: Direct Line + separate Speech SDK (client-side STT)
 * - True DLS: Single WebSocket handles both (server-side STT)
 * 
 * DEMO TIPS:
 * - Show the microphone button in the Web Chat
 * - Demonstrate barge-in by speaking while the bot is responding
 * - Point out the single connection vs separate connections
 * - Compare latency with Speech Ponyfill mode
 */

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import ReactWebChat, { createStore } from 'botframework-webchat';
import { useDirectLineSpeechConnectionDLS } from '../hooks/useDirectLineSpeechConnectionDLS';
import DebugPanel from './DebugPanel';
import KeyboardShortcuts from './KeyboardShortcuts';
import CodePanel from './CodePanel';
import type { ActiveCodeSection } from './CodePanel';
import VoiceSettingsPanel from './VoiceSettingsPanel';
import type { DirectLineSpeechSettings } from './VoiceSettingsPanel';
import sounds, { setSoundEnabled } from '../utils/sounds';
import { createSpeechMiddleware, BargeInController } from '../utils/textUtils';

// Default Direct Line Speech settings (True DLS mode)
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
 * Custom styles for Web Chat - True DLS branding (purple accent to differentiate)
 */
const webChatStyleOptions = {
  // Colors - True DLS branding (purple to differentiate)
  primaryFont: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  accent: '#6B2D5B',  // Purple accent for True DLS
  
  // Bubble styling - Enhanced
  bubbleBackground: '#f8f9fa',
  bubbleBorderRadius: 18,
  bubbleFromUserBackground: 'linear-gradient(135deg, #6B2D5B 0%, #4A1F3D 100%)',
  bubbleFromUserTextColor: '#ffffff',
  bubbleFromUserBorderRadius: 18,
  bubbleNubSize: 0,
  
  // Avatar - True DLS
  botAvatarInitials: 'DLS',  // Direct Line Speech
  userAvatarInitials: 'You',
  botAvatarBackgroundColor: '#6B2D5B',
  userAvatarBackgroundColor: '#00a878',
  
  // Hide upload button (not needed for voice demo)
  hideUploadButton: true,
  
  // Suggested actions
  suggestedActionsHeight: 40,
  suggestedActionsStackedHeight: 120,
  suggestedActionBackground: 'white',
  suggestedActionBorder: '2px solid #6B2D5B',
  suggestedActionBorderRadius: 20,
  suggestedActionTextColor: '#6B2D5B',
  
  // Microphone button styling
  microphoneButtonColorOnDictate: '#00a878',  // Green accent
  
  // New 4.18.x features for voice
  speechRecognitionContinuous: true,  // Keep mic open for natural conversation
  
  // Send box
  sendBoxBackground: '#f8f9fa',
  sendBoxBorderTop: '1px solid #e8e8e8',
  sendBoxButtonColor: '#6B2D5B',
};

/**
 * TrueDLSChat Component
 * Uses the TRUE Direct Line Speech SDK for unified audio + messaging
 */
export const TrueDLSChat: React.FC = () => {
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

  // Use TRUE Direct Line Speech connection hook
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
  } = useDirectLineSpeechConnectionDLS();

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
        console.log(`🎙️ [True DLS] Speech activity changed: ${activity}`);
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
          return 'Getting DLS credentials...';
        case 'connecting':
          return 'Connecting via Direct Line Speech...';
        case 'connected':
          return `DLS Connected (${region})`;
        case 'error':
          return 'DLS Connection failed';
        case 'disconnected':
          return 'Disconnected from DLS';
        default:
          return 'Unknown';
      }
    };

    const getListeningText = () => {
      switch (speechActivity) {
        case 'listening':
          return '🎤 Listening (server-side STT)...';
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
      <div className="status-bar dls-status-bar">
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

        {/* DLS Badge */}
        <div className="dls-badge" title="True Direct Line Speech - Single WebSocket for audio + messaging">
          <span style={{ color: '#6B2D5B', fontWeight: 600 }}>⚡ True DLS</span>
        </div>

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
      <div className="welcome-message dls-welcome">
        <h4>⚡ True Direct Line Speech Mode</h4>
        <p>
          Connected via <strong>Direct Line Speech channel</strong> - a single WebSocket 
          handles both audio streaming and bot messaging.
        </p>
        <div className="dls-features">
          <span className="dls-feature">🔌 Single WebSocket</span>
          <span className="dls-feature">🎤 Server-side STT</span>
          <span className="dls-feature">⚡ Lower Latency</span>
          <span className="dls-feature">🛑 Native Barge-in</span>
        </div>
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
      { id: 'token', label: 'Fetching DLS credentials', completed: connectionStatus !== 'fetching-token' },
      { id: 'connect', label: 'Establishing Direct Line Speech WebSocket', completed: connectionStatus === 'connected' },
    ];
    
    const activeStep = connectionStatus === 'fetching-token' ? 0 : 1;
    
    return (
      <div className="loading-container enhanced dls-loading">
        <div className="loading-spinner enhanced" />
        <p style={{ fontWeight: 600, marginTop: '16px' }}>
          {connectionStatus === 'fetching-token' 
            ? 'Fetching DLS credentials...'
            : 'Connecting to Direct Line Speech channel...'}
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
        <p style={{ fontSize: '0.85rem', color: '#605e5c', marginTop: '12px' }}>
          True DLS uses the <code>botframework-directlinespeech-sdk</code>
        </p>
      </div>
    );
  };

  /**
   * Render error state with suggestions
   */
  const renderError = () => (
    <div className="error-container enhanced dls-error">
      <h3>❌ Direct Line Speech Connection Failed</h3>
      <p>{errorMessage || 'Unable to connect to Direct Line Speech channel'}</p>
      <div className="error-details">
        <code>{errorMessage}</code>
      </div>
      <ul className="error-suggestions">
        <li>Check that the DLS proxy bot is deployed and running</li>
        <li>Verify the Speech resource has a custom domain configured</li>
        <li>Ensure Direct Line Speech channel is enabled on Bot Service</li>
        <li>Check the bot's messaging endpoint is accessible</li>
        <li>Verify Azure AD auth is working (check browser console)</li>
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
        locale={locale || 'en-US'}
      />
    );
  };

  return (
    <div className="chat-container dls-container">
      {/* Warning Banner about current limitation */}
      <div className="dls-warning-banner" style={{
        background: 'linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%)',
        border: '1px solid #ffc107',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
      }}>
        <span style={{ fontSize: '1.5rem' }}>⚠️</span>
        <div>
          <strong style={{ color: '#856404' }}>Configuration Limitation</strong>
          <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#856404' }}>
            The DLS SDK connects to Speech Services, but routing to the bot requires{' '}
            <code style={{ background: '#ffe8a1', padding: '2px 4px', borderRadius: '3px' }}>
              isDefaultBotForCogSvcAccount: true
            </code>{' '}
            on the DLS channel. This setting cannot be configured via API when the Speech resource has{' '}
            <code style={{ background: '#ffe8a1', padding: '2px 4px', borderRadius: '3px' }}>
              disableLocalAuth: true
            </code>{' '}
            (enforced by enterprise policy).
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#997404' }}>
            👉 For Copilot Studio demos, use the <strong>Speech Ponyfill</strong> tab instead.
            See <a href="/docs/TROUBLESHOOTING.md" style={{ color: '#0078d4' }}>TROUBLESHOOTING.md</a> for details.
          </p>
        </div>
      </div>

      {/* Info Panel */}
      <div className="info-panel dls-info-panel">
        <h3>⚡ True Direct Line Speech</h3>
        <p>
          Using the <strong>Direct Line Speech SDK</strong> for a unified audio + messaging channel.
          Single WebSocket connection with server-side speech recognition.
        </p>
        <div className="dls-architecture-note">
          <small>
            Client → DLS WebSocket → Azure Bot Service → Proxy Bot → Copilot Studio
          </small>
        </div>
      </div>

      {/* Status Bar */}
      {renderStatusBar()}

      {/* Welcome Message */}
      {renderWelcome()}

      {/* Main Content Area - Side by Side with Code Panel */}
      <div className={`chat-with-code-container ${showCodePanel ? 'code-visible' : ''}`}>
        {/* Chat Area */}
        <div className="chat-main-area">
          <div className="webchat-wrapper dls-webchat">
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

export default TrueDLSChat;
