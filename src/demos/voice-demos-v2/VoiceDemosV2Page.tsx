/**
 * Voice Demos V2 Page
 * ===================
 * This is a wrapper around the original THR505 demo code.
 * Only the DemoHeader is added for consistent site navigation.
 * All original functionality is preserved exactly as-is.
 * 
 * Original: THR505 - Integrating and Branding Copilot Studio with Web Chat
 */

import React, { useState, Suspense } from 'react';
import DemoHeader from '../../components/layout/DemoHeader';
import DirectLineSpeechChat from './components/DirectLineSpeechChat';
import SpeechPonyfillChat from './components/SpeechPonyfillChat';
import TelephonyIVR from './components/TelephonyIVR';
import VoiceLiveAPI from './components/VoiceLiveAPI';
import VoiceComparison from './components/VoiceComparison';
import './index.css';

// Lazy-load TrueDLSChat — the DLS SDK + Speech SDK is heavy (~5 MB) and can
// crash Chrome's renderer (STATUS_BREAKPOINT) if loaded eagerly alongside the
// other voice tabs.  Lazy-loading isolates the crash so only the DLS tab is
// affected and the rest of the page continues working.
const TrueDLSChat = React.lazy(() => import('./components/TrueDLSChat'));

/**
 * Minimal error boundary that catches crashes inside the DLS tab.
 */
class DLSErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(err: Error) {
    return { hasError: true, error: err?.message ?? 'Unknown error' };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, textAlign: 'center' }}>
          <h3>Direct Line Speech unavailable</h3>
          <p style={{ color: '#a4262c' }}>{this.state.error}</p>
          <p style={{ fontSize: '0.85rem', color: '#605e5c' }}>
            The DLS channel may be blocked by Azure policy in this tenant.
            Check the browser console for details.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ marginTop: 12, padding: '8px 20px', borderRadius: 6, border: '1px solid #ccc', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Voice integration mode - matches original THR505 modes
 */
type VoiceMode = 'directlinespeech' | 'ponyfill' | 'truedls' | 'voicelive' | 'ivr' | 'comparison';

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
    description: 'Direct Line Speech channel — unified WebSocket for both conversation and speech. Blocked in this tenant by Azure policy (see docs).',
    badge: 'DLS',
  },
  voicelive: {
    icon: '🎙️',
    label: 'Voice Live API',
    description: 'The next-gen replacement for DLS — server-to-server WebSocket with built-in STT, TTS, and generative AI.',
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
    label: 'Compare Options',
    description: 'Decision flow and feature comparison for all voice integration options.',
    badge: 'Guide',
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
            <VoiceComparison />
          ) : voiceMode === 'voicelive' ? (
            <VoiceLiveAPI key="voicelive" />
          ) : voiceMode === 'truedls' ? (
            <DLSErrorBoundary>
              <Suspense fallback={
                <div style={{ padding: 32, textAlign: 'center' }}>
                  <div className="loading-spinner" />
                  <p>Loading Direct Line Speech module...</p>
                </div>
              }>
                <TrueDLSChat key="truedls" />
              </Suspense>
            </DLSErrorBoundary>
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
