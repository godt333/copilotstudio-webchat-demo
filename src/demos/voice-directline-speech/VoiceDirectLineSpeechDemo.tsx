/**
 * Direct Line Speech Demo
 * 
 * Demonstrates the createDirectLineSpeechAdapters approach.
 * This is an INFORMATIONAL demo - it does NOT work with Copilot Studio Token Endpoint directly.
 * 
 * Requires:
 * - Azure Bot Service resource
 * - Direct Line Speech channel enabled
 * - Speech Services linked to the bot
 */
import {
  makeStyles,
  shorthands,
  tokens,
  Text,
  Card,
  Title2,
  Body1,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from '@fluentui/react-components';
import {
  PlugConnected24Regular,
  Warning24Regular,
  Info24Regular,
  Checkmark24Regular,
} from '@fluentui/react-icons';
import { CodeBlockWithModal } from '../../components/common/CodeModal';

// ============================================================================
// STYLES
// ============================================================================

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  infoSection: {
    backgroundColor: '#fff8e1',
    borderLeft: '4px solid #ff9800',
    ...shorthands.padding(tokens.spacingHorizontalL),
    borderRadius: '0 8px 8px 0',
  },
  codeBlock: {
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    ...shorthands.padding('16px'),
    borderRadius: tokens.borderRadiusMedium,
    fontFamily: 'Consolas, Monaco, monospace',
    fontSize: '12px',
    overflowX: 'auto',
    whiteSpace: 'pre',
  },
  architectureSection: {
    backgroundColor: '#f5f5f5',
    ...shorthands.padding(tokens.spacingHorizontalL),
    borderRadius: tokens.borderRadiusMedium,
  },
  stepsList: {
    ...shorthands.padding('0', '0', '0', '24px'),
  },
  stepsItem: {
    marginBottom: tokens.spacingVerticalS,
    lineHeight: '1.6',
  },
  checkIcon: {
    color: '#107c10',
    verticalAlign: 'middle',
    marginRight: '8px',
  },
  comparisonTable: {
    marginTop: tokens.spacingVerticalM,
  },
  linkText: {
    color: '#0078d4',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
});

// Code examples for modal display
const implementationCode = `// Direct Line Speech approach (requires server-side token endpoint)
const adapters = await window.WebChat.createDirectLineSpeechAdapters({
  fetchCredentials: async () => {
    // This requires a server endpoint that returns DL Speech credentials
    const res = await fetch('https://your-server/speechservices/token', {
      method: 'POST'
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch speech credentials');
    }
    
    const { region, token: authorizationToken } = await res.json();
    return { authorizationToken, region };
  }
});

// The adapters include both directLine AND webSpeechPonyfillFactory
window.WebChat.renderWebChat(
  {
    ...adapters,  // Spread includes: directLine, webSpeechPonyfillFactory
    styleOptions: {
      bubbleFromUserBackground: '#0078d4',
      bubbleFromUserTextColor: '#ffffff',
      microphoneButtonColorOnDictate: '#d52b1e'
    }
  },
  document.getElementById('webchat')
);`;

const architectureDiagram = `┌─────────────────────────────────────────────────────────────────────────┐
│                              Browser                                     │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                        WebChat                                     │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │           createDirectLineSpeechAdapters                     │  │  │
│  │  │                                                              │  │  │
│  │  │  Returns BOTH:                                               │  │  │
│  │  │  • directLine (bot connection)                               │  │  │
│  │  │  • webSpeechPonyfillFactory (voice)                         │  │  │
│  │  └──────────────────────────┬──────────────────────────────────┘  │  │
│  └─────────────────────────────┼─────────────────────────────────────┘  │
└────────────────────────────────┼─────────────────────────────────────────┘
                                 │
                                 ▼
              ┌──────────────────────────────────────┐
              │         Your Token Server            │
              │    (returns DL Speech credentials)   │
              └──────────────────┬───────────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          ▼                      ▼                      ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   Azure Speech   │  │  Azure Bot       │  │  Copilot Studio  │
│   Service        │◀─│  Service         │◀─│  (via Skills)    │
│                  │  │  (DL Speech Ch)  │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘`;

// ============================================================================
// COMPONENT
// ============================================================================

export default function VoiceDirectLineSpeechDemo() {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <Title2>
        <PlugConnected24Regular style={{ marginRight: '8px', verticalAlign: 'middle', color: '#107c10' }} />
        Direct Line Speech Demo
      </Title2>

      {/* Warning Banner */}
      <MessageBar intent="warning">
        <MessageBarBody>
          <MessageBarTitle>Not Compatible with Token Endpoint</MessageBarTitle>
          This approach does NOT work directly with Copilot Studio's Token Endpoint.
          It requires additional Azure infrastructure setup.
        </MessageBarBody>
      </MessageBar>

      {/* Info Section */}
      <div className={styles.infoSection}>
        <Text weight="semibold" size={400}>
          <Warning24Regular style={{ color: '#ff9800', marginRight: '8px', verticalAlign: 'middle' }} />
          Advanced Setup Required
        </Text>
        <Body1 style={{ marginTop: tokens.spacingVerticalS }}>
          Direct Line Speech is a unified channel that combines bot communication and speech services
          into a single connection. It's ideal for telephony and IVR scenarios but requires more infrastructure.
        </Body1>
      </div>

      {/* Code Example */}
      <Card>
        <Text weight="semibold" size={400}>Implementation Code</Text>
        <CodeBlockWithModal code={implementationCode} title="Direct Line Speech Implementation" language="tsx">
          <pre className={styles.codeBlock}>{implementationCode}</pre>
        </CodeBlockWithModal>
      </Card>

      {/* Prerequisites */}
      <Card>
        <Text weight="semibold" size={400}>
          <Info24Regular style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Prerequisites for Direct Line Speech
        </Text>
        <ol className={styles.stepsList}>
          <li className={styles.stepsItem}>
            <strong>Create Azure Speech Service resource</strong> in the Azure Portal
          </li>
          <li className={styles.stepsItem}>
            <strong>Create Azure Bot Service resource</strong> (separate from Copilot Studio)
          </li>
          <li className={styles.stepsItem}>
            <strong>Enable Direct Line Speech channel</strong> on the Bot Service
          </li>
          <li className={styles.stepsItem}>
            <strong>Link Speech Services</strong> to the Bot Service via the channel configuration
          </li>
          <li className={styles.stepsItem}>
            <strong>Create a token server endpoint</strong> that returns Direct Line Speech credentials
          </li>
          <li className={styles.stepsItem}>
            <strong>Connect Copilot Studio to Azure Bot Service</strong> (via Skills or other methods)
          </li>
        </ol>
      </Card>

      {/* Architecture */}
      <div className={styles.architectureSection}>
        <Text weight="semibold" size={400}>Architecture Diagram</Text>
        <CodeBlockWithModal code={architectureDiagram} title="Direct Line Speech Architecture" language="text">
          <pre className={styles.codeBlock}>{architectureDiagram}</pre>
        </CodeBlockWithModal>
      </div>

      {/* When to Use */}
      <Card>
        <Text weight="semibold" size={400}>When to Use Direct Line Speech</Text>
        <Table className={styles.comparisonTable}>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Use Case</TableHeaderCell>
              <TableHeaderCell>Recommendation</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Simple web chat with voice</TableCell>
              <TableCell>Use <strong>Speech Ponyfill</strong> instead</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Custom voice UI in web app</TableCell>
              <TableCell>Use <strong>Custom Speech SDK</strong> instead</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Checkmark24Regular className={styles.checkIcon} />
                Telephony / IVR integration
              </TableCell>
              <TableCell>Direct Line Speech is appropriate</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Checkmark24Regular className={styles.checkIcon} />
                Low-latency voice with Bot Framework
              </TableCell>
              <TableCell>Direct Line Speech is appropriate</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Checkmark24Regular className={styles.checkIcon} />
                AudioCodes LiveHub / PSTN
              </TableCell>
              <TableCell>Direct Line Speech is appropriate</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>

      {/* Documentation Links */}
      <Card>
        <Text weight="semibold" size={400}>Documentation & Resources</Text>
        <ul style={{ paddingLeft: '20px', marginTop: tokens.spacingVerticalS }}>
          <li style={{ marginBottom: '8px' }}>
            <a
              href="https://learn.microsoft.com/en-us/azure/bot-service/directline-speech-bot"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkText}
            >
              Direct Line Speech Overview (Microsoft Docs)
            </a>
          </li>
          <li style={{ marginBottom: '8px' }}>
            <a
              href="https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/direct-line-speech"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkText}
            >
              Create a Voice Assistant with Direct Line Speech
            </a>
          </li>
          <li style={{ marginBottom: '8px' }}>
            <a
              href="https://github.com/microsoft/BotFramework-WebChat/tree/main/samples"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkText}
            >
              WebChat Samples (GitHub)
            </a>
          </li>
        </ul>
      </Card>
    </div>
  );
}
