/**
 * Speech Services Routes
 * ======================
 * API endpoints for Azure Speech Services token issuance.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { DefaultAzureCredential } from '@azure/identity';
import axios from 'axios';
import { config } from '../config/env';

const router = Router();

const credential = new DefaultAzureCredential();

interface CachedToken {
  token: string;
  expiresAt: number;
}

let cachedSpeechToken: CachedToken | null = null;

async function fetchSpeechToken(): Promise<string> {
  console.log(`🔑 Fetching Speech token...`);
  
  if (config.speech.key && config.speech.key !== 'YOUR_SPEECH_KEY_HERE' && config.speech.key !== 'USE_AZURE_AD') {
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
  
  console.log(`🔐 Using Azure AD authentication for Speech Services`);
  
  const tokenResponse = await credential.getToken('https://cognitiveservices.azure.com/.default');
  
  if (!tokenResponse || !tokenResponse.token) {
    throw new Error('Failed to get Azure AD token for Speech Services');
  }
  
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

async function getSpeechToken(): Promise<string> {
  const now = Date.now();
  const bufferMs = 2 * 60 * 1000;
  
  if (cachedSpeechToken && cachedSpeechToken.expiresAt > now + bufferMs) {
    console.log('📋 Using cached Speech token');
    return cachedSpeechToken.token;
  }
  
  const token = await fetchSpeechToken();
  
  cachedSpeechToken = {
    token,
    expiresAt: now + (10 * 60 * 1000),
  };
  
  return token;
}

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

router.get('/ponyfillKey', async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`📞 [${new Date().toISOString()}] GET /api/speechservices/ponyfillKey`);
    
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

router.get('/aadToken', async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(` [${new Date().toISOString()}] GET /api/speechservices/aadToken`);

    const tokenResponse = await credential.getToken('https://cognitiveservices.azure.com/.default');

    if (!tokenResponse || !tokenResponse.token) {
      throw new Error('Failed to get Azure AD token for Speech Services');
    }

    const response = {
      token: tokenResponse.token,
      endpoint: config.speech.resourceEndpoint || `https://${config.speech.region}.api.cognitive.microsoft.com`,
      region: config.speech.region,
      expiresIn: 3600,
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
