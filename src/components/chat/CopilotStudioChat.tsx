/**
 * Copilot Studio Chat Widget - Anonymous Access via Token Endpoint
 * 
 * This component uses the Token Endpoint approach documented at:
 * https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-connect-bot-to-custom-application
 * 
 * The Token Endpoint provides anonymous access - no Azure AD login required.
 * Simply GET the endpoint to receive a DirectLine token.
 * 
 * Uses FluentThemeProvider with Compose + BasicWebChat for maximum customization.
 * 
 * VOICE SUPPORT:
 * Uses Direct Line Speech channel for voice-based interactions.
 * Requires Azure Speech Services resource and configuration.
 * See: https://learn.microsoft.com/en-us/azure/bot-service/directline-speech-bot
 */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import ReactWebChat, { createDirectLine, createStore } from 'botframework-webchat';
import { FluentThemeProvider } from 'botframework-webchat-fluent-theme';
import {
  makeStyles,
  shorthands,
  tokens,
  Button,
  Text,
  Spinner,
  mergeClasses,
  Tooltip,
  Badge,
} from '@fluentui/react-components';
import {
  Chat24Filled,
  Dismiss24Regular,
  ArrowSync24Regular,
  Bot24Regular,
  Info16Regular,
  Mic24Regular,
  MicOff24Regular,
  Speaker224Regular,
} from '@fluentui/react-icons';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

// ============================================================================
// CONFIGURATION
// ============================================================================

// Token Endpoint from Copilot Studio > Channels > Mobile app
// This is the documented anonymous access method
const TOKEN_ENDPOINT = import.meta.env.VITE_COPILOT_TOKEN_ENDPOINT || '';

// Bot name for display
const BOT_NAME = import.meta.env.VITE_BOT_NAME || 'Citizen Advice';

// Speech Services configuration (optional for voice support)
const SPEECH_REGION = import.meta.env.VITE_SPEECH_REGION || '';
const SPEECH_KEY = import.meta.env.VITE_SPEECH_KEY || '';

// ============================================================================
// STYLES - GOV.UK Design System inspired
// ============================================================================

const useStyles = makeStyles({
  container: {
    position: 'fixed',
    bottom: tokens.spacingVerticalXL,
    right: tokens.spacingHorizontalXL,
    zIndex: 1000,
  },
  toggleButton: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#0d5c63', // Deep Teal
    color: 'white',
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    ...shorthands.border('none'),
    ':hover': {
      backgroundColor: '#0a4045', // Darker Teal
      transform: 'scale(1.05)',
    },
    ':active': {
      transform: 'scale(0.98)',
    },
    transitionProperty: 'all',
    transitionDuration: '0.2s',
    transitionTimingFunction: 'ease',
  },
  chatWindow: {
    position: 'absolute',
    bottom: '80px',
    right: '0',
    width: '420px',
    height: '620px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    borderRadius: '16px',
    overflow: 'hidden',
    backgroundColor: 'white',
    ...shorthands.border('1px', 'solid', '#e0e0e0'),
    '@media (max-width: 480px)': {
      width: 'calc(100vw - 32px)',
      height: 'calc(100vh - 120px)',
      right: '-8px',
      borderRadius: '12px',
    },
  },
  // Header - GOV.UK inspired gradient
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: tokens.spacingVerticalM,
    paddingBottom: tokens.spacingVerticalM,
    paddingLeft: tokens.spacingHorizontalL,
    paddingRight: tokens.spacingHorizontalL,
    background: 'linear-gradient(135deg, #0d5c63 0%, #0a4045 100%)',
    color: 'white',
    minHeight: '64px',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  botAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  headerTitle: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase400,
    color: 'white',
  },
  headerStatus: {
    fontSize: tokens.fontSizeBase200,
    color: 'rgba(255,255,255,0.85)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#00703c', // GOV.UK Green
    animationName: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 },
    },
    animationDuration: '2s',
    animationIterationCount: 'infinite',
  },
  headerActions: {
    display: 'flex',
    gap: tokens.spacingHorizontalXS,
  },
  headerButton: {
    color: 'white',
    minWidth: 'auto',
    ...shorthands.padding(tokens.spacingHorizontalS),
    borderRadius: tokens.borderRadiusCircular,
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.15)',
    },
  },
  // Voice controls
  voiceControls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalS,
    ...shorthands.padding(tokens.spacingVerticalS),
    backgroundColor: '#f3f4f5',
    borderBottom: '1px solid #e0e0e0',
  },
  micButton: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#0d5c63',
    color: 'white',
    ':hover': {
      backgroundColor: '#0a4045',
    },
  },
  micButtonActive: {
    backgroundColor: '#d4351c',
    animationName: {
      '0%, 100%': { transform: 'scale(1)' },
      '50%': { transform: 'scale(1.1)' },
    },
    animationDuration: '1s',
    animationIterationCount: 'infinite',
    ':hover': {
      backgroundColor: '#b02a17',
    },
  },
  voiceStatus: {
    fontSize: tokens.fontSizeBase200,
    color: '#505a5f',
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  voiceConfigBanner: {
    backgroundColor: '#fff7e6',
    borderLeft: '4px solid #f47738',
    ...shorthands.padding(tokens.spacingHorizontalS, tokens.spacingHorizontalM),
    fontSize: tokens.fontSizeBase200,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  // Chat area
  chatBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
  },
  // Welcome banner
  welcomeBanner: {
    backgroundColor: '#e8f4fd',
    borderLeft: '4px solid #0d5c63',
    ...shorthands.padding(tokens.spacingHorizontalM),
    ...shorthands.margin(tokens.spacingHorizontalM),
    marginBottom: '0',
    borderRadius: '0 8px 8px 0',
  },
  welcomeTitle: {
    fontWeight: tokens.fontWeightSemibold,
    color: '#0b0c0c',
    marginBottom: tokens.spacingVerticalXS,
  },
  welcomeText: {
    fontSize: tokens.fontSizeBase200,
    color: '#505a5f',
    lineHeight: '1.5',
  },
  // Status containers
  centeredContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: tokens.spacingVerticalM,
    ...shorthands.padding(tokens.spacingHorizontalL),
    textAlign: 'center',
  },
  configWarning: {
    backgroundColor: '#fff7e6',
    borderLeft: '4px solid #f47738', // GOV.UK Orange
    ...shorthands.padding(tokens.spacingHorizontalM),
    borderRadius: '0 8px 8px 0',
    maxWidth: '300px',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderLeft: '4px solid #d4351c', // GOV.UK Red
    ...shorthands.padding(tokens.spacingHorizontalL),
    borderRadius: '0 8px 8px 0',
    maxWidth: '300px',
  },
  // Fluent WebChat wrapper
  webChatWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  // Branding footer
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalXS,
    ...shorthands.padding(tokens.spacingVerticalXS),
    backgroundColor: '#f3f4f5',
    borderTop: '1px solid #e0e0e0',
  },
  footerText: {
    fontSize: '11px',
    color: '#6f777b',
  },
});

// ============================================================================
// FLUENT THEME CUSTOMIZATION
// ============================================================================

// Custom theme for GOV.UK styling
const govUkFluentTheme = {
  // Primary accent color
  accent: '#0d5c63',
  // Bot avatar
  botAvatarBackgroundColor: '#0d5c63',
  botAvatarInitials: 'CA',
  // User avatar
  userAvatarBackgroundColor: '#00703c',
  userAvatarInitials: 'You',
  // Message bubbles
  bubbleBackground: '#ffffff',
  bubbleBorderRadius: 12,
  bubbleFromUserBackground: '#e8f4fd',
  bubbleFromUserBorderRadius: 12,
  bubbleBorderColor: '#e0e0e0',
  // Send box
  sendBoxBackground: '#ffffff',
  sendBoxBorderTop: '1px solid #e0e0e0',
  sendBoxButtonColor: '#0d5c63',
  sendBoxButtonColorOnHover: '#0a4045',
  sendBoxPlaceholderColor: '#6f777b',
  // Suggested actions - GOV.UK button style
  suggestedActionLayout: 'flow' as const,
  suggestedActionBackground: '#ffffff',
  suggestedActionBorderColor: '#0d5c63',
  suggestedActionBorderRadius: 4,
  suggestedActionTextColor: '#0d5c63',
  suggestedActionDisabledBackground: '#f3f4f5',
  // Typography
  fontSizeSmall: '14px',
  primaryFont: '"GDS Transport", Arial, sans-serif',
  // Timestamps
  timestampColor: '#6f777b',
  // Hide upload button for citizen advice (text-only)
  hideUploadButton: true,
};

// ============================================================================
// TYPES
// ============================================================================

type ChatStatus = 'idle' | 'connecting' | 'ready' | 'error' | 'config-error';
type VoiceStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

interface WelcomeBannerProps {
  className?: string;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Welcome banner shown above the chat
 */
function WelcomeBanner({ className }: WelcomeBannerProps) {
  const styles = useStyles();
  return (
    <div className={mergeClasses(styles.welcomeBanner, className)}>
      <Text className={styles.welcomeTitle}>Welcome to Citizen Advice! </Text>
      <Text className={styles.welcomeText}>
        Ask me anything about benefits, housing, employment rights, consumer issues, or other civic matters. 
        I'm here to help you find the information you need.
      </Text>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CopilotStudioChat() {
  const styles = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [error, setError] = useState<string>('');
  const [directLine, setDirectLine] = useState<ReturnType<typeof createDirectLine> | null>(null);
  const isConnecting = useRef(false);
  
  // Voice state
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const recognizerRef = useRef<SpeechSDK.SpeechRecognizer | null>(null);
  const synthesizerRef = useRef<SpeechSDK.SpeechSynthesizer | null>(null);
  const storeRef = useRef<ReturnType<typeof createStore> | null>(null);

  // Check if Token Endpoint is configured
  const isConfigured = Boolean(TOKEN_ENDPOINT);
  
  // Check if Speech Services are configured
  const isVoiceConfigured = Boolean(SPEECH_REGION && SPEECH_KEY);

  // Initialize Speech Services
  const initializeSpeech = useCallback(() => {
    if (!isVoiceConfigured) return;
    
    try {
      const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(SPEECH_KEY, SPEECH_REGION);
      speechConfig.speechRecognitionLanguage = 'en-GB';
      speechConfig.speechSynthesisLanguage = 'en-GB';
      speechConfig.speechSynthesisVoiceName = 'en-GB-SoniaNeural'; // British English voice
      
      const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
      
      // Set up recognizer events
      recognizer.recognized = (_s, e) => {
        if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
          const text = e.result.text?.trim();
          console.log('[Voice] Recognized:', text);
          if (text) {
            setTranscript(text);
            // Send the recognized text to the chat using the storeRef
            if (storeRef.current) {
              console.log('[Voice] Dispatching message to WebChat:', text);
              storeRef.current.dispatch({
                type: 'WEB_CHAT/SEND_MESSAGE',
                payload: { text }
              });
            } else {
              console.warn('[Voice] Store not available, cannot send message');
            }
          }
        }
      };
      
      recognizer.recognizing = (_s, e) => {
        console.log('[Voice] Recognizing:', e.result.text);
        setTranscript(e.result.text);
      };
      
      recognizer.canceled = (_s, e) => {
        console.log('[Voice] Canceled:', e.reason);
        setVoiceStatus('idle');
      };
      
      recognizer.sessionStopped = () => {
        console.log('[Voice] Session stopped');
        setVoiceStatus('idle');
      };
      
      recognizerRef.current = recognizer;
      
      // Set up synthesizer for text-to-speech responses
      const synthAudioConfig = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput();
      const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, synthAudioConfig);
      synthesizerRef.current = synthesizer;
      
      setIsVoiceEnabled(true);
      console.log('[Voice] Speech services initialized');
    } catch (err) {
      console.error('[Voice] Failed to initialize:', err);
      setIsVoiceEnabled(false);
    }
  }, [isVoiceConfigured]);

  // Start/stop listening
  const toggleListening = useCallback(async () => {
    if (!recognizerRef.current) return;
    
    if (voiceStatus === 'listening') {
      // Stop listening
      recognizerRef.current.stopContinuousRecognitionAsync(
        () => {
          console.log('[Voice] Stopped listening');
          setVoiceStatus('idle');
        },
        (err) => {
          console.error('[Voice] Error stopping:', err);
          setVoiceStatus('error');
        }
      );
    } else {
      // Start listening
      setTranscript('');
      recognizerRef.current.startContinuousRecognitionAsync(
        () => {
          console.log('[Voice] Started listening');
          setVoiceStatus('listening');
        },
        (err) => {
          console.error('[Voice] Error starting:', err);
          setVoiceStatus('error');
        }
      );
    }
  }, [voiceStatus]);

  // Speak text (text-to-speech)
  const speakText = useCallback((text: string) => {
    if (!synthesizerRef.current || !isVoiceEnabled) return;
    
    setVoiceStatus('speaking');
    synthesizerRef.current.speakTextAsync(
      text,
      (result) => {
        if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
          console.log('[Voice] Finished speaking');
        }
        setVoiceStatus('idle');
      },
      (err) => {
        console.error('[Voice] TTS error:', err);
        setVoiceStatus('idle');
      }
    );
  }, [isVoiceEnabled]);

  // Cleanup speech resources
  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.close();
      }
      if (synthesizerRef.current) {
        synthesizerRef.current.close();
      }
    };
  }, []);

  // Initialize speech when chat opens
  useEffect(() => {
    if (isOpen && isVoiceConfigured && !isVoiceEnabled) {
      initializeSpeech();
    }
  }, [isOpen, isVoiceConfigured, isVoiceEnabled, initializeSpeech]);

  // Create Redux store for WebChat with logging middleware
  const store = useMemo(
    () => {
      const s = createStore({}, () => (next: (action: { type: string; payload?: { activity?: { type?: string } } }) => unknown) => (action: { type: string; payload?: { activity?: { type?: string } } }) => {
        // Debug logging
        if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
          console.log('[WebChat] DirectLine connected');
        }
        if (action.type === 'DIRECT_LINE/DISCONNECT') {
          console.log('[WebChat] DirectLine disconnected');
        }
        if (action.type === 'DIRECT_LINE/POST_ACTIVITY') {
          console.log('[WebChat] Sending:', action.payload?.activity?.type);
        }
        if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
          console.log('[WebChat] Received:', action.payload?.activity?.type);
        }
        return next(action);
      });
      // Store reference for speech callbacks
      storeRef.current = s;
      return s;
    },
    []
  );

  /**
   * Initialize chat using Token Endpoint (Anonymous Access)
   * 
   * This follows the documented approach at:
   * https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-connect-bot-to-custom-application#get-direct-line-token
   * 
   * Simply GET the token endpoint to receive a DirectLine token - no auth required!
   */
  const initializeChat = useCallback(async () => {
    if (!isConfigured || isConnecting.current) return;

    isConnecting.current = true;
    setStatus('connecting');
    setError('');

    try {
      console.log('[Chat] Fetching token from endpoint...');
      
      // Simple GET request to Token Endpoint - this is the anonymous access method
      const response = await fetch(TOKEN_ENDPOINT);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Chat] Token fetch failed:', response.status, errorText);
        throw new Error(`Failed to get token: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[Chat] Token received:', {
        hasToken: !!data.token,
        conversationId: data.conversationId,
        expiresIn: data.expires_in
      });

      if (!data.token) {
        throw new Error('No token in response');
      }

      // Create DirectLine connection with the token
      const dl = createDirectLine({ 
        token: data.token,
      });

      // Subscribe to connection status
      dl.connectionStatus$.subscribe({
        next: (connectionStatus: number) => {
          const statusNames = ['Uninitialized', 'Connecting', 'Connected', 'FailedToConnect', 'Ended'];
          console.log('[DirectLine] Status:', statusNames[connectionStatus] || connectionStatus);
          
          if (connectionStatus === 2) { // Connected
            setStatus('ready');
          } else if (connectionStatus === 3) { // FailedToConnect
            setError('Failed to connect to chat service');
            setStatus('error');
          }
        },
        error: (err: Error) => {
          console.error('[DirectLine] Connection error:', err);
          setError(err.message);
          setStatus('error');
        }
      });

      // Subscribe to activities for debugging and text-to-speech
      dl.activity$.subscribe({
        next: (activity: { type?: string; from?: { role?: string }; text?: string }) => {
          console.log('[DirectLine] Activity:', activity);
          // Auto-speak bot messages when voice is enabled
          if (activity.type === 'message' && activity.from?.role === 'bot' && activity.text) {
            // speakText will be called if voice is enabled
            if (isVoiceEnabled && voiceStatus === 'idle') {
              speakText(activity.text);
            }
          }
        },
        error: (err: Error) => {
          console.error('[DirectLine] Activity error:', err);
        }
      });

      setDirectLine(dl);
      console.log('[Chat] DirectLine initialized');
      
    } catch (err) {
      console.error('[Chat] Initialization failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setStatus('error');
    } finally {
      isConnecting.current = false;
    }
  }, [isConfigured, isVoiceEnabled, voiceStatus, speakText]);

  /**
   * Restart conversation with fresh token
   */
  const restartConversation = useCallback(() => {
    console.log('[Chat] Restarting conversation...');
    setDirectLine(null);
    setStatus('idle');
    setTimeout(() => initializeChat(), 100);
  }, [initializeChat]);

  // Initialize when chat is opened
  useEffect(() => {
    if (isOpen && status === 'idle' && isConfigured) {
      initializeChat();
    }
  }, [isOpen, status, isConfigured, initializeChat]);

  const toggleChat = () => setIsOpen(!isOpen);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={styles.container}>
      {/* Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <div className={styles.botAvatar}>
                <Bot24Regular />
              </div>
              <div className={styles.headerTextContainer}>
                <Text className={styles.headerTitle}>{BOT_NAME}</Text>
                <div className={styles.headerStatus}>
                  {status === 'ready' && (
                    <>
                      <span className={styles.statusDot} />
                      Online
                    </>
                  )}
                  {status === 'connecting' && 'Connecting...'}
                  {status === 'idle' && 'Ready to help'}
                  {status === 'error' && 'Offline'}
                </div>
              </div>
            </div>
            <div className={styles.headerActions}>
              {status === 'ready' && (
                <Button
                  appearance="subtle"
                  icon={<ArrowSync24Regular />}
                  className={styles.headerButton}
                  onClick={restartConversation}
                  title="New conversation"
                />
              )}
              <Button
                appearance="subtle"
                icon={<Dismiss24Regular />}
                className={styles.headerButton}
                onClick={toggleChat}
                title="Close"
              />
            </div>
          </div>

          {/* Chat Body */}
          <div className={styles.chatBody}>
            {/* Not Configured */}
            {!isConfigured && (
              <div className={styles.centeredContainer}>
                <div className={styles.configWarning}>
                  <Text weight="semibold">Configuration Required</Text>
                  <Text size={200} block style={{ marginTop: '8px' }}>
                    Set <code>VITE_COPILOT_TOKEN_ENDPOINT</code> in your .env file.
                  </Text>
                  <Text size={100} block style={{ marginTop: '8px', color: '#6f777b' }}>
                    Get this from Copilot Studio → Channels → Mobile app → Token Endpoint
                  </Text>
                </div>
              </div>
            )}

            {/* Connecting */}
            {status === 'connecting' && (
              <div className={styles.centeredContainer}>
                <Spinner size="large" label="Connecting..." />
              </div>
            )}

            {/* Error */}
            {status === 'error' && (
              <div className={styles.centeredContainer}>
                <div className={styles.errorContainer}>
                  <Text weight="semibold" style={{ color: '#d4351c' }}>
                    Connection Error
                  </Text>
                  <Text size={200} block style={{ marginTop: '8px' }}>
                    {error}
                  </Text>
                  <Button 
                    appearance="primary" 
                    onClick={initializeChat}
                    style={{ marginTop: '12px' }}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            {/* Ready - FluentThemeProvider wraps ReactWebChat */}
            {status === 'ready' && directLine && (
              <div className={styles.webChatWrapper}>
                <WelcomeBanner />
                
                {/* Voice Controls */}
                {isVoiceConfigured && (
                  <div className={styles.voiceControls}>
                    <Tooltip 
                      content={voiceStatus === 'listening' ? 'Click to stop listening' : 'Click to speak'} 
                      relationship="label"
                    >
                      <Button
                        appearance="primary"
                        icon={voiceStatus === 'listening' ? <MicOff24Regular /> : <Mic24Regular />}
                        className={mergeClasses(
                          styles.micButton,
                          voiceStatus === 'listening' && styles.micButtonActive
                        )}
                        onClick={toggleListening}
                        disabled={!isVoiceEnabled}
                      />
                    </Tooltip>
                    <div className={styles.voiceStatus}>
                      {voiceStatus === 'idle' && isVoiceEnabled && (
                        <>
                          <Speaker224Regular />
                          <Text size={200}>Voice enabled - Click mic to speak</Text>
                        </>
                      )}
                      {voiceStatus === 'listening' && (
                        <>
                          <Badge appearance="filled" color="danger" size="small" />
                          <Text size={200}>{transcript || 'Listening...'}</Text>
                        </>
                      )}
                      {voiceStatus === 'speaking' && (
                        <Text size={200}>Speaking...</Text>
                      )}
                      {!isVoiceEnabled && (
                        <Text size={200} style={{ color: '#6f777b' }}>Voice initializing...</Text>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Voice not configured banner */}
                {!isVoiceConfigured && (
                  <div className={styles.voiceConfigBanner}>
                    <Mic24Regular style={{ color: '#f47738' }} />
                    <Text size={200}>
                      Voice disabled. Set <code>VITE_SPEECH_KEY</code> and <code>VITE_SPEECH_REGION</code> to enable.
                    </Text>
                  </div>
                )}
                
                <FluentThemeProvider>
                  <ReactWebChat
                    directLine={directLine}
                    store={store}
                    styleOptions={govUkFluentTheme}
                    locale="en-GB"
                  />
                </FluentThemeProvider>
              </div>
            )}
          </div>

          {/* Footer with branding */}
          <div className={styles.footer}>
            <Info16Regular style={{ color: '#6f777b', fontSize: '12px' }} />
            <Text className={styles.footerText}>
              Powered by Microsoft Copilot Studio
            </Text>
          </div>
        </div>
      )}

      {/* Toggle FAB Button */}
      <Button
        appearance="primary"
        icon={isOpen ? <Dismiss24Regular /> : <Chat24Filled />}
        className={styles.toggleButton}
        onClick={toggleChat}
        title={isOpen ? 'Close chat' : 'Chat with Citizen Advice'}
      />
    </div>
  );
}

export default CopilotStudioChat;
