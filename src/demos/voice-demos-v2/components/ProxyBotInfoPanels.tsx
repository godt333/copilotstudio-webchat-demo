/**
 * ProxyBotInfoPanels — Informational sub-tabs for Tab 2 (Proxy Bot)
 * ==================================================================
 * Architecture, Connection Flow, and Resources panels for the Proxy Bot tab.
 */

import React from 'react';
import { ProxyBotArchitectureV2 } from './ArchitectureDiagramsV2';

interface Props {
  activeTab: string;
}

const ProxyBotInfoPanels: React.FC<Props> = ({ activeTab }) => {
  // Architecture — High-fidelity HTML diagrams
  if (activeTab === 'architecture') {
    return <ProxyBotArchitectureV2 />;
  }

  if (false) { // Old text-based architecture panel (kept for reference)
    return (
      <div className="info-panel-content proxy-accent">
        <div className="info-panel-header proxy-accent">
          <span className="info-panel-icon">🏗️</span>
          <h3>Proxy Bot — Architecture</h3>
        </div>

        <div className="info-panel-section">
          <h4>Three-Layer Architecture</h4>
          <p>
            Tab 2 adds a <strong>Proxy Bot middleware</strong> between the browser and Copilot Studio.
            Messages travel through an Azure Bot Service app that can log, transform, and enrich
            conversations before forwarding to Copilot Studio.
          </p>
          <ul>
            <li><strong>Layer 1 — Browser + Speech Ponyfill:</strong> Same as Tab 1 — Web Chat + Azure Speech SDK ponyfill handles voice in the browser. The speech pipeline is identical.</li>
            <li><strong>Layer 2 — Proxy Bot (Azure Bot Service):</strong> An Express.js bot deployed to Azure App Service. Receives messages via Direct Line, forwards them to Copilot Studio's Direct Line endpoint, and relays responses back.</li>
            <li><strong>Layer 3 — Copilot Studio:</strong> The AI agent that processes user messages and generates responses. The proxy bot is transparent — Copilot Studio doesn't know it's not talking directly to the user.</li>
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
│  └──────┬────────┘         └───────────┬──────────────┘ │
│         │ Direct Line                  │ WebSocket       │
└─────────┼──────────────────────────────┼────────────────┘
          │                              │
          ▼                              ▼
   ┌──────────────────┐      ┌──────────────────┐
   │  Proxy Bot        │      │  Azure Speech    │
   │  (Azure Bot Svc)  │      │  Service         │
   │                   │      │  (STT / TTS)     │
   │  • Logging        │      └──────────────────┘
   │  • Auth           │
   │  • Transformation │
   └────────┬─────────┘
            │ Direct Line
            ▼
   ┌──────────────────┐
   │  Copilot Studio   │
   │  (Bot logic)      │
   └──────────────────┘`}</pre>
        </div>

        <div className="info-panel-section">
          <h4>Key Components</h4>
          <div className="info-panel-grid">
            <div className="info-grid-card">
              <strong>useDirectLineSpeechConnection</strong>
              <p>Custom hook that fetches the Proxy Bot's Direct Line token and Speech credentials, creates adapters, and manages connection lifecycle.</p>
            </div>
            <div className="info-grid-card">
              <strong>Proxy Bot (thr505-dls-proxy-bot)</strong>
              <p>Azure Bot Service app (Node.js/Express) deployed to App Service. Receives user messages via Direct Line and forwards to Copilot Studio.</p>
            </div>
            <div className="info-grid-card">
              <strong>copilotClient.ts</strong>
              <p>Server-side module in the proxy bot that manages the Direct Line connection to Copilot Studio, including token refresh and message relay.</p>
            </div>
            <div className="info-grid-card">
              <strong>Speech Ponyfill (same as Tab 1)</strong>
              <p>Voice processing is identical to Tab 1. The Speech SDK ponyfill runs in the browser — the proxy bot only handles text messages.</p>
            </div>
          </div>
        </div>

        <div className="info-panel-section">
          <h4>Why a Proxy Bot?</h4>
          <ul>
            <li>✅ <strong>Server-side logging</strong> — capture all conversations for analytics and debugging.</li>
            <li>✅ <strong>Custom authentication</strong> — add your own auth layer before reaching Copilot Studio.</li>
            <li>✅ <strong>Message transformation</strong> — enrich, filter, or modify messages in transit.</li>
            <li>✅ <strong>Multi-bot routing</strong> — route to different Copilot agents based on context.</li>
            <li>⚠️ <strong>Added latency</strong> — extra hop adds ~50-100ms per message round-trip.</li>
            <li>⚠️ <strong>More infrastructure</strong> — requires a deployed Azure Bot Service + App Service.</li>
          </ul>
        </div>

        <div className="info-panel-section">
          <h4>Tab 1 vs Tab 2 — Key Difference</h4>
          <div className="info-panel-grid">
            <div className="info-grid-card" style={{ borderLeft: '3px solid #00a878' }}>
              <strong>Tab 1: Direct Connection</strong>
              <p>Browser → Direct Line → Copilot Studio<br/>Simplest path. No middleware. Fewer moving parts.</p>
            </div>
            <div className="info-grid-card" style={{ borderLeft: '3px solid #004b88' }}>
              <strong>Tab 2: Proxy Bot</strong>
              <p>Browser → Direct Line → Proxy Bot → Copilot Studio<br/>Middleware layer for logging, auth, and transformation.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'connection') {
    return (
      <div className="info-panel-content proxy-accent">
        <div className="info-panel-header proxy-accent">
          <span className="info-panel-icon">🔌</span>
          <h3>Proxy Bot — Connection Flow</h3>
        </div>

        <div className="info-panel-flow">
          {[
            {
              step: 1,
              title: 'Fetch Proxy Bot Direct Line Token',
              detail: 'Client calls GET /api/directline/proxyBotToken → Server uses the Proxy Bot\'s Direct Line secret to generate a token → returns { token, conversationId }.',
              code: `// Server endpoint (directLineRoutes.ts)\nGET /api/directline/proxyBotToken\n→ Server calls: POST https://directline.botframework.com/\n    v3/directline/tokens/generate\n    Authorization: Bearer {PROXY_BOT_DIRECT_LINE_SECRET}\n→ { token: "eyJ0...", conversationId: "xyz789" }`,
            },
            {
              step: 2,
              title: 'Fetch Speech Credentials',
              detail: 'Client calls GET /api/speechservices/ponyfillKey → Server returns { region, key }. Same endpoint as Tab 1 — voice is independent of the bot.',
              code: `// Same as Tab 1\nGET /api/speechservices/ponyfillKey\n→ { region: "eastus", key: "CBJl4p..." }`,
            },
            {
              step: 3,
              title: 'Create Speech Ponyfill + Connect Web Chat',
              detail: 'Identical to Tab 1. Speech SDK creates ponyfill factory. Web Chat connects to Direct Line, but this time the token routes to the Proxy Bot instead of Copilot Studio directly.',
              code: `// Direct Line token points to Proxy Bot\nconst directLine = createDirectLine({ token });\n// Same ponyfill as Tab 1\nconst ponyfill = createPonyfillFactory({\n  credentials: { region, subscriptionKey },\n});`,
            },
            {
              step: 4,
              title: 'User Message → Proxy Bot → Copilot Studio',
              detail: 'When the user sends a message (typed or via speech), it goes through Direct Line to the Proxy Bot. The bot logs it, optionally transforms it, then forwards to Copilot Studio via a second Direct Line connection.',
              code: `// Inside Proxy Bot (bot.ts)\nasync onMessage(context) {\n  // Log the incoming message\n  console.log('User:', context.activity.text);\n  // Forward to Copilot Studio\n  const response = await copilotClient\n    .sendMessage(context.activity.text);\n  // Send response back to user\n  await context.sendActivity(response);\n}`,
            },
            {
              step: 5,
              title: 'Response → Web Chat → Speech TTS',
              detail: 'Copilot Studio response flows back through the Proxy Bot → Direct Line → Web Chat. The ponyfill\'s SpeechSynthesizer converts the text to audio (same as Tab 1).',
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
            <pre>{`Browser               Server (:3001)       Proxy Bot         Copilot Studio    Azure Speech
  │                        │                   │                   │                  │
  │─ GET /proxyBotToken ──▶│                   │                   │                  │
  │                        │── DL/generate ───▶│                   │                  │
  │◀─ { token, convId } ──│◀─ token ─────────│                   │                  │
  │                        │                   │                   │                  │
  │─ GET /ponyfillKey ────▶│                   │                   │                  │
  │◀─ { region, key } ────│                   │                   │                  │
  │                        │                   │                   │                  │
  │── createPonyfill() ──────────────────────────────────────────────────── WS ──────▶│
  │── DL.connect ─────────────────────────────▶│                   │                  │
  │                        │                   │                   │                  │
  │🎤 User speaks          │                   │                   │                  │
  │── audio → STT ──────────────────────────────────────────────────────────────────▶│
  │◀─ recognized text ────────────────────────────────────────────────────────────────│
  │── send activity ──────────────────────────▶│                   │                  │
  │                        │                   │── forward msg ───▶│                  │
  │                        │                   │◀─ bot response ──│                  │
  │◀─ response activity ──────────────────────│                   │                  │
  │── synthesize ──────────────────────────────────────────────────────── TTS ───────▶│
  │◀─ audio stream ────────────────────────────────────────────────────────────────────│
  │🔊 Plays audio          │                   │                   │                  │`}</pre>
          </div>
        </div>
      </div>
    );
  }

  // Resources tab
  return (
    <div className="info-panel-content proxy-accent">
      <div className="info-panel-header proxy-accent">
        <span className="info-panel-icon">📚</span>
        <h3>Proxy Bot — Resources</h3>
      </div>

      <div className="info-panel-resources">
        {[
          {
            category: 'Bot Framework & Proxy Bot',
            links: [
              { title: 'Bot Framework SDK (Node.js)', url: 'https://learn.microsoft.com/azure/bot-service/javascript/bot-builder-javascript-quickstart', desc: 'Getting started with Bot Framework SDK for Node.js' },
              { title: 'Azure Bot Service', url: 'https://learn.microsoft.com/azure/bot-service/bot-service-overview', desc: 'Overview of Azure Bot Service — deploy and manage bots' },
              { title: 'Deploy Bot to Azure', url: 'https://learn.microsoft.com/azure/bot-service/provision-and-publish-a-bot', desc: 'Provision and publish a bot to Azure App Service' },
            ],
          },
          {
            category: 'Copilot Studio Integration',
            links: [
              { title: 'Copilot Studio Direct Line', url: 'https://learn.microsoft.com/microsoft-copilot-studio/configure-web-channel', desc: 'Configure web channel for Copilot Studio agents' },
              { title: 'Direct Line API 3.0', url: 'https://learn.microsoft.com/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-concepts', desc: 'Direct Line protocol — used for both proxy bot and Copilot connections' },
              { title: 'Bot-to-Bot Communication', url: 'https://learn.microsoft.com/azure/bot-service/bot-builder-skills-overview', desc: 'Skills and bot-to-bot patterns in Bot Framework' },
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
            <code>hooks/useDirectLineSpeechConnection.ts</code>
            <span>Custom hook — fetches proxy bot DL token + speech credentials</span>
          </div>
          <div className="info-file-item">
            <code>components/DirectLineSpeechChat.tsx</code>
            <span>This component — UI, speech middleware, barge-in, settings</span>
          </div>
          <div className="info-file-item">
            <code>proxy-bot/src/bot.ts</code>
            <span>Proxy bot message handler — receives and forwards messages</span>
          </div>
          <div className="info-file-item">
            <code>proxy-bot/src/copilotClient.ts</code>
            <span>Direct Line client connecting proxy bot to Copilot Studio</span>
          </div>
          <div className="info-file-item">
            <code>server/routes/directLineRoutes.ts</code>
            <span>Server endpoint for proxy bot Direct Line token generation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProxyBotInfoPanels;
