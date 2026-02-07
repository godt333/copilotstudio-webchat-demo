import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

// Direct Line Token endpoint
app.http('directline-token', {
  methods: ['GET'],
  route: 'directline/token',
  authLevel: 'anonymous',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    context.log('Direct Line token request received');
    
    const tokenEndpoint = process.env.DIRECT_LINE_TOKEN_ENDPOINT;
    if (!tokenEndpoint) {
      return {
        status: 500,
        jsonBody: { error: 'DIRECT_LINE_TOKEN_ENDPOINT not configured' }
      };
    }
    
    try {
      const response = await fetch(tokenEndpoint, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`Token endpoint returned ${response.status}`);
      }
      
      const data = await response.json();
      
      // Generate a user ID if not provided
      const userName = request.query.get('userName') || 'Demo User';
      const userId = `user-${Math.random().toString(36).substring(7)}`;
      
      return {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        jsonBody: {
          token: data.token,
          conversationId: data.conversationId,
          userId: userId,
          userName: userName,
          expiresIn: 3600
        }
      };
    } catch (error) {
      context.error('Failed to get Direct Line token:', error);
      return {
        status: 500,
        jsonBody: { error: 'Failed to get token', details: String(error) }
      };
    }
  }
});

// Speech Services token endpoint
app.http('speechservices-token', {
  methods: ['GET'],
  route: 'speechservices/token',
  authLevel: 'anonymous',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    context.log('Speech token request received');
    
    const speechKey = process.env.SPEECH_KEY;
    const speechRegion = process.env.SPEECH_REGION || 'eastus';
    
    if (!speechKey) {
      return {
        status: 500,
        jsonBody: { error: 'SPEECH_KEY not configured' }
      };
    }
    
    try {
      const tokenUrl = `https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': speechKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Speech token endpoint returned ${response.status}`);
      }
      
      const token = await response.text();
      
      return {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        jsonBody: {
          token: token,
          region: speechRegion,
          expiresIn: 600
        }
      };
    } catch (error) {
      context.error('Failed to get Speech token:', error);
      return {
        status: 500,
        jsonBody: { error: 'Failed to get speech token', details: String(error) }
      };
    }
  }
});

// Ponyfill credentials endpoint (combines speech token with additional info)
app.http('speechservices-ponyfillKey', {
  methods: ['GET'],
  route: 'speechservices/ponyfillKey',
  authLevel: 'anonymous',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    context.log('Ponyfill credentials request received');
    
    const speechKey = process.env.SPEECH_KEY;
    const speechRegion = process.env.SPEECH_REGION || 'eastus';
    const locale = request.query.get('locale') || 'en-US';
    const voice = request.query.get('voice') || 'en-US-JennyNeural';
    
    if (!speechKey) {
      return {
        status: 500,
        jsonBody: { error: 'SPEECH_KEY not configured' }
      };
    }
    
    try {
      const tokenUrl = `https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': speechKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Speech token endpoint returned ${response.status}`);
      }
      
      const token = await response.text();
      
      return {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        jsonBody: {
          token: token,
          region: speechRegion,
          locale: locale,
          voice: voice,
          expiresIn: 600
        }
      };
    } catch (error) {
      context.error('Failed to get ponyfill credentials:', error);
      return {
        status: 500,
        jsonBody: { error: 'Failed to get credentials', details: String(error) }
      };
    }
  }
});

// Proxy Bot token endpoint (placeholder - needs actual secret)
app.http('directline-proxyBotToken', {
  methods: ['GET'],
  route: 'directline/proxyBotToken',
  authLevel: 'anonymous',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    context.log('Proxy Bot token request received');
    
    const proxyBotSecret = process.env.PROXY_BOT_DIRECT_LINE_SECRET;
    
    if (!proxyBotSecret) {
      return {
        status: 503,
        jsonBody: { 
          error: 'Proxy Bot not configured',
          message: 'PROXY_BOT_DIRECT_LINE_SECRET is not set. Contact administrator.'
        }
      };
    }
    
    try {
      const response = await fetch('https://directline.botframework.com/v3/directline/tokens/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${proxyBotSecret}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Proxy Bot token endpoint returned ${response.status}`);
      }
      
      const data = await response.json();
      const userId = `user-${Math.random().toString(36).substring(7)}`;
      
      return {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        jsonBody: {
          token: data.token,
          conversationId: data.conversationId,
          userId: userId,
          expiresIn: 3600
        }
      };
    } catch (error) {
      context.error('Failed to get Proxy Bot token:', error);
      return {
        status: 500,
        jsonBody: { error: 'Failed to get proxy bot token', details: String(error) }
      };
    }
  }
});
