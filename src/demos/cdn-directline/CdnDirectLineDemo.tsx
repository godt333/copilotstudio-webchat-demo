/**
 * Demo 1: Web Chat using CDN with Direct Line API
 * 
 * This approach demonstrates the CDN pattern using window.WebChat.renderWebChat().
 * 
 * Note: The CDN approach is best for non-React/vanilla HTML apps. In React apps,
 * use the npm package instead to avoid React version conflicts.
 * The live demo below uses the npm package for compatibility with React 18+.
 * 
 * Best for: Quick integration, non-React apps, simple use cases
 */
import { useEffect, useMemo, useState } from 'react';
import ReactWebChat, { createDirectLine } from 'botframework-webchat';
import { adaptiveCardsHostConfig } from '../../config/adaptiveCardsConfig';
import {
  makeStyles,
  tokens,
  Text,
  Spinner,
  Card,
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components';

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
    fontSize: '13px',
    overflowX: 'auto',
    whiteSpace: 'pre',
  },
  chatContainer: {
    height: '500px',
    border: '1px solid #e0e0e0',
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
});

// Token endpoint for anonymous access
const TOKEN_ENDPOINT = import.meta.env.VITE_COPILOT_TOKEN_ENDPOINT || '';

// Style options
const styleOptions = {
  bubbleBackground: '#F0F0F0',
  bubbleFromUserBackground: '#0078d4',
  bubbleFromUserTextColor: '#FFFFFF',
};

export default function CdnDirectLineDemo() {
  const styles = useStyles();
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');

  // Create directLine when token is available
  const directLine = useMemo(
    () => (token ? createDirectLine({ token }) : null),
    [token]
  );

  useEffect(() => {
    const fetchToken = async () => {
      if (!TOKEN_ENDPOINT) {
        setError('Token endpoint not configured. Set VITE_COPILOT_TOKEN_ENDPOINT in .env');
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
        console.error('WebChat error:', err);
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
          Web Chat using CDN with Direct Line API
        </Text>
        <Text block style={{ marginTop: '8px' }}>
          This approach loads the WebChat bundle from Microsoft's CDN and renders it using 
          <code> window.WebChat.renderWebChat()</code>. It's ideal for quick integration 
          in non-React applications or when you want minimal setup.
        </Text>
        
        <div className={styles.prosConsList}>
          <div className={`${styles.prosCons} ${styles.pros}`}>
            <Text weight="semibold">✓ Pros</Text>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>No npm packages needed</li>
              <li>Works in any HTML page</li>
              <li>Quick to implement</li>
              <li>Always uses latest version</li>
            </ul>
          </div>
          <div className={`${styles.prosCons} ${styles.cons}`}>
            <Text weight="semibold">✗ Cons</Text>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>Less control over bundle size</li>
              <li>CDN dependency</li>
              <li>Can conflict with React apps</li>
            </ul>
          </div>
        </div>
      </Card>

      <Text weight="semibold">HTML Implementation (for non-React apps)</Text>
      <div className={styles.codeBlock}>
{`<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
</head>
<body>
  <div id="webchat" style="height: 500px;"></div>
  <script>
    (async function () {
      // Fetch token from your backend
      const res = await fetch('/api/directline/token');
      const { token } = await res.json();
      
      window.WebChat.renderWebChat({
        directLine: window.WebChat.createDirectLine({ token }),
        styleOptions: { bubbleBackground: '#F0F0F0' }
      }, document.getElementById('webchat'));
    })();
  </script>
</body>
</html>`}
      </div>

      <MessageBar intent="info" style={{ marginTop: tokens.spacingVerticalM }}>
        <MessageBarBody>
          <strong>Note:</strong> The live demo below uses the npm package (ReactWebChat) for React 18+ compatibility.
          The CDN approach works best in vanilla HTML/JavaScript applications.
        </MessageBarBody>
      </MessageBar>

      <Text weight="semibold">Live Demo</Text>
      <div className={styles.chatContainer}>
        {status === 'loading' && (
          <div className={styles.centered}>
            <Spinner size="large" label="Connecting to bot..." />
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
            adaptiveCardsHostConfig={adaptiveCardsHostConfig}
            locale="en-GB"
          />
        )}
      </div>
    </div>
  );
}
