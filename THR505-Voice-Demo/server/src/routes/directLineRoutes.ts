/**
 * Direct Line Routes
 * ==================
 * API endpoints for Direct Line token issuance.
 * 
 * Direct Line is the protocol that connects web clients to Copilot Studio agents.
 * These endpoints exchange the server-side secret for client-safe tokens,
 * OR use the Copilot Studio Token Endpoint directly.
 * 
 * Two authentication methods supported:
 * 1. Secret Key - Exchange secret for token via directline.botframework.com
 * 2. Token Endpoint - Call Copilot Studio token endpoint directly (no secret needed)
 * 
 * Two main endpoints:
 * 1. /token - Standard Direct Line token for web chat
 * 2. /livehubToken - Enhanced token for LiveHub telephony integration
 */

import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env';

const router = Router();

/**
 * Direct Line token endpoint (Microsoft's token service)
 * This is the standard endpoint for exchanging secrets for tokens
 */
const DIRECT_LINE_TOKEN_URL = 'https://directline.botframework.com/v3/directline/tokens/generate';

/**
 * Token response from Direct Line API
 */
interface DirectLineTokenResponse {
  conversationId: string;
  token: string;
  expires_in: number;
}

/**
 * Token response from Copilot Studio Token Endpoint
 */
interface CopilotTokenResponse {
  token: string;
  conversationId?: string;
  expiresin?: number;
}

/**
 * Generates a Direct Line token using the Copilot Studio Token Endpoint
 * This is the simpler approach when "No authentication" is enabled
 * 
 * @param tokenEndpoint - The token endpoint URL from Copilot Studio
 * @returns Token response
 */
async function generateTokenFromEndpoint(
  tokenEndpoint: string
): Promise<DirectLineTokenResponse> {
  console.log(`🔑 Fetching token from Copilot Studio endpoint`);

  const response = await axios.get<CopilotTokenResponse>(tokenEndpoint);

  return {
    token: response.data.token,
    conversationId: response.data.conversationId || `conv-${uuidv4().substring(0, 8)}`,
    expires_in: response.data.expiresin || 1800,
  };
}

/**
 * Generates a Direct Line token by calling Microsoft's token service
 * 
 * @param secret - The Direct Line secret
 * @param userId - Optional user ID for enhanced authentication
 * @param userName - Optional user name for display
 * @returns Token response from Direct Line
 */
async function generateDirectLineToken(
  secret: string,
  userId?: string,
  userName?: string
): Promise<DirectLineTokenResponse> {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${secret}`,
    'Content-Type': 'application/json',
  };

  // Build the request body for enhanced authentication
  // This allows us to bind a specific user identity to the conversation
  const body: Record<string, any> = {};
  
  if (userId) {
    body.user = {
      id: userId,
      name: userName || userId,
    };
  }

  console.log(`🔑 Generating Direct Line token${userId ? ` for user: ${userId}` : ''}`);

  const response = await axios.post<DirectLineTokenResponse>(
    DIRECT_LINE_TOKEN_URL,
    Object.keys(body).length > 0 ? body : undefined,
    { headers }
  );

  return response.data;
}

/**
 * GET /api/directline/token
 * 
 * Returns a Direct Line token for standard web chat connections.
 * This is used by the Speech Ponyfill approach where Direct Line
 * handles messaging and a separate ponyfill handles speech.
 * 
 * Supports two authentication methods:
 * 1. Token Endpoint (preferred) - Calls Copilot Studio token endpoint directly
 * 2. Secret Key - Exchanges secret for token via Bot Framework
 * 
 * Query parameters:
 * - userId (optional): Bind token to a specific user ID
 * - userName (optional): Display name for the user
 * 
 * Response format:
 * {
 *   "token": "...",           // Direct Line token
 *   "conversationId": "...",  // Conversation ID
 *   "expiresIn": 1800,        // Seconds until expiry
 *   "userId": "user-abc123"   // The user ID bound to this token
 * }
 * 
 * DEMO NOTE: Show how the token is different from the secret,
 * and how it's short-lived (30 minutes) for security.
 */
router.get('/token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`📞 [${new Date().toISOString()}] GET /api/directline/token`);

    // Allow optional user binding via query parameters
    // In a real app, this would come from your authentication system
    const userId = (req.query.userId as string) || `user-${uuidv4().substring(0, 8)}`;
    const userName = (req.query.userName as string) || 'Web User';

    let tokenResponse: DirectLineTokenResponse;

    // Use Token Endpoint if configured, otherwise use Secret Key
    if (config.directLine.tokenEndpoint) {
      console.log(`🔄 Using Copilot Studio Token Endpoint`);
      tokenResponse = await generateTokenFromEndpoint(config.directLine.tokenEndpoint);
    } else if (config.directLine.secret) {
      console.log(`🔄 Using Direct Line Secret Key`);
      tokenResponse = await generateDirectLineToken(
        config.directLine.secret,
        userId,
        userName
      );
    } else {
      throw new Error('No Direct Line authentication configured');
    }

    const response = {
      token: tokenResponse.token,
      conversationId: tokenResponse.conversationId,
      expiresIn: tokenResponse.expires_in,
      userId,
      botName: config.directLine.botName,
    };

    console.log(`✅ Direct Line token issued for conversation: ${tokenResponse.conversationId}`);
    res.json(response);

  } catch (error: any) {
    console.error('❌ Error generating Direct Line token:', error.message);
    
    // Provide helpful error message for common issues
    if (error.response?.status === 403) {
      return res.status(403).json({
        error: 'Invalid Direct Line configuration',
        hint: 'Check that DIRECT_LINE_SECRET or DIRECT_LINE_TOKEN_ENDPOINT is correctly configured',
      });
    }
    
    next(error);
  }
});

/**
 * GET /api/directline/livehubToken
 * 
 * Returns a Direct Line token for LiveHub telephony integration.
 * This endpoint is called by LiveHub when a phone call comes in,
 * to establish a conversation between the caller and Copilot Studio.
 * 
 * Key differences from /token:
 * 1. Uses a separate secret (LIVEHUB_DIRECT_LINE_SECRET) for isolation
 * 2. Expects caller identification for mapping phone calls to users
 * 3. Returns additional metadata useful for telephony scenarios
 * 
 * Query parameters:
 * - callerId (optional): The phone number of the caller (E.164 format)
 * - sessionId (optional): A unique session ID from LiveHub
 * 
 * Response format:
 * {
 *   "token": "...",              // Direct Line token
 *   "conversationId": "...",     // Conversation ID
 *   "expiresIn": 1800,           // Seconds until expiry
 *   "userId": "tel:+1234567890", // User ID (phone number or session)
 *   "sessionId": "...",          // Session ID for tracking
 *   "botId": "..."               // Bot ID for reference
 * }
 * 
 * INTEGRATION NOTE:
 * In production, LiveHub would call this endpoint with the caller's phone number.
 * The userId should be formatted as "tel:+1234567890" to identify phone users.
 * AudioCodes passes the caller ID to LiveHub, which passes it to this endpoint.
 * 
 * SECURITY NOTE:
 * In production, you should:
 * 1. Validate that the request is coming from LiveHub (API key, IP whitelist, etc.)
 * 2. Sanitize the callerId to prevent injection attacks
 * 3. Log calls for audit purposes
 */
router.get('/livehubToken', async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`📞 [${new Date().toISOString()}] GET /api/directline/livehubToken`);

    // Get caller identification from query parameters
    // In production, LiveHub sends the caller's phone number
    const callerId = req.query.callerId as string;
    const sessionId = (req.query.sessionId as string) || uuidv4();

    // Format the user ID appropriately
    // Phone numbers should be prefixed with "tel:" for identification
    let userId: string;
    let userName: string;

    if (callerId) {
      // Normalize phone number (basic example)
      // In production, use a proper phone number library
      userId = callerId.startsWith('tel:') ? callerId : `tel:${callerId}`;
      userName = `Caller ${callerId}`;
    } else {
      // Fallback for testing without a real caller
      userId = `session-${sessionId.substring(0, 8)}`;
      userName = 'Phone User';
    }

    // Use the LiveHub-specific secret if configured
    const secret = config.liveHub.directLineSecret || config.directLine.secret;

    const tokenResponse = await generateDirectLineToken(secret, userId, userName);

    const response = {
      token: tokenResponse.token,
      conversationId: tokenResponse.conversationId,
      expiresIn: tokenResponse.expires_in,
      userId,
      sessionId,
      botId: config.directLine.botId,
      // Metadata for LiveHub integration
      metadata: {
        source: 'telephony',
        provider: 'livehub',
        timestamp: new Date().toISOString(),
      },
    };

    console.log(`✅ LiveHub token issued for caller: ${userId}, session: ${sessionId}`);
    console.log(`   Conversation: ${tokenResponse.conversationId}`);
    
    res.json(response);

  } catch (error: any) {
    console.error('❌ Error generating LiveHub token:', error.message);
    
    if (error.response?.status === 403) {
      return res.status(403).json({
        error: 'Invalid LiveHub Direct Line secret',
        hint: 'Check that LIVEHUB_DIRECT_LINE_SECRET is correctly configured',
      });
    }
    
    next(error);
  }
});

/**
 * GET /api/directline/proxyBotToken
 * 
 * Returns a Direct Line token for the Proxy Bot (Azure Bot Service).
 * This enables the "Proxy Bot" tab that demonstrates bot middleware architecture:
 * Client → Proxy Bot → Copilot Studio
 * 
 * The proxy bot can add:
 * - Custom middleware/logging
 * - Authentication/authorization
 * - Message transformation
 * - Analytics and telemetry
 * 
 * Query parameters:
 * - userId (optional): Bind token to a specific user ID
 * - userName (optional): Display name for the user
 * 
 * Response format:
 * {
 *   "token": "...",           // Direct Line token for proxy bot
 *   "conversationId": "...",  // Conversation ID
 *   "expiresIn": 1800,        // Seconds until expiry
 *   "userId": "user-abc123"   // The user ID bound to this token
 * }
 */
router.get('/proxyBotToken', async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`📞 [${new Date().toISOString()}] GET /api/directline/proxyBotToken`);

    // Check if proxy bot secret is configured
    if (!config.proxyBot.directLineSecret) {
      return res.status(500).json({
        error: 'Proxy Bot not configured',
        message: 'PROXY_BOT_DIRECT_LINE_SECRET is not set in server configuration',
      });
    }

    // Allow optional user binding via query parameters
    const userId = (req.query.userId as string) || `user-${uuidv4().substring(0, 8)}`;
    const userName = (req.query.userName as string) || 'Web User';

    console.log(`🔄 Generating token for Proxy Bot (thr505-dls-proxy)`);
    
    const tokenResponse = await generateDirectLineToken(
      config.proxyBot.directLineSecret,
      userId,
      userName
    );

    const response = {
      token: tokenResponse.token,
      conversationId: tokenResponse.conversationId,
      expiresIn: tokenResponse.expires_in,
      userId: userId,
    };

    console.log(`✅ Proxy Bot token issued for user: ${userId}`);
    res.json(response);

  } catch (error: any) {
    console.error('❌ Error generating Proxy Bot token:', error.message);
    next(error);
  }
});

/**
 * POST /api/directline/refresh
 * 
 * Refreshes an existing Direct Line token.
 * This can be used to extend a conversation session without reconnecting.
 * 
 * Request body:
 * {
 *   "token": "existing-token-here"
 * }
 * 
 * Response format:
 * {
 *   "token": "new-refreshed-token",
 *   "expiresIn": 1800
 * }
 */
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`📞 [${new Date().toISOString()}] POST /api/directline/refresh`);

    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Token is required in request body',
      });
    }

    const refreshUrl = 'https://directline.botframework.com/v3/directline/tokens/refresh';
    
    const response = await axios.post(
      refreshUrl,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const result = {
      token: response.data.token,
      expiresIn: response.data.expires_in,
    };

    console.log('✅ Token refreshed successfully');
    res.json(result);

  } catch (error: any) {
    console.error('❌ Error refreshing token:', error.message);
    
    if (error.response?.status === 403) {
      return res.status(403).json({
        error: 'Token refresh failed - token may be expired or invalid',
      });
    }
    
    next(error);
  }
});

export default router;
