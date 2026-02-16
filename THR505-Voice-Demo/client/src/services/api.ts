/**
 * API Service
 * ===========
 * Centralized API client for communicating with the backend.
 * Handles token fetching for Direct Line and Speech Services.
 */

// Base URL for API calls - uses Vite's proxy in development
const API_BASE_URL = '/api';

/**
 * Speech Services Token Response
 */
export interface SpeechTokenResponse {
  token: string;
  region: string;
  expiresIn: number;
  locale: string;
  voice: string;
  speechKey?: string;
  customDomainHost?: string;
}

/**
 * Direct Line Token Response
 */
export interface DirectLineTokenResponse {
  token: string;
  conversationId: string;
  expiresIn: number;
  userId: string;
}

/**
 * API Error Response
 */
export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
}

/**
 * Custom error class for API failures
 */
export class ApiRequestError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: 'Unknown Error',
      message: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new ApiRequestError(
      error.message || 'API request failed',
      response.status,
      error.details
    );
  }

  return response.json();
}

/**
 * Fetch Speech Services token for Direct Line Speech
 * 
 * This token is used by the Direct Line Speech adapters to:
 * - Authenticate with Azure Speech Services
 * - Enable speech-to-text and text-to-speech capabilities
 * 
 * @returns Promise<SpeechTokenResponse>
 */
export async function fetchSpeechToken(): Promise<SpeechTokenResponse> {
  console.log('🔑 Fetching Speech Services token...');
  const response = await fetchJson<SpeechTokenResponse>(
    `${API_BASE_URL}/speechservices/token`
  );
  console.log(`✅ Speech token received for region: ${response.region}`);
  return response;
}

/**
 * AAD Token Response for True DLS with Azure AD auth
 */
export interface AADTokenResponse {
  token: string;
  endpoint: string;
  region: string;
  expiresIn: number;
  locale: string;
  voice: string;
}

/**
 * Fetch Azure AD token for True Direct Line Speech
 * 
 * When disableLocalAuth is true on the Speech resource, DLS needs
 * Azure AD authentication. The token is used with the custom domain.
 * 
 * @returns Promise<AADTokenResponse>
 */
export async function fetchAADToken(): Promise<AADTokenResponse> {
  console.log('🔐 Fetching Azure AD token for DLS...');
  const response = await fetchJson<AADTokenResponse>(
    `${API_BASE_URL}/speechservices/aadToken`
  );
  console.log(`✅ AAD token received for endpoint: ${response.endpoint}`);
  return response;
}

/**
 * Fetch Speech Services credentials for ponyfill
 * 
 * Similar to fetchSpeechToken, but used by the Speech Ponyfill approach
 * where Direct Line handles messaging and this adds speech capabilities.
 * 
 * @param locale - Optional locale override (e.g., 'es-ES' for Spanish)
 * @param voice - Optional voice override (e.g., 'es-ES-ElviraNeural')
 * @returns Promise<SpeechTokenResponse>
 */
export async function fetchPonyfillCredentials(
  locale?: string,
  voice?: string
): Promise<SpeechTokenResponse> {
  console.log('🔑 Fetching ponyfill credentials...');
  
  const params = new URLSearchParams();
  if (locale) params.append('locale', locale);
  if (voice) params.append('voice', voice);
  
  const url = `${API_BASE_URL}/speechservices/ponyfillKey${params.toString() ? `?${params}` : ''}`;
  const response = await fetchJson<SpeechTokenResponse>(url);
  
  console.log(`✅ Ponyfill credentials received for locale: ${response.locale}`);
  return response;
}

/**
 * Fetch Direct Line token for standard messaging
 * 
 * This token is used to connect to Copilot Studio via Direct Line.
 * Used by the Speech Ponyfill approach where Direct Line handles
 * all messaging and a separate ponyfill handles speech.
 * 
 * @param userId - Optional user ID to bind to the token
 * @param userName - Optional display name for the user
 * @returns Promise<DirectLineTokenResponse>
 */
export async function fetchDirectLineToken(
  userId?: string,
  userName?: string
): Promise<DirectLineTokenResponse> {
  console.log('🔑 Fetching Direct Line token...');
  
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);
  if (userName) params.append('userName', userName);
  
  const url = `${API_BASE_URL}/directline/token${params.toString() ? `?${params}` : ''}`;
  const response = await fetchJson<DirectLineTokenResponse>(url);
  
  console.log(`✅ Direct Line token received for conversation: ${response.conversationId}`);
  return response;
}

/**
 * Refresh an existing Direct Line token
 * 
 * Tokens expire after 30 minutes. Call this before expiry to maintain
 * the conversation session without reconnecting.
 * 
 * @param token - The current token to refresh
 * @returns Promise<{ token: string; expiresIn: number }>
 */
export async function refreshDirectLineToken(
  token: string
): Promise<{ token: string; expiresIn: number }> {
  console.log('🔄 Refreshing Direct Line token...');
  
  const response = await fetchJson<{ token: string; expiresIn: number }>(
    `${API_BASE_URL}/directline/refresh`,
    {
      method: 'POST',
      body: JSON.stringify({ token }),
    }
  );
  
  console.log('✅ Token refreshed successfully');
  return response;
}

/**
 * Fetch Direct Line token for the Proxy Bot
 * 
 * This connects to the Azure Bot Service proxy bot (thr505-dls-proxy)
 * which forwards messages to Copilot Studio with middleware capabilities.
 * 
 * Architecture: Client → Proxy Bot → Copilot Studio
 * 
 * @param userId - Optional user ID to bind to the token
 * @param userName - Optional display name for the user
 * @returns Promise<DirectLineTokenResponse>
 */
export async function fetchProxyBotToken(
  userId?: string,
  userName?: string
): Promise<DirectLineTokenResponse> {
  console.log('🔑 Fetching Proxy Bot Direct Line token...');
  
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);
  if (userName) params.append('userName', userName);
  
  const url = `${API_BASE_URL}/directline/proxyBotToken${params.toString() ? `?${params}` : ''}`;
  const response = await fetchJson<DirectLineTokenResponse>(url);
  
  console.log(`✅ Proxy Bot token received for conversation: ${response.conversationId}`);
  return response;
}