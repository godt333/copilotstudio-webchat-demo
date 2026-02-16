"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopilotClient = void 0;
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
/**
 * CopilotClient manages conversations with Copilot Studio
 */
class CopilotClient {
    constructor(config) {
        this.sessions = new Map();
        this.directLineUrl = 'https://directline.botframework.com/v3/directline';
        this.tokenEndpoint = config.tokenEndpoint || '';
        this.directLineSecret = config.directLineSecret;
        if (!this.tokenEndpoint && !this.directLineSecret) {
            throw new Error('Either tokenEndpoint or directLineSecret must be provided');
        }
    }
    /**
     * Get or create a conversation session for a user
     */
    async getOrCreateSession(userId) {
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
    async startConversation(userId) {
        console.log(`🤖 Starting Copilot Studio conversation for user: ${userId}`);
        let token;
        let conversationId;
        if (this.tokenEndpoint) {
            // Use token endpoint (recommended for Copilot Studio)
            const response = await axios_1.default.get(this.tokenEndpoint);
            token = response.data.token;
            conversationId = response.data.conversationId || `conv-${(0, uuid_1.v4)().substring(0, 8)}`;
        }
        else {
            // Use Direct Line secret to generate token
            const response = await axios_1.default.post(`${this.directLineUrl}/tokens/generate`, { user: { id: userId } }, {
                headers: {
                    'Authorization': `Bearer ${this.directLineSecret}`,
                    'Content-Type': 'application/json',
                },
            });
            token = response.data.token;
            conversationId = response.data.conversationId;
        }
        // Start the conversation
        const convResponse = await axios_1.default.post(`${this.directLineUrl}/conversations`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
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
    async sendMessage(userId, text, locale = 'en-US') {
        const session = await this.getOrCreateSession(userId);
        console.log(`📤 Sending to Copilot: "${text.substring(0, 50)}..."`);
        // Send the activity
        const activity = {
            type: 'message',
            from: {
                id: userId,
                name: 'User',
                role: 'user',
            },
            text: text,
            locale: locale,
        };
        await axios_1.default.post(`${this.directLineUrl}/conversations/${session.conversationId}/activities`, activity, {
            headers: {
                'Authorization': `Bearer ${session.token}`,
                'Content-Type': 'application/json',
            },
        });
        // Poll for responses (with timeout)
        const responses = await this.pollForResponses(session, 10000);
        console.log(`📥 Received ${responses.length} response(s) from Copilot`);
        return responses;
    }
    /**
     * Poll Direct Line for bot responses
     */
    async pollForResponses(session, timeoutMs) {
        const startTime = Date.now();
        const responses = [];
        let attempts = 0;
        const maxAttempts = 20;
        while (Date.now() - startTime < timeoutMs && attempts < maxAttempts) {
            attempts++;
            try {
                const url = session.watermark
                    ? `${this.directLineUrl}/conversations/${session.conversationId}/activities?watermark=${session.watermark}`
                    : `${this.directLineUrl}/conversations/${session.conversationId}/activities`;
                const response = await axios_1.default.get(url, {
                    headers: {
                        'Authorization': `Bearer ${session.token}`,
                    },
                });
                // Update watermark
                if (response.data.watermark) {
                    session.watermark = response.data.watermark;
                }
                // Filter for bot responses (not our own messages)
                const botActivities = response.data.activities.filter((a) => a.from.role === 'bot' && a.type === 'message');
                if (botActivities.length > 0) {
                    responses.push(...botActivities);
                    break; // Got a response, stop polling
                }
                // Wait before next poll
                await this.delay(500);
            }
            catch (error) {
                console.error('Error polling for responses:', error);
                break;
            }
        }
        return responses;
    }
    /**
     * End a conversation session
     */
    endSession(userId) {
        this.sessions.delete(userId);
        console.log(`🔚 Ended session for user: ${userId}`);
    }
    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.CopilotClient = CopilotClient;
exports.default = CopilotClient;
//# sourceMappingURL=copilotClient.js.map