# Direct Line Speech Proxy Bot

## Overview

This document describes the implementation of a **Direct Line Speech (DLS) proxy bot** that enables true Direct Line Speech channel functionality with Copilot Studio.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER EXPERIENCE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Browser (Web Chat)                                                        │
│       │                                                                     │
│       │ WebSocket (Audio + Text)                                            │
│       ▼                                                                     │
│   ┌─────────────────────────────────────────┐                              │
│   │  Direct Line Speech Channel             │                              │
│   │  (Azure Bot Service)                    │                              │
│   │  - Speech Recognition (STT)             │                              │
│   │  - Speech Synthesis (TTS)               │                              │
│   │  - Single WebSocket connection          │                              │
│   └─────────────────────────────────────────┘                              │
│       │                                                                     │
│       │ Bot Framework Protocol                                              │
│       ▼                                                                     │
│   ┌─────────────────────────────────────────┐                              │
│   │  Proxy Bot (Azure App Service)          │                              │
│   │  - Receives messages from DLS           │                              │
│   │  - Forwards to Copilot Studio           │                              │
│   │  - Returns responses back               │                              │
│   └─────────────────────────────────────────┘                              │
│       │                                                                     │
│       │ Direct Line REST API                                                │
│       ▼                                                                     │
│   ┌─────────────────────────────────────────┐                              │
│   │  Copilot Studio Agent                   │                              │
│   │  (Your existing bot)                    │                              │
│   └─────────────────────────────────────────┘                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Why a Proxy Bot?

**Copilot Studio does not support Direct Line Speech channel directly.** It only supports:
- Standard Direct Line
- Microsoft Teams
- Other pre-built channels

To use Direct Line Speech features (unified WebSocket for audio + messaging), we need:
1. An Azure Bot Service registration
2. A Bot Framework bot that handles the DLS protocol
3. That bot forwards messages to Copilot Studio via Direct Line

## Benefits of DLS vs Speech Ponyfill

| Feature | Direct Line Speech | Speech Ponyfill |
|---------|-------------------|-----------------|
| Audio streaming | Server-side (lower latency) | Client-side |
| Single connection | ✅ One WebSocket | ❌ Two connections |
| Barge-in support | ✅ Native | ⚠️ Limited |
| Audio processing | Azure (consistent) | Browser (varies) |
| Complexity | Higher (proxy needed) | Lower |

## Azure Resources Required

1. **Azure Bot Service** - Bot registration with DLS channel enabled
2. **Azure App Service** - Hosts the proxy bot code
3. **Azure Speech Services** - Already configured (reuse existing)
4. **Copilot Studio** - Your existing agent (unchanged)

## Files Created

```
proxy-bot/
├── package.json           # Node.js dependencies
├── tsconfig.json          # TypeScript configuration
├── .env.example           # Environment variables template
├── src/
│   ├── index.ts           # Bot entry point
│   ├── bot.ts             # Proxy bot logic
│   └── copilotClient.ts   # Copilot Studio Direct Line client
├── deploy/
│   ├── azuredeploy.json   # ARM template for Azure resources
│   └── deploy.ps1         # PowerShell deployment script
└── README.md              # Proxy bot specific documentation
```

## Environment Variables (proxy-bot/.env)

```env
# Azure Bot Service
MICROSOFT_APP_ID=<from Azure Bot registration>
MICROSOFT_APP_PASSWORD=<from Azure Bot registration>

# Copilot Studio Connection
COPILOT_DIRECT_LINE_SECRET=<from Copilot Studio>
# OR
COPILOT_TOKEN_ENDPOINT=<from Copilot Studio>

# Azure Speech (for DLS channel configuration)
SPEECH_REGION=eastus
SPEECH_RESOURCE_ID=<full resource ID of Speech resource>
```

## Deployment Steps

1. Create Azure Bot Service registration
2. Enable Direct Line Speech channel
3. Deploy proxy bot to Azure App Service
4. Configure environment variables
5. Update frontend to use DLS connection

See [deploy/README.md](../proxy-bot/deploy/README.md) for detailed instructions.

## Rollback Instructions

If you need to revert to the working Speech Ponyfill approach:

1. In `client/src/App.tsx`, the mode selector already supports both approaches
2. The Speech Ponyfill components are unchanged and will continue to work
3. Simply switch to "Speech Ponyfill (US)" mode in the UI

To completely remove DLS code:
1. Delete the `proxy-bot/` folder
2. Restore `useDirectLineSpeechConnection.ts` from git:
   ```bash
   git checkout HEAD -- client/src/hooks/useDirectLineSpeechConnection.ts
   ```

## Related Documentation

- [SPEECH_PONYFILL.md](./SPEECH_PONYFILL.md) - Speech Ponyfill approach (working)
- [TELEPHONY_IVR_LIVEHUB.md](./TELEPHONY_IVR_LIVEHUB.md) - Telephony IVR (working)
- [AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md) - General Azure deployment

## Status

- [x] Proxy bot implemented (code in `proxy-bot/` folder)
- [x] Azure resources created
- [ ] Proxy bot code deployed (needs manual deployment via Azure Portal)
- [x] DLS channel configured
- [ ] Frontend integrated
- [ ] End-to-end tested

## Azure Resources Created (February 4, 2026)

| Resource | Name | Location | Notes |
|----------|------|----------|-------|
| Resource Group | `rg-thr505-demo` | eastus | Created for this demo |
| Speech Services | `thr505-speech` | eastus | For DLS channel |
| App Service Plan | `thr505-dls-proxy-plan` | westus | B1 tier, Linux |
| App Service | `thr505-dls-proxy-bot` | westus | Node.js 20 |
| Azure Bot Service | `thr505-dls-proxy` | global | Standard tier |
| Azure AD App | `thr505-dls-proxy-bot` | - | App ID: `632aab43-dad1-485c-80ff-636b9dfdc58e` |
| DLS Channel | DirectLineSpeechChannel | - | Enabled on bot |

### Credentials (Keep Secure!)

```
MICROSOFT_APP_ID=<YOUR_APP_ID>
MICROSOFT_APP_PASSWORD=<YOUR_APP_PASSWORD>
```

> ⚠️ **Note:** Store actual credentials in Azure Key Vault or environment variables, never in source control.

## Manual Deployment Steps (To Complete Setup)

The automated deployment had issues. Complete deployment manually:

### Option 1: Deploy via Azure Portal

1. Go to Azure Portal > App Services > `thr505-dls-proxy-bot`
2. Click "Deployment Center" in the left menu
3. Choose "Local Git" or "GitHub" as source
4. Follow the prompts to connect your repository
5. Or use "FTPS" to upload the `proxy-bot/dist` folder

### Option 2: Deploy via VS Code

1. Install the Azure App Service extension
2. Right-click on `proxy-bot` folder
3. Select "Deploy to Web App..."
4. Choose `thr505-dls-proxy-bot`

### Option 3: Deploy via Azure CLI (with fixes)

```powershell
cd proxy-bot

# Create a proper deployment package
npm run build
Remove-Item deploy.zip -ErrorAction SilentlyContinue
Compress-Archive -Path dist, node_modules, package.json -DestinationPath deploy.zip

# Deploy with SCM build disabled
az webapp config appsettings set -g rg-thr505-demo -n thr505-dls-proxy-bot --settings SCM_DO_BUILD_DURING_DEPLOYMENT=false
az webapp config set -g rg-thr505-demo -n thr505-dls-proxy-bot --startup-file "node dist/index.js"

# Try direct FTP deployment or use Kudu ZipDeploy API
```

## Verifying the Setup

After successful deployment:

1. Check health endpoint: `https://thr505-dls-proxy-bot.azurewebsites.net/health`
2. Test in Azure Portal: Bot Services > thr505-dls-proxy > Test in Web Chat
3. Update frontend to use true DLS (see below)

## Frontend Integration (After Deployment)

Once the proxy bot is deployed and working, update the frontend:

1. Update `server/.env` to add the Speech resource key (if using key auth)
2. Switch the hook in `DirectLineSpeechChat.tsx` to use `useDirectLineSpeechConnectionDLS`

---

*Created: February 4, 2026*
*Last Updated: February 4, 2026*
