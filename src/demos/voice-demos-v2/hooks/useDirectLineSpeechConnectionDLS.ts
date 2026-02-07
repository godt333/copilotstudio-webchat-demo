/**
 * useDirectLineSpeechConnection Hook (True DLS Version)
 * ======================================================
 * 
 * TRUE Direct Line Speech is currently UNAVAILABLE due to Azure Policy restrictions.
 * 
 * The Azure subscription has a policy that enforces disableLocalAuth: true on all
 * Cognitive Services resources. This prevents setting isDefaultBotForCogSvcAccount: true
 * on the DLS channel, which is required for True DLS to work.
 * 
 * WORKAROUND OPTIONS:
 * 1. Use Speech Ponyfill mode (works great, same user experience)
 * 2. Request Azure Policy exemption for the Speech resource
 * 3. Use a different Azure subscription without this policy
 * 
 * This hook returns an error state explaining the situation.
 */

import { useState, useCallback } from 'react';

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
  startListening: () => void;
  stopListening: () => void;
}

/**
 * Hook for TRUE Direct Line Speech connection
 * Currently returns an error due to Azure Policy restrictions
 */
export function useDirectLineSpeechConnectionDLS(): UseDirectLineSpeechConnectionResult {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const connect = useCallback(async () => {
    console.log('🎤 True DLS: Checking availability...');
    
    setConnectionStatus('connecting');
    
    // Simulate a brief delay then show the error
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const error = `True Direct Line Speech is currently unavailable.

Azure Policy in this subscription enforces 'disableLocalAuth: true' on all Cognitive Services resources, which prevents the DLS channel from being configured as the default bot.

ALTERNATIVES:
• Use the "Speech Ponyfill" tab - provides the same voice experience
• Request a policy exemption from your Azure admin
• Use a different Azure subscription`;

    console.error('❌ True DLS unavailable:', error);
    setConnectionStatus('error');
    setErrorMessage(error);
  }, []);

  const disconnect = useCallback(() => {
    setConnectionStatus('disconnected');
    setErrorMessage(null);
  }, []);

  const retry = useCallback(() => {
    disconnect();
    setTimeout(() => connect(), 500);
  }, [disconnect, connect]);

  const startListening = useCallback(() => {
    console.log('Cannot start listening - True DLS not available');
  }, []);

  const stopListening = useCallback(() => {
    console.log('Cannot stop listening - True DLS not available');
  }, []);

  return {
    adapters: null,
    connectionStatus,
    errorMessage,
    listeningStatus: 'idle',
    region: null,
    locale: null,
    conversationId: null,
    connect,
    disconnect,
    retry,
    startListening,
    stopListening,
  };
}

export default useDirectLineSpeechConnectionDLS;
