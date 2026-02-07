/**
 * Demo 5: Minimizable Web Chat Widget
 * 
 * A floating chat widget pattern where WebChat is not the main app but an accessory.
 * Users can minimize/maximize the chat via a button (typically bottom-right corner).
 * 
 * Key Features:
 * - State preservation: Conversation persists when minimized
 * - Toggle visibility: Show/hide without destroying the component
 * - Side switching: Can move between left/right of screen
 * - Customizable appearance: Full control over widget styling
 */
import { useState, useRef, useEffect } from 'react';
import ReactWebChat, { createStore } from 'botframework-webchat';
import type { CopilotStudioWebChatConnection } from '@microsoft/agents-copilotstudio-client';
import {
  makeStyles,
  shorthands,
  tokens,
  Text,
  Button,
  Badge,
  ToggleButton,
} from '@fluentui/react-components';
import {
  Chat24Filled,
  Dismiss24Regular,
  SubtractCircle24Regular,
  ChevronLeft24Regular,
  ChevronRight24Regular,
  Code24Regular,
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
    fontSize: '11px',
    overflowX: 'auto',
    whiteSpace: 'pre',
    maxHeight: '250px',
    overflowY: 'auto',
  },
  codeTitle: {
    marginBottom: tokens.spacingVerticalS,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  demoArea: {
    position: 'relative',
    height: '500px',
    backgroundColor: '#f0f4f8',
    borderRadius: tokens.borderRadiusMedium,
    ...shorthands.border('2px', 'dashed', '#ccc'),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoAreaContent: {
    textAlign: 'center',
    color: '#666',
  },
  controls: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    alignItems: 'center',
    marginBottom: tokens.spacingVerticalM,
  },
  // Floating chat button
  chatButton: {
    position: 'absolute',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#0078d4',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 120, 212, 0.4)',
    transitionProperty: 'transform, box-shadow',
    transitionDuration: '0.2s',
    ':hover': {
      transform: 'scale(1.1)',
      boxShadow: '0 6px 20px rgba(0, 120, 212, 0.5)',
    },
  },
  chatButtonLeft: {
    bottom: '20px',
    left: '20px',
  },
  chatButtonRight: {
    bottom: '20px',
    right: '20px',
  },
  // Chat widget container
  chatWidget: {
    position: 'absolute',
    width: '380px',
    height: '500px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.overflow('hidden'),
    animationDuration: '0.3s',
    animationTimingFunction: 'ease-out',
    transitionProperty: 'opacity, transform',
    transitionDuration: '0.2s',
  },
  chatWidgetHidden: {
    opacity: 0,
    pointerEvents: 'none',
    transform: 'scale(0.95) translateY(10px)',
  },
  chatWidgetVisible: {
    opacity: 1,
    pointerEvents: 'auto',
    transform: 'scale(1) translateY(0)',
  },
  chatWidgetLeft: {
    bottom: '90px',
    left: '20px',
  },
  chatWidgetRight: {
    bottom: '90px',
    right: '20px',
  },
  // Chat header
  chatHeader: {
    background: 'linear-gradient(135deg, #0078d4 0%, #106ebe 100%)',
    color: 'white',
    ...shorthands.padding('16px', '20px'),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  chatHeaderAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatHeaderInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  chatHeaderTitle: {
    fontWeight: '600',
    fontSize: '16px',
  },
  chatHeaderStatus: {
    fontSize: '12px',
    opacity: 0.9,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#4caf50',
  },
  chatHeaderActions: {
    display: 'flex',
    gap: '4px',
  },
  headerButton: {
    color: 'white',
    minWidth: 'auto',
    ...shorthands.padding('4px'),
  },
  // Chat body
  chatBody: {
    flex: 1,
    ...shorthands.overflow('hidden'),
  },
  // Unread badge
  unreadBadge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
  },
  featureList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalM,
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#e8f4fd',
    ...shorthands.padding('8px', '12px'),
    borderRadius: tokens.borderRadiusMedium,
    fontSize: '13px',
  },
});

interface AgentSDKMinimizableDemoProps {
  connection: CopilotStudioWebChatConnection;
}

const containerCode = `// MinimizableWebChat.tsx - Main Container
import ReactWebChat, { createStore } from 'botframework-webchat';
import { CopilotStudioClient, CopilotStudioWebChat } from '@microsoft/agents-copilotstudio-client';

const MinimizableWebChat = ({ store, styleOptions }) => {
  const [connection, setConnection] = useState(null);
  const [minimized, setMinimized] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await acquireToken(settings);
      const client = new CopilotStudioClient(settings, token);
      setConnection(CopilotStudioWebChat.createConnection(client));
    })();
  }, []);

  return minimized ? (
    <ChatButton onClick={() => setMinimized(false)} />
  ) : (
    <ChatWidget onMinimize={() => setMinimized(true)}>
      <ReactWebChat 
        directLine={connection} 
        store={store}
        styleOptions={styleOptions}
      />
    </ChatWidget>
  );
};`;

const widgetCode = `// ChatWidget.tsx - Expandable Widget Component
const ChatWidget = ({ children, onMinimize, onClose }) => {
  return (
    <div className="chat-widget">
      <header className="chat-header">
        <div className="header-info">
          <Avatar initials="CA" />
          <div>
            <span className="title">Citizen Advice</span>
            <span className="status">● Online</span>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={onMinimize}>
            <MinimizeIcon />
          </button>
          <button onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
      </header>
      <div className="chat-body">
        {children}
      </div>
    </div>
  );
};

// Key: Don't unmount WebChat when minimized!
// Just hide with CSS to preserve conversation state
.chat-widget.minimized {
  display: none; /* or transform: scale(0) */
}`;

export default function AgentSDKMinimizableDemo({ connection }: AgentSDKMinimizableDemoProps) {
  const styles = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<'left' | 'right'>('right');
  const [mounted, setMounted] = useState(false);
  const mountedRef = useRef(false);

  // Create store once to preserve conversation state
  const store = useRef(createStore()).current;

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      setMounted(true);
    }
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const togglePosition = () => {
    setPosition(position === 'left' ? 'right' : 'left');
  };

  return (
    <div className={styles.container}>
      <div className={styles.description}>
        <Text weight="semibold" size={400}>
          Minimizable Web Chat Widget
        </Text>
        <Text block style={{ marginTop: '8px' }}>
          A floating chat widget pattern where WebChat is an accessory, not the main app.
          Perfect for customer support on any website. Conversation state is preserved when minimized.
        </Text>
      </div>

      {/* Feature highlights */}
      <div className={styles.featureList}>
        <div className={styles.featureItem}>
          ✅ State preservation when minimized
        </div>
        <div className={styles.featureItem}>
          ✅ Toggle visibility without unmount
        </div>
        <div className={styles.featureItem}>
          ✅ Customizable position (left/right)
        </div>
        <div className={styles.featureItem}>
          ✅ Full styling control
        </div>
      </div>

      {/* Code Examples */}
      <div className={styles.codeSection}>
        <div>
          <div className={styles.codeTitle}>
            <Code24Regular style={{ color: '#0078d4' }} />
            <Text weight="semibold">Container Component</Text>
          </div>
          <CodeBlockWithModal code={containerCode} title="Container Component" language="tsx">
            <div className={styles.codeBlock}>{containerCode}</div>
          </CodeBlockWithModal>
        </div>
        <div>
          <div className={styles.codeTitle}>
            <Code24Regular style={{ color: '#0078d4' }} />
            <Text weight="semibold">Widget Component</Text>
          </div>
          <CodeBlockWithModal code={widgetCode} title="Widget Component" language="tsx">
            <div className={styles.codeBlock}>{widgetCode}</div>
          </CodeBlockWithModal>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <Text weight="semibold">Live Demo:</Text>
        <ToggleButton
          checked={position === 'left'}
          onClick={togglePosition}
          icon={position === 'left' ? <ChevronRight24Regular /> : <ChevronLeft24Regular />}
        >
          Position: {position === 'left' ? 'Left' : 'Right'}
        </ToggleButton>
        <Badge appearance="filled" color="informative">
          {isOpen ? 'Widget Open' : 'Widget Minimized'}
        </Badge>
      </div>

      {/* Demo Area - simulates a webpage */}
      <div className={styles.demoArea}>
        <div className={styles.demoAreaContent}>
          <Text size={500} weight="semibold" block>
            Your Website Content
          </Text>
          <Text size={300} style={{ marginTop: '8px' }}>
            The chat widget floats over your page content.
            <br />
            Click the chat button to open/close.
          </Text>
        </div>

        {/* Floating Chat Button - only show when widget is closed */}
        {!isOpen && (
          <div 
            className={`${styles.chatButton} ${position === 'left' ? styles.chatButtonLeft : styles.chatButtonRight}`}
            onClick={toggleChat}
          >
            <Chat24Filled style={{ fontSize: 28 }} />
          </div>
        )}

        {/* Chat Widget - always mounted to preserve state, hidden with CSS */}
        {mounted && (
          <div className={`${styles.chatWidget} ${position === 'left' ? styles.chatWidgetLeft : styles.chatWidgetRight} ${isOpen ? styles.chatWidgetVisible : styles.chatWidgetHidden}`}>
            {/* Header */}
            <div className={styles.chatHeader}>
              <div className={styles.chatHeaderLeft}>
                <div className={styles.chatHeaderAvatar}>
                  <Chat24Filled />
                </div>
                <div className={styles.chatHeaderInfo}>
                  <span className={styles.chatHeaderTitle}>Citizen Advice</span>
                  <span className={styles.chatHeaderStatus}>
                    <span className={styles.statusDot} />
                    Online
                  </span>
                </div>
              </div>
              <div className={styles.chatHeaderActions}>
                <Button 
                  appearance="subtle" 
                  className={styles.headerButton}
                  icon={<SubtractCircle24Regular />}
                  onClick={toggleChat}
                  title="Minimize"
                />
                <Button 
                  appearance="subtle" 
                  className={styles.headerButton}
                  icon={<Dismiss24Regular />}
                  onClick={toggleChat}
                  title="Close"
                />
              </div>
            </div>

            {/* Chat Body */}
            <div className={styles.chatBody}>
              <ReactWebChat
                directLine={connection}
                store={store}
                styleOptions={{
                  bubbleFromUserBackground: '#0078D4',
                  bubbleFromUserTextColor: 'white',
                  botAvatarInitials: 'CA',
                  userAvatarInitials: 'You',
                  hideUploadButton: true,
                  rootHeight: '100%',
                  rootWidth: '100%',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
