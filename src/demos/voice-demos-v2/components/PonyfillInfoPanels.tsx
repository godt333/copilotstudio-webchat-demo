/**
 * PonyfillInfoPanels — Informational sub-tabs for Tab 1 (Speech Ponyfill)
 * ========================================================================
 * Architecture, Connection Flow, and Resources panels for the Speech Ponyfill tab.
 */

import React from 'react';
import { SpeechPonyfillArchitectureV2 } from './ArchitectureDiagramsV2';

interface Props {
  activeTab: string;
}

const PonyfillInfoPanels: React.FC<Props> = ({ activeTab }) => {
  // Architecture — High-fidelity HTML diagrams
  if (activeTab === 'architecture') {
    return <SpeechPonyfillArchitectureV2 />;
  }

  if (false) { // Old text-based architecture panel (kept for reference)
    return (
      <div className="info-panel-content ponyfill-accent">
        <div className="info-panel-header ponyfill-accent">
          <span className="info-panel-icon">🏗️</span>
          <h3>Speech Ponyfill — Architecture</h3>
        </div>

        <div className="info-panel-section">
          <h4>Two-Channel Approach</h4>
          <p>
            Tab 1 uses a <strong>two-channel architecture</strong>. Messaging and voice are handled
            by completely independent pipelines that Web Chat merges in the browser:
          </p>
          <ul>
            <li><strong>Channel 1 — Direct Line (messaging):</strong> Browser ↔ Direct Line ↔ Copilot Studio. Text messages, adaptive cards, and suggested actions travel over HTTPS/WebSocket via the Direct Line protocol.</li>
            <li><strong>Channel 2 — Speech SDK Ponyfill (voice):</strong> The Azure Speech SDK runs <em>entirely in the browser</em>. It creates a W3C-compatible <code>SpeechRecognition</code> and <code>SpeechSynthesis</code> ponyfill that Web Chat consumes just like native browser speech APIs.</li>
          </ul>
        </div>

        <div className="info-panel-diagram">
          <div className="info-panel-diagram-label">Architecture Diagram</div>
          <pre>{`┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│                                                         │
│  ┌───────────────┐         ┌──────────────────────────┐ │
│  │  Web Chat      │         │  Azure Speech SDK        │ │
│  │  (React)       │◄───────▶│  Ponyfill Factory        │ │
│  │                │         │  • SpeechRecognizer (STT) │ │
│  │  Renders chat  │         │  • SpeechSynthesizer(TTS) │ │
│  │  + mic button  │         │    (runs in-browser)      │ │
│  └──────┬────────┘         └───────────┬──────────────┘ │
│         │ Direct Line                  │ WebSocket       │
│         │ WebSocket                    │ (wss://)        │
└─────────┼──────────────────────────────┼────────────────┘
          │                              │
          ▼                              ▼
   ┌──────────────┐          ┌──────────────────┐
   │  Copilot      │          │  Azure Speech    │
   │  Studio       │          │  Service         │
   │  (Bot logic)  │          │  (STT / TTS)     │
   └──────────────┘          └──────────────────┘`}</pre>
        </div>

        <div className="info-panel-section">
          <h4>Key Components</h4>
          <div className="info-panel-grid">
            <div className="info-grid-card">
              <strong>useDirectLinePonyfillConnection</strong>
              <p>Custom hook that fetches both a Direct Line token and Speech credentials, creates the ponyfill factory, and manages connection lifecycle.</p>
            </div>
            <div className="info-grid-card">
              <strong>createCognitiveServicesSpeechServicesPonyfillFactory</strong>
              <p>From <code>botframework-webchat</code> — creates a W3C speech ponyfill backed by Azure Cognitive Services.</p>
            </div>
            <div className="info-grid-card">
              <strong>BargeInController</strong>
              <p>Custom utility monitoring mic volume via Web Audio API. When the user speaks during TTS playback, it calls <code>speechSynthesis.cancel()</code> to interrupt the bot.</p>
            </div>
            <div className="info-grid-card">
              <strong>Web Chat Store + Speech Middleware</strong>
              <p>Custom Redux middleware intercepts Web Chat speech events to track activity state (idle → listening → processing → speaking).</p>
            </div>
          </div>
        </div>

        <div className="info-panel-section">
          <h4>Why Speech Ponyfill?</h4>
          <ul>
            <li>✅ <strong>No server-side speech processing</strong> — all STT/TTS happens in the browser via the Speech SDK.</li>
            <li>✅ <strong>Works with any Direct Line bot</strong> — voice is layered on top of standard messaging.</li>
            <li>✅ <strong>Flexible voice settings</strong> — locale, voice, rate, pitch configurable per session.</li>
            <li>⚠️ <strong>Two separate auth flows</strong> — needs both a Direct Line token and a Speech token.</li>
            <li>⚠️ <strong>Client-side SDK overhead</strong> — Speech SDK JavaScript bundle adds ~200KB.</li>
          </ul>
        </div>
      </div>
    );
  }

  if (activeTab === 'connection') {
    return (
      <div className="info-panel-content ponyfill-accent">
        <div className="info-panel-header ponyfill-accent">
          <span className="info-panel-icon">🔌</span>
          <h3>Speech Ponyfill — Connection Flow</h3>
        </div>

        <div className="info-panel-flow">
          {[
            {
              step: 1,
              title: 'Fetch Speech Credentials',
              detail: 'Client calls GET /api/speechservices/ponyfillKey → Server returns { region, token } using the Speech resource API key to generate a short-lived token.',
              code: `// Server endpoint (speechRoutes.ts)\nGET /api/speechservices/ponyfillKey\n→ { region: "eastus", token: "eyJhbG...", locale: "en-US" }`,
            },
            {
              step: 2,
              title: 'Fetch Direct Line Token via Copilot Token Endpoint',
              detail: 'Client calls GET /api/directline/token → Server calls the Copilot Studio Token Endpoint URL (configured in Copilot Studio settings) → returns { token, conversationId }. No Direct Line secret needed!',
              code: `// Server calls Copilot Studio Token Endpoint\n// (URL from Copilot Studio → Channels → Mobile App)\nPOST https://{region}.api.powerva.microsoft.com/...\n→ { token: "eyJ0...", conversationId: "abc123" }`,
            },
            {
              step: 3,
              title: 'Create Speech Ponyfill Factory',
              detail: 'Using the speech credentials, the Speech SDK creates a ponyfill factory with SpeechRecognizer (STT) and SpeechSynthesizer (TTS). This implements W3C Web Speech API interfaces.',
              code: `const ponyfill = createSpeechServicesPonyfill({\n  credentials: {\n    authorizationToken: speechToken,\n    region: 'eastus'\n  },\n  speechSynthesisVoiceName: 'en-US-JennyNeural'\n});`,
            },
            {
              step: 4,
              title: 'Initialize Web Chat with createDirectLine',
              detail: "Web Chat uses createDirectLine({ token }) to connect to Copilot Studio. The ponyfill factory is passed to enable voice. No secret is exposed to the client.",
              code: `const directLine = createDirectLine({ token });\n\n<ReactWebChat\n  directLine={directLine}\n  webSpeechPonyfillFactory={ponyfillFactory}\n  store={storeWithSpeechMiddleware}\n/>`,
            },
            {
              step: 5,
              title: 'User Speaks → Bot Responds',
              detail: 'Ponyfill captures mic audio → Speech SDK streams to Azure STT → recognized text → Direct Line posts activity → Copilot Studio responds → Direct Line receives response → Web Chat renders → Speech SDK TTS synthesizes → audio plays.',
            },
          ].map(step => (
            <div key={step.step} className="info-flow-step">
              <div className="info-flow-number">{step.step}</div>
              <div className="info-flow-content">
                <strong>{step.title}</strong>
                <p>{step.detail}</p>
                {step.code && (
                  <pre className="info-flow-code"><code>{step.code}</code></pre>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* High-Fidelity Sequence Diagram */}
        <div className="info-panel-section">
          <h4>Sequence Diagram</h4>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            borderRadius: '12px',
            padding: '24px',
            overflowX: 'auto',
          }}>
            {/* Sequence Diagram Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '180px 140px 140px 180px',
              gap: '20px',
              marginBottom: '20px',
              textAlign: 'center',
            }}>
              {[
                { icon: '🌐', label: 'Browser', color: '#60a5fa' },
                { icon: '🖥️', label: 'Your Server', color: '#a78bfa' },
                { icon: '🎤', label: 'Azure Speech', color: '#34d399' },
                { icon: '🤖', label: 'Copilot Studio', color: '#f472b6' },
              ].map((col, i) => (
                <div key={i} style={{
                  background: `linear-gradient(135deg, ${col.color}22 0%, ${col.color}11 100%)`,
                  border: `2px solid ${col.color}`,
                  borderRadius: '8px',
                  padding: '12px 8px',
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{col.icon}</div>
                  <div style={{ color: col.color, fontWeight: 600, fontSize: '0.85rem' }}>{col.label}</div>
                </div>
              ))}
            </div>

            {/* Lifelines */}
            <div style={{ position: 'relative', minHeight: '600px' }}>
              {/* Vertical lifelines */}
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{
                  position: 'absolute',
                  left: `calc(${i * 160 + 90}px + ${i * 20}px)`,
                  top: 0,
                  bottom: 0,
                  width: '2px',
                  background: 'repeating-linear-gradient(to bottom, #4b5563 0px, #4b5563 8px, transparent 8px, transparent 16px)',
                }} />
              ))}

              {/* Messages */}
              {[
                { y: 0, from: 0, to: 1, label: 'GET /api/speechservices/ponyfillKey', color: '#a78bfa' },
                { y: 40, from: 1, to: 0, label: '{ region, token, locale }', color: '#a78bfa', dashed: true },
                { y: 90, from: 0, to: 1, label: 'GET /api/directline/token', color: '#f472b6' },
                { y: 130, from: 1, to: 3, label: 'POST Token Endpoint', color: '#f472b6' },
                { y: 170, from: 3, to: 1, label: '{ token, conversationId }', color: '#f472b6', dashed: true },
                { y: 210, from: 1, to: 0, label: '{ token, conversationId }', color: '#f472b6', dashed: true },
                { y: 260, from: 0, to: 2, label: 'createPonyfill() → WebSocket', color: '#34d399' },
                { y: 300, from: 0, to: 3, label: 'createDirectLine({ token }) → WebSocket', color: '#60a5fa' },
                { y: 350, from: 0, to: 0, label: '🎤 User speaks', color: '#fbbf24', isNote: true },
                { y: 390, from: 0, to: 2, label: 'PCM audio frames (streaming)', color: '#34d399' },
                { y: 430, from: 2, to: 0, label: 'Recognized text', color: '#34d399', dashed: true },
                { y: 470, from: 0, to: 3, label: 'POST activity (user message)', color: '#60a5fa' },
                { y: 510, from: 3, to: 0, label: 'Bot response activity', color: '#60a5fa', dashed: true },
                { y: 550, from: 0, to: 2, label: 'Synthesize (TTS)', color: '#34d399' },
                { y: 590, from: 2, to: 0, label: 'Audio stream', color: '#34d399', dashed: true },
                { y: 630, from: 0, to: 0, label: '🔊 Plays audio', color: '#fbbf24', isNote: true },
              ].map((msg, i) => {
                const leftPos = Math.min(msg.from, msg.to) * 160 + 90 + Math.min(msg.from, msg.to) * 20;
                const width = Math.abs(msg.to - msg.from) * 180;
                const isLeftToRight = msg.to > msg.from;
                
                if (msg.isNote) {
                  return (
                    <div key={i} style={{
                      position: 'absolute',
                      top: `${msg.y}px`,
                      left: `${msg.from * 160 + 20 + msg.from * 20}px`,
                      background: `${msg.color}22`,
                      border: `1px solid ${msg.color}`,
                      borderRadius: '6px',
                      padding: '6px 12px',
                      color: msg.color,
                      fontSize: '0.8rem',
                      fontWeight: 500,
                    }}>
                      {msg.label}
                    </div>
                  );
                }

                return (
                  <div key={i} style={{ position: 'absolute', top: `${msg.y}px`, left: `${leftPos}px`, width: `${width || 140}px` }}>
                    {/* Arrow line */}
                    <div style={{
                      height: '2px',
                      background: msg.dashed 
                        ? `repeating-linear-gradient(to right, ${msg.color} 0px, ${msg.color} 6px, transparent 6px, transparent 12px)`
                        : msg.color,
                      position: 'relative',
                    }}>
                      {/* Arrow head */}
                      <div style={{
                        position: 'absolute',
                        [isLeftToRight ? 'right' : 'left']: '-1px',
                        top: '-4px',
                        width: 0,
                        height: 0,
                        borderTop: '5px solid transparent',
                        borderBottom: '5px solid transparent',
                        [isLeftToRight ? 'borderLeft' : 'borderRight']: `8px solid ${msg.color}`,
                      }} />
                    </div>
                    {/* Label */}
                    <div style={{
                      color: '#e5e7eb',
                      fontSize: '0.7rem',
                      marginTop: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {msg.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="info-panel-section" style={{ marginTop: '24px' }}>
          <h4>Key Points</h4>
          <div className="info-panel-grid">
            <div className="info-grid-card">
              <strong>🔐 Copilot Token Endpoint</strong>
              <p>No Direct Line secret needed! The Token Endpoint URL (from Copilot Studio → Channels → Mobile App) issues tokens directly.</p>
            </div>
            <div className="info-grid-card">
              <strong>🎤 Client-Side Speech</strong>
              <p>Speech SDK runs entirely in the browser. Audio never touches your server — it streams directly to Azure Speech Service.</p>
            </div>
            <div className="info-grid-card">
              <strong>📡 Two WebSocket Channels</strong>
              <p>Direct Line WebSocket for messaging, Speech SDK WebSocket for audio. Both run in parallel in the browser.</p>
            </div>
            <div className="info-grid-card">
              <strong>🔄 Token Refresh</strong>
              <p>Both tokens are short-lived (~15-60 min). The server should handle refresh, or reconnect on expiry.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Resources tab
  return (
    <div className="info-panel-content ponyfill-accent">
      <div className="info-panel-header ponyfill-accent">
        <span className="info-panel-icon">📚</span>
        <h3>Speech Ponyfill — Resources</h3>
      </div>

      <div className="info-panel-resources">
        {[
          {
            category: 'Web Chat & Speech Ponyfill',
            links: [
              { title: 'Web Chat Speech Ponyfill Docs', url: 'https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/SPEECH', desc: 'Official guide for adding speech to Web Chat via ponyfill' },
              { title: 'Cognitive Services Speech SDK', url: 'https://learn.microsoft.com/azure/ai-services/speech-service/speech-sdk', desc: 'Azure Speech SDK overview — STT, TTS, translation' },
              { title: 'Web Chat Samples (Speech)', url: 'https://github.com/microsoft/BotFramework-WebChat/tree/main/samples', desc: 'Official samples including speech integration patterns' },
            ],
          },
          {
            category: 'Copilot Studio & Direct Line',
            links: [
              { title: 'Copilot Studio Web Channel', url: 'https://learn.microsoft.com/microsoft-copilot-studio/configure-web-channel', desc: 'Configure your Copilot Studio agent for web channels' },
              { title: 'Direct Line API 3.0', url: 'https://learn.microsoft.com/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-concepts', desc: 'Direct Line protocol reference for messaging' },
            ],
          },
          {
            category: 'Azure Speech Service',
            links: [
              { title: 'Speech to Text', url: 'https://learn.microsoft.com/azure/ai-services/speech-service/speech-to-text', desc: 'Real-time speech recognition with Azure' },
              { title: 'Text to Speech', url: 'https://learn.microsoft.com/azure/ai-services/speech-service/text-to-speech', desc: 'Neural voices for TTS — 600+ voices across 140+ languages' },
              { title: 'Speech Studio', url: 'https://speech.microsoft.com/', desc: 'Test voices, train custom models, and manage speech resources' },
            ],
          },
        ].map((category, idx) => (
          <div key={idx} className="info-resource-category">
            <h4>{category.category}</h4>
            <div className="info-resource-links">
              {category.links.map((link, linkIdx) => (
                <a key={linkIdx} className="info-resource-card" href={link.url} target="_blank" rel="noopener noreferrer">
                  <div className="info-resource-title">{link.title} <span className="info-external-icon">↗</span></div>
                  <div className="info-resource-desc">{link.desc}</div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="info-panel-section">
        <h4>📂 Key Files in This Demo</h4>
        <div className="info-file-list">
          <div className="info-file-item">
            <code>hooks/useDirectLinePonyfillConnection.ts</code>
            <span>Custom hook — fetches tokens, creates ponyfill, manages connection</span>
          </div>
          <div className="info-file-item">
            <code>components/SpeechPonyfillChat.tsx</code>
            <span>This component — UI, speech middleware, barge-in, settings</span>
          </div>
          <div className="info-file-item">
            <code>utils/textUtils.ts</code>
            <span>Speech middleware factory + BargeInController class</span>
          </div>
          <div className="info-file-item">
            <code>server/routes/speechRoutes.ts</code>
            <span>Server endpoint that issues Speech credentials to the client</span>
          </div>
          <div className="info-file-item">
            <code>server/routes/directLineRoutes.ts</code>
            <span>Server endpoint that fetches Direct Line token from Copilot Studio</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PonyfillInfoPanels;
