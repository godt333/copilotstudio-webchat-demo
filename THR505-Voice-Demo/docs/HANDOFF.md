# THR505 — Technical Handoff for Godwin

> **Session:** THR505 – Integrating and branding Copilot Studio with Web Chat (text and audio)  
> **Date:** February 12, 2026  
> **Author:** Jose (handoff to Godwin)

---

## 1. Project Structure

```
THR505-Voice-Demo/
├── client/                          # React + TypeScript SPA (Vite)
│   ├── index.html                   # Entry HTML (mounts #root)
│   ├── package.json                 # Dependencies: botframework-webchat, microsoft-cognitiveservices-speech-sdk
│   ├── vite.config.ts               # Dev server :5173, proxy /api → :3001
│   ├── tsconfig.json
│   └── src/
│       ├── App.tsx                   # Main router — 6 tabs (ponyfill, proxy bot, DLS, VLA, IVR, side-by-side)
│       ├── main.tsx                  # ReactDOM root
│       ├── types.d.ts               # Global type declarations
│       │
│       ├── components/
│       │   ├── SpeechPonyfillChat.tsx      # Tab 1: Speech Ponyfill — DL direct + client-side STT/TTS
│       │   ├── DirectLineSpeechChat.tsx     # Tab 2: Proxy Bot — DL via proxy bot + client-side STT/TTS
│       │   ├── TrueDLSChat.tsx             # Tab 3: DLS (Deprecated) — architecture reference
│       │   ├── VoiceLiveAPI.tsx            # Tab 4: Voice Live API — WebSocket STT+AI+TTS
│       │   ├── TelephonyIVR.tsx            # Tab 5: Telephony/IVR — phone-based via LiveHub
│       │   ├── VoiceSettingsPanel.tsx       # Shared settings UI (voice, rate, pitch, barge-in, locale)
│       │   ├── CodePanel.tsx               # Code walkthrough panel (shows what's happening under the hood)
│       │   ├── DebugPanel.tsx              # Real-time debug/diagnostics panel
│       │   ├── KeyboardShortcuts.tsx        # Ctrl+L (clear), Ctrl+D (debug), Ctrl+S (sound), ? (help)
│       │   ├── PonyfillInfoPanels.tsx       # Tab 1 info sub-tabs (Architecture, Connection Flow, Resources)
│       │   ├── ProxyBotInfoPanels.tsx       # Tab 2 info sub-tabs
│       │   └── TelephonyInfoPanels.tsx      # Tab 5 info sub-tabs
│       │
│       ├── hooks/
│       │   ├── useDirectLinePonyfillConnection.ts   # Tab 1 hook: createDirectLine() + createSpeechServicesPonyfill()
│       │   ├── useDirectLineSpeechConnection.ts     # Tab 2 hook: createDirectLine() (proxy bot) + ponyfill
│       │   └── useDirectLineSpeechConnectionDLS.ts  # Tab 3 hook: True DLS (archived/reference only)
│       │
│       ├── services/
│       │   └── api.ts               # API calls: fetchDirectLineToken(), fetchPonyfillCredentials(), etc.
│       │
│       ├── styles/
│       │   └── index.css            # All styling (CSS custom properties, tab themes, responsive)
│       │
│       └── utils/
│           ├── sounds.ts            # Audio feedback (connect, disconnect, message sounds)
│           └── textUtils.ts         # Text processing utilities
│
├── server/                          # Express + TypeScript backend (port 3001)
│   ├── package.json                 # Dependencies: express, @azure/identity, ws, dotenv
│   ├── tsconfig.json
│   ├── .env                         # ⚠️ SECRETS — never commit (see env.ts for schema)
│   └── src/
│       ├── index.ts                 # Express app bootstrap, WebSocket upgrade for VLA
│       ├── config/
│       │   └── env.ts               # Centralized config: speech, directLine, liveHub, proxyBot, tokens
│       ├── middleware/
│       │   └── errorHandler.ts      # Global error handler
│       └── routes/
│           ├── speechRoutes.ts      # GET /api/speechservices/token — Azure AD token for Speech SDK
│           │                        # GET /api/speechservices/ponyfillKey — ponyfill credentials
│           ├── directLineRoutes.ts  # GET /api/directline/token — Copilot Studio DL token
│           │                        # GET /api/directline/proxyBotToken — Proxy Bot DL token
│           │                        # GET /api/directline/livehubToken — LiveHub DL token (telephony)
│           └── voiceLiveRoutes.ts   # WS /api/voicelive/ws — WebSocket proxy to Azure Voice Live API
│
├── proxy-bot/                       # Bot Framework bot (deployed to Azure App Service)
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                         # Bot secrets (MicrosoftAppId, CopilotStudio endpoint)
│   └── src/
│       ├── index.ts                 # Restify server + Bot adapter setup
│       ├── bot.ts                   # ProxyBot class — forwards DL messages ↔ Copilot Studio
│       └── copilotClient.ts         # CopilotClient — manages DL conversation with Copilot Studio
│
├── docs/                            # Documentation
│   ├── ARCHITECTURE_COMPARISON.md   # Comparison of all voice approaches
│   ├── AZURE_DEPLOYMENT.md          # Azure resource setup guide
│   ├── DEMO_SETUP_NEW_ENVIRONMENT.md # Full environment setup from scratch
│   ├── SPEECH_PONYFILL.md           # Deep dive: Speech Ponyfill approach
│   ├── TELEPHONY_IVR_LIVEHUB.md     # Deep dive: Telephony/IVR with LiveHub
│   ├── TROUBLESHOOTING.md           # Common issues and fixes
│   ├── VOICE_SETUP.md              # Voice configuration guide
│   └── TRUE_DLS_AZURE_POLICY_BLOCKER.md  # Why True DLS is blocked in this tenant
│
├── start-demo.bat                   # One-click launcher (starts server + client)
├── README.md                        # General README
├── SETUP_GUIDE.md                   # Quick-start guide
└── THR505-Voice-Demo.code-workspace # VS Code multi-root workspace
```

### Key Dependencies

| Package | Where | Purpose |
|---------|-------|---------|
| `botframework-webchat` | client | React Web Chat control |
| `microsoft-cognitiveservices-speech-sdk` | client | Speech Ponyfill (STT/TTS) |
| `botframework-directlinejs` | client | Direct Line connection to Copilot Studio |
| `@azure/identity` | server | Azure AD auth (DefaultAzureCredential) |
| `ws` | server | WebSocket for Voice Live API relay |
| `express` | server | HTTP API server |
| `botbuilder` | proxy-bot | Bot Framework SDK (proxy bot logic) |

---

## 2. Code Walkthrough — Follow the Execution

> **Read this first.** This walks you through what the code does in the order it executes, so you can explain it confidently during the demo.

### 2.1 App Startup

1. **Server starts** → `server/src/index.ts`
   - Loads `.env` via `config/env.ts` (validates all secrets exist)
   - Creates Express app with CORS, Helmet, Morgan
   - Mounts route handlers: `/api/speechservices/*`, `/api/directline/*`
   - Creates HTTP server + WebSocket server for VLA (`/api/voicelive/ws`)
   - Listens on `:3001`

2. **Client starts** → `client/src/main.tsx` → `App.tsx`
   - Vite dev server on `:5173`, proxies all `/api/*` calls to `:3001`
   - `App.tsx` renders 6 tabs. Default tab is **Speech Ponyfill** (Tab 1)
   - Each tab is a lazy-loaded React component

### 2.2 Tab 1 — Speech Ponyfill (the main demo path)

**When the user clicks "Connect":**

```
SpeechPonyfillChat.tsx
  └─ calls hook: useDirectLinePonyfillConnection.ts
       │
       ├─ Step 1: Parallel token fetch (Promise.all)
       │   ├─ fetchDirectLineToken()  →  api.ts  →  GET /api/directline/token
       │   │   └─ Server: directLineRoutes.ts exchanges Copilot Studio token endpoint → DL token
       │   │
       │   └─ fetchPonyfillCredentials()  →  api.ts  →  GET /api/speechservices/ponyfillKey
       │       └─ Server: speechRoutes.ts uses Azure AD (DefaultAzureCredential) → Speech token
       │
       ├─ Step 2: Create connections
       │   ├─ createDirectLine({ token })          ← from botframework-webchat
       │   │   └─ Opens WebSocket to Copilot Studio via Direct Line
       │   │
       │   └─ createSpeechServicesPonyfill({       ← from web-speech-cognitive-services
       │       credentials: { authorizationToken, region },
       │       speechSynthesisVoiceName: 'en-US-JennyNeural'
       │     })
       │       └─ Returns: SpeechRecognition (STT), speechSynthesis (TTS), SpeechSynthesisUtterance
       │
       ├─ Step 3: Patch the utterance for rate/pitch control
       │   └─ PatchedUtterance wraps OriginalUtterance, sets .rate and .pitch
       │       (this is how the settings sliders affect the voice)
       │
       └─ Step 4: Return ponyfillFactory + directLine to component
            └─ SpeechPonyfillChat.tsx passes both to <ReactWebChat>
                 └─ Web Chat handles: mic button, speech bubbles, send/receive
```

**When the user speaks:**
- Web Chat's mic button → `SpeechRecognition.start()` (ponyfill) → Azure Speech STT → transcribed text → sent as DL activity → Copilot Studio → response text → `speechSynthesis.speak(utterance)` → Azure TTS → audio out through browser speakers

**When the user changes voice settings:**
- `VoiceSettingsPanel.tsx` stores state → passed as props to `SpeechPonyfillChat.tsx` → re-creates the hook with new `voice`, `speechRate`, `speechPitch` → new `PatchedUtterance` applies the values

### 2.3 Tab 2 — Proxy Bot (same voice, different messaging path)

Identical to Tab 1 for voice (same ponyfill), but the Direct Line token points to the **proxy bot** instead of Copilot Studio directly:

```
fetchDirectLineToken() → but uses fetchProxyBotToken() instead
  └─ GET /api/directline/proxyBotToken
       └─ Server: uses PROXY_BOT_DIRECT_LINE_SECRET to get token

Message flow:
  User speaks → STT → text → Direct Line → Proxy Bot (Azure App Service)
    └─ bot.ts: onMessage() → copilotClient.sendMessage(text)
         └─ copilotClient.ts: forwards to Copilot Studio via its own DL connection
              └─ Copilot Studio response → copilotClient → bot.ts → Direct Line → Web Chat → TTS
```

**Key demo point:** The proxy bot can intercept, log, or transform messages. Show `proxy-bot/src/bot.ts` to explain the middleware pattern.

### 2.4 Tab 4 — Voice Live API (next-gen, no SDK on client)

Completely different architecture — no Direct Line, no Speech SDK:

```
VoiceLiveAPI.tsx (push-to-talk button)
  └─ Opens WebSocket to: ws://localhost:3001/api/voicelive/ws
       └─ Server: index.ts upgrades HTTP → WebSocket
            └─ voiceLiveRoutes.ts: handleVoiceLiveConnection()
                 ├─ Opens 2nd WebSocket to Azure VLA:
                 │   wss://{endpoint}/voice-live/realtime?api-version=2025-10-01&model=gpt-4o
                 │
                 └─ Relay loop:
                      Browser audio (base64 PCM) → Azure VLA
                      Azure VLA events (transcript, AI response, TTS audio) → Browser
```

**Key demo point:** Client only needs Web Audio API (microphone + speakers). All intelligence is server-side. This is the replacement for DLS.

### 2.5 Tab 5 — Telephony / IVR (no code runs — just a phone call)

```
TelephonyIVR.tsx
  └─ Renders: QR code + click-to-call button for +1 (786) 687-0264
       └─ No WebSocket, no Direct Line from the browser
            The call goes through PSTN:
              Phone → Azure Communication Services → LiveHub → Copilot Studio
```

The only server-side code: `/api/directline/livehubToken` — which LiveHub calls (not the browser) to get a DL token with the caller's phone number as userId.

**Key demo point:** Same Copilot Studio agent, reached via phone instead of browser. After calling, show the conversation transcript in Copilot Studio Analytics.

### 2.6 Key Files You'll Reference During Demo

| When showing... | Open this file | Point to... |
|----------------|---------------|-------------|
| "How tokens work" | `server/src/routes/speechRoutes.ts` | `DefaultAzureCredential` → `getToken()` → cached Speech token |
| "How DL connects" | `server/src/routes/directLineRoutes.ts` | Token endpoint fetch or secret exchange |
| "The ponyfill hook" | `client/src/hooks/useDirectLinePonyfillConnection.ts` | `Promise.all` (L128), `createDirectLine` (L140), `createSpeechServicesPonyfill` (L152), `PatchedUtterance` (L167) |
| "Voice settings" | `client/src/components/VoiceSettingsPanel.tsx` | Settings table in JSDoc (L52-79), voice/locale options |
| "Proxy bot flow" | `proxy-bot/src/bot.ts` | `onMessage` handler, `copilotClient.sendMessage()` |
| "VLA relay" | `server/src/routes/voiceLiveRoutes.ts` | `handleVoiceLiveConnection()`, dual WebSocket setup |
| "Telephony token" | `server/src/routes/directLineRoutes.ts` | `/livehubToken` route (L226+) |
| "All config" | `server/src/config/env.ts` | Every env var documented with comments |

---

## 3. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    THR505 DEMO ARCHITECTURE                                     │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐            │
│  │                         React SPA (Vite :5173)                                  │            │
│  │                                                                                 │            │
│  │  ┌─────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────┐│            │
│  │  │ Tab 1       │ │ Tab 2        │ │ Tab 3        │ │ Tab 4        │ │ Tab 5  ││            │
│  │  │ Speech      │ │ Proxy Bot    │ │ DLS          │ │ Voice Live   │ │ IVR    ││            │
│  │  │ Ponyfill    │ │              │ │ (Deprecated) │ │ API          │ │        ││            │
│  │  └──────┬──────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └───┬────┘│            │
│  │         │               │                │                │             │      │            │
│  │   DL + Ponyfill   DL + Ponyfill    (Reference      WebSocket          QR/Call  │            │
│  │   (2 channels)    (2 channels)      only)          (audio relay)      button   │            │
│  └─────────┼───────────────┼────────────────┼────────────────┼─────────────┼──────┘            │
│            │               │                │                │             │                    │
│            ▼               ▼                                 ▼             │                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │                    │
│  │                      Express Server (:3001)                         │   │                    │
│  │                                                                     │   │                    │
│  │  /api/directline/token ──────────▶ Copilot Studio Token Endpoint   │   │                    │
│  │  /api/directline/proxyBotToken ──▶ DL Secret → Token Exchange      │   │                    │
│  │  /api/directline/livehubToken ───▶ DL Secret → Token (telephony)   │   │                    │
│  │  /api/speechservices/token ──────▶ Azure AD → Speech Token         │   │                    │
│  │  /api/speechservices/ponyfillKey ▶ Region + Token (for ponyfill)   │   │                    │
│  │  ws://…/api/voicelive/ws ────────▶ WebSocket relay to Azure VLA    │   │                    │
│  └─────────┬───────────────┬──────────────────────────────┬───────────┘   │                    │
│            │               │                              │               │                    │
│            ▼               ▼                              ▼               │                    │
│  ┌──────────────┐ ┌────────────────────┐ ┌────────────────────────┐       │                    │
│  │ Copilot      │ │ Proxy Bot          │ │ Azure Voice Live API   │       │                    │
│  │ Studio       │ │ (Azure App Svc)    │ │ (wss://…/voice-live/   │       │                    │
│  │              │ │                    │ │  realtime)              │       │                    │
│  │ • Citizen    │ │ bot.ts: receives   │ │                        │       │                    │
│  │   Advice     │ │ DL messages,       │ │ • Server-side STT      │       │                    │
│  │   Agent      │ │ forwards to        │ │ • Built-in GPT-4o/5    │       │                    │
│  │ • Topics     │ │ Copilot Studio     │ │ • Neural TTS           │       │                    │
│  │ • Knowledge  │ │ via copilotClient  │ │ • Native barge-in      │       │                    │
│  │   Base       │ │                    │ │ • VAD (server-side)    │       │                    │
│  └──────────────┘ └────────────────────┘ └────────────────────────┘       │                    │
│                                                                           │                    │
│  ┌──────────────────────────────────────────┐    ┌─────────────────┐      │                    │
│  │ Azure Speech Services                    │    │ Azure Comm Svc  │◀─────┘                    │
│  │                                          │    │ (PSTN Gateway)  │                           │
│  │ • STT (ponyfill in browser)              │    └────────┬────────┘                           │
│  │ • TTS (ponyfill in browser)              │             │                                    │
│  │ • Token issuance via Azure AD            │             ▼                                    │
│  └──────────────────────────────────────────┘    ┌─────────────────┐                           │
│                                                  │ LiveHub         │                           │
│                                                  │ (AudioCodes)    │                           │
│                                                  │ → Copilot Studio│                           │
│                                                  └─────────────────┘                           │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Azure Resources Involved

| Resource | Purpose |
|----------|---------|
| **Azure Speech Services** (`thr505-dls-speech`) | Token issuance for ponyfill, STT/TTS engine |
| **Copilot Studio** (Citizen Advice agent) | The bot logic — same agent across all tabs |
| **Azure App Service** (`thr505-dls-proxy-bot`) | Hosts the Proxy Bot (Tab 2) |
| **Azure Communication Services** | PSTN phone number for Telephony/IVR (Tab 5) |
| **LiveHub / AudioCodes** | Omnichannel orchestration for Telephony (Tab 5) |
| **Azure Voice Live API** | Server-side STT+AI+TTS WebSocket endpoint (Tab 4) |

---

## 4. Web App Summary — The 4 Voice Approaches (+2 reference tabs)

The demo app has **6 tabs**. Tabs 1, 2, 4, and 5 are the 4 live voice experiences. Tab 3 is an archived reference. Tab 6 is a side-by-side comparison.

### Tab Overview

| Tab | Name | Channel | Voice Mechanism | AI | Status |
|-----|------|---------|----------------|------|--------|
| 1 | **Speech Ponyfill** | Direct Line → Copilot Studio | Client-side ponyfill (browser) | Copilot Studio | ✅ Working |
| 2 | **Proxy Bot** | Direct Line → Proxy Bot → Copilot Studio | Client-side ponyfill (browser) | Copilot Studio (via proxy) | ✅ Working |
| 3 | **DLS (Deprecated)** | Direct Line Speech (unified) | DLS channel (deprecated) | Copilot Studio | ⛔ Archived |
| 4 | **Voice Live API** | WebSocket to Azure VLA | Server-side (STT+TTS built-in) | GPT-4o / GPT-5 (built-in) | ✅ GA (replaces DLS) |
| 5 | **Telephony / IVR** | Phone → PSTN → ACS → LiveHub → Copilot Studio | Server-side (Azure Speech in pipeline) | Copilot Studio | ✅ Working |
| 6 | **Side-by-Side** | Tabs 1+2 shown together | Same as above | Same | Demo only |

---

### 4.1 Tab 1: Speech Ponyfill (Detailed)

**What it does:** Connects directly to Copilot Studio via Direct Line for messaging, and uses a separate Azure Speech Services ponyfill in the browser for voice (STT/TTS).

**Data flow:**
```
Browser                          Express Server (:3001)          Azure
  │                                    │                           │
  ├── fetchDirectLineToken() ────────▶ /api/directline/token ────▶ Copilot Studio Token Endpoint
  ├── fetchPonyfillCredentials() ────▶ /api/speechservices/       │
  │                                    ponyfillKey ───────────────▶ Azure AD → Speech Token
  │                                    │                           │
  │  Promise.all([token, creds])       │                           │
  │                                    │                           │
  ├── createDirectLine({token}) ─────────────────────────────────▶ Direct Line (Copilot Studio)
  ├── createSpeechServicesPonyfill({region, authToken, voice})     │
  │       └── SpeechRecognition (STT)                              │
  │       └── speechSynthesis (TTS)                                │
  │                                    │                           │
  └── ReactWebChat({ directLine, webSpeechPonyfillFactory })      │
```

**Key source files:**

| File | Role |
|------|------|
| `client/src/hooks/useDirectLinePonyfillConnection.ts` | Core hook: creates DL connection + ponyfill, wraps PatchedUtterance for rate/pitch |
| `client/src/components/SpeechPonyfillChat.tsx` | React component: renders Web Chat with settings panel |
| `client/src/components/VoiceSettingsPanel.tsx` | Settings UI for voice, locale, rate, pitch, barge-in |
| `client/src/services/api.ts` | `fetchDirectLineToken()`, `fetchPonyfillCredentials()` |
| `server/src/routes/directLineRoutes.ts` | `/api/directline/token` — exchanges secret/endpoint for DL token |
| `server/src/routes/speechRoutes.ts` | `/api/speechservices/ponyfillKey` — Azure AD → Speech token |

**Voice settings — where each capability lives:**

| Setting | Controlled By | Source File | Service | Status |
|---------|--------------|-------------|---------|--------|
| **Voice name** (Jenny, Guy, etc.) | `speechSynthesisVoiceName` in `createSpeechServicesPonyfill()` | `useDirectLinePonyfillConnection.ts` | Azure TTS (ponyfill) | ✅ Works |
| **Speech rate** | `PatchedUtterance.rate` | `useDirectLinePonyfillConnection.ts` | Ponyfill client-side | ✅ Works |
| **Speech pitch** | `PatchedUtterance.pitch` | `useDirectLinePonyfillConnection.ts` | Ponyfill client-side | ✅ Works |
| **Locale** | Server fetches token for locale; ponyfill uses it | `speechRoutes.ts` + hook | Azure Speech | ✅ Works |
| **Continuous recognition** | `styleOptions.speechRecognitionContinuous` | Web Chat config | Web Chat | ✅ Works |
| **Auto start mic** | `Ctrl+M` event dispatch after connection | Component JS | Client JS | ✅ Works |
| **Auto resume listening** | `Ctrl+M` after bot stops speaking | Component JS | Client JS | ✅ Works |
| **Barge-in** | `BargeInController` (Web Audio API) | Component JS | Client JS | ⚠️ Experimental |
| **Barge-in sensitivity** | `BargeInController` thresholds | Component JS | Client JS | ⚠️ Experimental |
| **Interim results** | Web Chat DictateComposer (not exposed) | — | Web Chat internal | ❌ Not wired |
| **Silence timeout** | Azure Speech SDK Recognizer (not exposed) | — | Azure STT internal | ❌ Not wired |

> **Important:** These settings are all **client-side in the React app** — they are NOT the Copilot Studio voice settings. Copilot Studio's Settings → Voice only applies to the Telephony/IVR channel (Tab 5). For web-based voice (Tabs 1 & 2), the settings panel gives equivalent control at the client level.

---

### 4.2 Tab 2: Proxy Bot

Same as Tab 1 for the client-side voice (ponyfill), but the messaging path goes through an intermediate bot:

```
Browser → Direct Line → Proxy Bot (Azure App Service) → Copilot Studio
                                   ↳ bot.ts receives message
                                   ↳ copilotClient.ts forwards to Copilot Studio
                                   ↳ Response flows back the same path
```

**Why a proxy bot?** Demonstrates middleware pattern — the proxy bot can intercept, log, transform, or enrich messages before they reach Copilot Studio. Useful for enterprises that need custom processing.

**Additional key files (beyond Tab 1):**

| File | Role |
|------|------|
| `proxy-bot/src/bot.ts` | `ProxyBot` class — receives DL messages, forwards to Copilot Studio |
| `proxy-bot/src/copilotClient.ts` | `CopilotClient` — manages DL conversation with Copilot Studio |
| `proxy-bot/src/index.ts` | Restify server + Bot adapter bootstrap |
| `server/src/routes/directLineRoutes.ts` | `/api/directline/proxyBotToken` — DL token for proxy bot |

---

### 4.3 Tab 3: DLS (Deprecated)

Architecture reference showing what Direct Line Speech was. DLS has been **deprecated** (Bot Framework SDK archived Jan 2026, DLS docs removed). Kept for educational contrast: DLS was a unified channel (single WebSocket for speech+messaging); the industry moved to Voice Live API (Tab 4) which replaces it.

---

### 4.4 Tab 4: Voice Live API

**What it does:** Next-generation voice integration. A single server-side WebSocket carries audio in/out with built-in STT, generative AI (GPT-4o/GPT-5/Phi), and TTS — no Speech SDK on the client, no Direct Line.

**Data flow:**
```
Browser (Web Audio API)         Express Server (:3001)           Azure Voice Live API
  │                                    │                           │
  │── WebSocket ──────────────────────▶│                           │
  │   (PCM audio as base64 JSON)       │── WebSocket ────────────▶│ wss://…/voice-live/realtime
  │                                    │   (relay with auth)       │
  │                                    │                           │ ← STT transcription
  │                                    │                           │ ← GPT-4o response
  │                                    │◀── response events ──────│ ← TTS audio chunks
  │◀── audio + transcript ───────────│                           │
```

**Key source files:**

| File | Role |
|------|------|
| `client/src/components/VoiceLiveAPI.tsx` | Full tab: WebSocket client, push-to-talk, settings, info sub-tabs |
| `server/src/routes/voiceLiveRoutes.ts` | WebSocket proxy: browser ↔ Azure VLA relay with auth injection |

---

### 4.5 Tab 5: Telephony / IVR (Detailed)

**What it does:** Phone-based bot interaction. A user calls a PSTN number, and the call routes through Azure Communication Services → LiveHub (AudioCodes) → Copilot Studio. No browser needed.

**Data flow:**
```
Phone (any)
  ↓ PSTN call
Azure Communication Services (Phone: +1 786-687-0264)
  ↓ SIP trunk
LiveHub / AudioCodes (Omnichannel orchestration)
  ↓ Direct Line + Bot Framework
Copilot Studio (Citizen Advice agent)
  ↔ Azure Speech Services (STT: caller voice → text, TTS: bot text → voice)
```

**Key source files:**

| File | Role |
|------|------|
| `client/src/components/TelephonyIVR.tsx` | Tab UI: QR code, click-to-call button (+1 786-687-0264), feature cards |
| `client/src/components/TelephonyInfoPanels.tsx` | Info sub-tabs: Architecture diagram, 7-step Connection Flow, Resources |
| `server/src/routes/directLineRoutes.ts` | `/api/directline/livehubToken` — DL token for LiveHub with caller phone as userId |
| `server/src/config/env.ts` | `config.liveHub.directLineSecret` (LIVEHUB_DIRECT_LINE_SECRET) |

**Voice settings — where each capability lives (Telephony channel):**

| Setting | Controlled By | Where Configured | Status |
|---------|--------------|-----------------|--------|
| **Voice name** | Copilot Studio → Settings → Voice | Copilot Studio portal | ✅ Server-side |
| **Barge-in** | Copilot Studio → Settings → Voice | Copilot Studio portal | ✅ Native |
| **Language/Locale** | Copilot Studio → Settings → Voice | Copilot Studio portal | ✅ Server-side |
| **STT (caller → text)** | Azure Speech Services (in pipeline) | Automatic via LiveHub | ✅ Server-side |
| **TTS (bot → voice)** | Azure Neural TTS (in pipeline) | Automatic via LiveHub | ✅ Server-side |
| **Call routing** | LiveHub routing rules | LiveHub portal | ✅ Configured |
| **Live agent handoff** | Copilot Studio topic + LiveHub queue | Both portals | ✅ Available |
| **Phone number** | Azure Communication Services | ACS portal | +1 (786) 687-0264 |
| **Speech rate/pitch** | Not directly configurable | Would need SSML in Copilot Studio | ⚠️ Limited |
| **Call transcripts** | Copilot Studio Analytics | Automatic | ✅ Available |

> **Key difference from Tabs 1 & 2:** In Telephony, all voice settings live in **Copilot Studio and the server-side pipeline**. In Tabs 1 & 2 (web-based), equivalent settings are controlled **client-side** in the React app via the VoiceSettingsPanel. Same concepts, parallel implementations.

---

## 5. Quick Reference — Settings Panel vs. Copilot Studio

| Capability | Web Voice (Tabs 1 & 2) | Telephony (Tab 5) | Voice Live API (Tab 4) |
|-----------|----------------------|-------------------|----------------------|
| **Voice selection** | VoiceSettingsPanel → ponyfill `speechSynthesisVoiceName` | Copilot Studio → Settings → Voice | `session.update` → `voice.name` (server config) |
| **Barge-in** | Custom `BargeInController` (Web Audio API, experimental) | Copilot Studio native | Native (echo cancellation + VAD built-in) |
| **Speech rate** | `PatchedUtterance.rate` in hook | SSML in Copilot Studio (limited) | Not applicable (server TTS) |
| **Speech pitch** | `PatchedUtterance.pitch` in hook | SSML in Copilot Studio (limited) | Not applicable (server TTS) |
| **Language** | Ponyfill locale + server token | Copilot Studio locale setting | WebSocket session config |
| **AI processing** | Copilot Studio (external) | Copilot Studio (external) | Built-in GPT-4o/5 (no Copilot Studio) |
| **STT engine** | Browser (Speech SDK ponyfill) | Azure Speech (server pipeline) | Azure VLA (server-side) |
| **TTS engine** | Browser (Speech SDK ponyfill) | Azure Speech (server pipeline) | Azure VLA (server-side) |

---

## 6. Running the Demo

### Prerequisites
- Node.js 18+
- Azure CLI logged in (`az login`)
- `.env` configured in `server/` (see `server/src/config/env.ts` for all variables)

### Quick Start
```bash
# Option 1: One-click (Windows)
start-demo.bat

# Option 2: Manual
# Terminal 1 — Server
cd server && npm run dev       # Starts on :3001

# Terminal 2 — Client
cd client && npm run dev       # Starts on :5173, proxies /api → :3001
```

### Environment Variables (server/.env)
```
SPEECH_REGION=eastus2
SPEECH_RESOURCE_ENDPOINT=https://thr505-dls-speech.cognitiveservices.azure.com
SPEECH_KEY=USE_AZURE_AD           # Uses DefaultAzureCredential
DIRECT_LINE_TOKEN_ENDPOINT=https://...  # Copilot Studio token endpoint
PROXY_BOT_DIRECT_LINE_SECRET=...  # For Tab 2
LIVEHUB_DIRECT_LINE_SECRET=...    # For Tab 5
```

### Demo Flow (recommended order)
1. **Tab 1 — Speech Ponyfill**: Show direct connection, change voice/rate/pitch in settings panel
2. **Tab 2 — Proxy Bot**: Same voice, different messaging path (middleware pattern)
3. **Tab 4 — Voice Live API**: Next-gen, push-to-talk, server-side everything
4. **Tab 5 — Telephony/IVR**: Scan QR code or dial the number, show transcript in Copilot Studio Analytics
5. **Wrap up**: Same Copilot Studio agent, 4 different channels — one agent, multiple experiences
