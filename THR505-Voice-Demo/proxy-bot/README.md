# DLS Proxy Bot

A Bot Framework bot that bridges Direct Line Speech to Copilot Studio.

## Overview

This bot acts as a proxy between:
- **Direct Line Speech Channel** (Azure Bot Service) - receives voice/text from users
- **Copilot Studio Agent** (via Direct Line) - your existing bot logic

```
User → DLS Channel → This Proxy Bot → Copilot Studio → Response → User
         (voice)        (forwards)      (processes)      (voice)
```

## Why Do We Need This?

**Copilot Studio does not support Direct Line Speech channel directly.** It only supports standard Direct Line.

To use DLS features (unified WebSocket, server-side speech, barge-in), we need this proxy.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in:

```env
MICROSOFT_APP_ID=<from Azure AD app registration>
MICROSOFT_APP_PASSWORD=<from Azure AD app registration>
COPILOT_TOKEN_ENDPOINT=<from Copilot Studio>
```

### 3. Run Locally (for testing)

```bash
npm run dev
```

### 4. Deploy to Azure

See [deploy/README.md](deploy/README.md) for full instructions.

```powershell
cd deploy
.\deploy.ps1 -ResourceGroupName "rg-dls-proxy" -BotName "my-dls-bot"
```

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Web Chat UI    │────▶│  Azure Bot      │────▶│  This Proxy     │
│  (Browser)      │     │  Service (DLS)  │     │  Bot            │
│                 │◀────│                 │◀────│                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │  Copilot Studio │
                                                │  (Direct Line)  │
                                                └─────────────────┘
```

## Files

| File | Description |
|------|-------------|
| `src/index.ts` | Entry point, HTTP server setup |
| `src/bot.ts` | ProxyBot class, message handling |
| `src/copilotClient.ts` | Copilot Studio Direct Line client |
| `deploy/azuredeploy.json` | ARM template for Azure resources |
| `deploy/deploy.ps1` | PowerShell deployment script |

## Local Testing

1. Start the bot: `npm run dev`
2. Use [Bot Framework Emulator](https://github.com/microsoft/BotFramework-Emulator)
3. Connect to `http://localhost:3978/api/messages`

Note: DLS-specific features (speech) won't work in the emulator - you need to deploy to Azure and enable the DLS channel.

## Troubleshooting

### "Failed to connect to Copilot Studio"
- Verify `COPILOT_TOKEN_ENDPOINT` is correct
- Test the endpoint directly in a browser (should return JSON with a token)

### "Authentication failed"
- Check `MICROSOFT_APP_ID` and `MICROSOFT_APP_PASSWORD`
- Ensure the Azure AD app registration is configured correctly

### "DLS channel not responding"
- Verify the Speech resource is linked to the DLS channel in Azure Portal
- Check that the Speech resource is in a supported region

## Related Docs

- [DIRECT_LINE_SPEECH_PROXY.md](../docs/DIRECT_LINE_SPEECH_PROXY.md) - Architecture overview
- [ROLLBACK_GUIDE.md](../docs/ROLLBACK_GUIDE.md) - How to rollback changes
- [Azure Bot Service DLS Docs](https://docs.microsoft.com/en-us/azure/bot-service/directline-speech-bot)
