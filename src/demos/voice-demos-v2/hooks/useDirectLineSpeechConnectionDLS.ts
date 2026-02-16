/**
 * useDirectLineSpeechConnectionDLS Hook (Tab 3: True Direct Line Speech)
 * ======================================================================
 * Created: Feb 6, 2026
 * Updated: Feb 7, 2026 — Fixed silent connection failure
 *
 * Custom React hook for TRUE Direct Line Speech (DLS) connections.
 *
 * Architecture: Browser → DLS WebSocket → Azure Speech → Bot Service → Proxy Bot → Copilot Studio
 *
 * This is fundamentally different from Tabs 1 & 2:
 * - Single WebSocket handles BOTH audio streaming and bot messaging
 * - Speech recognition happens SERVER-SIDE (lower latency)
 * - Native barge-in support at the channel level
 * - Uses `botframework-directlinespeech-sdk` (not `web-speech-cognitive-services`)
 *
 * CRITICAL IMPLEMENTATION NOTE (Feb 7, 2026):
 * ============================================
 * MUST use `createDirectLineSpeechAdapters` from 'botframework-webchat' (the bundle wrapper),
 * NOT `createAdapters` from 'botframework-directlinespeech-sdk' (the raw SDK).
 *
 * The Web Chat bundle wrapper adds essential browser-specific setup:
 * 1. Creates AudioConfig via createMicrophoneAudioConfigAndAudioContext (Web Audio API)
 * 2. Handles microphone permission gracefully (warns but continues for text-only)
 * 3. Sets up AudioContext for proper browser audio pipeline
 *
 * Without this wrapper, the raw SDK calls AudioConfig.fromDefaultMicrophoneInput() which
 * can fail silently in browsers, preventing the DialogServiceConnector from fully
 * establishing the DLS WebSocket — causing typed messages to never reach the bot.
 *
 * Additionally, we subscribe to connectionStatus$ BEFORE Web Chat mounts to:
 * - Ensure correct Observable subscription ordering (connectionStatus$ before activity$)
 * - Track actual WebSocket connection status (not premature 'connected')
 * - Detect silent connection failures that were previously invisible
 *
 * How DLS routing works:
 * 1. Client calls createDirectLineSpeechAdapters({ fetchCredentials })
 * 2. SDK connects to wss://{region}.convai.speech.microsoft.com
 * 3. Azure Speech Service looks up which bot has isDefaultBotForCogSvcAccount=true
 * 4. Routes the WebSocket to that bot's messaging endpoint
 * 5. Bot receives audio frames, transcribed text, and can send TTS responses
 *
 * Prerequisites:
 * - Azure Bot Service with DLS channel enabled
 * - DLS channel linked to Speech resource with isDefaultBotForCogSvcAccount=true
 * - Speech resource keys enabled (disableLocalAuth: false)
 * - Proxy bot deployed and accessible
 *
 * What this hook does:
 * 1. Fetches Speech token from server (/api/speechservices/token)
 * 2. Creates DLS adapters via createDirectLineSpeechAdapters (Web Chat bundle)
 * 3. Subscribes to connectionStatus$ for diagnostics and correct ordering
 * 4. Returns { directLine, webSpeechPonyfillFactory } for Web Chat
 *
 * Returns: { adapters, connectionStatus, errorMessage, listeningStatus,
 *            region, locale, conversationId, connect, disconnect, retry }
 */

import { useState, useCallback, useRef } from 'react';
import { createDirectLineSpeechAdapters } from 'botframework-webchat';
import { fetchSpeechToken } from '../services/api';
import type { SpeechTokenResponse } from '../services/api';

export type ConnectionStatus =
  | 'idle'
  | 'fetching-token'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'disconnected';

export type ListeningStatus =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'speaking';

interface DLSAdapters {
  directLine: any;
  webSpeechPonyfillFactory: any;
}

interface UseDirectLineSpeechConnectionDLSResult {
  adapters: DLSAdapters | null;
  connectionStatus: ConnectionStatus;
  errorMessage: string | null;
  listeningStatus: ListeningStatus;
  region: string | null;
  locale: string | null;
  conversationId: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  retry: () => void;
}

/**
 * Hook for True Direct Line Speech connections.
 *
 * Uses createDirectLineSpeechAdapters from 'botframework-webchat' (the bundle wrapper)
 * which adds browser-specific AudioConfig/AudioContext setup.
 *
 * Usage:
 * ```tsx
 * const { adapters, connectionStatus, connect } = useDirectLineSpeechConnectionDLS();
 *
 * useEffect(() => { connect(); }, [connect]);
 *
 * if (adapters) {
 *   <ReactWebChat
 *     {...adapters}
 *     store={store}
 *   />
 * }
 * ```
 */
export function useDirectLineSpeechConnectionDLS(): UseDirectLineSpeechConnectionDLSResult {
  const [adapters, setAdapters] = useState<DLSAdapters | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [listeningStatus, setListeningStatus] = useState<ListeningStatus>('idle');
  const [region, setRegion] = useState<string | null>(null);
  const [locale, setLocale] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Cache the speech token for renewal
  const speechTokenRef = useRef<SpeechTokenResponse | null>(null);
  const adaptersRef = useRef<DLSAdapters | null>(null);
  // Use a ref to guard against re-entrant calls so connect has a stable identity
  const connectingRef = useRef(false);
  // Track connectionStatus$ subscription for cleanup
  const connectionStatusSubRef = useRef<any>(null);

  /**
   * Establish the DLS connection.
   *
   * Flow:
   * 1. Set status to fetching-token
   * 2. Fetch speech credentials from server
   * 3. Create DLS adapters (this establishes the WebSocket)
   * 4. Set status to connected
   */
  const connect = useCallback(async () => {
    // Guard with a ref (not state) so this callback has a stable identity
    if (connectingRef.current) {
      console.log('⏳ [True DLS] Connection already in progress');
      return;
    }
    connectingRef.current = true;

    try {
      setConnectionStatus('fetching-token');
      setErrorMessage(null);
      console.log('🔌 [True DLS] Starting connection...');

      // Step 1: Pre-fetch credentials to get region/locale info
      const speechData = await fetchSpeechToken();
      speechTokenRef.current = speechData;
      setRegion(speechData.region);
      setLocale(speechData.locale);

      console.log(`📍 [True DLS] Region: ${speechData.region}, Locale: ${speechData.locale}`);

      // Step 2: Create DLS adapters
      // IMPORTANT: Use createDirectLineSpeechAdapters from 'botframework-webchat'
      // (NOT createAdapters from 'botframework-directlinespeech-sdk')
      //
      // The Web Chat bundle's wrapper adds CRITICAL browser-specific setup:
      // - Creates AudioConfig via createMicrophoneAudioConfigAndAudioContext (Web Audio API)
      // - Handles microphone permission gracefully
      // - Sets up AudioContext for proper browser audio pipeline
      //
      // Without this wrapper, the raw SDK calls AudioConfig.fromDefaultMicrophoneInput()
      // which can silently fail in browsers, preventing the DLS WebSocket from
      // fully establishing the connection for text AND speech messaging.
      setConnectionStatus('connecting');
      console.log('🔗 [True DLS] Creating Direct Line Speech adapters (via Web Chat bundle wrapper)...');
      console.log(`🔗 [True DLS] Region: ${speechData.region}, Key length: ${speechData.speechKey?.length}`);

      // Use subscriptionKey + region (proven working with this Speech resource config)
      const dlsAdapters = await (createDirectLineSpeechAdapters as any)({
        fetchCredentials: async () => {
          console.log('🔑 [DLS] fetchCredentials called by SDK');
          const freshData = await fetchSpeechToken();
          speechTokenRef.current = freshData;
          console.log('🔑 [DLS] Returning subscriptionKey (len=' + freshData.speechKey?.length + ') region=' + freshData.region);
          return {
            subscriptionKey: freshData.speechKey!,
            region: freshData.region,
          };
        },
        speechRecognitionLanguage: speechData.locale || 'en-US',
      });
      console.log('✅ [True DLS] Adapters created:', Object.keys(dlsAdapters || {}));

      // The SDK returns { directLine, webSpeechPonyfillFactory }
      const result: DLSAdapters = {
        directLine: (dlsAdapters as any).directLine,
        webSpeechPonyfillFactory: (dlsAdapters as any).webSpeechPonyfillFactory,
      };

      // CRITICAL: Subscribe to connectionStatus$ BEFORE Web Chat mounts.
      // This serves two purposes:
      // 1. DIAGNOSTIC: Logs the actual WebSocket connection status
      // 2. ORDERING: Ensures connectionStatusObserver is set in the DLS adapter
      //    BEFORE Web Chat subscribes to activity$ (which triggers connect())
      //
      // The DLS adapter's DirectLineSpeech constructor has a dependency:
      //   - connectionStatus$ subscribe → sets connectionStatusObserver
      //   - activity$ subscribe → uses connectionStatusObserver.next(0/1/2/4)
      //   - If activity$ subscribes BEFORE connectionStatus$, it crashes
      //
      // By subscribing here, we guarantee correct ordering regardless of
      // Web Chat's internal saga execution order.
      const STATUS_NAMES = ['Uninitialized', 'Connecting', 'Online', undefined, 'Error'];
      connectionStatusSubRef.current = result.directLine.connectionStatus$.subscribe({
        next: (status: number) => {
          console.log(`📡 [True DLS] WebSocket connectionStatus: ${status} (${STATUS_NAMES[status] || 'Unknown'})`);
          if (status === 2) {
            // Status 2 = Online — the DLS WebSocket is connected and ready
            setConnectionStatus('connected');
            console.log('✅ [True DLS] DLS WebSocket is ONLINE — ready for text and speech');
          } else if (status === 4) {
            // Status 4 = Error — connection failed
            setConnectionStatus('error');
            setErrorMessage('DLS WebSocket connection failed. Check Speech resource config and DLS channel.');
            console.error('❌ [True DLS] DLS WebSocket connection FAILED');
          }
        },
        error: (err: any) => {
          console.error('❌ [True DLS] connectionStatus$ error:', err);
          setConnectionStatus('error');
          setErrorMessage(err?.message || 'Connection status stream error');
        },
      });

      adaptersRef.current = result;
      setAdapters(result);
      // NOTE: We do NOT set connectionStatus='connected' here!
      // The connectionStatus$ subscription above will set it when the WebSocket
      // actually reports status 2 (Online). This prevents the premature "connected"
      // state that was hiding silent WebSocket failures.
      setConversationId(`dls-${Date.now().toString(36)}`);
      console.log('🔗 [True DLS] Adapters set — waiting for WebSocket to report Online status...');

    } catch (error: any) {
      console.error('❌ [True DLS] Connection failed:', error);
      setConnectionStatus('error');

      // Provide helpful error messages for common DLS issues
      let errMsg = error.message || 'Failed to connect to Direct Line Speech channel';

      if (errMsg.includes('1006') || errMsg.includes('WebSocket')) {
        errMsg += '\n\n💡 This usually means the DLS channel is not properly configured. ' +
          'Check that isDefaultBotForCogSvcAccount is set to true on the Bot Service DLS channel.';
      }

      setErrorMessage(errMsg);
    } finally {
      connectingRef.current = false;
    }
  }, []); // Empty deps — stable callback identity, uses refs for guard

  /**
   * Disconnect from DLS
   */
  const disconnect = useCallback(() => {
    console.log('🔌 [True DLS] Disconnecting...');

    // Clean up connectionStatus$ subscription
    if (connectionStatusSubRef.current) {
      try {
        connectionStatusSubRef.current.unsubscribe();
      } catch (e) {
        console.warn('[True DLS] Error unsubscribing connectionStatus$:', e);
      }
      connectionStatusSubRef.current = null;
    }

    if (adaptersRef.current?.directLine) {
      try {
        adaptersRef.current.directLine.end();
      } catch (e) {
        console.warn('[True DLS] Error ending directLine:', e);
      }
    }

    adaptersRef.current = null;
    setAdapters(null);
    setConnectionStatus('disconnected');
    setConversationId(null);
    setListeningStatus('idle');
  }, []);

  /**
   * Retry connection after failure
   */
  const retry = useCallback(() => {
    console.log('🔄 [True DLS] Retrying connection...');
    disconnect();
    setTimeout(() => connect(), 500);
  }, [disconnect, connect]);

  return {
    adapters,
    connectionStatus,
    errorMessage,
    listeningStatus,
    region,
    locale,
    conversationId,
    connect,
    disconnect,
    retry,
  };
}

export default useDirectLineSpeechConnectionDLS;
