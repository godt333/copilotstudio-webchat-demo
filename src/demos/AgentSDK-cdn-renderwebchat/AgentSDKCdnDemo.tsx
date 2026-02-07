/**
 * Demo 1: CDN + renderWebChat (Vanilla JS Pattern)
 * 
 * This demo showcases how to use WebChat via CDN with the M365 Agents SDK.
 * In a real CDN scenario, you'd load scripts via <script> tags.
 * This React component simulates that pattern using createRoot for React 19 compatibility.
 */
import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import ReactWebChat from 'botframework-webchat';
import type { CopilotStudioWebChatConnection } from '@microsoft/agents-copilotstudio-client';
import {
  makeStyles,
  tokens,
  Text,
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

interface AgentSDKCdnDemoProps {
  connection: CopilotStudioWebChatConnection;
}

const codeExample = `// CDN + renderWebChat Pattern with M365 Agents SDK
// Load via <script> tags in HTML

<script src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
<script src="https://unpkg.com/@microsoft/agents-copilotstudio-client/dist/browser.js"></script>

<script>
  // Create connection using M365 Agents SDK
  const client = new CopilotStudioClient({
    directConnectUrl: 'YOUR_DIRECT_CONNECT_URL'
  }, accessToken);
  
  const connection = CopilotStudioWebChat.createConnection(client, {
    showTyping: true
  });

  // Render WebChat using the CDN bundle
  window.WebChat.renderWebChat(
    {
      directLine: connection,
      styleOptions: {
        bubbleBackground: '#E0E0E0',
        bubbleFromUserBackground: '#0078D4',
        botAvatarImage: '/bot-avatar.png'
      }
    },
    document.getElementById('webchat')
  );
</script>`;

export default function AgentSDKCdnDemo({ connection }: AgentSDKCdnDemoProps) {
  const styles = useStyles();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<ReturnType<typeof createRoot> | null>(null);

  useEffect(() => {
    if (chatContainerRef.current && connection && !rootRef.current) {
      // Use createRoot for React 19 compatibility (simulating CDN pattern)
      rootRef.current = createRoot(chatContainerRef.current);
      rootRef.current.render(
        <ReactWebChat
          directLine={connection}
          styleOptions={{
            bubbleBackground: '#E0E0E0',
            bubbleFromUserBackground: '#0078D4',
            bubbleFromUserTextColor: 'white',
            botAvatarInitials: 'CA',
            userAvatarInitials: 'You',
            hideUploadButton: true,
          }}
        />
      );
    }
  }, [connection]);

  return (
    <div className={styles.container}>
      <div className={styles.description}>
        <Text weight="semibold" size={400}>
          CDN + renderWebChat (Vanilla JS)
        </Text>
        <Text block style={{ marginTop: '8px' }}>
          Embed WebChat without build tools. Load via &lt;script&gt; tags, authenticate with MSAL,
          customize with styleOptions. Ideal for CMS, WordPress, SharePoint.
        </Text>
      </div>

      <div className={styles.prosConsList}>
        <div className={`${styles.prosCons} ${styles.pros}`}>
          <Text weight="semibold">✓ Pros</Text>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>No build tools required</li>
            <li>Works in any HTML page</li>
            <li>Simple integration</li>
            <li>Quick prototyping</li>
          </ul>
        </div>
        <div className={`${styles.prosCons} ${styles.cons}`}>
          <Text weight="semibold">✗ Cons</Text>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Can't use React components</li>
            <li>Limited customization</li>
            <li>No TypeScript support</li>
            <li>Larger bundle size</li>
          </ul>
        </div>
      </div>

      <Text weight="semibold">Code Example:</Text>
      <CodeBlockWithModal code={codeExample} title="CDN + renderWebChat Pattern" language="html">
        <div className={styles.codeBlock}>{codeExample}</div>
      </CodeBlockWithModal>

      <Text weight="semibold">Live Demo:</Text>
      <div ref={chatContainerRef} className={styles.chatContainer} />
    </div>
  );
}
