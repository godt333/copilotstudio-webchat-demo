/**
 * Demo 2: Embedding Web Chat with Simple ReactWebChat Control
 * 
 * This approach directly integrates Web Chat as a React component
 * using ReactWebChat. It is simple and requires minimal configuration.
 * 
 * Best for: React apps needing quick integration, minimal customization
 */
import { useState, useEffect } from 'react';
import ReactWebChat, { createDirectLine } from 'botframework-webchat';
import { adaptiveCardsHostConfig } from '../../config/adaptiveCardsConfig';
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

const codeExample = `import React, { useEffect, useState } from 'react';
import ReactWebChat, { createDirectLine } from 'botframework-webchat';

// Copilot Studio Token Endpoint (anonymous access)
// Get this URL from: Copilot Studio > Channels > Web app > Connection string
const TOKEN_ENDPOINT = 'https://YOUR_ENVIRONMENT.api.powerplatform.com/powervirtualagents/botsbyschema/YOUR_BOT_ID/directline/token?api-version=2022-03-01-preview';

const ChatBot = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Fetch Direct Line token from Copilot Studio
    fetch(TOKEN_ENDPOINT)
      .then(response => response.json())
      .then(data => {
        console.log("Fetched Token:", data.token);
        setToken(data.token);
      })
      .catch(error => console.error('Error fetching token:', error));
  }, []);

  return (
    <div style={{ height: '500px', width: '100%' }}>
      {token ? (
        <ReactWebChat
          directLine={createDirectLine({ token })}
          userID={\`user-\${Math.random().toString(36).substr(2, 9)}\`}
          locale="en-US"
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ChatBot;`;

export default function SimpleReactWebChatDemo() {
  const styles = useStyles();
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');

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
        console.log('Fetched Token:', data.token);
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
          Embedding Web Chat with Simple ReactWebChat Control
        </Text>
        <Text block style={{ marginTop: '8px' }}>
          This approach directly integrates Web Chat as a React component using 
          <code> ReactWebChat</code> from <code>botframework-webchat</code>. 
          It's simple and requires minimal configuration.
        </Text>
        
        <div className={styles.prosConsList}>
          <div className={`${styles.prosCons} ${styles.pros}`}>
            <Text weight="semibold">✓ Pros</Text>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>Simple & Quick to implement</li>
              <li>Lightweight and optimized</li>
              <li>Minimal setup or configurations</li>
              <li>TypeScript support</li>
            </ul>
          </div>
          <div className={`${styles.prosCons} ${styles.cons}`}>
            <Text weight="semibold">✗ Cons</Text>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>Difficult to customize UI settings</li>
              <li>Limited middleware support</li>
              <li>Less control over behavior</li>
            </ul>
          </div>
        </div>
      </Card>

      <Text weight="semibold">React Implementation</Text>
      <CodeBlockWithModal code={codeExample} title="React Implementation" language="tsx">
        <div className={styles.codeBlock}>{codeExample}</div>
      </CodeBlockWithModal>

      <Text weight="semibold">Live Demo</Text>
      <div className={styles.chatContainer}>
        {status === 'loading' && (
          <div className={styles.centered}>
            <Spinner size="large" label="Fetching token..." />
          </div>
        )}
        {status === 'error' && (
          <div className={styles.centered}>
            <Text style={{ color: '#d32f2f' }}>Error: {error}</Text>
          </div>
        )}
        {status === 'ready' && token && (
          <ReactWebChat
            directLine={createDirectLine({ token })}
            userID={`user-${Math.random().toString(36).substr(2, 9)}`}
            adaptiveCardsHostConfig={adaptiveCardsHostConfig}
            locale="en-GB"
          />
        )}
      </div>
    </div>
  );
}
