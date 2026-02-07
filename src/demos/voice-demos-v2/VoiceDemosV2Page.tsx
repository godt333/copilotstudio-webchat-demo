/**
 * Voice Demos V2 Page
 * ===================
 * This is a wrapper around the original THR505 demo code.
 * Only the DemoHeader is added for consistent site navigation.
 * All original functionality is preserved exactly as-is.
 * 
 * Original: THR505 - Integrating and Branding Copilot Studio with Web Chat
 */

import React, { useState } from 'react';
import DemoHeader from '../../components/layout/DemoHeader';
import DirectLineSpeechChat from './components/DirectLineSpeechChat';
import SpeechPonyfillChat from './components/SpeechPonyfillChat';
import TelephonyIVR from './components/TelephonyIVR';
import TrueDLSChat from './components/TrueDLSChat';
import './index.css';

/**
 * Voice integration mode - matches original THR505 modes
 */
type VoiceMode = 'directlinespeech' | 'ponyfill' | 'truedls' | 'ivr' | 'comparison';

/**
 * Mode configuration with descriptions - from original THR505
 */
const MODE_CONFIG = {
  ponyfill: {
    icon: '🔊',
    label: 'Speech Ponyfill',
    description: 'Direct Line → Copilot Studio + Azure Speech Services. Client-side STT.',
    badge: 'Recommended',
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
    description: 'TRUE Direct Line Speech SDK - Single WebSocket for audio + messaging with server-side STT.',
    badge: 'Bot Framework',
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
 * VoiceDemosV2Page Component
 * Wraps original THR505 demo with site navigation
 */
const VoiceDemosV2Page: React.FC = () => {
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('ponyfill');
  const [showDemoNotes, setShowDemoNotes] = useState<boolean>(false);

  const handleModeChange = (mode: VoiceMode) => {
    console.log(`🔄 Switching to ${mode} mode`);
    setVoiceMode(mode);
  };

  return (
    <div className="voice-demos-v2-wrapper">
      {/* Site Navigation Header */}
      <DemoHeader title="Voice Demos V2" />
      
      {/* Original THR505 App Content */}
      <div className="app-container">
        {/* Header with Branding */}
        <header className="app-header">
          <div className="header-brand">
            <svg width="24" height="24" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '12px' }}>
              <path d="M0 0h11v11H0z" fill="#f25022"/>
              <path d="M12 0h11v11H12z" fill="#7fba00"/>
              <path d="M0 12h11v11H0z" fill="#00a4ef"/>
              <path d="M12 12h11v11H12z" fill="#ffb900"/>
            </svg>
            <div>
              <h1>🎤 Voice Demos V2</h1>
              <p className="header-subtitle">
                Advanced Voice Integration for Copilot Studio WebChat
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              className="demo-notes-toggle"
              onClick={() => setShowDemoNotes(!showDemoNotes)}
              title="Toggle demo talking points"
            >
              {showDemoNotes ? '📖 Hide Notes' : '📋 Demo Notes'}
            </button>
            <a href="/voice-demos" className="demo-notes-toggle" style={{ textDecoration: 'none' }}>
              ← Voice Demos V1
            </a>
          </div>
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
                  <li><strong>Proxy Bot:</strong> For middleware architecture</li>
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

        {/* Mode Selector - All 5 original modes */}
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

        {/* Chat Component - Original logic */}
        <main className="chat-main">
          {voiceMode === 'comparison' ? (
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
            Voice Demos V2 | Based on THR505 Demo | © 2025-2026
          </p>
        </footer>
      </div>
    </div>
  );
};

export default VoiceDemosV2Page;
