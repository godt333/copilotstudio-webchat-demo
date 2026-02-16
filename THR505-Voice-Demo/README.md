# THR505 Demo: Voice Web Client for Copilot Studio

A complete demo solution showcasing how to integrate a **voice-enabled Copilot Studio agent** into a branded web chat experience with audio capabilities.

## 🎯 Purpose

This solution demonstrates:
1. **Web-based voice chat** with an existing Copilot Studio agent using Direct Line Speech
2. **Alternative voice integration** using Speech Ponyfill (Direct Line + Azure Speech Services)
3. **Backend APIs** for secure token issuance
4. **Telephony IVR integration** concepts via LiveHub + AudioCodes

## 📁 Project Structure

```
THR505 Demo/
├── client/                    # React + TypeScript SPA
│   ├── src/
│   │   ├── components/        # Web Chat components
│   │   ├── hooks/             # Connection hooks
│   │   ├── services/          # API services
│   │   ├── styles/            # CSS styles
│   │   ├── App.tsx            # Main app component
│   │   └── main.tsx           # Entry point
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                    # Node.js + Express backend
│   ├── src/
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Express middleware
│   │   ├── config/            # Environment config
│   │   └── index.ts           # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                      # Documentation
│   ├── VOICE_SETUP.md         # Copilot Studio voice configuration
│   ├── SPEECH_PONYFILL.md     # Speech Ponyfill guide
│   └── TELEPHONY_IVR_LIVEHUB.md  # Telephony IVR integration
│
├── .env.example               # Environment variables template
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Azure subscription with:
  - Azure Speech Services resource
  - Copilot Studio agent with Direct Line Speech enabled
- VS Code (recommended)

### 1. Clone and Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `server/` directory based on `.env.example`:

```bash
cd server
cp ../.env.example .env
# Edit .env with your actual values
```

Required variables:
- `SPEECH_KEY` - Azure Speech Services subscription key
- `SPEECH_REGION` - Azure Speech Services region (e.g., `westus2`)
- `DIRECT_LINE_SECRET` - Direct Line secret from Copilot Studio
- `LIVEHUB_DIRECT_LINE_SECRET` - (Optional) Separate secret for LiveHub telephony

### 3. Run Locally

**Terminal 1 - Start the backend:**
```bash
cd server
npm run dev
```
Server runs at `http://localhost:3001`

**Terminal 2 - Start the frontend:**
```bash
cd client
npm run dev
```
Client runs at `http://localhost:5173`

### 4. Test the Demo

1. Open `http://localhost:5173` in your browser
2. Select either **Direct Line Speech** or **Speech Ponyfill** mode
3. Click the microphone button and speak to your Copilot Studio agent
4. The agent's voice responses will play through your speakers

## 🔑 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/speechservices/token` | GET | Returns Direct Line Speech token + region |
| `/api/speechservices/ponyfillKey` | GET | Returns Speech Services token for ponyfill |
| `/api/directline/token` | GET | Returns Direct Line token for standard connection |
| `/api/directline/livehubToken` | GET | Returns Direct Line token for LiveHub telephony |

## 📖 Documentation

- [Voice Setup Guide](docs/VOICE_SETUP.md) - Configure Copilot Studio for voice
- [Speech Ponyfill Guide](docs/SPEECH_PONYFILL.md) - Alternative voice integration
- [Telephony IVR Guide](docs/TELEPHONY_IVR_LIVEHUB.md) - LiveHub + AudioCodes integration

## 🌐 Deploy to Azure

### Option A: Azure App Service (Full Stack)

1. Create an Azure App Service (Node.js 18 LTS)
2. Configure App Settings with your environment variables
3. Build the client: `cd client && npm run build`
4. Copy `client/dist` to `server/public`
5. Deploy the server folder to App Service

### Option B: Static Web Apps + App Service

1. Deploy `client/` to Azure Static Web Apps
2. Deploy `server/` to Azure App Service
3. Configure CORS in the backend to allow the Static Web Apps domain
4. Update client API base URL to point to the App Service

## 🎤 Demo Scenarios

### Scenario 1: Direct Line Speech Mode
- Single unified channel for text + speech
- Uses Azure Cognitive Services Speech SDK under the hood
- Best for new integrations requiring voice

### Scenario 2: Speech Ponyfill Mode
- Separate Direct Line for messages + Speech Services for voice
- Works with existing Direct Line bots
- More flexibility for custom speech configuration

### Scenario 3: Telephony IVR (Conceptual)
- Same Copilot Studio agent accessible via phone
- LiveHub + AudioCodes for voice connectivity
- Uses the `/api/directline/livehubToken` endpoint

## 🏗️ Architecture Diagrams

### Tab 1: Speech Ponyfill (US) - `en-US, Jenny`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SPEECH PONYFILL TAB (US English)                          │
│                         Voice: en-US-JennyNeural                             │
└─────────────────────────────────────────────────────────────────────────────┘

                      ┌─────────────────────────┐
                      │    Azure Speech SDK     │
                      │   (web-speech-ponyfill) │
        🎤 Audio ────▶│       thr505-speech     │
        🔊 Audio ◀────│                         │
                      │   🇺🇸 en-US, Jenny      │
                      └─────────────────────────┘
                                  │
                                  │ Text
                                  ▼
┌──────────────┐      ┌─────────────────────────┐      ┌──────────────────┐
│              │      │      Direct Line        │      │                  │
│  Web Client  │─────▶│   (Copilot Token URL)   │─────▶│  Copilot Studio  │
│  (Browser)   │◀─────│                         │◀─────│      Agent       │
│              │      │   💬 Text Messages      │      │                  │
└──────────────┘      └─────────────────────────┘      └──────────────────┘

📍 Token Endpoint: Copilot Studio Direct Line Token URL
📍 Speech: en-US, JennyNeural voice
📍 NO proxy bot - connects directly to Copilot Studio
```

### Tab 2: Proxy Bot - Direct Line via Bot Middleware ✅ WORKING

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PROXY BOT TAB (WORKING)                              │
│              (Direct Line via Proxy Bot + Speech SDK)                        │
└─────────────────────────────────────────────────────────────────────────────┘

                      ┌─────────────────────────┐
                      │    Azure Speech SDK     │
                      │   (web-speech-ponyfill) │
        🎤 Audio ────▶│       thr505-speech     │
        🔊 Audio ◀────│                         │
                      │   🇺🇸 en-US, Jenny      │
                      └─────────────────────────┘
                                  │
                                  │ Text
                                  ▼
┌──────────────┐      ┌─────────────────────────┐      ┌──────────────────┐
│              │      │      Direct Line        │      │                  │
│  Web Client  │─────▶│   (Bot Framework)       │─────▶│   Proxy Bot      │──┐
│  (Browser)   │◀─────│  thr505-dls-proxy       │◀─────│ thr505-dls-proxy │  │
│              │      │                         │      │ (Azure App Svc)  │  │
│              │      │   💬 Text Messages      │      └──────────────────┘  │
└──────────────┘      └─────────────────────────┘                            │
                                                        ┌──────────────────┐  │
                                                        │  Copilot Studio  │◀─┘
                                                        │      Agent       │
                                                        └──────────────────┘

📍 Direct Line connects to: PROXY BOT (Azure Bot Service)
📍 Proxy Bot forwards messages to: Copilot Studio Agent
📍 Enables: Custom middleware, logging, authentication, message transformation
📍 Status: ✅ WORKING (Fixed Feb 6, 2026 - Service Principal created)
```

### Tab 3: Direct Line Speech (Bot Framework) ⛔ BLOCKED

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              DIRECT LINE SPEECH TAB (BLOCKED BY AZURE POLICY)                │
│                  (Single WebSocket - Server-side Speech)                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌─────────────────────────┐      ┌──────────────────┐
│              │      │   Direct Line Speech    │      │                  │
│  Web Client  │══X══▶│      Channel            │══X══▶│   Proxy Bot      │──┐
│  (Browser)   │◀══X══│   (SINGLE WebSocket)    │◀══X══│ thr505-dls-proxy │  │
│              │      │                         │      │                  │  │
│              │      │   🎤 Audio (server STT) │      └──────────────────┘  │
│              │      │   🔊 Audio (server TTS) │                            │
│              │      │   💬 Messages           │      ┌──────────────────┐  │
│              │      │   (ALL UNIFIED)         │      │  Copilot Studio  │◀─┘
└──────────────┘      └─────────────────────────┘      │      Agent       │
                                                        └──────────────────┘

⛔ BLOCKED: Azure Policy "MCAPSGovDeployPolicies" at Management Group level
   enforces disableLocalAuth=true on ALL Cognitive Services resources.
   This prevents setting isDefaultBotForCogSvcAccount=true on DLS channel.
📍 See docs/TRUE_DLS_AZURE_POLICY_BLOCKER.md for details
📍 Workaround: Use Tab 2 (Proxy Bot) which achieves same functionality!
```

### Tab 4: Telephony / IVR

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TELEPHONY / IVR TAB                                  │
│                    (Phone-based - LiveHub/PSTN)                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌─────────────────────────┐      ┌──────────────────┐
│              │      │        LiveHub          │      │                  │
│  Phone/PSTN  │─────▶│   (Azure Comm Svc)      │─────▶│  Copilot Studio  │
│  📞 Caller   │◀─────│   + Contact Center      │◀─────│      Agent       │
│              │      │                         │      │                  │
│              │      │   🎤 Phone Audio        │      │                  │
│              │      │   🔊 Phone Audio        │      │                  │
└──────────────┘      └─────────────────────────┘      └──────────────────┘
                                  │
                                  ▼
                      ┌─────────────────────────┐
                      │     Live Agent          │
                      │   (Handoff possible)    │
                      └─────────────────────────┘

📍 This tab is a SIMULATOR - demonstrates phone call flow
📍 Real calls go through LiveHub → Copilot Studio
📍 Phone: +1 (786) 687-0264
```

### Architecture Summary Table

| Tab | Locale | Voice | Direct Line To | Proxy Bot? | Speech | Status |
|-----|--------|-------|----------------|------------|--------|--------|
| **Tab 1: Speech Ponyfill** | en-US | Jenny | Copilot Studio | ❌ No | Client-side SDK | ✅ Working |
| **Tab 2: Proxy Bot** | en-US | Jenny | **Proxy Bot** | ✅ Yes | Client-side SDK | ✅ Working |
| **Tab 3: Direct Line Speech** | - | - | DLS Channel | ✅ Yes | Server-side | ⛔ Blocked |
| **Tab 4: Telephony/IVR** | N/A | Phone | LiveHub | N/A | Phone audio | ✅ Working |

## 🛠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| "No audio" | Check browser microphone permissions |
| "Connection failed" | Verify Direct Line secret and Speech key |
| "Token expired" | Tokens auto-refresh; check backend logs |
| CORS errors | Ensure backend CORS is configured for client origin |

## 📜 License

This demo is provided for educational purposes as part of TechReady THR505.

---

**Session:** THR505 - Integrating and branding Copilot Studio with web chat  
**Speakers:** [Your Name]  
**Event:** Microsoft TechReady / TechConnect


##  Current Configuration (AskAIvNextTest Environment)

| Setting | Value |
|---------|-------|
| **Environment** | AskAIvNextTest (tenant: MngEnvMCAP984650) |
| **Agent** | Citizen Advice |
| **Agent Schema** | `copilots_header_79c18` |
| **Direct Line Token Endpoint** | `https://a70672e8c413ec758ecae6c97f4593.06.environment.api.powerplatform.com/powervirtualagents/botsbyschema/copilots_header_79c18/directline/token?api-version=2022-03-01-preview` |
| **LiveHub Phone Number** | +1 (786) 687-0264 |
| **Server Port** | 3001 |
| **Client Port** | 5173 |

##  Key Files Reference

### Server (`server/`)
| File | Purpose |
|------|---------|
| `src/index.ts` | Express server entry point |
| `src/routes/api.ts` | API routes for tokens |
| `.env` | Environment variables |

### Client (`client/`)
| File | Purpose |
|------|---------|
| `src/App.tsx` | Main app with mode selector (Text/Voice/IVR) |
| `src/main.tsx` | Entry point (StrictMode removed for TTS fix) |
| `src/components/TextChat.tsx` | Text-only chat component |
| `src/components/SpeechPonyfillChat.tsx` | Voice chat + Call modal with QR code |
| `src/components/TelephonyIVR.tsx` | IVR tab with QR code + call options |
| `src/hooks/useDirectLineConnection.ts` | Text chat connection hook |
| `src/hooks/useDirectLinePonyfillConnection.ts` | Voice + Direct Line hook (uses `authorizationToken` + `region`) |
| `src/styles/index.css` | All CSS including modal styles |

### Documentation (`docs/`)
| File | Purpose |
|------|---------|
| `TROUBLESHOOTING.md` | Common issues & solutions |
| `SPEECH_PONYFILL.md` | Speech ponyfill approach explained |
| `VOICE_SETUP.md` | Voice configuration guide |
| `TELEPHONY_IVR_LIVEHUB.md` | LiveHub IVR setup guide |
| `DEMO_SETUP_NEW_ENVIRONMENT.md` | Environment setup instructions |

##  Working Features

-  **Tab 1: Speech Ponyfill** - Microphone input + TTS responses (single playback)
-  **Tab 2: Proxy Bot** - Direct Line via Proxy Bot → Copilot Studio (with voice!)
-  **Tab 3: Direct Line Speech** - Info panel explaining Azure Policy blocker
-  **Tab 4: Telephony/IVR** - QR code + call button for phone demo
-  **LiveHub IVR** - Phone integration via +1 (786) 687-0264
-  **Side-by-Side Mode** - Compare Proxy Bot vs Speech Ponyfill

## ⚙️ Voice Settings Panel — Configuration Matrix

**FROZEN: Feb 6, 2026**

Both Tab 1 (Speech Ponyfill) and Tab 2 (Proxy Bot) share the same ponyfill-based
architecture and the same settings. The Voice Settings Panel exposes all these
settings, but not all are wirable due to API limitations.

### Settings Status

| Setting | Where It's Set | Service Layer | Status | Notes |
|---------|---------------|---------------|--------|-------|
| **Locale** | Server token endpoint → ponyfill credentials | **Azure TTS** | ✅ Working | Changing locale triggers reconnect. Server fetches region-appropriate token. |
| **Voice** | Hook → `speechSynthesisVoiceName` | **Azure TTS** | ✅ Working | e.g. `en-US-JennyNeural`, `en-GB-SoniaNeural`. Changing triggers reconnect. |
| **Speech Rate** | Hook → `PatchedUtterance.rate` | **Ponyfill** | ✅ Working | Wraps `SpeechSynthesisUtterance` constructor. Range: 0.1–10 (1.0 = normal). |
| **Speech Pitch** | Hook → `PatchedUtterance.pitch` | **Ponyfill** | ✅ Working | Same wrapper. Range: 0–2 (1.0 = normal). |
| **Continuous Recognition** | Component → `styleOptions.speechRecognitionContinuous` | **Web Chat** | ✅ Working | When true, mic stays open after each utterance (natural conversation mode). |
| **Auto-Start Mic** | Component → `Ctrl+M` event after connect | **Client JS** | ✅ Working | Dispatches synthetic keyboard event 500ms after connection established. |
| **Auto-Resume Listening** | Component → `Ctrl+M` after speaking→idle | **Client JS** | ✅ Working | Watches `speechActivity` state; when transitions from `speaking` to `idle`, sends `Ctrl+M` after 300ms. |
| **Barge-In Enabled** | Component → `BargeInController.setConfig()` | **Client JS** | ⚠️ Experimental | BargeInController monitors mic volume via Web Audio API. Calls `speechSynthesis.cancel()` on ponyfill instance. |
| **Barge-In Sensitivity** | Component → `BargeInController.setConfig()` | **Client JS** | ⚠️ Experimental | Presets: `low` (threshold 0.5, delay 500ms), `medium` (0.3, 200ms), `high` (0.15, 50ms). |
| **Interim Results** | _Not wired_ | **Web Chat** | ❌ N/A | Controlled by Web Chat's internal `DictateComposer`. No public API to toggle. |
| **Silence Timeout** | _Not wired_ | **Azure STT** | ❌ N/A | Controlled by Azure Speech SDK's recognizer. Would need direct SDK access (not available through ponyfill). |

### Service Layer Legend

| Layer | What It Is | Where Settings Are Applied |
|-------|-----------|---------------------------|
| **Azure TTS** | Azure Speech Services Text-to-Speech | Token fetched server-side; audio rendered client-side by ponyfill |
| **Azure STT** | Azure Speech Services Speech-to-Text | Recognizer created internally by ponyfill; config not exposed |
| **Ponyfill** | `web-speech-cognitive-services` v7.1.3 | Wraps Azure SDK as a Web Speech API ponyfill for Web Chat |
| **Web Chat** | `botframework-webchat` v4.18.0 | React component with `styleOptions` and Redux store |
| **Client JS** | Custom React code in components/hooks | `useEffect` hooks, keyboard events, `BargeInController` class |
| **Copilot Studio** | The Copilot Studio agent (cloud) | Handles conversation logic; voice settings under Settings → Voice |
| **Copilot Agent** | Same as Copilot Studio agent | Agent-level settings: barge-in, auto-resume, latency messages, SSML |

### Where Would Each Setting Be Configured in a Production System?

| Setting | Client-Side | Azure Speech Services | Copilot Studio Agent | Bot Framework |
|---------|------------|----------------------|---------------------|--------------|
| Locale | ✅ Token request | ✅ Resource region | ✅ Agent language | - |
| Voice name | ✅ Ponyfill config | ✅ Voice gallery | ✅ Settings → Voice | - |
| Speech rate | ✅ Utterance.rate | ✅ SSML `<prosody>` | ✅ SSML in agent | - |
| Speech pitch | ✅ Utterance.pitch | ✅ SSML `<prosody>` | ✅ SSML in agent | - |
| Barge-in | ✅ Custom controller | - | ✅ Settings → Voice | ✅ DLS channel |
| Continuous mic | ✅ styleOptions | - | - | ✅ inputHint |
| Silence timeout | - | ✅ Recognizer config | ✅ Settings → Voice | ✅ DLS channel |
| Interim results | - | ✅ Recognizer config | - | - |
| Auto-resume | ✅ Custom JS | - | ✅ Settings → Voice | ✅ inputHint |
| SSML output | - | ✅ SSML format | ✅ Agent responses | ✅ speak property |

### Barge-In: Architecture Notes

The barge-in implementation is **experimental** due to architectural constraints:

1. **Detection** works via `BargeInController` — monitors mic volume with Web Audio API
2. **TTS cancellation** calls `speechSynthesis.cancel()` on the **ponyfill's own instance**
   (exposed via `speechSynthesisRef` from both hooks)
3. **Limitation**: The middleware cannot call `dispatch()` into Web Chat's Redux store
   (causes re-entrant "Render error" crash), so Web Chat's internal speaking state
   may not update immediately after cancel
4. **Browser restriction**: `AudioContext` may start suspended; the controller has a
   late-initialization fallback but it's not guaranteed to work in all browsers

For production barge-in, consider:
- **True Direct Line Speech** (handles barge-in server-side, blocked by Azure Policy here)
- **Copilot Studio native voice** (Settings → Voice → Enable barge-in)
- **Custom Speech SDK recognizer** with direct access to start/stop controls

##  Resolved Issues

| Issue | Root Cause | Solution | Date |
|-------|------------|----------|------|
| Speech recognition not working | Custom subdomain + disableLocalAuth incompatible with ponyfill | Reverted to simple `authorizationToken` + `region` approach | Feb 4, 2026 |
| Duplicate TTS audio | React StrictMode double-mounting | Removed `<React.StrictMode>` from main.tsx | Feb 4, 2026 |
| Desktop tel: link opens app selector | Browser default behavior | Changed to button with modal showing QR code | Feb 4, 2026 |
| True DLS blocked by Azure Policy | MCAPSGovDeployPolicies enforces `disableLocalAuth=true` | Pivoted Tab 2 to use Proxy Bot with client-side speech | Feb 6, 2026 |
| Proxy Bot deployment failing | Missing node_modules on Azure | Used `quick-deploy.zip` with `SCM_DO_BUILD_DURING_DEPLOYMENT=true` | Feb 6, 2026 |
| Proxy Bot AADSTS7000229 error | App Registration missing Service Principal | Created SP via `az ad sp create --id 632aab43-...` | Feb 6, 2026 |
| speechRate / speechPitch not applied | Values logged but never set on utterance | Created `PatchedUtterance` wrapper that sets `.rate` and `.pitch` | Feb 6, 2026 |
| continuousRecognition not applied (Tab 2) | `styleOptions` was hardcoded, not reading settings | Made `styleOptions` dynamic via `useMemo` from `ponyfillSettings` | Feb 6, 2026 |
| autoResumeListening not applied | Setting defined but never used in any effect | Added `useEffect` watching `speechActivity` transition speaking→idle | Feb 6, 2026 |
| BargeInController null at store creation | Created async inside `.then()` callback | Changed to synchronous `useRef(new BargeInController())` | Feb 6, 2026 |
| Barge-in calling wrong speechSynthesis | Called `window.speechSynthesis.cancel()` (browser native) | Exposed ponyfill's `speechSynthesis` via `speechSynthesisRef` from hooks | Feb 6, 2026 |
| Middleware dispatch caused Render error | `dispatch()` inside middleware re-enters Web Chat store | Removed all `dispatch()` calls; use `onStopSpeaking` callback only | Feb 6, 2026 |

## ⚠️ Known Limitations (Frozen Feb 6, 2026)

| Feature | Issue | Why |
|---------|-------|-----|
| Barge-in | Experimental — may not trigger consistently | AudioContext browser restrictions; volume threshold tuning needed |
| Interim Results | Setting displayed but non-functional | Web Chat's DictateComposer controls this internally; no public API |
| Silence Timeout | Setting displayed but non-functional | Azure Speech SDK recognizer controls this; not exposed through ponyfill |
| Barge-in UI state | "Speaking" indicator may persist after cancel | Cannot dispatch into Web Chat store from middleware without crash |

