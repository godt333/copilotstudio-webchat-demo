/**
 * Direct Line Routes
 * ==================
 * API endpoints for Direct Line token issuance.
 */

import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env';

const router = Router();

const DIRECT_LINE_TOKEN_URL = 'https://directline.botframework.com/v3/directline/tokens/generate';

interface DirectLineTokenResponse {
  conversationId: string;
  token: string;
  expires_in: number;
}

interface CopilotTokenResponse {
  token: string;
  conversationId?: string;
  expiresin?: number;
}

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

async function generateDirectLineToken(
  secret: string,
  userId?: string,
  userName?: string
): Promise<DirectLineTokenResponse> {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${secret}`,
    'Content-Type': 'application/json',
  };

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

router.get('/token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`📞 [${new Date().toISOString()}] GET /api/directline/token`);

    const userId = (req.query.userId as string) || `user-${uuidv4().substring(0, 8)}`;
    const userName = (req.query.userName as string) || 'Web User';

    let tokenResponse: DirectLineTokenResponse;

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
    
    if (error.response?.status === 403) {
      return res.status(403).json({
        error: 'Invalid Direct Line configuration',
        hint: 'Check that DIRECT_LINE_SECRET or DIRECT_LINE_TOKEN_ENDPOINT is correctly configured',
      });
    }
    
    next(error);
  }
});

router.get('/livehubToken', async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`📞 [${new Date().toISOString()}] GET /api/directline/livehubToken`);

    const callerId = req.query.callerId as string;
    const sessionId = (req.query.sessionId as string) || uuidv4();

    let userId: string;
    let userName: string;

    if (callerId) {
      userId = callerId.startsWith('tel:') ? callerId : `tel:${callerId}`;
      userName = `Caller ${callerId}`;
    } else {
      userId = `session-${sessionId.substring(0, 8)}`;
      userName = 'Phone User';
    }

    const secret = config.liveHub.directLineSecret || config.directLine.secret;

    const tokenResponse = await generateDirectLineToken(secret, userId, userName);

    const response = {
      token: tokenResponse.token,
      conversationId: tokenResponse.conversationId,
      expiresIn: tokenResponse.expires_in,
      userId,
      sessionId,
      botId: config.directLine.botId,
      metadata: {
        source: 'telephony',
        provider: 'livehub',
        timestamp: new Date().toISOString(),
      },
    };

    console.log(`✅ LiveHub token issued for caller: ${userId}, session: ${sessionId}`);
    res.json(response);

  } catch (error: any) {
    console.error('❌ Error generating LiveHub token:', error.message);
    
    if (error.response?.status === 403) {
      return res.status(403).json({
        error: 'Invalid LiveHub Direct Line secret',
      });
    }
    
    next(error);
  }
});

router.get('/proxyBotToken', async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`📞 [${new Date().toISOString()}] GET /api/directline/proxyBotToken`);

    if (!config.proxyBot.directLineSecret) {
      return res.status(500).json({
        error: 'Proxy Bot not configured',
        message: 'PROXY_BOT_DIRECT_LINE_SECRET is not set in server configuration',
      });
    }

    const userId = (req.query.userId as string) || `user-${uuidv4().substring(0, 8)}`;
    const userName = (req.query.userName as string) || 'Web User';

    console.log(`🔄 Generating token for Proxy Bot`);
    
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
