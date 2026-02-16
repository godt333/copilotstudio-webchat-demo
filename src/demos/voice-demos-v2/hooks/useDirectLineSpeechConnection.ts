/**
 * useDirectLineSpeechConnection Hook (Tab 2: Proxy Bot)
 * ======================================================
 * FROZEN: Feb 6, 2026
 *
 * Custom React hook that establishes a connection via the Proxy Bot.
 *
 * Architecture: Browser → Direct Line → Proxy Bot → Copilot Studio
 *              Browser → Azure Speech SDK ponyfill (client-side audio)
 *
 * The Proxy Bot (thr505-dls-proxy-bot.azurewebsites.net) is an Azure Bot
 * Service app that receives messages via Direct Line and forwards them
 * to the Copilot Studio agent. Speech is handled client-side via the
 * same web-speech-cognitive-services ponyfill as Tab 1.
 *
 * Benefits of Proxy Bot:
 * - Custom middleware and logging
 * - Authentication/authorization layer
 * - Message transformation
 * - Analytics and telemetry
 *
 * What this hook does:
 * 1. Fetches Speech credentials from server (/api/speechservices/ponyfillKey)
 * 2. Fetches Proxy Bot token from server (/api/directline/proxyBotToken)
 * 3. Creates Direct Line connection to PROXY BOT (not Copilot directly)
 * 4. Creates Speech ponyfill using web-speech-cognitive-services
 * 5. Wraps SpeechSynthesisUtterance with PatchedUtterance (rate + pitch)
 * 6. Exposes speechSynthesisRef for barge-in TTS cancellation
 *
 * Settings: Same as useDirectLinePonyfillConnection (Tab 1).
 * See that hook's JSDoc for the full settings wiring matrix.
 *
 * Returns: { adapters, connectionStatus, speechSynthesisRef, errorMessage,
 *            listeningStatus, region, locale, conversationId,
 *            connect, disconnect, retry }
 */

import { useState, useCallback, useRef } from 'react';
import { createDirectLine } from 'botframework-webchat';
import SpeechServicesModule from 'web-speech-cognitive-services/lib/SpeechServices';
import {
  fetchPonyfillCredentials,
  fetchProxyBotToken,
} from '../services/api';

// CJS interop: rolldown-vite wraps the module object as the ESM default.
// The actual function may be the import itself or nested under .default.
const createSpeechServicesPonyfill: (options: any) => any =
  typeof SpeechServicesModule === 'function'
    ? SpeechServicesModule
    : (SpeechServicesModule as any).default;
import type {
  SpeechTokenResponse,
} from '../services/api';

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

interface UseDirectLineSpeechConnectionOptions {
  locale?: string;
  voice?: string;
  // Additional speech settings
  speechRate?: number;
  speechPitch?: number;
  interimResults?: boolean;
  continuousRecognition?: boolean;
  silenceTimeoutMs?: number;
}

interface DirectLineSpeechAdapters {
  directLine: unknown;
  webSpeechPonyfillFactory: unknown;
}

interface UseDirectLineSpeechConnectionResult {
  adapters: DirectLineSpeechAdapters | null;
  connectionStatus: ConnectionStatus;
  speechSynthesisRef: { current: { cancel: () => void } | null };
  errorMessage: string | null;
  listeningStatus: ListeningStatus;
  region: string | null;
  locale: string | null;
  conversationId: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  retry: () => void;
}

export function useDirectLineSpeechConnection(
  options: UseDirectLineSpeechConnectionOptions = {}
): UseDirectLineSpeechConnectionResult {
  const { 
    locale = 'en-US', 
    voice = 'en-US-JennyNeural',
    speechRate = 1.0,
    speechPitch = 1.0,
    interimResults = true,
    continuousRecognition = true,
    silenceTimeoutMs = 3000,
  } = options;
  
  const [adapters, setAdapters] = useState<DirectLineSpeechAdapters | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [listeningStatus, setListeningStatus] = useState<ListeningStatus>('idle');
  const [tokenInfo, setTokenInfo] = useState<SpeechTokenResponse | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const directLineRef = useRef<{ end?: () => void } | null>(null);
  const speechSynthesisRef = useRef<{ cancel: () => void } | null>(null);

  const connect = useCallback(async () => {
    console.log('🎤 Starting Proxy Bot + Speech connection...');

    try {
      setConnectionStatus('fetching-token');
      setErrorMessage(null);

      // Fetch both tokens in parallel
      // Proxy Bot token for Direct Line, Speech token for voice
      console.log(`🔑 Fetching Speech (${locale}, ${voice}) and Proxy Bot tokens...`);
      const [speechToken, proxyBotToken] = await Promise.all([
        fetchPonyfillCredentials(locale, voice),
        fetchProxyBotToken()
      ]);
      
      setTokenInfo(speechToken);
      setConversationId(proxyBotToken.conversationId);
      console.log(`✅ Got Speech token for region: ${speechToken.region}, locale: ${locale}`);
      console.log(`✅ Got Proxy Bot token for conversation: ${proxyBotToken.conversationId}`);

      setConnectionStatus('connecting');

      // Create Direct Line connection to PROXY BOT (not Copilot directly)
      // This demonstrates the middleware architecture
      const directLine = createDirectLine({
        token: proxyBotToken.token,
      });

      directLineRef.current = directLine as { end?: () => void };

      // Create Speech Services ponyfill for voice capabilities
      console.log('🔊 Creating speech ponyfill...');
      console.log(`Speech settings: rate=${speechRate}, pitch=${speechPitch}, silence=${silenceTimeoutMs}ms`);
      console.log(`Voice: ${voice || 'en-US-JennyNeural'}`);
      
      const ponyfill = await createSpeechServicesPonyfill({
        credentials: {
          authorizationToken: speechToken.token,
          region: speechToken.region,
        },
        speechSynthesisOutputFormat: 'audio-24khz-48kbitrate-mono-mp3',
        speechSynthesisVoiceName: voice || 'en-US-JennyNeural',
      });

      const { SpeechGrammarList, SpeechRecognition, speechSynthesis, SpeechSynthesisUtterance: OriginalUtterance } = ponyfill;

      // Store ponyfill speechSynthesis ref so barge-in can cancel it
      speechSynthesisRef.current = speechSynthesis as any;

      // Wrap SpeechSynthesisUtterance to apply speechRate and speechPitch settings
      const currentRate = speechRate;
      const currentPitch = speechPitch;
      function PatchedUtterance(this: any, ...args: any[]) {
        const instance = new (OriginalUtterance as any)(...args);
        instance.rate = currentRate;
        instance.pitch = currentPitch;
        return instance;
      }
      PatchedUtterance.prototype = (OriginalUtterance as any).prototype;

      console.log(`🎙️ Ponyfill factory: rate=${currentRate}, pitch=${currentPitch}`);

      // Create the ponyfill factory
      const webSpeechPonyfillFactory = () => ({
        SpeechGrammarList,
        SpeechRecognition,
        speechSynthesis,
        SpeechSynthesisUtterance: PatchedUtterance as any,
      });

      setAdapters({
        directLine,
        webSpeechPonyfillFactory,
      });
      setConnectionStatus('connected');
      console.log('✅ Proxy Bot + Speech connection established!');
      console.log('📍 Architecture: Client → Proxy Bot → Copilot Studio');

    } catch (error: unknown) {
      console.error('❌ Failed to establish connection:', error);
      setConnectionStatus('error');
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Failed to connect to voice services');
      }
    }
  }, [locale, voice, speechRate, speechPitch, interimResults, continuousRecognition, silenceTimeoutMs]);

  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting...');
    if (directLineRef.current?.end) {
      directLineRef.current.end();
    }
    directLineRef.current = null;
    setAdapters(null);
    setConnectionStatus('disconnected');
    setListeningStatus('idle');
    setConversationId(null);
  }, []);

  const retry = useCallback(() => {
    disconnect();
    setTimeout(() => connect(), 500);
  }, [disconnect, connect]);

  return {
    adapters,
    connectionStatus,
    speechSynthesisRef,
    errorMessage,
    listeningStatus,
    region: tokenInfo?.region || null,
    locale: tokenInfo?.locale || null,
    conversationId,
    connect,
    disconnect,
    retry,
  };
}

export default useDirectLineSpeechConnection;
