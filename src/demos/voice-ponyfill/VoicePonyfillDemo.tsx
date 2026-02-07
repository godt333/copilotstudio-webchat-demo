/**
 * Voice Ponyfill Demo
 * 
 * Demonstrates using createCognitiveServicesSpeechServicesPonyfillFactory
 * for built-in WebChat voice support.
 * 
 * This is the RECOMMENDED approach for Copilot Studio + WebChat voice integration.
 */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import ReactWebChat, { createDirectLine, createStore, createCognitiveServicesSpeechServicesPonyfillFactory } from 'botframework-webchat';
import type { WebSpeechPonyfillFactory } from 'botframework-webchat-api';
import {
  makeStyles,
  shorthands,
  tokens,
  Text,
  Card,
  Badge,
  Title2,
  Body1,
  Button,
  Spinner,
} from '@fluentui/react-components';
import {
  Mic24Regular,
  Info24Regular,
  Checkmark24Regular,
  ArrowSync24Regular,
} from '@fluentui/react-icons';
import { CodeBlockWithModal } from '../../components/common/CodeModal';

// ============================================================================
// CONFIGURATION
// ============================================================================

const TOKEN_ENDPOINT = import.meta.env.VITE_COPILOT_TOKEN_ENDPOINT || '';
const SPEECH_KEY = import.meta.env.VITE_SPEECH_KEY || '';
const SPEECH_REGION = import.meta.env.VITE_SPEECH_REGION || '';

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
    backgroundColor: '#e8f5e9',
    borderLeft: '4px solid #4caf50',
    ...shorthands.padding(tokens.spacingHorizontalL),
    borderRadius: '0 8px 8px 0',
  },
  codeBlock: {
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    ...shorthands.padding('16px'),
    borderRadius: tokens.borderRadiusMedium,
    fontFamily: 'Consolas, Monaco, monospace',
    fontSize: '13px',
    overflowX: 'auto',
    whiteSpace: 'pre',
  },
  chatWrapper: {
    height: '500px',
    ...shorthands.border('1px', 'solid', '#e0e0e0'),
    borderRadius: tokens.borderRadiusMedium,
    overflow: 'hidden',
  },
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
    backgroundColor: '#f5f5f5',
    borderBottom: '1px solid #e0e0e0',
  },
  configWarning: {
    backgroundColor: '#fff3cd',
    ...shorthands.border('1px', 'solid', '#ffc107'),
    ...shorthands.padding(tokens.spacingHorizontalL),
    borderRadius: tokens.borderRadiusMedium,
  },
  featureList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalM,
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
});

// Code examples for modal display
const implementationCode = `import { createCognitiveServicesSpeechServicesPonyfillFactory, createStore } from 'botframework-webchat';

// 1. Get Speech authorization token (required for browser)
const tokenRes = await fetch(
  \`https://\${SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken\`,
  { method: 'POST', headers: { 'Ocp-Apim-Subscription-Key': SPEECH_KEY } }
);
const authorizationToken = await tokenRes.text();

// 2. Create ponyfill factory for STT + TTS
const webSpeechPonyfillFactory = createCognitiveServicesSpeechServicesPonyfillFactory({
  credentials: { region: SPEECH_REGION, authorizationToken },
});

// 3. Create store with middleware to enable TTS on bot messages
// (WebChat only speaks when activity has 'speak' property)
const store = createStore({}, () => next => action => {
  if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
    const activity = action.payload?.activity;
    if (activity?.type === 'message' && activity?.from?.role === 'bot') {
      activity.speak = activity.speak || activity.text;  // Add speak property
      activity.inputHint = 'expectingInput';  // Re-open mic after TTS
    }
  }
  return next(action);
});

// 4. Pass both to WebChat
<ReactWebChat
  directLine={directLine}
  store={store}
  webSpeechPonyfillFactory={webSpeechPonyfillFactory}
/>`;

const envConfigCode = `VITE_COPILOT_TOKEN_ENDPOINT=https://...
VITE_SPEECH_KEY=your_speech_key
VITE_SPEECH_REGION=eastus`;

// ============================================================================
// COMPONENT
// ============================================================================

export default function VoicePonyfillDemo() {
  const styles = useStyles();
  const [directLine, setDirectLine] = useState<ReturnType<typeof createDirectLine> | null>(null);
  const [webSpeechPonyfillFactory, setWebSpeechPonyfillFactory] = useState<WebSpeechPonyfillFactory | null>(null);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'ready' | 'error'>('idle');
  const [error, setError] = useState('');
  const isConnecting = useRef(false);

  const isConfigured = Boolean(TOKEN_ENDPOINT && SPEECH_KEY && SPEECH_REGION);

  // Create store with middleware to add 'speak' property for TTS
  const store = useMemo(() => {
    return createStore({}, () => (next: (action: unknown) => unknown) => (action: unknown) => {
      const typedAction = action as { 
        type?: string; 
        payload?: { 
          activity?: { 
            type?: string; 
            from?: { role?: string }; 
            text?: string; 
            speak?: string;
            inputHint?: string;
          };
          text?: string;
        } 
      };
      
      // Log key actions for debugging
      if (typedAction.type === 'WEB_CHAT/SEND_MESSAGE') {
        console.log('[Ponyfill Store] 📤 SEND_MESSAGE:', typedAction.payload?.text);
      }
      if (typedAction.type === 'WEB_CHAT/SET_SEND_BOX') {
        console.log('[Ponyfill Store] 📝 SET_SEND_BOX:', typedAction.payload);
      }
      if (typedAction.type === 'WEB_CHAT/SET_DICTATE_STATE') {
        console.log('[Ponyfill Store] 🎤 DICTATE_STATE:', typedAction.payload);
      }
      if (typedAction.type === 'WEB_CHAT/SET_DICTATE_INTERIMS') {
        console.log('[Ponyfill Store] 🎤 DICTATE_INTERIMS:', typedAction.payload);
      }
      
      // Add speak property to bot messages for TTS
      if (typedAction.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
        const activity = typedAction.payload?.activity;
        console.log('[Ponyfill Store] 📥 INCOMING_ACTIVITY:', activity?.type, 'from:', activity?.from?.role, 'text:', activity?.text?.substring(0, 50));
        
        if (activity?.type === 'message' && activity?.from?.role === 'bot' && activity?.text) {
          // Strip markdown for cleaner speech
          const cleanText = activity.text
            .replace(/\*\*([^*]+)\*\*/g, '$1')  // Bold
            .replace(/\*([^*]+)\*/g, '$1')      // Italic
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // Links
            .replace(/<[^>]+>/g, '')            // HTML tags
            .trim();
          
          // Set speak property for TTS
          activity.speak = cleanText;
          activity.inputHint = 'expectingInput';  // Re-open mic after speaking
          console.log('[Ponyfill Store] 🔊 Set speak property for TTS:', cleanText.substring(0, 80));
        }
      }
      
      return next(action);
    });
  }, []);

  const initialize = useCallback(async () => {
    if (!isConfigured || isConnecting.current) return;

    isConnecting.current = true;
    setStatus('connecting');
    setError('');

    try {
      // 1. Get Direct Line token
      console.log('[Ponyfill] Fetching Direct Line token...');
      const response = await fetch(TOKEN_ENDPOINT);
      if (!response.ok) throw new Error('Failed to get token');
      const { token } = await response.json();

      // 2. Create Direct Line
      const dl = createDirectLine({ token });
      console.log('[Ponyfill] Direct Line created');

      // 3. Get Speech authorization token (required for browser - can't use subscription key directly)
      console.log('[Ponyfill] Fetching Speech auth token...');
      const speechTokenResponse = await fetch(
        `https://${SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
        {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': SPEECH_KEY,
          },
        }
      );
      
      if (!speechTokenResponse.ok) {
        throw new Error('Failed to get Speech authorization token');
      }
      
      const authorizationToken = await speechTokenResponse.text();
      console.log('[Ponyfill] Speech auth token received');

      // 4. Create Speech Ponyfill Factory with credentials
      console.log('[Ponyfill] Creating ponyfill factory...');
      console.log('[Ponyfill] Region:', SPEECH_REGION);
      
      const ponyfillFactory = createCognitiveServicesSpeechServicesPonyfillFactory({
        credentials: {
          region: SPEECH_REGION,
          authorizationToken,
        },
        // Enable telemetry for debugging
        enableTelemetry: true,
      });
      
      console.log('[Ponyfill] Ponyfill factory created:', typeof ponyfillFactory);
      
      // Test what the factory returns
      try {
        const testResult = ponyfillFactory({});
        console.log('[Ponyfill] Factory test - keys:', Object.keys(testResult || {}));
        console.log('[Ponyfill] Has speechSynthesis:', !!testResult?.speechSynthesis);
        console.log('[Ponyfill] Has SpeechRecognition:', !!testResult?.SpeechRecognition);
        
        // Test microphone access
        if (navigator.mediaDevices?.getUserMedia) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('[Ponyfill] ✅ Microphone access granted');
            stream.getTracks().forEach(track => track.stop()); // Release immediately
          } catch (micErr) {
            console.error('[Ponyfill] ❌ Microphone access denied:', micErr);
          }
        }
      } catch (testErr) {
        console.error('[Ponyfill] Factory test failed:', testErr);
      }
      
      if (!ponyfillFactory) {
        throw new Error('Ponyfill factory returned null - Speech SDK initialization failed');
      }

      setDirectLine(dl);
      // IMPORTANT: Wrap in arrow function because setState treats functions as updaters
      // Without this, React would call ponyfillFactory(previousState) which causes the error
      setWebSpeechPonyfillFactory(() => ponyfillFactory);
      setStatus('ready');
    } catch (err) {
      console.error('[Ponyfill] Failed to initialize:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setStatus('error');
    } finally {
      isConnecting.current = false;
    }
  }, [isConfigured]);

  useEffect(() => {
    if (status === 'idle' && isConfigured) {
      initialize();
    }
  }, [status, isConfigured, initialize]);

  const restart = () => {
    setDirectLine(null);
    setWebSpeechPonyfillFactory(null);
    setStatus('idle');
  };

  return (
    <div className={styles.container}>
      <Title2>
        <Mic24Regular style={{ marginRight: '8px', verticalAlign: 'middle', color: '#0078d4' }} />
        Speech Ponyfill Demo
      </Title2>

      {/* Info Section */}
      <div className={styles.infoSection}>
        <Text weight="semibold" size={400}>
          <Checkmark24Regular style={{ color: '#4caf50', marginRight: '8px', verticalAlign: 'middle' }} />
          Recommended Approach for Voice
        </Text>
        <Body1 style={{ marginTop: tokens.spacingVerticalS }}>
          This demo uses <code>createCognitiveServicesSpeechServicesPonyfillFactory</code> to add voice capabilities.
          The microphone button appears automatically in the send box.
        </Body1>
        <div className={styles.featureList}>
          <div className={styles.featureItem}>
            <Checkmark24Regular style={{ color: '#4caf50' }} />
            <Text>Built-in mic button</Text>
          </div>
          <div className={styles.featureItem}>
            <Checkmark24Regular style={{ color: '#4caf50' }} />
            <Text>Speech-to-text (STT)</Text>
          </div>
          <div className={styles.featureItem}>
            <Checkmark24Regular style={{ color: '#4caf50' }} />
            <Text>Text-to-speech (TTS) via store middleware</Text>
          </div>
          <div className={styles.featureItem}>
            <Checkmark24Regular style={{ color: '#4caf50' }} />
            <Text>Minimal code required</Text>
          </div>
        </div>
      </div>

      {/* TTS Info */}
      <div style={{
        backgroundColor: '#e3f2fd',
        border: '1px solid #2196f3',
        borderLeft: '4px solid #2196f3',
        padding: '16px',
        borderRadius: '4px',
      }}>
        <Text weight="semibold" style={{ color: '#1565c0' }}>
          💡 How TTS Works
        </Text>
        <Body1 style={{ marginTop: '8px', color: '#1565c0' }}>
          WebChat speaks bot responses when the activity has a <code>speak</code> property. 
          Since Copilot Studio may not include this by default, we use a <strong>store middleware</strong> to 
          add the <code>speak</code> property to incoming bot messages automatically.
        </Body1>
      </div>

      {/* Code Example */}
      <Card>
        <Text weight="semibold" size={400}>Implementation Code</Text>
        <CodeBlockWithModal code={implementationCode} title="Voice Ponyfill Implementation" language="tsx">
          <pre className={styles.codeBlock}>{implementationCode}</pre>
        </CodeBlockWithModal>
      </Card>

      {/* Not Configured Warning */}
      {!isConfigured && (
        <div className={styles.configWarning}>
          <Text weight="semibold">
            <Info24Regular style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Configuration Required
          </Text>
          <Body1 style={{ marginTop: tokens.spacingVerticalS }}>
            Set the following environment variables in your <code>.env</code> file:
          </Body1>
          <pre className={styles.codeBlock}>{envConfigCode}</pre>
        </div>
      )}

      {/* Chat Demo */}
      {isConfigured && (
        <Card>
          <div className={styles.statusBar}>
            <Badge
              appearance="filled"
              color={status === 'ready' ? 'success' : status === 'error' ? 'danger' : 'informative'}
            >
              {status === 'ready' ? 'Connected' : status === 'connecting' ? 'Connecting...' : status === 'error' ? 'Error' : 'Idle'}
            </Badge>
            {status === 'ready' && (
              <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                Click the microphone icon in the send box to speak
              </Text>
            )}
            <div style={{ marginLeft: 'auto' }}>
              <Button
                appearance="subtle"
                icon={<ArrowSync24Regular />}
                onClick={restart}
                disabled={status === 'connecting'}
              >
                Restart
              </Button>
            </div>
          </div>

          <div className={styles.chatWrapper}>
            {status === 'connecting' && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Spinner size="large" label="Connecting..." />
              </div>
            )}

            {status === 'error' && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: '16px' }}>
                <Text style={{ color: '#d32f2f' }}>{error}</Text>
                <Button appearance="primary" onClick={initialize}>Try Again</Button>
              </div>
            )}

            {status === 'ready' && directLine && webSpeechPonyfillFactory && (
              <ReactWebChat
                directLine={directLine}
                store={store}
                locale="en-GB"
                webSpeechPonyfillFactory={webSpeechPonyfillFactory}
                styleOptions={{
                  bubbleBackground: '#ffffff',
                  bubbleFromUserBackground: '#e3f2fd',
                  microphoneButtonColorOnDictate: '#d32f2f',
                }}
              />
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
