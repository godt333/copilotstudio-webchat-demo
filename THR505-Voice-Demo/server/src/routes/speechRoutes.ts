/**
 * Speech Services Routes
 * ======================
 * API endpoints for Azure Speech Services token issuance.
 * 
 * These endpoints provide short-lived tokens to the frontend client,
 * keeping credentials secure on the server side.
 * 
 * AUTHENTICATION:
 * This version uses Azure AD authentication (DefaultAzureCredential)
 * which works with Azure CLI login, Managed Identity, or other Azure AD methods.
 * This is required for subscriptions that enforce "disableLocalAuth: true".
 * 
 * Two endpoints are provided:
 * 1. /token - For Direct Line Speech (unified speech + messaging)
 * 2. /ponyfillKey - For Speech Ponyfill (separate speech layer)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { DefaultAzureCredential } from '@azure/identity';
import axios from 'axios';
import { config } from '../config/env';

const router = Router();

/**
 * Azure AD Credential for authentication
 * Uses DefaultAzureCredential which tries multiple authentication methods:
 * 1. Environment variables
 * 2. Managed Identity
 * 3. Azure CLI
 * 4. Azure PowerShell
 */
const credential = new DefaultAzureCredential();

/**
 * Token cache to reduce API calls to Azure
 * Speech tokens are valid for 10 minutes, so we cache them
 */
interface CachedToken {
  token: string;
  expiresAt: number;
}

let cachedSpeechToken: CachedToken | null = null;

/**
 * Fetches a new authorization token from Azure Speech Services using Azure AD
 * 
 * This uses Azure AD authentication to get an access token for Speech Services.
 * The token can then be used by clients to authenticate with Speech SDK.
 * 
 * @returns Promise<string> The authorization token
 */
async function fetchSpeechToken(): Promise<string> {
  console.log(`🔑 Fetching Speech token using Azure AD authentication...`);
  
  // First, check if we have a Speech key (for subscriptions that allow it)
  if (config.speech.key && config.speech.key !== 'YOUR_SPEECH_KEY_HERE' && config.speech.key !== 'USE_AZURE_AD') {
    // Use the traditional key-based approach
    const tokenEndpoint = `https://${config.speech.region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;
    
    console.log(`🔑 Using Speech key authentication`);
    
    const response = await axios.post(
      tokenEndpoint,
      null,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': config.speech.key,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    return response.data;
  }
  
  // Use Azure AD authentication
  console.log(`🔐 Using Azure AD authentication for Speech Services`);
  
  // Get an access token for Cognitive Services
  const tokenResponse = await credential.getToken('https://cognitiveservices.azure.com/.default');
  
  if (!tokenResponse || !tokenResponse.token) {
    throw new Error('Failed to get Azure AD token for Speech Services');
  }
  
  // Now use this token to get a Speech Services token
  // For Azure AD auth, we use the resource endpoint with the custom domain
  const speechEndpoint = config.speech.resourceEndpoint || `https://${config.speech.region}.api.cognitive.microsoft.com`;
  const tokenEndpoint = `${speechEndpoint}/sts/v1.0/issueToken`;
  
  console.log(`📍 Token endpoint: ${tokenEndpoint}`);
  
  const response = await axios.post(
    tokenEndpoint,
    null,
    {
      headers: {
        'Authorization': `Bearer ${tokenResponse.token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  
  return response.data;
}

/**
 * Gets a cached speech token or fetches a new one
 * Tokens are cached for ~8 minutes (leaving 2 minutes buffer before expiry)
 */
async function getSpeechToken(): Promise<string> {
  const now = Date.now();
  const bufferMs = 2 * 60 * 1000; // 2 minutes buffer
  
  if (cachedSpeechToken && cachedSpeechToken.expiresAt > now + bufferMs) {
    console.log('📋 Using cached Speech token');
    return cachedSpeechToken.token;
  }
  
  const token = await fetchSpeechToken();
  
  // Cache the token (valid for 10 minutes = 600,000ms)
  cachedSpeechToken = {
    token,
    expiresAt: now + (10 * 60 * 1000),
  };
  
  return token;
}

/**
 * GET /api/speechservices/token
 * 
 * Returns a Speech Services token for Direct Line Speech integration.
 * This token is used by the WebChat Direct Line Speech adapters to:
 * - Authenticate with Azure Speech Services
 * - Establish the speech connection alongside the bot connection
 * 
 * Response format:
 * {
 *   "token": "eyJ...",           // Authorization token (bearer)
 *   "region": "westus2",         // Azure region
 *   "expiresIn": 540,            // Seconds until expiry
 *   "locale": "en-US",           // Default speech locale
 *   "voice": "en-US-JennyNeural" // Default TTS voice
 * }
 * 
 * DEMO NOTE: Show this endpoint being called in the browser DevTools Network tab
 * to demonstrate how tokens are fetched without exposing the subscription key.
 */
router.get('/token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`📞 [${new Date().toISOString()}] GET /api/speechservices/token`);
    
    const token = await getSpeechToken();
    
    // Extract custom domain hostname for DLS SDK (e.g. 'thr505-dls-speech.cognitiveservices.azure.com')
    // When a Speech resource has a custom domain, the regional endpoint doesn't work for DLS.
    const customDomainHost = config.speech.resourceEndpoint
      ? new URL(config.speech.resourceEndpoint).hostname
      : undefined;

    const response = {
      token,
      region: config.speech.region,
      expiresIn: config.tokens.speechTokenExpiresInSeconds,
      locale: config.speech.defaultLocale,
      voice: config.speech.defaultVoice,
      speechKey: config.speech.key || undefined,
      customDomainHost,
    };
    
    console.log(`✅ Speech token issued for region: ${config.speech.region}`);
    res.json(response);
    
  } catch (error: any) {
    console.error('❌ Error fetching Speech token:', error.message);
    next(error);
  }
});

/**
 * GET /api/speechservices/ponyfillKey
 * 
 * Returns credentials for the Speech Ponyfill approach.
 * This is used when the frontend uses standard Direct Line for messaging
 * but adds speech capabilities via a separate Web Speech API ponyfill.
 * 
 * The ponyfill factory needs:
 * - Either a token or a subscription key (we prefer token for security)
 * - The Azure region
 * - Optional: voice and locale configuration
 * 
 * Response format:
 * {
 *   "token": "eyJ...",           // Authorization token (preferred over key)
 *   "region": "westus2",         // Azure region
 *   "expiresIn": 540,            // Seconds until expiry
 *   "locale": "en-US",           // Speech locale
 *   "voice": "en-US-JennyNeural" // TTS voice name
 * }
 * 
 * DEMO NOTE: Compare this with the /token endpoint - same credentials,
 * but used differently in the frontend (ponyfill vs Direct Line Speech).
 */
router.get('/ponyfillKey', async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`📞 [${new Date().toISOString()}] GET /api/speechservices/ponyfillKey`);
    
    // Allow locale override via query parameter for multi-language demos
    const locale = (req.query.locale as string) || config.speech.defaultLocale;
    const voice = (req.query.voice as string) || config.speech.defaultVoice;
    
    const token = await getSpeechToken();
    
    const response = {
      token,
      region: config.speech.region,
      expiresIn: config.tokens.speechTokenExpiresInSeconds,
      locale,
      voice,
    };
    
    console.log(`✅ Ponyfill credentials issued for locale: ${locale}`);
    res.json(response);
    
  } catch (error: any) {
    console.error('❌ Error fetching ponyfill credentials:', error.message);
    next(error);
  }
});


/**
 * GET /api/speechservices/aadToken
 *
 * Returns the Azure AD token directly for use with custom subdomain + AAD auth.
 * The client needs to format this as: aad#<endpoint>#<token>
 */
router.get('/aadToken', async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(` [${new Date().toISOString()}] GET /api/speechservices/aadToken`);

    // Get Azure AD token for Cognitive Services
    const tokenResponse = await credential.getToken('https://cognitiveservices.azure.com/.default');

    if (!tokenResponse || !tokenResponse.token) {
      throw new Error('Failed to get Azure AD token for Speech Services');
    }

    const response = {
      token: tokenResponse.token,
      endpoint: config.speech.resourceEndpoint || `https://${config.speech.region}.api.cognitive.microsoft.com`,
      region: config.speech.region,
      expiresIn: 3600, // AAD tokens typically last 1 hour
      locale: config.speech.defaultLocale,
      voice: config.speech.defaultVoice,
    };

    console.log(` AAD token issued for endpoint: ${response.endpoint}`);
    res.json(response);

  } catch (error: any) {
    console.error(' Error fetching AAD token:', error.message);
    next(error);
  }
});

export default router;
