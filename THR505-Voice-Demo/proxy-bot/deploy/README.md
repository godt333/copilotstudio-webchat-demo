# DLS Proxy Bot Deployment

This folder contains deployment scripts and templates for the Direct Line Speech proxy bot.

## Prerequisites

1. **Azure CLI** installed and logged in (`az login`)
2. **Node.js 18+** installed
3. **Azure Subscription** with permissions to create:
   - Resource Groups
   - App Service Plans
   - App Services
   - Bot Services
   - Azure AD App Registrations

## Quick Deploy

```powershell
# Navigate to this folder
cd proxy-bot/deploy

# Run the deployment script
.\deploy.ps1 `
    -ResourceGroupName "rg-dls-proxy-demo" `
    -BotName "thr505-dls-proxy" `
    -Location "eastus" `
    -SpeechRegion "eastus"
```

The script will prompt you for:
- Copilot Studio Token Endpoint (from your .env file)
- Speech Resource ID (from Azure Portal)

## Manual Deployment

If you prefer to deploy manually:

### 1. Create Azure AD App Registration

```bash
# Create app registration
az ad app create --display-name "dls-proxy-bot-app"

# Note the appId from the output

# Create a client secret
az ad app credential reset --id <appId>

# Note the password from the output
```

### 2. Deploy ARM Template

```bash
az deployment group create \
    --resource-group <your-rg> \
    --template-file azuredeploy.json \
    --parameters \
        botName=<your-bot-name> \
        microsoftAppId=<appId> \
        microsoftAppPassword=<password> \
        copilotTokenEndpoint=<your-token-endpoint> \
        speechResourceId=<your-speech-resource-id> \
        speechRegion=eastus
```

### 3. Deploy Bot Code

```bash
# From proxy-bot folder
cd ..
npm install
npm run build

# Zip the deployment package
zip -r deploy.zip dist node_modules package.json

# Deploy to App Service
az webapp deployment source config-zip \
    --resource-group <your-rg> \
    --name <your-bot-name>-app \
    --src deploy.zip
```

## Getting the Speech Resource ID

1. Go to Azure Portal
2. Navigate to your Speech resource
3. Click "Properties" in the left menu
4. Copy the "Resource ID" field

Format: `/subscriptions/{sub-id}/resourceGroups/{rg}/providers/Microsoft.CognitiveServices/accounts/{name}`

## Verifying Deployment

1. Go to Azure Portal > Bot Services > Your Bot
2. Click "Test in Web Chat"
3. Send a message - it should be forwarded to Copilot Studio

## Troubleshooting

### Bot returns errors
- Check App Service logs: Azure Portal > App Service > Log Stream
- Verify environment variables are set correctly

### DLS channel not working
- Ensure Speech resource is in a supported region
- Check that the Speech resource ID is correct
- Verify the bot endpoint is accessible

### Copilot Studio not responding
- Test the Copilot Token Endpoint directly
- Check network connectivity from App Service

## Files

| File | Description |
|------|-------------|
| `azuredeploy.json` | ARM template for Azure resources |
| `deploy.ps1` | PowerShell deployment script |
| `README.md` | This file |
