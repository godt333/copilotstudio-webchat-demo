/**
 * Demo 3: Middleware + Custom UI with Rich Cards
 * 
 * This demo showcases:
 * 1. Custom Activity Middleware - Render bot messages as styled cards
 * 2. Message Classification - Categorize and style messages by content
 * 3. Store Middleware - Intercept and log all activities
 * 
 * Best for: Apps needing custom message rendering, branding, rich UI
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import ReactWebChat, { createDirectLine, createStore } from 'botframework-webchat';
import {
  makeStyles,
  tokens,
  Text,
  Spinner,
  Card,
  Badge,
  Avatar,
  Button,
  Tooltip,
} from '@fluentui/react-components';
import { CodeBlockWithModal } from '../../components/common/CodeModal';
import {
  Bot24Regular,
  Lightbulb24Regular,
  Info24Regular,
  Warning24Regular,
  Checkmark24Regular,
  Copy24Regular,
  ThumbLike24Regular,
  ThumbDislike24Regular,
} from '@fluentui/react-icons';

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
    maxHeight: '250px',
    overflowY: 'auto',
  },
  chatContainer: {
    height: '500px',
    border: '1px solid #ccc',
    borderRadius: tokens.borderRadiusMedium,
    overflow: 'hidden',
  },
  centered: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
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
  logPanel: {
    backgroundColor: '#1e1e1e',
    color: '#4ec9b0',
    padding: tokens.spacingHorizontalM,
    borderRadius: tokens.borderRadiusMedium,
    fontFamily: 'Consolas, monospace',
    fontSize: '12px',
    maxHeight: '120px',
    overflowY: 'auto',
    marginTop: tokens.spacingVerticalS,
  },
  // Custom message card styles
  botMessageCard: {
    margin: '8px 16px 8px 8px',
    padding: tokens.spacingHorizontalM,
    borderRadius: tokens.borderRadiusMedium,
    boxShadow: tokens.shadow4,
    maxWidth: '85%',
  },
  cardInfo: {
    backgroundColor: '#e3f2fd',
    borderLeft: '4px solid #2196f3',
  },
  cardHelp: {
    backgroundColor: '#fff3e0',
    borderLeft: '4px solid #ff9800',
  },
  cardSuccess: {
    backgroundColor: '#e8f5e9',
    borderLeft: '4px solid #4caf50',
  },
  cardWarning: {
    backgroundColor: '#fff8e1',
    borderLeft: '4px solid #ffc107',
  },
  cardDefault: {
    backgroundColor: '#f5f5f5',
    borderLeft: '4px solid #9e9e9e',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalS,
  },
  cardContent: {
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#333',
  },
  cardActions: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalS,
    paddingTop: tokens.spacingVerticalS,
    borderTop: '1px solid #e0e0e0',
  },
  timestamp: {
    fontSize: '11px',
    color: '#666',
    marginLeft: 'auto',
  },
});

// Token endpoint for anonymous access
const TOKEN_ENDPOINT = import.meta.env.VITE_COPILOT_TOKEN_ENDPOINT || '';

const codeExample = `// Custom Activity Middleware - Render bot messages as cards
const activityMiddleware = () => next => ({ activity }) => {
  if (activity.from?.role === 'bot' && activity.text) {
    // Classify message and render custom card
    const category = classifyMessage(activity.text);
    return (
      <CustomBotCard 
        text={activity.text}
        category={category}
        onCopy={() => navigator.clipboard.writeText(activity.text)}
        onLike={() => sendFeedback('positive')}
        onDislike={() => sendFeedback('negative')}
      />
    );
  }
  return next({ activity }); // Default rendering
};

// Apply middleware to WebChat
<ReactWebChat
  directLine={directLine}
  store={store}
  activityMiddleware={activityMiddleware}
  styleOptions={styleOptions}
/>`;

// Message classification logic
type MessageCategory = 'info' | 'help' | 'success' | 'warning' | 'default';

const classifyMessage = (text: string): { category: MessageCategory; icon: typeof Info24Regular; badge: string } => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('help') || lowerText.includes('assist') || lowerText.includes('question')) {
    return { category: 'help', icon: Lightbulb24Regular, badge: 'Help' };
  }
  if (lowerText.includes('success') || lowerText.includes('done') || lowerText.includes('complete') || lowerText.includes('thank')) {
    return { category: 'success', icon: Checkmark24Regular, badge: 'Success' };
  }
  if (lowerText.includes('warning') || lowerText.includes('caution') || lowerText.includes('note')) {
    return { category: 'warning', icon: Warning24Regular, badge: 'Note' };
  }
  if (lowerText.includes('info') || lowerText.includes('about') || lowerText.includes('learn')) {
    return { category: 'info', icon: Info24Regular, badge: 'Info' };
  }
  return { category: 'default', icon: Bot24Regular, badge: 'Response' };
};

// Custom Bot Message Card Component
interface BotMessageCardProps {
  text: string;
  timestamp: Date;
  onCopy: () => void;
  onLike: () => void;
  onDislike: () => void;
}

const BotMessageCard = ({ text, timestamp, onCopy, onLike, onDislike }: BotMessageCardProps) => {
  const styles = useStyles();
  const { category, icon: Icon, badge } = classifyMessage(text);
  
  const cardStyle = {
    info: styles.cardInfo,
    help: styles.cardHelp,
    success: styles.cardSuccess,
    warning: styles.cardWarning,
    default: styles.cardDefault,
  }[category];

  const badgeColor = {
    info: 'informative' as const,
    help: 'warning' as const,
    success: 'success' as const,
    warning: 'warning' as const,
    default: 'subtle' as const,
  }[category];

  return (
    <div className={`${styles.botMessageCard} ${cardStyle}`}>
      <div className={styles.cardHeader}>
        <Avatar icon={<Icon />} color="brand" size={24} />
        <Text weight="semibold">Citizen Advice Bot</Text>
        <Badge appearance="filled" color={badgeColor} size="small">{badge}</Badge>
        <span className={styles.timestamp}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div className={styles.cardContent}>
        {text}
      </div>
      <div className={styles.cardActions}>
        <Tooltip content="Copy response" relationship="label">
          <Button icon={<Copy24Regular />} size="small" appearance="subtle" onClick={onCopy} />
        </Tooltip>
        <Tooltip content="Helpful" relationship="label">
          <Button icon={<ThumbLike24Regular />} size="small" appearance="subtle" onClick={onLike} />
        </Tooltip>
        <Tooltip content="Not helpful" relationship="label">
          <Button icon={<ThumbDislike24Regular />} size="small" appearance="subtle" onClick={onDislike} />
        </Tooltip>
      </div>
    </div>
  );
};

// Style options for user messages
const styleOptions = {
  bubbleFromUserBackground: '#0078D4',
  bubbleFromUserTextColor: '#FFFFFF',
  bubbleBorderRadius: 8,
  avatarSize: 32,
  botAvatarInitials: 'CA',
  userAvatarInitials: 'You',
  hideUploadButton: true,
};

export default function MiddlewareCustomUIDemo() {
  const styles = useStyles();
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  // Memoize directLine to prevent recreation on every render
  const directLine = useMemo(
    () => (token ? createDirectLine({ token }) : null),
    [token]
  );

  // Store middleware for logging
  const store = useMemo(
    () =>
      createStore({}, () => (next: (action: unknown) => unknown) => (action: { type: string; payload?: { activity?: { text?: string; from?: { role?: string } } } }) => {
        if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
          const activity = action.payload?.activity;
          if (activity?.text) {
            const { badge } = classifyMessage(activity.text);
            const role = activity.from?.role === 'bot' ? '🤖 Bot' : '👤 User';
            const logMessage = `[${new Date().toLocaleTimeString()}] ${role} [${badge}]: "${activity.text.substring(0, 40)}..."`;
            setLogs(prev => [...prev.slice(-9), logMessage]);
          }
        }
        if (action.type === 'DIRECT_LINE/POST_ACTIVITY') {
          setLogs(prev => [...prev.slice(-9), `[${new Date().toLocaleTimeString()}] 📤 User sending message...`]);
        }
        return next(action);
      }),
    []
  );

  // Activity Middleware for custom rendering
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activityMiddleware = useCallback((): any => (next: any) => 
    (options: { activity: { from?: { role?: string }; text?: string; timestamp?: string } }) => {
      const { activity } = options;
      // Only customize bot messages with text
      if (activity.from?.role === 'bot' && activity.text) {
        return (
          <BotMessageCard
            text={activity.text}
            timestamp={activity.timestamp ? new Date(activity.timestamp) : new Date()}
            onCopy={() => {
              navigator.clipboard.writeText(activity.text || '');
              setLogs(prev => [...prev.slice(-9), `[${new Date().toLocaleTimeString()}] 📋 Copied to clipboard`]);
            }}
            onLike={() => {
              setLogs(prev => [...prev.slice(-9), `[${new Date().toLocaleTimeString()}] 👍 Feedback: Helpful`]);
            }}
            onDislike={() => {
              setLogs(prev => [...prev.slice(-9), `[${new Date().toLocaleTimeString()}] 👎 Feedback: Not helpful`]);
            }}
          />
        );
      }
      // Use default rendering for user messages and other activities
      return next(options);
    }, []);

  useEffect(() => {
    const fetchToken = async () => {
      if (!TOKEN_ENDPOINT) {
        setError('Token endpoint not configured');
        setStatus('error');
        return;
      }

      try {
        const response = await fetch(TOKEN_ENDPOINT);
        if (!response.ok) throw new Error('Failed to fetch token');
        const data = await response.json();
        setToken(data.token);
        setStatus('ready');
      } catch (err) {
        console.error('Error fetching token:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch token');
        setStatus('error');
      }
    };

    fetchToken();
  }, []);

  return (
    <div className={styles.container}>
      <Card className={styles.description}>
        <Text weight="semibold" size={400}>
          🎨 Middleware + Custom UI with Rich Cards
        </Text>
        <Text block style={{ marginTop: '8px' }}>
          This demo showcases <strong>activityMiddleware</strong> to render bot responses as 
          beautiful Fluent UI cards with automatic message classification, icons, badges, 
          and interactive feedback buttons (👍👎📋).
        </Text>
        
        <div className={styles.prosConsList}>
          <div className={`${styles.prosCons} ${styles.pros}`}>
            <Text weight="semibold">✓ What This Demonstrates</Text>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>Custom card rendering for bot messages</li>
              <li>Message classification (Info/Help/Success/Warning)</li>
              <li>Interactive feedback buttons</li>
              <li>Activity logging with store middleware</li>
            </ul>
          </div>
          <div className={`${styles.prosCons} ${styles.cons}`}>
            <Text weight="semibold">📦 Technologies Used</Text>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li><code>activityMiddleware</code> for custom rendering</li>
              <li><code>createStore</code> for activity logging</li>
              <li>Fluent UI Cards, Badges, Avatars</li>
              <li>Fluent Icons for visual cues</li>
            </ul>
          </div>
        </div>
      </Card>

      <Text weight="semibold">Activity Middleware Pattern</Text>
      <CodeBlockWithModal code={codeExample} title="Activity Middleware Pattern" language="tsx">
        <div className={styles.codeBlock}>{codeExample}</div>
      </CodeBlockWithModal>

      <Text weight="semibold">Live Demo - Try phrases like "help", "thank you", "warning"</Text>
      <div className={styles.chatContainer}>
        {status === 'loading' && (
          <div className={styles.centered}>
            <Spinner size="large" label="Connecting to Citizen Advice Bot..." />
          </div>
        )}
        {status === 'error' && (
          <div className={styles.centered}>
            <Text style={{ color: '#d32f2f' }}>Error: {error}</Text>
          </div>
        )}
        {status === 'ready' && directLine && (
          <ReactWebChat
            directLine={directLine}
            store={store}
            activityMiddleware={activityMiddleware}
            styleOptions={styleOptions}
          />
        )}
      </div>

      {logs.length > 0 && (
        <>
          <Text weight="semibold">📊 Activity Log (Store Middleware)</Text>
          <div className={styles.logPanel}>
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
