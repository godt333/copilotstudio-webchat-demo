/**
 * THR505 Demo Application
 * =======================
 * Main application component for the Voice Web Client demo.
 * 
 * This application demonstrates two approaches to voice-enabling
 * a Copilot Studio agent in a web chat experience:
 * 
 * 1. Direct Line Speech Mode
 *    - Unified channel for text + speech
 *    - Single credential for bot messaging and speech
 *    - Best for new voice-first implementations
 * 
 * 2. Speech Ponyfill Mode
 *    - Standard Direct Line for messaging
 *    - Separate Speech Services ponyfill for voice
 *    - Best for adding voice to existing bots
 * 
 * Both modes connect to the SAME Copilot Studio agent, demonstrating
 * that the agent's voice configuration works across channels.
 * 
 * SESSION: THR505 - Integrating and branding Copilot Studio with web chat
 * 
 * KEYBOARD SHORTCUTS:
 * - Ctrl+L: Clear chat
 * - Ctrl+D: Toggle debug panel
 * - Ctrl+S: Toggle sound effects
 * - ?: Show shortcuts help
 */

import React, { useState, useEffect } from 'react';
import DirectLineSpeechChat from './components/DirectLineSpeechChat';
import SpeechPonyfillChat from './components/SpeechPonyfillChat';
import TelephonyIVR from './components/TelephonyIVR';
import TrueDLSChat from './components/TrueDLSChat';
import VoiceLiveAPI from './components/VoiceLiveAPI';

/**
 * Voice integration mode
 */
type VoiceMode = 'directlinespeech' | 'ponyfill' | 'truedls' | 'voicelive' | 'ivr' | 'comparison';

/**
 * Mode configuration with descriptions
 */
const MODE_CONFIG = {
  ponyfill: {
    icon: '🔊',
    label: 'Speech Ponyfill',
    description: 'Direct Line → Copilot Studio + Azure Speech Services. Client-side STT.',
    badge: 'Direct',
  },
  directlinespeech: {
    icon: '🤖',
    label: 'Proxy Bot',
    description: 'Direct Line → Proxy Bot → Copilot Studio. Demonstrates bot middleware architecture.',
    badge: 'Middleware',
  },
  truedls: {
    icon: '⚡',
    label: 'Direct Line Speech',
    description: 'Direct Line Speech channel — unified WebSocket for both conversation and speech. Blocked in this tenant by Azure policy (see docs).',
    badge: 'DLS',
  },
  voicelive: {
    icon: '🎙️',
    label: 'Voice Live API',
    description: 'Azure Voice Live API — server-to-server WebSocket with built-in STT, TTS, and generative AI.',
    badge: 'New',
  },
  ivr: {
    icon: '📞',
    label: 'Telephony / IVR',
    description: 'Azure Communication Services + Dynamics 365 Contact Center for phone-based IVR and live agent handoff.',
    badge: 'Enterprise',
  },
  comparison: {
    icon: '⚖️',
    label: 'Side-by-Side',
    description: 'Compare Proxy Bot and Speech Ponyfill modes side by side.',
    badge: 'Demo',
  },
};

/**
 * Main App Component
 */
const App: React.FC = () => {
  // State for current voice mode - Speech Ponyfill works with Copilot Studio via Direct Line
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('ponyfill');
  const [showDemoNotes, setShowDemoNotes] = useState<boolean>(false);

  /**
   * Handle mode change
   * This switches between the voice integration approaches
   */
  const handleModeChange = (mode: VoiceMode) => {
    console.log(`🔄 Switching to ${mode} mode`);
    setVoiceMode(mode);
  };

  return (
    <div className="app-container">
      {/* Header with Microsoft Branding */}
      <header className="app-header">
        <div className="header-brand">
          <svg width="24" height="24" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '12px' }}>
            <path d="M0 0h11v11H0z" fill="#f25022"/>
            <path d="M12 0h11v11H12z" fill="#7fba00"/>
            <path d="M0 12h11v11H0z" fill="#00a4ef"/>
            <path d="M12 12h11v11H12z" fill="#ffb900"/>
          </svg>
          <div>
            <h1>🎤 Copilot Studio Voice Web Client</h1>
            <p className="header-subtitle">
              THR505: Integrating and Branding Copilot Studio with Web Chat
            </p>
          </div>
        </div>
        <button 
          className="demo-notes-toggle"
          onClick={() => setShowDemoNotes(!showDemoNotes)}
          title="Toggle demo talking points"
        >
          {showDemoNotes ? '📖 Hide Notes' : '📋 Demo Notes'}
        </button>
      </header>

      {/* Demo Notes Panel */}
      {showDemoNotes && (
        <div className="demo-notes">
          <h3>🎯 Demo Talking Points</h3>
          <div className="demo-notes-grid">
            <div className="demo-note-card">
              <h4>1️⃣ Architecture Overview</h4>
              <ul>
                <li>Copilot Studio agent → Direct Line channel</li>
                <li>Azure Speech Services for voice synthesis</li>
                <li>Bot Framework Web Chat (customizable UI)</li>
                <li>Express.js backend for token management</li>
              </ul>
            </div>
            <div className="demo-note-card">
              <h4>2️⃣ Voice Integration Options</h4>
              <ul>
                <li><strong>Speech Ponyfill:</strong> Works with Copilot Studio</li>
                <li><strong>Direct Line Speech:</strong> For Bot Framework bots</li>
                <li><strong>Telephony/IVR:</strong> Azure Communication Services</li>
              </ul>
            </div>
            <div className="demo-note-card">
              <h4>3️⃣ Branding Customization</h4>
              <ul>
                <li>CSS custom properties for theming</li>
                <li>Custom avatar styling</li>
                <li>Brand colors and typography</li>
                <li>Responsive layout design</li>
              </ul>
            </div>
            <div className="demo-note-card">
              <h4>4️⃣ Enterprise Considerations</h4>
              <ul>
                <li>Token-based authentication (no secrets in client)</li>
                <li>Azure AD integration for Speech Services</li>
                <li>CORS and security configuration</li>
                <li>Contact Center integration for IVR</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Mode Selector */}
      <nav className="mode-selector">
        {(Object.keys(MODE_CONFIG) as VoiceMode[]).map((mode) => {
          const config = MODE_CONFIG[mode];
          return (
            <button
              key={mode}
              className={`mode-button ${voiceMode === mode ? 'active' : ''}`}
              onClick={() => handleModeChange(mode)}
              aria-pressed={voiceMode === mode}
            >
              <span className="mode-icon">{config.icon}</span>
              <span className="mode-label">{config.label}</span>
              <span className="mode-badge">{config.badge}</span>
            </button>
          );
        })}
      </nav>

      {/* Mode Description */}
      <div className="mode-description">
        <p>{MODE_CONFIG[voiceMode].description}</p>
      </div>

      {/* Chat Component */}
      <main className="chat-main">
        {voiceMode === 'comparison' ? (
          // Side-by-side comparison mode
          <div className="comparison-mode">
            <div>
              <div className="comparison-label">🤖 Proxy Bot (en-US)</div>
              <DirectLineSpeechChat key="dls-compare" />
            </div>
            <div>
              <div className="comparison-label">🔊 Speech Ponyfill (en-US)</div>
              <SpeechPonyfillChat key="ponyfill-compare" />
            </div>
          </div>
        ) : voiceMode === 'truedls' ? (
          <TrueDLSChat key="truedls" />
        ) : voiceMode === 'voicelive' ? (
          <VoiceLiveAPI key="voicelive" />
        ) : voiceMode === 'directlinespeech' ? (
          <DirectLineSpeechChat key="dls" />
        ) : voiceMode === 'ponyfill' ? (
          <SpeechPonyfillChat key="ponyfill" />
        ) : (
          <TelephonyIVR />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>
            <span className="footer-icon">🤖</span>
            Connecting to <strong>Copilot Studio</strong> agent via Direct Line channel.
            Voice enabled with <strong>Azure Speech Services</strong>.
          </p>
          <div className="footer-badges">
            <span className="tech-badge">React</span>
            <span className="tech-badge">TypeScript</span>
            <span className="tech-badge">Bot Framework</span>
            <span className="tech-badge">Azure Speech</span>
          </div>
        </div>
        <p className="footer-credit">
          Microsoft TechReady 26 | THR505 Demo | © 2025 | Press <kbd style={{
            background: '#333',
            color: '#ffd700',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.8rem',
            fontFamily: 'Consolas, monospace'
          }}>?</kbd> for keyboard shortcuts
        </p>
      </footer>
    </div>
  );
};

export default App;
