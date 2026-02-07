# THR505 - Integration and Branding Copilot Studio with Web Chat

## Demo Overview
Voice-enabled Copilot Studio integration demonstrating:
1. **Speech Ponyfill** - Direct Line + Azure Speech Services (primary for Copilot Studio)
2. **Direct Line Speech** - Unified voice channel (for Bot Framework bots)
3. **Telephony/IVR** - Azure Communication Services + D365 Contact Center

---

## Quick Start

```powershell
# Terminal 1 - Start Server
cd C:\Demos\THR505-Voice-Demo\server
npm run dev

# Terminal 2 - Start Client
cd C:\Demos\THR505-Voice-Demo\client
npm run dev

# Open browser
Start-Process "http://localhost:5173"
```

---

## Environment Setup

### Current Environment
- **Environment:** Contoso (default)
- **Environment ID:** Default-ba9da2c0-3331-4337-a775-ed8556d7b7e5
- **Copilot Studio:** https://copilotstudio.microsoft.com/environments/Default-ba9da2c0-3331-4337-a775-ed8556d7b7e5/bots
- **User:** josdel@MngEnvMCAP984650.onmicrosoft.com

### Pre-Demo Checklist
1. ✅ Import agent/solution to environment
2. ✅ Set authentication to **"No authentication"**
3. ✅ **Publish** the agent
4. ✅ Copy Direct Line token endpoint from Channels → Direct Line
5. ✅ Update `server/.env` with token endpoint
6. ✅ Start server and client

---

## Configuration

### Server Environment (`server/.env`)
```env
# Direct Line (from Copilot Studio Channels)
DIRECT_LINE_TOKEN_ENDPOINT=https://[env-id].environment.api.powerplatform.com/powervirtualagents/botsbyschema/[bot-id]/directline/token?api-version=2022-03-01-preview

# Speech Services
SPEECH_KEY=USE_AZURE_AD
SPEECH_REGION=eastus
SPEECH_RESOURCE_ENDPOINT=https://thr505-speech.cognitiveservices.azure.com

# Optional
BOT_NAME=THR505 Demo Agent
```

---

## The 3 Demo Activities

### Demo 1: Speech Ponyfill ⭐ (Primary)
**Tab:** 🔊 Speech Ponyfill

**Architecture:**
- Standard Direct Line connection to Copilot Studio
- Azure Speech Services adds voice via "ponyfill"
- Works with ANY Copilot Studio agent

**Demo Flow:**
1. Show WebChat loading and connecting
2. Type a message → Get text response
3. Click microphone → Speak → Get voice response
4. Bot speaks back (TTS)

**Talking Points:**
- "Uses standard Direct Line - works with any Copilot Studio agent"
- "Speech Services ponyfill adds voice without changing the bot"
- "Fully customizable UI with Bot Framework Web Chat"

---

### Demo 2: Direct Line Speech (Reference)
**Tab:** 🎤 Direct Line Speech

**Architecture:**
- Unified WebSocket for text AND speech
- Requires Bot Framework bot with DLS channel in Azure

**Key Difference:**
- Direct Line Speech ≠ Direct Line + Speech
- Requires explicit Azure Bot Service registration
- Best for voice-first Bot Framework scenarios

**Talking Points:**
- "Single WebSocket handles both modalities"
- "Requires Azure Bot Service with Direct Line Speech channel"
- "For Copilot Studio, use Speech Ponyfill instead"

---

### Demo 3: Telephony / IVR
**Tab:** 📞 Telephony / IVR

**Architecture:**
- Phone-based voice interaction
- Azure Communication Services handles telephony
- Dynamics 365 Contact Center for routing/agents

**Talking Points:**
- "Same Copilot Studio agent can serve web AND phone"
- "D365 Contact Center provides routing, queuing, live agents"
- "DTMF support for dial pad interactions"

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         YOUR WEB APP                            │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐ │
│  │ React UI    │    │ Bot WebChat │    │ Speech Ponyfill     │ │
│  └─────────────┘    └─────────────┘    └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
            │                  │                    │
            │                  ▼                    ▼
            │         ┌───────────────┐    ┌───────────────────┐
            │         │  Direct Line  │    │ Azure Speech      │
            │         │  Channel      │    │ Services          │
            │         └───────────────┘    └───────────────────┘
            │                  │
            │                  ▼
            │         ┌───────────────────────────────────────┐
            │         │        COPILOT STUDIO AGENT           │
            │         │  ┌─────────┐  ┌─────────┐  ┌───────┐ │
            │         │  │ Topics  │  │ Actions │  │ Gen AI│ │
            │         │  └─────────┘  └─────────┘  └───────┘ │
            │         └───────────────────────────────────────┘
            │                           │
            │                           ▼
            └──────────────────▶┌─────────────────┐
                                │   Telephony     │
                                │   (D365 / ACS)  │
                                └─────────────────┘
```

---

## Branding & Customization

### CSS Variables (`client/src/styles/index.css`)
```css
:root {
  --primary-color: #0078d4;      /* Brand color */
  --accent-color: #00bcf2;       /* Accent highlights */
}
```

### Web Chat Style Options
```javascript
const styleOptions = {
  accent: '#004b88',
  botAvatarInitials: 'CA',
  bubbleFromUserBackground: '#004b88',
  bubbleBackground: '#f0f0f0',
};
```

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| `IntegratedAuthenticationNotSupportedInChannel` | Agent has authentication enabled | Set to "No authentication" |
| `LatestPublishedVersionNotFound` | Agent not published | Click Publish in Copilot Studio |
| Cannot publish | Trial license limitations | Use environment with proper license |
| DLP blocks Direct Line | Corporate policy | Use different tenant/environment |
| "Connecting" forever (DLS) | DLS needs Bot Framework bot | Use Speech Ponyfill for Copilot Studio |
| Vite 504 error | Stale cache | Delete `node_modules/.vite` |

### Quick Reset
```powershell
taskkill /F /IM node.exe 2>$null
Start-Sleep -Seconds 2
cd C:\Demos\THR505-Voice-Demo\server; npm run dev
# New terminal:
cd C:\Demos\THR505-Voice-Demo\client; npm run dev
```

### Test Endpoints
```powershell
# Test Direct Line token
Invoke-RestMethod -Uri "http://localhost:3001/api/directline/token" -Method GET

# Test Speech token
Invoke-RestMethod -Uri "http://localhost:3001/api/speechservices/token" -Method GET
```

---

## Key Learnings

1. **Direct Line Speech ≠ Direct Line + Speech**
   - DLS is a unified channel requiring Azure Bot Service registration
   - For Copilot Studio, use Speech Ponyfill (DL + Speech Services)

2. **Copilot Studio Authentication**
   - Web chat requires "No authentication" for anonymous users
   - Authenticated scenarios need OAuth configuration

3. **Trial Tenant Limitations**
   - Some features require P1/P2 licenses
   - Publishing may be restricted by domain verification

---

## Project Structure
```
C:\Demos\THR505-Voice-Demo\
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── App.tsx        # Main app with mode selector
│   │   ├── components/    # WebChat, voice controls
│   │   ├── hooks/         # Connection hooks
│   │   └── styles/        # CSS
│   └── package.json
├── server/                 # Express.js backend
│   ├── src/
│   │   ├── index.ts       # Server entry
│   │   └── routes/        # Token endpoints
│   ├── .env               # Configuration
│   └── package.json
└── docs/                   # This documentation
    └── README.md
```

---

## Resources
- [Bot Framework Web Chat](https://github.com/microsoft/BotFramework-WebChat)
- [Copilot Studio Documentation](https://learn.microsoft.com/microsoft-copilot-studio/)
- [Azure Speech Services](https://learn.microsoft.com/azure/ai-services/speech-service/)
- [web-speech-cognitive-services](https://github.com/nicejobinc/web-speech-cognitive-services)
