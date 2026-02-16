# DLS Proxy Bot

A Bot Framework bot that bridges Direct Line Speech to Copilot Studio.

## ✅ Status: DEPLOYED AND WORKING (February 6, 2026)

The Proxy Bot is fully deployed and operational at:
- **App Service**: `thr505-dls-proxy-bot.azurewebsites.net`
- **Health Check**: `https://thr505-dls-proxy-bot.azurewebsites.net/health`
- **Messaging**: `https://thr505-dls-proxy-bot.azurewebsites.net/api/messages`

## Overview

This bot acts as a proxy between:
- **Direct Line Channel** (Azure Bot Service) - receives text/audio from web client
- **Copilot Studio Agent** (via Direct Line) - your existing bot logic

```
User → Direct Line → This Proxy Bot → Copilot Studio → Response → User
      (web client)    (App Service)    (via DL API)     (via Proxy)
```

**Note**: Due to Azure Policy blocking True DLS, the web client uses client-side Speech SDK for voice, and Direct Line to this Proxy Bot for messaging.

## Why Do We Need This?

Originally designed for True Direct Line Speech (server-side audio processing), but Azure Policy blocks this configuration. The Proxy Bot still provides value:

1. **Custom middleware** - Can add logging, transformations, etc.
2. **Authentication isolation** - Client doesn't need Copilot Studio credentials
3. **Future True DLS** - If Azure Policy exemption is granted, can enable server-side speech

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

### "AADSTS7000229: Missing service principal" (RESOLVED Feb 6, 2026)
If you see this error in Azure logs:
```
AADSTS7000229: The client application 632aab43-... is missing service principal in the tenant
```

**Solution**: Create the Service Principal for the App Registration:
```powershell
az ad sp create --id 632aab43-dad1-485c-80ff-636b9dfdc58e
```

### "Cannot find module 'dotenv'" (RESOLVED Feb 6, 2026)
If the Azure app fails to start with module not found errors:

**Solution**: Ensure `SCM_DO_BUILD_DURING_DEPLOYMENT=true` is set, or manually run:
```powershell
# Via Kudu API
$body = @{command="npm install --production"; dir="/home/site/wwwroot"} | ConvertTo-Json
Invoke-RestMethod -Uri "https://thr505-dls-proxy-bot.scm.azurewebsites.net/api/command" `
  -Method POST -Headers $headers -Body $body -ContentType "application/json"
```

## Deployment Method That Worked

Use the `quick-deploy.zip` approach:
1. Create zip with only: `index.js`, `bot.js`, `copilotClient.js`, `package.json`
2. Set `SCM_DO_BUILD_DURING_DEPLOYMENT=true`
3. Deploy with `az webapp deploy --src-path quick-deploy.zip --type zip`
4. Create Service Principal if missing
5. Restart the app

---

**Last Updated:** February 6, 2026

### "DLS channel not responding"
- Verify the Speech resource is linked to the DLS channel in Azure Portal
- Check that the Speech resource is in a supported region

## Related Docs

- [DIRECT_LINE_SPEECH_PROXY.md](../docs/DIRECT_LINE_SPEECH_PROXY.md) - Architecture overview
- [ROLLBACK_GUIDE.md](../docs/ROLLBACK_GUIDE.md) - How to rollback changes
- [Azure Bot Service DLS Docs](https://docs.microsoft.com/en-us/azure/bot-service/directline-speech-bot)
