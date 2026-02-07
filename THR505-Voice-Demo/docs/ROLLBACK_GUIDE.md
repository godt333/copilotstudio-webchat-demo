# Rollback Guide - Direct Line Speech Changes

This document describes how to rollback the Direct Line Speech proxy bot changes if needed.

## Current State

After the DLS proxy bot implementation, the codebase has:

### Working Components (Unchanged)
- ✅ **Speech Ponyfill (US)** - Uses Direct Line + Azure Speech Services
- ✅ **Telephony / IVR** - Uses Azure Communication Services

### New Components (Can be Rolled Back)
- 🆕 **Direct Line Speech (British)** - Currently uses Direct Line + Speech ponyfill (same as Ponyfill mode but with British voice)
- 🆕 **proxy-bot/** folder - DLS proxy bot for true Direct Line Speech (not yet deployed)
- 🆕 **useDirectLineSpeechConnectionDLS.ts** - Hook for true DLS (not yet in use)

## Rollback Scenarios

### Scenario 1: Remove DLS Proxy Bot (Keep Current UI)

If you decide not to deploy the DLS proxy bot, simply:

1. Delete the `proxy-bot/` folder:
   ```powershell
   Remove-Item -Recurse -Force proxy-bot
   ```

2. Delete the unused hook:
   ```powershell
   Remove-Item client/src/hooks/useDirectLineSpeechConnectionDLS.ts
   ```

3. The UI will continue to work with the Speech Ponyfill approach for both modes.

### Scenario 2: Restore Original Direct Line Speech Hook

If you want to restore the original (non-working) DLS implementation:

```powershell
# Restore from git
git checkout HEAD~5 -- client/src/hooks/useDirectLineSpeechConnection.ts
```

Or manually replace with this original code:

```typescript
// Original useDirectLineSpeechConnection.ts that used botframework-directlinespeech-sdk
// Note: This does NOT work with Copilot Studio!
import { createAdapters } from 'botframework-directlinespeech-sdk';
// ... rest of original implementation
```

### Scenario 3: Remove British/US Voice Differentiation

To go back to single voice mode:

1. Edit `client/src/App.tsx` and change MODE_CONFIG back to:
   ```typescript
   const MODE_CONFIG = {
     directlinespeech: {
       icon: '🎤',
       label: 'Direct Line Speech',
       description: 'Unified voice + text channel',
       badge: 'Voice',
     },
     ponyfill: {
       icon: '🔊',
       label: 'Speech Ponyfill',
       description: 'Direct Line + Azure Speech Services',
       badge: 'Voice',
     },
     // ...
   };
   ```

2. Edit `useDirectLineSpeechConnection.ts` to use the default voice instead of British.

### Scenario 4: Complete Rollback to Pre-Change State

To completely undo all DLS-related changes:

```powershell
# View the commits
git log --oneline -10

# Reset to the commit before DLS changes
git reset --hard <commit-hash-before-changes>

# Or revert specific files
git checkout <commit-hash> -- client/src/hooks/useDirectLineSpeechConnection.ts
git checkout <commit-hash> -- client/src/components/DirectLineSpeechChat.tsx
git checkout <commit-hash> -- client/src/App.tsx

# Remove new folders
Remove-Item -Recurse -Force proxy-bot
Remove-Item client/src/hooks/useDirectLineSpeechConnectionDLS.ts
Remove-Item docs/DIRECT_LINE_SPEECH_PROXY.md
Remove-Item docs/ROLLBACK_GUIDE.md
```

## Azure Resources Cleanup

If you deployed the DLS proxy bot to Azure and want to remove it:

```powershell
# Delete the entire resource group
az group delete --name rg-dls-proxy-demo --yes

# Or delete individual resources
az bot delete --resource-group <rg> --name <bot-name>
az webapp delete --resource-group <rg> --name <app-name>
az appservice plan delete --resource-group <rg> --name <plan-name>

# Delete the Azure AD app registration
az ad app delete --id <app-id>
```

## Files Changed Summary

| File | Change Type | Rollback Action |
|------|-------------|-----------------|
| `client/src/hooks/useDirectLineSpeechConnection.ts` | Modified | Git restore |
| `client/src/components/DirectLineSpeechChat.tsx` | Modified | Git restore |
| `client/src/App.tsx` | Modified | Git restore |
| `client/src/components/SpeechPonyfillChat.tsx` | Modified | Git restore |
| `client/src/hooks/useDirectLineSpeechConnectionDLS.ts` | New | Delete |
| `proxy-bot/*` | New | Delete folder |
| `docs/DIRECT_LINE_SPEECH_PROXY.md` | New | Delete |
| `docs/ROLLBACK_GUIDE.md` | New | Delete |

## Verification After Rollback

After rollback, verify:

1. **Speech Ponyfill mode works**: Click "Speech Ponyfill", test voice
2. **Telephony IVR works**: Click "Telephony / IVR", verify modal appears
3. **No console errors**: Check browser DevTools for errors
4. **Server starts**: Run `npm run dev` in server folder

---

*Created: February 4, 2026*
