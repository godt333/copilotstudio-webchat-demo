# Voice Setup Guide for Copilot Studio

This guide explains how to configure a Copilot Studio agent for voice interactions. The THR505 demo assumes you have already completed these steps.

## Overview

Copilot Studio provides voice capabilities through:
- **Voice templates** - Pre-configured agent templates optimized for voice
- **Voice authoring mode** - Specialized editing for voice-first scenarios
- **Voice settings** - DTMF, silence detection, latency messages, etc.

The web client (this demo) connects to your voice-enabled agent and relies on these configurations.

---

## Prerequisites

Before configuring voice features, ensure you have:

1. **Copilot Studio access** - Valid license and environment
2. **Azure Speech resource** - For speech recognition and synthesis
3. **Direct Line Speech channel** - Enabled on your agent

---

## Step 1: Create a Voice-Enabled Agent

### Option A: Use a Voice Template

1. Open [Copilot Studio](https://copilotstudio.microsoft.com)
2. Click **Create an agent**
3. Select **Browse templates**
4. Choose a **Voice template** (e.g., "Customer Service - Voice")
5. Follow the wizard to create your agent

Voice templates come pre-configured with:
- Voice-optimized system topics
- Speech-friendly prompts
- Default voice settings

### Option B: Enable Voice on an Existing Agent

1. Open your agent in Copilot Studio
2. Go to **Settings** → **Channels**
3. Enable **Direct Line Speech**
4. Configure the Azure Speech resource connection

---

## Step 2: Configure Voice Settings

Navigate to **Settings** → **Agent settings** → **Voice** to configure:

### 2.1 Primary Authoring Mode

Set your agent's primary authoring mode to determine how the editor optimizes for your scenario:

| Mode | Description |
|------|-------------|
| **Text first** | Optimizes for typed conversations, voice is secondary |
| **Voice first** | Optimizes for spoken conversations, text is secondary |
| **Omnichannel** | Balanced for both text and voice |

**Recommendation:** For the THR505 demo, use **Voice first** or **Omnichannel**.

### 2.2 Default Voice

Configure the text-to-speech voice:

1. Select **Voice and TTS** settings
2. Choose a neural voice (e.g., `en-US-JennyNeural`)
3. Optionally configure speaking rate and pitch

**Tip:** Neural voices sound more natural than standard voices.

### 2.3 Default Locale

Set the primary language for speech recognition:

1. Select your primary locale (e.g., `en-US`)
2. Enable additional locales for multi-language support
3. Configure language detection if needed

---

## Step 3: Configure DTMF (Dual-Tone Multi-Frequency)

DTMF allows users to interact using phone keypad tones. This is essential for telephony IVR scenarios.

### Enable DTMF

1. Go to **Settings** → **Voice** → **DTMF settings**
2. Enable **Allow DTMF input**
3. Configure DTMF mappings for your topics

### DTMF Options

| Setting | Description | Default |
|---------|-------------|---------|
| **Barge-in** | Allow DTMF to interrupt bot speech | Enabled |
| **End of input timeout** | Time to wait after DTMF before processing | 3 seconds |
| **Maximum digits** | Maximum DTMF digits to collect | 20 |

### Example DTMF Mappings

```
Press 1 → Navigate to topic "Account Balance"
Press 2 → Navigate to topic "Make a Payment"
Press 0 → Transfer to human agent
Press * → Go back to main menu
```

**How this shows in the demo:**
- Web chat won't use DTMF (no phone keypad)
- Telephony IVR (LiveHub) uses DTMF extensively
- The same agent handles both, with DTMF only active on telephony

---

## Step 4: Configure Silence Detection

Silence detection determines when the user has finished speaking.

### Settings

1. Go to **Settings** → **Voice** → **Silence detection**
2. Configure the following:

| Setting | Description | Recommended |
|---------|-------------|-------------|
| **Initial silence timeout** | How long to wait for first speech | 5 seconds |
| **End silence timeout** | How long to wait after speech stops | 1.5 seconds |
| **Speech timeout** | Maximum time for a single speech turn | 30 seconds |

### How This Affects the Demo

**Web Chat (Direct Line Speech / Ponyfill):**
- After the bot asks a question, it listens for the configured timeout
- If the user pauses too long, the agent may prompt or end the turn
- Short silence timeout = snappy but may cut off slow speakers
- Long silence timeout = patient but may feel sluggish

**Telephony IVR:**
- Similar behavior but often configured more strictly
- Phone users expect quicker responses

---

## Step 5: Configure Latency Messages

Latency messages keep users engaged while the bot is processing.

### Enable Latency Messages

1. Go to **Settings** → **Voice** → **Latency handling**
2. Enable **Show latency messages**
3. Configure the messages:

| Setting | Description | Example |
|---------|-------------|---------|
| **Initial delay** | Time before first message | 3 seconds |
| **Message** | What to say while processing | "Please wait while I look that up..." |
| **Repeat interval** | Time between repeated messages | 5 seconds |

### Example Latency Messages

```
- "Please wait while I check that for you..."
- "I'm still working on that..."
- "Just a moment longer..."
```

### How This Affects the Demo

When the agent calls an external API or performs complex processing:
1. User asks a question
2. Bot begins processing
3. After 3 seconds: "Please wait while I look that up..."
4. After 8 seconds: "I'm still working on that..."
5. Response arrives and is spoken

**Tip:** Configure latency messages for any topic that uses Power Automate flows or HTTP actions.

---

## Step 6: Configure Speech Sensitivity

Speech sensitivity controls how the agent handles noisy environments and partial speech.

### Settings

1. Go to **Settings** → **Voice** → **Speech recognition**
2. Configure:

| Setting | Description | Options |
|---------|-------------|---------|
| **Sensitivity** | How strict is speech recognition | Low / Medium / High |
| **Noise suppression** | Filter background noise | Enabled / Disabled |
| **Profanity filter** | Handle inappropriate language | Mask / Remove / Allow |

### Recommendations

| Scenario | Sensitivity | Noise Suppression |
|----------|-------------|-------------------|
| Quiet office | Medium | Disabled |
| Noisy environment | High | Enabled |
| Call center | High | Enabled |
| Home/mobile | Medium | Enabled |

---

## Step 7: Configure Barge-In

Barge-in allows users to interrupt the bot while it's speaking.

### Enable Barge-In

1. Go to **Settings** → **Voice** → **Barge-in**
2. Enable **Allow barge-in**
3. Configure barge-in sensitivity

### How This Works

1. Bot is speaking a long response
2. User starts speaking
3. Bot stops immediately
4. User's speech is processed
5. Conversation continues

**DEMO TIP:** Demonstrate barge-in by interrupting the bot mid-response.

---

## Step 8: Test Voice in Copilot Studio

Before using the web demo, test voice in Copilot Studio:

1. Open your agent
2. Click **Test your agent** (bottom left)
3. Click the **microphone icon** 🎤
4. Speak to your agent
5. Verify:
   - Speech recognition works
   - Bot responds with voice
   - Silence detection behaves as expected
   - Latency messages appear when appropriate

---

## Connecting to This Demo

Once your agent is configured, you need to connect the web demo:

### 1. Get Direct Line Secret

1. Go to **Settings** → **Channels** → **Direct Line**
2. Copy the **Secret key**
3. Add to `server/.env` as `DIRECT_LINE_SECRET`

### 2. Get Speech Resource Credentials

1. Go to **Azure Portal** → your Speech resource
2. Copy the **Key** and **Region**
3. Add to `server/.env` as `SPEECH_KEY` and `SPEECH_REGION`

### 3. Enable Direct Line Speech Channel

1. Go to **Settings** → **Channels** → **Direct Line Speech**
2. Enable the channel
3. Configure the Azure Speech resource

---

## Direct Line Speech Features Reference

The following features are available when using Direct Line Speech with Copilot Studio. These are configurable in the demo webapp's **Settings** panel.

### Feature Configuration Table

| Feature | Description | Configuration Location |
|---------|-------------|------------------------|
| 🛑 **Barge-In** | Allow users to interrupt the bot while it's speaking. The bot will stop talking and listen to the user. | Copilot Studio → Settings → Voice |
| ⏳ **Latency Message** | Show a message when the bot is processing to keep users informed during longer operations. | Copilot Studio → Topics → Send Message node |
| 🔇 **Silence Detection & Timeout** | Automatically stop listening after a period of silence (configurable 1-10 seconds). | Azure Speech SDK → `SpeechConfig.setProperty()` |
| 🎭 **SSML (Speech Synthesis Markup Language)** | Control voice prosody - rate, pitch, emphasis, and pauses. Used in Copilot Studio Message nodes. | [Azure SSML Documentation](https://learn.microsoft.com/azure/ai-services/speech-service/speech-synthesis-markup) |

### SSML Quick Reference

SSML allows fine-grained control over how the bot speaks:

| Element | Purpose | Example |
|---------|---------|---------|
| `<break>` | Insert a pause | `<break time="500ms"/>` |
| `<emphasis>` | Add emphasis | `<emphasis level="strong">important</emphasis>` |
| `<prosody>` | Control rate/pitch | `<prosody rate="slow" pitch="low">text</prosody>` |
| `<say-as>` | Pronunciation hints | `<say-as interpret-as="date">2026-02-05</say-as>` |

---

## Summary

| Configuration | Where | Impact |
|---------------|-------|--------|
| Voice template | Agent creation | Pre-configured voice settings |
| DTMF | Voice settings | Phone keypad navigation |
| Silence detection | Voice settings | When to stop listening |
| Latency messages | Voice settings | User engagement during processing |
| Speech sensitivity | Voice settings | Recognition accuracy |
| Barge-in | Voice settings | Interrupt bot speech |

All these settings are in **Copilot Studio**. The web demo simply connects and uses them.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Bot doesn't speak | Check TTS voice configuration |
| Speech not recognized | Verify locale matches user's language |
| Too sensitive/insensitive | Adjust speech sensitivity |
| Cuts off too soon | Increase end silence timeout |
| No latency messages | Enable and configure latency handling |

---

## Related Documentation

- [Copilot Studio Voice Documentation](https://learn.microsoft.com/microsoft-copilot-studio/voice-overview)
- [Direct Line Speech Channel](https://learn.microsoft.com/azure/cognitive-services/speech-service/direct-line-speech)
- [Azure Speech Services](https://learn.microsoft.com/azure/cognitive-services/speech-service/)

---

**Next:** See [SPEECH_PONYFILL.md](./SPEECH_PONYFILL.md) for the alternative voice integration approach.
