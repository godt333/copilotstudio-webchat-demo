/**
 * Text Utilities for Speech
 * =========================
 * Utility functions to prepare text for speech synthesis.
 * Strips markdown and other formatting that shouldn't be spoken.
 */

import { DirectLineSpeechSettings, PonyfillSettings } from '../components/VoiceSettingsPanel';

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
 * Barge-in controller for stopping TTS when user speaks
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
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);
      
      console.log('🎤 Barge-in controller initialized');
    } catch (error) {
      console.warn('Could not initialize barge-in audio monitoring:', error);
    }
  }

  setConfig(enabled: boolean, sensitivity: 'low' | 'medium' | 'high'): void {
    this.enabled = enabled;
    this.sensitivity = sensitivity;
    console.log(`⚙️ Barge-in config: enabled=${enabled}, sensitivity=${sensitivity}`);
  }

  startMonitoring(onBargeIn: () => void): void {
    if (!this.enabled || !this.analyser || this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.onBargeIn = onBargeIn;
    
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    const preset = BARGE_IN_PRESETS[this.sensitivity];
    
    let speechDetectedTime: number | null = null;
    let bargeInTriggered = false;
    
    this.volumeCheckInterval = window.setInterval(() => {
      if (!this.analyser || bargeInTriggered) return;
      
      this.analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      const normalizedVolume = average / 255;
      
      if (normalizedVolume > preset.volumeThreshold) {
        if (!speechDetectedTime) {
          speechDetectedTime = Date.now();
        } else if (Date.now() - speechDetectedTime > preset.detectionDelayMs) {
          // User has been speaking long enough - trigger barge-in
          bargeInTriggered = true;
          console.log('🛑 Barge-in triggered! User is speaking.');
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
          // If we were speaking and user starts dictating, trigger barge-in
          bargeInController?.stopMonitoring();
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
          onStopSpeaking?.();
          onSpeechActivity?.('listening');
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
