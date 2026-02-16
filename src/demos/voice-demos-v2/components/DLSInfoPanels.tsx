/**
 * DLSInfoPanels — Informational sub-tabs for Tab 3 (Direct Line Speech)
 * ======================================================================
 * Architecture, Connection Flow, and Resources panels for the True DLS tab.
 */

import React from 'react';

interface Props {
  activeTab: string;
}

const DLSInfoPanels: React.FC<Props> = ({ activeTab }) => {
  if (activeTab === 'architecture') {
    return (
      <div className="info-panel-content dls-accent">
        <div className="info-panel-header dls-accent">
          <span className="info-panel-icon">🏗️</span>
          <h3>Direct Line Speech — Architecture</h3>
        </div>

        <div className="info-panel-section">
          <h4>Single WebSocket Architecture</h4>
          <p>
            Direct Line Speech (DLS) uses a <strong>single unified WebSocket</strong> that carries
            both audio streams and bot messages. This is fundamentally different from Tabs 1 & 2,
            where speech and messaging use separate connections.
          </p>
          <ul>
            <li><strong>Audio + Messaging combined:</strong> One WebSocket to <code>wss://{'<region>'}.convai.speech.microsoft.com</code> handles STT, TTS, and bot message exchange.</li>
            <li><strong>Server-side speech:</strong> Speech recognition (STT) happens on Azure's servers, not in the browser. Lower latency, no client-side Speech SDK overhead.</li>
            <li><strong>Native barge-in:</strong> The DLS channel supports barge-in at the platform level — no client-side BargeInController needed.</li>
            <li><strong>Simpler client code:</strong> <code>createDirectLineSpeechAdapters</code> returns both <code>directLine</code> and <code>webSpeechPonyfillFactory</code> from a single call.</li>
          </ul>
        </div>

        <div className="info-panel-diagram">
          <div className="info-panel-diagram-label">Architecture Diagram</div>
          <pre>{`┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│                                                         │
│  ┌───────────────┐         ┌──────────────────────────┐ │
│  │  Web Chat      │         │  DLS Ponyfill Factory    │ │
│  │  (React)       │◄───────▶│  (from DLS adapters)     │ │
│  │                │         │  • Mic capture → WS      │ │
│  │  Renders chat  │         │  • WS audio → speakers   │ │
│  └──────┬────────┘         └───────────┬──────────────┘ │
│         │                              │                │
│         └──────────┬───────────────────┘                │
│                    │ Single WebSocket                   │
└────────────────────┼────────────────────────────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Azure Speech Service │
          │  DLS Channel          │
          │  wss://{region}       │
          │  .convai.speech       │
          │  .microsoft.com       │
          │                       │
          │  • STT (server-side)  │
          │  • TTS (server-side)  │
          │  • Message routing    │
          └──────────┬───────────┘
                     │ Bot Connector
                     ▼
          ┌──────────────────────┐
          │  Proxy Bot            │
          │  (Azure Bot Service)  │
          └──────────┬───────────┘
                     │ Direct Line
                     ▼
          ┌──────────────────────┐
          │  Copilot Studio       │
          │  (Bot logic)          │
          └──────────────────────┘`}</pre>
        </div>

        <div className="info-panel-section">
          <h4>Key Components</h4>
          <div className="info-panel-grid">
            <div className="info-grid-card">
              <strong>createDirectLineSpeechAdapters</strong>
              <p>Web Chat bundle API that creates a DialogServiceConnector, establishes the DLS WebSocket, and returns {'{ directLine, webSpeechPonyfillFactory }'}.</p>
            </div>
            <div className="info-grid-card">
              <strong>useDirectLineSpeechConnectionDLS</strong>
              <p>Custom hook that fetches Speech credentials, creates DLS adapters, subscribes to connectionStatus$, and manages lifecycle.</p>
            </div>
            <div className="info-grid-card">
              <strong>DLS Channel (Bot Service)</strong>
              <p>The Direct Line Speech channel configured on the bot with isDefaultBotForCogSvcAccount=true links the Speech resource to the bot.</p>
            </div>
            <div className="info-grid-card">
              <strong>Speech Resource</strong>
              <p>Azure Cognitive Services Speech resource with local auth enabled. Provides subscriptionKey for DLS WebSocket authentication.</p>
            </div>
          </div>
        </div>

        <div className="info-panel-section">
          <h4>DLS vs Tabs 1 & 2</h4>
          <div className="info-panel-grid">
            <div className="info-grid-card" style={{ borderLeft: '3px solid #00a878' }}>
              <strong>Tab 1: Speech Ponyfill</strong>
              <p>Separate connections: Direct Line REST for messages, Speech SDK WebSocket for audio. Client-side STT/TTS.</p>
            </div>
            <div className="info-grid-card" style={{ borderLeft: '3px solid #004b88' }}>
              <strong>Tab 2: Proxy Bot</strong>
              <p>Same as Tab 1 but messages routed via Proxy Bot middleware. Client-side speech.</p>
            </div>
            <div className="info-grid-card" style={{ borderLeft: '3px solid #6B2D5B' }}>
              <strong>Tab 3: Direct Line Speech</strong>
              <p>Single WebSocket for everything. Server-side STT/TTS. Lower latency, simpler client.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'connection') {
    return (
      <div className="info-panel-content dls-accent">
        <div className="info-panel-header dls-accent">
          <span className="info-panel-icon">🔌</span>
          <h3>Direct Line Speech — Connection Flow</h3>
        </div>

        <div className="info-panel-flow">
          {[
            {
              step: 1,
              title: 'Fetch Speech Credentials',
              detail: 'Client calls GET /api/speechservices/token → Server returns { speechKey, region, locale }. The DLS SDK needs the Speech subscription key to authenticate.',
              code: `GET /api/speechservices/token\n→ { speechKey: "CBJl4p...", region: "eastus",\n    locale: "en-US" }`,
            },
            {
              step: 2,
              title: 'Create DLS Adapters',
              detail: 'Client calls createDirectLineSpeechAdapters({ fetchCredentials }). This creates a DialogServiceConnector internally and opens a WebSocket to wss://{region}.convai.speech.microsoft.com.',
              code: `import { createDirectLineSpeechAdapters }\n  from 'botframework-webchat';\n\nconst adapters = await createDirectLineSpeechAdapters({\n  fetchCredentials: async () => ({\n    subscriptionKey: speechKey,\n    region: 'eastus',\n  }),\n  speechRecognitionLanguage: 'en-US',\n});`,
            },
            {
              step: 3,
              title: 'Subscribe to connectionStatus$',
              detail: 'CRITICAL: Subscribe to connectionStatus$ BEFORE Web Chat mounts. This ensures correct Observable ordering — connectionStatusObserver must be set before activity$ subscribes.',
              code: `// Subscribe BEFORE <ReactWebChat> mounts\nadapters.directLine.connectionStatus$\n  .subscribe(status => {\n    // 0=Uninitialized, 1=Connecting,\n    // 2=Online, 4=Error\n    console.log('DLS status:', status);\n  });`,
            },
            {
              step: 4,
              title: 'Mount Web Chat with DLS Adapters',
              detail: 'Pass both directLine and webSpeechPonyfillFactory from the DLS adapters. Web Chat uses the DLS ponyfill for mic/speaker — audio goes through the DLS WebSocket, not a separate speech connection.',
              code: `<ReactWebChat\n  directLine={adapters.directLine}\n  webSpeechPonyfillFactory={\n    adapters.webSpeechPonyfillFactory\n  }\n  store={store}\n/>`,
            },
            {
              step: 5,
              title: 'Voice Conversation Flow',
              detail: 'User speaks → mic audio sent via DLS WebSocket → Azure Speech STT (server-side) → transcribed text to bot → bot response → Azure Speech TTS (server-side) → audio back via WebSocket → speakers.',
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
            <pre>{`Browser                  Server (:3001)     DLS WebSocket        Bot Service       Copilot Studio
  │                         │               (Azure Speech)          │                   │
  │─ GET /speechservices ──▶│                    │                   │                   │
  │   /token                │                    │                   │                   │
  │◀─ { speechKey, region }─│                    │                   │                   │
  │                         │                    │                   │                   │
  │── createDirectLineSpeechAdapters ───────────▶│                   │                   │
  │   fetchCredentials: { subscriptionKey, region }                  │                   │
  │◀─ { directLine, webSpeechPonyfillFactory } ──│                   │                   │
  │                         │                    │                   │                   │
  │── subscribe connectionStatus$ ──────────────▶│                   │                   │
  │◀─ status: 2 (Online) ──────────────────────│                   │                   │
  │                         │                    │                   │                   │
  │🎤 User speaks           │                    │                   │                   │
  │── audio frames ────────────────────────────▶│                   │                   │
  │                         │                    │── STT text ──────▶│                   │
  │                         │                    │                   │── forward ───────▶│
  │                         │                    │                   │◀─ response ──────│
  │                         │                    │◀─ bot activity ──│                   │
  │◀─ activity + TTS audio ────────────────────│                   │                   │
  │🔊 Plays audio           │                    │                   │                   │`}</pre>
          </div>
        </div>
      </div>
    );
  }

  // Resources tab
  return (
    <div className="info-panel-content dls-accent">
      <div className="info-panel-header dls-accent">
        <span className="info-panel-icon">📚</span>
        <h3>Direct Line Speech — Resources</h3>
      </div>

      <div className="info-panel-resources">
        {[
          {
            category: 'Direct Line Speech',
            links: [
              { title: 'DLS in Web Chat (GitHub)', url: 'https://github.com/microsoft/BotFramework-WebChat/blob/main/docs/DIRECT_LINE_SPEECH.md', desc: 'Official Web Chat documentation for Direct Line Speech setup' },
              { title: 'DLS Channel Setup', url: 'https://learn.microsoft.com/azure/bot-service/bot-service-channel-connect-directlinespeech', desc: 'Configure Direct Line Speech channel on Azure Bot Service' },
              { title: 'Sample: DLS in Web Chat', url: 'https://github.com/nicko3000/BotFramework-WebChat/tree/master/samples/03.speech/a.direct-line-speech', desc: 'Working sample code for Direct Line Speech with Web Chat' },
              { title: 'botframework-directlinespeech-sdk', url: 'https://www.npmjs.com/package/botframework-directlinespeech-sdk', desc: 'NPM package — v4.18.0, actively maintained' },
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
          {
            category: 'Azure Bot Service',
            links: [
              { title: 'Bot Service Overview', url: 'https://learn.microsoft.com/azure/bot-service/bot-service-overview', desc: 'Overview of Azure Bot Service — deploy and manage bots' },
              { title: 'Bot Framework SDK (Node.js)', url: 'https://learn.microsoft.com/azure/bot-service/javascript/bot-builder-javascript-quickstart', desc: 'Getting started with Bot Framework SDK for Node.js' },
              { title: 'Copilot Studio Integration', url: 'https://learn.microsoft.com/microsoft-copilot-studio/configure-web-channel', desc: 'Configure web channel for Copilot Studio agents' },
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
            <code>hooks/useDirectLineSpeechConnectionDLS.ts</code>
            <span>Custom hook — fetches Speech credentials, creates DLS adapters, manages lifecycle</span>
          </div>
          <div className="info-file-item">
            <code>components/TrueDLSChat.tsx</code>
            <span>This component — live DLS chat with ReactWebChat, settings, debug panel</span>
          </div>
          <div className="info-file-item">
            <code>proxy-bot/src/bot.ts</code>
            <span>Proxy bot message handler — receives DLS-routed messages</span>
          </div>
          <div className="info-file-item">
            <code>server/routes/speechRoutes.ts</code>
            <span>Server endpoint for Speech credentials (speechKey + region)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DLSInfoPanels;
