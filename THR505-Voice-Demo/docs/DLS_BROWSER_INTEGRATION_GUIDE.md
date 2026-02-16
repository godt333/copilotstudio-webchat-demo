# Direct Line Speech: Browser Integration Deep Dive

> **Audience**: Software Engineers (Level 400)
> **Last Updated**: February 7, 2026
> **Status**: Production-verified

---

## Executive Summary

Integrating Direct Line Speech (DLS) into a React web application using `botframework-webchat` requires understanding a critical SDK layering distinction: the **raw** `botframework-directlinespeech-sdk` package vs. the **Web Chat bundle wrapper** `createDirectLineSpeechAdapters` exported from `botframework-webchat`. Using the wrong entry point causes **silent connection failures** where the chat renders normally but messages never reach the bot.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [The SDK Layering Problem](#the-sdk-layering-problem)
3. [Root Cause: Silent Connection Failure](#root-cause-silent-connection-failure)
4. [The Fix: Use the Web Chat Bundle Wrapper](#the-fix-use-the-web-chat-bundle-wrapper)
5. [Observable Subscription Ordering](#observable-subscription-ordering)
6. [Connection Status Tracking](#connection-status-tracking)
7. [fetchCredentials: subscriptionKey vs authorizationToken](#fetchcredentials-subscriptionkey-vs-authorizationtoken)
8. [Speech SDK Version Compatibility](#speech-sdk-version-compatibility)
9. [Vite/Bundler Considerations](#vitebundler-considerations)
10. [What We Tried (and Why It Failed)](#what-we-tried-and-why-it-failed)
11. [Key Takeaways](#key-takeaways)

---

## Architecture Overview

```
Browser (React + Web Chat)
    │
    │ WebSocket (wss://{region}.convai.speech.microsoft.com)
    │ ← Single connection: audio frames + text activities
    ▼
Azure Speech Service (DLS Channel)
    │
    │ Bot Framework Protocol
    │ ← Routes via isDefaultBotForCogSvcAccount
    ▼
Proxy Bot (Azure App Service)
    │
    │ Direct Line REST API
    ▼
Copilot Studio Agent
```

The DLS channel provides:
- **Server-side Speech-to-Text (STT)** — lower latency than client-side
- **Text-to-Speech (TTS)** — streaming audio back to the browser
- **Native barge-in** — channel-level interruption support
- **Unified WebSocket** — single connection for both audio and messaging

---

## The SDK Layering Problem

The `botframework-webchat` monorepo contains two related but distinct packages:

### Layer 1: Raw SDK (`botframework-directlinespeech-sdk`)

```typescript
// ❌ DO NOT use this directly in browser React apps
import { createAdapters } from 'botframework-directlinespeech-sdk';
```

This is the **inner** package at `packages/directlinespeech/` in the Web Chat monorepo. It:
- Creates `DialogServiceConnector` from `microsoft-cognitiveservices-speech-sdk`
- Wraps it in a `DirectLineSpeech` adapter (implements `directLine` interface)
- Builds `webSpeechPonyfillFactory` for TTS
- Calls `AudioConfig.fromDefaultMicrophoneInput()` when no `audioConfig` is provided

### Layer 2: Web Chat Bundle Wrapper (`botframework-webchat`)

```typescript
// ✅ USE THIS for browser React apps
import { createDirectLineSpeechAdapters } from 'botframework-webchat';
```

This is the **bundle** wrapper at `packages/bundle/src/createDirectLineSpeechAdapters.ts`. It:
1. **Checks `window.navigator.mediaDevices`** — detects if browser supports microphone
2. **Creates `AudioConfig` via `createMicrophoneAudioConfigAndAudioContext`** — uses Web Audio API
3. **Creates `AudioContext`** — required for proper browser audio pipeline
4. Passes the prepared `audioConfig` and `audioContext` to the raw SDK's `createAdapters`

### Why This Matters

The raw SDK's `AudioConfig.fromDefaultMicrophoneInput()` uses the Speech SDK's internal microphone implementation. In some browser environments, this:
- May not properly initialize the Web Audio pipeline
- Can cause the `DialogServiceConnector.connect()` to fail silently
- Results in `sendActivityAsync()` calls that go into the void

The Web Chat wrapper uses `createMicrophoneAudioConfigAndAudioContext` which creates a proper
browser `MediaStream` via `getUserMedia()` and wraps it in an `AudioConfig.fromStreamInput()`.
This is the **battle-tested** path used by all official Microsoft samples.

---

## Root Cause: Silent Connection Failure

### Symptom

- Web Chat renders normally (no visible errors)
- User types a message — it appears in the chat bubble (local echo)
- Bot never responds
- Browser console shows NO DLS-related errors
- Azure proxy bot logs show NO incoming messages

### Explanation

1. `createAdapters` (raw SDK) resolves successfully — adapters object is created
2. `AudioConfig.fromDefaultMicrophoneInput()` creates an audio config, but it may not be properly initialized for the browser environment
3. ReactWebChat mounts and subscribes to `activity$`, which triggers `dialogServiceConnector.connect()`
4. The `connect()` call may:
   - Establish the WebSocket but fail to complete the DLS handshake
   - Never call its success callback (connectionStatus stays at 1/Connecting)
   - Or connect but with a degraded audio pipeline that prevents activity routing
5. `postActivity()` calls `sendActivityAsync(JSON.stringify(activity))` — this goes into the void because the WebSocket isn't fully operational
6. No error is thrown (sendActivityAsync is fire-and-forget without callbacks in this code path)
7. The local echo still works (postActivity creates a fake echo locally), so the message appears to send

### The Invisible Failure

The previous code immediately set `connectionStatus='connected'` after `createAdapters` resolved:

```typescript
// ❌ WRONG: Premature "connected" status
const dlsAdapters = await createAdapters({...});
setAdapters(result);
setConnectionStatus('connected'); // ← WebSocket isn't connected yet!
```

This masked the real problem — the WebSocket might never reach "Online" status, but the UI showed "DLS Connected" anyway.

---

## The Fix: Use the Web Chat Bundle Wrapper

### Before (broken)

```typescript
import { createAdapters as createDirectLineSpeechAdapters } from 'botframework-directlinespeech-sdk';

const dlsAdapters = await createDirectLineSpeechAdapters({
  fetchCredentials: async () => ({
    subscriptionKey: speechKey,
    region: 'eastus',
  }),
  speechRecognitionLanguage: 'en-US',
});
setAdapters(result);
setConnectionStatus('connected'); // premature!
```

### After (fixed)

```typescript
import { createDirectLineSpeechAdapters } from 'botframework-webchat';

const dlsAdapters = await (createDirectLineSpeechAdapters as any)({
  fetchCredentials: async () => ({
    subscriptionKey: speechKey,
    region: 'eastus',
  }),
  speechRecognitionLanguage: 'en-US',
});

// Subscribe to connectionStatus$ BEFORE setting adapters
const STATUS_NAMES = ['Uninitialized', 'Connecting', 'Online', undefined, 'Error'];
result.directLine.connectionStatus$.subscribe({
  next: (status: number) => {
    if (status === 2) setConnectionStatus('connected');      // WebSocket Online
    else if (status === 4) setConnectionStatus('error');     // WebSocket Error
  },
});

setAdapters(result);
// connectionStatus stays 'connecting' until WebSocket reports Online
```

### Why `(createDirectLineSpeechAdapters as any)`?

The TypeScript types in `botframework-webchat` may not perfectly match our usage. The `as any` cast avoids TypeScript errors while maintaining runtime correctness. The function signature accepts the same parameters.

---

## Observable Subscription Ordering

The DLS adapter has a **critical ordering dependency** between its two Observables:

```javascript
// From DirectLineSpeech.js (simplified)
constructor({ dialogServiceConnector }) {
    let connectionStatusObserver; // ← Set by connectionStatus$ subscribe

    this.activity$ = shareObservable(new Observable(observer => {
        this._activityObserver = observer;
        connectionStatusObserver.next(0);  // ← USES connectionStatusObserver!
        connectionStatusObserver.next(1);
        dialogServiceConnector.connect(
            () => connectionStatusObserver.next(2),  // Online
            (err) => connectionStatusObserver.next(4) // Error
        );
    }));

    this.connectionStatus$ = shareObservable(new Observable(observer => {
        connectionStatusObserver = observer; // ← SETS connectionStatusObserver
    }));
}
```

**Rule**: `connectionStatus$` MUST be subscribed to BEFORE `activity$`.

If `activity$` subscribes first, `connectionStatusObserver` is `undefined` → crash.

### How We Ensure Correct Ordering

By subscribing to `connectionStatus$` in the hook (after adapter creation, before React re-renders):

```
1. createAdapters resolves → adapter objects exist
2. We subscribe to connectionStatus$ → connectionStatusObserver is set ✅
3. setAdapters() → React schedules re-render
4. On next render: ReactWebChat mounts
5. Web Chat subscribes to activity$ → uses connectionStatusObserver ✅
6. dialogServiceConnector.connect() fires → WebSocket connection starts
7. WebSocket connects → connectionStatus$ emits 2 → we set 'connected'
```

This is a **synchronous guarantee**: our subscribe (step 2) happens before React's asynchronous re-render (step 4).

---

## Connection Status Tracking

The DLS adapter's `connectionStatus$` emits numeric values:

| Value | Name          | Meaning                                    |
|-------|---------------|--------------------------------------------|
| 0     | Uninitialized | Observable subscribed, no connection yet    |
| 1     | Connecting    | WebSocket connecting to Speech Service      |
| 2     | Online        | WebSocket connected, ready for messaging    |
| 4     | Error         | Connection failed                           |

### Timeline

```
connectionStatus$ subscribe → (nothing emitted yet)
activity$ subscribe →
  Status 0 (Uninitialized) →
  Status 1 (Connecting) →
  dialogServiceConnector.connect() called →
  [1-5 seconds] →
  Status 2 (Online) → ready for text and speech
```

If status never reaches 2, messages sent via `postActivity()` will be lost silently.

---

## fetchCredentials: subscriptionKey vs authorizationToken

The `fetchCredentials` function can return either:

### subscriptionKey + region (current approach)

```typescript
fetchCredentials: async () => ({
  subscriptionKey: 'CBJl4p...',
  region: 'eastus',
})
```

- **Pros**: Simple, reliable, proven working
- **Cons**: Exposes the Speech resource key to the browser
- **Use when**: Demo/development, or when the key is scoped appropriately

### authorizationToken + region

```typescript
fetchCredentials: async () => ({
  authorizationToken: 'eyJ0eX...',
  region: 'eastus',
})
```

- **Pros**: Token expires (10 min), more secure
- **Cons**: Requires server-side token endpoint; in testing, this silently broke DLS WebSocket connections
- **Use when**: Production, with a working token refresh mechanism

### ⚠️ What We Discovered

Switching from `subscriptionKey` to `authorizationToken` silently broke the DLS WebSocket connection. The Azure proxy bot logs confirmed: zero messages received after the switch, despite the chat rendering normally. The `subscriptionKey` approach has proven working with our Speech resource configuration (custom domain + `disableLocalAuth: false`).

---

## Speech SDK Version Compatibility

### The Dependency Chain

```
botframework-webchat@4.18.0
  └── botframework-directlinespeech-sdk@4.18.0
        └── microsoft-cognitiveservices-speech-sdk@1.17.0 (pinned exact)

Our package.json also has:
  microsoft-cognitiveservices-speech-sdk@^1.47.0 (for Speech Ponyfill tab)
```

### npm Resolution

```
node_modules/
  microsoft-cognitiveservices-speech-sdk/       → 1.47.0 (top-level)
  botframework-directlinespeech-sdk/
    node_modules/
      microsoft-cognitiveservices-speech-sdk/   → 1.17.0 (nested)
```

### Vite/esbuild Behavior

Vite's pre-bundler (esbuild) may resolve to the top-level 1.47.0 instead of the nested 1.17.0. We verified that the `DialogServiceConnector` API (`connect()`, `sendActivityAsync()`) is backward-compatible between 1.17.0 and 1.47.0, so this shouldn't cause runtime errors. However, internal behavior changes are possible.

### Mitigation

Using `createDirectLineSpeechAdapters` from `botframework-webchat` (the bundle wrapper) goes through the same code path that Microsoft tests internally, reducing the risk of version-mismatch issues.

---

## Vite/Bundler Considerations

### optimizeDeps Configuration

```typescript
// vite.config.ts
optimizeDeps: {
  include: [
    'botframework-webchat',
    'botframework-directlinespeech-sdk',
    'microsoft-cognitiveservices-speech-sdk',
    // ...
  ],
}
```

All three packages are pre-bundled by Vite. This ensures they're converted to ESM and cached for fast dev server startup.

### core-js Observable

The DLS SDK uses `core-js/features/observable` for its Observable implementation (not RxJS). The `shareObservable` wrapper relies on a global `Observable` constructor set by core-js. Vite's pre-bundling preserves this global assignment.

---

## What We Tried (and Why It Failed)

### Approach 1: Raw SDK with subscriptionKey ❌

```typescript
import { createAdapters } from 'botframework-directlinespeech-sdk';
```
**Result**: Chat renders, bot doesn't respond. Silent WebSocket failure.
**Why**: Missing browser AudioConfig setup.

### Approach 2: authorizationToken instead of subscriptionKey ❌

```typescript
fetchCredentials: () => ({ authorizationToken: token, region })
```
**Result**: Completely silent failure. Zero messages in proxy bot logs.
**Why**: Authorization token approach may require `directLineSpeechHostname` instead of `region` for custom-domain Speech resources, or there's a token format incompatibility.

### Approach 3: Pre-subscribe to connectionStatus$ (early attempt) ❌

Added a standalone subscription before Web Chat mounted.
**Result**: Fixed Observable ordering crash but "interfered with Web Chat."
**Why**: The pre-subscription was implemented without proper cleanup and interacted poorly with Web Chat's saga lifecycle.

### Approach 4: Web Chat bundle wrapper + connectionStatus$ monitoring ✅

```typescript
import { createDirectLineSpeechAdapters } from 'botframework-webchat';
```
**Result**: Proper browser audio setup, accurate connection tracking, correct Observable ordering.
**Why**: This is the official, tested code path. All Microsoft DLS samples use it.

---

## Key Takeaways

1. **Always use `createDirectLineSpeechAdapters` from `botframework-webchat`** for browser apps. The raw SDK is for Node.js or custom environments.

2. **Monitor `connectionStatus$`** — don't assume "adapters created" means "WebSocket connected." Status 2 (Online) is the only reliable indicator.

3. **Subscribe to `connectionStatus$` BEFORE Web Chat mounts** — this ensures the correct Observable subscription ordering and provides diagnostic visibility.

4. **DLS `postActivity()` is fire-and-forget** — `sendActivityAsync()` is called without error callbacks. If the WebSocket isn't connected, messages are silently lost.

5. **DLS fakes local echo** — `postActivity()` immediately emits a local echo (fake activity with random ID). This means messages appear to send even when the WebSocket is broken.

6. **The `subscriptionKey` approach works** for this configuration (custom-domain Speech resource with `disableLocalAuth: false`). The `authorizationToken` approach was not reliable.

7. **Speech SDK version compatibility** — The DLS SDK pins `microsoft-cognitiveservices-speech-sdk@1.17.0` but bundlers may resolve to newer versions. The key APIs are backward-compatible, but use the Web Chat bundle wrapper to minimize risk.

---

## Azure Resource Configuration Reference

| Resource | Name | Key Detail |
|----------|------|------------|
| Speech Resource | `thr505-speech` | S0, customDomain: `thr505-dls-speech`, region: `eastus` |
| Bot Registration | `thr505-dls-proxy` | SingleTenant, App ID: `632aab43-dad1-485c-80ff-636b9dfdc58e` |
| Web App (Bot) | `thr505-dls-proxy-bot` | Endpoint: `https://thr505-dls-proxy-bot.azurewebsites.net/api/messages` |
| DLS Channel | On `thr505-dls-proxy` | `isDefaultBotForCogSvcAccount: true`, linked to `thr505-speech` |

---

## Files Modified

| File | Change | Why |
|------|--------|-----|
| `client/src/hooks/useDirectLineSpeechConnectionDLS.ts` | Changed import from raw SDK to Web Chat bundle | Proper browser AudioConfig setup |
| `client/src/hooks/useDirectLineSpeechConnectionDLS.ts` | Added connectionStatus$ subscription | Accurate WebSocket status tracking + Observable ordering guarantee |
| `client/src/hooks/useDirectLineSpeechConnectionDLS.ts` | Removed premature `setConnectionStatus('connected')` | Connection status now tracks actual WebSocket state |

No changes to:
- `TrueDLSChat.tsx` (component)
- `SpeechPonyfillChat.tsx` (Tab 1 — frozen)
- `DirectLineSpeechChat.tsx` (Tab 2 — frozen)
- `TelephonyIVR.tsx` (Tab 4 — frozen)
- Proxy bot code (deployed on Azure)
- Server code
