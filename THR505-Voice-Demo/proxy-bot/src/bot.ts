/**
 * DLS Proxy Bot
 * =============
 * Bot Framework bot that proxies messages between Direct Line Speech
 * and Copilot Studio.
 * 
 * This bot:
 * 1. Receives messages via Direct Line Speech channel
 * 2. Forwards them to Copilot Studio via Direct Line
 * 3. Returns Copilot Studio's responses back to the user
 * 
 * The DLS channel handles all speech recognition and synthesis,
 * so this bot only deals with text activities.
 */

import {
  ActivityHandler,
  TurnContext,
  Activity,
  ActivityTypes,
  ConversationState,
  UserState,
  StatePropertyAccessor,
} from 'botbuilder';
import { CopilotClient } from './copilotClient';

/**
 * User session data stored in conversation state
 */
interface UserSessionData {
visitorId: string;
  copilotConversationId?: string;
  locale: string;
}

/**
 * ProxyBot - Forwards messages between DLS and Copilot Studio
 */
export class ProxyBot extends ActivityHandler {
  private copilotClient: CopilotClient;
  private conversationState: ConversationState;
  private userState: UserState;
  private sessionAccessor: StatePropertyAccessor<UserSessionData>;

  constructor(
    copilotClient: CopilotClient,
    conversationState: ConversationState,
    userState: UserState
  ) {
    super();

    this.copilotClient = copilotClient;
    this.conversationState = conversationState;
    this.userState = userState;

    // Create state property accessor for session data
    this.sessionAccessor = this.conversationState.createProperty<UserSessionData>('sessionData');

    // Handle incoming messages
    this.onMessage(async (context, next) => {
      await this.handleMessage(context);
      await next();
    });

    // Handle conversation start
    this.onMembersAdded(async (context, next) => {
      for (const member of context.activity.membersAdded || []) {
        if (member.id !== context.activity.recipient.id) {
          console.log(`👋 New user joined: ${member.id}`);
          
          // Send welcome message
          await context.sendActivity({
            type: ActivityTypes.Message,
            text: 'Hello! I\'m connected to Copilot Studio. How can I help you today?',
            speak: 'Hello! I\'m connected to Copilot Studio. How can I help you today?',
            inputHint: 'expectingInput',
          });
        }
      }
      await next();
    });

    // Handle conversation end
    this.onMembersRemoved(async (context, next) => {
      for (const member of context.activity.membersRemoved || []) {
        if (member.id !== context.activity.recipient.id) {
          console.log(`👋 User left: ${member.id}`);
          // Clean up Copilot session
          this.copilotClient.endSession(member.id);
        }
      }
      await next();
    });
  }

  /**
   * Handle incoming message and forward to Copilot Studio
   */
  private async handleMessage(context: TurnContext): Promise<void> {
    const activity = context.activity;
    const userId = activity.from.id;
    const userText = activity.text?.trim();

    if (!userText) {
      console.log('⚠️ Received empty message, ignoring');
      return;
    }

    console.log(`📨 Received from DLS user ${userId}: "${userText}"`);

    try {
      // Get or initialize session data
      const sessionData = await this.sessionAccessor.get(context, {
        visitorId: userId,
        locale: activity.locale || 'en-US',
      });

      // Send typing indicator
      await context.sendActivity({ type: ActivityTypes.Typing });

      // Forward to Copilot Studio
      const copilotResponses = await this.copilotClient.sendMessage(
        userId,
        userText,
        sessionData.locale
      );

      // Send Copilot responses back to user via DLS
      for (const response of copilotResponses) {
        const replyActivity: Partial<Activity> = {
          type: ActivityTypes.Message,
          text: response.text || '',
          // SSML speak property for DLS text-to-speech
          speak: response.speak || response.text || '',
          inputHint: 'expectingInput',
        };

        // Include attachments if present (cards, etc.)
        if (response.attachments && response.attachments.length > 0) {
          replyActivity.attachments = response.attachments;
        }

        // Include suggested actions if present
        if (response.suggestedActions) {
          replyActivity.suggestedActions = response.suggestedActions;
        }

        await context.sendActivity(replyActivity);
        console.log(`📤 Sent to DLS user: "${(response.text || '').substring(0, 50)}..."`);
      }

      // If no responses, send a fallback
      if (copilotResponses.length === 0) {
        await context.sendActivity({
          type: ActivityTypes.Message,
          text: 'I didn\'t get a response. Please try again.',
          speak: 'I didn\'t get a response. Please try again.',
          inputHint: 'expectingInput',
        });
      }

    } catch (error: any) {
      console.error('❌ Error forwarding to Copilot Studio:', error.message);
      
      await context.sendActivity({
        type: ActivityTypes.Message,
        text: 'Sorry, I encountered an error connecting to the assistant. Please try again.',
        speak: 'Sorry, I encountered an error connecting to the assistant. Please try again.',
        inputHint: 'expectingInput',
      });
    }
  }

  /**
   * Save state changes at the end of each turn
   */
  async run(context: TurnContext): Promise<void> {
    await super.run(context);

    // Save state changes
    await this.conversationState.saveChanges(context, false);
    await this.userState.saveChanges(context, false);
  }
}

export default ProxyBot;
