/**
 * Text Utilities for Speech
 * =========================
 * Utility functions to prepare text for speech synthesis.
 * Strips markdown and other formatting that shouldn't be spoken.
 *
 * FROZEN: Feb 6, 2026
 *
 * This module contains:
 *
 * 1. stripMarkdownForSpeech(text)  — Strips markdown from bot messages before TTS.
 *    Used by the middleware to clean bot responses so the ponyfill doesn't speak
 *    asterisks, hashtags, link URLs, etc.
 *
 * 2. BargeInController  — Monitors microphone volume via Web Audio API and triggers
 *    a callback when the user speaks above a threshold for a sustained duration.
 *    The callback calls speechSynthesis.cancel() on the ponyfill's own instance
 *    to stop TTS audio immediately.
 *
 *    STATUS: ⚠️  EXPERIMENTAL — The BargeInController initializes its own AudioContext
 *    and getUserMedia stream. Browser restrictions may prevent AudioContext from
 *    resuming without a user gesture. The controller has a late-init fallback that
 *    retries initialization when startMonitoring() is called.
 *
 *    KNOWN LIMITATION: The barge-in cancel calls ponyfill speechSynthesis.cancel()
 *    directly which stops audio, but Web Chat's internal speaking state may not
 *    update (no dispatch into the store from middleware to avoid re-entrant crashes).
 *    This means the UI "speaking" indicator may stay on briefly after cancel.
 *
 * 3. createSpeechMiddleware(options) — Redux-style middleware for botframework-webchat's
 *    createStore(). Observes Web Chat actions to:
 *      - Track speech activity state (idle/listening/processing/speaking)
 *      - Start/stop barge-in monitoring when bot speaks
 *      - Strip markdown from incoming bot messages before TTS
 *      - Set inputHint on messages that lack one
 *
 *    IMPORTANT: This middleware must NOT call dispatch() — doing so re-enters the
 *    Web Chat store during action processing and causes "Render error" crashes.
 *    All side-effects (TTS cancel, barge-in) use external callbacks instead.
 *
 * Settings Wiring Summary (see also VoiceSettingsPanel.tsx and README.md):
 * ┌───────────────────────┬─────────────────────────────────────────────────────────┬──────────┐
 * │ Setting               │ Where it takes effect                                   │ Status   │
 * ├───────────────────────┼─────────────────────────────────────────────────────────┼──────────┤
 * │ locale                │ Ponyfill credentials (server) + Web Chat locale prop    │ ✅ Works │
 * │ voice                 │ Ponyfill speechSynthesisVoiceName (hook)                │ ✅ Works │
 * │ speechRate            │ PatchedUtterance wrapper in hook (rate property)         │ ✅ Works │
 * │ speechPitch           │ PatchedUtterance wrapper in hook (pitch property)        │ ✅ Works │
 * │ continuousRecognition │ styleOptions.speechRecognitionContinuous (component)     │ ✅ Works │
 * │ autoStartMic          │ Ctrl+M keyboard event after connect (component)          │ ✅ Works │
 * │ autoResumeListening   │ Ctrl+M after 'speaking'→'idle' transition (component)   │ ✅ Works │
 * │ bargeInEnabled        │ BargeInController.setConfig() (component)                │ ⚠️ Exp.  │
 * │ bargeInSensitivity    │ BargeInController.setConfig() (component)                │ ⚠️ Exp.  │
 * │ interimResults        │ NOT wired — Web Chat DictateComposer controls internally │ ❌ N/A   │
 * │ silenceTimeoutMs      │ NOT wired — Azure Speech SDK recognizer controls this    │ ❌ N/A   │
 * └───────────────────────┴─────────────────────────────────────────────────────────┴──────────┘
 */

import type { DirectLineSpeechSettings, PonyfillSettings } from '../components/VoiceSettingsPanel';

/**
 * Strip markdown syntax from text for TTS
 * Removes asterisks, hashtags, links, code blocks, etc.
 */
export function stripMarkdownForSpeech(text: string): string {
  if (!text) return '';
  
  let cleaned = text;
  
  // Remove code blocks (```...```)
  cleaned = cleaned.replace(/```[\s\S]*?```/g, ' code block ');
  
  // Remove inline code (`...`)
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
  
  // Remove images ![alt](url)
  cleaned = cleaned.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');
  
  // Convert links [text](url) to just the text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  // Remove bold/italic markers (**, __, *, _)
  cleaned = cleaned.replace(/\*\*\*([^*]+)\*\*\*/g, '$1'); // ***bold italic***
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');     // **bold**
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');         // *italic*
  cleaned = cleaned.replace(/___([^_]+)___/g, '$1');       // ___bold italic___
  cleaned = cleaned.replace(/__([^_]+)__/g, '$1');         // __bold__
  cleaned = cleaned.replace(/_([^_]+)_/g, '$1');           // _italic_
  
  // Remove strikethrough (~~text~~)
  cleaned = cleaned.replace(/~~([^~]+)~~/g, '$1');
  
  // Remove headers (# ## ### etc.)
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
  
  // Remove horizontal rules (---, ***, ___)
  cleaned = cleaned.replace(/^[-*_]{3,}\s*$/gm, '');
  
  // Remove blockquotes (> text)
  cleaned = cleaned.replace(/^>\s+/gm, '');
  
  // Remove unordered list markers (- * +)
  cleaned = cleaned.replace(/^[\s]*[-*+]\s+/gm, '');
  
  // Remove ordered list markers (1. 2. etc.)
  cleaned = cleaned.replace(/^[\s]*\d+\.\s+/gm, '');
  
  // Remove HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, '');
  
  // Remove extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ');
  
  // Trim
  cleaned = cleaned.trim();
  
  return cleaned;
}

/**
 * Speech activity types that Web Chat dispatches
 */
export type SpeechActivityType = 
  | 'idle'
  | 'listening'
  | 'processing'
  | 'speaking';

/**
 * Barge-in sensitivity presets
 */
export const BARGE_IN_PRESETS = {
  low: { detectionDelayMs: 500, volumeThreshold: 0.5 },
  medium: { detectionDelayMs: 200, volumeThreshold: 0.3 },
  high: { detectionDelayMs: 50, volumeThreshold: 0.15 },
};

/**
 * Barge-in controller for stopping TTS when user speaks.
 *
 * FROZEN: Feb 6, 2026
 * STATUS: ⚠️ EXPERIMENTAL
 *
 * How it works:
 * 1. initialize() — Creates an AudioContext + getUserMedia stream, connects
 *    to an AnalyserNode for real-time volume monitoring.
 * 2. startMonitoring(onBargeIn) — Polls volume every 50ms. If normalized
 *    volume exceeds the threshold for longer than detectionDelayMs, triggers
 *    onBargeIn callback. Has a late-init fallback if initialize() failed.
 * 3. stopMonitoring() — Stops the polling interval.
 * 4. destroy() — Stops monitoring, closes stream & AudioContext.
 *
 * The onBargeIn callback (set by the component) calls:
 *   speechSynthesisRef.current.cancel()  — stops ponyfill TTS audio
 *   onSpeechActivity('idle')             — updates UI state
 *
 * Known issues:
 * - AudioContext may start suspended (browser restriction). The controller
 *   tries to resume it, but some browsers block this without user gesture.
 * - The ponyfill's speechSynthesis.cancel() stops audio but Web Chat's
 *   internal speaking state is not updated (we cannot dispatch from middleware).
 * - Volume threshold may need tuning for different microphones/environments.
 */
export class BargeInController {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private volumeCheckInterval: number | null = null;
  private sensitivity: 'low' | 'medium' | 'high' = 'medium';
  private enabled: boolean = true;
  private onBargeIn: (() => void) | null = null;
  private isMonitoring: boolean = false;

  async initialize(): Promise<void> {
    try {
      this.audioContext = new AudioContext();
      
      // AudioContext often starts suspended — must resume it
      if (this.audioContext.state === 'suspended') {
        console.log('🎤 AudioContext suspended, resuming...');
        await this.audioContext.resume();
      }
      console.log(`🎤 AudioContext state: ${this.audioContext.state}`);
      
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log(`🎤 Got microphone stream with ${this.mediaStream.getAudioTracks().length} track(s)`);
      
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);
      
      console.log('✅ Barge-in controller initialized (analyser ready)');
    } catch (error) {
      console.error('❌ Could not initialize barge-in audio monitoring:', error);
      this.analyser = null;
    }
  }

  setConfig(enabled: boolean, sensitivity: 'low' | 'medium' | 'high'): void {
    this.enabled = enabled;
    this.sensitivity = sensitivity;
    console.log(`⚙️ Barge-in config: enabled=${enabled}, sensitivity=${sensitivity}`);
  }

  startMonitoring(onBargeIn: () => void): void {
    if (!this.enabled) {
      console.log('⏭️ Barge-in: skipping monitoring (disabled)');
      return;
    }
    if (!this.analyser) {
      console.warn('⚠️ Barge-in: analyser is null — mic not initialized. Trying to re-initialize...');
      // Try to initialize now (user has already interacted with page)
      this.initialize().then(() => {
        if (this.analyser) {
          console.log('✅ Barge-in: late initialization succeeded, starting monitoring');
          this.startMonitoring(onBargeIn);
        } else {
          console.error('❌ Barge-in: late initialization failed, analyser still null');
        }
      });
      return;
    }
    if (this.isMonitoring) {
      console.log('⏭️ Barge-in: already monitoring');
      return;
    }
    
    // Resume AudioContext if suspended (can happen without user gesture)
    if (this.audioContext?.state === 'suspended') {
      console.log('🎤 Resuming suspended AudioContext...');
      this.audioContext.resume();
    }
    
    this.isMonitoring = true;
    this.onBargeIn = onBargeIn;
    
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    const preset = BARGE_IN_PRESETS[this.sensitivity];
    
    let speechDetectedTime: number | null = null;
    let bargeInTriggered = false;
    let logCount = 0;
    
    console.log(`🎤 Barge-in: monitoring STARTED (sensitivity=${this.sensitivity}, threshold=${preset.volumeThreshold}, delay=${preset.detectionDelayMs}ms)`);
    
    this.volumeCheckInterval = window.setInterval(() => {
      if (!this.analyser || bargeInTriggered) return;
      
      this.analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      const normalizedVolume = average / 255;
      
      // Log volume periodically so user can see it's working
      logCount++;
      if (logCount % 20 === 0) { // Every ~1 second (50ms * 20)
        console.log(`🎤 Barge-in: volume=${normalizedVolume.toFixed(3)}, threshold=${preset.volumeThreshold}, speaking=${speechDetectedTime ? 'yes' : 'no'}`);
      }
      
      if (normalizedVolume > preset.volumeThreshold) {
        if (!speechDetectedTime) {
          speechDetectedTime = Date.now();
          console.log(`🎤 Barge-in: speech detected! volume=${normalizedVolume.toFixed(3)} > ${preset.volumeThreshold}`);
        } else if (Date.now() - speechDetectedTime > preset.detectionDelayMs) {
          // User has been speaking long enough - trigger barge-in
          bargeInTriggered = true;
          console.log(`🛑 Barge-in TRIGGERED! Sustained speech for ${Date.now() - speechDetectedTime}ms`);
          this.onBargeIn?.();
          this.stopMonitoring();
        }
      } else {
        speechDetectedTime = null;
      }
    }, 50);
  }

  stopMonitoring(): void {
    if (this.volumeCheckInterval) {
      clearInterval(this.volumeCheckInterval);
      this.volumeCheckInterval = null;
    }
    this.isMonitoring = false;
  }

  destroy(): void {
    this.stopMonitoring();
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }
    
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

/**
 * Options for creating the speech middleware
 */
export interface SpeechMiddlewareOptions {
  onSpeechActivity?: (activity: SpeechActivityType) => void;
  bargeInController?: BargeInController;
  settings?: DirectLineSpeechSettings | PonyfillSettings;
  onStopSpeaking?: () => void;
}

/**
 * Create a middleware for Web Chat that:
 * 1. Strips markdown from bot messages before TTS
 * 2. Tracks speech activity for the code panel
 * 3. Handles barge-in when enabled
 */
export function createSpeechMiddleware(options: SpeechMiddlewareOptions = {}) {
  const { onSpeechActivity, bargeInController, onStopSpeaking } = options;
  
  return () => (next: (action: any) => any) => (action: any) => {
    // Track speech-related actions
    switch (action.type) {
      case 'WEB_CHAT/START_DICTATE':
        onSpeechActivity?.('listening');
        break;
        
      case 'WEB_CHAT/STOP_DICTATE':
        onSpeechActivity?.('idle');
        break;
        
      case 'WEB_CHAT/SET_DICTATE_STATE':
        if (action.payload?.dictateState === 1) { // STARTING
          onSpeechActivity?.('listening');
          bargeInController?.stopMonitoring();
          // User started talking — cancel TTS via ponyfill
          onStopSpeaking?.();
        } else if (action.payload?.dictateState === 3) { // STOPPING
          onSpeechActivity?.('processing');
        } else if (action.payload?.dictateState === 0) { // IDLE
          onSpeechActivity?.('idle');
        }
        break;
        
      case 'WEB_CHAT/START_SPEAKING_ACTIVITY':
        onSpeechActivity?.('speaking');
        // Start monitoring for barge-in while bot is speaking
        bargeInController?.startMonitoring(() => {
          console.log('🛑 Barge-in triggered — cancelling ponyfill TTS');
          onStopSpeaking?.();
          onSpeechActivity?.('idle');
        });
        break;
        
      case 'WEB_CHAT/STOP_SPEAKING_ACTIVITY':
        bargeInController?.stopMonitoring();
        onSpeechActivity?.('idle');
        break;
        
      case 'DIRECT_LINE/POST_ACTIVITY':
        if (action.payload?.activity?.type === 'message') {
          onSpeechActivity?.('processing');
        }
        break;
    }
    
    // Intercept incoming activities to strip markdown for TTS
    if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
      const activity = action.payload?.activity;
      
      if (activity?.type === 'message' && activity?.text) {
        // If there's no explicit speak property, create one from cleaned text
        if (!activity.speak) {
          activity.speak = stripMarkdownForSpeech(activity.text);
        } else {
          // Also clean the speak property in case it has markdown
          activity.speak = stripMarkdownForSpeech(activity.speak);
        }
        
        // If no inputHint is set, default to acceptingInput
        // This tells Web Chat the bot is ready for more input
        // Note: 'expectingInput' would re-open the mic after speech
        if (!activity.inputHint) {
          activity.inputHint = 'acceptingInput';
        }
      }
    }
    
    return next(action);
  };
}

/**
 * Legacy function for backwards compatibility
 */
export function createMarkdownStripMiddleware(onSpeechActivity?: (activity: SpeechActivityType) => void) {
  return createSpeechMiddleware({ onSpeechActivity });
}

export default stripMarkdownForSpeech;
