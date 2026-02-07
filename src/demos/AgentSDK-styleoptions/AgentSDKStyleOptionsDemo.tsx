/**
 * Demo: StyleOptions Customization
 * 
 * Demonstrates the simpler styleOptions approach for Web Chat styling.
 * styleOptions provides a quick and effective way to customize:
 * - Bubble background colors
 * - Font size and color
 * - Avatar styling
 * - Suggested actions appearance
 * 
 * Best for: Quick customizations that don't require granular control.
 */
import { useRef, useEffect, useState, useMemo } from 'react';
import ReactWebChat from 'botframework-webchat';
import type { CopilotStudioWebChatConnection } from '@microsoft/agents-copilotstudio-client';
import {
  makeStyles,
  tokens,
  Text,
  Divider,
  ToggleButton,
} from '@fluentui/react-components';
import { CodeBlockWithModal } from '../../components/common/CodeModal';

// Theme configurations
const themes = {
  microsoft: {
    label: 'Microsoft Theme',
    description: 'Blue accent with clean corporate styling',
    color: '#0078D4',
    styleOptions: {
      accent: '#0078D4',
      backgroundColor: '#F5F5F5',
      primaryFont: "'Segoe UI', sans-serif",
      botAvatarBackgroundColor: '#0078D4',
      botAvatarInitials: 'AI',
      userAvatarBackgroundColor: '#107C10',
      userAvatarInitials: 'ME',
      bubbleBackground: '#FFFFFF',
      bubbleFromUserBackground: '#E1DFDD',
      bubbleBorderRadius: 8,
      suggestedActionBackground: '#0078D4',
      suggestedActionTextColor: '#FFFFFF',
      hideUploadButton: true,
    },
  },
  citizenAdvice: {
    label: 'Citizen Advice Theme',
    description: 'CA branded with green accents',
    color: '#004B88',
    styleOptions: {
      accent: '#004B88',
      backgroundColor: '#FAFAFA',
      primaryFont: "'Open Sans', 'Segoe UI', sans-serif",
      botAvatarBackgroundColor: '#004B88',
      botAvatarInitials: 'CA',
      userAvatarBackgroundColor: '#00823B',
      userAvatarInitials: 'YOU',
      bubbleBackground: '#FFFFFF',
      bubbleFromUserBackground: '#E8F5E9',
      bubbleBorderRadius: 12,
      bubbleTextColor: '#333333',
      bubbleFromUserTextColor: '#1A1A1A',
      suggestedActionBackground: '#00823B',
      suggestedActionTextColor: '#FFFFFF',
      suggestedActionBorderRadius: 20,
      hideUploadButton: true,
    },
  },
};

type ThemeKey = keyof typeof themes;

// Single WebChat instance - theme can be changed dynamically
function ThemedWebChat({ 
  connection, 
  selectedTheme,
}: { 
  connection: CopilotStudioWebChatConnection;
  selectedTheme: ThemeKey;
}) {
  const [mounted, setMounted] = useState(false);
  const mountedRef = useRef(false);

  // Memoize styleOptions to allow dynamic theme switching
  const styleOptions = useMemo(() => {
    return themes[selectedTheme].styleOptions;
  }, [selectedTheme]);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      setMounted(true);
    }
  }, []);

  if (!mounted) return null;

  return (
    <ReactWebChat
      directLine={connection}
      styleOptions={styleOptions}
    />
  );
}

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  description: {
    backgroundColor: '#f5f5f5',
    padding: tokens.spacingHorizontalL,
    borderRadius: tokens.borderRadiusMedium,
    borderLeft: '4px solid #0078d4',
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
    height: '400px',
    border: '1px solid #ccc',
    borderRadius: tokens.borderRadiusMedium,
    overflow: 'hidden',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalL,
  },
  infoBox: {
    backgroundColor: '#EFF6FC',
    border: '1px solid #0078D4',
    borderRadius: tokens.borderRadiusMedium,
    padding: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalM,
  },
  themeSelector: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalM,
    flexWrap: 'wrap',
  },
  themeInfo: {
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
});

interface AgentSDKStyleOptionsDemoProps {
  connection: CopilotStudioWebChatConnection;
}

const codeExample = `// StyleOptions - Simple & Effective Customization
const styleOptions = {
  // Accent colors
  accent: '#0078D4',                    // Microsoft Blue
  backgroundColor: '#F5F5F5',

  // Typography
  primaryFont: "'Segoe UI', sans-serif",

  // Bot avatar
  botAvatarBackgroundColor: '#0078D4',
  botAvatarInitials: 'AI',

  // User avatar  
  userAvatarBackgroundColor: '#107C10',
  userAvatarInitials: 'ME',

  // Message bubbles
  bubbleBackground: '#FFFFFF',
  bubbleFromUserBackground: '#E1DFDD',
  bubbleBorderRadius: 8,

  // Suggested actions
  suggestedActionBackground: '#0078D4',
  suggestedActionTextColor: '#FFFFFF',
};

// Usage with ReactWebChat
<ReactWebChat
  directLine={connection}
  styleOptions={styleOptions}
/>`;

export default function AgentSDKStyleOptionsDemo({ connection }: AgentSDKStyleOptionsDemoProps) {
  const styles = useStyles();
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>('microsoft');
  const currentTheme = themes[selectedTheme];

  return (
    <div className={styles.container}>
      <div className={styles.description}>
        <Text weight="semibold" size={400}>
          StyleOptions - Simple & Effective Customization
        </Text>
        <Text block style={{ marginTop: '8px' }}>
          <code>styleOptions</code> provides a quick and straightforward way to customize Web Chat's appearance.
          It's perfect for basic branding needs like colors, fonts, and avatar styling. However, it doesn't
          support advanced customizations like timestamp styling or typing indicator modifications.
        </Text>
      </div>

      <div className={styles.infoBox}>
        <Text weight="semibold">💡 Pro Tip:</Text>
        <Text block style={{ marginTop: '4px' }}>
          For a premium Microsoft Teams/Copilot experience, consider using <code>Fluent Theme</code> instead.
          It provides built-in code highlighting, starter prompts, and Shadow DOM isolation. Fluent Theme 
          works with both Token Endpoint (anonymous) and M365 SDK (authenticated) connections. See the 
          <strong> Branding</strong> tab for a full comparison of all styling options.
        </Text>
      </div>

      <Divider style={{ margin: `${tokens.spacingVerticalL} 0` }} />

      <Text weight="semibold" size={400}>Code Example:</Text>
      <CodeBlockWithModal code={codeExample} title="StyleOptions Configuration" language="tsx">
        <div className={styles.codeBlock}>{codeExample}</div>
      </CodeBlockWithModal>

      <Text weight="semibold" size={400}>Live Demo:</Text>
      <Text size={200} style={{ color: '#666' }}>
        Switch between themes to see different styleOptions configurations applied in real-time.
      </Text>
      
      {/* Theme Selector */}
      <div className={styles.themeSelector}>
        <ToggleButton
          checked={selectedTheme === 'microsoft'}
          onClick={() => setSelectedTheme('microsoft')}
          appearance={selectedTheme === 'microsoft' ? 'primary' : 'outline'}
        >
          Microsoft Theme
        </ToggleButton>
        <ToggleButton
          checked={selectedTheme === 'citizenAdvice'}
          onClick={() => setSelectedTheme('citizenAdvice')}
          appearance={selectedTheme === 'citizenAdvice' ? 'primary' : 'outline'}
        >
          Citizen Advice Theme
        </ToggleButton>
      </div>

      <div className={styles.themeInfo}>
        <div 
          className={styles.colorSwatch} 
          style={{ backgroundColor: currentTheme.color }}
        />
        <div>
          <Text weight="semibold">{currentTheme.label}</Text>
          <Text size={200} block>{currentTheme.description}</Text>
        </div>
      </div>

      <div className={styles.chatContainer}>
        <ThemedWebChat 
          connection={connection} 
          selectedTheme={selectedTheme}
        />
      </div>
    </div>
  );
}
