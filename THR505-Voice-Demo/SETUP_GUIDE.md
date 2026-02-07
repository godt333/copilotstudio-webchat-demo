# THR505 Voice Demo - Setup Guide

## 🎯 Overview

This project demonstrates voice-enabled web chat with Copilot Studio using the **Speech Ponyfill** approach.

## ✅ Current Status

| Component | Status |
|-----------|--------|
| Server (port 3001) | ✅ Running |
| Client (port 5173) | ✅ Running |
| Speech Token (Azure AD) | ✅ Working |
| Direct Line Token | ⏳ Needs Copilot Studio Agent |

## 🚀 Quick Start (When You Return)

### 1. Create Your Copilot Studio Agent

1. Go to [Copilot Studio](https://copilotstudio.microsoft.com)
2. Sign in with: `Jose@MngEnvMCAP547668.onmicrosoft.com`
3. Create a new agent (or use an existing one)
4. **IMPORTANT**: Go to **Settings** → **Security** → **Authentication** → Select **"No authentication"**
5. Go to **Channels** → **Mobile app & Direct Line**
6. Copy the **Token endpoint** URL

### 2. Update the .env File

Edit `C:\Demos\THR505-Voice-Demo\server\.env`:

```env
# Replace this line:
DIRECT_LINE_TOKEN_ENDPOINT=https://YOUR_ENVIRONMENT.fc.environment.api.powerplatform.com/powervirtualagents/botsbyschema/YOUR_AGENT_ID/directline/token?api-version=2022-03-01-preview

# With your actual token endpoint from Copilot Studio
```

### 3. Restart the Server

```powershell
# In the server PowerShell window, press Ctrl+C and run:
npm run dev
```

### 4. Test the App

1. Open http://localhost:5173
2. Make sure you're on the **Speech Ponyfill** tab
3. Type a message and verify the bot responds
4. Click the 🎤 microphone button to test voice

## 📁 Project Structure

```
THR505-Voice-Demo/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── SpeechPonyfillChat.tsx    # Main voice chat component
│   │   │   └── DirectLineSpeechChat.tsx  # Alternative (Azure Bot only)
│   │   ├── hooks/
│   │   │   └── useDirectLinePonyfillConnection.ts
│   │   └── services/
│   │       └── api.ts
│   └── package.json
├── server/                 # Express.js backend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── speechRoutes.ts    # Speech token endpoints
│   │   │   └── directLineRoutes.ts # Direct Line token endpoints
│   │   └── index.ts
│   ├── .env               # Your configuration
│   └── package.json
└── SETUP_GUIDE.md         # This file
```

## 🔧 Azure Resources Used

| Resource | Details |
|----------|---------|
| Speech Service | `thr505-speech` in `rg-thr505-demo` |
| Custom Subdomain | `thr505-speech.cognitiveservices.azure.com` |
| Authentication | Azure AD (Cognitive Services Speech User role) |
| Region | East US |

## 🎙️ Voice Features

The Speech Ponyfill approach provides:
- ✅ **Speech-to-Text**: Click mic → speak → bot receives text
- ✅ **Text-to-Speech**: Bot responses are read aloud
- ✅ **Works with Copilot Studio** (unlike Direct Line Speech)

## 🛠️ Troubleshooting

### "IntegratedAuthenticationNotSupportedInChannel" Error
→ Your Copilot Studio agent has authentication enabled. Change it to **"No authentication"** and republish.

### Speech token fails
→ Make sure you're logged into Azure CLI: `az login`
→ Verify you have "Cognitive Services Speech User" role on the Speech resource

### Server won't start (port in use)
```powershell
# Find and kill process on port 3001
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force
```

## 📞 Reference Repos

The workspace includes these repos for reference:
- **BotFramework-WebChat** - Official Web Chat component
- **BotFramework-WebChat-compulim** - Compulim's fork with samples
- **botframework-sdk** - Bot Framework SDK docs
- **Agents** - Microsoft Agents samples

---

**Ready to demo! 🎉** Just add your Copilot Studio token endpoint and you're set.
