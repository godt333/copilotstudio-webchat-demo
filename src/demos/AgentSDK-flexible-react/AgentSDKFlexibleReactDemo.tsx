/**
 * Demo 3: Flexible React (Composer + BasicWebChat)
 * 
 * Production-ready with Microsoft styling. Separates context provider (Composer)
 * from UI (BasicWebChat), enabling FluentThemeProvider for Teams/M365 look.
 */
import { useRef, useEffect, useState } from 'react';
import ReactWebChat from 'botframework-webchat';
import { FluentThemeProvider } from 'botframework-webchat-fluent-theme';
import type { CopilotStudioWebChatConnection } from '@microsoft/agents-copilotstudio-client';
import {
  makeStyles,
  tokens,
  Text,
} from '@fluentui/react-components';
import { CodeBlockWithModal } from '../../components/common/CodeModal';

// Wrapper that only renders WebChat once to prevent Strict Mode double-mount
function SingleMountFluentWebChat({ connection }: { connection: CopilotStudioWebChatConnection }) {
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
    <FluentThemeProvider>
      <ReactWebChat
        directLine={connection}
        styleOptions={{
          hideUploadButton: true,
        }}
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

interface AgentSDKFlexibleReactDemoProps {
  connection: CopilotStudioWebChatConnection;
}

const codeExample = `// Flexible React with FluentThemeProvider
import { Composer, BasicWebChat } from 'botframework-webchat';
import { FluentThemeProvider } from 'botframework-webchat-fluent-theme';
import { CopilotStudioClient, CopilotStudioWebChat } from '@microsoft/agents-copilotstudio-client';

function ChatBot() {
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    const client = new CopilotStudioClient({
      directConnectUrl: 'YOUR_DIRECT_CONNECT_URL'
    }, accessToken);
    
    setConnection(CopilotStudioWebChat.createConnection(client));
  }, []);

  return connection ? (
    <Composer directLine={connection}>
      <FluentThemeProvider>
        <BasicWebChat />
      </FluentThemeProvider>
    </Composer>
  ) : <p>Loading...</p>;
}

// Or simplified with ReactWebChat + FluentThemeProvider:
<FluentThemeProvider>
  <ReactWebChat directLine={connection} />
</FluentThemeProvider>`;

export default function AgentSDKFlexibleReactDemo({ connection }: AgentSDKFlexibleReactDemoProps) {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <div className={styles.description}>
        <Text weight="semibold" size={400}>
          Flexible React (Composer + BasicWebChat)
        </Text>
        <Text block style={{ marginTop: '8px' }}>
          Production-ready with Microsoft styling. Separates context provider (Composer) from UI
          (BasicWebChat), enabling FluentThemeProvider for Teams/M365 look.
        </Text>
      </div>

      <div className={styles.prosConsList}>
        <div className={`${styles.prosCons} ${styles.pros}`}>
          <Text weight="semibold">✓ Pros</Text>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Full flexibility</li>
            <li>Supports FluentThemeProvider</li>
            <li>Can add custom components</li>
            <li>Access to hooks outside BasicWebChat</li>
          </ul>
        </div>
        <div className={`${styles.prosCons} ${styles.cons}`}>
          <Text weight="semibold">✗ Cons</Text>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>More verbose</li>
            <li>Requires understanding component structure</li>
          </ul>
        </div>
      </div>

      <Text weight="semibold">Code Example:</Text>
      <CodeBlockWithModal code={codeExample} title="Flexible React with FluentThemeProvider" language="tsx">
        <div className={styles.codeBlock}>{codeExample}</div>
      </CodeBlockWithModal>

      <Text weight="semibold">Live Demo (with FluentThemeProvider):</Text>
      <div className={styles.chatContainer}>
        <SingleMountFluentWebChat connection={connection} />
      </div>
    </div>
  );
}
