# Azure Deployment Guide for THR505 Demo

## Quick Deploy Tomorrow

### Prerequisites
- Azure CLI installed and logged in (`az login`)
- Existing resource group: `rg-thr505-demo`

---

## Option 1: Single App Service (Recommended)

### Step 1: Build the Client
```powershell
cd C:\Demos\THR505-Voice-Demo\client
npm run build
```

### Step 2: Copy build to server
```powershell
Copy-Item -Path "C:\Demos\THR505-Voice-Demo\client\dist\*" -Destination "C:\Demos\THR505-Voice-Demo\server\public" -Recurse -Force
```

### Step 3: Create App Service
```powershell
az webapp up --name thr505-voice-demo --resource-group rg-thr505-demo --runtime "NODE:18-lts" --sku B1 --location eastus
```

### Step 4: Configure Environment Variables
```powershell
az webapp config appsettings set --name thr505-voice-demo --resource-group rg-thr505-demo --settings `
  DIRECT_LINE_TOKEN_ENDPOINT="https://a70672e8c413ec758ecae6c97f4593.06.environment.api.powerplatform.com/powervirtualagents/botsbyschema/copilots_header_79c18/directline/token?api-version=2022-03-01-preview" `
  SPEECH_KEY="USE_AZURE_AD" `
  SPEECH_REGION="eastus" `
  SPEECH_RESOURCE_ENDPOINT="https://thr505-speech.cognitiveservices.azure.com"
```

### Step 5: Update server to serve static files
Add to `server/src/index.ts`:
```typescript
import path from 'path';
app.use(express.static(path.join(__dirname, '../public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});
```

### Step 6: Deploy
```powershell
cd C:\Demos\THR505-Voice-Demo\server
az webapp up --name thr505-voice-demo --resource-group rg-thr505-demo
```

---

## Expected Result
- **URL**: `https://thr505-voice-demo.azurewebsites.net`
- Text chat, Voice chat, IVR tab all working
- Same Citizen Advice agent
- LiveHub phone still works: +1 (786) 687-0264

---

## Rollback to Local
If Azure has issues, just run locally:
```powershell
# Terminal 1
cd C:\Demos\THR505-Voice-Demo\server
npm run dev

# Terminal 2
cd C:\Demos\THR505-Voice-Demo\client
npm run dev
```
Open http://localhost:5173

---

## Current Azure Resources
| Resource | Name | Status |
|----------|------|--------|
| Speech Services | thr505-speech |  Exists |
| Resource Group | rg-thr505-demo |  Exists |
| Copilot Studio | Citizen Advice |  Working |
| LiveHub Phone | +1 (786) 687-0264 |  Working |
| App Service | thr505-voice-demo |  To create |

