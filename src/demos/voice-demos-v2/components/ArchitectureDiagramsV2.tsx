/**
 * ArchitectureDiagramsV2 — High-fidelity HTML-based Architecture Diagrams
 * ========================================================================
 * Premium styled architecture diagrams for each voice integration mode.
 * 
 * Based on:
 * - Bot Framework Web Chat documentation
 * - Microsoft 365 Agents SDK (formerly Bot Framework SDK) guidance
 * - Azure Speech Services architecture patterns
 * - Copilot Studio channel architecture
 * 
 * @see https://learn.microsoft.com/en-us/azure/bot-service/bot-service-overview
 * @see https://learn.microsoft.com/en-us/microsoft-copilot-studio/
 * @see https://github.com/microsoft/BotFramework-WebChat
 */

import React from 'react';

// ─── Shared Styles ────────────────────────────────────────────────────────────

const diagramContainerStyle: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: '16px',
  padding: '32px',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
  border: '1px solid #e5e7eb',
  marginBottom: '24px',
};

const diagramTitleStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: '#6b7280',
  marginBottom: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const boxBaseStyle: React.CSSProperties = {
  borderRadius: '12px',
  padding: '16px 20px',
  textAlign: 'center',
  fontWeight: 500,
  fontSize: '0.9rem',
  position: 'relative',
  transition: 'transform 0.2s, box-shadow 0.2s',
};

const connectionLineStyle: React.CSSProperties = {
  height: '2px',
  background: 'linear-gradient(90deg, #d1d5db 0%, #9ca3af 50%, #d1d5db 100%)',
  flex: 1,
  position: 'relative',
};

const arrowStyle: React.CSSProperties = {
  width: 0,
  height: 0,
  borderTop: '6px solid transparent',
  borderBottom: '6px solid transparent',
  borderLeft: '10px solid #9ca3af',
};

const labelBadgeStyle: React.CSSProperties = {
  fontSize: '0.65rem',
  padding: '2px 8px',
  borderRadius: '4px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

// ─── Component Box Styles ─────────────────────────────────────────────────────

const webChatBoxStyle: React.CSSProperties = {
  ...boxBaseStyle,
  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
  border: '2px solid #93c5fd',
  color: '#1e40af',
};

const speechSDKBoxStyle: React.CSSProperties = {
  ...boxBaseStyle,
  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
  border: '2px solid #86efac',
  color: '#166534',
};

const copilotStudioBoxStyle: React.CSSProperties = {
  ...boxBaseStyle,
  background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
  border: '2px solid #c4b5fd',
  color: '#6b21a8',
};

const azureSpeechBoxStyle: React.CSSProperties = {
  ...boxBaseStyle,
  background: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)',
  border: '2px solid #67e8f9',
  color: '#0e7490',
};

const proxyBotBoxStyle: React.CSSProperties = {
  ...boxBaseStyle,
  background: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
  border: '2px solid #fca5a5',
  color: '#991b1b',
};

// ─── Icon Components ──────────────────────────────────────────────────────────

const BrowserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" />
    <circle cx="6" cy="6" r="1" fill="currentColor" />
    <circle cx="9" cy="6" r="1" fill="currentColor" />
  </svg>
);

const WebChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const MicrophoneIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const CloudIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
  </svg>
);

const BotIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" strokeWidth="3" strokeLinecap="round" />
    <line x1="16" y1="16" x2="16" y2="16" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const ServerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="8" rx="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" />
    <line x1="6" y1="6" x2="6" y2="6" strokeWidth="3" strokeLinecap="round" />
    <line x1="6" y1="18" x2="6" y2="18" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const WebSocketIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 12h16" />
    <path d="M4 12l4-4" />
    <path d="M4 12l4 4" />
    <path d="M20 12l-4-4" />
    <path d="M20 12l-4 4" />
  </svg>
);

// ─── Connection Arrow Component ───────────────────────────────────────────────

interface ConnectionArrowProps {
  label?: string;
  labelColor?: string;
  bidirectional?: boolean;
  vertical?: boolean;
  dashed?: boolean;
}

const ConnectionArrow: React.FC<ConnectionArrowProps> = ({ 
  label, 
  labelColor = '#6b7280',
  bidirectional = false,
  vertical = false,
  dashed = false
}) => {
  if (vertical) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0' }}>
        {bidirectional && (
          <div style={{ 
            width: 0, height: 0, 
            borderLeft: '6px solid transparent', 
            borderRight: '6px solid transparent', 
            borderBottom: '10px solid #9ca3af',
            marginBottom: '-2px'
          }} />
        )}
        <div style={{ 
          width: '2px', 
          height: '40px', 
          background: dashed ? 'repeating-linear-gradient(to bottom, #9ca3af 0px, #9ca3af 4px, transparent 4px, transparent 8px)' : '#9ca3af',
          position: 'relative'
        }}>
          {label && (
            <span style={{ 
              position: 'absolute', 
              left: '10px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              fontSize: '0.7rem',
              color: labelColor,
              whiteSpace: 'nowrap',
              fontWeight: 500
            }}>{label}</span>
          )}
        </div>
        <div style={{ 
          width: 0, height: 0, 
          borderLeft: '6px solid transparent', 
          borderRight: '6px solid transparent', 
          borderTop: '10px solid #9ca3af',
          marginTop: '-2px'
        }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', minWidth: '80px' }}>
      {bidirectional && (
        <div style={{ ...arrowStyle, transform: 'rotate(180deg)', borderLeft: 'none', borderRight: '10px solid #9ca3af' }} />
      )}
      <div style={{ 
        ...connectionLineStyle, 
        background: dashed 
          ? 'repeating-linear-gradient(90deg, #9ca3af 0px, #9ca3af 4px, transparent 4px, transparent 8px)' 
          : connectionLineStyle.background 
      }}>
        {label && (
          <span style={{ 
            position: 'absolute', 
            top: '-18px', 
            left: '50%', 
            transform: 'translateX(-50%)',
            fontSize: '0.7rem',
            color: labelColor,
            whiteSpace: 'nowrap',
            fontWeight: 500
          }}>{label}</span>
        )}
      </div>
      <div style={arrowStyle} />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Speech Ponyfill Architecture v2
// ═══════════════════════════════════════════════════════════════════════════════

export const SpeechPonyfillArchitectureV2: React.FC = () => {
  return (
    <div className="info-panel-content ponyfill-accent" style={{ background: '#fafbfc' }}>
      <div className="info-panel-header ponyfill-accent">
        <span className="info-panel-icon">🏗️</span>
        <h3>Speech Ponyfill — Architecture v2</h3>
      </div>

      {/* Main Diagram */}
      <div style={diagramContainerStyle}>
        <div style={diagramTitleStyle}>
          <span>🎨</span> Two-Channel Architecture Diagram
        </div>

        {/* Browser Container */}
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          border: '2px dashed #cbd5e1',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '-12px',
            left: '24px',
            background: '#f8fafc',
            padding: '0 12px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <BrowserIcon /> Browser (Client-Side)
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {/* Web Chat Component */}
            <div style={webChatBoxStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', justifyContent: 'center' }}>
                <WebChatIcon />
                <strong>Web Chat</strong>
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>React Component</div>
              <div style={{ 
                marginTop: '8px', 
                display: 'flex', 
                gap: '4px', 
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <span style={{ ...labelBadgeStyle, background: '#dbeafe', color: '#1e40af' }}>UI</span>
                <span style={{ ...labelBadgeStyle, background: '#dbeafe', color: '#1e40af' }}>Redux Store</span>
              </div>
            </div>

            {/* Bidirectional connection */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: '#6b7280', marginBottom: '4px' }}>ponyfill</div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '2px', background: '#9ca3af' }} />
                <div style={{ margin: '0 4px', fontSize: '1.2rem' }}>↔</div>
                <div style={{ width: '40px', height: '2px', background: '#9ca3af' }} />
              </div>
              <div style={{ fontSize: '0.65rem', color: '#6b7280', marginTop: '4px' }}>factory</div>
            </div>

            {/* Speech SDK Ponyfill */}
            <div style={speechSDKBoxStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', justifyContent: 'center' }}>
                <MicrophoneIcon />
                <strong>Speech SDK Ponyfill</strong>
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '8px' }}>Azure Cognitive Services</div>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '4px',
                fontSize: '0.7rem',
                background: 'rgba(255,255,255,0.6)',
                padding: '8px',
                borderRadius: '8px'
              }}>
                <div>• SpeechRecognizer (STT)</div>
                <div>• SpeechSynthesizer (TTS)</div>
                <div style={{ fontSize: '0.65rem', color: '#166534', marginTop: '4px' }}>
                  W3C-compatible API
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Lines */}
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#854d0e', fontWeight: 500, marginBottom: '8px' }}>
              Channel 1: Messaging
            </div>
            <ConnectionArrow vertical label="Direct Line WebSocket" labelColor="#854d0e" bidirectional />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#0e7490', fontWeight: 500, marginBottom: '8px' }}>
              Channel 2: Voice
            </div>
            <ConnectionArrow vertical label="Speech SDK WebSocket" labelColor="#0e7490" bidirectional />
          </div>
        </div>

        {/* Cloud Services */}
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          {/* Copilot Studio */}
          <div style={copilotStudioBoxStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', justifyContent: 'center' }}>
              <BotIcon />
              <strong>Copilot Studio</strong>
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Agent / Bot Logic</div>
            <div style={{ 
              marginTop: '8px', 
              display: 'flex', 
              gap: '4px', 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <span style={{ ...labelBadgeStyle, background: '#f3e8ff', color: '#6b21a8' }}>Topics</span>
              <span style={{ ...labelBadgeStyle, background: '#f3e8ff', color: '#6b21a8' }}>AI</span>
              <span style={{ ...labelBadgeStyle, background: '#f3e8ff', color: '#6b21a8' }}>Actions</span>
            </div>
          </div>

          {/* Azure Speech Service */}
          <div style={azureSpeechBoxStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', justifyContent: 'center' }}>
              <CloudIcon />
              <strong>Azure Speech Service</strong>
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Cloud STT / TTS</div>
            <div style={{ 
              marginTop: '8px', 
              display: 'flex', 
              gap: '4px', 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <span style={{ ...labelBadgeStyle, background: '#cffafe', color: '#0e7490' }}>Neural Voices</span>
              <span style={{ ...labelBadgeStyle, background: '#cffafe', color: '#0e7490' }}>Whisper</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Points Section */}
      <div style={diagramContainerStyle}>
        <div style={diagramTitleStyle}>
          <span>💡</span> Architecture Highlights
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #86efac'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#166534', fontSize: '0.95rem' }}>✅ Web Chat Speech APIs</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#15803d', lineHeight: 1.5 }}>
              Web Chat's <code style={{ background: '#dcfce7', padding: '1px 4px', borderRadius: '4px' }}>webSpeechPonyfillFactory</code> 
              prop accepts any W3C-compatible speech implementation. The Azure Speech SDK ponyfill implements 
              <code style={{ background: '#dcfce7', padding: '1px 4px', borderRadius: '4px' }}>SpeechRecognition</code> and 
              <code style={{ background: '#dcfce7', padding: '1px 4px', borderRadius: '4px' }}>SpeechSynthesis</code> interfaces.
            </p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #93c5fd'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#1e40af', fontSize: '0.95rem' }}>✅ Two Independent Channels</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#1d4ed8', lineHeight: 1.5 }}>
              Messaging and voice run on separate WebSocket connections. Direct Line handles bot activities (text, cards, suggested actions). 
              Speech SDK streams audio directly to Azure Speech Service.
            </p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #fde047'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#854d0e', fontSize: '0.95rem' }}>⚠️ Two Auth Flows</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#a16207', lineHeight: 1.5 }}>
              Requires both a Direct Line token (from Copilot Studio token endpoint) and Speech credentials 
              (API key or Azure AD token). Your backend server issues both to the client.
            </p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #c4b5fd'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#6b21a8', fontSize: '0.95rem' }}>📚 Microsoft Guidance</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#7c3aed', lineHeight: 1.5 }}>
              Per Bot Framework Web Chat docs: "The Speech SDK ponyfill is the recommended approach for adding voice 
              to Web Chat when you need fine-grained control over speech recognition settings."
            </p>
          </div>
        </div>
      </div>

      {/* Data Flow Section */}
      <div style={diagramContainerStyle}>
        <div style={diagramTitleStyle}>
          <span>🔄</span> Data Flow Summary
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {[
            { step: '1', icon: '🎤', title: 'User speaks into microphone', desc: 'Browser captures audio via MediaStream API' },
            { step: '2', icon: '📡', title: 'Speech SDK streams audio to Azure', desc: 'PCM audio sent over secure WebSocket to Azure Speech Service' },
            { step: '3', icon: '📝', title: 'Azure returns transcription', desc: 'Real-time and final recognition results streamed back to browser' },
            { step: '4', icon: '💬', title: 'Text sent via Direct Line', desc: 'Transcribed text converted to Bot Activity and sent to Copilot Studio' },
            { step: '5', icon: '🤖', title: 'Copilot Studio responds', desc: 'Bot processes message, returns response activity via Direct Line' },
            { step: '6', icon: '🔊', title: 'TTS synthesizes response', desc: 'Speech SDK converts bot text to audio, plays through speakers' },
          ].map((item) => (
            <div key={item.step} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '12px 16px',
              background: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #00a878 0%, #00875f 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.9rem',
                flexShrink: 0
              }}>{item.step}</div>
              <div style={{ fontSize: '1.2rem' }}>{item.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '0.9rem' }}>{item.title}</div>
                <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Components */}
      <div className="info-panel-section">
        <h4>Key Components</h4>
        <div className="info-panel-grid">
          <div className="info-grid-card">
            <strong>createCognitiveServicesSpeechServicesPonyfillFactory</strong>
            <p>From <code>botframework-webchat</code> — creates a W3C speech ponyfill backed by Azure Cognitive Services. Accepts region, subscription key, and voice settings.</p>
          </div>
          <div className="info-grid-card">
            <strong>Direct Line createDirectLine()</strong>
            <p>Creates a Direct Line adapter that connects to the bot via HTTPS/WebSocket. Used with the token from Copilot Studio's token endpoint.</p>
          </div>
          <div className="info-grid-card">
            <strong>Web Chat Redux Store</strong>
            <p>Custom middleware can intercept speech events (START_DICTATE, STOP_DICTATE, etc.) to track activity state and implement features like barge-in.</p>
          </div>
          <div className="info-grid-card">
            <strong>Azure Neural Voices</strong>
            <p>600+ neural text-to-speech voices across 140+ languages. Configured via <code>speechSynthesisVoiceName</code> in the ponyfill factory options.</p>
          </div>
        </div>
      </div>

      {/* Pros/Cons */}
      <div className="info-panel-section">
        <h4>When to Use Speech Ponyfill</h4>
        <ul>
          <li>✅ <strong>No server-side speech processing</strong> — all STT/TTS happens in the browser via the Speech SDK.</li>
          <li>✅ <strong>Works with any Direct Line bot</strong> — voice is layered on top of standard messaging.</li>
          <li>✅ <strong>Flexible voice settings</strong> — locale, voice, rate, pitch configurable per session.</li>
          <li>✅ <strong>Microsoft recommended</strong> — per Bot Framework Web Chat documentation.</li>
          <li>⚠️ <strong>Two separate auth flows</strong> — needs both a Direct Line token and a Speech token.</li>
          <li>⚠️ <strong>Client-side SDK overhead</strong> — Speech SDK JavaScript bundle adds ~200KB.</li>
        </ul>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Proxy Bot Architecture v2
// ═══════════════════════════════════════════════════════════════════════════════

export const ProxyBotArchitectureV2: React.FC = () => {
  return (
    <div className="info-panel-content proxy-accent" style={{ background: '#fafbfc' }}>
      <div className="info-panel-header proxy-accent">
        <span className="info-panel-icon">🏗️</span>
        <h3>Proxy Bot — Architecture v2</h3>
      </div>

      {/* Main Diagram */}
      <div style={diagramContainerStyle}>
        <div style={diagramTitleStyle}>
          <span>🎨</span> Three-Layer Middleware Architecture
        </div>

        {/* Browser Container */}
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          border: '2px dashed #cbd5e1',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '-12px',
            left: '24px',
            background: '#f8fafc',
            padding: '0 12px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <BrowserIcon /> Browser (Client-Side)
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {/* Web Chat Component */}
            <div style={webChatBoxStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', justifyContent: 'center' }}>
                <WebChatIcon />
                <strong>Web Chat</strong>
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>React Component</div>
              <div style={{ marginTop: '8px', fontSize: '0.7rem', color: '#1e40af' }}>
                Same UI as Tab 1
              </div>
            </div>

            {/* Connection */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: '#6b7280', marginBottom: '4px' }}>ponyfill</div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '2px', background: '#9ca3af' }} />
                <div style={{ margin: '0 4px', fontSize: '1.2rem' }}>↔</div>
                <div style={{ width: '40px', height: '2px', background: '#9ca3af' }} />
              </div>
            </div>

            {/* Speech SDK Ponyfill */}
            <div style={speechSDKBoxStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', justifyContent: 'center' }}>
                <MicrophoneIcon />
                <strong>Speech SDK Ponyfill</strong>
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Identical to Tab 1</div>
            </div>
          </div>
        </div>

        {/* Layer Labels and Connections */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ 
              fontSize: '0.7rem', 
              color: '#991b1b', 
              fontWeight: 600, 
              marginBottom: '8px',
              padding: '4px 12px',
              background: '#fef2f2',
              borderRadius: '12px'
            }}>
              Layer 1: Direct Line to Proxy Bot
            </div>
            <ConnectionArrow vertical label="Direct Line WebSocket" labelColor="#991b1b" bidirectional />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ 
              fontSize: '0.7rem', 
              color: '#0e7490', 
              fontWeight: 500, 
              marginBottom: '8px',
              padding: '4px 12px',
              background: '#ecfeff',
              borderRadius: '12px'
            }}>
              Voice Channel (same as Tab 1)
            </div>
            <ConnectionArrow vertical label="Speech SDK WebSocket" labelColor="#0e7490" bidirectional />
          </div>
        </div>

        {/* Middle Layer - Proxy Bot */}
        <div style={{
          background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
          border: '2px solid #fca5a5',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '-12px',
            left: '24px',
            background: '#fef2f2',
            padding: '0 12px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#991b1b',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <ServerIcon /> Layer 2: Proxy Bot (Azure Bot Service)
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={proxyBotBoxStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', justifyContent: 'center' }}>
                <BotIcon />
                <strong>Proxy Bot</strong>
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '8px' }}>Azure App Service</div>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '4px', 
                justifyContent: 'center',
                fontSize: '0.65rem'
              }}>
                <span style={{ ...labelBadgeStyle, background: '#fecaca', color: '#991b1b' }}>Logging</span>
                <span style={{ ...labelBadgeStyle, background: '#fecaca', color: '#991b1b' }}>Auth</span>
                <span style={{ ...labelBadgeStyle, background: '#fecaca', color: '#991b1b' }}>Transform</span>
              </div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.8)',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '0.75rem',
              color: '#991b1b',
              maxWidth: '200px'
            }}>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>Middleware Capabilities:</div>
              <div>• Log all conversations</div>
              <div>• Custom authentication</div>
              <div>• Message transformation</div>
              <div>• Multi-bot routing</div>
            </div>
          </div>
        </div>

        {/* Layer 2 to Layer 3 Connection */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ 
              fontSize: '0.7rem', 
              color: '#6b21a8', 
              fontWeight: 600, 
              marginBottom: '8px',
              padding: '4px 12px',
              background: '#faf5ff',
              borderRadius: '12px'
            }}>
              Layer 2 → 3: Server-to-Server
            </div>
            <ConnectionArrow vertical label="Direct Line (server-side)" labelColor="#6b21a8" bidirectional />
          </div>
        </div>

        {/* Cloud Services */}
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          {/* Copilot Studio */}
          <div style={copilotStudioBoxStyle}>
            <div style={{ 
              position: 'absolute',
              top: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '0.65rem',
              fontWeight: 600,
              color: '#6b21a8',
              background: '#faf5ff',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid #c4b5fd'
            }}>Layer 3</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', justifyContent: 'center' }}>
              <BotIcon />
              <strong>Copilot Studio</strong>
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Agent / Bot Logic</div>
            <div style={{ marginTop: '8px', fontSize: '0.7rem', color: '#6b21a8' }}>
              Doesn't know about proxy
            </div>
          </div>

          {/* Azure Speech Service */}
          <div style={azureSpeechBoxStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', justifyContent: 'center' }}>
              <CloudIcon />
              <strong>Azure Speech Service</strong>
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Cloud STT / TTS</div>
            <div style={{ marginTop: '8px', fontSize: '0.7rem', color: '#0e7490' }}>
              Same as Tab 1
            </div>
          </div>
        </div>
      </div>

      {/* Key Difference Section */}
      <div style={diagramContainerStyle}>
        <div style={diagramTitleStyle}>
          <span>⚖️</span> Tab 1 vs Tab 2 — Key Difference
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            borderRadius: '12px',
            padding: '20px',
            border: '2px solid #86efac',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-10px',
              left: '20px',
              background: '#f0fdf4',
              padding: '2px 10px',
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: '#166534'
            }}>Tab 1: Direct Connection</div>
            <div style={{ marginTop: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '12px' }}>🌐 → 🤖</div>
              <div style={{ fontWeight: 600, color: '#166534', marginBottom: '8px' }}>Browser → Copilot Studio</div>
              <div style={{ fontSize: '0.85rem', color: '#15803d' }}>
                Simplest path. No middleware.<br/>Fewer moving parts.
              </div>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            borderRadius: '12px',
            padding: '20px',
            border: '2px solid #93c5fd',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-10px',
              left: '20px',
              background: '#eff6ff',
              padding: '2px 10px',
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: '#1e40af'
            }}>Tab 2: Proxy Bot</div>
            <div style={{ marginTop: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '12px' }}>🌐 → 🔧 → 🤖</div>
              <div style={{ fontWeight: 600, color: '#1e40af', marginBottom: '8px' }}>Browser → Proxy Bot → Copilot Studio</div>
              <div style={{ fontSize: '0.85rem', color: '#1d4ed8' }}>
                Middleware layer for logging,<br/>auth, and transformation.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Proxy Bot Use Cases */}
      <div className="info-panel-section">
        <h4>When to Use a Proxy Bot</h4>
        <div className="info-panel-grid">
          <div className="info-grid-card">
            <strong>Server-Side Logging</strong>
            <p>Capture all conversations for analytics, compliance, or debugging. The proxy sees every message in both directions.</p>
          </div>
          <div className="info-grid-card">
            <strong>Custom Authentication</strong>
            <p>Add your own auth layer (JWT, OAuth, API keys) before requests reach Copilot Studio. Validate users server-side.</p>
          </div>
          <div className="info-grid-card">
            <strong>Message Transformation</strong>
            <p>Enrich, filter, or modify messages in transit. Add context, redact PII, or format responses before they reach the user.</p>
          </div>
          <div className="info-grid-card">
            <strong>Multi-Bot Routing</strong>
            <p>Route requests to different Copilot Studio agents based on context, user attributes, or conversation state.</p>
          </div>
        </div>
      </div>

      {/* Trade-offs */}
      <div className="info-panel-section">
        <h4>Trade-offs</h4>
        <ul>
          <li>✅ <strong>Full visibility</strong> — see and log all messages server-side</li>
          <li>✅ <strong>Custom auth</strong> — your auth rules, not just Copilot Studio's</li>
          <li>✅ <strong>Message transformation</strong> — modify in/out messages as needed</li>
          <li>✅ <strong>Bot-to-bot patterns</strong> — per Microsoft 365 Agents SDK guidance for skill composition</li>
          <li>⚠️ <strong>Added latency</strong> — extra hop adds ~50-100ms per message round-trip</li>
          <li>⚠️ <strong>More infrastructure</strong> — requires deployed Azure Bot Service + App Service</li>
          <li>⚠️ <strong>Two Direct Line connections</strong> — client→proxy and proxy→Copilot</li>
        </ul>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Voice Live API Architecture v2
// ═══════════════════════════════════════════════════════════════════════════════

export const VoiceLiveAPIArchitectureV2: React.FC = () => {
  return (
    <div className="info-panel-content vla-accent" style={{ background: '#fafbfc' }}>
      <div className="info-panel-header vla-accent">
        <span className="info-panel-icon">🏗️</span>
        <h3>Voice Live API — Architecture v2</h3>
      </div>

      {/* Intro */}
      <div style={{
        background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '24px',
        border: '1px solid #fdba74'
      }}>
        <p style={{ margin: 0, color: '#c2410c', fontSize: '0.9rem', lineHeight: 1.6 }}>
          <strong>Voice Live API</strong> is fundamentally different from Tab 1 and Tab 2. It eliminates the client-side 
          Speech SDK entirely — your server opens a single WebSocket to Azure that handles STT + GPT + TTS all in one 
          unified pipeline. The browser only streams raw audio.
        </p>
      </div>

      {/* Main Diagram */}
      <div style={diagramContainerStyle}>
        <div style={diagramTitleStyle}>
          <span>🎨</span> Unified Server-Side Architecture
        </div>

        {/* Browser Container */}
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          border: '2px dashed #cbd5e1',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '-12px',
            left: '24px',
            background: '#f8fafc',
            padding: '0 12px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <BrowserIcon /> Browser (Minimal Client)
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {/* Simple Web App */}
            <div style={{
              ...boxBaseStyle,
              background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
              border: '2px solid #fdba74',
              color: '#c2410c',
              minWidth: '180px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', justifyContent: 'center' }}>
                <MicrophoneIcon />
                <strong>Web Audio API</strong>
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Microphone + Speakers</div>
              <div style={{ 
                marginTop: '8px', 
                display: 'flex', 
                gap: '4px', 
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <span style={{ ...labelBadgeStyle, background: '#ffedd5', color: '#c2410c' }}>No SDK</span>
                <span style={{ ...labelBadgeStyle, background: '#ffedd5', color: '#c2410c' }}>~5KB</span>
              </div>
            </div>

            <div style={{
              background: '#f1f5f9',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '0.75rem',
              color: '#64748b',
              maxWidth: '200px'
            }}>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>No Speech SDK needed:</div>
              <div>• No botframework-webchat</div>
              <div>• No microsoft-cognitiveservices-speech-sdk</div>
              <div>• Just Web Audio API</div>
            </div>
          </div>
        </div>

        {/* Connection */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ 
              fontSize: '0.7rem', 
              color: '#c2410c', 
              fontWeight: 600, 
              marginBottom: '8px',
              padding: '4px 12px',
              background: '#fff7ed',
              borderRadius: '12px'
            }}>
              WebSocket (raw PCM audio)
            </div>
            <ConnectionArrow vertical label="Binary audio ↑↓ JSON events" labelColor="#c2410c" bidirectional />
          </div>
        </div>

        {/* Server Relay */}
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          border: '2px solid #94a3b8',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '-12px',
            left: '24px',
            background: '#f8fafc',
            padding: '0 12px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <ServerIcon /> Your Server (Relay)
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              ...boxBaseStyle,
              background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
              border: '2px solid #94a3b8',
              color: '#475569',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', justifyContent: 'center' }}>
                <WebSocketIcon />
                <strong>WebSocket Proxy</strong>
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Relays audio ↔ Azure VLA</div>
              <div style={{ marginTop: '8px', fontSize: '0.7rem' }}>
                Adds API key header
              </div>
            </div>
          </div>
        </div>

        {/* Connection to Azure */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ 
              fontSize: '0.7rem', 
              color: '#0078d4', 
              fontWeight: 600, 
              marginBottom: '8px',
              padding: '4px 12px',
              background: '#eff6ff',
              borderRadius: '12px'
            }}>
              Secure WebSocket (wss://)
            </div>
            <ConnectionArrow vertical label="api-key header" labelColor="#0078d4" bidirectional />
          </div>
        </div>

        {/* Azure Voice Live API */}
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          border: '2px solid #3b82f6',
          borderRadius: '16px',
          padding: '24px',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '-12px',
            left: '24px',
            background: '#eff6ff',
            padding: '0 12px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#1e40af',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <CloudIcon /> Azure Voice Live API
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {/* STT */}
            <div style={{
              background: 'rgba(255,255,255,0.8)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              border: '1px solid #93c5fd'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🎤</div>
              <div style={{ fontWeight: 600, color: '#1e40af', fontSize: '0.85rem' }}>STT</div>
              <div style={{ fontSize: '0.7rem', color: '#3b82f6' }}>Whisper / Azure Speech</div>
            </div>

            <div style={{ fontSize: '1.5rem', color: '#3b82f6' }}>→</div>

            {/* AI Model */}
            <div style={{
              background: 'rgba(255,255,255,0.8)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              border: '1px solid #93c5fd'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🧠</div>
              <div style={{ fontWeight: 600, color: '#1e40af', fontSize: '0.85rem' }}>AI Model</div>
              <div style={{ fontSize: '0.7rem', color: '#3b82f6' }}>GPT-4o / GPT-5 / Phi</div>
            </div>

            <div style={{ fontSize: '1.5rem', color: '#3b82f6' }}>→</div>

            {/* TTS */}
            <div style={{
              background: 'rgba(255,255,255,0.8)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              border: '1px solid #93c5fd'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🔊</div>
              <div style={{ fontWeight: 600, color: '#1e40af', fontSize: '0.85rem' }}>TTS</div>
              <div style={{ fontSize: '0.7rem', color: '#3b82f6' }}>600+ Neural Voices</div>
            </div>
          </div>

          <div style={{ 
            marginTop: '16px', 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            <span style={{ ...labelBadgeStyle, background: '#dbeafe', color: '#1e40af' }}>Barge-In</span>
            <span style={{ ...labelBadgeStyle, background: '#dbeafe', color: '#1e40af' }}>Server VAD</span>
            <span style={{ ...labelBadgeStyle, background: '#dbeafe', color: '#1e40af' }}>Echo Cancel</span>
            <span style={{ ...labelBadgeStyle, background: '#dbeafe', color: '#1e40af' }}>Tool Calling</span>
          </div>
        </div>
      </div>

      {/* Comparison Diagram */}
      <div style={diagramContainerStyle}>
        <div style={diagramTitleStyle}>
          <span>⚖️</span> Architecture Comparison
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {/* Tab 1 & 2 */}
          <div style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontWeight: 600, color: '#64748b', marginBottom: '12px', fontSize: '0.85rem' }}>
              Tab 1 & 2: Two-Channel (Client SDK)
            </div>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px',
              fontSize: '0.8rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '24px', textAlign: 'center' }}>🌐</span>
                <span>Browser (Speech SDK + Web Chat)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '12px', color: '#9ca3af' }}>
                <span>↓↓</span>
                <span style={{ fontSize: '0.7rem' }}>Two channels</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '24px', textAlign: 'center' }}>☁️</span>
                <span>Direct Line + Azure Speech (separate)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '12px', color: '#9ca3af' }}>
                <span>↓</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '24px', textAlign: 'center' }}>🤖</span>
                <span>Copilot Studio</span>
              </div>
            </div>
          </div>

          {/* Voice Live API */}
          <div style={{
            background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
            borderRadius: '12px',
            padding: '20px',
            border: '2px solid #fdba74'
          }}>
            <div style={{ fontWeight: 600, color: '#c2410c', marginBottom: '12px', fontSize: '0.85rem' }}>
              Voice Live API: Single WebSocket
            </div>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px',
              fontSize: '0.8rem',
              color: '#c2410c'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '24px', textAlign: 'center' }}>🌐</span>
                <span>Browser (Web Audio only)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '12px', color: '#ea580c' }}>
                <span>↓</span>
                <span style={{ fontSize: '0.7rem' }}>One WebSocket</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '24px', textAlign: 'center' }}>🖥️</span>
                <span>Your Server (relay)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '12px', color: '#ea580c' }}>
                <span>↓</span>
                <span style={{ fontSize: '0.7rem' }}>One WebSocket</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '24px', textAlign: 'center' }}>☁️</span>
                <span>Azure VLA (STT + AI + TTS)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="info-panel-section">
        <h4>Voice Live API Benefits</h4>
        <div className="info-panel-grid">
          <div className="info-grid-card">
            <strong>No Client SDK</strong>
            <p>No Speech SDK or Web Chat needed. The browser only needs Web Audio API to capture/play audio. Bundle size reduced from ~200KB to ~5KB.</p>
          </div>
          <div className="info-grid-card">
            <strong>Built-In AI</strong>
            <p>GPT-4o, GPT-5, or Phi models included. Tool/function calling, system prompts, and conversation memory built into the API.</p>
          </div>
          <div className="info-grid-card">
            <strong>Native Barge-In</strong>
            <p>Echo cancellation and interruption detection built into the API. No custom BargeInController needed (unlike Tab 1 & 2).</p>
          </div>
          <div className="info-grid-card">
            <strong>Server VAD</strong>
            <p>Server-side voice activity detection. Configurable sensitivity and silence duration via session.update messages.</p>
          </div>
        </div>
      </div>

      {/* When to Use */}
      <div className="info-panel-section">
        <h4>When to Use Voice Live API</h4>
        <ul>
          <li>✅ <strong>New voice-first applications</strong> — start with VLA instead of Speech SDK + Direct Line</li>
          <li>✅ <strong>Minimal client footprint</strong> — when you need a lightweight browser implementation</li>
          <li>✅ <strong>Built-in AI needed</strong> — when you want STT + AI + TTS in one unified pipeline</li>
          <li>✅ <strong>Barge-in critical</strong> — when native echo cancellation and interruption detection are required</li>
          <li>⚠️ <strong>Requires server component</strong> — you need a backend to relay WebSocket connections</li>
          <li>⚠️ <strong>Different from Copilot Studio</strong> — VLA has its own AI model; doesn't route to Copilot topics directly</li>
        </ul>
      </div>
    </div>
  );
};

export default {
  SpeechPonyfillArchitectureV2,
  ProxyBotArchitectureV2,
  VoiceLiveAPIArchitectureV2,
};
