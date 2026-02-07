# Copilot Studio Integration Guide

This document explains how to integrate Microsoft Copilot Studio agents into a React web application. There are two primary approaches, each with different authentication requirements and use cases.

## Table of Contents

1. [Overview](#overview)
2. [Approach 1: Token Endpoint (Anonymous Access)](#approach-1-token-endpoint-anonymous-access)
3. [Approach 2: M365 Agents SDK (Authenticated Access)](#approach-2-m365-agents-sdk-authenticated-access)
4. [Comparison](#comparison)
5. [Troubleshooting](#troubleshooting)
6. [References](#references)

---

## Overview

| Approach | Authentication | Best For |
|----------|---------------|----------|
| Token Endpoint | None (Anonymous) | Public websites, citizen services, customer support |
| M365 Agents SDK | Azure AD (User sign-in) | Enterprise apps, Teams integrations, identity-aware bots |

---

## Approach 1: Token Endpoint (Anonymous Access)

### Description

The Token Endpoint approach allows **anonymous users** to chat with your Copilot Studio agent without signing in. This is ideal for public-facing websites.

### How It Works

1. Frontend makes a `GET` request to the Token Endpoint
2. Copilot Studio returns a DirectLine token (no authentication required)
3. Frontend uses the token with `botframework-webchat` to render the chat

### Setup Steps

#### 1. Get the Token Endpoint from Copilot Studio

1. Open your agent in [Copilot Studio](https://copilotstudio.microsoft.com)
2. Go to **Channels** → **Mobile app** (or **Native app**)
3. Copy the **Token Endpoint** URL

Example:
```
https://{environment-id}.environment.api.powerplatform.com/powervirtualagents/botsbyschema/{bot-schema}/directline/token?api-version=2022-03-01-preview
```

#### 2. Configure Environment Variables

```env
# .env file
VITE_COPILOT_TOKEN_ENDPOINT=https://your-environment.../directline/token?api-version=2022-03-01-preview
VITE_BOT_NAME=Citizen Advice
```

#### 3. Frontend Code

```typescript
import ReactWebChat, { createDirectLine } from 'botframework-webchat';

// Fetch token from endpoint (no auth required)
const response = await fetch(TOKEN_ENDPOINT);
const data = await response.json();

// Create DirectLine connection
const directLine = createDirectLine({ token: data.token });

// Render WebChat
<ReactWebChat directLine={directLine} />
```

### Copilot Studio Configuration

- **Settings → Security → Authentication**: Set to **"No authentication"**
- **Knowledge sources**: Use only public websites or uploaded files (no SharePoint/Dataverse)
- **Generative AI**: If using generative features, ensure no authenticated data sources

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `IntegratedAuthenticationNotSupportedInChannel` | Agent uses authenticated knowledge sources or generative AI with auth | Remove SharePoint/Dataverse knowledge sources; disable "Use general knowledge" |
| `401 Unauthorized` | Token endpoint requires authentication | Verify agent is set to "No authentication" |

### Documentation References

- [Publish an agent to mobile or custom apps](https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-connect-bot-to-custom-application)
- [Get Direct Line token](https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-connect-bot-to-custom-application#get-direct-line-token)
- [Configure web and Direct Line channel security](https://learn.microsoft.com/en-us/microsoft-copilot-studio/configure-web-security)

---

## Approach 2: M365 Agents SDK (Authenticated Access)

### Description

The M365 Agents SDK approach requires users to **sign in with Azure AD**. This provides user identity to the bot and enables access to authenticated data sources.

### How It Works

1. User signs in via MSAL (Microsoft Authentication Library)
2. Frontend acquires a token for Power Platform API
3. `CopilotStudioClient` uses the token to connect to the agent
4. `CopilotStudioWebChat.createConnection()` creates a DirectLine-compatible connection
5. Frontend renders WebChat with the connection

### Prerequisites

1. **Azure AD App Registration** with:
   - Redirect URI: `http://localhost:5173` (and your production URL)
   - API Permission: `CopilotStudio.Copilots.Invoke` (delegated) from **Power Platform API**

2. **Power Platform API in Your Tenant**:
   - The Power Platform API (`8578e004-a5c6-46e7-913e-12f58912df43`) must be registered in your tenant
   - This is a first-party Microsoft application

### Registering Power Platform API in Your Tenant

If "Power Platform API" doesn't appear in your tenant's available APIs, an admin must register it:

**Option A: PowerShell**
```powershell
Install-Module AzureAD
Connect-AzureAD
New-AzureADServicePrincipal -AppId 8578e004-a5c6-46e7-913e-12f58912df43
```

**Option B: Admin Consent URL**
```
https://login.microsoftonline.com/{tenant-id}/adminconsent?client_id=8578e004-a5c6-46e7-913e-12f58912df43
```

### Setup Steps

#### 1. Get the Direct Connect URL from Copilot Studio

1. Open your agent in [Copilot Studio](https://copilotstudio.microsoft.com)
2. Go to **Channels** → **Web app**
3. Copy the **Connection string** URL

Example:
```
https://{environment-id}.environment.api.powerplatform.com/copilotstudio/dataverse-backed/authenticated/bots/{bot-schema}/conversations?api-version=2022-03-01-preview
```

#### 2. Create Azure AD App Registration

1. Go to [Azure Portal](https://portal.azure.com) → **App registrations** → **New registration**
2. Name: `Citizen Advice Web Client`
3. Supported account types: Choose based on your needs
4. Redirect URI: `Single-page application` → `http://localhost:5173`

#### 3. Add API Permission

1. Go to **API permissions** → **Add a permission**
2. Select **APIs my organization uses** → Search for **Power Platform API**
3. Select **Delegated permissions** → **CopilotStudio** → **CopilotStudio.Copilots.Invoke**
4. Click **Add permissions**
5. Click **Grant admin consent**

#### 4. Configure Environment Variables

```env
# .env file
VITE_COPILOT_DIRECT_CONNECT_URL=https://your-environment.../authenticated/bots/.../conversations?api-version=2022-03-01-preview
VITE_AZURE_CLIENT_ID=your-app-client-id
VITE_AZURE_TENANT_ID=your-tenant-id
```

#### 5. Frontend Code

```typescript
import { CopilotStudioClient, CopilotStudioWebChat } from '@microsoft/agents-copilotstudio-client';
import { PublicClientApplication } from '@azure/msal-browser';
import ReactWebChat from 'botframework-webchat';
import { FluentThemeProvider } from 'botframework-webchat-fluent-theme';

// Initialize MSAL
const msal = new PublicClientApplication({
  auth: {
    clientId: 'your-client-id',
    authority: 'https://login.microsoftonline.com/your-tenant-id',
    redirectUri: window.location.origin,
  }
});

// Acquire token
const token = await msal.acquireTokenSilent({
  scopes: ['https://api.powerplatform.com/.default']
});

// Create Copilot Studio client
const client = new CopilotStudioClient(connectionSettings, token.accessToken);

// Create DirectLine-compatible connection
const connection = CopilotStudioWebChat.createConnection(client, {
  showTyping: true
});

// Render with Fluent theme
<FluentThemeProvider>
  <ReactWebChat directLine={connection} />
</FluentThemeProvider>
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `AADSTS650057: Invalid resource` | Wrong scope requested | Use `https://api.powerplatform.com/.default` |
| `AADSTS65002: Consent between first party application...` | Power Platform API not registered in tenant | Run the PowerShell command or admin consent URL |
| `Power Platform API not found` | API not available in tenant | Register using admin consent |
| `AADSTS50011: Redirect URI mismatch` | Redirect URI not configured | Add the exact URI to app registration |

### Documentation References

- [M365 Agents SDK npm package](https://www.npmjs.com/package/@microsoft/agents-copilotstudio-client)
- [Power Platform API Authentication](https://learn.microsoft.com/power-platform/admin/programmability-authentication-v2)
- [Configure SSO with Microsoft Entra ID](https://learn.microsoft.com/en-us/microsoft-copilot-studio/configure-sso)

---

## Comparison

| Feature | Token Endpoint | M365 Agents SDK |
|---------|---------------|-----------------|
| User sign-in required | ❌ No | ✅ Yes |
| Anonymous access | ✅ Yes | ❌ No |
| User identity in bot | ❌ No | ✅ Yes |
| SSO with Microsoft 365 | ❌ No | ✅ Yes |
| Access to user's SharePoint | ❌ No | ✅ Yes |
| Complexity | Low | High |
| Azure AD app required | ❌ No | ✅ Yes |
| Power Platform API permission | ❌ No | ✅ Yes |
| Fluent UI theme support | ✅ Yes | ✅ Yes |

### When to Use Each

**Use Token Endpoint when:**
- Building a public website
- Users should not need to sign in
- Bot uses only public knowledge sources
- Simpler deployment is preferred

**Use M365 Agents SDK when:**
- Building an enterprise internal app
- Bot needs to know who the user is
- Bot needs access to user's data (SharePoint, Dataverse)
- Integrating with Teams or SharePoint
- SSO with Microsoft 365 is required

---

## Troubleshooting

### "IntegratedAuthenticationNotSupportedInChannel"

This error occurs when the Copilot Studio agent tries to use authenticated features over an unauthenticated channel (DirectLine).

**Causes:**
1. Generative AI is enabled with "Use general knowledge"
2. Knowledge sources include SharePoint or Dataverse
3. Topics call Power Automate flows with user context

**Solutions:**
1. Go to **Settings → Generative AI** and disable "Use general knowledge"
2. Remove any SharePoint/Dataverse knowledge sources
3. Use only public website knowledge sources
4. Create simple topics without authenticated actions

### Demo Website Shows "You may not have access"

This indicates the agent's authentication settings are misconfigured.

**Solution:**
1. Go to **Settings → Security → Authentication**
2. Set to **"No authentication"**
3. Publish the agent
4. Wait 2-5 minutes for changes to propagate

### Power Platform API Not Available

If you can't find "Power Platform API" when adding permissions:

1. Your tenant may not have it provisioned
2. An admin needs to register it using:
   ```powershell
   New-AzureADServicePrincipal -AppId 8578e004-a5c6-46e7-913e-12f58912df43
   ```

---

## References

### Official Documentation

- [Copilot Studio Documentation](https://learn.microsoft.com/en-us/microsoft-copilot-studio/)
- [Publish to custom apps](https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-connect-bot-to-custom-application)
- [Web channel security](https://learn.microsoft.com/en-us/microsoft-copilot-studio/configure-web-security)
- [Authentication configuration](https://learn.microsoft.com/en-us/microsoft-copilot-studio/configuration-end-user-authentication)
- [SSO with Entra ID](https://learn.microsoft.com/en-us/microsoft-copilot-studio/configure-sso)

### SDKs and Packages

- [@microsoft/agents-copilotstudio-client](https://www.npmjs.com/package/@microsoft/agents-copilotstudio-client)
- [botframework-webchat](https://www.npmjs.com/package/botframework-webchat)
- [botframework-webchat-fluent-theme](https://www.npmjs.com/package/botframework-webchat-fluent-theme)
- [@azure/msal-browser](https://www.npmjs.com/package/@azure/msal-browser)

### GitHub Repositories

- [BotFramework-WebChat](https://github.com/microsoft/BotFramework-WebChat)
- [Copilot Studio Samples](https://github.com/microsoft/CopilotStudioSamples)

---

## Project Structure

```
src/
├── components/
│   └── chat/
│       ├── CopilotStudioChat.tsx    # Token Endpoint approach (anonymous)
│       └── index.ts
├── pages/
│   ├── AgentsSDKFlexibleReactPage.tsx  # M365 Agents SDK approach (authenticated)
│   └── ...
└── App.tsx
```

## Environment Variables

```env
# Token Endpoint approach (anonymous)
VITE_COPILOT_TOKEN_ENDPOINT=https://...
VITE_BOT_NAME=Citizen Advice

# M365 Agents SDK approach (authenticated)
VITE_COPILOT_DIRECT_CONNECT_URL=https://...
VITE_AZURE_CLIENT_ID=your-app-id
VITE_AZURE_TENANT_ID=your-tenant-id
```
