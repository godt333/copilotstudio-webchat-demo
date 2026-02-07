# Speech Ponyfill Integration Guide

This guide explains the Speech Ponyfill approach to voice integration, an alternative to Direct Line Speech.

## Overview

**Speech Ponyfill** is a pattern where:
- **Direct Line** handles all bot messaging (standard Bot Framework protocol)
- A **Web Speech API ponyfill** adds speech capabilities on top

This contrasts with **Direct Line Speech**, which provides unified messaging + speech in a single channel.

```
┌─────────────────────────────────────────────────────────────────┐
│                      WEB BROWSER                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    ┌───────────────────────────────────────────────────────┐    │
│    │                 BotFramework WebChat                   │    │
│    └───────────────────────────────────────────────────────┘    │
│                    │                         │                   │
│                    ▼                         ▼                   │
│    ┌─────────────────────┐     ┌─────────────────────────┐      │
│    │    Direct Line      │     │   Speech Ponyfill       │      │
│    │    (messaging)      │     │   (speech-to-text)      │      │
│    │                     │     │   (text-to-speech)      │      │
│    └─────────────────────┘     └─────────────────────────┘      │
│             │                             │                      │
└─────────────│─────────────────────────────│──────────────────────┘
              │                             │
              ▼                             ▼
    ┌─────────────────────┐     ┌─────────────────────────┐
    │   Bot Framework     │     │   Azure Speech          │
    │   Direct Line       │     │   Services              │
    │   Service           │     │                         │
    └─────────────────────┘     └─────────────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │   Copilot Studio    │
    │   Agent             │
    └─────────────────────┘
```

---

## When to Use Speech Ponyfill

Choose Speech Ponyfill over Direct Line Speech when:

| Scenario | Why Ponyfill |
|----------|--------------|
| **Existing Direct Line bot** | Don't want to migrate channels |
| **Full conversation history** | Need all messages in Direct Line for analytics |
| **Voice as optional feature** | Can work without voice if speech fails |
| **Custom speech config** | Need specific voices, endpoints, or processing |
| **Separate authentication** | Different auth for messaging vs speech |

Choose Direct Line Speech when:

| Scenario | Why Direct Line Speech |
|----------|------------------------|
| **New voice-first project** | Simpler unified architecture |
| **Lower latency needed** | Single connection is faster |
| **Barge-in is critical** | Built-in interrupt handling |
| **Simpler credential management** | Single token for everything |

---

## How It Works

### 1. Standard Direct Line Connection

The ponyfill approach uses the standard Direct Line protocol for messaging:

```typescript
import { createDirectLine } from 'botframework-webchat';

const directLine = createDirectLine({
  token: directLineToken,
});
```

This establishes a WebSocket connection to the Bot Framework Direct Line service.

### 2. Speech Ponyfill Factory

The speech capabilities are added via a "ponyfill factory" - an implementation of the Web Speech API using Azure Speech Services:

```typescript
import { createCognitiveServicesSpeechServicesPonyfillFactory } 
  from 'web-speech-cognitive-services';

const webSpeechPonyfillFactory = createCognitiveServicesSpeechServicesPonyfillFactory({
  credentials: {
    authorizationToken: speechToken,
    region: speechRegion,
  },
});
```

### 3. Combining in Web Chat

Both are passed to Web Chat:

```tsx
<ReactWebChat
  directLine={directLine}
  webSpeechPonyfillFactory={webSpeechPonyfillFactory}
/>
```

---

## Implementation in This Demo

### Backend Endpoints

The demo backend provides two endpoints for the ponyfill approach:

#### `/api/directline/token`

Returns a Direct Line token for messaging:

```json
{
  "token": "eyJ...",
  "conversationId": "abc123",
  "expiresIn": 1800,
  "userId": "user-xyz"
}
```

#### `/api/speechservices/ponyfillKey`

Returns Speech Services credentials:

```json
{
  "token": "eyJ...",
  "region": "westus2",
  "expiresIn": 540,
  "locale": "en-US",
  "voice": "en-US-JennyNeural"
}
```

### Frontend Hook

The `useDirectLinePonyfillConnection` hook manages both connections:

```typescript
// Fetch both tokens in parallel
const [dlToken, speechCreds] = await Promise.all([
  fetchDirectLineToken(),
  fetchPonyfillCredentials(),
]);

// Create Direct Line connection
const directLine = createDirectLine({
  token: dlToken.token,
});

// Create Speech Ponyfill
const ponyfillFactory = createCognitiveServicesSpeechServicesPonyfillFactory({
  credentials: {
    authorizationToken: speechCreds.token,
    region: speechCreds.region,
  },
});
```

---

## Configuration Options

### Speech Recognition

Configure how speech is converted to text:

```typescript
createCognitiveServicesSpeechServicesPonyfillFactory({
  credentials: { ... },
  
  // Language for speech recognition
  speechRecognitionEndpointId: undefined, // Use default
  
  // Enable continuous recognition (for longer utterances)
  // Note: Check SDK documentation for exact options
});
```

### Text-to-Speech

Configure how text is converted to speech:

```typescript
createCognitiveServicesSpeechServicesPonyfillFactory({
  credentials: { ... },
  
  // Output format for synthesized speech
  speechSynthesisOutputFormat: 'audio-24khz-96kbitrate-mono-mp3',
  
  // Text normalization (how numbers, dates are spoken)
  textNormalization: 'lexical',
});
```

### Custom Voice Endpoint

If using a custom neural voice:

```typescript
createCognitiveServicesSpeechServicesPonyfillFactory({
  credentials: {
    authorizationToken: token,
    region: region,
    customVoiceHostname: 'your-custom-voice.cognitiveservices.azure.com',
  },
});
```

---

## Message Flow

### User Speaks

1. User clicks microphone and speaks
2. Ponyfill captures audio via Web Audio API
3. Audio is streamed to Azure Speech Services
4. Speech Services returns transcription
5. Transcription is sent via Direct Line
6. Bot processes message and responds

### Bot Responds

1. Bot sends response via Direct Line
2. Web Chat receives the activity
3. Text is sent to Azure Speech Services TTS
4. Synthesized audio is played via Web Audio API

---

## Comparison with Direct Line Speech

| Aspect | Speech Ponyfill | Direct Line Speech |
|--------|-----------------|-------------------|
| **Connections** | 2 (Direct Line + Speech) | 1 (unified) |
| **Latency** | Slightly higher | Lower |
| **Barge-in** | Requires extra config | Built-in |
| **Conversation history** | Full in Direct Line | Varies |
| **Token management** | 2 token types | 1 token type |
| **Complexity** | More setup | Simpler |
| **Fallback** | Can work without speech | Speech is integral |
| **Customization** | More flexible | Limited |

---

## Limitations and Trade-offs

### Limitations

1. **Two connections** - More network overhead
2. **Token coordination** - Two tokens to manage and refresh
3. **Barge-in complexity** - Requires custom handling
4. **No unified activity stream** - Speech events separate from messages

### Trade-offs

1. **Flexibility vs Simplicity** - More control but more code
2. **Separation vs Integration** - Easier to debug separately but more moving parts
3. **Fallback capability** - Can gracefully degrade if speech fails

---

## Error Handling

### Direct Line Errors

```typescript
directLine.connectionStatus$.subscribe({
  next: (status) => {
    if (status === 4) { // ConnectionStatus.FailedToConnect
      // Handle connection failure
    }
  },
});
```

### Speech Errors

Speech errors appear as events in Web Chat's activity stream. Handle them in middleware:

```typescript
const activityMiddleware = () => next => card => {
  if (card.activity.type === 'error') {
    // Handle error
    console.error('Speech error:', card.activity);
  }
  return next(card);
};
```

---

## Demo Tips

When demonstrating Speech Ponyfill mode:

1. **Show the network traffic** - Point out the separate Direct Line and Speech connections in DevTools
2. **Compare with Direct Line Speech** - Switch modes and highlight the differences
3. **Explain when to use each** - Reference the decision table above
4. **Demonstrate fallback** - Show how chat works even if speech fails

---

## Code Snippets

### Basic Setup

```tsx
import ReactWebChat, { createDirectLine } from 'botframework-webchat';
import { createCognitiveServicesSpeechServicesPonyfillFactory } 
  from 'web-speech-cognitive-services';

function VoiceChat({ directLineToken, speechToken, speechRegion }) {
  const directLine = useMemo(
    () => createDirectLine({ token: directLineToken }),
    [directLineToken]
  );

  const webSpeechPonyfillFactory = useMemo(
    () => createCognitiveServicesSpeechServicesPonyfillFactory({
      credentials: {
        authorizationToken: speechToken,
        region: speechRegion,
      },
    }),
    [speechToken, speechRegion]
  );

  return (
    <ReactWebChat
      directLine={directLine}
      webSpeechPonyfillFactory={webSpeechPonyfillFactory}
    />
  );
}
```

### With Locale Configuration

```tsx
// For Spanish demo
const webSpeechPonyfillFactory = createCognitiveServicesSpeechServicesPonyfillFactory({
  credentials: {
    authorizationToken: token,
    region: 'westus2',
  },
});

<ReactWebChat
  directLine={directLine}
  webSpeechPonyfillFactory={webSpeechPonyfillFactory}
  locale="es-ES"
/>
```

---

## Speech Ponyfill Features Reference

The following features are available when using the Speech Ponyfill approach. These are configurable in the demo webapp's **Settings** panel and map to real Web Speech API / Azure Speech SDK properties.

### Feature Configuration Table

| Feature | Description | API / Property |
|---------|-------------|----------------|
| 🔄 **Continuous Recognition** | Keep microphone open for natural conversation flow without needing to click repeatedly. | `web-speech-cognitive-services` ponyfill setting |
| ✍️ **Interim Results** | Show real-time transcription as the user speaks, before the final result is ready. | `SpeechRecognition.interimResults` property |
| ⏩ **Speech Rate** | Adjust TTS speed (0.5x - 2.0x). 1.0 is normal speed. | `SpeechSynthesisUtterance.rate` property |
| 🎵 **Speech Pitch** | Adjust TTS pitch (0.5x - 2.0x). 1.0 is normal pitch. | `SpeechSynthesisUtterance.pitch` property |
| 🎤 **Auto-Start Microphone** | Automatically start listening after the bot finishes speaking. | `SpeechSynthesisUtterance.onend` event handler |

### Available Voices

The ponyfill supports Azure Neural Voices. Common options include:

| Locale | Voice ID | Name | Style |
|--------|----------|------|-------|
| 🇺🇸 en-US | `en-US-JennyNeural` | Jenny (Female) | Friendly |
| 🇺🇸 en-US | `en-US-GuyNeural` | Guy (Male) | Newscast |
| 🇺🇸 en-US | `en-US-AriaNeural` | Aria (Female) | Cheerful |
| 🇺🇸 en-US | `en-US-DavisNeural` | Davis (Male) | Calm |
| 🇬🇧 en-GB | `en-GB-SoniaNeural` | Sonia (Female) | Friendly |
| 🇬🇧 en-GB | `en-GB-RyanNeural` | Ryan (Male) | Cheerful |
| 🇪🇸 es-ES | `es-ES-ElviraNeural` | Elvira (Female) | Friendly |
| 🇫🇷 fr-FR | `fr-FR-DeniseNeural` | Denise (Female) | Friendly |

### Code Example: Configuring Features

```typescript
// Create ponyfill with Azure Speech Services
const ponyfill = await createSpeechServicesPonyfill({
  credentials: {
    authorizationToken: speechToken,
    region: 'eastus',
  },
  speechSynthesisOutputFormat: 'audio-24khz-48kbitrate-mono-mp3',
});

// Destructure Web Speech API components
const { SpeechRecognition, speechSynthesis, SpeechSynthesisUtterance } = ponyfill;

// Configure speech rate and pitch
const utterance = new SpeechSynthesisUtterance(text);
utterance.rate = 1.0;  // 0.5 to 2.0
utterance.pitch = 1.0; // 0.5 to 2.0

// Auto-start mic after speaking
utterance.onend = () => {
  if (autoStartMic) {
    recognition.start();
  }
};
```

---

## Related Documentation

- [BotFramework-WebChat: Speech](https://github.com/microsoft/BotFramework-WebChat/blob/main/docs/SPEECH.md)
- [web-speech-cognitive-services](https://github.com/compulim/web-speech-cognitive-services)
- [Azure Speech Services](https://learn.microsoft.com/azure/cognitive-services/speech-service/)
- [VOICE_SETUP.md](./VOICE_SETUP.md) - Copilot Studio configuration

---

**Next:** See [TELEPHONY_IVR_LIVEHUB.md](./TELEPHONY_IVR_LIVEHUB.md) for phone-based integration.
