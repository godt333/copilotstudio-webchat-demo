# Azure Configuration Reference

**Last Updated:** February 5, 2026  
**Status:** ⚠️ Partially Working

---

## Subscription & Tenant

| Property | Value |
|----------|-------|
| **Tenant ID** | `ba9da2c0-3331-4337-a775-ed8556d7b7e5` |
| **Subscription** | Use your active Azure subscription |

---

## Azure Speech Services

| Property | Value |
|----------|-------|
| **Resource Name** | Check with: `az cognitiveservices account list --query "[?kind=='SpeechServices']"` |
| **Region** | `eastus` |
| **Auth Method** | Azure AD (SPEECH_KEY=USE_AZURE_AD) |

---

## Copilot Studio Agent

| Property | Value |
|----------|-------|
| **Agent Name** | Citizen Advice |
| **Token Endpoint** | Configured in `.env` as `COPILOT_STUDIO_TOKEN_ENDPOINT` |
| **Languages** | English (configure Spanish/French in Copilot Studio → Settings → Languages, then **Publish**) |

---

## Server Configuration (.env)

```env
# Server runs on port 3001
PORT=3001

# Speech Services - Uses Azure AD authentication
SPEECH_KEY=USE_AZURE_AD
SPEECH_REGION=eastus

# Copilot Studio - Token endpoint from your agent
COPILOT_STUDIO_TOKEN_ENDPOINT=<your-token-endpoint>
```

---

## Components Summary

| Component | Port | Status |
|-----------|------|--------|
| **Client (Vite)** | 5173 | ✅ React frontend |
| **Server (Express)** | 3001 | ✅ Token proxy server |
| **Copilot Studio** | Cloud | ✅ Agent backend |
| **Azure Speech** | Cloud | ✅ STT/TTS services |

---

## Voice Modes Status

| Mode | Architecture | Status | Notes |
|------|--------------|--------|-------|
| **"Direct Line Speech" tab** | Direct Line SDK + Speech Ponyfill (British voice) | ✅ Working | Uses Sonia (en-GB) voice |
| **"Speech Ponyfill" tab** | Direct Line SDK + Speech Ponyfill (Multi-language) | ✅ Working | Uses Jenny (en-US) + language selection |
| **TRUE Direct Line Speech** | Azure Bot Service + DLS Channel + Proxy Bot | ❌ NOT DEPLOYED | Requires proxy-bot deployment to Azure |

### ⚠️ Important Note:
Both tabs currently use the **same architecture** (Direct Line SDK + Speech Ponyfill).
The difference is only the default voice/locale.

**TRUE Direct Line Speech** would require:
1. Deploy `proxy-bot/` to Azure App Service
2. Create Azure Bot Service registration
3. Configure Direct Line Speech channel
4. Link to Azure Speech Services

This was blocked due to deployment issues.

---

## Quick Start Commands

```powershell
# Start server
cd C:\Demos\THR505-Voice-Demo\server
npm run dev

# Start client (separate terminal)
cd C:\Demos\THR505-Voice-Demo\client
npm run dev

# Open browser
# http://localhost:5173
```

---

## Features Implemented

- ✅ Direct Line SDK + Speech Ponyfill (British English - Sonia voice)
- ✅ Direct Line SDK + Speech Ponyfill (Multi-language with voice selection)
- ✅ Live Code Panel (shows real code during demo)
- ✅ Voice Settings Panel (barge-in, sensitivity, SSML, etc.)
- ✅ Markdown stripping for TTS
- ✅ Barge-in with configurable sensitivity
- ✅ High-contrast code display for demo visibility
- ❌ TRUE Direct Line Speech channel (not deployed)

---

## To-Do Before Demo

1. [ ] Configure additional languages in Copilot Studio (if needed)
2. [ ] **Publish** the agent after language changes
3. [ ] Test with Spanish/French if multilingual demo planned
4. [ ] (Optional) Deploy proxy-bot for TRUE Direct Line Speech

---

Good luck with the demo! 🎤
