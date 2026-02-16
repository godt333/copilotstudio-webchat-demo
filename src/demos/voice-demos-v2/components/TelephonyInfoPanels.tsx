/**
 * TelephonyInfoPanels — Informational sub-tabs for the Telephony / IVR tab
 * =========================================================================
 * Architecture, Connection Flow, and Resources panels for the Telephony tab.
 */

import React from 'react';

interface Props {
  activeTab: string;
}

const TelephonyInfoPanels: React.FC<Props> = ({ activeTab }) => {
  if (activeTab === 'architecture') {
    return (
      <div className="info-panel-content telephony-accent">
        <div className="info-panel-header telephony-accent">
          <span className="info-panel-icon">🏗️</span>
          <h3>Telephony / IVR — Architecture</h3>
        </div>

        <div className="info-panel-section">
          <h4>End-to-End Telephony Architecture</h4>
          <p>
            The Telephony tab demonstrates a <strong>phone-based IVR experience</strong> powered by
            Copilot Studio, LiveHub, and Azure Communication Services. A caller dials a phone number,
            is routed through the PSTN gateway, and speaks directly with the Copilot Studio agent
            using voice — all without opening a browser.
          </p>
          <ul>
            <li><strong>PSTN Gateway:</strong> Azure Communication Services provides the phone number and routes calls from the telephone network into the cloud.</li>
            <li><strong>LiveHub (Omnichannel):</strong> Acts as the orchestration layer — receives the incoming call, manages the session, and connects the caller to the appropriate Copilot Studio agent or a live human agent.</li>
            <li><strong>Copilot Studio Agent:</strong> The same Citizen Advice agent used in Tab 1 &amp; 2. Receives transcribed speech, generates responses, and sends them back as synthesized voice.</li>
            <li><strong>Azure Speech Services:</strong> Handles real-time Speech-to-Text (STT) and Text-to-Speech (TTS) within the telephony pipeline — the caller hears neural voice responses.</li>
          </ul>
        </div>

        <div className="info-panel-diagram">
          <div className="info-panel-diagram-label">Architecture Diagram</div>
          <pre>{`┌─────────────┐
│  Caller      │
│  (Phone)     │
└──────┬──────┘
       │ PSTN Call
       ▼
┌──────────────────────────┐
│  Azure Communication     │
│  Services                │
│  • Phone Number          │
│  • PSTN Gateway          │
│  • Call Routing           │
└──────────┬───────────────┘
           │ SIP / Media
           ▼
┌──────────────────────────┐
│  LiveHub / Omnichannel   │
│  (Dynamics 365)          │
│                          │
│  • Session Management    │
│  • Agent Routing         │
│  • Live Agent Handoff    │
│  • Call Transcripts      │
└──────────┬───────────────┘
           │ Direct Line / Bot Framework
           ▼
┌──────────────────────────┐      ┌──────────────────┐
│  Copilot Studio          │◄────▶│  Azure Speech    │
│  (Bot Logic)             │      │  Service         │
│                          │      │  • STT (caller)  │
│  • Citizen Advice Agent  │      │  • TTS (bot)     │
│  • Knowledge Base        │      └──────────────────┘
│  • Topics & Flows        │
└──────────────────────────┘`}</pre>
        </div>

        <div className="info-panel-section">
          <h4>Key Components</h4>
          <div className="info-panel-grid">
            <div className="info-grid-card">
              <strong>Azure Communication Services</strong>
              <p>Provides the PSTN phone number (+1 786-687-0264) and routes inbound calls to LiveHub via SIP trunking.</p>
            </div>
            <div className="info-grid-card">
              <strong>LiveHub (Omnichannel for Customer Service)</strong>
              <p>Dynamics 365 omnichannel layer that manages the call session, handles queueing, and can escalate to a live human agent.</p>
            </div>
            <div className="info-grid-card">
              <strong>Copilot Studio Agent</strong>
              <p>The same Citizen Advice bot from Tabs 1 &amp; 2. Receives text from STT, processes with AI + knowledge base, returns response for TTS.</p>
            </div>
            <div className="info-grid-card">
              <strong>Azure Speech Services</strong>
              <p>Real-time STT converts caller speech to text. Neural TTS voices speak the bot's responses back to the caller over the phone line.</p>
            </div>
          </div>
        </div>

        <div className="info-panel-section">
          <h4>Why Telephony / IVR?</h4>
          <ul>
            <li>✅ <strong>No app or browser needed</strong> — users call from any phone, anywhere.</li>
            <li>✅ <strong>Same AI agent</strong> — Copilot Studio agent serves web, chat, and phone channels.</li>
            <li>✅ <strong>Live agent handoff</strong> — seamless escalation from bot to human via LiveHub.</li>
            <li>✅ <strong>Enterprise-grade</strong> — call recording, transcripts, analytics in Dynamics 365.</li>
            <li>✅ <strong>Accessibility</strong> — voice-first for users who can't use visual interfaces.</li>
            <li>⚠️ <strong>More infrastructure</strong> — requires Azure Communication Services + Dynamics 365 licenses.</li>
            <li>⚠️ <strong>Telephony latency</strong> — PSTN adds ~100-200ms vs. direct web connections.</li>
          </ul>
        </div>
      </div>
    );
  }

  if (activeTab === 'connection') {
    return (
      <div className="info-panel-content telephony-accent">
        <div className="info-panel-header telephony-accent">
          <span className="info-panel-icon">🔌</span>
          <h3>Telephony / IVR — Connection Flow</h3>
        </div>

        <div className="info-panel-flow">
          {[
            {
              step: 1,
              title: 'Caller Dials the Number',
              detail: 'The caller dials +1 (786) 687-0264 from any phone (mobile, landline, VoIP). The call enters the Public Switched Telephone Network (PSTN).',
              code: `Phone: +1 (786) 687-0264\n→ PSTN routes to Azure Communication Services`,
            },
            {
              step: 2,
              title: 'Azure Communication Services Receives Call',
              detail: 'ACS owns the phone number and acts as the SIP endpoint. It receives the inbound call, establishes the media session, and routes it to the configured LiveHub voice workstream.',
              code: `ACS Phone Number → SIP Trunk\n→ LiveHub Voice Workstream\n→ Omnichannel Session Created`,
            },
            {
              step: 3,
              title: 'LiveHub Creates Omnichannel Session',
              detail: 'LiveHub (Dynamics 365 Omnichannel) creates a conversation session. It checks routing rules — if a Copilot Studio bot is configured for the workstream, the call is connected to the bot.',
              code: `LiveHub Routing Rules:\n  IF workstream == "Voice"\n  AND bot_configured == true\n  THEN connect → Copilot Studio Agent`,
            },
            {
              step: 4,
              title: 'Speech-to-Text (Caller → Bot)',
              detail: 'As the caller speaks, Azure Speech Services transcribes the audio in real-time. The transcribed text is sent to the Copilot Studio agent as a message activity.',
              code: `Caller Audio → Azure Speech STT\n→ "I need help with housing"\n→ Copilot Studio (as text activity)`,
            },
            {
              step: 5,
              title: 'Copilot Studio Processes & Responds',
              detail: 'The Citizen Advice agent processes the message using its topics, knowledge base, and AI. It generates a text response, which is sent back through the pipeline.',
              code: `Copilot Studio:\n  Topic: "Housing Advice"\n  Response: "I can help with housing.\n  Are you a tenant or homeowner?"`,
            },
            {
              step: 6,
              title: 'Text-to-Speech (Bot → Caller)',
              detail: 'The bot\'s text response is synthesized to audio using Azure Neural TTS voices. The audio is streamed back through ACS to the caller\'s phone.',
              code: `Bot Response Text → Azure Speech TTS\n→ Neural Voice Audio\n→ ACS Media Stream → Phone Speaker`,
            },
            {
              step: 7,
              title: 'Live Agent Handoff (Optional)',
              detail: 'If the bot can\'t resolve the issue, it triggers a handoff. LiveHub queues the call for a human agent, who can see the full transcript and continue the conversation.',
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
            <pre>{`Caller (Phone)    PSTN    Azure Comm Svc    LiveHub         Copilot Studio    Azure Speech
  │                │           │                │                  │                 │
  │── Dial ───────▶│           │                │                  │                 │
  │                │── SIP ───▶│                │                  │                 │
  │                │           │── Route Call ──▶│                  │                 │
  │                │           │                │── Connect Bot ──▶│                 │
  │                │           │                │                  │                 │
  │🎤 Caller speaks│           │                │                  │                 │
  │── audio ──────▶│──────────▶│── media ──────▶│── audio ────────────────────────── ▶│
  │                │           │                │◀─ transcribed text ────────────────│
  │                │           │                │── text activity ─▶│                 │
  │                │           │                │                  │ (AI processing)  │
  │                │           │                │◀─ bot response ──│                 │
  │                │           │                │── response text ─────────────────── ▶│
  │                │           │                │◀─ synthesized audio ───────────────│
  │                │           │◀─ media ──────│                  │                 │
  │◀─ audio ──────│◀──────────│                │                  │                 │
  │🔊 Hears bot   │           │                │                  │                 │
  │                │           │                │                  │                 │
  │── "Transfer" ─▶│──────────▶│── media ──────▶│── handoff ──────▶│                 │
  │                │           │                │── Queue for ─────▶ Human Agent      │
  │◀─ Live agent ──│◀──────────│◀──────────────│◀── connected ────│                 │`}</pre>
          </div>
        </div>
      </div>
    );
  }

  // Resources tab
  return (
    <div className="info-panel-content telephony-accent">
      <div className="info-panel-header telephony-accent">
        <span className="info-panel-icon">📚</span>
        <h3>Telephony / IVR — Resources</h3>
      </div>

      <div className="info-panel-resources">
        {[
          {
            category: 'Azure Communication Services',
            links: [
              { title: 'ACS Overview', url: 'https://learn.microsoft.com/azure/communication-services/overview', desc: 'Cloud communications platform — voice, video, SMS, and email' },
              { title: 'Phone Numbers & PSTN', url: 'https://learn.microsoft.com/azure/communication-services/concepts/telephony/plan-solution', desc: 'Plan your PSTN telephony solution with ACS' },
              { title: 'Call Automation', url: 'https://learn.microsoft.com/azure/communication-services/concepts/call-automation/call-automation', desc: 'Server-side call control, IVR, and call routing APIs' },
            ],
          },
          {
            category: 'Dynamics 365 & LiveHub',
            links: [
              { title: 'Omnichannel for Customer Service', url: 'https://learn.microsoft.com/dynamics365/customer-service/implement/introduction-omnichannel', desc: 'Unified communication platform for voice, chat, and messaging' },
              { title: 'Voice Channel Setup', url: 'https://learn.microsoft.com/dynamics365/customer-service/administer/voice-channel-install', desc: 'Set up the voice channel in Dynamics 365 Customer Service' },
              { title: 'Copilot Studio + Voice', url: 'https://learn.microsoft.com/microsoft-copilot-studio/voice-overview', desc: 'Connect Copilot Studio agents to voice channels' },
            ],
          },
          {
            category: 'Copilot Studio & Speech',
            links: [
              { title: 'Copilot Studio Overview', url: 'https://learn.microsoft.com/microsoft-copilot-studio/fundamentals-what-is-copilot-studio', desc: 'Build AI-powered agents with no-code/low-code' },
              { title: 'Azure Speech Service', url: 'https://learn.microsoft.com/azure/ai-services/speech-service/overview', desc: 'STT, TTS, speech translation, and speaker recognition' },
              { title: 'Neural TTS Voices', url: 'https://learn.microsoft.com/azure/ai-services/speech-service/language-support?tabs=tts', desc: '600+ neural voices across 140+ languages and locales' },
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
        <h4>📋 How This Demo Works</h4>
        <div className="info-panel-grid">
          <div className="info-grid-card">
            <strong>QR Code / Call Button</strong>
            <p>The Chatbot tab provides a QR code and a click-to-call button. Both dial the PSTN number connected to Azure Communication Services.</p>
          </div>
          <div className="info-grid-card">
            <strong>Same Copilot Studio Agent</strong>
            <p>The phone call reaches the same Citizen Advice agent used in Tabs 1 &amp; 2, demonstrating true omnichannel — one bot, multiple channels.</p>
          </div>
          <div className="info-grid-card">
            <strong>Check Analytics After Call</strong>
            <p>After calling, open Copilot Studio → Analytics to see the conversation transcript, demonstrating the full loop from phone to analytics.</p>
          </div>
          <div className="info-grid-card">
            <strong>Live Agent Escalation</strong>
            <p>If configured, the bot can transfer the call to a live agent queue in Dynamics 365, with full context and transcript carried over.</p>
          </div>
        </div>
      </div>

      <div className="info-panel-section">
        <h4>🔑 Key Differences from Web Tabs</h4>
        <div className="info-panel-grid">
          <div className="info-grid-card" style={{ borderLeft: '3px solid #00a878' }}>
            <strong>Tabs 1 &amp; 2: Web-Based</strong>
            <p>Speech SDK runs in browser. Direct Line connects to Copilot Studio. Voice is handled client-side.</p>
          </div>
          <div className="info-grid-card" style={{ borderLeft: '3px solid #d83b01' }}>
            <strong>This Tab: Phone-Based</strong>
            <p>No browser needed. PSTN call → ACS → LiveHub → Copilot Studio. All voice processing is server-side.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelephonyInfoPanels;
