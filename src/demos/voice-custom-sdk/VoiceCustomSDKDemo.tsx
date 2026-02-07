/**
 * Custom Speech SDK Demo
 * 
 * Demonstrates manual integration with Azure Speech SDK for voice capabilities.
 * Provides full control over the voice UI and behavior.
 */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import ReactWebChat, { createDirectLine, createStore } from 'botframework-webchat';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
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
  Tooltip,
} from '@fluentui/react-components';
import {
  Code24Regular,
  Info24Regular,
  Mic24Regular,
  MicOff24Regular,
  ArrowSync24Regular,
  Speaker224Regular,
  SpeakerOff24Regular,
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
    backgroundColor: '#ede7f6',
    borderLeft: '4px solid #5c2d91',
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
    maxHeight: '300px',
  },
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  voiceControls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalM,
    ...shorthands.padding(tokens.spacingVerticalM),
    backgroundColor: '#f5f5f5',
    borderBottom: '1px solid #e0e0e0',
  },
  micButton: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
  },
  micButtonListening: {
    backgroundColor: '#d32f2f',
    ':hover': {
      backgroundColor: '#b71c1c',
    },
  },
  chatWrapper: {
    height: '400px',
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
  transcript: {
    color: tokens.colorNeutralForeground3,
    fontStyle: 'italic',
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

// Code example for modal display
const implementationCode = `import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

// Get auth token for browser usage
const tokenRes = await fetch(
  \`https://\${SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken\`,
  { method: 'POST', headers: { 'Ocp-Apim-Subscription-Key': SPEECH_KEY } }
);
const authToken = await tokenRes.text();

// Initialize Speech Config with auth token
const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(authToken, SPEECH_REGION);
speechConfig.speechRecognitionLanguage = 'en-GB';
speechConfig.speechSynthesisVoiceName = 'en-GB-SoniaNeural';

// === SPEECH-TO-TEXT (Voice Input) ===
const micConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, micConfig);

recognizer.recognized = (s, e) => {
  if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
    store.dispatch({ type: 'WEB_CHAT/SEND_MESSAGE', payload: { text: e.result.text } });
  }
};
recognizer.startContinuousRecognitionAsync();

// === TEXT-TO-SPEECH (Voice Output) ===
const speakerConfig = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput();
const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, speakerConfig);

// Speak bot responses (in store middleware)
if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
  const activity = action.payload?.activity;
  if (activity?.type === 'message' && activity?.from?.role === 'bot') {
    synthesizer.speakTextAsync(activity.text);
  }
}`;

// ============================================================================
// COMPONENT
// ============================================================================

export default function VoiceCustomSDKDemo() {
  const styles = useStyles();
  const [directLine, setDirectLine] = useState<ReturnType<typeof createDirectLine> | null>(null);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'ready' | 'error'>('idle');
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'speaking'>('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [isVoiceReady, setIsVoiceReady] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const isConnecting = useRef(false);
  const recognizerRef = useRef<SpeechSDK.SpeechRecognizer | null>(null);
  const synthesizerRef = useRef<SpeechSDK.SpeechSynthesizer | null>(null);
  const storeRef = useRef<ReturnType<typeof createStore> | null>(null);
  const ttsEnabledRef = useRef(true);
  const setIsSpeakingRef = useRef<(value: boolean) => void>(() => {});

  // Keep refs in sync with state
  useEffect(() => {
    ttsEnabledRef.current = ttsEnabled;
  }, [ttsEnabled]);

  useEffect(() => {
    setIsSpeakingRef.current = setIsSpeaking;
  }, []);

  const isConfigured = Boolean(TOKEN_ENDPOINT && SPEECH_KEY && SPEECH_REGION);

  // Speak text using TTS
  const speakText = useCallback((text: string) => {
    if (!synthesizerRef.current || !ttsEnabledRef.current) {
      console.log('[CustomSDK] TTS skipped - synthesizer:', !!synthesizerRef.current, 'enabled:', ttsEnabledRef.current);
      return;
    }

    console.log('[CustomSDK] Speaking:', text.substring(0, 100) + '...');
    setIsSpeakingRef.current(true);

    synthesizerRef.current.speakTextAsync(
      text,
      (result) => {
        if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
          console.log('[CustomSDK] TTS completed');
        } else {
          console.error('[CustomSDK] TTS failed:', result.errorDetails);
        }
        setIsSpeakingRef.current(false);
      },
      (err) => {
        console.error('[CustomSDK] TTS error:', err);
        setIsSpeakingRef.current(false);
      }
    );
  }, []);

  // Create store with middleware to intercept bot messages for TTS
  const store = useMemo(() => {
    const s = createStore({}, () => (next: (action: unknown) => unknown) => (action: unknown) => {
      // Type guard for action
      const typedAction = action as { type?: string; payload?: { activity?: { type?: string; from?: { role?: string }; text?: string; speak?: string } } };
      
      // Intercept incoming bot messages for TTS
      if (typedAction.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
        const activity = typedAction.payload?.activity;
        if (activity?.type === 'message' && activity?.from?.role === 'bot') {
          // Use speak property if available, otherwise use text
          const textToSpeak = activity.speak || activity.text;
          if (textToSpeak && ttsEnabledRef.current && synthesizerRef.current) {
            // Strip markdown/HTML for cleaner speech
            const cleanText = textToSpeak
              .replace(/\*\*([^*]+)\*\*/g, '$1')  // Bold
              .replace(/\*([^*]+)\*/g, '$1')      // Italic
              .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // Links
              .replace(/<[^>]+>/g, '')            // HTML tags
              .trim();
            
            if (cleanText) {
              console.log('[CustomSDK] Bot message detected, speaking:', cleanText.substring(0, 50));
              speakText(cleanText);
            }
          }
        }
      }
      
      return next(action);
    });
    storeRef.current = s;
    return s;
  }, [speakText]);

  // Initialize Speech SDK
  const initializeSpeech = useCallback(async () => {
    if (!SPEECH_KEY || !SPEECH_REGION) {
      console.error('[CustomSDK] Speech key or region not configured');
      return;
    }

    try {
      console.log('[CustomSDK] Getting Speech auth token...');
      
      // Get authorization token for browser usage
      const tokenResponse = await fetch(
        `https://${SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
        {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': SPEECH_KEY,
          },
        }
      );
      
      if (!tokenResponse.ok) {
        throw new Error('Failed to get Speech authorization token');
      }
      
      const authToken = await tokenResponse.text();
      console.log('[CustomSDK] Auth token received, length:', authToken.length);

      // Use auth token instead of subscription key
      const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(authToken, SPEECH_REGION);
      
      // IMPORTANT: Set language BEFORE creating recognizer
      speechConfig.speechRecognitionLanguage = 'en-GB';
      speechConfig.speechSynthesisLanguage = 'en-GB';
      speechConfig.speechSynthesisVoiceName = 'en-GB-SoniaNeural';
      
      console.log('[CustomSDK] SpeechConfig created with region:', SPEECH_REGION, 'language: en-GB');

      // Test microphone audio levels before creating recognizer
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        // Check audio level for 2 seconds
        let maxLevel = 0;
        const checkLevel = () => {
          analyser.getByteFrequencyData(dataArray);
          const level = Math.max(...dataArray);
          if (level > maxLevel) maxLevel = level;
        };
        
        const interval = setInterval(checkLevel, 100);
        await new Promise(resolve => setTimeout(resolve, 2000));
        clearInterval(interval);
        
        console.log('[CustomSDK] 🎤 Microphone test - max audio level:', maxLevel, '(should be > 0 if mic is working)');
        if (maxLevel < 10) {
          console.warn('[CustomSDK] ⚠️ Audio level very low - check microphone selection');
        }
        
        // Cleanup test
        stream.getTracks().forEach(t => t.stop());
        await audioContext.close();
      } catch (micErr) {
        console.error('[CustomSDK] Microphone test failed:', micErr);
      }

      // Recognizer - use default mic
      const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
      console.log('[CustomSDK] AudioConfig created');
      
      const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
      console.log('[CustomSDK] Recognizer created');

      recognizer.recognized = (_s, e) => {
        const reasonName = SpeechSDK.ResultReason[e.result.reason];
        console.log('[CustomSDK] Recognized event - reason:', reasonName, 'text:', JSON.stringify(e.result.text));
        
        if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
          const text = e.result.text?.trim();
          console.log('[CustomSDK] RecognizedSpeech - text:', JSON.stringify(text), 'storeRef:', !!storeRef.current);
          
          if (text && storeRef.current) {
            setTranscript(text);
            console.log('[CustomSDK] Dispatching WEB_CHAT/SEND_MESSAGE with text:', text);
            storeRef.current.dispatch({
              type: 'WEB_CHAT/SEND_MESSAGE',
              payload: { text },
            });
            console.log('[CustomSDK] Message dispatched successfully');
          } else {
            console.warn('[CustomSDK] Not dispatching - text empty or store not ready');
          }
        } else if (e.result.reason === SpeechSDK.ResultReason.NoMatch) {
          console.log('[CustomSDK] NoMatch - speech could not be recognized');
        }
      };

      recognizer.recognizing = (_s, e) => {
        console.log('[CustomSDK] Recognizing:', e.result.text);
        setTranscript(e.result.text);
      };

      recognizer.canceled = (_s, e) => {
        console.log('[CustomSDK] Canceled:', e.reason, e.errorDetails);
        setVoiceStatus('idle');
      };
      
      recognizer.sessionStopped = () => {
        console.log('[CustomSDK] Session stopped');
        setVoiceStatus('idle');
      };

      recognizerRef.current = recognizer;

      // Synthesizer
      const synthAudioConfig = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput();
      const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, synthAudioConfig);
      synthesizerRef.current = synthesizer;

      setIsVoiceReady(true);
      console.log('[CustomSDK] Speech services initialized successfully');
    } catch (err) {
      console.error('[CustomSDK] Failed to initialize speech:', err);
      setIsVoiceReady(false);
    }
  }, []);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (synthesizerRef.current) {
      console.log('[CustomSDK] Stopping speech...');
      // Cancel any ongoing synthesis by closing and reinitializing
      // Note: The SDK doesn't have a direct cancel method, so we just let it finish
      setIsSpeaking(false);
    }
  }, []);

  // Toggle listening - use recognizeOnceAsync for more reliable single recognition
  const toggleListening = useCallback(() => {
    console.log('[CustomSDK] toggleListening called, voiceStatus:', voiceStatus, 'recognizer:', !!recognizerRef.current);
    
    if (!recognizerRef.current) {
      console.error('[CustomSDK] Recognizer not initialized');
      return;
    }

    if (voiceStatus === 'listening') {
      console.log('[CustomSDK] Stopping recognition...');
      recognizerRef.current.stopContinuousRecognitionAsync(
        () => {
          console.log('[CustomSDK] Recognition stopped');
          setVoiceStatus('idle');
        },
        (err) => {
          console.error('[CustomSDK] Stop error:', err);
          setVoiceStatus('idle');
        }
      );
    } else {
      console.log('[CustomSDK] Starting single recognition (recognizeOnceAsync)...');
      setTranscript('Listening...');
      setVoiceStatus('listening');
      
      // Use recognizeOnceAsync for simpler, more reliable single-shot recognition
      recognizerRef.current.recognizeOnceAsync(
        (result) => {
          console.log('[CustomSDK] recognizeOnceAsync result:', result.reason, SpeechSDK.ResultReason[result.reason]);
          console.log('[CustomSDK] Result text:', JSON.stringify(result.text));
          console.log('[CustomSDK] Result errorDetails:', result.errorDetails);
          
          if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
            const text = result.text?.trim();
            if (text && storeRef.current) {
              setTranscript(text);
              console.log('[CustomSDK] Dispatching message:', text);
              storeRef.current.dispatch({
                type: 'WEB_CHAT/SEND_MESSAGE',
                payload: { text },
              });
            } else {
              setTranscript('(No speech detected)');
              console.warn('[CustomSDK] Empty text in RecognizedSpeech');
            }
          } else if (result.reason === SpeechSDK.ResultReason.NoMatch) {
            setTranscript('(Could not understand)');
            console.log('[CustomSDK] NoMatch - speech not recognized');
          } else if (result.reason === SpeechSDK.ResultReason.Canceled) {
            const cancellation = SpeechSDK.CancellationDetails.fromResult(result);
            console.error('[CustomSDK] Canceled:', cancellation.reason, cancellation.errorDetails);
            setTranscript(`Error: ${cancellation.errorDetails || 'Recognition canceled'}`);
          }
          
          setVoiceStatus('idle');
        },
        (err) => {
          console.error('[CustomSDK] recognizeOnceAsync error:', err);
          setTranscript('Error: ' + err);
          setVoiceStatus('idle');
        }
      );
    }
  }, [voiceStatus]);

  // Initialize connection
  const initialize = useCallback(async () => {
    if (!isConfigured || isConnecting.current) return;

    isConnecting.current = true;
    setStatus('connecting');
    setError('');

    try {
      const response = await fetch(TOKEN_ENDPOINT);
      if (!response.ok) throw new Error('Failed to get token');
      const { token } = await response.json();

      const dl = createDirectLine({ token });
      setDirectLine(dl);
      setStatus('ready');
      initializeSpeech();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setStatus('error');
    } finally {
      isConnecting.current = false;
    }
  }, [isConfigured, initializeSpeech]);

  useEffect(() => {
    if (status === 'idle' && isConfigured) {
      initialize();
    }
    return () => {
      recognizerRef.current?.close();
      synthesizerRef.current?.close();
    };
  }, [status, isConfigured, initialize]);

  const restart = () => {
    recognizerRef.current?.close();
    synthesizerRef.current?.close();
    setDirectLine(null);
    setIsVoiceReady(false);
    setVoiceStatus('idle');
    setStatus('idle');
  };

  return (
    <div className={styles.container}>
      <Title2>
        <Code24Regular style={{ marginRight: '8px', verticalAlign: 'middle', color: '#5c2d91' }} />
        Custom Speech SDK Demo
      </Title2>

      {/* Info Section */}
      <div className={styles.infoSection}>
        <Text weight="semibold" size={400}>Full Control Approach</Text>
        <Body1 style={{ marginTop: tokens.spacingVerticalS }}>
          This demo manually integrates Azure Speech SDK, giving you complete control over the voice UI and behavior.
          You can customize the microphone button, transcript display, and voice feedback.
        </Body1>
        <div className={styles.featureList}>
          <div className={styles.featureItem}>
            <Mic24Regular style={{ color: '#5c2d91' }} />
            <Text>Custom mic button</Text>
          </div>
          <div className={styles.featureItem}>
            <Speaker224Regular style={{ color: '#5c2d91' }} />
            <Text>Manual TTS control</Text>
          </div>
          <div className={styles.featureItem}>
            <Code24Regular style={{ color: '#5c2d91' }} />
            <Text>Full UI customization</Text>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <Card>
        <Text weight="semibold" size={400}>Implementation Code</Text>
        <CodeBlockWithModal code={implementationCode} title="Custom Speech SDK Implementation" language="tsx">
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
            Set the following environment variables in your <code>.env</code> file.
          </Body1>
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
              {status === 'ready' ? 'Connected' : status === 'connecting' ? 'Connecting...' : 'Error'}
            </Badge>
            <Badge appearance="outline" color={isVoiceReady ? 'success' : 'warning'}>
              Voice: {isVoiceReady ? 'Ready' : 'Initializing'}
            </Badge>
            <div style={{ marginLeft: 'auto' }}>
              <Button appearance="subtle" icon={<ArrowSync24Regular />} onClick={restart}>
                Restart
              </Button>
            </div>
          </div>

          {/* Custom Voice Controls */}
          {status === 'ready' && (
            <div className={styles.voiceControls}>
              {/* Mic Button */}
              <Tooltip content={voiceStatus === 'listening' ? 'Stop listening' : 'Start speaking'} relationship="label">
                <Button
                  appearance="primary"
                  icon={voiceStatus === 'listening' ? <MicOff24Regular /> : <Mic24Regular />}
                  className={`${styles.micButton} ${voiceStatus === 'listening' ? styles.micButtonListening : ''}`}
                  onClick={toggleListening}
                  disabled={!isVoiceReady}
                  style={voiceStatus === 'listening' ? { backgroundColor: '#d32f2f' } : {}}
                />
              </Tooltip>

              {/* Status Text */}
              <div style={{ flex: 1 }}>
                {voiceStatus === 'idle' && isVoiceReady && !isSpeaking && (
                  <Text>Click the microphone to speak</Text>
                )}
                {voiceStatus === 'listening' && (
                  <Text className={styles.transcript}>
                    {transcript || 'Listening...'}
                  </Text>
                )}
                {isSpeaking && (
                  <Text style={{ color: '#5c2d91', fontWeight: 500 }}>
                    🔊 Speaking response...
                  </Text>
                )}
              </div>

              {/* TTS Toggle */}
              <Tooltip content={ttsEnabled ? 'Disable voice output' : 'Enable voice output'} relationship="label">
                <Button
                  appearance={ttsEnabled ? 'primary' : 'secondary'}
                  icon={ttsEnabled ? <Speaker224Regular /> : <SpeakerOff24Regular />}
                  onClick={() => {
                    setTtsEnabled(!ttsEnabled);
                    if (isSpeaking) stopSpeaking();
                  }}
                  disabled={!isVoiceReady}
                  style={{
                    backgroundColor: ttsEnabled ? '#5c2d91' : undefined,
                  }}
                >
                  {ttsEnabled ? 'TTS On' : 'TTS Off'}
                </Button>
              </Tooltip>
            </div>
          )}

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

            {status === 'ready' && directLine && (
              <ReactWebChat
                directLine={directLine}
                store={store}
                styleOptions={{
                  bubbleBackground: '#ffffff',
                  bubbleFromUserBackground: '#ede7f6',
                  hideUploadButton: true,
                }}
              />
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
