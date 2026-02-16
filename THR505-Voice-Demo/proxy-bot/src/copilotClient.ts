/**
 * Copilot Studio Direct Line Client
 * ==================================
 * Manages the connection to Copilot Studio via Direct Line API.
 * 
 * This client handles:
 * - Token acquisition from Copilot Studio
 * - Starting conversations
 * - Sending messages to Copilot Studio
 * - Receiving responses
 * - Managing conversation state
 */

import axios, { AxiosInstance } from 'axios';
import { v4 as uuidv4 } from 'uuid';

/**
 * Direct Line token response from Copilot Studio
 */
interface TokenResponse {
  token: string;
  conversationId?: string;
  expires_in?: number;
}

/**
 * Direct Line conversation response
 */
interface ConversationResponse {
  conversationId: string;
  token: string;
  expires_in: number;
  streamUrl?: string;
}

/**
 * Direct Line activity (message)
 */
interface Activity {
  type: string;
  id?: string;
  timestamp?: string;
  localTimestamp?: string;
  channelId?: string;
  from: {
    id: string;
    name?: string;
    role?: string;
  };
  conversation?: {
    id: string;
  };
  recipient?: {
    id: string;
    name?: string;
  };
  text?: string;
  speak?: string;
  inputHint?: string;
  attachments?: any[];
  suggestedActions?: any;
  value?: any;
  locale?: string;
}

/**
 * Activities response from Direct Line
 */
interface ActivitiesResponse {
  activities: Activity[];
  watermark: string;
}

/**
 * Conversation session tracking
 */
interface ConversationSession {
  conversationId: string;
  token: string;
  watermark: string;
  createdAt: Date;
}

/**
 * CopilotClient manages conversations with Copilot Studio
 */
export class CopilotClient {
  private tokenEndpoint: string;
  private directLineSecret?: string;
  private sessions: Map<string, ConversationSession> = new Map();
  private directLineUrl = 'https://directline.botframework.com/v3/directline';

  constructor(config: { tokenEndpoint?: string; directLineSecret?: string }) {
    this.tokenEndpoint = config.tokenEndpoint || '';
    this.directLineSecret = config.directLineSecret;

    if (!this.tokenEndpoint && !this.directLineSecret) {
      throw new Error('Either tokenEndpoint or directLineSecret must be provided');
    }
  }

  /**
   * Get or create a conversation session for a user
   */
  async getOrCreateSession(userId: string): Promise<ConversationSession> {
    // Check for existing session
    const existing = this.sessions.get(userId);
    if (existing) {
      // TODO: Check if token is still valid, refresh if needed
      return existing;
    }

    // Create new session
    const session = await this.startConversation(userId);
    this.sessions.set(userId, session);
    return session;
  }

  /**
   * Start a new conversation with Copilot Studio
   */
  private async startConversation(userId: string): Promise<ConversationSession> {
    console.log(`🤖 Starting Copilot Studio conversation for user: ${userId}`);

    let token: string;
    let conversationId: string;

    if (this.tokenEndpoint) {
      // Use token endpoint (recommended for Copilot Studio)
      const response = await axios.get<TokenResponse>(this.tokenEndpoint);
      token = response.data.token;
      conversationId = response.data.conversationId || `conv-${uuidv4().substring(0, 8)}`;
    } else {
      // Use Direct Line secret to generate token
      const response = await axios.post<ConversationResponse>(
        `${this.directLineUrl}/tokens/generate`,
        { user: { id: userId } },
        {
          headers: {
            'Authorization': `Bearer ${this.directLineSecret}`,
            'Content-Type': 'application/json',
          },
        }
      );
      token = response.data.token;
      conversationId = response.data.conversationId;
    }

    // Start the conversation
    const convResponse = await axios.post<ConversationResponse>(
      `${this.directLineUrl}/conversations`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    console.log(`✅ Copilot conversation started: ${convResponse.data.conversationId}`);

    return {
      conversationId: convResponse.data.conversationId,
      token: convResponse.data.token,
      watermark: '',
      createdAt: new Date(),
    };
  }

  /**
   * Send a message to Copilot Studio and get the response
   */
  async sendMessage(userId: string, text: string, locale: string = 'en-US'): Promise<Activity[]> {
    const session = await this.getOrCreateSession(userId);

    console.log(`📤 Sending to Copilot: "${text.substring(0, 50)}..."`);

    // Send the activity
    const activity: Activity = {
      type: 'message',
      from: {
        id: userId,
        name: 'User',
        role: 'user',
      },
      text: text,
      locale: locale,
    };

    await axios.post(
      `${this.directLineUrl}/conversations/${session.conversationId}/activities`,
      activity,
      {
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Poll for responses (with timeout)
    const responses = await this.pollForResponses(session, 10000);
    
    console.log(`📥 Received ${responses.length} response(s) from Copilot`);
    
    return responses;
  }

  /**
   * Poll Direct Line for bot responses
   */
  private async pollForResponses(
    session: ConversationSession,
    timeoutMs: number
  ): Promise<Activity[]> {
    const startTime = Date.now();
    const responses: Activity[] = [];
    let attempts = 0;
    const maxAttempts = 20;

    while (Date.now() - startTime < timeoutMs && attempts < maxAttempts) {
      attempts++;
      
      try {
        const url = session.watermark
          ? `${this.directLineUrl}/conversations/${session.conversationId}/activities?watermark=${session.watermark}`
          : `${this.directLineUrl}/conversations/${session.conversationId}/activities`;

        const response = await axios.get<ActivitiesResponse>(url, {
          headers: {
            'Authorization': `Bearer ${session.token}`,
          },
        });

        // Update watermark
        if (response.data.watermark) {
          session.watermark = response.data.watermark;
        }

        // Filter for bot responses (not our own messages)
        const botActivities = response.data.activities.filter(
          (a) => a.from.role === 'bot' && a.type === 'message'
        );

        if (botActivities.length > 0) {
          responses.push(...botActivities);
          break; // Got a response, stop polling
        }

        // Wait before next poll
        await this.delay(500);
      } catch (error) {
        console.error('Error polling for responses:', error);
        break;
      }
    }

    return responses;
  }

  /**
   * End a conversation session
   */
  endSession(userId: string): void {
    this.sessions.delete(userId);
    console.log(`🔚 Ended session for user: ${userId}`);
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default CopilotClient;
