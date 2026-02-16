/**
 * TrueDLSChat Component (Tab 3: Direct Line Speech)
 * ===================================================
 * Updated: Feb 11, 2026
 *
 * Live Web Chat component using TRUE Direct Line Speech (DLS).
 * Single WebSocket handles BOTH audio streaming and bot messaging.
 *
 * Architecture: Browser → DLS WebSocket → Azure Speech Service → Bot Service → Proxy Bot → Copilot Studio
 *
 * Key difference from Tabs 1 & 2:
 * - Speech is SERVER-SIDE (STT + TTS handled by Azure, not browser)
 * - Single WebSocket for audio + messages (lower latency)
 * - Native barge-in at the channel level
 * - Fewer client-side voice settings (no ponyfill voice/rate/pitch controls)
 *
 * Settings in this component:
 * - DLS settings (bargeIn, autoResumeListening, latencyMessage) are Copilot Studio config
 * - No client-side speech rate/pitch/voice controls (server handles TTS)
 *
 * Uses useDirectLineSpeechConnectionDLS hook for connection management.
 *
 * @see docs/DIRECT_LINE_SPEECH_PROXY.md
 * @see hooks/useDirectLineSpeechConnectionDLS.ts
 */

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import ReactWebChat, { createStore } from 'botframework-webchat';
import { useDirectLineSpeechConnectionDLS } from '../hooks/useDirectLineSpeechConnectionDLS';
import DebugPanel from './DebugPanel';
import KeyboardShortcuts from './KeyboardShortcuts';
import VoiceSettingsPanel, { DirectLineSpeechSettings } from './VoiceSettingsPanel';
import sounds, { setSoundEnabled, isSoundEnabled } from '../utils/sounds';
import DLSInfoPanels from './DLSInfoPanels';

// Default DLS settings (these map to Copilot Studio / channel-level configuration)
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
 * Custom styles for Web Chat — DLS purple accent
 */
const webChatStyleOptions = {
  // Colors — DLS purple accent
  primaryFont: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  accent: '#6B2D5B',  // DLS purple

  // Bubble styling
  bubbleBackground: '#f8f9fa',
  bubbleBorderRadius: 18,
  bubbleFromUserBackground: 'linear-gradient(135deg, #6B2D5B 0%, #4a1e3f 100%)',
  bubbleFromUserTextColor: '#ffffff',
  bubbleFromUserBorderRadius: 18,
  bubbleNubSize: 0,

  // Avatar
  botAvatarInitials: 'CA',
  userAvatarInitials: 'You',
  botAvatarBackgroundColor: '#6B2D5B',
  userAvatarBackgroundColor: '#004b88',

  // Hide upload button
  hideUploadButton: true,

  // Suggested actions
  suggestedActionsHeight: 40,
  suggestedActionsStackedHeight: 120,
  suggestedActionBackground: 'white',
  suggestedActionBorder: '2px solid #6B2D5B',
  suggestedActionBorderRadius: 20,
  suggestedActionTextColor: '#6B2D5B',

  // Microphone button styling
  microphoneButtonColorOnDictate: '#6B2D5B',

  // Send box
  sendBoxBackground: '#f8f9fa',
  sendBoxBorderTop: '1px solid #e8e8e8',
  sendBoxButtonColor: '#6B2D5B',
};

/**
 * TrueDLSChat Component — Live DLS chat
 */
export const TrueDLSChat: React.FC = () => {
  // State
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [dlsSettings, setDlsSettings] = useState<DirectLineSpeechSettings>(DEFAULT_DLS_SETTINGS);
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [chatKey, setChatKey] = useState(0);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [innerTab, setInnerTab] = useState<'chat' | 'architecture' | 'connection' | 'resources'>('chat');
  const prevConnectionStatus = useRef<string>('idle');

  // Track speech activity from Web Chat events
  const [speechActivity, setSpeechActivity] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');

  // DLS connection hook
  const {
    adapters,
    connectionStatus,
    errorMessage,
    listeningStatus: _hookListeningStatus,
    region,
    locale,
    conversationId,
    connect,
    disconnect,
    retry,
  } = useDirectLineSpeechConnectionDLS();

  // Store connect in ref to avoid stale closure
  const connectRef = useRef(connect);
  connectRef.current = connect;

  // Connect on mount — only once
  useEffect(() => {
    console.log('🔌 TrueDLSChat mounted, calling connect()...');
    connectRef.current();
  }, []);

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

  // Create Web Chat store with speech activity tracking
  // Re-create store when chatKey changes (on clear) to reset all state
  const store = useMemo(() => createStore(
    {},
    () => (next: any) => (action: any) => {
      // Track speech activity from Web Chat actions
      if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
        const activity = action.payload?.activity;
        if (activity?.type === 'message' && activity?.from?.role === 'bot') {
          setSpeechActivity('speaking');
          // Reset to idle after a delay (TTS is server-side, we estimate)
          setTimeout(() => setSpeechActivity('idle'), 3000);
        }
      }
      if (action.type === 'WEB_CHAT/SET_DICTATE_STATE') {
        const state = action.payload?.dictateState;
        if (state === 1 || state === 2) {
          setSpeechActivity('listening');
          setShowWelcome(false);
        } else if (state === 3) {
          setSpeechActivity('processing');
        } else {
          // Only go idle if we were listening/processing (not speaking)
          if (speechActivity === 'listening' || speechActivity === 'processing') {
            setSpeechActivity('idle');
          }
        }
      }
      return next(action);
    }
  ), [chatKey]);

  // Handle clear chat
  const handleClearChat = useCallback(() => {
    sounds.clear();
    disconnect();
    setSpeechActivity('idle');
    setChatKey(prev => prev + 1);
    setShowWelcome(true);
    setTimeout(() => connectRef.current(), 100);
  }, [disconnect]);

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

  // Handle DLS settings change
  const handleDlsSettingsChange = useCallback((newSettings: DirectLineSpeechSettings) => {
    setDlsSettings(newSettings);
    setShowSettingsPanel(false);
    setSettingsMessage('⚙️ DLS settings updated (channel-level settings are configured in Copilot Studio)');
    setTimeout(() => setSettingsMessage(null), 3000);
  }, []);

  // Hide welcome when user starts talking
  useEffect(() => {
    if (speechActivity === 'listening' || speechActivity === 'processing') {
      setShowWelcome(false);
    }
  }, [speechActivity]);

  /**
   * Render status bar
   */
  const renderStatusBar = () => {
    const getStatusText = () => {
      switch (connectionStatus) {
        case 'idle': return 'Ready to connect';
        case 'fetching-token': return 'Getting credentials...';
        case 'connecting': return 'Connecting to DLS channel...';
        case 'connected': return `Connected to ${region || 'DLS'}`;
        case 'error': return 'Connection failed';
        case 'disconnected': return 'Disconnected';
        default: return 'Unknown';
      }
    };

    const getListeningText = () => {
      switch (speechActivity) {
        case 'listening': return '🎤 Listening...';
        case 'processing': return '⏳ Processing...';
        case 'speaking': return '🔊 Speaking...';
        default: return 'Ready';
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
        <p style={{ fontSize: '0.8rem', color: '#605e5c', marginTop: '4px' }}>
          🎙️ Direct Line Speech — audio is processed server-side for lower latency.
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
   * Render loading state
   */
  const renderLoading = () => {
    const steps = [
      { id: 'token', label: 'Fetching Speech credentials', completed: connectionStatus !== 'fetching-token' && connectionStatus !== 'idle' },
      { id: 'connect', label: 'Opening DLS WebSocket', completed: connectionStatus === 'connected' },
    ];

    const activeStep = connectionStatus === 'fetching-token' ? 0 : 1;

    return (
      <div className="loading-container enhanced">
        <div className="loading-spinner enhanced" />
        <p style={{ fontWeight: 600, marginTop: '16px' }}>
          {connectionStatus === 'fetching-token'
            ? 'Fetching Speech credentials...'
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
      </div>
    );
  };

  /**
   * Render error state
   */
  const renderError = () => (
    <div className="error-container enhanced">
      <h3>❌ Connection Failed</h3>
      <p>{errorMessage || 'Unable to connect to Direct Line Speech channel'}</p>
      <div className="error-details">
        <code>{errorMessage}</code>
      </div>
      <ul className="error-suggestions">
        <li>Check your internet connection</li>
        <li>Verify the backend server is running (port 3001)</li>
        <li>Ensure the DLS channel is enabled on the Bot Service</li>
        <li>Check that the Speech resource has local auth enabled</li>
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
        directLine={adapters.directLine}
        webSpeechPonyfillFactory={adapters.webSpeechPonyfillFactory}
        store={store}
        styleOptions={webChatStyleOptions}
        locale={locale || 'en-US'}
      />
    );
  };

  return (
    <div className="chat-container dls-container">
      {/* Inner Sub-Tab Navigation */}
      <nav className="inner-tab-nav dls-accent">
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
      <div className="info-panel dls-info-panel">
        <h3>🎙️ Direct Line Speech ({region || 'DLS'})</h3>
        <p>
          Single WebSocket — audio + messaging combined. Speech is processed <strong>server-side</strong> for lower latency.
          Click <strong>Settings</strong> to view DLS configuration options.
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
            {(connectionStatus === 'idle' || connectionStatus === 'fetching-token') && renderLoading()}
            {/* DLS WebSocket is LAZY — it only connects when Web Chat subscribes to activity$.
                So we MUST mount ReactWebChat during 'connecting' state, not wait for 'connected'.
                Show a connecting overlay on top of Web Chat while the WebSocket handshake completes. */}
            {(connectionStatus === 'connecting' || connectionStatus === 'connected') && adapters && (
              <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {renderWebChat()}
                {connectionStatus === 'connecting' && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(255,255,255,0.85)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    zIndex: 10, borderRadius: '8px',
                  }}>
                    <div className="loading-spinner enhanced" />
                    <p style={{ fontWeight: 600, marginTop: '16px', color: '#6B2D5B' }}>
                      Opening DLS WebSocket...
                    </p>
                  </div>
                )}
              </div>
            )}
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

      {/* Voice Settings Panel — DLS mode */}
      <VoiceSettingsPanel
        mode="directlinespeech"
        isVisible={showSettingsPanel}
        onClose={() => setShowSettingsPanel(false)}
        dlsSettings={dlsSettings}
        onDlsSettingsChange={handleDlsSettingsChange}
      />

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts
        onClearChat={handleClearChat}
        onToggleDebug={() => setShowDebugPanel(prev => !prev)}
        onToggleSound={handleToggleSound}
      />
      </>
      ) : (
        <DLSInfoPanels activeTab={innerTab} />
      )}
    </div>
  );
};

export default TrueDLSChat;
