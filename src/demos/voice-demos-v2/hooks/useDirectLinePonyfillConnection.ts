/**
 * useDirectLinePonyfillConnection Hook
 * 
 * Uses WebChat's built-in speech factory to avoid version conflicts
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { createDirectLine, createCognitiveServicesSpeechServicesPonyfillFactory } from 'botframework-webchat';
import {
  fetchDirectLineToken,
  fetchPonyfillCredentials,
} from '../services/api';
import type {
  DirectLineTokenResponse,
  SpeechTokenResponse,
} from '../services/api';

export type ConnectionStatus =
  | 'idle'
  | 'fetching-tokens'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'disconnected';

export type ListeningStatus =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'speaking';

interface UseDirectLinePonyfillOptions {
  userId?: string;
  userName?: string;
  locale?: string;
  voice?: string;
}

interface UseDirectLinePonyfillConnectionResult {
  directLine: unknown | null;
  webSpeechPonyfillFactory: unknown | null;
  connectionStatus: ConnectionStatus;
  errorMessage: string | null;
  listeningStatus: ListeningStatus;
  conversationId: string | null;
  userId: string | null;
  locale: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  retry: () => void;
}

export function useDirectLinePonyfillConnection(
  options: UseDirectLinePonyfillOptions = {}
): UseDirectLinePonyfillConnectionResult {
  const { userId, userName, locale, voice } = options;

  const [directLine, setDirectLine] = useState<unknown | null>(null);
  const [webSpeechPonyfillFactory, setWebSpeechPonyfillFactory] = useState<unknown | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [listeningStatus, setListeningStatus] = useState<ListeningStatus>('idle');
  const [directLineToken, setDirectLineToken] = useState<DirectLineTokenResponse | null>(null);
  const [speechCredentials, setSpeechCredentials] = useState<SpeechTokenResponse | null>(null);
  const directLineRef = useRef<{ end?: () => void } | null>(null);

  const connect = useCallback(async () => {
    console.log('Starting Direct Line + Ponyfill connection...');

    try {
      setConnectionStatus('fetching-tokens');
      setErrorMessage(null);

      const [dlToken, speechCreds] = await Promise.all([
        fetchDirectLineToken(userId, userName),
        fetchPonyfillCredentials(locale, voice),
      ]);

      setDirectLineToken(dlToken);
      setSpeechCredentials(speechCreds);

      console.log('Conversation:', dlToken.conversationId);
      console.log('Speech region:', speechCreds.region);

      setConnectionStatus('connecting');

      const dl = createDirectLine({
        token: dlToken.token,
      });

      directLineRef.current = dl as { end?: () => void };

      console.log('Creating speech ponyfill...');

      // Use WebChat's built-in speech factory
      const ponyfillFactory = createCognitiveServicesSpeechServicesPonyfillFactory({
        credentials: {
          authorizationToken: speechCreds.token,
          region: speechCreds.region,
        },
      });

      setDirectLine(dl);
      setWebSpeechPonyfillFactory(() => ponyfillFactory);
      setConnectionStatus('connected');

      console.log('Connected!');

    } catch (error: unknown) {
      console.error('Connection failed:', error);
      setConnectionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to connect');
    }
  }, [userId, userName, locale, voice]);

  const disconnect = useCallback(() => {
    if (directLineRef.current?.end) {
      directLineRef.current.end();
    }
    directLineRef.current = null;
    setDirectLine(null);
    setWebSpeechPonyfillFactory(null);
    setConnectionStatus('disconnected');
    setListeningStatus('idle');
    setDirectLineToken(null);
    setSpeechCredentials(null);
  }, []);

  const retry = useCallback(() => {
    disconnect();
    setTimeout(() => connect(), 500);
  }, [connect, disconnect]);

  useEffect(() => {
    return () => {
      if (directLineRef.current) disconnect();
    };
  }, [disconnect]);

  return {
    directLine,
    webSpeechPonyfillFactory,
    connectionStatus,
    errorMessage,
    listeningStatus,
    conversationId: directLineToken?.conversationId ?? null,
    userId: directLineToken?.userId ?? null,
    locale: speechCredentials?.locale ?? null,
    connect,
    disconnect,
    retry,
  };
}
