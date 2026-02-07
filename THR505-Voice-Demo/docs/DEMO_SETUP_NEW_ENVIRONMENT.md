# THR505 Demo Setup - New Environment

## Environment Details
- **Environment:** Contoso (default)
- **Environment ID:** Default-ba9da2c0-3331-4337-a775-ed8556d7b7e5
- **Copilot Studio URL:** https://copilotstudio.microsoft.com/environments/Default-ba9da2c0-3331-4337-a775-ed8556d7b7e5/bots
- **User:** josdel@MngEnvMCAP984650.onmicrosoft.com

---

## Pre-Demo Setup Checklist

### Step 1: Import & Publish Agent
1. ✅ Import colleague's solution
2. Go to agent → **Settings → Security → Authentication**
3. Set to **"No authentication"** 
4. Go to **Publish** → Click **"Publish"**
5. Wait for publish to complete

### Step 2: Get Direct Line Token Endpoint
1. Go to agent → **Channels** → **Direct Line**
2. Copy the **Token Endpoint URL**
3. It will look like:
   ```
   https://[environment-id].environment.api.powerplatform.com/powervirtualagents/botsbyschema/[bot-id]/directline/token?api-version=2022-03-01-preview
   ```

### Step 3: Update Server Configuration
Update `C:\Demos\THR505-Voice-Demo\server\.env`:
```env
# Direct Line (from Copilot Studio)
DIRECT_LINE_TOKEN_ENDPOINT=<paste your new token endpoint here>

# Speech Services (already configured)
SPEECH_KEY=USE_AZURE_AD
SPEECH_REGION=eastus
SPEECH_RESOURCE_ENDPOINT=https://thr505-speech.cognitiveservices.azure.com

# Optional
BOT_NAME=THR505 Demo Agent
```

### Step 4: Restart Servers
```powershell
# Kill existing
taskkill /F /IM node.exe

# Start server
cd C:\Demos\THR505-Voice-Demo\server
npm run dev

# Start client (new terminal)
cd C:\Demos\THR505-Voice-Demo\client
npm run dev
```

### Step 5: Test
1. Open http://localhost:5173
2. Type "hello" → Should get response
3. Click microphone → Should hear voice

---

## The 3 Demo Activities

### Demo 1: Speech Ponyfill (Primary - Copilot Studio)
**Tab:** 🔊 Speech Ponyfill ⭐

**What it shows:**
- Standard Direct Line connection to Copilot Studio
- Azure Speech Services adds voice capability
- Text + Voice in same interface

**Demo flow:**
1. Show the UI loading and connecting
2. Type a message → Get text response
3. Click microphone → Speak → Get voice response
4. Bot speaks back (TTS)

**Talking points:**
- "This uses standard Direct Line - works with any Copilot Studio agent"
- "Speech Services ponyfill adds voice without changing the bot"
- "Customizable UI with Bot Framework Web Chat"

---

### Demo 2: Direct Line Speech (Bot Framework)
**Tab:** 🎤 Direct Line Speech

**What it shows:**
- Unified voice + text channel
- Designed for Bot Framework bots with DLS channel

**Demo flow:**
1. Show that this requires Bot Framework bot registration
2. Explain the difference vs Speech Ponyfill
3. Show architecture diagram

**Talking points:**
- "Direct Line Speech is a unified channel - single WebSocket for text AND speech"
- "Requires registering bot with Direct Line Speech in Azure"
- "Best for voice-first scenarios with Bot Framework bots"

---

### Demo 3: Telephony / IVR
**Tab:** 📞 Telephony / IVR

**What it shows:**
- Phone-based voice interaction
- Dynamics 365 Contact Center integration
- Live agent handoff

**Demo flow:**
1. Show the IVR placeholder explaining the architecture
2. If configured: Make actual phone call to agent
3. Demonstrate DTMF (dial pad) options

**Talking points:**
- "For phone-based IVR, Copilot Studio integrates with Azure Communication Services"
- "Dynamics 365 Contact Center provides routing, queuing, live agents"
- "Same agent can serve web chat AND phone calls"

---

## Architecture Overview (for demo)

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
            │                  ┌─────────────────┐
            └─────────────────▶│   Telephony     │
                               │   (D365 / ACS)  │
                               └─────────────────┘
```

---

## Branding Customization Points (for demo)

Show these CSS variables in `client/src/styles/index.css`:
```css
:root {
  --primary-color: #0078d4;      /* Change brand color */
  --accent-color: #00bcf2;       /* Accent highlights */
  --bot-avatar-initials: 'CS';   /* Bot avatar */
}
```

Show Web Chat style options in components:
```javascript
const webChatStyleOptions = {
  accent: '#004b88',
  botAvatarInitials: 'CA',
  bubbleFromUserBackground: '#004b88',
};
```

---

## Quick Commands During Demo

```powershell
# If something breaks - restart everything
taskkill /F /IM node.exe
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Demos\THR505-Voice-Demo\server'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Demos\THR505-Voice-Demo\client'; npm run dev"
```

---

## Backup Plan

If the agent doesn't work:
1. Use the test chat in Copilot Studio to show the agent works
2. Explain the architecture using diagrams
3. Show the code and explain what each component does
