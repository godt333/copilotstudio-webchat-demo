/**
 * Demo 4: Web Chat using renderWebChat Function & Direct Line API
 * 
 * This approach demonstrates advanced customization with styleOptions,
 * activity middleware, and custom rendering patterns.
 * 
 * Note: renderWebChat() uses ReactDOM.render which was removed in React 18+.
 * In React 18+ projects, use ReactWebChat component instead.
 * 
 * Best for: Complex apps needing full control, performance optimizations, 
 * custom event handling, advanced UI modifications
 */
import { useState, useEffect, useMemo } from 'react';
import ReactWebChat, { createDirectLine } from 'botframework-webchat';
import {
  makeStyles,
  tokens,
  Text,
  Spinner,
  Card,
} from '@fluentui/react-components';
import { CodeBlockWithModal } from '../../components/common/CodeModal';

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
  },
  chatOuterContainer: {
    height: '500px',
    width: '100%',
    border: '1px solid #e0e0e0',
    borderRadius: tokens.borderRadiusMedium,
    overflow: 'hidden',
  },
  chatInnerContainer: {
    height: '100%',
    width: '100%',
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
});

// Advanced style options with full customization
const styleOptions = {
  bubbleBackground: '#E0E0E0',
  bubbleTextColor: '#333333',
  bubbleFromUserBackground: '#0078D4',
  bubbleFromUserTextColor: '#FFFFFF',
  botAvatarImage: '/bot-avatar.png',
  userAvatarImage: '/user-avatar.png',
  bubbleBorderRadius: 10,
  fontFamily: '"Segoe UI", sans-serif',
  backgroundColor: 'transparent',
  sendBoxBackground: '#FFFFFF',
  sendBoxTextColor: '#000000',
  sendBoxBorderTop: 'solid 1px #CCCCCC',
};

// Token endpoint for anonymous access
const TOKEN_ENDPOINT = import.meta.env.VITE_COPILOT_TOKEN_ENDPOINT || '';

const codeExample = `import { createDirectLine, renderWebChat } from 'botframework-webchat';

const WebChatComponent = () => {
  const [token, setToken] = useState('');
  const webchatRef = useRef(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/token', { method: 'POST' });
        const { token } = await res.json();
        setToken(token);
      } catch (error) {
        console.error('Error fetching token:', error);
      }
    };
    fetchToken();
  }, []);

  useEffect(() => {
    if (token && webchatRef.current) {
      const styleOptions = {
        bubbleBackground: '#E0E0E0',
        bubbleTextColor: '#333333',
        bubbleFromUserBackground: '#0078D4',
        bubbleFromUserTextColor: '#FFFFFF',
        botAvatarImage: '/bot-avatar.png',
        userAvatarImage: '/user-avatar.png',
        bubbleBorderRadius: 10,
        fontFamily: '"Segoe UI", sans-serif',
        backgroundColor: 'transparent',
        sendBoxBackground: '#FFFFFF',
        sendBoxTextColor: '#000000',
        sendBoxBorderTop: 'solid 1px #CCCCCC'
      };

      renderWebChat({
        directLine: createDirectLine({ token }),
        styleOptions
      }, webchatRef.current);
    }
  }, [token]);

  return (
    <div id="webchat-container" style={{ height: '500px', width: '400px' }}>
      <div id="webchat" ref={webchatRef} />
    </div>
  );
};`;

export default function RenderWebChatDemo() {
  const styles = useStyles();
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');

  // Create directLine instance when token is available
  const directLine = useMemo(
    () => (token ? createDirectLine({ token }) : null),
    [token]
  );

  useEffect(() => {
    const fetchToken = async () => {
      if (!TOKEN_ENDPOINT) {
        setError('Token endpoint not configured');
        setStatus('error');
        return;
      }

      try {
        const res = await fetch(TOKEN_ENDPOINT);
        if (!res.ok) throw new Error('Failed to fetch token');
        const data = await res.json();
        setToken(data.token);
        setStatus('ready');
      } catch (err) {
        console.error('Error fetching token:', err);
        setError(err instanceof Error ? err.message : 'Failed to load');
        setStatus('error');
      }
    };

    fetchToken();
  }, []);

  return (
    <div className={styles.container}>
      <Card className={styles.description}>
        <Text weight="semibold" size={400}>
          Web Chat using renderWebChat Function & Direct Line API
        </Text>
        <Text block style={{ marginTop: '8px' }}>
          This approach manually renders Web Chat onto the DOM using <code>renderWebChat()</code>,
          allowing deep customization. It provides full control over rendering using refs and 
          supports advanced customization patterns.
        </Text>
        
        <div className={styles.prosConsList}>
          <div className={`${styles.prosCons} ${styles.pros}`}>
            <Text weight="semibold">✓ Pros</Text>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>Flexible and Highly Customizable</li>
              <li>Allows performance optimizations & UI tweaks</li>
              <li>Supports middleware & event listeners</li>
              <li>Direct DOM Control, allows full control over rendering</li>
            </ul>
          </div>
          <div className={`${styles.prosCons} ${styles.cons}`}>
            <Text weight="semibold">✗ Cons</Text>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>Can be complex to implement</li>
              <li>Requires manual event handling</li>
              <li>Heavier than ReactWebChat control</li>
              <li>More boilerplate code</li>
            </ul>
          </div>
        </div>
      </Card>

      <Text weight="semibold">React Implementation with renderWebChat</Text>
      <CodeBlockWithModal code={codeExample} title="React Implementation with renderWebChat" language="tsx">
        <div className={styles.codeBlock}>{codeExample}</div>
      </CodeBlockWithModal>

      <Text weight="semibold">Live Demo</Text>
      <div className={styles.chatOuterContainer}>
        {status === 'loading' && (
          <div className={styles.centered}>
            <Spinner size="large" label="Initializing WebChat..." />
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
            styleOptions={styleOptions}
          />
        )}
      </div>
    </div>
  );
}
