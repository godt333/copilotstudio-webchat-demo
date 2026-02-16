/**
 * ============================================================================
 * Demo 3: Flexible React Pattern (Composer + BasicWebChat) + Fluent Theme
 * ============================================================================
 * 
 * This demo showcases the FULL POWER of the Flexible React pattern with:
 * - FluentThemeProvider for rich Microsoft styling
 * - Multiple theme variants (Fluent, Copilot, Teams)
 * - Character count display (0/2000)
 * - Custom status bar with connection status
 * - Starter prompts for guided conversations
 * - Store middleware for activity logging
 * - Custom UI components using WebChat hooks
 * 
 * WHY USE THIS PATTERN?
 * ---------------------
 * 1. Composer = Context Provider (holds DirectLine, store, styles, middleware)
 * 2. BasicWebChat = Pure UI Component (just renders the chat interface)
 * 3. FluentThemeProvider = Microsoft's modern styling layer
 * 4. Separation allows you to:
 *    - Insert FluentThemeProvider between them for rich UI
 *    - Add custom components alongside BasicWebChat
 *    - Use WebChat hooks OUTSIDE the BasicWebChat component
 *    - Create completely custom layouts while keeping all functionality
 * 
 * ARCHITECTURE:
 * -------------
 *   <Composer directLine={...} store={...} styleOptions={...}>
 *     <FluentThemeProvider variant="copilot">      ← Microsoft styling
 *       <CustomStatusBar />                        ← Your custom components
 *       <StarterPrompts />                         ← Guided conversation starters
 *       <BasicWebChat />                           ← The actual chat UI
 *     </FluentThemeProvider>
 *   </Composer>
 */

import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { 
  Components,           // Contains Composer and BasicWebChat
  createStore,          // Redux store for WebChat state
  hooks,                // WebChat hooks for accessing state
} from 'botframework-webchat';
import { FluentThemeProvider } from 'botframework-webchat-fluent-theme';
import type { CopilotStudioWebChatConnection } from '@microsoft/agents-copilotstudio-client';
import {
  makeStyles,
  tokens,
  Text,
  Badge,
  Divider,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  ToggleButton,
  Button,
  Card,
  CardHeader,
  Tooltip,
} from '@fluentui/react-components';
import {
  Sparkle24Regular,
  Color24Regular,
  WindowDevTools24Regular,
  PersonCircle24Regular,
  Chat24Regular,
  Send24Regular,
  TextAlignJustify24Regular,
} from '@fluentui/react-icons';
import { CodeBlockWithModal } from '../../components/common/CodeModal';

// ============================================================================
// EXTRACT COMPOSER AND BASICWEBCHAT FROM COMPONENTS
// ============================================================================
const { Composer, BasicWebChat } = Components;

// ============================================================================
// THEME VARIANTS - Fluent, Copilot, Teams
// ============================================================================
/**
 * FluentThemeProvider + styleOptions work together to create different themes.
 * 
 * KEY FEATURES ENABLED BY styleOptions:
 * - maxMessageLength: Shows character count (e.g., "45/2000") - REQUIRED for count!
 * - hideUploadButton: Show/hide file attachment
 * - accent: Primary color for buttons and highlights
 * - bubbleFromUserBackground: User message bubble color
 * - suggestedActionBackground: Quick action button color
 */
const themeVariants = {
  fluent: {
    label: 'Fluent Theme',
    description: 'Standard Microsoft Fluent UI - clean blue accent',
    icon: <Sparkle24Regular />,
    color: '#0078D4',
    styleOptions: {
      maxMessageLength: 2000,  // ← Enables character count!
      hideUploadButton: false,
      hideTelephoneKeypadButton: true,
      bubbleBackground: '#f0f0f0',
      bubbleFromUserBackground: '#0078D4',
      bubbleFromUserTextColor: '#ffffff',
    },
  },
  copilot: {
    label: 'Copilot Theme',
    description: 'Microsoft Copilot style - purple accent, modern feel',
    icon: <Chat24Regular />,
    color: '#6750A4',
    styleOptions: {
      maxMessageLength: 2000,  // ← Enables character count!
      hideUploadButton: false,
      hideTelephoneKeypadButton: true,
      accent: '#6750A4',
      bubbleBackground: '#f5f0ff',
      bubbleFromUserBackground: '#6750A4',
      bubbleFromUserTextColor: '#ffffff',
      suggestedActionBackground: '#6750A4',
      suggestedActionTextColor: '#ffffff',
    },
  },
  teams: {
    label: 'Teams Theme',
    description: 'Microsoft Teams style - familiar enterprise look',
    icon: <PersonCircle24Regular />,
    color: '#5B5FC7',
    styleOptions: {
      maxMessageLength: 2000,  // ← Enables character count!
      hideUploadButton: false,
      hideTelephoneKeypadButton: true,
      accent: '#5B5FC7',
      bubbleBackground: '#f5f5f5',
      bubbleFromUserBackground: '#5B5FC7',
      bubbleFromUserTextColor: '#ffffff',
      suggestedActionBackground: '#5B5FC7',
      suggestedActionTextColor: '#ffffff',
    },
  },
  custom: {
    label: 'Custom Brand',
    description: 'Custom branded theme - your company colors',
    icon: <Color24Regular />,
    color: '#1E88E5',  // Citizen Advice blue
    styleOptions: {
      maxMessageLength: 2000,  // ← Enables character count!
      hideUploadButton: false,
      hideTelephoneKeypadButton: true,
      accent: '#1E88E5',
      bubbleBackground: '#E3F2FD',
      bubbleFromUserBackground: '#1E88E5',
      bubbleFromUserTextColor: '#ffffff',
      suggestedActionBackground: '#1E88E5',
      suggestedActionTextColor: '#ffffff',
      botAvatarBackgroundColor: '#E3F2FD',
      userAvatarBackgroundColor: '#BBDEFB',
    },
  },
};

type ThemeVariantKey = keyof typeof themeVariants;

// ============================================================================
// STARTER PROMPTS
// ============================================================================
const starterPrompts = [
  { text: "What benefits am I entitled to?", icon: "💷" },
  { text: "How do I appeal a decision?", icon: "⚖️" },
  { text: "Help with housing issues", icon: "🏠" },
  { text: "Debt advice and support", icon: "💳" },
];

// ============================================================================
// CUSTOM STORE MIDDLEWARE (Redux-style)
// ============================================================================
/**
 * Store Middleware intercepts Redux actions before they reach the reducer.
 * 
 * Common actions to intercept:
 * - DIRECT_LINE/INCOMING_ACTIVITY - Bot sent a message
 * - DIRECT_LINE/POST_ACTIVITY - User sent a message
 * - WEB_CHAT/SET_SEND_BOX - User typing in send box
 * - WEB_CHAT/SUBMIT_SEND_BOX - User pressed send
 * 
 * Use cases:
 * - Analytics tracking
 * - Activity logging
 * - Custom business logic
 * - Integration with external systems
 */
type WebChatAction = {
  type: string;
  payload?: {
    activity?: {
      type?: string;
      from?: { role?: string };
      text?: string;
      attachments?: Array<{ contentType?: string }>;
      timestamp?: string;
    };
  };
};

const createLoggingMiddleware = () => 
  () => 
    (next: (action: WebChatAction) => unknown) => 
      (action: WebChatAction) => {
        // Log incoming messages from bot
        if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
          const activity = action.payload?.activity;
          console.log('%c[WebChat] Bot Message', 'color: #0078d4; font-weight: bold', {
            type: activity?.type,
            text: activity?.text?.substring(0, 100),
            hasAttachments: !!activity?.attachments?.length,
            attachmentTypes: activity?.attachments?.map(a => a.contentType),
            timestamp: activity?.timestamp,
          });
        }

        // Log outgoing messages from user
        if (action.type === 'DIRECT_LINE/POST_ACTIVITY') {
          const activity = action.payload?.activity;
          console.log('%c[WebChat] User Message', 'color: #107c10; font-weight: bold', {
            type: activity?.type,
            text: activity?.text?.substring(0, 100),
          });
        }

        // Log typing events
        if (action.type === 'WEB_CHAT/SET_SEND_BOX') {
          console.log('%c[WebChat] User Typing', 'color: #797775', action.payload);
        }

        // Always pass action to next middleware/reducer
        return next(action);
      };

// ============================================================================
// CUSTOM STATUS COMPONENT (using WebChat hooks)
// ============================================================================
/**
 * This demonstrates the power of Composer + BasicWebChat:
 * You can create custom components that use WebChat hooks!
 * 
 * Available hooks (partial list):
 * - useSendMessage() - Send a message programmatically
 * - useActivities() - Access all chat activities
 * - useConnectivityStatus() - Connection state
 * - useDictateState() - Speech recognition state
 * - useTypingIndicatorVisible() - Is bot typing?
 * - useTextBoxValue() - Current send box text
 */
function ConnectionStatusBar() {
  // These hooks can ONLY be used inside <Composer>!
  const [connectivityStatus] = hooks.useConnectivityStatus();
  const [typingIndicatorVisible] = hooks.useTypingIndicatorVisible();
  
  // Debug: Log styleOptions from inside Composer
  const [styleOptions] = hooks.useStyleOptions();
  useEffect(() => {
    console.log('%c[ConnectionStatusBar] useStyleOptions():', 'color: #4caf50; font-weight: bold', {
      maxMessageLength: styleOptions.maxMessageLength,
      hideUploadButton: styleOptions.hideUploadButton,
      fullOptions: styleOptions,
    });
  }, [styleOptions]);

  return (
    <div style={{ 
      padding: '10px 16px', 
      backgroundColor: '#fafafa', 
      borderBottom: '1px solid #e0e0e0',
      fontSize: '13px',
      color: '#333',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span>
          <strong>Connection:</strong>{' '}
          <Badge 
            appearance="filled" 
            color={connectivityStatus === 'connected' ? 'success' : 'warning'}
            size="small"
          >
            {connectivityStatus}
          </Badge>
        </span>
        <span style={{ color: '#666', fontSize: '12px' }}>
          FluentThemeProvider Active
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {typingIndicatorVisible && (
          <span style={{ fontStyle: 'italic', color: '#0078d4' }}>
            ✨ Bot is composing...
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// STARTER PROMPTS COMPONENT (using WebChat hooks)
// ============================================================================
function StarterPromptsPanel({ onInteraction }: { onInteraction: () => void }) {
  const sendMessage = hooks.useSendMessage();
  
  const handlePromptClick = useCallback((text: string) => {
    sendMessage(text);
    onInteraction();
  }, [sendMessage, onInteraction]);

  return (
    <div style={{
      padding: '16px',
      backgroundColor: '#f8f8f8',
      borderBottom: '1px solid #e0e0e0',
    }}>
      <Text size={200} style={{ color: '#666', marginBottom: '12px', display: 'block' }}>
        💡 <strong>Quick Start</strong> - Click a topic to get started:
      </Text>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {starterPrompts.map((prompt, idx) => (
          <Tooltip content={prompt.text} relationship="label" key={idx}>
            <Button
              appearance="outline"
              size="small"
              onClick={() => handlePromptClick(prompt.text)}
              style={{ 
                borderRadius: '20px',
                paddingLeft: '12px',
                paddingRight: '12px',
              }}
            >
              {prompt.icon} {prompt.text}
            </Button>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// FEATURES INFO COMPONENT
// ============================================================================
const featureList = [
  { icon: <TextAlignJustify24Regular />, title: 'Character Count', desc: 'Shows 0/2000 as you type' },
  { icon: <Sparkle24Regular />, title: 'Sliding Dots', desc: 'Modern typing indicator' },
  { icon: <Send24Regular />, title: 'Fluent Send Box', desc: 'Modern input with file upload' },
  { icon: <WindowDevTools24Regular />, title: 'Activity Logging', desc: 'Check DevTools Console' },
];

function FeaturesInfoBar() {
  return (
    <div style={{
      padding: '8px 16px',
      backgroundColor: '#EDE7F6',
      borderBottom: '1px solid #D1C4E9',
      fontSize: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flexWrap: 'wrap',
    }}>
      <span style={{ color: '#5E35B1', fontWeight: 600 }}>✓ Active Features:</span>
      {featureList.map((f, i) => (
        <span key={i} style={{ color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {f.title}
        </span>
      ))}
    </div>
  );
}

// ============================================================================
// SINGLE MOUNT WRAPPER (React Strict Mode fix)
// ============================================================================
/**
 * React 18's Strict Mode double-mounts components in development.
 * WebChat's DirectLine connection doesn't handle this well.
 * This wrapper ensures WebChat only mounts once.
 */
function FlexibleReactWebChat({ 
  connection,
  selectedTheme,
  showStarterPrompts,
}: { 
  connection: CopilotStudioWebChatConnection;
  selectedTheme: ThemeVariantKey;
  showStarterPrompts: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const mountedRef = useRef(false);

  // Get current theme's style options
  const styleOptions = useMemo(() => {
    const opts = themeVariants[selectedTheme].styleOptions;
    console.log('%c[Flexible Demo] styleOptions:', 'color: #ff5722; font-weight: bold', opts);
    return opts;
  }, [selectedTheme]);

  // Create store with our custom middleware
  const store = useMemo(() => createStore(
    {},  // Initial state (optional)
    createLoggingMiddleware()  // Our middleware
  ), []);

  const handleInteraction = useCallback(() => {
    setHasInteracted(true);
  }, []);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      setMounted(true);
      console.log(
        '%c[Flexible Demo] Mounted with Composer + BasicWebChat + FluentThemeProvider', 
        'color: #e91e63; font-weight: bold',
        { theme: selectedTheme }
      );
    }
  }, [selectedTheme]);

  if (!mounted) return null;

  // ========================================================================
  // THE FLEXIBLE REACT PATTERN IN ACTION
  // ========================================================================
  // IMPORTANT: FluentThemeProvider should wrap ReactWebChat, NOT be inside Composer!
  // FluentThemeProvider has its own internal ThemeProvider that would override our styleOptions.
  //
  // The correct hierarchy:
  // 1. FluentThemeProvider wraps everything (adds Fluent styling)
  // 2. ReactWebChat handles Composer + BasicWebChat together
  //
  // For custom components with hooks, we need to nest them INSIDE ReactWebChat's context.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <FluentThemeProvider>
        <Composer 
          directLine={connection}
          store={store}
          styleOptions={styleOptions}
        >
          {/* Custom status bar using WebChat hooks - INSIDE Composer */}
          <ConnectionStatusBar />
          
          {/* Features info bar */}
          <FeaturesInfoBar />
          
          {/* Starter prompts - shown until user interacts */}
          {showStarterPrompts && !hasInteracted && (
            <StarterPromptsPanel onInteraction={handleInteraction} />
          )}
          
          {/* The actual chat UI - expands to fill remaining space */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <BasicWebChat />
          </div>
        </Composer>
      </FluentThemeProvider>
    </div>
  );
}

// Single mount wrapper for React Strict Mode
function SingleMountComposerDemo({ 
  connection,
  selectedTheme,
  showStarterPrompts,
}: { 
  connection: CopilotStudioWebChatConnection;
  selectedTheme: ThemeVariantKey;
  showStarterPrompts: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      setMounted(true);
    }
  }, []);

  if (!mounted) return null;

  return (
    <FlexibleReactWebChat 
      connection={connection}
      selectedTheme={selectedTheme}
      showStarterPrompts={showStarterPrompts}
    />
  );
}

// ============================================================================
// STYLES
// ============================================================================
const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  description: {
    background: 'linear-gradient(135deg, #0078d4 0%, #106ebe 100%)',
    color: 'white',
    padding: tokens.spacingHorizontalL,
    borderRadius: tokens.borderRadiusMedium,
  },
  architectureBox: {
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    padding: tokens.spacingHorizontalL,
    borderRadius: tokens.borderRadiusMedium,
    fontFamily: 'Consolas, monospace',
    fontSize: '13px',
    overflowX: 'auto',
    whiteSpace: 'pre',
  },
  codeBlock: {
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    padding: tokens.spacingHorizontalL,
    borderRadius: tokens.borderRadiusMedium,
    fontFamily: 'Consolas, monospace',
    fontSize: '12px',
    overflowX: 'auto',
    whiteSpace: 'pre',
    maxHeight: '350px',
    overflowY: 'auto',
  },
  chatContainer: {
    height: '550px',
    border: '2px solid #0078d4',
    borderRadius: tokens.borderRadiusMedium,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 12px rgba(0, 120, 212, 0.15)',
  },
  prosConsList: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: tokens.spacingHorizontalL,
    marginTop: tokens.spacingVerticalM,
  },
  prosCons: {
    padding: tokens.spacingHorizontalM,
    borderRadius: tokens.borderRadiusMedium,
  },
  pros: {
    backgroundColor: '#e8f5e9',
    borderLeft: '4px solid #4caf50',
  },
  cons: {
    backgroundColor: '#ffebee',
    borderLeft: '4px solid #f44336',
  },
  controlsRow: {
    display: 'flex',
    gap: tokens.spacingHorizontalL,
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: tokens.spacingVerticalM,
    padding: tokens.spacingHorizontalM,
    backgroundColor: '#f5f5f5',
    borderRadius: tokens.borderRadiusMedium,
  },
  themeSelector: {
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap',
  },
  variantInfo: {
    padding: tokens.spacingHorizontalM,
    backgroundColor: '#f0f0f0',
    borderRadius: tokens.borderRadiusMedium,
    marginBottom: tokens.spacingVerticalS,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  colorSwatch: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    flexShrink: 0,
    border: '2px solid white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalM,
  },
});

// ============================================================================
// CODE EXAMPLES FOR THE DEMO
// ============================================================================

const codeExample1_BasicPattern = `// ============================================================================
// STEP 1: Import Composer and BasicWebChat
// ============================================================================
// The key insight: They're in the Components object, not direct exports!

import { Components, createStore } from 'botframework-webchat';
import { FluentThemeProvider } from 'botframework-webchat-fluent-theme';

// Extract the components we need
const { Composer, BasicWebChat } = Components;

// ============================================================================
// STEP 2: Set up the Composer + BasicWebChat pattern
// ============================================================================

function FlexibleWebChat({ connection }) {
  return (
    // Composer = Context Provider (holds all WebChat state and config)
    <Composer directLine={connection}>
    
      {/* FluentThemeProvider = Microsoft styling layer */}
      <FluentThemeProvider>
      
        {/* BasicWebChat = Pure UI component */}
        <BasicWebChat />
        
      </FluentThemeProvider>
    </Composer>
  );
}

// ============================================================================
// WHY IS THIS BETTER THAN ReactWebChat?
// ============================================================================
// 
// ReactWebChat = Composer + BasicWebChat bundled together (convenience)
// 
// The Flexible pattern lets you:
// 1. Insert components BETWEEN Composer and BasicWebChat
// 2. Use WebChat hooks in your own components
// 3. Create completely custom layouts
// 4. Add FluentThemeProvider for Microsoft styling`;

const codeExample2_CustomComponents = `// ============================================================================
// STEP 3: Add Custom Components (the real power!)
// ============================================================================
// Because Composer provides context, your components can use WebChat hooks!

import { Components, hooks } from 'botframework-webchat';

const { Composer, BasicWebChat } = Components;

// Custom status bar - uses WebChat hooks!
function CustomStatusBar() {
  // These hooks ONLY work inside <Composer>
  const [connectivityStatus] = hooks.useConnectivityStatus();
  const [typingVisible] = hooks.useTypingIndicatorVisible();
  
  return (
    <div className="custom-status-bar">
      <span>Status: {connectivityStatus}</span>
      {typingVisible && <span>Bot is typing...</span>}
    </div>
  );
}

// Custom send button - sends messages programmatically
function CustomSendButton() {
  const sendMessage = hooks.useSendMessage();
  const [textBoxValue] = hooks.useTextBoxValue();
  
  return (
    <button onClick={() => sendMessage(textBoxValue)}>
      Send
    </button>
  );
}

// Now use them in your layout
function AdvancedWebChat({ connection }) {
  return (
    <Composer directLine={connection}>
      <FluentThemeProvider>
        {/* Your custom header with hooks access */}
        <CustomStatusBar />
        
        {/* The chat interface */}
        <BasicWebChat />
        
        {/* Your custom footer with hooks access */}
        <div className="custom-footer">
          <CustomSendButton />
        </div>
      </FluentThemeProvider>
    </Composer>
  );
}`;

const codeExample3_ActivityMiddleware = `// ============================================================================
// STEP 4: Custom Activity Middleware
// ============================================================================
// Intercept and transform activities before they render

// Activity Middleware signature:
// () => next => ({ activity, ...otherArgs }) => ReactNode | false | next()

const customActivityMiddleware = () => 
  (next) => 
    ({ activity, ...otherArgs }) => {
      // Log all activities
      console.log('[Activity]', activity.type, activity);
      
      // Example: Add special handling for welcome events
      if (activity.type === 'event' && activity.name === 'welcome') {
        return (
          <div className="welcome-banner">
            🎉 Welcome to the chat!
          </div>
        );
      }
      
      // Example: Hide typing indicators
      if (activity.type === 'typing') {
        return false; // Don't render
      }
      
      // Example: Add custom wrapper to bot messages
      if (activity.from?.role === 'bot' && activity.type === 'message') {
        return (
          <div className="bot-message-wrapper">
            <div className="bot-avatar">🤖</div>
            {next({ activity, ...otherArgs })}
          </div>
        );
      }
      
      // Default: let WebChat handle it
      return next({ activity, ...otherArgs });
    };

// Use in Composer
<Composer 
  directLine={connection}
  activityMiddleware={customActivityMiddleware}
>
  <BasicWebChat />
</Composer>`;

const codeExample4_StoreMiddleware = `// ============================================================================
// STEP 5: Custom Store Middleware (Redux-style)
// ============================================================================
// Intercept Redux actions for analytics, logging, or custom logic

import { createStore } from 'botframework-webchat';

// Store Middleware signature (same as Redux middleware):
// (store) => (next) => (action) => next(action)

const analyticsMiddleware = () => 
  (next) => 
    (action) => {
      // Track incoming bot messages
      if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
        const activity = action.payload?.activity;
        
        // Send to your analytics service
        analytics.track('bot_message', {
          type: activity?.type,
          hasAttachments: !!activity?.attachments?.length,
          timestamp: new Date().toISOString(),
        });
        
        console.log('📩 Bot:', activity?.text?.substring(0, 50));
      }
      
      // Track outgoing user messages
      if (action.type === 'DIRECT_LINE/POST_ACTIVITY') {
        const activity = action.payload?.activity;
        
        analytics.track('user_message', {
          textLength: activity?.text?.length,
          timestamp: new Date().toISOString(),
        });
        
        console.log('📤 User:', activity?.text?.substring(0, 50));
      }
      
      // Track conversation start
      if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
        analytics.track('conversation_started');
      }
      
      // Always pass to next middleware/reducer
      return next(action);
    };

// Create store with middleware
const store = createStore({}, analyticsMiddleware);

// Use in Composer
<Composer directLine={connection} store={store}>
  <BasicWebChat />
</Composer>`;

const codeExample5_FullImplementation = `// ============================================================================
// COMPLETE IMPLEMENTATION: Putting It All Together
// ============================================================================

import { useState, useMemo, useEffect } from 'react';
import { Components, createStore, hooks } from 'botframework-webchat';
import { FluentThemeProvider } from 'botframework-webchat-fluent-theme';
import { CopilotStudioClient, CopilotStudioWebChat } from '@microsoft/agents-copilotstudio-client';

const { Composer, BasicWebChat } = Components;

// ---------------------------------------------------------------------------
// Custom Components (can use WebChat hooks!)
// ---------------------------------------------------------------------------
function ChatHeader() {
  const [status] = hooks.useConnectivityStatus();
  return (
    <header className="chat-header">
      <h2>Citizen Advice</h2>
      <span className={\`status-\${status}\`}>{status}</span>
    </header>
  );
}

function TypingIndicator() {
  const [visible] = hooks.useTypingIndicatorVisible();
  if (!visible) return null;
  return <div className="typing">Bot is composing a response...</div>;
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
const loggingMiddleware = () => next => action => {
  if (action.type.startsWith('DIRECT_LINE/')) {
    console.log('[DirectLine]', action.type, action.payload);
  }
  return next(action);
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function ProductionWebChat() {
  const [connection, setConnection] = useState(null);
  
  // Create store once
  const store = useMemo(() => createStore({}, loggingMiddleware), []);
  
  // Initialize connection on mount
  useEffect(() => {
    const init = async () => {
      // 1. Get access token (via MSAL)
      const token = await acquireToken();
      
      // 2. Create Copilot Studio client
      const client = new CopilotStudioClient({
        directConnectUrl: process.env.REACT_APP_DIRECT_CONNECT_URL
      }, token);
      
      // 3. Create DirectLine-compatible connection
      const conn = CopilotStudioWebChat.createConnection(client, {
        showTyping: true
      });
      
      setConnection(conn);
    };
    
    init();
  }, []);
  
  if (!connection) return <LoadingSpinner />;
  
  return (
    <Composer 
      directLine={connection}
      store={store}
      styleOptions={{
        hideUploadButton: true,
        bubbleFromUserBackground: '#0078d4',
        bubbleFromUserTextColor: '#ffffff',
      }}
    >
      <FluentThemeProvider>
        <ChatHeader />
        <TypingIndicator />
        <BasicWebChat />
      </FluentThemeProvider>
    </Composer>
  );
}`;

// ============================================================================
// COMPONENT PROPS
// ============================================================================
interface AgentSDKFlexibleReactDemoProps {
  connection: CopilotStudioWebChatConnection;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function AgentSDKFlexibleReactDemo({ connection }: AgentSDKFlexibleReactDemoProps) {
  const styles = useStyles();
  const [selectedTheme, setSelectedTheme] = useState<ThemeVariantKey>('fluent');
  const [showStarterPrompts, setShowStarterPrompts] = useState(true);
  const currentTheme = themeVariants[selectedTheme];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.description}>
        <Text weight="semibold" size={500} style={{ color: 'white' }}>
          🔧 Flexible React: Composer + BasicWebChat + FluentThemeProvider
        </Text>
        <Text block style={{ marginTop: '8px', color: 'rgba(255,255,255,0.95)' }}>
          The most powerful WebChat integration pattern. This demo showcases <strong>ALL key features</strong>: 
          theme variants, character count (0/2000), custom status bar, starter prompts, and middleware logging.
        </Text>
      </div>

      {/* Key Features */}
      <MessageBar intent="success">
        <MessageBarBody>
          <MessageBarTitle>✨ Key Features Demonstrated in This Demo</MessageBarTitle>
          • <strong>Character Count</strong> - Type in the send box to see "0/2000" counter<br/>
          • <strong>Theme Variants</strong> - Toggle between Fluent, Copilot, Teams, and Custom themes<br/>
          • <strong>Custom Components</strong> - Status bar and starter prompts use WebChat hooks<br/>
          • <strong>Store Middleware</strong> - Open DevTools (F12) → Console for activity logging
        </MessageBarBody>
      </MessageBar>

      {/* Features Grid */}
      <div className={styles.featuresGrid}>
        {featureList.map((feature, idx) => (
          <Card key={idx} size="small" style={{ padding: '12px' }}>
            <CardHeader
              image={<span style={{ color: currentTheme.color }}>{feature.icon}</span>}
              header={<Text weight="semibold" size={200}>{feature.title}</Text>}
              description={<Text size={100}>{feature.desc}</Text>}
            />
          </Card>
        ))}
      </div>

      <Divider style={{ margin: `${tokens.spacingVerticalM} 0` }} />

      {/* Live Demo Section */}
      <Text weight="semibold" size={400}>🚀 Live Demo - Full Fluent Experience:</Text>
      
      {/* Controls */}
      <div className={styles.controlsRow}>
        <div>
          <Text size={200} weight="semibold" style={{ marginRight: '8px' }}>Theme:</Text>
          <div className={styles.themeSelector}>
            {(Object.keys(themeVariants) as ThemeVariantKey[]).map((key) => (
              <ToggleButton
                key={key}
                checked={selectedTheme === key}
                onClick={() => setSelectedTheme(key)}
                appearance={selectedTheme === key ? 'primary' : 'outline'}
                size="small"
                icon={themeVariants[key].icon}
                style={{ 
                  borderColor: selectedTheme === key ? themeVariants[key].color : undefined,
                  backgroundColor: selectedTheme === key ? themeVariants[key].color : undefined,
                }}
              >
                {themeVariants[key].label}
              </ToggleButton>
            ))}
          </div>
        </div>
        
        <div style={{ marginLeft: 'auto' }}>
          <Text size={200} style={{ marginRight: '8px' }}>Starter Prompts:</Text>
          <ToggleButton
            checked={showStarterPrompts}
            onClick={() => setShowStarterPrompts(!showStarterPrompts)}
            appearance={showStarterPrompts ? 'primary' : 'outline'}
            size="small"
          >
            {showStarterPrompts ? '✓ Shown' : 'Hidden'}
          </ToggleButton>
        </div>
      </div>

      {/* Theme Info */}
      <div className={styles.variantInfo}>
        <div 
          className={styles.colorSwatch} 
          style={{ backgroundColor: currentTheme.color }}
        />
        <div>
          <Text weight="semibold">{currentTheme.label}</Text>
          <Text size={200} block style={{ color: '#666' }}>{currentTheme.description}</Text>
          <Badge appearance="filled" style={{ marginTop: 4, backgroundColor: currentTheme.color }}>
            maxMessageLength: 2000 (enables character count)
          </Badge>
        </div>
      </div>

      {/* Chat Container */}
      <div className={styles.chatContainer} style={{ borderColor: currentTheme.color }}>
        <SingleMountComposerDemo 
          connection={connection}
          selectedTheme={selectedTheme}
          showStarterPrompts={showStarterPrompts}
        />
      </div>

      <MessageBar intent="info" style={{ marginTop: tokens.spacingVerticalS }}>
        <MessageBarBody>
          <MessageBarTitle>💡 Try This!</MessageBarTitle>
          1. Type in the send box - watch the character count (0/2000) update<br/>
          2. Send a message - see "Bot is composing..." and sliding dots<br/>
          3. Open DevTools (F12) → Console to see middleware logging<br/>
          4. Switch themes to see different accent colors and styles
        </MessageBarBody>
      </MessageBar>

      <Divider style={{ margin: `${tokens.spacingVerticalL} 0` }} />

      {/* Architecture Diagram */}
      <Text weight="semibold" size={400}>Component Architecture:</Text>
      <div className={styles.architectureBox}>
{`┌─────────────────────────────────────────────────────────────┐
│  <FluentThemeProvider>                                       │
│  ├── MUST wrap Composer (provides Fluent styling middleware) │
│  │                                                          │
│  │   ┌─────────────────────────────────────────────────┐   │
│  │   │  <Composer directLine={...} styleOptions={...}> │   │
│  │   │  ├── Holds: DirectLine, Store, StyleOptions     │   │
│  │   │  ├── Provides: React Context for WebChat hooks  │   │
│  │   │  │   └── styleOptions.maxMessageLength = 2000   │   │
│  │   │  │       ↑ REQUIRED for character count!        │   │
│  │   │  │                                              │   │
│  │   │  │   ┌────────────────────────────────────┐    │   │
│  │   │  │   │  <ConnectionStatusBar />           │    │   │
│  │   │  │   │  └── hooks.useConnectivityStatus() │    │   │
│  │   │  │   └────────────────────────────────────┘    │   │
│  │   │  │                                              │   │
│  │   │  │   ┌────────────────────────────────────┐    │   │
│  │   │  │   │  <StarterPromptsPanel />           │    │   │
│  │   │  │   │  └── hooks.useSendMessage()        │    │   │
│  │   │  │   └────────────────────────────────────┘    │   │
│  │   │  │                                              │   │
│  │   │  │   ┌────────────────────────────────────┐    │   │
│  │   │  │   │  <BasicWebChat />                  │    │   │
│  │   │  │   │  └── Chat UI with character count  │    │   │
│  │   │  │   └────────────────────────────────────┘    │   │
│  │   │  │                                              │   │
│  │   │  └──────────────────────────────────────────────│   │
│  │   └─────────────────────────────────────────────────┘   │
│  │                                                          │
│  └──────────────────────────────────────────────────────────│
└─────────────────────────────────────────────────────────────┘`}
      </div>

      {/* Pros/Cons */}
      <div className={styles.prosConsList}>
        <div className={`${styles.prosCons} ${styles.pros}`}>
          <Text weight="semibold">✓ When to Use This Pattern</Text>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Need FluentThemeProvider for Microsoft styling</li>
            <li>Want custom components with WebChat hooks</li>
            <li>Building complex layouts around the chat</li>
            <li>Need activity or store middleware</li>
            <li>Enterprise production apps</li>
          </ul>
        </div>
        <div className={`${styles.prosCons} ${styles.cons}`}>
          <Text weight="semibold">✗ When NOT to Use</Text>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Simple "just show a chat" use case</li>
            <li>Quick prototyping</li>
            <li>No customization needed</li>
            <li>→ Use ReactWebChat instead</li>
          </ul>
        </div>
      </div>

      <Divider style={{ margin: `${tokens.spacingVerticalL} 0` }} />

      {/* Code Examples */}
      <Text weight="semibold" size={400}>📝 Code Examples (Step by Step):</Text>

      <Text weight="semibold" style={{ marginTop: tokens.spacingVerticalM }}>
        1️⃣ Basic Pattern - Composer + BasicWebChat
      </Text>
      <CodeBlockWithModal code={codeExample1_BasicPattern} title="Basic Flexible React Pattern" language="tsx">
        <div className={styles.codeBlock}>{codeExample1_BasicPattern}</div>
      </CodeBlockWithModal>

      <Text weight="semibold" style={{ marginTop: tokens.spacingVerticalL }}>
        2️⃣ Custom Components with WebChat Hooks
      </Text>
      <CodeBlockWithModal code={codeExample2_CustomComponents} title="Custom Components with Hooks" language="tsx">
        <div className={styles.codeBlock}>{codeExample2_CustomComponents}</div>
      </CodeBlockWithModal>

      <Text weight="semibold" style={{ marginTop: tokens.spacingVerticalL }}>
        3️⃣ Activity Middleware (Transform Rendering)
      </Text>
      <CodeBlockWithModal code={codeExample3_ActivityMiddleware} title="Activity Middleware" language="tsx">
        <div className={styles.codeBlock}>{codeExample3_ActivityMiddleware}</div>
      </CodeBlockWithModal>

      <Text weight="semibold" style={{ marginTop: tokens.spacingVerticalL }}>
        4️⃣ Store Middleware (Redux-style Actions)
      </Text>
      <CodeBlockWithModal code={codeExample4_StoreMiddleware} title="Store Middleware" language="tsx">
        <div className={styles.codeBlock}>{codeExample4_StoreMiddleware}</div>
      </CodeBlockWithModal>

      <Text weight="semibold" style={{ marginTop: tokens.spacingVerticalL }}>
        5️⃣ Complete Production Implementation
      </Text>
      <CodeBlockWithModal code={codeExample5_FullImplementation} title="Complete Implementation" language="tsx">
        <div className={styles.codeBlock}>{codeExample5_FullImplementation}</div>
      </CodeBlockWithModal>
    </div>
  );
}
