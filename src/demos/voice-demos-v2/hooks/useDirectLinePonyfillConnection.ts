/**
 * useDirectLinePonyfillConnection Hook (Tab 1: Speech Ponyfill)
 * ==============================================================
 * FROZEN: Feb 6, 2026
 *
 * Custom React hook that establishes a Direct Line connection to Copilot Studio
 * (via the Copilot Token Endpoint) and creates a Speech Services ponyfill for
 * client-side STT/TTS.
 *
 * Architecture: Browser → Direct Line → Copilot Studio (no proxy bot)
 *              Browser → Azure Speech SDK ponyfill (client-side audio)
 *
 * What this hook does:
 * 1. Fetches Direct Line token from server (/api/directline/token)
 * 2. Fetches Speech credentials from server (/api/speechservices/ponyfillKey)
 * 3. Creates Direct Line connection using botframework-webchat's createDirectLine
 * 4. Creates Speech ponyfill using web-speech-cognitive-services
 * 5. Wraps SpeechSynthesisUtterance with PatchedUtterance that applies
 *    speechRate and speechPitch settings
 * 6. Exposes speechSynthesisRef so the component can pass it to the
 *    barge-in controller for direct TTS cancellation
 *
 * Settings applied here:
 * - locale → passed to fetchPonyfillCredentials (server picks region)
 * - voice → passed to ponyfill speechSynthesisVoiceName
 * - speechRate → PatchedUtterance.rate (✅ confirmed working)
 * - speechPitch → PatchedUtterance.pitch (✅ confirmed working)
 *
 * Settings NOT applied here (applied in component or N/A):
 * - continuousRecognition → component's styleOptions
 * - autoStartMic → component's useEffect
 * - autoResumeListening → component's useEffect
 * - bargeInEnabled/Sensitivity → component's BargeInController
 * - interimResults → NOT wirable (Web Chat internal)
 * - silenceTimeoutMs → NOT wirable (Azure Speech SDK internal)
 *
 * Returns: { directLine, webSpeechPonyfillFactory, connectionStatus,
 *            errorMessage, listeningStatus, conversationId, userId,
 *            locale, speechSynthesisRef, connect, disconnect, retry }
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
  // Additional speech settings
  speechRate?: number;
  speechPitch?: number;
  interimResults?: boolean;
  continuousRecognition?: boolean;
  silenceTimeoutMs?: number;
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
  speechSynthesisRef: { current: { cancel: () => void } | null };
  connect: () => Promise<void>;
  disconnect: () => void;
  retry: () => void;
}

export function useDirectLinePonyfillConnection(
  options: UseDirectLinePonyfillOptions = {}
): UseDirectLinePonyfillConnectionResult {
  const { 
    userId, 
    userName, 
    locale, 
    voice,
    speechRate = 1.0,
    speechPitch = 1.0,
    interimResults = true,
    continuousRecognition = true,
    silenceTimeoutMs = 3000,
  } = options;

  const [directLine, setDirectLine] = useState<unknown | null>(null);
  const [webSpeechPonyfillFactory, setWebSpeechPonyfillFactory] = useState<unknown | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [listeningStatus, setListeningStatus] = useState<ListeningStatus>('idle');
  const [directLineToken, setDirectLineToken] = useState<DirectLineTokenResponse | null>(null);
  const [speechCredentials, setSpeechCredentials] = useState<SpeechTokenResponse | null>(null);
  const directLineRef = useRef<{ end?: () => void } | null>(null);
  const speechSynthesisRef = useRef<{ cancel: () => void } | null>(null);

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

      console.log('Creating speech ponyfill via WebChat built-in factory...');
      console.log(`Speech settings: rate=${speechRate}, pitch=${speechPitch}`);
      console.log(`Voice: ${voice || 'en-US-JennyNeural'}`);

      // Use WebChat's built-in factory which handles audioConfig, audioContext,
      // CJS interop, and resumeAudioContext internally.
      const baseFactory = createCognitiveServicesSpeechServicesPonyfillFactory({
        credentials: {
          authorizationToken: speechCreds.token,
          region: speechCreds.region,
        },
        speechSynthesisOutputFormat: 'audio-24khz-48kbitrate-mono-mp3' as any,
      });

      // Wrap the factory to add rate/pitch and capture speechSynthesis ref
      const currentRate = speechRate;
      const currentPitch = speechPitch;
      const selectedVoice = voice || 'en-US-JennyNeural';

      const wrappedFactory = (...args: any[]) => {
        const result = (baseFactory as any)(...args);
        console.log('🎤 ponyfillFactory() called, result keys:', Object.keys(result || {}));

        // Capture speechSynthesis ref for barge-in
        if (result.speechSynthesis) {
          speechSynthesisRef.current = result.speechSynthesis;
        }

        // Wrap SpeechSynthesisUtterance to apply rate, pitch, and voice
        const OriginalUtterance = result.SpeechSynthesisUtterance;
        if (OriginalUtterance) {
          function PatchedUtterance(this: any, ...uArgs: any[]) {
            const instance = new OriginalUtterance(...uArgs);
            instance.rate = currentRate;
            instance.pitch = currentPitch;
            instance.voice = { name: selectedVoice };
            return instance;
          }
          PatchedUtterance.prototype = OriginalUtterance.prototype;
          result.SpeechSynthesisUtterance = PatchedUtterance;
        }

        return result;
      };

      setDirectLine(dl);
      setWebSpeechPonyfillFactory(() => wrappedFactory);
      setConnectionStatus('connected');

      console.log('Connected!');

    } catch (error: unknown) {
      console.error('Connection failed:', error);
      setConnectionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to connect');
    }
  }, [userId, userName, locale, voice, speechRate, speechPitch, interimResults, continuousRecognition, silenceTimeoutMs]);

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
    speechSynthesisRef,
    connect,
    disconnect,
    retry,
  };
}
