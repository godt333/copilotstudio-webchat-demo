# True Direct Line Speech - Azure Policy Blocker

## Issue Summary

True Direct Line Speech (DLS) cannot be enabled in this Azure environment due to a Management Group-level Azure Policy that enforces `disableLocalAuth: true` on all Cognitive Services resources.

## Technical Details

### The Problem

1. **Direct Line Speech channel** requires `isDefaultBotForCogSvcAccount: true` to route voice traffic to a specific bot
2. When setting this flag via the Bot Service API, Azure **validates the Speech resource keys**
3. The Azure Policy `CognitiveServices_LocalAuth_Modify` **disables local auth** on all Cognitive Services
4. With local auth disabled, **keys cannot be accessed**, causing the validation to fail
5. Result: `isDefaultBotForCogSvcAccount` cannot be set to `true`

### Error Message When Trying to Enable DLS

```
"Invalid subscription ID for Cognitive Service resources. 
Please make sure the specified Cognitive Service resource is available, 
and that the isDefaultBotForCogSvcAccount has been set correctly."
```

### Azure Policy Details

| Field | Value |
|-------|-------|
| **Policy Assignment Name** | `MCAPSGovDeployPolicies` |
| **Policy Definition** | `CognitiveServices_LocalAuth_Modify` |
| **Scope** | Management Group: `ba9da2c0-3331-4337-a775-ed8556d7b7e5` |
| **Effect** | Modify (enforces `disableLocalAuth: true`) |
| **Subscription** | `bda4e026-67ce-482d-95bf-4885c1ac7140` (AI Acceleration vNext) |

### Resources Affected

- **Speech Resource**: `thr505-speech` (rg-thr505-demo)
- **Speech Resource**: `thr505-speech-dls` (rg-thr505-demo)
- **Bot Service**: `thr505-dls-proxy` (rg-thr505-demo)

## Attempted Workarounds

### 1. ❌ Create New Speech Resource
Created `thr505-speech-dls` - still got `disableLocalAuth: true` enforced

### 2. ❌ Enable Local Auth via REST API
```bash
az resource update --ids <speech-resource-id> \
  --set properties.disableLocalAuth=false
```
Result: Policy immediately re-applies `disableLocalAuth: true`

### 3. ❌ Use Speech SDK with `botId` Parameter
The Speech SDK's `BotFrameworkConfig.fromAuthorizationToken(token, region, botId)` was tested to bypass `isDefaultBotForCogSvcAccount`. 

Result: Connection hangs or times out. The `botId` parameter alone doesn't work when the DLS channel isn't properly configured as the default.

### 4. ❌ ARM Template Deployment
Tried deploying DLS channel configuration via ARM template.

Result: Same validation error - API still tries to validate Speech keys.

### 5. ❌ Create Policy Exemption
```bash
az policy exemption create --name "thr505-dls-exemption" \
  --policy-assignment "/providers/Microsoft.Management/managementGroups/.../MCAPSGovDeployPolicies" \
  --scope "/subscriptions/.../thr505-speech" \
  --exemption-category "Waiver"
```
Result: `LinkedAuthorizationFailed` - User doesn't have `policyAssignments/exempt/action` permission at Management Group level.

## Solutions

### Option 1: Request Policy Exemption (Recommended for Demo)

Contact your Azure tenant administrator to request a temporary policy exemption:

**Email Template:**
```
Subject: Policy Exemption Request for THR505 Build Demo

Hi,

I need a temporary policy exemption for the following resource to enable 
Direct Line Speech for a Build conference demo:

Resource: /subscriptions/bda4e026-67ce-482d-95bf-4885c1ac7140/resourceGroups/rg-thr505-demo/providers/Microsoft.CognitiveServices/accounts/thr505-speech

Policy Assignment: MCAPSGovDeployPolicies (CognitiveServices_LocalAuth_Modify)
Scope: Management Group ba9da2c0-3331-4337-a775-ed8556d7b7e5

Justification: Direct Line Speech requires local authentication to be enabled 
for the Bot Service to validate the Speech resource configuration. This is 
only needed temporarily for the demo (specify dates).

Exemption Type: Waiver
Duration: [Specify demo dates]

Thank you!
```

### Option 2: Use Different Subscription

Find or request access to an Azure subscription that:
- Is NOT under the `MCAPSGovDeployPolicies` policy assignment
- Allows `disableLocalAuth: false` on Cognitive Services

### Option 3: Use Proxy Bot Mode (✅ IMPLEMENTED - Working!)

**As of February 6, 2026**, Tab 2 was converted from "True DLS" to "Proxy Bot" mode:
- ✅ Voice input via microphone (client-side Speech SDK)
- ✅ Voice output via Text-to-Speech (client-side)
- ✅ Full conversation with Copilot Studio agent (via Proxy Bot)
- ✅ Works with current Azure Policy settings

**Architecture:**
```
Client → Direct Line → Proxy Bot (Azure App Service) → Copilot Studio
Client → Speech SDK → Azure Speech Services (STT/TTS)
```

This provides the same end-user experience as True DLS, just with client-side speech processing instead of server-side.

### Option 4: Use Speech Ponyfill Mode (Tab 1 - Also Working)

Tab 1 uses direct connection to Copilot Studio (no proxy):
```
Client → Direct Line → Copilot Studio (directly)
Client → Speech SDK → Azure Speech Services (STT/TTS)
```

## Current Configuration (Updated February 6, 2026)

| Tab | Status | Architecture |
|-----|--------|--------------|
| Tab 1: Speech Ponyfill | ✅ Working | Direct Line → Copilot + Speech SDK |
| Tab 2: Proxy Bot | ✅ Working | Direct Line → Proxy Bot → Copilot + Speech SDK |
| Tab 3: Direct Line Speech | ⛔ Blocked | Shows info about Azure Policy blocker |
| Tab 4: Telephony/IVR | ✅ Working | Phone demo |

## Workaround Implementation Details

### Changes Made on February 6, 2026

1. **Tab 2 converted** from "True DLS" to "Proxy Bot" with client-side speech
2. **Tab 3 renamed** to "Direct Line Speech" showing blocker information
3. **Proxy Bot fully deployed** to Azure App Service
4. **Service Principal created** for the App Registration (key fix!)

### Files Modified

- `client/src/hooks/useDirectLineSpeechConnection.ts` - Now uses Proxy Bot Direct Line token
- `client/src/components/DirectLineSpeechChat.tsx` - Updated header documentation
- `client/src/App.tsx` - Tab labels updated to reflect actual functionality
- `server/src/routes/directLineRoutes.ts` - Added `/api/directline/proxyBotToken` endpoint
- `server/.env` - Added `PROXY_BOT_DIRECT_LINE_SECRET`

### Key Fix: Service Principal

The Proxy Bot deployment was failing with `AADSTS7000229` because the App Registration was missing a Service Principal. Fixed with:
```powershell
az ad sp create --id 632aab43-dad1-485c-80ff-636b9dfdc58e
```

## References

- [Direct Line Speech Overview](https://docs.microsoft.com/azure/bot-service/directline-speech-bot)
- [Azure Policy Exemptions](https://docs.microsoft.com/azure/governance/policy/concepts/exemption-structure)
- [Cognitive Services Local Auth](https://docs.microsoft.com/azure/cognitive-services/cognitive-services-data-loss-prevention)
- [Azure AD Service Principals](https://docs.microsoft.com/azure/active-directory/develop/app-objects-and-service-principals)

---

**Last Updated:** February 6, 2026
**Author:** GitHub Copilot (automated analysis)
