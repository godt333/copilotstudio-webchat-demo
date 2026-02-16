# THR505 Voice Demo - Setup Guide

## 🎯 Overview

This project demonstrates **voice-enabled web chat with Copilot Studio** using multiple approaches — Speech Ponyfill, a Proxy Bot middleware, Telephony/IVR, and more.

## ✅ Current Status (Updated February 9, 2026)

| Component | Status | Notes |
|-----------|--------|-------|
| Server (port 3001) | ✅ Working | Serves tokens for all tabs |
| Client (port 5173) | ✅ Working | 6-tab demo interface |
| Tab 1: 🔊 Speech Ponyfill | ✅ Working | Direct to Copilot + Speech SDK |
| Tab 2: 🤖 Proxy Bot | ✅ Working | Via Proxy Bot + Speech SDK |
| Tab 3: ⚡ DLS (Deprecated) | ⛔ Archived | Architecture reference only |
| Tab 4: 🎙️ Voice Live API | 📘 Info | Next-gen replacement for DLS |
| Tab 5: 📞 Telephony / IVR | ✅ Working | Phone demo (+1 786-687-0264) |
| Tab 6: ⚖️ Side-by-Side | ✅ Working | Compares Ponyfill vs Proxy Bot |

## 🚀 Quick Start (For Demo Handoff)

> **Everything is pre-configured. No Azure portal access needed.**

### Prerequisites
- **Node.js 18+** installed
- **Edge or Chrome** browser (for microphone access)

### Step 1 — Install Dependencies (one-time)

Open a terminal in the project root folder and run:

```powershell
cd server  && npm install && cd ..
cd client  && npm install && cd ..
```

### Step 2 — Start Both Servers

**Option A — Double-click:**
Run `start-demo.bat` from the project root. It opens two terminal windows automatically.

**Option B — Manual:**
```powershell
# Terminal 1 — Server
cd server
npm run dev
# Wait until you see "Server running on port 3001"

# Terminal 2 — Client
cd client
npm run dev
# Wait until you see "Local: http://localhost:5173"
```

### Step 3 — Open the Demo

Browse to **http://localhost:5173** and use the tabs across the top to switch between demo modes.

### Step 4 — Test Voice

1. Click the 🎤 microphone button on Tab 1 (Speech Ponyfill) or Tab 2 (Proxy Bot)
2. Speak a question — the bot will respond with text and voice
3. Make sure your browser has microphone permission enabled

## 📁 Project Structure

```
THR505-Voice-Demo/
├── start-demo.bat              # One-click launcher (relative paths)
├── SETUP_GUIDE.md              # This file
├── THR505-Voice-Demo.code-workspace
│
├── client/                     # React + Vite frontend (port 5173)
│   ├── src/
│   │   ├── App.tsx                          # Main app — tab router
│   │   ├── components/
│   │   │   ├── SpeechPonyfillChat.tsx       # Tab 1: Ponyfill voice chat
│   │   │   ├── DirectLineSpeechChat.tsx     # Tab 2: Proxy Bot voice chat
│   │   │   ├── TrueDLSChat.tsx             # Tab 3: DLS architecture ref
│   │   │   ├── VoiceLiveAPI.tsx            # Tab 4: Voice Live API info
│   │   │   ├── TelephonyIVR.tsx            # Tab 5: Telephony/IVR demo
│   │   │   ├── CodePanel.tsx               # Inline code viewer
│   │   │   ├── DebugPanel.tsx              # Debug overlay
│   │   │   ├── VoiceSettingsPanel.tsx      # Voice settings
│   │   │   ├── PonyfillInfoPanels.tsx      # Tab 1 info panels
│   │   │   ├── ProxyBotInfoPanels.tsx      # Tab 2 info panels
│   │   │   ├── TelephonyInfoPanels.tsx     # Tab 5 info panels
│   │   │   └── KeyboardShortcuts.tsx       # Shortcut help modal
│   │   ├── hooks/
│   │   │   ├── useDirectLinePonyfillConnection.ts
│   │   │   ├── useDirectLineSpeechConnection.ts
│   │   │   └── useDirectLineSpeechConnectionDLS.ts
│   │   ├── services/api.ts
│   │   ├── styles/index.css
│   │   └── utils/
│   └── package.json
│
├── server/                     # Express.js backend (port 3001)
│   ├── .env                    # ⚠️ Contains all API keys — DO NOT share publicly
│   ├── src/
│   │   ├── index.ts
│   │   ├── config/env.ts       # Reads .env values
│   │   ├── routes/
│   │   │   ├── speechRoutes.ts      # /api/speechservices/token
│   │   │   ├── directLineRoutes.ts  # /api/directline/token + proxyBotToken
│   │   │   └── voiceLiveRoutes.ts   # Voice Live API routes
│   │   └── middleware/errorHandler.ts
│   └── package.json
│
├── proxy-bot/                  # Azure-deployed proxy bot (already running)
│   ├── .env                    # Bot registration credentials
│   ├── src/                    # TypeScript source
│   └── package.json
│
└── docs/                       # Architecture & troubleshooting docs
    ├── TROUBLESHOOTING.md
    ├── VOICE_SETUP.md
    ├── SPEECH_PONYFILL.md
    ├── TELEPHONY_IVR_LIVEHUB.md
    └── ...
```

## 🔧 Azure Resources (Pre-configured)

All keys are already in `server/.env` and `proxy-bot/.env`. **No Azure login required.**

| Resource | Details |
|----------|---------|
| Speech Service | `thr505-dls-speech` in `rg-thr505-demo` (East US) |
| Proxy Bot (App Service) | `thr505-dls-proxy-bot.azurewebsites.net` |
| Azure Bot Registration | `thr505-dls-proxy` (App ID: `632aab43-...`) |
| Copilot Studio Agent | Citizen Advice Agent in AskAIvNextTest |
| Communication Services | PSTN: +1 (786) 687-0264 |

> **When would you need Azure access?** Only if API keys get rotated, the Copilot Studio agent is modified, or the proxy bot App Service needs redeployment.

## 🎙️ Voice Features

Tabs 1 (Speech Ponyfill) and 2 (Proxy Bot) both provide:
- ✅ **Speech-to-Text**: Click mic → speak → bot receives text
- ✅ **Text-to-Speech**: Bot responses are read aloud
- ✅ **Works with Copilot Studio** (Tab 1 direct, Tab 2 via Proxy)

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+L` | Clear chat |
| `Ctrl+D` | Toggle debug panel |
| `Ctrl+S` | Toggle sound effects |
| `?` | Show shortcuts help |

## 🛠️ Troubleshooting

### "IntegratedAuthenticationNotSupportedInChannel" Error
→ The Copilot Studio agent has authentication enabled. It must be set to **"No authentication"** in Settings → Security → Authentication.

### Speech token fails / voice not working
→ The server uses a **key-based** token (`SPEECH_KEY` in `server/.env`). No Azure CLI login is required.
→ If the key has been rotated, you'd need to get a new one from the Azure Portal → Speech resource → Keys.

### Server won't start (port in use)
```powershell
# Find and kill process on port 3001
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force
```

### Client won't start (port in use)
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
```

### Proxy Bot tab not working
→ The proxy bot runs on Azure App Service (`thr505-dls-proxy-bot.azurewebsites.net`). If it's stopped, restart it from Azure Portal or ask the project owner.

---

## 📅 Key Dates

| Date | Event |
|------|-------|
| Feb 4, 2026 | Proxy bot deployed to Azure |
| Feb 6, 2026 | Speech key auth enabled (policy exemption), service principal created |
| Feb 7, 2026 | Code frozen — rollback snapshot created |
| Feb 9, 2026 | Handoff package prepared |
| **Feb 12, 2026** | **Demo day** |

---

**Ready to demo! 🎉** Tabs 1 and 2 are fully functional voice demos. Tabs 3–5 are informational/reference.
