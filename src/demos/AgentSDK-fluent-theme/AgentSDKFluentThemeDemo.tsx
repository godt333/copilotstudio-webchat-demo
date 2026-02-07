/**
 * Demo: Fluent UI Theme System
 * 
 * Demonstrates the Fluent UI Theme System for Web Chat, bringing a native
 * Microsoft Copilot-style user experience. This is a complete design system
 * overhaul using Microsoft's Fluent UI library.
 * 
 * Key Features:
 * - Copilot Variant: Built-in styling matching Microsoft Copilot
 * - Sliding Dots Typing Indicator: Modern animated typing indicator
 * - Activity Decorators: Pluggable visual enhancements with loading states
 * - Code Block Highlighting: Syntax highlighting with copy buttons
 * - Starter Prompts: Pre-chat suggested prompts
 * - Modern Send Box: Enhanced input with character count
 * - Shadow DOM Support: Style encapsulation
 */
import { useRef, useEffect, useState, useMemo } from 'react';
import ReactWebChat from 'botframework-webchat';
import { FluentThemeProvider } from 'botframework-webchat-fluent-theme';
import type { CopilotStudioWebChatConnection } from '@microsoft/agents-copilotstudio-client';
import { adaptiveCardsHostConfig } from '../../config/adaptiveCardsConfig';
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
} from '@fluentui/react-components';
import {
  Sparkle24Regular,
  Color24Regular,
  WindowDevTools24Regular,
  Code24Regular,
  Chat24Regular,
  BrainCircuit24Regular,
  Shield24Regular,
  LightbulbFilament24Regular,
} from '@fluentui/react-icons';
import { CodeBlockWithModal } from '../../components/common/CodeModal';

// Theme variants - demonstrating different styleOptions configurations
// Note: FluentThemeProvider provides the base Fluent styling, 
// we customize further with styleOptions
const variants = {
  fluent: {
    label: 'Fluent Theme',
    description: 'Standard Fluent UI with modern send box and sliding dots typing indicator',
    color: '#0078D4',
    styleOptions: {
      hideUploadButton: false, // Show to demonstrate Fluent styling
    },
  },
  copilot: {
    label: 'Copilot Style',
    description: 'Microsoft Copilot styling with purple accents and enhanced visuals',
    color: '#6750A4',
    styleOptions: {
      hideUploadButton: false,
      accent: '#6750A4',
      bubbleFromUserBackground: '#6750A4',
      bubbleFromUserTextColor: '#FFFFFF',
      suggestedActionBackground: '#6750A4',
      suggestedActionTextColor: '#FFFFFF',
    },
  },
};

type VariantKey = keyof typeof variants;

// Advanced usage code example
const advancedUsageCode = `// FluentThemeProvider wraps your WebChat with:

// 1. Custom Activity Middleware
// - Pre-chat message activity with starter prompts
// - Liner message activity for system messages

// 2. Custom Send Box
// - Modern input with character count (0/2000)
// - Styled file upload button
// - Fluent UI styling throughout

// 3. Activity Decorators  
// - Loading animations while bot prepares response
// - Part grouping for related messages

// 4. Typing Indicator
// - Modern sliding dots animation
// - Replaces the classic three-dot indicator

// 5. Activity Status
// - Voice transcript activity support
// - Enhanced status indicators

// Usage is simple - just wrap your WebChat:
<FluentThemeProvider>
  <ReactWebChat 
    directLine={connection}
    styleOptions={yourCustomStyles}
  />
</FluentThemeProvider>`;

// Single WebChat with FluentThemeProvider
function FluentThemedWebChat({ 
  connection,
  selectedVariant,
}: { 
  connection: CopilotStudioWebChatConnection;
  selectedVariant: VariantKey;
}) {
  const [mounted, setMounted] = useState(false);
  const mountedRef = useRef(false);

  // Get the style options for the selected variant
  const styleOptions = useMemo(() => {
    return variants[selectedVariant].styleOptions;
  }, [selectedVariant]);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      setMounted(true);
    }
  }, []);

  if (!mounted) return null;

  return (
    <FluentThemeProvider>
      <ReactWebChat
        directLine={connection}
        adaptiveCardsHostConfig={adaptiveCardsHostConfig}
        styleOptions={styleOptions}
      />
    </FluentThemeProvider>
  );
}

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
    height: '450px',
    border: '1px solid #ccc',
    borderRadius: tokens.borderRadiusMedium,
    overflow: 'hidden',
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
});

interface AgentSDKFluentThemeDemoProps {
  connection: CopilotStudioWebChatConnection;
}

const features = [
  {
    icon: <Sparkle24Regular />,
    title: 'Copilot Variant',
    description: 'Use variant="copilot" for Microsoft Copilot styling with purple accents.',
  },
  {
    icon: <Color24Regular />,
    title: 'Sliding Dots Typing Indicator',
    description: 'Modern animated typing indicator instead of the classic three dots.',
  },
  {
    icon: <WindowDevTools24Regular />,
    title: 'Activity Loading States',
    description: 'Smooth loading animations when bot is preparing a response.',
  },
  {
    icon: <Code24Regular />,
    title: 'Enhanced Send Box',
    description: 'Modern input with character count (0/2000) and file upload styling.',
  },
  {
    icon: <Chat24Regular />,
    title: 'Pre-Chat Starter Prompts',
    description: 'Beautifully styled suggested actions as starter prompts.',
  },
  {
    icon: <BrainCircuit24Regular />,
    title: 'Part Grouping Decorator',
    description: 'Group related messages together with visual hierarchy.',
  },
  {
    icon: <Shield24Regular />,
    title: 'Consistent Theming',
    description: 'All UI elements follow Fluent Design System for M365 consistency.',
  },
  {
    icon: <LightbulbFilament24Regular />,
    title: 'Voice Transcript Support',
    description: 'Enhanced status indicators for voice-based interactions.',
  },
];

const codeExample = `// Fluent UI Theme System - Modern Microsoft Experience
import ReactWebChat from 'botframework-webchat';
import { FluentThemeProvider } from 'botframework-webchat-fluent-theme';

// Wrap ReactWebChat with FluentThemeProvider for instant Fluent styling
<FluentThemeProvider>
  <ReactWebChat directLine={connection} />
</FluentThemeProvider>

// Add Copilot-style accent colors for purple theming
<FluentThemeProvider>
  <ReactWebChat 
    directLine={connection}
    styleOptions={{
      accent: '#6750A4',
      bubbleFromUserBackground: '#6750A4',
      bubbleFromUserTextColor: '#FFFFFF',
      suggestedActionBackground: '#6750A4',
      suggestedActionTextColor: '#FFFFFF',
    }}
  />
</FluentThemeProvider>

// Fluent Theme automatically provides:
// ✓ Modern sliding dots typing indicator
// ✓ Character count in send box (0/2000)
// ✓ Activity loading states with animations
// ✓ Styled file upload button
// ✓ Pre-chat message activity support
// ✓ Fluent UI design tokens throughout

// Try asking: "Show me a code example" to see 
// how bot responses look with Fluent styling!`;

export default function AgentSDKFluentThemeDemo({ connection }: AgentSDKFluentThemeDemoProps) {
  const styles = useStyles();
  const [selectedVariant, setSelectedVariant] = useState<VariantKey>('fluent');
  const currentVariant = variants[selectedVariant];

  return (
    <div className={styles.container}>
      <div className={styles.description}>
        <Text weight="semibold" size={500} style={{ color: 'white' }}>
          ✨ Fluent UI Theme System
        </Text>
        <Text block style={{ marginTop: '8px', color: 'rgba(255,255,255,0.95)' }}>
          The Fluent UI Theme System brings a <strong>native Microsoft Copilot-style</strong> user experience 
          to Web Chat. It's a complete design system overhaul using Microsoft's Fluent UI library, 
          providing the polished look of Teams and M365 applications with minimal configuration.
        </Text>
      </div>

      {/* Visual Differences Callout */}
      <MessageBar intent="info" style={{ marginTop: tokens.spacingVerticalM }}>
        <MessageBarBody>
          <MessageBarTitle>Try these to see Fluent features:</MessageBarTitle>
          • Type a message to see the <strong>character count (0/2000)</strong> in the send box<br/>
          • Watch for the <strong>sliding dots typing indicator</strong> while waiting for a response<br/>
          • Notice the <strong>smooth loading animation</strong> as the bot prepares its answer<br/>
          • Compare the <strong>Fluent vs Copilot</strong> variants using the toggle below
        </MessageBarBody>
      </MessageBar>

      {/* Key Features */}
      <Text weight="semibold" size={400} style={{ marginTop: tokens.spacingVerticalL }}>Key Features:</Text>
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
          If you're building for Microsoft 365 or Teams, FluentThemeProvider gives you instant 
          brand consistency. Just wrap your WebChat with the provider - no additional styling needed!
        </Text>
      </div>

      <Divider style={{ margin: `${tokens.spacingVerticalL} 0` }} />

      <Text weight="semibold" size={400}>Code Example:</Text>
      <CodeBlockWithModal code={codeExample} title="Fluent Theme Configuration" language="tsx">
        <div className={styles.codeBlock}>{codeExample}</div>
      </CodeBlockWithModal>

      {/* Expandable section for advanced usage */}
      <Accordion collapsible>
        <AccordionItem value="advanced">
          <AccordionHeader>Advanced: What FluentThemeProvider Does Under the Hood</AccordionHeader>
          <AccordionPanel>
            <CodeBlockWithModal code={advancedUsageCode} title="FluentThemeProvider Internals" language="tsx">
              <div className={styles.codeBlock}>{advancedUsageCode}</div>
            </CodeBlockWithModal>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      <Divider style={{ margin: `${tokens.spacingVerticalL} 0` }} />

      <Text weight="semibold" size={400}>Live Demo:</Text>
      <Text size={200} style={{ color: '#666' }}>
        Switch between the two built-in variants to see the visual differences.
      </Text>
      
      {/* Variant Selector */}
      <div className={styles.variantSelector}>
        <ToggleButton
          checked={selectedVariant === 'fluent'}
          onClick={() => setSelectedVariant('fluent')}
          appearance={selectedVariant === 'fluent' ? 'primary' : 'outline'}
        >
          variant="fluent"
        </ToggleButton>
        <ToggleButton
          checked={selectedVariant === 'copilot'}
          onClick={() => setSelectedVariant('copilot')}
          appearance={selectedVariant === 'copilot' ? 'primary' : 'outline'}
        >
          variant="copilot"
        </ToggleButton>
      </div>

      <div className={styles.variantInfo}>
        <div 
          className={styles.colorSwatch} 
          style={{ backgroundColor: currentVariant.color }}
        />
        <div>
          <Text weight="semibold">{currentVariant.label}</Text>
          <Text size={200} block>{currentVariant.description}</Text>
          <Badge appearance="filled" color="brand" style={{ marginTop: 4 }}>FluentThemeProvider</Badge>
        </div>
      </div>

      <div className={styles.chatContainer}>
        <FluentThemedWebChat 
          connection={connection} 
          selectedVariant={selectedVariant}
        />
      </div>
    </div>
  );
}
