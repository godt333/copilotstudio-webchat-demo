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

### Tab 2: Proxy Bot - Direct Line via Bot Middleware

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PROXY BOT TAB                                        │
│              (Direct Line via Proxy Bot + Speech SDK)                        │
└─────────────────────────────────────────────────────────────────────────────┘

                      ┌─────────────────────────┐
                      │    Azure Speech SDK     │
                      │   (web-speech-ponyfill) │
        🎤 Audio ────▶│       thr505-speech     │
        🔊 Audio ◀────│                         │
                      │   🇺🇸 en-US             │
                      └─────────────────────────┘
                                  │
                                  │ Text
                                  ▼
┌──────────────┐      ┌─────────────────────────┐      ┌──────────────────┐
│              │      │      Direct Line        │      │                  │
│  Web Client  │─────▶│   (Bot Framework)       │─────▶│   Proxy Bot      │──┐
│  (Browser)   │◀─────│  thr505-dls-proxy       │◀─────│ thr505-dls-proxy │  │
│              │      │                         │      │   (Azure Bot)    │  │
│              │      │   💬 Text Messages      │      └──────────────────┘  │
└──────────────┘      └─────────────────────────┘                            │
                                                        ┌──────────────────┐  │
                                                        │  Copilot Studio  │◀─┘
                                                        │      Agent       │
                                                        └──────────────────┘

📍 Direct Line connects to: PROXY BOT (Azure Bot Service)
📍 Proxy Bot forwards messages to: Copilot Studio Agent
📍 Enables: Custom middleware, logging, authentication, message transformation
```

### Tab 3: True DLS (Awaiting Azure Policy Exemption)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TRUE DLS TAB (IDEAL - Currently Blocked)                  │
│                  (Single WebSocket - Server-side Speech)                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌─────────────────────────┐      ┌──────────────────┐
│              │      │   Direct Line Speech    │      │                  │
│  Web Client  │═════▶│      Channel            │═════▶│   Proxy Bot      │──┐
│  (Browser)   │◀═════│   (SINGLE WebSocket)    │◀═════│ thr505-dls-proxy │  │
│              │      │                         │      │                  │  │
│              │      │   🎤 Audio (server STT) │      └──────────────────┘  │
│              │      │   🔊 Audio (server TTS) │                            │
│              │      │   💬 Messages           │      ┌──────────────────┐  │
│              │      │   (ALL UNIFIED)         │      │  Copilot Studio  │◀─┘
└──────────────┘      └─────────────────────────┘      │      Agent       │
                                                        └──────────────────┘

❌ BLOCKED: Requires isDefaultBotForCogSvcAccount = true
            Azure Policy enforces disableLocalAuth = true on Cognitive Services
📍 See docs/TRUE_DLS_AZURE_POLICY_BLOCKER.md for details
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

| Tab | Locale | Voice | Direct Line To | Proxy Bot? | Speech |
|-----|--------|-------|----------------|------------|--------|
| **Speech Ponyfill (US)** | en-US | Jenny | Copilot Studio | ❌ No | Client-side SDK |
| **Proxy Bot** | en-US | Jenny | **Proxy Bot** | ✅ Yes | Client-side SDK |
| **True DLS** | - | - | DLS Channel | ✅ Yes | Server-side (blocked) |
| **Telephony/IVR** | N/A | Phone | LiveHub | N/A | Phone audio |

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

-  **Text Chat** - Direct Line messaging with Citizen Advice agent
-  **Speech Ponyfill** - Microphone input + TTS responses (single playback)
-  **Call Modal** - QR code popup when clicking  Call button
-  **Telephony/IVR Tab** - QR code + call button for phone demo
-  **LiveHub IVR** - Phone integration via +1 (786) 687-0264

##  Resolved Issues

| Issue | Root Cause | Solution |
|-------|------------|----------|
| Speech recognition not working | Custom subdomain + disableLocalAuth incompatible with ponyfill | Reverted to simple `authorizationToken` + `region` approach |
| Duplicate TTS audio | React StrictMode double-mounting | Removed `<React.StrictMode>` from main.tsx |
| Desktop tel: link opens app selector | Browser default behavior | Changed to button with modal showing QR code |

