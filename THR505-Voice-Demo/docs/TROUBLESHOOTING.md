# THR505 Demo Troubleshooting Guide

## Issues Encountered & Solutions

---

### 1. IntegratedAuthenticationNotSupportedInChannel

**Description:**  
When trying to connect to a Copilot Studio agent via Direct Line, the error `IntegratedAuthenticationNotSupportedInChannel` is returned.

**Reason:**  
The Copilot Studio agent has **authentication enabled** (e.g., Microsoft Entra ID). Direct Line and Direct Line Speech channels do not support integrated authentication - they require "No authentication" mode.

**Solution:**  
1. Go to Copilot Studio → Settings → Security → Authentication
2. Change from "Authenticate with Microsoft" to **"No authentication"**
3. **Republish** the agent
4. Refresh the web app

---

### 2. LatestPublishedVersionNotFound

**Description:**  
The Direct Line token endpoint returns successfully, but when sending messages, the error `LatestPublishedVersionNotFound` appears.

**Reason:**  
The agent has never been published, or the latest changes haven't been published. The token endpoint works for unpublished agents, but actual conversations require a published version.

**Solution:**  
1. Go to Copilot Studio → Publish → **Publish agent**
2. Wait for publishing to complete
3. Refresh the web app

---

### 3. Cannot Publish Agent - Trial License Limitation

**Description:**  
The "Publish" button is disabled or publishing fails with license-related errors.

**Reason:**  
Copilot Studio trial licenses have limitations:
- Cannot publish to production environments
- Limited to test/demo within the Copilot Studio interface
- Some environments (like Developer environments) may have restrictions

**Solution:**  
- Use an environment with a **proper Copilot Studio license** (not trial)
- Use the **Default environment** which often has fewer restrictions
- Ask an admin to assign appropriate licenses

---

### 4. DLP Policy Blocking Direct Line

**Description:**  
In Microsoft corporate tenant, the Direct Line channel is blocked by DLP (Data Loss Prevention) policies.

**Reason:**  
Enterprise security policies may classify Direct Line as a "blocked" connector to prevent data exfiltration through external channels.

**Solution:**  
- Use a different tenant without DLP restrictions
- Request DLP exception from IT admin
- Use Contoso/Demo tenant for demos

---

### 5. Authentication Setting Locked by Policy

**Description:**  
The "No authentication" option in Copilot Studio is grayed out or locked.

**Reason:**  
Tenant-level policies can enforce authentication requirements for all agents.

**Solution:**  
- Use a different environment/tenant without these policies
- Contact Power Platform admin to unlock the setting
- Use a demo tenant (e.g., MngEnvMCAP tenant)

---

### 6. Vite 504 Outdated Optimize Dep Error

**Description:**  
Client shows blank page with Vite error `504 Outdated Optimize Dep` in console.

**Reason:**  
Vite's dependency pre-bundling cache is stale after package changes.

**Solution:**  
```bash
# Clear Vite cache and restart
Remove-Item -Path "node_modules/.vite" -Recurse -Force
npm run dev
```

---

### 7. Missing ES5 Packages (p-defer-es5, markdown-it-attrs-es5, abort-controller-es5)

**Description:**  
Build errors about missing ES5 compatibility packages required by botframework-webchat.

**Reason:**  
Bot Framework WebChat has dependencies on ES5-compatible versions of certain packages that aren't automatically installed.

**Solution:**  
```bash
npm install p-defer-es5 markdown-it-attrs-es5 abort-controller-es5
```

Also update `vite.config.ts`:
```typescript
optimizeDeps: {
  include: [
    'botframework-webchat',
    'p-defer-es5',
    'markdown-it-attrs-es5',
    'abort-controller-es5',
  ],
}
```

---

### 8. RxJS Compatibility Issues

**Description:**  
Errors related to RxJS observables or missing RxJS methods.

**Reason:**  
Bot Framework packages may require specific RxJS versions.

**Solution:**  
```bash
npm install rxjs@7 rxjs-compat
```

---

### 9. Direct Line Speech "Connecting" Forever

**Description:**  
Direct Line Speech mode stays in "Connecting" state indefinitely without errors.

**Reason:**  
Direct Line Speech channel (`botframework-directlinespeech-sdk`) requires:
- A Bot Framework bot registered with **Direct Line Speech channel** in Azure Bot Service
- Copilot Studio uses standard Direct Line, NOT Direct Line Speech

**Solution:**  
For Copilot Studio, use **Speech Ponyfill** mode instead:
- Direct Line for messaging (works with Copilot Studio)
- Azure Speech Services ponyfill for voice

---

### 10. Azure AD Token for Speech Services Fails

**Description:**  
Speech token generation fails when using Azure AD authentication.

**Reason:**  
Azure AD authentication for Cognitive Services requires:
- Custom subdomain enabled on the Speech resource
- Proper RBAC role assignments (Cognitive Services User)
- User must be logged in with `az login`

**Solution:**  
1. Enable custom subdomain on Speech resource
2. Assign "Cognitive Services User" role to your account
3. Run `az login` before starting the server
4. Set `SPEECH_KEY=USE_AZURE_AD` in `.env`

---

### 11. Service Tree ID Required for App Registration

**Description:**  
Cannot create Azure App Registration in Microsoft corporate tenant.

**Reason:**  
Microsoft's internal policies require a Service Tree ID for all app registrations.

**Solution:**  
- Use a demo/partner tenant without this requirement
- Create app registration in Contoso tenant

---

## Quick Reference: Environment Comparison

| Environment | Publish | No Auth | Direct Line | Notes |
|------------|---------|---------|-------------|-------|
| Microsoft Corp | ❌ Blocked | ❌ Locked | ❌ DLP | Enterprise policies |
| Contoso Trial | ❌ License | ✅ Available | ✅ Works | Trial limitations |
| Contoso Default | ✅ Works | ✅ Available | ✅ Works | **Use this!** |

---

## Demo Checklist

Before demo, verify:
- [ ] Agent published with "No authentication"
- [ ] Direct Line token endpoint returns token
- [ ] Speech Services token endpoint returns token
- [ ] Server running on port 3001
- [ ] Client running on port 5173
- [ ] Test "hello" message gets response

---

## Useful Commands

```powershell
# Check both servers running
netstat -ano | Select-String ":3001|:5173"

# Test Direct Line token
Invoke-RestMethod -Uri "http://localhost:3001/api/directline/token"

# Test Speech token
Invoke-RestMethod -Uri "http://localhost:3001/api/speechservices/ponyfillKey"

# Kill all node processes
taskkill /F /IM node.exe

# Start servers
cd C:\Demos\THR505-Voice-Demo\server; npm run dev
cd C:\Demos\THR505-Voice-Demo\client; npm run dev
```

---

## True Direct Line Speech (DLS) Issues

### 12. True DLS Shows "DLS Connected" but Web Chat Stuck on "Connecting..."

**Description:**  
When using the True DLS tab, the status bar shows "DLS Connected (eastus)" indicating the Speech SDK connected successfully, but the Web Chat component shows "Connecting..." indefinitely.

**Root Cause:**  
The DLS SDK connects to Speech Services, but Azure Bot Service needs to know which bot to route the connection to. This is controlled by the `isDefaultBotForCogSvcAccount` setting on the DLS channel.

When `isDefaultBotForCogSvcAccount: false`, the Speech Services doesn't know which bot to forward the audio/messages to.

**The Catch-22:**  
Setting `isDefaultBotForCogSvcAccount: true` via the Azure API requires the Speech resource to have `disableLocalAuth: false` (keys enabled). However, many enterprise Speech resources have `disableLocalAuth: true` enforced by policy.

**Error When Trying to Set isDefaultBotForCogSvcAccount:**
```json
{"error":{"code":"InvalidChannelData","message":"\"Invalid subscription ID\""}}
```
This misleading error occurs because the Bot Service API can't validate the connection to a Speech resource that has local auth disabled.

**Current Configuration Check:**
```powershell
# Check DLS channel settings
az rest --method get --url "https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{rg}/providers/Microsoft.BotService/botServices/{botName}/channels/DirectLineSpeechChannel?api-version=2022-09-15" --query "properties.properties"

# Check Speech resource local auth setting
az cognitiveservices account show --name {speechName} --resource-group {rg} --query "properties.disableLocalAuth"
```

**Solutions:**

1. **Enable local auth on Speech resource (if allowed by policy):**
   ```powershell
   az rest --method patch --url "https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{rg}/providers/Microsoft.CognitiveServices/accounts/{speechName}?api-version=2023-05-01" --body '{"properties":{"disableLocalAuth":false}}' --headers "Content-Type=application/json"
   ```

2. **Use Azure Portal to configure DLS channel:**
   - Go to Azure Portal → Bot Services → Your Bot
   - Click Channels → Direct Line Speech
   - Check "Set as default bot for this Speech resource" (if option exists)
   - Save

3. **Use a different Speech resource with local auth enabled:**
   - Create a new Speech resource without `disableLocalAuth: true`
   - Link it to the DLS channel
   - Update server `.env` with the new endpoint

4. **Recommended for demos: Use Speech Ponyfill instead:**
   - Speech Ponyfill works with Copilot Studio
   - Direct Line for messaging + Speech Services for voice
   - No DLS channel complexity required

---

### 13. AAD Token Format for DLS with Custom Domain

**Description:**  
When using Azure AD authentication with a Speech resource that has a custom domain and `disableLocalAuth: true`, the DLS SDK needs a special token format.

**Solution:**  
The token must be formatted as: `aad#<endpoint>#<token>`

```typescript
// In the DLS hook
const dlsAdapters = await createAdapters({
  fetchCredentials: async () => ({
    authorizationToken: `aad#${aadToken.endpoint}#${aadToken.token}`,
    region: aadToken.region,
  }),
  speechRecognitionLanguage: 'en-US',
});
```

The server endpoint `/api/speechservices/aadToken` returns the raw AAD token and endpoint for this purpose.

---

### 14. Speech Resource Custom Domain Required for AAD Auth

**Description:**  
Azure AD authentication fails with 401 or 400 errors when trying to get Speech tokens.

**Root Cause:**  
Azure AD authentication for Cognitive Services REQUIRES a custom domain to be configured on the Speech resource. Without it, the token endpoint URL format is different.

**Solution:**
```powershell
# Add custom domain to Speech resource
az cognitiveservices account update --name {speechName} --resource-group {rg} --custom-domain "your-custom-domain-name"
```

After this, the Speech resource endpoint changes from:
- `https://eastus.api.cognitive.microsoft.com` (region-based)
to:
- `https://your-custom-domain-name.cognitiveservices.azure.com` (custom domain)

Update `SPEECH_RESOURCE_ENDPOINT` in server `.env` accordingly.

---

### 15. Cognitive Services User Role Required

**Description:**  
401 Unauthorized errors when fetching Speech tokens using Azure AD authentication.

**Root Cause:**  
The user running the server needs the "Cognitive Services User" RBAC role on the Speech resource.

**Solution:**
```powershell
# Assign Cognitive Services User role
az role assignment create --role "Cognitive Services User" --assignee "your-email@domain.com" --scope "/subscriptions/{subscriptionId}/resourceGroups/{rg}/providers/Microsoft.CognitiveServices/accounts/{speechName}"
```

Note: Assigning roles requires "User Access Administrator" or "Owner" role on the resource.

---

### 16. Duplicate Function Declaration in api.ts

**Description:**  
Blank page on the client with no visible errors, but TypeScript compilation shows "Duplicate function implementation" error.

**Root Cause:**  
The `fetchAADToken` function was defined twice in `api.ts` due to incremental edits.

**Solution:**  
Search for duplicate function declarations and remove them:
```powershell
# Check for TypeScript errors
cd client
npx tsc --noEmit
```

---

## Azure Resource Summary for True DLS

| Resource | Setting | Required Value | Notes |
|----------|---------|----------------|-------|
| Speech Resource | `customSubDomainName` | Set (any name) | Required for AAD auth |
| Speech Resource | `disableLocalAuth` | `false` (ideally) | Required to set isDefaultBot |
| Bot DLS Channel | `cognitiveServiceResourceId` | Full resource ID | Links to Speech resource |
| Bot DLS Channel | `isDefaultBotForCogSvcAccount` | `true` | Routes DLS connections to bot |
| RBAC | Cognitive Services User | Assigned | Required for AAD token generation |

---

### 17. Using fromBotId Parameter as Alternative to isDefaultBotForCogSvcAccount

**Description:**  
The Python/C# Cognitive Services Speech SDK supports a `bot_id` parameter in `BotFrameworkConfig` which allows specifying which bot to connect to WITHOUT needing `isDefaultBotForCogSvcAccount: true`.

```python
# Python example
from azure.cognitiveservices.speech.dialog import BotFrameworkConfig
config = BotFrameworkConfig(
    subscription="YOUR_KEY",
    region="eastus",
    bot_id="YOUR_BOT_APP_ID"  # <-- This bypasses isDefaultBot requirement
)
```

**Web Chat DLS SDK Limitation:**  
The Web Chat `createDirectLineSpeechAdapters` (from `botframework-directlinespeech-sdk`) does NOT expose the `bot_id` parameter. It uses `BotFrameworkConfig` internally but only passes:
- `authorizationToken` or `subscriptionKey`
- `region` or `directLineSpeechHostname`

**Workaround Attempts:**
1. Tried setting properties on the BotFrameworkConfig - not exposed
2. Tried using PropertyId constants - SDK doesn't accept them
3. The underlying Speech SDK's `Conversation_From_Id` is for user ID, not bot ID

**Conclusion:**  
The Web Chat DLS SDK does not support specifying a target bot ID directly. The only way to use True DLS with Web Chat is:
1. Set `isDefaultBotForCogSvcAccount: true` on the DLS channel (requires `disableLocalAuth: false`)
2. OR use a dedicated Speech resource linked to only ONE bot

---

### 18. True DLS vs Speech Ponyfill Comparison

| Feature | True DLS | Speech Ponyfill |
|---------|----------|-----------------|
| **Protocol** | WebSocket to Speech Services | Direct Line + Speech REST API |
| **Latency** | Lower (direct audio stream) | Higher (separate calls) |
| **Bot Compatibility** | Bot Framework bots with DLS channel | Any Direct Line bot including Copilot Studio |
| **Setup Complexity** | High (DLS channel config, isDefaultBot) | Low (just Speech token) |
| **Enterprise AAD** | Problematic (disableLocalAuth blocks config) | Works well with AAD |
| **Copilot Studio** | ❌ Not compatible | ✅ Works perfectly |
| **Audio Streaming** | Real-time bidirectional | Request/response |

**Recommendation for Demos:**  
Use **Speech Ponyfill** approach for demos because:
- Works with Copilot Studio agents
- No complex DLS channel configuration
- Works with enterprise Speech resources (disableLocalAuth: true)
- Same end-user voice experience
- More reliable in enterprise environments

---

## Current Status Summary (Updated)

| Mode | Status | Notes |
|------|--------|-------|
| Speech Ponyfill (Blue) | ✅ Working | Use this for demos with Copilot Studio |
| Direct Line British (Green) | ✅ Working | Text-only with British voice |
| True DLS (Purple) | ⚠️ Blocked | Requires `isDefaultBotForCogSvcAccount: true` |
| IVR/Telephony (Orange) | ⚠️ Config Required | Needs Azure Communication Services |

**The True DLS tab demonstrates the SDK connection but cannot route to the bot due to Azure configuration limitations with enterprise Speech resources.**
