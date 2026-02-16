/**
 * VoiceLiveAPI Component
 * ======================
 * Voice Live API tab with live demo + informational sub-tabs.
 *
 * SUB-TABS:
 *   💬 ChatBot          — Live WebSocket demo (push-to-talk voice via VLA)
 *   🏗️ Architecture     — VLA architecture overview vs Tab 1 & 2
 *   🔌 Connection Flow  — Server-side WebSocket protocol
 *   📚 Resources        — Quick reference links
 *   ⚖️ VLA vs DLS       — Comparison table (kept from original)
 *   🚀 Next Steps       — Resources & Next Steps (kept from original)
 *
 * SESSION: THR505 - Integrating and branding Copilot Studio with Web Chat
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';

// ─── Tab Definitions ─────────────────────────────────────────────────────────

const VLA_TABS = [
  { id: 'chat', icon: '💬', label: 'ChatBot' },
  { id: 'architecture', icon: '🏗️', label: 'Architecture' },
  { id: 'connection', icon: '🔌', label: 'Connection Flow' },
  { id: 'resources', icon: '📚', label: 'Resources' },
  { id: 'vs-dls', icon: '⚖️', label: 'VLA vs DLS' },
  { id: 'next-steps', icon: '🚀', label: 'Next Steps' },
] as const;

type VLATabId = (typeof VLA_TABS)[number]['id'];

// ─── Comparison Data ─────────────────────────────────────────────────────────

const COMPARISON_DATA = [
  { feature: 'Architecture', dls: 'Tab 1 & 2: Client-side Speech SDK + Direct Line (two separate channels)', vla: 'Single server-side WebSocket (STT + AI + TTS unified)' },
  { feature: 'Speech Processing', dls: 'Tab 1 & 2: Azure Speech SDK ponyfill runs in the browser', vla: 'Server-side — no Speech SDK on client at all' },
  { feature: 'Bot Protocol', dls: 'Tab 1: Direct Line → Copilot Studio\nTab 2: Direct Line → Proxy Bot', vla: 'WebSocket to Azure Voice Live API (no Direct Line)' },
  { feature: 'AI Model', dls: 'Tab 1 & 2: Copilot Studio handles AI logic externally', vla: 'Built-in GPT-4o / GPT-5 / Phi (choose your model)' },
  { feature: 'Client Needs', dls: 'Tab 1 & 2: Speech SDK + Web Chat + Direct Line token', vla: 'Web Audio API only (microphone + speakers)' },
  { feature: 'Barge-in', dls: 'Tab 1 & 2: Custom BargeInController (experimental)', vla: 'Native (echo cancellation + interruption detection built-in)' },
  { feature: 'Voices', dls: 'Tab 1 & 2: Speech SDK neural voices via ponyfill', vla: '600+ voices including custom voice (server-side)' },
  { feature: 'Status', dls: 'Tab 1 & 2: ✅ Working (DLS in Tab 3: ⛔ Deprecated)', vla: '✅ GA — replaces DLS' },
];

// ─── Resource Links ──────────────────────────────────────────────────────────

const RESOURCE_LINKS = [
  { title: 'Voice Live API Overview', url: 'https://learn.microsoft.com/azure/ai-services/speech-service/voice-live', description: 'What is Voice Live API — features, models, pricing, and comparison' },
  { title: 'Voice Live API Quickstart', url: 'https://learn.microsoft.com/azure/ai-services/speech-service/voice-live-quickstart', description: 'Get started with a basic Voice Live API implementation' },
  { title: 'Voice Live API How-To Guide', url: 'https://learn.microsoft.com/azure/ai-services/speech-service/voice-live-how-to', description: 'Detailed guide for using the Voice Live API WebSocket protocol' },
  { title: 'Copilot Studio Voice (IVR)', url: 'https://learn.microsoft.com/microsoft-copilot-studio/voice-overview', description: 'Interactive voice response with Copilot Studio agents' },
];

// ─── VLA Voice Options ───────────────────────────────────────────────────────

const VLA_VOICE_OPTIONS = [
  { id: 'en-US-AvaNeural', name: 'Ava (Female)', locale: 'en-US' },
  { id: 'en-US-AndrewNeural', name: 'Andrew (Male)', locale: 'en-US' },
  { id: 'en-US-EmmaNeural', name: 'Emma (Female)', locale: 'en-US' },
  { id: 'en-US-BrianNeural', name: 'Brian (Male)', locale: 'en-US' },
  { id: 'en-GB-SoniaNeural', name: 'Sonia (Female, UK)', locale: 'en-GB' },
  { id: 'en-GB-RyanNeural', name: 'Ryan (Male, UK)', locale: 'en-GB' },
  { id: 'es-ES-ElviraNeural', name: 'Elvira (Female, ES)', locale: 'es-ES' },
  { id: 'fr-FR-DeniseNeural', name: 'Denise (Female, FR)', locale: 'fr-FR' },
];

interface VLASettings {
  voiceName: string;
  turnDetection: 'server_vad' | 'none';
  vadThreshold: number;
  silenceDurationMs: number;
}

const DEFAULT_VLA_SETTINGS: VLASettings = {
  voiceName: 'en-US-AvaNeural',
  turnDetection: 'server_vad',
  vadThreshold: 0.5,
  silenceDurationMs: 500,
};

// ─── ChatBot Message Type ────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// VLA ChatBot — Live Voice Demo
// ═══════════════════════════════════════════════════════════════════════════════

const VLAChatBot: React.FC = () => {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [vlaSettings, setVlaSettings] = useState<VLASettings>({ ...DEFAULT_VLA_SETTINGS });

  /** Send a session.update to change VLA settings live (no reconnect needed) */
  const sendSessionUpdate = useCallback((newSettings: VLASettings) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    const update = {
      type: 'session.update',
      session: {
        voice: { name: newSettings.voiceName, type: 'azure-standard' as const },
        turn_detection: newSettings.turnDetection === 'server_vad'
          ? {
              type: 'server_vad' as const,
              threshold: newSettings.vadThreshold,
              silence_duration_ms: newSettings.silenceDurationMs,
              prefix_padding_ms: 300,
            }
          : { type: 'none' as const },
      },
    };
    wsRef.current.send(JSON.stringify(update));
    console.log('⚙️ [VLA] Session updated:', update.session);
  }, []);

  const updateSetting = useCallback(<K extends keyof VLASettings>(key: K, value: VLASettings[K]) => {
    setVlaSettings(prev => {
      const next = { ...prev, [key]: value };
      sendSessionUpdate(next);
      return next;
    });
  }, [sendSessionUpdate]);

  // ── Audio playback queue (persistent AudioContext + scheduled playback) ──
  const playbackCtxRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef<number>(0);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentTranscript]);

  /** Queue a PCM-16 ArrayBuffer for gapless playback */
  const playAudioData = useCallback((data: ArrayBuffer) => {
    try {
      if (!playbackCtxRef.current || playbackCtxRef.current.state === 'closed') {
        playbackCtxRef.current = new AudioContext({ sampleRate: 24000 });
        nextPlayTimeRef.current = 0;
      }
      const ctx = playbackCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const int16 = new Int16Array(data);
      if (int16.length === 0) return;
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768;
      }
      const buffer = ctx.createBuffer(1, float32.length, 24000);
      buffer.copyToChannel(float32, 0);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);

      const now = ctx.currentTime;
      const startAt = Math.max(now, nextPlayTimeRef.current);
      source.start(startAt);
      nextPlayTimeRef.current = startAt + buffer.duration;
    } catch (err) {
      console.error('Audio playback error:', err);
    }
  }, []);

  /** Decode base64 PCM-16 audio from a response.audio.delta event and queue it */
  const playBase64Audio = useCallback((base64: string) => {
    try {
      const raw = atob(base64);
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
      playAudioData(bytes.buffer);
    } catch (err) {
      console.error('Base64 audio decode error:', err);
    }
  }, [playAudioData]);

  /** Stop all queued audio immediately (barge-in) */
  const stopAudioPlayback = useCallback(() => {
    if (playbackCtxRef.current && playbackCtxRef.current.state !== 'closed') {
      playbackCtxRef.current.close().catch(() => {});
      playbackCtxRef.current = null;
      nextPlayTimeRef.current = 0;
    }
  }, []);

  const handleVLAMessage = useCallback((msg: any) => {
    switch (msg.type) {
      case 'session.created':
      case 'session.updated':
        // Session ready
        break;
      case 'input_audio_buffer.speech_started':        stopAudioPlayback(); // Barge-in: stop assistant audio immediately        setCurrentTranscript('(speaking...)');
        break;
      case 'input_audio_buffer.speech_stopped':
        break;
      case 'conversation.item.input_audio_transcription.completed':
        if (msg.transcript) {
          setMessages(prev => [...prev, {
            id: `user-${Date.now()}`,
            role: 'user',
            text: msg.transcript,
            timestamp: new Date(),
          }]);
          setCurrentTranscript('');
        }
        break;
      case 'response.audio_transcript.delta':
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'assistant' && last.id.startsWith('streaming-')) {
            return [...prev.slice(0, -1), { ...last, text: last.text + (msg.delta || '') }];
          }
          return [...prev, {
            id: `streaming-${Date.now()}`,
            role: 'assistant',
            text: msg.delta || '',
            timestamp: new Date(),
          }];
        });
        break;
      case 'response.audio_transcript.done':
        // Finalize the streaming message
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last && last.id.startsWith('streaming-')) {
            return [...prev.slice(0, -1), { ...last, id: `bot-${Date.now()}` }];
          }
          return prev;
        });
        break;
      case 'response.audio.delta':
        // Audio chunk from Azure TTS — decode base64 and queue for playback
        if (msg.delta) {
          playBase64Audio(msg.delta);
        }
        break;
      case 'response.audio.done':
        // All audio chunks received for this response
        break;
      case 'response.done':
        // Turn complete
        break;
      case 'error':
        setErrorMsg(msg.error?.message || msg.message || 'An error occurred');
        break;
      default:
        console.log('VLA event:', msg.type, msg);
    }
  }, [playBase64Audio, stopAudioPlayback]);

  // ── Mic functions (defined BEFORE connect so they can be used in WS handlers) ──

  const micPermissionRef = useRef<boolean>(false);
  const requestMicPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop()); // Release immediately
      micPermissionRef.current = true;
      console.log('🎤 Microphone permission granted');
    } catch (err: any) {
      setErrorMsg('Microphone access denied: ' + (err.message || ''));
    }
  }, []);

  const startListening = useCallback(async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('🎤 Cannot start: WebSocket not open');
      return;
    }
    if (isListening) return; // Already listening

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true },
      });
      streamRef.current = stream;

      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const float32 = e.inputBuffer.getChannelData(0);
          const int16 = new Int16Array(float32.length);
          for (let i = 0; i < float32.length; i++) {
            int16[i] = Math.max(-32768, Math.min(32767, Math.floor(float32[i] * 32768)));
          }
          const bytes = new Uint8Array(int16.buffer);
          const base64 = btoa(String.fromCharCode(...bytes));
          wsRef.current.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: base64,
          }));
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
      setIsListening(true);
    } catch (err: any) {
      setErrorMsg('Microphone access denied: ' + (err.message || ''));
    }
  }, [isListening]);

  // Use ref for stopListening so ws.onclose can call it without circular deps
  const stopListeningRef = useRef<() => void>(() => {});

  const stopListening = useCallback(() => {
    processorRef.current?.disconnect();
    audioContextRef.current?.close().catch(() => {});
    streamRef.current?.getTracks().forEach(t => t.stop());
    processorRef.current = null;
    audioContextRef.current = null;
    streamRef.current = null;
    setIsListening(false);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
    }
  }, []);
  stopListeningRef.current = stopListening;

  // Toggle mic: click once to start, click again to stop
  const toggleMic = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // ── Connect / Disconnect ───────────────────────────────────────────────────

  const connect = useCallback(async () => {
    setStatus('connecting');
    setErrorMsg('');

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const host = window.location.hostname;
      const ws = new WebSocket(`${protocol}://${host}:3001/api/voicelive/ws`);

      ws.binaryType = 'arraybuffer';

      ws.onopen = () => {
        setStatus('connected');
        setMessages([{
          id: 'system-connected',
          role: 'system',
          text: 'Connected to Voice Live API. Click the microphone button or press Space to speak.',
          timestamp: new Date(),
        }]);
        // Pre-request mic permission now so toggleMic is instant
        requestMicPermission();
      };

      ws.onmessage = (event) => {
        if (event.data instanceof ArrayBuffer) {
          playAudioData(event.data);
        } else {
          try {
            const msg = JSON.parse(event.data);
            handleVLAMessage(msg);
          } catch {
            console.warn('Unparseable WS message:', event.data);
          }
        }
      };

      ws.onerror = () => {
        setStatus('error');
        setErrorMsg('WebSocket connection failed. Ensure the server is running with the Voice Live API proxy enabled.');
      };

      ws.onclose = (e) => {
        setStatus(prev => {
          if (prev !== 'disconnected') {
            if (e.code !== 1000) {
              setErrorMsg(`Connection closed (code ${e.code})`);
            }
          }
          return 'disconnected';
        });
        stopListeningRef.current();
      };

      wsRef.current = ws;
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Failed to connect');
    }
  }, [handleVLAMessage, playAudioData, playBase64Audio, requestMicPermission]);

  const disconnect = useCallback(() => {
    stopListening();
    // Reset audio playback queue
    playbackCtxRef.current?.close().catch(() => {});
    playbackCtxRef.current = null;
    nextPlayTimeRef.current = 0;
    wsRef.current?.close(1000, 'User disconnected');
    wsRef.current = null;
    setStatus('disconnected');
    setMessages(prev => [...prev, {
      id: `system-${Date.now()}`,
      role: 'system',
      text: 'Disconnected.',
      timestamp: new Date(),
    }]);
  }, [stopListening]);

  // Space bar toggle: press to start/stop
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && status === 'connected' &&
          (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        e.preventDefault();
        toggleMic();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => { window.removeEventListener('keydown', handleKey); };
  }, [status, toggleMic]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopListening();
      wsRef.current?.close();
    };
  }, [stopListening]);

  return (
    <div className="vla-chatbot">
      {/* Status Bar */}
      <div className="vla-chatbot-status">
        <div className="vla-chatbot-status-left">
          <span className={`status-dot ${status} status-pulse`} />
          <span className="vla-chatbot-status-text">
            {status === 'disconnected' && 'Disconnected'}
            {status === 'connecting' && 'Connecting...'}
            {status === 'connected' && 'Connected to Voice Live API'}
            {status === 'error' && 'Connection Error'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            className="settings-btn"
            onClick={() => setShowSettings(true)}
            title="Voice Live API Settings"
          >
            <span className="settings-icon">⚙️</span>
            <span>Settings</span>
          </button>
          <button
            className={`vla-chatbot-connect-btn ${status === 'connected' ? 'disconnect' : ''}`}
            onClick={status === 'connected' ? disconnect : connect}
            disabled={status === 'connecting'}
          >
            {status === 'connected' ? '⏹ Disconnect' : '🔗 Connect'}
          </button>
        </div>
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="vla-chatbot-error">⚠️ {errorMsg}</div>
      )}

      {/* Transcript */}
      <div className="vla-chatbot-transcript">
        {messages.length === 0 && status === 'disconnected' && (
          <div className="vla-chatbot-empty">
            <div className="vla-chatbot-empty-icon">🎙️</div>
            <h4>Voice Live API Demo</h4>
            <p>Click <strong>Connect</strong> to start a real-time voice conversation powered by Azure Voice Live API.</p>
            <p className="vla-chatbot-empty-hint">
              This connects via WebSocket to Azure's Voice Live API, which handles STT + GPT-4o + TTS
              all in one server-side pipeline — no Speech SDK needed on the client.
              Click the 🎤 button (or press Space) to toggle the microphone.
            </p>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`vla-chatbot-message ${msg.role}`}>
            <div className="vla-chatbot-message-avatar">
              {msg.role === 'user' ? '👤' : msg.role === 'assistant' ? '🤖' : 'ℹ️'}
            </div>
            <div className="vla-chatbot-message-content">
              <div className="vla-chatbot-message-text">{msg.text}</div>
              <div className="vla-chatbot-message-time">
                {msg.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {currentTranscript && (
          <div className="vla-chatbot-message user interim">
            <div className="vla-chatbot-message-avatar">👤</div>
            <div className="vla-chatbot-message-content">
              <div className="vla-chatbot-message-text">{currentTranscript}</div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Controls */}
      <div className="vla-chatbot-controls">
        <button
          className={`vla-chatbot-mic-btn ${isListening ? 'listening' : ''}`}
          onClick={toggleMic}
          disabled={status !== 'connected'}
          title="Click to start/stop speaking (or press Space)"
        >
          <span className="vla-chatbot-mic-icon">{isListening ? '🔴' : '🎤'}</span>
          <span>{isListening ? 'Click to Stop' : 'Click to Speak'}</span>
        </button>
        <div className="vla-chatbot-hint">
          {status === 'connected'
            ? (isListening ? 'Speaking... click button or press Space to stop' : 'Click the button or press Space to talk')
            : 'Connect first to start speaking'}
        </div>
      </div>

      {/* ── VLA Settings Panel ──────────────────────────────────────────────── */}
      {showSettings && (
        <div className="settings-panel-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-panel" onClick={e => e.stopPropagation()}>
            <div className="settings-panel-header" style={{ background: 'linear-gradient(135deg, #0078d4 0%, #106ebe 100%)' }}>
              <div className="settings-title">
                <span className="settings-icon">⚙️</span>
                <h3>Voice Live API Settings</h3>
              </div>
              <button className="settings-close" onClick={() => setShowSettings(false)}>✕</button>
            </div>
            <div className="settings-content" style={{ padding: '20px', overflowY: 'auto' }}>

              {/* Voice Selection */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '0.95rem' }}>
                  🗣️ Voice
                </label>
                <p style={{ fontSize: '0.82rem', color: '#666', margin: '0 0 10px 0' }}>
                  Azure neural voice for TTS output. Changes apply instantly via <code>session.update</code> — no reconnect needed.
                </p>
                <select
                  value={vlaSettings.voiceName}
                  onChange={e => updateSetting('voiceName', e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                    border: '1px solid #ddd', fontSize: '0.9rem', background: '#fafafa',
                  }}
                >
                  {VLA_VOICE_OPTIONS.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.id})</option>
                  ))}
                </select>
              </div>

              {/* Turn Detection Mode */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '0.95rem' }}>
                  🎯 Turn Detection
                </label>
                <p style={{ fontSize: '0.82rem', color: '#666', margin: '0 0 10px 0' }}>
                  <strong>Server VAD</strong> = hands-free with barge-in (server detects when you speak).<br />
                  <strong>None</strong> = manual push-to-talk only (you control when audio is sent).
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => updateSetting('turnDetection', 'server_vad')}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer',
                      border: vlaSettings.turnDetection === 'server_vad' ? '2px solid #0078d4' : '1px solid #ddd',
                      background: vlaSettings.turnDetection === 'server_vad' ? '#e8f4fd' : '#fafafa',
                      fontWeight: vlaSettings.turnDetection === 'server_vad' ? 600 : 400,
                    }}
                  >
                    🎙️ Server VAD<br />
                    <span style={{ fontSize: '0.75rem', color: '#666' }}>Hands-free + Barge-in</span>
                  </button>
                  <button
                    onClick={() => updateSetting('turnDetection', 'none')}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer',
                      border: vlaSettings.turnDetection === 'none' ? '2px solid #0078d4' : '1px solid #ddd',
                      background: vlaSettings.turnDetection === 'none' ? '#e8f4fd' : '#fafafa',
                      fontWeight: vlaSettings.turnDetection === 'none' ? 600 : 400,
                    }}
                  >
                    👆 Push-to-Talk<br />
                    <span style={{ fontSize: '0.75rem', color: '#666' }}>Manual control</span>
                  </button>
                </div>
              </div>

              {/* VAD Threshold (only when server_vad) */}
              {vlaSettings.turnDetection === 'server_vad' && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '0.95rem' }}>
                    📊 VAD Sensitivity — {vlaSettings.vadThreshold.toFixed(2)}
                  </label>
                  <p style={{ fontSize: '0.82rem', color: '#666', margin: '0 0 10px 0' }}>
                    How sensitive the server is to detecting speech. Lower = more sensitive (easier to barge-in), Higher = less sensitive.
                  </p>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={vlaSettings.vadThreshold}
                    onChange={e => updateSetting('vadThreshold', parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#0078d4' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#999' }}>
                    <span>More sensitive (0.0)</span>
                    <span>Less sensitive (1.0)</span>
                  </div>
                </div>
              )}

              {/* Silence Duration (only when server_vad) */}
              {vlaSettings.turnDetection === 'server_vad' && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '0.95rem' }}>
                    🔇 Silence Duration — {vlaSettings.silenceDurationMs}ms
                  </label>
                  <p style={{ fontSize: '0.82rem', color: '#666', margin: '0 0 10px 0' }}>
                    How long to wait after you stop speaking before processing your input.
                  </p>
                  <input
                    type="range"
                    min="200"
                    max="2000"
                    step="100"
                    value={vlaSettings.silenceDurationMs}
                    onChange={e => updateSetting('silenceDurationMs', parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: '#0078d4' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#999' }}>
                    <span>Fast (200ms)</span>
                    <span>Patient (2000ms)</span>
                  </div>
                </div>
              )}

              {/* Info note */}
              <div style={{
                background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px',
                padding: '12px', fontSize: '0.82rem', color: '#0369a1',
              }}>
                💡 <strong>VLA-exclusive:</strong> All settings are applied instantly via <code>session.update</code> over the WebSocket.
                No reconnection needed — unlike Tab 1 &amp; 2 where changing voice requires a full reconnect.
                {status !== 'connected' && (
                  <span style={{ display: 'block', marginTop: '6px', color: '#b45309' }}>
                    ⚠️ Connect first — settings will be sent on next connection.
                  </span>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '12px 20px', borderTop: '1px solid #eee', display: 'flex',
              justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: '0.8rem', color: '#888' }}>Voice Live API • session.update</span>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  padding: '8px 24px', background: '#0078d4', color: 'white',
                  border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Main VoiceLiveAPI Component
// ═══════════════════════════════════════════════════════════════════════════════

export const VoiceLiveAPI: React.FC = () => {
  const [activeTab, setActiveTab] = useState<VLATabId>('chat');

  return (
    <div className="chat-container vla-container">
      {/* Hero Banner */}
      <div className="vla-hero-banner">
        <div className="vla-hero-content">
          <div className="vla-hero-icon">🎙️</div>
          <div>
            <h2 className="vla-hero-title">Voice Live API</h2>
            <p className="vla-hero-subtitle">
              The next generation of voice integration for Azure AI &amp; Copilot Studio
            </p>
          </div>
          <div className="vla-hero-badges">
            <span className="vla-badge vla-badge-new">NEW</span>
            <span className="vla-badge vla-badge-ga">GA</span>
          </div>
        </div>
        <p className="vla-hero-description">
          Voice Live API replaces Direct Line Speech with a modern, server-to-server WebSocket architecture.
          Built-in speech recognition, text-to-speech, and generative AI — no client-side Speech SDK required.
        </p>
      </div>

      {/* Inner Sub-Tab Navigation */}
      <nav className="inner-tab-nav vla-accent">
        {VLA_TABS.map(tab => (
          <button
            key={tab.id}
            className={`inner-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="inner-tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ── ChatBot Tab ─────────────────────────────────────────────────────── */}
      {activeTab === 'chat' && <VLAChatBot />}

      {/* ── Architecture Tab ────────────────────────────────────────────────── */}
      {activeTab === 'architecture' && (
        <div className="info-panel-content vla-accent">
          <div className="info-panel-header vla-accent">
            <span className="info-panel-icon">🏗️</span>
            <h3>Architecture Overview</h3>
          </div>

          <div className="info-panel-section">
            <p>
              Voice Live API is fundamentally different from the approaches used in Tab 1 and Tab 2 of this demo.
            </p>
            <ul>
              <li><strong>Tab 1 (Speech Ponyfill) &amp; Tab 2 (Proxy Bot)</strong> both use the client-side Azure Speech SDK running in the browser for speech-to-text and text-to-speech. The bot communication travels separately over Direct Line. Speech and bot messaging are two independent channels.</li>
              <li><strong>Voice Live API</strong> eliminates the client-side Speech SDK entirely. Instead, your server opens a single WebSocket to Azure, which handles STT + a built-in generative AI model (GPT-4o, GPT-5, Phi, etc.) + TTS — all in one unified server-side pipeline. The browser only needs to stream raw audio via the Web Audio API.</li>
            </ul>
          </div>

          <div className="info-panel-diagram">
            <div className="info-panel-diagram-label">Architecture Comparison</div>
            <pre>{`Tab 1 & 2 (this demo):                    Voice Live API:

┌────────────┐  Direct Line   ┌──────────┐   ┌────────────┐  WebSocket    ┌──────────────────┐
│  Browser   │───────────────▶│ Copilot  │   │  Browser   │─────────────▶│  Your Server     │
│            │  Speech SDK    │ Studio / │   │  (raw audio│               │  (relay)         │
│  STT + TTS │◀─ ponyfill ──▶│ Proxy Bot│   │  only)     │◀─────────────│                  │
│  (client)  │  (in browser)  └──────────┘   └────────────┘  audio stream └────────┬─────────┘
└────────────┘                                                                     │ WebSocket
                                                                          ┌────────▼─────────┐
 Two separate channels:                                                   │ Azure Voice Live │
   1. Direct Line (messages)                                              │ API              │
   2. Speech SDK (voice)                                                  │ STT + GPT + TTS  │
                                                                          │ (all server-side)│
                                                                          └──────────────────┘`}</pre>
          </div>

          <div className="info-panel-section">
            <h4>Key Components</h4>
            <div className="info-panel-grid">
              <div className="info-grid-card">
                <strong>WebSocket Connection</strong>
                <p>Server opens a persistent WebSocket to Azure Voice Live API. All communication (audio in, text events, audio out) flows over this single connection.</p>
              </div>
              <div className="info-grid-card">
                <strong>Built-in AI Model</strong>
                <p>No external bot needed. Voice Live API includes GPT-4o, GPT-5, or Phi models with tool/function calling, system prompts, and conversation memory.</p>
              </div>
              <div className="info-grid-card">
                <strong>Server-Side STT + TTS</strong>
                <p>Speech recognition and synthesis happen entirely on Azure's servers. The browser only captures/plays raw PCM audio via the Web Audio API.</p>
              </div>
              <div className="info-grid-card">
                <strong>Native Barge-In</strong>
                <p>Echo cancellation and interruption detection are built into the API. No custom BargeInController needed (unlike Tab 1 &amp; 2).</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Connection Flow Tab ─────────────────────────────────────────────── */}
      {activeTab === 'connection' && (
        <div className="info-panel-content vla-accent">
          <div className="info-panel-header vla-accent">
            <span className="info-panel-icon">🔌</span>
            <h3>Connection Flow</h3>
          </div>

          <div className="info-panel-section">
            <p>
              The Voice Live API connection flow is completely different from Tab 1 and Tab 2.
              Your server opens a single WebSocket — no Speech SDK, no Direct Line protocol.
            </p>
          </div>

          <div className="info-panel-flow">
            {[
              {
                step: 1,
                title: 'Client connects to your server',
                detail: 'The browser opens a WebSocket to your server at /api/voicelive/ws. Your server acts as a relay between the browser and Azure.',
              },
              {
                step: 2,
                title: 'Server connects to Voice Live API',
                detail: 'Your server opens a WebSocket to Azure Voice Live API with the API key in the header.',
                code: `const ws = new WebSocket(\n  'wss://{endpoint}/voice-live/realtime'\n  + '?api-version=2025-10-01&model=gpt-4o',\n  { headers: { 'api-key': SPEECH_KEY } }\n);`,
              },
              {
                step: 3,
                title: 'Configure the session',
                detail: 'Server sends a session.update message to configure language, voice, system prompt, and tools.',
                code: `ws.send(JSON.stringify({\n  type: 'session.update',\n  session: {\n    voice: 'alloy',\n    instructions: 'You are a helpful assistant...',\n    input_audio_format: 'pcm16',\n    output_audio_format: 'pcm16',\n    input_audio_transcription: { model: 'whisper-1' },\n    turn_detection: { type: 'server_vad' },\n  }\n}));`,
              },
              {
                step: 4,
                title: 'Stream audio in both directions',
                detail: 'Client captures microphone audio via Web Audio API, sends PCM to server, server relays to Azure. Azure sends back recognized text, AI response text, and TTS audio.',
              },
              {
                step: 5,
                title: 'Receive events',
                detail: 'Azure sends JSON events for speech recognition, AI responses, and audio data. Your server relays these to the browser.',
                code: `// Events from Azure VLA:\n'input_audio_buffer.speech_started'\n'conversation.item.input_audio_transcription.completed'\n'response.audio_transcript.delta'  // streaming text\n'response.audio.delta'             // streaming audio\n'response.done'                    // turn complete`,
              },
            ].map(step => (
              <div key={step.step} className="info-flow-step">
                <div className="info-flow-number">{step.step}</div>
                <div className="info-flow-content">
                  <strong>{step.title}</strong>
                  <p>{step.detail}</p>
                  {step.code && (
                    <pre className="info-flow-code"><code>{step.code}</code></pre>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="info-panel-section">
            <h4>Sequence Diagram</h4>
            <div className="info-panel-diagram">
              <pre>{`Browser                Your Server            Azure Voice Live API
  │                        │                          │
  │── WS connect ─────────▶│                          │
  │                        │── WS connect ───────────▶│
  │                        │   (api-key header)       │
  │                        │◀─ session.created ───────│
  │                        │── session.update ────────▶│
  │                        │◀─ session.updated ───────│
  │◀─ { connected } ──────│                          │
  │                        │                          │
  │🎤 User holds mic       │                          │
  │── PCM audio (base64) ─▶│                          │
  │                        │── input_audio_buffer ───▶│
  │                        │   .append (base64)       │
  │                        │                          │
  │                        │◀─ speech_started ────────│
  │                        │◀─ transcription ─────────│
  │◀─ user transcript ────│                          │
  │                        │                          │
  │                        │◀─ response.audio_ ──────│
  │                        │   transcript.delta       │
  │◀─ bot text (stream) ──│                          │
  │                        │◀─ response.audio.delta ──│
  │◀─ audio (binary) ─────│                          │
  │🔊 Plays audio          │                          │
  │                        │◀─ response.done ─────────│`}</pre>
            </div>
          </div>
        </div>
      )}

      {/* ── Resources Tab ───────────────────────────────────────────────────── */}
      {activeTab === 'resources' && (
        <div className="info-panel-content vla-accent">
          <div className="info-panel-header vla-accent">
            <span className="info-panel-icon">📚</span>
            <h3>Resources</h3>
          </div>

          <div className="info-panel-resources">
            <div className="info-resource-category">
              <h4>Voice Live API Documentation</h4>
              <div className="info-resource-links">
                {RESOURCE_LINKS.map((link, idx) => (
                  <a key={idx} className="info-resource-card" href={link.url} target="_blank" rel="noopener noreferrer">
                    <div className="info-resource-title">{link.title} <span className="info-external-icon">↗</span></div>
                    <div className="info-resource-desc">{link.description}</div>
                  </a>
                ))}
              </div>
            </div>

            <div className="info-resource-category">
              <h4>Related Technologies</h4>
              <div className="info-resource-links">
                <a className="info-resource-card" href="https://learn.microsoft.com/azure/ai-services/speech-service/" target="_blank" rel="noopener noreferrer">
                  <div className="info-resource-title">Azure Speech Service ↗</div>
                  <div className="info-resource-desc">Comprehensive speech services — STT, TTS, translation, speaker recognition</div>
                </a>
                <a className="info-resource-card" href="https://learn.microsoft.com/azure/ai-services/openai/realtime-audio-quickstart" target="_blank" rel="noopener noreferrer">
                  <div className="info-resource-title">Azure OpenAI Realtime Audio ↗</div>
                  <div className="info-resource-desc">Realtime audio API for GPT models — the foundation Voice Live API builds on</div>
                </a>
                <a className="info-resource-card" href="https://github.com/Azure-Samples/aoai-realtime-audio-sdk" target="_blank" rel="noopener noreferrer">
                  <div className="info-resource-title">Realtime Audio SDK Samples ↗</div>
                  <div className="info-resource-desc">GitHub samples for Azure OpenAI realtime audio integration</div>
                </a>
              </div>
            </div>
          </div>

          <div className="info-panel-section">
            <h4>📂 Key Files in This Demo</h4>
            <div className="info-file-list">
              <div className="info-file-item">
                <code>components/VoiceLiveAPI.tsx</code>
                <span>This component — ChatBot UI, WebSocket client, audio capture/playback</span>
              </div>
              <div className="info-file-item">
                <code>server/routes/voiceLiveRoutes.ts</code>
                <span>Server WebSocket proxy — relays audio between browser and Azure VLA</span>
              </div>
              <div className="info-file-item">
                <code>server/src/index.ts</code>
                <span>Express server with WebSocket upgrade handler for /api/voicelive/ws</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── VLA vs DLS Comparison Tab ───────────────────────────────────────── */}
      {activeTab === 'vs-dls' && (
        <div className="info-panel-content vla-accent">
          <div className="info-panel-header vla-accent">
            <span className="info-panel-icon">⚖️</span>
            <h3>Voice Live API vs Direct Line Speech</h3>
          </div>

          <div className="info-panel-section">
            <p>How Voice Live API compares with the approaches used in Tab 1 (Speech Ponyfill), Tab 2 (Proxy Bot), and the deprecated DLS channel from Tab 3.</p>
          </div>

          <div className="vla-comparison">
            <table className="vla-comparison-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th className="vla-col-dls">
                    <span className="vla-col-icon">⚡</span> Tab 1 &amp; 2 / DLS (Current)
                  </th>
                  <th className="vla-col-vla">
                    <span className="vla-col-icon">🎙️</span> Voice Live API
                    <span className="vla-active-tag">ACTIVE</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_DATA.map((row, idx) => (
                  <tr key={idx}>
                    <td className="vla-feature-cell">{row.feature}</td>
                    <td className="vla-dls-cell">{row.dls}</td>
                    <td className="vla-vla-cell">{row.vla}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Resources & Next Steps Tab ──────────────────────────────────────── */}
      {activeTab === 'next-steps' && (
        <div className="info-panel-content vla-accent">
          <div className="info-panel-header vla-accent">
            <span className="info-panel-icon">🚀</span>
            <h3>Resources &amp; Next Steps</h3>
          </div>

          <div className="info-panel-section">
            <h4>Migration Path from DLS</h4>
            <p>
              Migrating from Direct Line Speech to Voice Live API involves architectural changes.
              The key shift is from client-side SDK to server-side WebSocket relay.
            </p>
          </div>

          <div className="info-panel-flow">
            {[
              { step: 1, title: 'Assess current DLS integration', detail: 'Identify DLS-specific code: createDirectLineSpeechAdapters, BotFrameworkConfig, DialogServiceConnector' },
              { step: 2, title: 'Set up server-side relay', detail: 'Create a WebSocket server that accepts client audio and forwards it to Voice Live API' },
              { step: 3, title: 'Replace client Speech SDK', detail: 'Use Web Audio API (AudioContext, MediaRecorder) instead of botframework-directlinespeech-sdk' },
              { step: 4, title: 'Update authentication', detail: 'Voice Live API supports Azure AD and API keys — no Bot Connector auth needed' },
              { step: 5, title: 'Test with Copilot Studio', detail: 'Voice Live API integrates natively with Copilot Studio agents' },
            ].map(step => (
              <div key={step.step} className="info-flow-step">
                <div className="info-flow-number">{step.step}</div>
                <div className="info-flow-content">
                  <strong>{step.title}</strong>
                  <p>{step.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="info-panel-resources">
            <div className="info-resource-category">
              <h4>Official Documentation</h4>
              <div className="info-resource-links">
                {RESOURCE_LINKS.map((link, idx) => (
                  <a key={idx} className="info-resource-card" href={link.url} target="_blank" rel="noopener noreferrer">
                    <div className="info-resource-title">{link.title} <span className="info-external-icon">↗</span></div>
                    <div className="info-resource-desc">{link.description}</div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="vla-status-footer" style={{ marginTop: '24px' }}>
            <div className="vla-status-item">
              <span className="vla-status-icon">💬</span>
              <span>Use the <strong>ChatBot</strong> sub-tab to try Voice Live API live.</span>
            </div>
            <div className="vla-status-item">
              <span className="vla-status-icon">🔊</span>
              <span>For the current working voice demo, see <strong>Tab 1 (Speech Ponyfill)</strong> or <strong>Tab 2 (Proxy Bot)</strong>.</span>
            </div>
            <div className="vla-status-item">
              <span className="vla-status-icon">📞</span>
              <span>For telephony, see <strong>Tab 5 (Telephony / IVR)</strong>.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceLiveAPI;
