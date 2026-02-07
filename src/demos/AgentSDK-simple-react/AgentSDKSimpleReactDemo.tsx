/**
 * Demo 2: Simple ReactWebChat
 * 
 * The simplest React integration. Single component, pass directLine connection
 * and styleOptions. Quick setup for basic React apps.
 */
import { useRef, useEffect, useState } from 'react';
import ReactWebChat from 'botframework-webchat';
import type { CopilotStudioWebChatConnection } from '@microsoft/agents-copilotstudio-client';
import {
  makeStyles,
  tokens,
  Text,
} from '@fluentui/react-components';
import { CodeBlockWithModal } from '../../components/common/CodeModal';

// Wrapper that only renders WebChat once to prevent Strict Mode double-mount
function SingleMountWebChat({ connection }: { connection: CopilotStudioWebChatConnection }) {
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
    <ReactWebChat
      directLine={connection}
      styleOptions={{
        bubbleFromUserBackground: '#0078D4',
        bubbleFromUserTextColor: 'white',
        botAvatarInitials: 'CA',
        userAvatarInitials: 'You',
        hideUploadButton: true,
      }}
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
    maxHeight: '300px',
    overflowY: 'auto',
  },
  chatContainer: {
    height: '450px',
    border: '1px solid #ccc',
    borderRadius: tokens.borderRadiusMedium,
    overflow: 'hidden',
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
});

interface AgentSDKSimpleReactDemoProps {
  connection: CopilotStudioWebChatConnection;
}

const codeExample = `// Simple ReactWebChat with M365 Agents SDK
import ReactWebChat from 'botframework-webchat';
import { CopilotStudioClient, CopilotStudioWebChat } from '@microsoft/agents-copilotstudio-client';

function ChatBot() {
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    // Create client with authenticated token
    const client = new CopilotStudioClient({
      directConnectUrl: 'YOUR_DIRECT_CONNECT_URL'
    }, accessToken);
    
    // Create WebChat-compatible connection
    const conn = CopilotStudioWebChat.createConnection(client, {
      showTyping: true
    });
    
    setConnection(conn);
  }, []);

  return connection ? (
    <ReactWebChat
      directLine={connection}
      styleOptions={{
        bubbleFromUserBackground: '#0078D4',
        bubbleFromUserTextColor: 'white',
        botAvatarInitials: 'CA',
        userAvatarInitials: 'You'
      }}
    />
  ) : <p>Loading...</p>;
}`;

export default function AgentSDKSimpleReactDemo({ connection }: AgentSDKSimpleReactDemoProps) {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <div className={styles.description}>
        <Text weight="semibold" size={400}>
          Simple ReactWebChat
        </Text>
        <Text block style={{ marginTop: '8px' }}>
          Simplest React integration. Single component, pass directLine connection and styleOptions.
          Quick setup for basic React apps.
        </Text>
      </div>

      <div className={styles.prosConsList}>
        <div className={`${styles.prosCons} ${styles.pros}`}>
          <Text weight="semibold">✓ Pros</Text>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Simplest React option</li>
            <li>Single import</li>
            <li>All props in one place</li>
            <li>TypeScript support</li>
          </ul>
        </div>
        <div className={`${styles.prosCons} ${styles.cons}`}>
          <Text weight="semibold">✗ Cons</Text>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Can't insert components between Composer and UI</li>
            <li>Can't use FluentThemeProvider</li>
            <li>Less flexible</li>
          </ul>
        </div>
      </div>

      <Text weight="semibold">Code Example:</Text>
      <CodeBlockWithModal code={codeExample} title="Simple ReactWebChat" language="tsx">
        <div className={styles.codeBlock}>{codeExample}</div>
      </CodeBlockWithModal>

      <Text weight="semibold">Live Demo:</Text>
      <div className={styles.chatContainer}>
        <SingleMountWebChat connection={connection} />
      </div>
    </div>
  );
}
