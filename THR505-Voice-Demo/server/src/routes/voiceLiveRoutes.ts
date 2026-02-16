/**
 * Voice Live API Routes
 * =====================
 * WebSocket proxy that relays audio between the browser and Azure Voice Live API.
 *
 * Architecture:
 *   Browser ──WS──▶ This Server ──WS──▶ Azure Voice Live API
 *                                        (STT + GPT-4o + TTS)
 *
 * The browser sends PCM audio as base64-encoded JSON messages.
 * Azure sends back transcription events, AI response text, and TTS audio.
 * This server acts as a transparent relay with authentication injection.
 *
 * Endpoint: ws://localhost:3001/api/voicelive/ws
 */

import WebSocket from 'ws';
import { IncomingMessage } from 'http';
import { config } from '../config/env';

/**
 * Build the Azure Voice Live API WebSocket URL
 */
function buildVLAEndpoint(): string {
  const endpoint = config.speech.resourceEndpoint.replace(/\/$/, '');
  return `${endpoint.replace('https://', 'wss://')}/voice-live/realtime?api-version=2025-10-01&model=gpt-4o`;
}

/**
 * Handle a new WebSocket connection from the browser.
 * Opens a parallel WebSocket to Azure VLA and relays messages.
 */
export function handleVoiceLiveConnection(clientWs: WebSocket, req: IncomingMessage): void {
  console.log('🎙️ [VLA] New client connection');

  const vlaUrl = buildVLAEndpoint();
  console.log(`🎙️ [VLA] Connecting to Azure: ${vlaUrl.replace(/api-key=[^&]+/, 'api-key=***')}`);

  // Open WebSocket to Azure Voice Live API
  const azureWs = new WebSocket(vlaUrl, {
    headers: {
      'api-key': config.speech.key,
    },
  });

  let azureReady = false;

  // ─── Azure → Client relay ────────────────────────────────────────────────

  azureWs.on('open', () => {
    azureReady = true;
    console.log('🎙️ [VLA] Connected to Azure Voice Live API');

    // Send session configuration
    const sessionConfig = {
      type: 'session.update',
      session: {
        modalities: ['text', 'audio'],
        voice: {
          name: 'en-US-AvaNeural',
          type: 'azure-standard',
        },
        instructions: 'You are a helpful citizen advice assistant. Help users with questions about benefits, housing, employment, and general advice. Be concise and friendly.',
        input_audio_format: 'pcm16',
        output_audio_format: 'pcm16',
        input_audio_transcription: {
          model: 'azure-speech',
        },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 500,
        },
      },
    };

    azureWs.send(JSON.stringify(sessionConfig));
    console.log('🎙️ [VLA] Session configured');
  });

  azureWs.on('message', (data, isBinary) => {
    if (clientWs.readyState !== WebSocket.OPEN) return;

    try {
      if (isBinary) {
        // Binary audio data from Azure TTS — relay directly
        clientWs.send(data, { binary: true });
      } else {
        const msg = JSON.parse(data.toString());

        // Relay relevant events to client
        switch (msg.type) {
          case 'session.created':
          case 'session.updated':
          case 'input_audio_buffer.speech_started':
          case 'input_audio_buffer.speech_stopped':
          case 'conversation.item.input_audio_transcription.completed':
          case 'response.audio_transcript.delta':
          case 'response.audio_transcript.done':
          case 'response.audio.delta':
          case 'response.audio.done':
          case 'response.done':
          case 'error':
            clientWs.send(JSON.stringify(msg));
            break;

          // Log but don't relay internal events
          case 'rate_limits.updated':
          case 'response.created':
          case 'response.output_item.added':
          case 'response.content_part.added':
          case 'response.content_part.done':
          case 'response.output_item.done':
          case 'conversation.item.created':
            break;

          default:
            console.log(`🎙️ [VLA] Unhandled Azure event: ${msg.type}`);
        }
      }
    } catch (err) {
      console.error('🎙️ [VLA] Error relaying Azure message:', err);
    }
  });

  azureWs.on('error', (err) => {
    console.error('🎙️ [VLA] Azure WebSocket error:', err.message);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({
        type: 'error',
        error: { message: `Azure VLA connection error: ${err.message}` },
      }));
    }
  });

  azureWs.on('close', (code, reason) => {
    console.log(`🎙️ [VLA] Azure connection closed: ${code} ${reason.toString()}`);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.close(1000, 'Azure connection closed');
    }
  });

  // ─── Client → Azure relay ────────────────────────────────────────────────

  clientWs.on('message', (data, isBinary) => {
    if (!azureReady || azureWs.readyState !== WebSocket.OPEN) return;

    try {
      if (isBinary) {
        // Binary audio from browser — relay to Azure
        azureWs.send(data, { binary: true });
      } else {
        // JSON message from browser — relay to Azure
        const msg = JSON.parse(data.toString());
        azureWs.send(JSON.stringify(msg));
      }
    } catch (err) {
      console.error('🎙️ [VLA] Error relaying client message:', err);
    }
  });

  clientWs.on('close', () => {
    console.log('🎙️ [VLA] Client disconnected');
    if (azureWs.readyState === WebSocket.OPEN || azureWs.readyState === WebSocket.CONNECTING) {
      azureWs.close(1000, 'Client disconnected');
    }
  });

  clientWs.on('error', (err) => {
    console.error('🎙️ [VLA] Client WebSocket error:', err.message);
    if (azureWs.readyState === WebSocket.OPEN) {
      azureWs.close(1000, 'Client error');
    }
  });
}
