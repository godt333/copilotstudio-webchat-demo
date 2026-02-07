# Telephony IVR Integration with LiveHub + AudioCodes

This guide explains how to extend the THR505 demo to support telephony IVR (Interactive Voice Response) using LiveHub and AudioCodes.

## Overview

The telephony integration allows users to call a phone number and interact with the **same Copilot Studio agent** used in the web demo. The architecture:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TELEPHONY FLOW                                     │
└─────────────────────────────────────────────────────────────────────────────┘

    📞 Phone User
         │
         ▼
┌─────────────────────┐
│    AudioCodes       │  ← Phone numbers, SIP trunking, voice connectivity
│    Voice Gateway    │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│      LiveHub        │  ← Voice platform, call orchestration
│    Platform         │
└─────────────────────┘
         │
         │  GET /api/directline/livehubToken
         ▼
┌─────────────────────┐
│   THR505 Demo       │  ← This demo's backend (token issuance)
│   Backend           │
└─────────────────────┘
         │
         │  Direct Line Token
         ▼
┌─────────────────────┐
│   Bot Framework     │
│   Direct Line       │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   Copilot Studio    │  ← Same agent as web demo!
│   Agent             │
└─────────────────────┘
```

---

## Key Components

### 1. AudioCodes Voice Gateway

AudioCodes provides:
- **Phone numbers** - Dedicated numbers for your IVR
- **SIP trunking** - Connects phone network to cloud
- **Voice quality** - HD audio, noise reduction
- **Global reach** - Numbers in multiple countries

### 2. LiveHub Platform

LiveHub provides:
- **Call orchestration** - Manages the conversation flow
- **Bot integration** - Connects calls to Direct Line bots
- **Recording** - Optional call recording
- **Analytics** - Call metrics and reporting

### 3. THR505 Backend (Token Endpoint)

This demo's backend provides:
- **Token issuance** - Secure Direct Line tokens for each call
- **Caller identification** - Maps phone numbers to user IDs
- **Session tracking** - Correlates calls to conversations

### 4. Copilot Studio Agent

The same agent used in the web demo:
- **Voice configured** - DTMF, silence detection, latency messages
- **Topics** - Conversation logic
- **Integrations** - Power Automate, APIs

---

## Backend Endpoint: `/api/directline/livehubToken`

This endpoint is called by LiveHub when a phone call comes in.

### Request

```http
GET /api/directline/livehubToken?callerId=+15551234567&sessionId=abc123
```

| Parameter | Description | Example |
|-----------|-------------|---------|
| `callerId` | Phone number of the caller (E.164 format) | `+15551234567` |
| `sessionId` | Unique session ID from LiveHub | `abc123-def456` |

### Response

```json
{
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI...",
  "conversationId": "conv-xyz789",
  "expiresIn": 1800,
  "userId": "tel:+15551234567",
  "sessionId": "abc123-def456",
  "botId": "copilot-studio-agent",
  "metadata": {
    "source": "telephony",
    "provider": "livehub",
    "timestamp": "2026-01-21T10:30:00.000Z"
  }
}
```

### User ID Format

For telephony callers, the `userId` is formatted as:

```
tel:+15551234567
```

This prefix helps identify the user source:
- `tel:` - Phone caller
- `user-` - Web chat user
- `session-` - Anonymous session

---

## Security Considerations

### 1. API Key Authentication

In production, protect the LiveHub token endpoint:

```typescript
// Example: API key validation middleware
function validateLiveHubApiKey(req, res, next) {
  const apiKey = req.headers['x-livehub-api-key'];
  
  if (!apiKey || apiKey !== process.env.LIVEHUB_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
}

// Apply to route
router.get('/livehubToken', validateLiveHubApiKey, async (req, res) => {
  // ...
});
```

### 2. Separate Direct Line Secret

Use a dedicated Direct Line secret for LiveHub:

```env
# Main web chat secret
DIRECT_LINE_SECRET=abc123...

# Separate secret for telephony (easier rotation, separate audit)
LIVEHUB_DIRECT_LINE_SECRET=xyz789...
```

### 3. Caller ID Validation

Validate and sanitize caller IDs:

```typescript
function validateCallerId(callerId: string): boolean {
  // E.164 format: +[country code][number]
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(callerId);
}
```

### 4. Rate Limiting

Prevent abuse with rate limiting:

```typescript
import rateLimit from 'express-rate-limit';

const livehubLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests',
});

router.get('/livehubToken', livehubLimiter, async (req, res) => {
  // ...
});
```

---

## LiveHub Configuration

### 1. Bot Connector Setup

In the LiveHub portal, configure a Bot Connector:

```json
{
  "name": "Copilot Studio Agent",
  "type": "directline",
  "tokenEndpoint": "https://your-domain.azurewebsites.net/api/directline/livehubToken",
  "authenticationMethod": "apiKey",
  "headers": {
    "x-livehub-api-key": "YOUR_LIVEHUB_API_KEY"
  }
}
```

### 2. Phone Number Mapping

Map phone numbers to bot connectors:

```json
{
  "phoneNumber": "+18005551234",
  "connector": "Copilot Studio Agent",
  "options": {
    "welcomeMessage": true,
    "recordCalls": false,
    "language": "en-US"
  }
}
```

### 3. Webhook Configuration

Configure webhooks for call events:

```json
{
  "callStarted": "https://your-domain.azurewebsites.net/api/webhooks/livehub/started",
  "callEnded": "https://your-domain.azurewebsites.net/api/webhooks/livehub/ended",
  "callFailed": "https://your-domain.azurewebsites.net/api/webhooks/livehub/failed"
}
```

---

## Direct Line Enhanced Authentication

Enhanced authentication binds tokens to specific users, preventing token hijacking.

### How It Works

1. LiveHub calls `/api/directline/livehubToken` with caller info
2. Backend generates token WITH user binding:

```typescript
const body = {
  user: {
    id: `tel:${callerId}`,
    name: `Caller ${callerId}`,
  },
};

const response = await axios.post(DIRECT_LINE_TOKEN_URL, body, {
  headers: {
    Authorization: `Bearer ${secret}`,
  },
});
```

3. Token can ONLY be used for that specific user
4. If someone intercepts the token, they can't use it for another user

### Benefits

- **Security** - Tokens are bound to caller identity
- **Auditing** - Every conversation is tied to a phone number
- **Personalization** - Bot can greet by name, access history

---

## Call Flow

### 1. Inbound Call

```
User dials → AudioCodes → LiveHub → Token request → Direct Line → Copilot Studio
```

1. User dials the IVR phone number
2. AudioCodes receives the call, routes to LiveHub
3. LiveHub calls `/api/directline/livehubToken` with caller ID
4. Backend returns Direct Line token
5. LiveHub opens Direct Line conversation
6. Copilot Studio greets the caller

### 2. Conversation

```
User speaks → LiveHub STT → Direct Line message → Bot → Direct Line response → LiveHub TTS → User hears
```

1. User speaks
2. LiveHub converts speech to text
3. Text sent to bot via Direct Line
4. Bot processes and responds
5. Response sent via Direct Line
6. LiveHub converts text to speech
7. User hears the response

### 3. DTMF Input

```
User presses keys → LiveHub → Direct Line message (with DTMF data) → Bot processes
```

1. User presses phone keys (e.g., "Press 1 for...")
2. LiveHub captures DTMF tones
3. Sends as message with DTMF metadata
4. Bot processes based on Copilot Studio DTMF config

---

## Copilot Studio Telephony Configuration

Ensure these are configured in Copilot Studio (see [VOICE_SETUP.md](./VOICE_SETUP.md)):

### DTMF Settings

| Setting | Recommended |
|---------|-------------|
| Allow DTMF | Enabled |
| DTMF barge-in | Enabled |
| End of input timeout | 3 seconds |

### Example DTMF Topic

```
Trigger: DTMF input "1"
Action: Navigate to "Account Balance" topic

Trigger: DTMF input "2"  
Action: Navigate to "Make Payment" topic

Trigger: DTMF input "0"
Action: Transfer to human agent
```

### Telephony-Specific Topics

Create topics for telephony scenarios:

1. **Welcome topic** - Greet caller, offer menu
2. **Transfer topic** - Hand off to human agent
3. **Timeout topic** - Handle no input
4. **Goodbye topic** - End call gracefully

---

## Testing

### Local Testing

1. Start the backend: `cd server && npm run dev`
2. Test the endpoint:

```bash
curl "http://localhost:3001/api/directline/livehubToken?callerId=+15551234567&sessionId=test123"
```

3. Verify response contains token and user ID

### LiveHub Testing

1. Configure LiveHub to point to your backend
2. Use LiveHub's test call feature
3. Verify call connects to Copilot Studio

### End-to-End Testing

1. Call the IVR phone number
2. Test voice interaction
3. Test DTMF (press 1, 2, etc.)
4. Verify in Copilot Studio analytics

---

## Monitoring and Logging

### Recommended Logging

```typescript
// Log all LiveHub token requests
router.get('/livehubToken', async (req, res) => {
  const { callerId, sessionId } = req.query;
  
  console.log('[LiveHub] Token request', {
    callerId: callerId ? '***' + callerId.slice(-4) : 'unknown',
    sessionId,
    timestamp: new Date().toISOString(),
    ip: req.ip,
  });
  
  // ... generate token ...
  
  console.log('[LiveHub] Token issued', {
    conversationId: tokenResponse.conversationId,
    sessionId,
  });
});
```

### Metrics to Track

| Metric | Description |
|--------|-------------|
| Token requests/min | Call volume |
| Token failures | Authentication issues |
| Avg call duration | User engagement |
| DTMF usage | IVR navigation patterns |
| Transfer rate | Escalation to humans |

---

## Production Deployment

### Azure App Service

1. Deploy backend to Azure App Service
2. Configure environment variables in App Settings:

```
SPEECH_KEY=your-speech-key
SPEECH_REGION=westus2
DIRECT_LINE_SECRET=main-secret
LIVEHUB_DIRECT_LINE_SECRET=livehub-secret
LIVEHUB_API_KEY=api-key-for-auth
```

3. Configure custom domain and SSL
4. Update LiveHub to use production URL

### Scaling

- Use **Azure App Service Premium** for lower latency
- Configure **auto-scaling** for call volume spikes
- Use **Azure Front Door** for global distribution

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Token endpoint 401 | Check API key configuration |
| Token endpoint 403 | Verify Direct Line secret |
| Call connects but no response | Check Copilot Studio is published |
| DTMF not working | Verify DTMF enabled in Copilot Studio |
| Audio quality issues | Check AudioCodes codec settings |

---

## Example Integration Code

### Webhook Handler (Optional)

```typescript
// Track call events for analytics
router.post('/webhooks/livehub/started', (req, res) => {
  const { callId, callerId, timestamp } = req.body;
  
  console.log('[LiveHub Webhook] Call started', {
    callId,
    callerId: '***' + callerId?.slice(-4),
    timestamp,
  });
  
  // Store in database for analytics
  
  res.status(200).send('OK');
});

router.post('/webhooks/livehub/ended', (req, res) => {
  const { callId, duration, reason } = req.body;
  
  console.log('[LiveHub Webhook] Call ended', {
    callId,
    duration,
    reason,
  });
  
  res.status(200).send('OK');
});
```

---

## Summary

The telephony integration demonstrates that:

1. **Same agent, different channel** - One Copilot Studio agent serves web and phone
2. **DTMF is phone-specific** - Configured in Copilot Studio, used only on phone
3. **Token endpoint is the bridge** - LiveHub calls our backend for auth
4. **Enhanced auth is critical** - Binds tokens to caller identity

This architecture provides a foundation for enterprise IVR solutions using Copilot Studio.

---

## Related Documentation

- [LiveHub Documentation](https://docs.audiocodes.com/livehub/) (replace with actual URL)
- [AudioCodes Bot Framework Integration](https://www.audiocodes.com/solutions/voice-ai)
- [Direct Line Enhanced Authentication](https://learn.microsoft.com/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication)
- [VOICE_SETUP.md](./VOICE_SETUP.md) - Copilot Studio configuration

---

**Note:** This demo provides the backend hooks. Full LiveHub + AudioCodes deployment requires accounts with those providers and their respective portal configurations.
