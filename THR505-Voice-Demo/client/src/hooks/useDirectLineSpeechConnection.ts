/**
 * useDirectLineSpeechConnection Hook (Proxy Bot Version)
 * =======================================================
 * Custom React hook for establishing a connection via the Proxy Bot.
 *
 * This approach demonstrates the bot middleware architecture:
 * - Direct Line connects to Proxy Bot (Azure Bot Service)
 * - Proxy Bot forwards messages to Copilot Studio
 * - Azure Speech Services for voice (STT and TTS)
 *
 * Architecture: Client → Proxy Bot → Copilot Studio
 * 
 * Benefits of Proxy Bot:
 * - Custom middleware and logging
 * - Authentication/authorization layer
 * - Message transformation
 * - Analytics and telemetry
 */

import { useState, useCallback, useRef } from 'react';
import { createDirectLine } from 'botframework-webchat';
import createSpeechServicesPonyfill from 'web-speech-cognitive-services/lib/SpeechServices';
import {
  fetchPonyfillCredentials,
  fetchProxyBotToken,
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

interface DirectLineSpeechAdapters {
  directLine: unknown;
  webSpeechPonyfillFactory: unknown;
}

interface UseDirectLineSpeechConnectionResult {
  adapters: DirectLineSpeechAdapters | null;
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

export function useDirectLineSpeechConnection(): UseDirectLineSpeechConnectionResult {
  const [adapters, setAdapters] = useState<DirectLineSpeechAdapters | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [listeningStatus, setListeningStatus] = useState<ListeningStatus>('idle');
  const [tokenInfo, setTokenInfo] = useState<SpeechTokenResponse | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const directLineRef = useRef<{ end?: () => void } | null>(null);

  const connect = useCallback(async () => {
    console.log('🎤 Starting Proxy Bot + Speech connection...');

    try {
      setConnectionStatus('fetching-token');
      setErrorMessage(null);

      // Fetch both tokens in parallel
      // Proxy Bot token for Direct Line, Speech token for voice
      console.log('🔑 Fetching Speech and Proxy Bot tokens...');
      const [speechToken, proxyBotToken] = await Promise.all([
        fetchPonyfillCredentials('en-US', 'en-US-JennyNeural'),
        fetchProxyBotToken()
      ]);
      
      setTokenInfo(speechToken);
      setConversationId(proxyBotToken.conversationId);
      console.log(`✅ Got Speech token for region: ${speechToken.region}`);
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
      const ponyfill = await createSpeechServicesPonyfill({
        credentials: {
          authorizationToken: speechToken.token,
          region: speechToken.region,
        },
        speechSynthesisOutputFormat: 'audio-24khz-48kbitrate-mono-mp3',
      });

      const { SpeechGrammarList, SpeechRecognition, speechSynthesis, SpeechSynthesisUtterance } = ponyfill;

      const webSpeechPonyfillFactory = () => ({
        SpeechGrammarList,
        SpeechRecognition,
        speechSynthesis,
        SpeechSynthesisUtterance,
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
  }, []);

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
