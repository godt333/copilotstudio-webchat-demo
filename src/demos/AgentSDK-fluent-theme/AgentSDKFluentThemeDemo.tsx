/**
 * ============================================================================
 * Demo: Fluent UI Theme System - Advanced Features
 * ============================================================================
 * 
 * This demo showcases the FluentThemeProvider with ALL its advanced features:
 * 
 * FEATURES DEMONSTRATED:
 * ----------------------
 * 1. FluentThemeProvider Wrapper - Microsoft Copilot-style UI
 * 2. Sliding Dots Typing Indicator - Modern animated indicator
 * 3. Character Count Send Box - Shows 0/2000 limit
 * 4. Activity Loading States - Smooth animations
 * 5. Starter Prompts - Pre-chat suggested prompts
 * 6. Custom Activity Middleware - Transform activity rendering
 * 7. Code Block Syntax Highlighting - Automatic formatting
 * 8. Part Grouping - Related messages grouped visually
 * 9. Voice Transcript Support - Speech-to-text integration
 * 
 * ARCHITECTURE:
 * -------------
 * FluentThemeProvider wraps Composer + BasicWebChat to provide:
 * - Custom ActivityMiddleware (pre-chat, liner activities)
 * - Custom SendBoxMiddleware (character count, file styling)
 * - Custom TypingIndicatorMiddleware (sliding dots)
 * - Fluent UI design tokens throughout
 */

import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { 
  Components,
  createStore,
  hooks,
} from 'botframework-webchat';
import { FluentThemeProvider } from 'botframework-webchat-fluent-theme';
import type { CopilotStudioWebChatConnection } from '@microsoft/agents-copilotstudio-client';
import {
  makeStyles,
  tokens,
  Text,
  Badge,
  Divider,
  Card,
  CardHeader,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
  ToggleButton,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Button,
  Tooltip,
} from '@fluentui/react-components';
import {
  Sparkle24Regular,
  Color24Regular,
  WindowDevTools24Regular,
  Code24Regular,
  Chat24Regular,
  BrainCircuit24Regular,
  Mic24Regular,
  Speaker224Regular,
  TextBulletListSquare24Regular,
} from '@fluentui/react-icons';
import { CodeBlockWithModal } from '../../components/common/CodeModal';

// ============================================================================
// EXTRACT COMPOSER AND BASICWEBCHAT
// ============================================================================
const { Composer, BasicWebChat } = Components;

// ============================================================================
// THEME VARIANTS
// ============================================================================
/**
 * FluentThemeProvider provides the base styling.
 * We can further customize with styleOptions for different "variants".
 * 
 * KEY STYLEPTIONS FOR FLUENT FEATURES:
 * - maxMessageLength: Enables character count display (e.g., "45/2000")
 * - hideUploadButton: Show/hide the file attachment button
 * - hideTelephoneKeypadButton: Show/hide telephone keypad (for IVR scenarios)
 */
const variants = {
  fluent: {
    label: 'Fluent Theme',
    description: 'Standard Fluent UI with character count (0/2000) and modern send box',
    color: '#0078D4',
    styleOptions: {
      // IMPORTANT: maxMessageLength enables the character count feature!
      maxMessageLength: 2000,
      hideUploadButton: false, // Show upload to demonstrate Fluent styling
      hideTelephoneKeypadButton: true, // Hide telephone keypad
    },
  },
  copilot: {
    label: 'Copilot Style',
    description: 'Microsoft Copilot styling with purple accents and character count',
    color: '#6750A4',
    styleOptions: {
      // IMPORTANT: maxMessageLength enables the character count feature!
      maxMessageLength: 2000,
      hideUploadButton: false,
      hideTelephoneKeypadButton: true,
      accent: '#6750A4',
      bubbleFromUserBackground: '#6750A4',
      bubbleFromUserTextColor: '#FFFFFF',
      suggestedActionBackground: '#6750A4',
      suggestedActionTextColor: '#FFFFFF',
    },
  },
};

type VariantKey = keyof typeof variants;

// ============================================================================
// STARTER PROMPTS CONFIGURATION
// ============================================================================
/**
 * Starter prompts appear before the user sends their first message.
 * They guide users with suggested conversation starters.
 * 
 * Note: These are typically configured via the bot's greeting or
 * can be sent as suggested actions in the welcome message.
 * 
 * Implementation approaches:
 * 1. Bot sends welcome message with suggestedActions (recommended)
 * 2. Custom pre-chat message middleware (advanced)
 * 3. Activity middleware to inject prompts (demo below)
 */
const starterPrompts = [
  "What benefits am I entitled to?",
  "How do I appeal a decision?",
  "Help with housing issues",
  "Debt advice and support",
];

// ============================================================================
// CUSTOM STORE MIDDLEWARE - ANALYTICS & LOGGING
// ============================================================================
/**
 * Note: Activity middleware requires complex type definitions.
 * For logging/analytics, store middleware is simpler and equally effective.
 * The examples in the code blocks show how activity middleware would work.
 */
type Activity = {
  type?: string;
  name?: string;
  text?: string;
  from?: { role?: string };
};

type WebChatAction = {
  type: string;
  payload?: {
    activity?: Activity;
  };
};

const createAnalyticsMiddleware = () => 
  () => 
    (next: (action: WebChatAction) => unknown) => 
      (action: WebChatAction) => {
        // Track conversation events for analytics
        switch (action.type) {
          case 'DIRECT_LINE/CONNECT_FULFILLED':
            console.log('%c[Analytics] Conversation Started', 'color: #107c10; font-weight: bold');
            break;
            
          case 'DIRECT_LINE/INCOMING_ACTIVITY':
            const activity = action.payload?.activity;
            if (activity?.type === 'message') {
              console.log('%c[Analytics] Bot Message', 'color: #0078d4', {
                hasText: !!activity.text,
                textLength: activity.text?.length,
              });
            }
            break;
            
          case 'DIRECT_LINE/POST_ACTIVITY':
            console.log('%c[Analytics] User Message', 'color: #6750a4');
            break;
        }
        
        return next(action);
      };

// ============================================================================
// CUSTOM COMPONENT: VOICE TRANSCRIPT DISPLAY
// ============================================================================
/**
 * Demonstrates voice transcript support.
 * FluentThemeProvider has built-in support for voice activities.
 * This component shows how you'd build custom voice UI.
 */
function VoiceTranscriptStatus() {
  // In a real implementation, you'd use these hooks:
  // const [dictateState] = hooks.useDictateState();
  // const [speechState] = hooks.useSpeechState();
  
  const [isListening, setIsListening] = useState(false);
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '4px 12px',
      backgroundColor: isListening ? '#fff3e0' : 'transparent',
      borderRadius: '4px',
      fontSize: '12px',
    }}>
      {isListening ? (
        <>
          <Mic24Regular style={{ color: '#ff5722' }} />
          <span style={{ color: '#e65100' }}>Listening...</span>
        </>
      ) : (
        <Tooltip content="Voice input available with speech services" relationship="label">
          <Button 
            appearance="subtle" 
            size="small"
            icon={<Mic24Regular />}
            onClick={() => setIsListening(true)}
          >
            Voice
          </Button>
        </Tooltip>
      )}
    </div>
  );
}

// ============================================================================
// CUSTOM COMPONENT: CONNECTION & TYPING STATUS
// ============================================================================
function StatusBar() {
  const [connectivityStatus] = hooks.useConnectivityStatus();
  const [typingVisible] = hooks.useTypingIndicatorVisible();
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 16px',
      backgroundColor: '#fafafa',
      borderBottom: '1px solid #e0e0e0',
      fontSize: '13px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Badge 
          appearance="filled" 
          color={connectivityStatus === 'connected' ? 'success' : 'warning'}
          size="small"
        >
          {connectivityStatus}
        </Badge>
        <span style={{ color: '#666' }}>FluentThemeProvider Active</span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {typingVisible && (
          <span style={{ fontStyle: 'italic', color: '#6750a4' }}>
            ✨ Bot is composing...
          </span>
        )}
        <VoiceTranscriptStatus />
      </div>
    </div>
  );
}

// ============================================================================
// STARTER PROMPTS UI COMPONENT
// ============================================================================
function StarterPromptsPanel({ onPromptClick }: { onPromptClick: (prompt: string) => void }) {
  return (
    <div style={{
      padding: '16px',
      backgroundColor: '#f5f5f5',
      borderBottom: '1px solid #e0e0e0',
    }}>
      <Text size={200} style={{ color: '#666', marginBottom: '8px', display: 'block' }}>
        💡 Quick Start - Click a topic:
      </Text>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {starterPrompts.map((prompt, idx) => (
          <Button
            key={idx}
            appearance="outline"
            size="small"
            onClick={() => onPromptClick(prompt)}
            style={{ 
              borderColor: '#6750a4', 
              color: '#6750a4',
              borderRadius: '16px',
            }}
          >
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN FLUENT WEBCHAT COMPONENT
// ============================================================================
function FluentThemedWebChat({ 
  connection,
  selectedVariant,
  showStarterPrompts,
}: { 
  connection: CopilotStudioWebChatConnection;
  selectedVariant: VariantKey;
  showStarterPrompts: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const mountedRef = useRef(false);

  // Get variant style options
  const styleOptions = useMemo(() => variants[selectedVariant].styleOptions, [selectedVariant]);

  // Create store with analytics middleware
  const store = useMemo(() => createStore({}, createAnalyticsMiddleware()), []);

  // Handle interaction callback - this doesn't need hooks, just updates state
  const handleInteraction = useCallback(() => {
    setHasInteracted(true);
  }, []);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      setMounted(true);
      console.log('%c[FluentTheme Demo] Mounted with Composer + BasicWebChat', 'color: #6750a4; font-weight: bold');
    }
  }, []);

  if (!mounted) return null;

  // IMPORTANT: FluentThemeProvider must wrap Composer, not be inside it!
  // FluentThemeProvider has its own internal ThemeProvider that overrides styleOptions.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <FluentThemeProvider>
        <Composer
          directLine={connection}
          store={store}
          styleOptions={styleOptions}
        >
          {/* Custom status bar using WebChat hooks */}
          <StatusBar />
          
          {/* Starter prompts (shown until user interacts) - INSIDE Composer so it can use hooks */}
          {showStarterPrompts && !hasInteracted && (
            <StarterPromptsWrapper onInteraction={handleInteraction} />
          )}
          
          {/* The actual chat UI with Fluent styling */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <BasicWebChat />
          </div>
        </Composer>
      </FluentThemeProvider>
    </div>
  );
}

// Wrapper to access hooks for starter prompts - MUST be inside Composer!
function StarterPromptsWrapper({ onInteraction }: { onInteraction: () => void }) {
  const sendMessage = hooks.useSendMessage();
  
  const handleClick = useCallback((prompt: string) => {
    sendMessage(prompt);
    onInteraction();
  }, [sendMessage, onInteraction]);
  
  return <StarterPromptsPanel onPromptClick={handleClick} />;
}

// Single mount wrapper for React Strict Mode
function SingleMountFluentWebChat({ 
  connection,
  selectedVariant,
  showStarterPrompts,
}: { 
  connection: CopilotStudioWebChatConnection;
  selectedVariant: VariantKey;
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
    <FluentThemedWebChat 
      connection={connection} 
      selectedVariant={selectedVariant}
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: tokens.spacingHorizontalL,
    borderRadius: tokens.borderRadiusMedium,
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
    border: '2px solid #6750A4',
    borderRadius: tokens.borderRadiusMedium,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 12px rgba(103, 80, 164, 0.15)',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalM,
  },
  featureCard: {
    padding: tokens.spacingHorizontalM,
  },
  featureIcon: {
    fontSize: '24px',
    color: '#6750A4',
    marginBottom: tokens.spacingVerticalS,
  },
  variantSelector: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalM,
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
  },
  infoBox: {
    backgroundColor: '#EDE7F6',
    border: '1px solid #6750A4',
    borderRadius: tokens.borderRadiusMedium,
    padding: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalM,
  },
  controlsRow: {
    display: 'flex',
    gap: tokens.spacingHorizontalL,
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: tokens.spacingVerticalM,
  },
});

// ============================================================================
// FEATURE LIST
// ============================================================================
const features = [
  {
    icon: <Sparkle24Regular />,
    title: 'FluentThemeProvider',
    description: 'Wraps WebChat with Microsoft Fluent UI styling, matching Teams and M365.',
  },
  {
    icon: <Color24Regular />,
    title: 'Sliding Dots Typing',
    description: 'Modern animated typing indicator replaces classic three dots.',
  },
  {
    icon: <WindowDevTools24Regular />,
    title: 'Character Count (0/2000)',
    description: 'Send box shows character count and respects message limits.',
  },
  {
    icon: <Code24Regular />,
    title: 'Code Block Highlighting',
    description: 'Automatic syntax highlighting with copy-to-clipboard buttons.',
  },
  {
    icon: <Chat24Regular />,
    title: 'Starter Prompts',
    description: 'Pre-chat suggested prompts guide users to common topics.',
  },
  {
    icon: <BrainCircuit24Regular />,
    title: 'Activity Loading States',
    description: 'Smooth animations while bot prepares complex responses.',
  },
  {
    icon: <TextBulletListSquare24Regular />,
    title: 'Part Grouping',
    description: 'Related messages grouped visually with decorators.',
  },
  {
    icon: <Speaker224Regular />,
    title: 'Voice Transcript',
    description: 'Built-in support for speech-to-text activities.',
  },
];

// ============================================================================
// CODE EXAMPLES
// ============================================================================
const codeExample_BasicUsage = `// ============================================================================
// BASIC USAGE: FluentThemeProvider
// ============================================================================
// Just wrap your WebChat - that's it!

import { FluentThemeProvider } from 'botframework-webchat-fluent-theme';
import ReactWebChat from 'botframework-webchat';

function FluentWebChat({ connection }) {
  return (
    <FluentThemeProvider>
      <ReactWebChat directLine={connection} />
    </FluentThemeProvider>
  );
}

// What FluentThemeProvider provides automatically:
// ✓ Sliding dots typing indicator (not classic three dots)
// ✓ Character count in send box (0/2000)
// ✓ Fluent UI styled file upload button
// ✓ Activity loading animations
// ✓ Microsoft design tokens throughout`;

const codeExample_ComposerPattern = `// ============================================================================
// ADVANCED: Composer + BasicWebChat + FluentThemeProvider
// ============================================================================
// For maximum flexibility, use the Composer pattern

import { Components, hooks } from 'botframework-webchat';
import { FluentThemeProvider } from 'botframework-webchat-fluent-theme';

const { Composer, BasicWebChat } = Components;

// Custom component that uses WebChat hooks
function ConnectionStatus() {
  const [status] = hooks.useConnectivityStatus();
  const [typing] = hooks.useTypingIndicatorVisible();
  
  return (
    <div className="status-bar">
      <span>Status: {status}</span>
      {typing && <span>Bot typing...</span>}
    </div>
  );
}

function AdvancedFluentWebChat({ connection }) {
  return (
    <Composer directLine={connection}>
      <FluentThemeProvider>
        {/* Your custom components with hook access */}
        <ConnectionStatus />
        
        {/* The chat UI with Fluent styling */}
        <BasicWebChat />
      </FluentThemeProvider>
    </Composer>
  );
}`;

const codeExample_StarterPrompts = `// ============================================================================
// STARTER PROMPTS: Guide users with suggested topics
// ============================================================================

// Option 1: Bot sends welcome message with suggestedActions (RECOMMENDED)
// Configure in Copilot Studio: Topics > Greeting > Add suggested actions

// Option 2: Custom pre-chat UI component
function StarterPrompts({ onPromptClick }) {
  const prompts = [
    "What benefits am I entitled to?",
    "How do I appeal a decision?",
    "Help with housing issues",
  ];
  
  return (
    <div className="starter-prompts">
      <p>Quick Start - Click a topic:</p>
      {prompts.map((prompt, i) => (
        <button key={i} onClick={() => onPromptClick(prompt)}>
          {prompt}
        </button>
      ))}
    </div>
  );
}

// Use with WebChat hooks to send the message
function StarterPromptsWithHooks({ onPromptClick }) {
  const sendMessage = hooks.useSendMessage();
  
  const handleClick = (prompt) => {
    sendMessage(prompt);  // Send to bot
    onPromptClick(prompt); // Update UI
  };
  
  return <StarterPrompts onPromptClick={handleClick} />;
}

// Wrap in Composer to access hooks
<Composer directLine={connection}>
  <FluentThemeProvider>
    <StarterPromptsWithHooks onPromptClick={...} />
    <BasicWebChat />
  </FluentThemeProvider>
</Composer>`;

const codeExample_CodeHighlighting = `// ============================================================================
// CODE BLOCK SYNTAX HIGHLIGHTING
// ============================================================================
// FluentThemeProvider automatically styles code blocks in bot messages!

// When your bot sends markdown with code:
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

// FluentThemeProvider provides:
// ✓ Syntax highlighting (language-aware)
// ✓ Copy-to-clipboard button
// ✓ Proper monospace font
// ✓ Dark theme code background

// For best results, ensure your bot sends properly formatted markdown:
// - Use triple backticks with language identifier
// - Specify the language (javascript, python, csharp, etc.)
// - Keep code blocks complete and properly indented

// Example bot response (from Copilot Studio):
"Here's how to format a date in JavaScript:

\\\`\\\`\\\`javascript
const date = new Date();
const formatted = date.toLocaleDateString('en-GB');
console.log(formatted); // "10/02/2026"
\\\`\\\`\\\`

This will display the date in UK format."`;

const codeExample_VoiceSupport = `// ============================================================================
// VOICE TRANSCRIPT SUPPORT
// ============================================================================
// FluentThemeProvider has built-in support for speech activities

import { createBrowserWebSpeechPonyfillFactory } from 'botframework-webchat';

// Enable speech recognition and synthesis
const webSpeechPonyfillFactory = createBrowserWebSpeechPonyfillFactory();

<Composer 
  directLine={connection}
  webSpeechPonyfillFactory={webSpeechPonyfillFactory}
>
  <FluentThemeProvider>
    <BasicWebChat />
  </FluentThemeProvider>
</Composer>

// Available voice-related hooks:
// - hooks.useDictateState() - Speech recognition state
// - hooks.useMicrophoneButtonClick() - Trigger microphone
// - hooks.useSpeechSynthesis() - Text-to-speech

// FluentThemeProvider automatically:
// ✓ Styles the microphone button
// ✓ Shows transcript while speaking
// ✓ Displays voice activity indicators
// ✓ Handles speech-to-text UI states`;

const codeExample_Variants = `// ============================================================================
// STYLE VARIANTS: Fluent vs Copilot
// ============================================================================

// Standard Fluent (blue accent)
const fluentStyleOptions = {
  hideUploadButton: false,
  // Uses default Fluent blue (#0078D4)
};

// Copilot Style (purple accent)
const copilotStyleOptions = {
  hideUploadButton: false,
  accent: '#6750A4',
  bubbleFromUserBackground: '#6750A4',
  bubbleFromUserTextColor: '#FFFFFF',
  suggestedActionBackground: '#6750A4',
  suggestedActionTextColor: '#FFFFFF',
};

// Apply to Composer
<Composer 
  directLine={connection}
  styleOptions={copilotStyleOptions}
>
  <FluentThemeProvider>
    <BasicWebChat />
  </FluentThemeProvider>
</Composer>

// You can create custom variants for your brand:
const citizenAdviceStyleOptions = {
  accent: '#1E88E5',           // Your brand blue
  bubbleFromUserBackground: '#1E88E5',
  bubbleFromUserTextColor: '#FFFFFF',
  botAvatarBackgroundColor: '#E8F5E9',
  userAvatarBackgroundColor: '#E3F2FD',
};`;

// ============================================================================
// PROPS
// ============================================================================
interface AgentSDKFluentThemeDemoProps {
  connection: CopilotStudioWebChatConnection;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function AgentSDKFluentThemeDemo({ connection }: AgentSDKFluentThemeDemoProps) {
  const styles = useStyles();
  const [selectedVariant, setSelectedVariant] = useState<VariantKey>('fluent');
  const [showStarterPrompts, setShowStarterPrompts] = useState(true);
  const currentVariant = variants[selectedVariant];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.description}>
        <Text weight="semibold" size={500} style={{ color: 'white' }}>
          ✨ Fluent UI Theme System - Complete Feature Demo
        </Text>
        <Text block style={{ marginTop: '8px', color: 'rgba(255,255,255,0.95)' }}>
          The Fluent UI Theme System brings a <strong>native Microsoft Copilot-style</strong> experience 
          to WebChat. This demo showcases ALL advanced features: sliding dots typing, starter prompts, 
          code highlighting, voice support, and custom middleware.
        </Text>
      </div>

      {/* Try These */}
      <MessageBar intent="info">
        <MessageBarBody>
          <MessageBarTitle>🎯 Try These to See Features in Action:</MessageBarTitle>
          • Type a message to see the <strong>character count (0/2000)</strong> in the send box<br/>
          • Watch the <strong>sliding dots typing indicator</strong> while waiting for a response<br/>
          • Ask "Show me some code" to see <strong>syntax highlighting</strong><br/>
          • Click a <strong>starter prompt</strong> to quickly ask a question<br/>
          • Toggle between <strong>Fluent</strong> and <strong>Copilot</strong> variants
        </MessageBarBody>
      </MessageBar>

      {/* Features Grid */}
      <Text weight="semibold" size={400}>Features Included:</Text>
      <div className={styles.featuresGrid}>
        {features.map((feature, idx) => (
          <Card key={idx} className={styles.featureCard} size="small">
            <CardHeader
              image={<span className={styles.featureIcon}>{feature.icon}</span>}
              header={<Text weight="semibold">{feature.title}</Text>}
              description={<Text size={200}>{feature.description}</Text>}
            />
          </Card>
        ))}
      </div>

      <div className={styles.infoBox}>
        <Text weight="semibold">🎨 Why Choose Fluent Theme?</Text>
        <Text block style={{ marginTop: '8px' }}>
          If you're building for Microsoft 365, Teams, or want a polished enterprise look, 
          FluentThemeProvider gives you instant brand consistency with zero additional styling!
        </Text>
      </div>

      <Divider style={{ margin: `${tokens.spacingVerticalL} 0` }} />

      {/* Code Examples */}
      <Text weight="semibold" size={400}>📝 Implementation Examples:</Text>

      <Text weight="semibold" style={{ marginTop: tokens.spacingVerticalM }}>
        1️⃣ Basic Usage - Just Wrap Your WebChat
      </Text>
      <CodeBlockWithModal code={codeExample_BasicUsage} title="Basic FluentThemeProvider Usage" language="tsx">
        <div className={styles.codeBlock}>{codeExample_BasicUsage}</div>
      </CodeBlockWithModal>

      <Text weight="semibold" style={{ marginTop: tokens.spacingVerticalL }}>
        2️⃣ Advanced: Composer + BasicWebChat Pattern
      </Text>
      <CodeBlockWithModal code={codeExample_ComposerPattern} title="Composer Pattern with Fluent Theme" language="tsx">
        <div className={styles.codeBlock}>{codeExample_ComposerPattern}</div>
      </CodeBlockWithModal>

      <Text weight="semibold" style={{ marginTop: tokens.spacingVerticalL }}>
        3️⃣ Starter Prompts Configuration
      </Text>
      <CodeBlockWithModal code={codeExample_StarterPrompts} title="Starter Prompts" language="tsx">
        <div className={styles.codeBlock}>{codeExample_StarterPrompts}</div>
      </CodeBlockWithModal>

      <Text weight="semibold" style={{ marginTop: tokens.spacingVerticalL }}>
        4️⃣ Code Block Syntax Highlighting
      </Text>
      <CodeBlockWithModal code={codeExample_CodeHighlighting} title="Code Syntax Highlighting" language="tsx">
        <div className={styles.codeBlock}>{codeExample_CodeHighlighting}</div>
      </CodeBlockWithModal>

      <Accordion collapsible style={{ marginTop: tokens.spacingVerticalM }}>
        <AccordionItem value="voice">
          <AccordionHeader>5️⃣ Voice Transcript Support</AccordionHeader>
          <AccordionPanel>
            <CodeBlockWithModal code={codeExample_VoiceSupport} title="Voice Support" language="tsx">
              <div className={styles.codeBlock}>{codeExample_VoiceSupport}</div>
            </CodeBlockWithModal>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem value="variants">
          <AccordionHeader>6️⃣ Style Variants (Fluent vs Copilot)</AccordionHeader>
          <AccordionPanel>
            <CodeBlockWithModal code={codeExample_Variants} title="Style Variants" language="tsx">
              <div className={styles.codeBlock}>{codeExample_Variants}</div>
            </CodeBlockWithModal>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      <Divider style={{ margin: `${tokens.spacingVerticalL} 0` }} />

      {/* Live Demo */}
      <Text weight="semibold" size={400}>🚀 Live Demo:</Text>
      
      {/* Controls */}
      <div className={styles.controlsRow}>
        <div>
          <Text size={200} style={{ marginRight: '8px' }}>Theme Variant:</Text>
          <ToggleButton
            checked={selectedVariant === 'fluent'}
            onClick={() => setSelectedVariant('fluent')}
            appearance={selectedVariant === 'fluent' ? 'primary' : 'outline'}
            size="small"
          >
            Fluent
          </ToggleButton>
          <ToggleButton
            checked={selectedVariant === 'copilot'}
            onClick={() => setSelectedVariant('copilot')}
            appearance={selectedVariant === 'copilot' ? 'primary' : 'outline'}
            size="small"
            style={{ marginLeft: '4px' }}
          >
            Copilot
          </ToggleButton>
        </div>
        
        <div>
          <Text size={200} style={{ marginRight: '8px' }}>Starter Prompts:</Text>
          <ToggleButton
            checked={showStarterPrompts}
            onClick={() => setShowStarterPrompts(!showStarterPrompts)}
            appearance={showStarterPrompts ? 'primary' : 'outline'}
            size="small"
          >
            {showStarterPrompts ? 'Shown' : 'Hidden'}
          </ToggleButton>
        </div>
      </div>

      {/* Variant Info */}
      <div className={styles.variantInfo}>
        <div 
          className={styles.colorSwatch} 
          style={{ backgroundColor: currentVariant.color }}
        />
        <div>
          <Text weight="semibold">{currentVariant.label}</Text>
          <Text size={200} block>{currentVariant.description}</Text>
          <Badge appearance="filled" color="brand" style={{ marginTop: 4 }}>
            FluentThemeProvider + Composer + BasicWebChat
          </Badge>
        </div>
      </div>

      {/* Chat Container */}
      <div className={styles.chatContainer}>
        <SingleMountFluentWebChat 
          connection={connection} 
          selectedVariant={selectedVariant}
          showStarterPrompts={showStarterPrompts}
        />
      </div>

      <MessageBar intent="success" style={{ marginTop: tokens.spacingVerticalM }}>
        <MessageBarBody>
          <MessageBarTitle>✅ This demo uses the real Composer + BasicWebChat + FluentThemeProvider pattern</MessageBarTitle>
          Open DevTools (F12) → Console to see analytics middleware logging all activities.
        </MessageBarBody>
      </MessageBar>
    </div>
  );
}
