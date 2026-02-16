/**
 * PonyfillInfoPanels — Informational sub-tabs for Tab 1 (Speech Ponyfill)
 * ========================================================================
 * Architecture, Connection Flow, and Resources panels for the Speech Ponyfill tab.
 */

import React from 'react';

interface Props {
  activeTab: string;
}

const PonyfillInfoPanels: React.FC<Props> = ({ activeTab }) => {
  if (activeTab === 'architecture') {
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
              detail: 'Client calls GET /api/speechservices/ponyfillKey → Server returns { region, key } using the Speech resource API key.',
              code: `// Server endpoint (speechRoutes.ts)\nGET /api/speechservices/ponyfillKey\n→ { region: "eastus", key: "CBJl4p..." }`,
            },
            {
              step: 2,
              title: 'Fetch Direct Line Token',
              detail: 'Client calls GET /api/directline/token → Server calls the Copilot Studio token endpoint → returns { token, conversationId }.',
              code: `// Server endpoint (directLineRoutes.ts)\nGET /api/directline/token\n→ { token: "eyJ0...", conversationId: "abc123" }`,
            },
            {
              step: 3,
              title: 'Create Speech Ponyfill Factory',
              detail: 'Using the speech credentials, the Speech SDK creates a ponyfill factory with SpeechRecognizer (STT) and SpeechSynthesizer (TTS).',
              code: `const ponyfill = createCognitiveServicesSpeech\n  ServicesPonyfillFactory({\n    credentials: { region, subscriptionKey },\n    speechRecognitionLanguage: 'en-US',\n    speechSynthesisVoiceName: 'en-US-JennyNeural',\n  });`,
            },
            {
              step: 4,
              title: 'Initialize Web Chat',
              detail: "Web Chat connects to Direct Line and binds the ponyfill factory. The mic button activates the ponyfill's SpeechRecognizer.",
              code: `<ReactWebChat\n  directLine={directLine}\n  webSpeechPonyfillFactory={ponyfillFactory}\n  store={storeWithSpeechMiddleware}\n/>`,
            },
            {
              step: 5,
              title: 'User Speaks → Bot Responds',
              detail: 'Ponyfill captures mic audio → Speech SDK STT → text → Direct Line → Copilot Studio → response → Direct Line → Web Chat renders → Speech SDK TTS → audio output.',
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

        <div className="info-panel-section">
          <h4>Sequence Diagram</h4>
          <div className="info-panel-diagram">
            <pre>{`Browser               Server (:3001)       Azure Speech      Copilot Studio
  │                        │                    │                   │
  │── GET /ponyfillKey ───▶│                    │                   │
  │◀── { region, key } ───│                    │                   │
  │                        │                    │                   │
  │── GET /dl/token ──────▶│                    │                   │
  │                        │─── token request ─────────────────────▶│
  │◀── { token, convId } ─│◀── token ─────────────────────────────│
  │                        │                    │                   │
  │── createPonyfill() ───────── WebSocket ────▶│                   │
  │                        │                    │                   │
  │── directLine.connect ─────────────────────────────────────────▶│
  │                        │                    │                   │
  │🎤 User speaks          │                    │                   │
  │──── audio frames ─────────────────────────▶│                   │
  │◀─── recognized text ──────────────────────│                   │
  │──── send activity ────────────────────────────────────────────▶│
  │◀─── bot response ─────────────────────────────────────────────│
  │──── synthesize ────────────────────────────▶│                   │
  │◀─── audio stream ─────────────────────────│                   │
  │🔊 Plays audio          │                    │                   │`}</pre>
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
