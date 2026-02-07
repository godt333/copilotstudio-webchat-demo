/**
 * Demo: StyleSet Advanced Customization
 * 
 * Demonstrates the advanced styleSet approach using createStyleSet().
 * styleSet offers granular control over the chat interface including:
 * - Custom timestamp styling
 * - Typing indicator modifications
 * - Suggestion action alignment
 * - Custom border styles
 * - Scrollbar appearance
 * 
 * Best for: Advanced UI customizations requiring granular control.
 */
import { useRef, useEffect, useState, useMemo } from 'react';
import ReactWebChat, { createStyleSet } from 'botframework-webchat';
import type { CopilotStudioWebChatConnection } from '@microsoft/agents-copilotstudio-client';
import {
  makeStyles,
  tokens,
  Text,
  Badge,
  Divider,
  Card,
  ToggleButton,
} from '@fluentui/react-components';
import {
  Checkmark24Regular,
} from '@fluentui/react-icons';
import { CodeBlockWithModal } from '../../components/common/CodeModal';

// Theme configurations with styleOptions for createStyleSet
const themes = {
  corporate: {
    label: 'Corporate Theme',
    description: 'Clean, professional light theme',
    color: '#0178D4',
    styleOptions: {
      backgroundColor: '#F0F0F0',
      bubbleBackground: '#FFFFFF',
      bubbleTextColor: '#000000',
      bubbleFromUserBackground: '#0178D4',
      bubbleFromUserTextColor: '#FFFFFF',
      primaryFont: "'Segoe UI', sans-serif",
      bubbleBorderRadius: 8,
      bubbleFromUserBorderRadius: 8,
      hideUploadButton: true,
    },
  },
  premiumDark: {
    label: 'Premium Dark Theme',
    description: 'Modern dark theme with accent colors',
    color: '#E94560',
    styleOptions: {
      backgroundColor: '#1A1A2E',
      bubbleBackground: '#16213E',
      bubbleTextColor: '#E8E8E8',
      bubbleFromUserBackground: '#0F3460',
      bubbleFromUserTextColor: '#FFFFFF',
      bubbleBorderRadius: 16,
      bubbleFromUserBorderRadius: 16,
      primaryFont: "'Inter', 'Segoe UI', sans-serif",
      accent: '#E94560',
      sendBoxBackground: '#16213E',
      sendBoxTextColor: '#E8E8E8',
      sendBoxButtonColor: '#E94560',
      suggestedActionBackground: '#0F3460',
      suggestedActionTextColor: '#E94560',
      suggestedActionBorderColor: '#E94560',
      hideUploadButton: true,
    },
  },
};

type ThemeKey = keyof typeof themes;

// Single WebChat with dynamic styleSet
function ThemedStyleSetWebChat({ 
  connection, 
  selectedTheme,
}: { 
  connection: CopilotStudioWebChatConnection;
  selectedTheme: ThemeKey;
}) {
  const [mounted, setMounted] = useState(false);
  const mountedRef = useRef(false);

  // Create styleSet from current theme's styleOptions
  const styleSet = useMemo(() => {
    return createStyleSet(themes[selectedTheme].styleOptions);
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
      styleSet={styleSet}
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
    borderLeft: '4px solid #6B2D7B',
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
    maxHeight: '400px',
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
  featureList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalM,
  },
  featureCard: {
    padding: tokens.spacingHorizontalM,
    backgroundColor: '#F3E5F5',
    borderLeft: '4px solid #6B2D7B',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalS,
  },
  featureIcon: {
    color: '#6B2D7B',
    marginTop: '2px',
  },
  warningBox: {
    backgroundColor: '#FFF3CD',
    border: '1px solid #FFC107',
    borderRadius: tokens.borderRadiusMedium,
    padding: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalM,
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

interface AgentSDKStyleSetDemoProps {
  connection: CopilotStudioWebChatConnection;
}

const codeExample = `// StyleSet - Advanced Customization with createStyleSet()
import ReactWebChat, { createStyleSet } from 'botframework-webchat';

// 1. Create base styleSet with styleOptions
const styleSet = createStyleSet({
  backgroundColor: '#F0F0F0',
  bubbleBackground: '#FFFFFF',
  bubbleTextColor: '#000000',
  bubbleFromUserBackground: '#0178D4',
  bubbleFromUserTextColor: '#FFFFFF',
  primaryFont: "'Segoe UI', sans-serif",
  bubbleBorderRadius: 8,
  bubbleFromUserBorderRadius: 8,
});

// 2. You can override specific components:
// - styleSet.textContent
// - styleSet.timestamp
// - styleSet.typingIndicator  
// - styleSet.suggestedAction
// - styleSet.scrollToEndButton
// - And many more...

// 3. Render WebChat with styleSet (not styleOptions!)
<ReactWebChat
  directLine={connection}
  styleSet={styleSet}  // Use styleSet instead of styleOptions
/>

// ⚠️ Important: styleSet may require updates with new Web Chat releases`;

const styleSetFeatures = [
  'Customize timestamps styling',
  'Modify typing indicator appearance',
  'Control suggestion action alignment',
  'Add custom borders to bubbles',
  'Style the scrollbar',
  'Override individual component styles',
  'Full CSS-in-JS control',
  'Theme the send box',
];

export default function AgentSDKStyleSetDemo({ connection }: AgentSDKStyleSetDemoProps) {
  const styles = useStyles();
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>('corporate');
  const currentTheme = themes[selectedTheme];

  return (
    <div className={styles.container}>
      <div className={styles.description}>
        <Text weight="semibold" size={400}>
          StyleSet - Advanced Manual Styling
        </Text>
        <Text block style={{ marginTop: '8px' }}>
          <code>createStyleSet()</code> offers granular control over every aspect of the chat interface.
          It allows you to override individual component styles that aren't accessible through <code>styleOptions</code>,
          like timestamps, typing indicators, and suggestion alignment.
        </Text>
      </div>

      {/* Features Grid */}
      <div className={styles.sectionHeader}>
        <Text weight="semibold" size={400}>What styleSet Enables:</Text>
      </div>
      
      <div className={styles.featureList}>
        {styleSetFeatures.map((feature, idx) => (
          <Card key={idx} className={styles.featureCard} size="small">
            <div className={styles.featureItem}>
              <Checkmark24Regular className={styles.featureIcon} />
              <Text>{feature}</Text>
            </div>
          </Card>
        ))}
      </div>

      {/* Pros/Cons */}
      <div className={styles.prosConsList}>
        <div className={`${styles.prosCons} ${styles.pros}`}>
          <Text weight="semibold">✓ Advantages</Text>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Full control over every component</li>
            <li>Can style anything visible</li>
            <li>CSS-in-JS approach</li>
            <li>Composable with styleOptions base</li>
          </ul>
        </div>
        <div className={`${styles.prosCons} ${styles.cons}`}>
          <Text weight="semibold">✗ Considerations</Text>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>More verbose code</li>
            <li>May break with Web Chat updates</li>
            <li>Requires understanding internal structure</li>
          </ul>
        </div>
      </div>

      <div className={styles.warningBox}>
        <Text weight="semibold">⚠️ Important Note:</Text>
        <Text block style={{ marginTop: '4px' }}>
          <code>styleSet</code> provides deeper customization but may require updates when upgrading to new 
          Web Chat versions. Always test thoroughly after upgrades.
        </Text>
      </div>

      <Divider style={{ margin: `${tokens.spacingVerticalL} 0` }} />

      <Text weight="semibold" size={400}>Code Example:</Text>
      <CodeBlockWithModal code={codeExample} title="StyleSet Configuration" language="tsx">
        <div className={styles.codeBlock}>{codeExample}</div>
      </CodeBlockWithModal>

      <Text weight="semibold" size={400}>Live Demo:</Text>
      <Text size={200} style={{ color: '#666' }}>
        Switch between themes to see different styleSet configurations applied in real-time.
      </Text>
      
      {/* Theme Selector */}
      <div className={styles.themeSelector}>
        <ToggleButton
          checked={selectedTheme === 'corporate'}
          onClick={() => setSelectedTheme('corporate')}
          appearance={selectedTheme === 'corporate' ? 'primary' : 'outline'}
        >
          Corporate Theme
        </ToggleButton>
        <ToggleButton
          checked={selectedTheme === 'premiumDark'}
          onClick={() => setSelectedTheme('premiumDark')}
          appearance={selectedTheme === 'premiumDark' ? 'primary' : 'outline'}
        >
          Premium Dark Theme
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
          <Badge appearance="outline" style={{ marginTop: 4 }}>Using createStyleSet()</Badge>
        </div>
      </div>

      <div className={styles.chatContainer}>
        <ThemedStyleSetWebChat 
          connection={connection} 
          selectedTheme={selectedTheme}
        />
      </div>
    </div>
  );
}
