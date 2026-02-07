/**
 * Demo 4: ReactWebChat with Middleware
 * 
 * Intercept and modify messages using activity middleware.
 * Renders bot responses as premium cards with feedback buttons.
 */
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import ReactWebChat, { createStore } from 'botframework-webchat';
import type { CopilotStudioWebChatConnection } from '@microsoft/agents-copilotstudio-client';
import {
  makeStyles,
  shorthands,
  tokens,
  Text,
  Badge,
  Button,
} from '@fluentui/react-components';
import {
  Sparkle24Filled,
  LightbulbFilament24Regular,
  Checkmark24Regular,
  Star24Filled,
  CheckmarkCircle24Filled,
  Copy24Regular,
  ThumbLike24Regular,
  ThumbDislike24Regular,
  Code24Regular,
  DataUsage24Regular,
} from '@fluentui/react-icons';
import { CodeBlockWithModal } from '../../components/common/CodeModal';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  description: {
    backgroundColor: '#f5f5f5',
    ...shorthands.padding(tokens.spacingHorizontalL),
    borderRadius: tokens.borderRadiusMedium,
    borderLeft: '4px solid #0078d4',
  },
  codeSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: tokens.spacingHorizontalL,
  },
  codeBlock: {
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    ...shorthands.padding(tokens.spacingHorizontalL),
    borderRadius: tokens.borderRadiusMedium,
    fontFamily: 'Consolas, Monaco, monospace',
    fontSize: '12px',
    overflowX: 'auto',
    whiteSpace: 'pre',
    maxHeight: '280px',
    overflowY: 'auto',
  },
  codeTitle: {
    marginBottom: tokens.spacingVerticalS,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  chatContainer: {
    height: '450px',
    ...shorthands.border('1px', 'solid', '#e0e0e0'),
    borderRadius: tokens.borderRadiusLarge,
    ...shorthands.overflow('hidden'),
    boxShadow: tokens.shadow8,
  },
  logPanel: {
    backgroundColor: '#1a1a2e',
    color: '#4ec9b0',
    ...shorthands.padding(tokens.spacingHorizontalM),
    borderRadius: tokens.borderRadiusMedium,
    fontFamily: 'Consolas, Monaco, monospace',
    fontSize: '11px',
    maxHeight: '120px',
    overflowY: 'auto',
  },
  logEntry: {
    marginBottom: '4px',
    display: 'flex',
    gap: '8px',
  },
  instructionBox: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    ...shorthands.padding('16px', '20px'),
    borderRadius: tokens.borderRadiusMedium,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  // Premium Card Styles
  premiumCard: {
    background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
    ...shorthands.border('1px', 'solid', '#e8ecf4'),
    borderRadius: '16px',
    ...shorthands.padding('0'),
    ...shorthands.margin('8px', '0'),
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    maxWidth: '380px',
    ...shorthands.overflow('hidden'),
  },
  cardHeader: {
    background: 'linear-gradient(135deg, #0078d4 0%, #106ebe 100%)',
    color: 'white',
    ...shorthands.padding('16px', '20px'),
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  cardHeaderIcon: {
    width: '40px',
    height: '40px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderText: {
    flex: 1,
  },
  cardHeaderTitle: {
    fontWeight: '600',
    fontSize: '16px',
    marginBottom: '2px',
  },
  cardHeaderSubtitle: {
    fontSize: '12px',
    opacity: 0.9,
  },
  cardBody: {
    ...shorthands.padding('20px'),
  },
  cardSection: {
    marginBottom: '16px',
  },
  cardSectionTitle: {
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#666',
    marginBottom: '8px',
  },
  cardText: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#333',
  },
  bulletList: {
    ...shorthands.margin('0'),
    ...shorthands.padding('0'),
    listStyle: 'none',
  },
  bulletItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    marginBottom: '10px',
    fontSize: '13px',
    color: '#444',
  },
  bulletIcon: {
    color: '#0078d4',
    flexShrink: 0,
    marginTop: '2px',
  },
  cardFooter: {
    ...shorthands.padding('16px', '20px'),
    backgroundColor: '#f8f9fa',
    borderTop: '1px solid #e8ecf4',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedbackButtons: {
    display: 'flex',
    gap: '8px',
  },
  tipBox: {
    background: 'linear-gradient(135deg, #fff8e1 0%, #fff3cd 100%)',
    ...shorthands.border('1px', 'solid', '#ffc107'),
    borderRadius: '12px',
    ...shorthands.padding('14px', '16px'),
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginTop: '12px',
  },
  tipIcon: {
    color: '#ff9800',
    flexShrink: 0,
  },
  successBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    ...shorthands.padding('4px', '10px'),
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
  },
  // Middleware Visual Diagram Styles
  middlewareVisual: {
    backgroundColor: '#fafafa',
    ...shorthands.border('1px', 'solid', '#e8e8e8'),
    borderRadius: tokens.borderRadiusXLarge,
    ...shorthands.padding('32px'),
    marginBottom: tokens.spacingVerticalL,
  },
  middlewareStack: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '700px',
    marginLeft: 'auto',
    marginRight: 'auto',
    gap: '0',
  },
  middlewareLayer: {
    ...shorthands.padding('20px', '24px'),
    textAlign: 'center',
    '&:first-child': {
      borderTopLeftRadius: '12px',
      borderTopRightRadius: '12px',
    },
    '&:last-child': {
      borderBottomLeftRadius: '12px',
      borderBottomRightRadius: '12px',
    },
  },
  activityLayer: {
    backgroundColor: '#dbeafe',
    borderBottom: '1px solid #bfdbfe',
  },
  attachmentLayer: {
    backgroundColor: '#dcfce7',
    borderBottom: '1px solid #bbf7d0',
  },
  sendBoxLayer: {
    backgroundColor: '#fef3c7',
    borderBottom: '1px solid #fde68a',
  },
  avatarLayer: {
    backgroundColor: '#f3e8ff',
  },
  layerTitle: {
    fontWeight: '600',
    fontSize: '16px',
    color: '#1f2937',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  layerDescription: {
    color: '#6b7280',
    fontSize: '14px',
    marginTop: '4px',
  },
});

interface AgentSDKMiddlewareDemoProps {
  connection: CopilotStudioWebChatConnection;
}

interface LogEntry {
  time: string;
  type: string;
  direction: 'in' | 'out';
}

// Code samples for display
const storeMiddlewareCode = `// Store Middleware - Intercept Redux actions
const store = createStore({}, ({ dispatch }) => 
  next => action => {
    // Log incoming bot messages
    if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
      const activity = action.payload.activity;
      if (activity.type === 'message') {
        console.log('Bot:', activity.text);
        logToPanel(activity);
      }
    }
    
    // Log outgoing user messages
    if (action.type === 'DIRECT_LINE/POST_ACTIVITY') {
      console.log('User:', action.payload.activity.text);
    }
    
    return next(action);
  }
);

<ReactWebChat directLine={connection} store={store} />`;

const activityMiddlewareCode = `// Activity Middleware - Custom UI rendering
const activityMiddleware = () => next => args => {
  const { activity } = args;
  
  // Intercept bot messages for custom rendering
  if (activity.from?.role === 'bot' && 
      activity.type === 'message' && 
      activity.text?.length > 100) {
    
    // Return custom premium card component
    return (
      <PremiumResponseCard 
        content={activity.text}
        onCopy={() => navigator.clipboard.writeText(activity.text)}
        onLike={() => trackFeedback('positive')}
        onDislike={() => trackFeedback('negative')}
      />
    );
  }
  
  // Default rendering for other messages
  return next(args);
};

<ReactWebChat 
  directLine={connection} 
  activityMiddleware={activityMiddleware} 
/>`;

// Premium Card Component for Bot Responses
function PremiumResponseCard({ 
  content, 
  onCopy,
  onLike,
  onDislike 
}: { 
  content: string;
  onCopy?: () => void;
  onLike?: () => void;
  onDislike?: () => void;
}) {
  const styles = useStyles();
  
  // Parse content to extract key points (simple heuristic)
  const extractPoints = (text: string): string[] => {
    // Look for bullet points
    const bulletMatches = text.match(/[•\-\*]\s*([^\n•\-\*]+)/g);
    if (bulletMatches && bulletMatches.length > 0) {
      return bulletMatches.map(m => m.replace(/^[•\-\*]\s*/, '').trim()).slice(0, 4);
    }
    // Otherwise split by sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 3).map(s => s.trim());
  };

  const points = extractPoints(content);
  const showAsCard = content.length > 100;

  if (!showAsCard) {
    // Short responses get a simpler card
    return (
      <div className={styles.premiumCard}>
        <div className={styles.cardBody}>
          <div className={styles.cardText}>{content}</div>
          <div className={styles.cardFooter} style={{ backgroundColor: 'transparent', padding: '12px 0 0 0', border: 'none' }}>
            <div className={styles.successBadge}>
              <CheckmarkCircle24Filled style={{ width: 16, height: 16 }} />
              AI Response
            </div>
            <div className={styles.feedbackButtons}>
              <Button size="small" appearance="subtle" icon={<Copy24Regular />} onClick={onCopy} />
              <Button size="small" appearance="subtle" icon={<ThumbLike24Regular />} onClick={onLike} />
              <Button size="small" appearance="subtle" icon={<ThumbDislike24Regular />} onClick={onDislike} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.premiumCard}>
      {/* Card Header */}
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderIcon}>
          <Sparkle24Filled style={{ color: 'white' }} />
        </div>
        <div className={styles.cardHeaderText}>
          <div className={styles.cardHeaderTitle}>Citizen Advice</div>
          <div className={styles.cardHeaderSubtitle}>AI-Powered Response</div>
        </div>
        <Star24Filled style={{ color: '#ffd700' }} />
      </div>

      {/* Card Body */}
      <div className={styles.cardBody}>
        {/* Key Points */}
        {points.length > 0 && (
          <div className={styles.cardSection}>
            <div className={styles.cardSectionTitle}>Key Information</div>
            <ul className={styles.bulletList}>
              {points.map((point, idx) => (
                <li key={idx} className={styles.bulletItem}>
                  <Checkmark24Regular className={styles.bulletIcon} style={{ width: 18, height: 18 }} />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Full Response (collapsed) */}
        <div className={styles.cardSection}>
          <div className={styles.cardSectionTitle}>Full Response</div>
          <div className={styles.cardText} style={{ 
            maxHeight: '80px', 
            overflow: 'hidden',
            position: 'relative',
          }}>
            {content}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '30px',
              background: 'linear-gradient(transparent, #f8f9ff)',
            }} />
          </div>
        </div>

        {/* Tip Box */}
        <div className={styles.tipBox}>
          <LightbulbFilament24Regular className={styles.tipIcon} />
          <div>
            <Text weight="semibold" size={200}>Pro Tip</Text>
            <Text size={200} block>Ask follow-up questions for more specific guidance.</Text>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className={styles.cardFooter}>
        <div className={styles.successBadge}>
          <CheckmarkCircle24Filled style={{ width: 16, height: 16 }} />
          Verified Info
        </div>
        <div className={styles.feedbackButtons}>
          <Button size="small" appearance="subtle" icon={<Copy24Regular />} title="Copy" onClick={onCopy} />
          <Button size="small" appearance="subtle" icon={<ThumbLike24Regular />} title="Helpful" onClick={onLike} />
          <Button size="small" appearance="subtle" icon={<ThumbDislike24Regular />} title="Not helpful" onClick={onDislike} />
        </div>
      </div>
    </div>
  );
}

export default function AgentSDKMiddlewareDemo({ connection }: AgentSDKMiddlewareDemoProps) {
  const styles = useStyles();
  const [activityLog, setActivityLog] = useState<LogEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      setMounted(true);
    }
  }, []);

  // Create store with logging middleware
  const store = useMemo(
    () =>
      createStore({}, () => (next: (action: { type: string; payload?: { activity?: { type?: string; text?: string } } }) => unknown) => (action: { type: string; payload?: { activity?: { type?: string; text?: string } } }) => {
        const now = new Date().toLocaleTimeString();

        if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
          const activity = action.payload?.activity;
          if (activity?.type === 'message') {
            setActivityLog(prev => [...prev.slice(-9), {
              time: now,
              type: `Bot: ${activity.text?.substring(0, 50) || '[card]'}...`,
              direction: 'in'
            }]);
          }
        }

        if (action.type === 'DIRECT_LINE/POST_ACTIVITY') {
          const activity = action.payload?.activity;
          if (activity?.type === 'message') {
            setActivityLog(prev => [...prev.slice(-9), {
              time: now,
              type: `You: ${activity.text?.substring(0, 50) || ''}`,
              direction: 'out'
            }]);
          }
        }

        return next(action);
      }),
    []
  );

  // Activity Middleware - Intercept bot messages and render as premium cards
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activityMiddleware = useCallback(() => (next: any) => (args: any) => {
    const { activity } = args;
    
    // Only intercept bot text messages (not user messages)
    if (activity.from?.role === 'bot' && activity.type === 'message' && activity.text) {
      // Skip welcome message to keep it simple
      if (activity.text.toLowerCase().includes('hello') && activity.text.length < 100) {
        return next(args);
      }
      
      return (
        <PremiumResponseCard 
          content={activity.text}
          onCopy={() => {
            navigator.clipboard.writeText(activity.text || '');
          }}
          onLike={() => console.log('User liked response')}
          onDislike={() => console.log('User disliked response')}
        />
      );
    }

    return next(args);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.description}>
        <Text weight="semibold" size={400}>
          ReactWebChat with Activity Middleware
        </Text>
        <Text block style={{ marginTop: '8px' }}>
          This demo intercepts bot responses and renders them as premium cards with 
          key points extraction, copy functionality, and feedback buttons.
        </Text>
      </div>

      {/* Middleware Architecture Visual */}
      <div className={styles.middlewareVisual}>
        <div className={styles.middlewareStack}>
          <div className={`${styles.middlewareLayer} ${styles.activityLayer}`}>
            <div className={styles.layerTitle}>
              🖥️ Activity Middleware
            </div>
            <div className={styles.layerDescription}>
              Custom rendering for specific activity types (cards, attachments, messages)
            </div>
          </div>
          <div className={`${styles.middlewareLayer} ${styles.attachmentLayer}`}>
            <div className={styles.layerTitle}>
              📎 Attachment Middleware
            </div>
            <div className={styles.layerDescription}>
              Custom attachment renderers for Adaptive Cards, Hero Cards, images
            </div>
          </div>
          <div className={`${styles.middlewareLayer} ${styles.sendBoxLayer}`}>
            <div className={styles.layerTitle}>
              📝 Send Box Middleware
            </div>
            <div className={styles.layerDescription}>
              Custom input components, suggestions, attachments picker
            </div>
          </div>
          <div className={`${styles.middlewareLayer} ${styles.avatarLayer}`}>
            <div className={styles.layerTitle}>
              👤 Avatar Middleware
            </div>
            <div className={styles.layerDescription}>
              Custom bot/user avatars, status indicators, presence
            </div>
          </div>
        </div>
      </div>

      {/* Code Samples Section */}
      <div className={styles.codeSection}>
        <div>
          <div className={styles.codeTitle}>
            <Code24Regular style={{ color: '#0078d4' }} />
            <Text weight="semibold">Store Middleware (Logging)</Text>
          </div>
          <CodeBlockWithModal code={storeMiddlewareCode} title="Store Middleware (Logging)" language="tsx">
            <div className={styles.codeBlock}>{storeMiddlewareCode}</div>
          </CodeBlockWithModal>
        </div>
        <div>
          <div className={styles.codeTitle}>
            <DataUsage24Regular style={{ color: '#0078d4' }} />
            <Text weight="semibold">Activity Middleware (Custom UI)</Text>
          </div>
          <CodeBlockWithModal code={activityMiddlewareCode} title="Activity Middleware (Custom UI)" language="tsx">
            <div className={styles.codeBlock}>{activityMiddlewareCode}</div>
          </CodeBlockWithModal>
        </div>
      </div>

      <div className={styles.instructionBox}>
        <Sparkle24Filled style={{ width: 32, height: 32 }} />
        <div>
          <Text weight="semibold" size={400} style={{ color: 'white' }}>Try It Out!</Text>
          <Text size={300} style={{ color: 'rgba(255,255,255,0.9)' }} block>
            Ask about benefits, housing rights, or employment to see responses transformed into beautiful cards.
          </Text>
        </div>
      </div>

      {/* Chat Container */}
      <div className={styles.chatContainer}>
        {mounted && (
          <ReactWebChat
            directLine={connection}
            store={store}
            activityMiddleware={activityMiddleware}
            styleOptions={{
              bubbleFromUserBackground: '#0078D4',
              bubbleFromUserTextColor: 'white',
              bubbleBorderRadius: 12,
              bubbleFromUserBorderRadius: 12,
              botAvatarInitials: 'CA',
              userAvatarInitials: 'You',
              hideUploadButton: true,
              rootHeight: '100%',
              rootWidth: '100%',
            }}
          />
        )}
      </div>

      {/* Activity Log - Now below the chat */}
      <div>
        <Text weight="semibold">
          Activity Log
          <Badge appearance="filled" color="success" style={{ marginLeft: '8px' }}>
            {activityLog.length} events
          </Badge>
        </Text>
        <div className={styles.logPanel}>
          {activityLog.length === 0 ? (
            <Text style={{ color: '#666' }}>Waiting for activity...</Text>
          ) : (
            activityLog.map((entry, i) => (
              <div key={i} className={styles.logEntry}>
                <span style={{ color: '#888' }}>[{entry.time}]</span>
                <span style={{ color: entry.direction === 'in' ? '#4ec9b0' : '#dcdcaa' }}>
                  {entry.type}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
