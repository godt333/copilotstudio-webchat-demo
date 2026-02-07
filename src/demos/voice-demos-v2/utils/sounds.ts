/**
 * Sound Effects Utility
 * =====================
 * Provides audio feedback for chat events.
 * Uses Web Audio API for better performance.
 */

// Audio context for generating sounds
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

/**
 * Play a beep/notification sound
 */
const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) => {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.value = volume;
    
    // Fade out
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Sound playback failed:', e);
  }
};

/**
 * Sound when user sends a message
 */
export const playMessageSent = () => {
  playTone(800, 0.1, 'sine', 0.08);
  setTimeout(() => playTone(1000, 0.1, 'sine', 0.06), 50);
};

/**
 * Sound when bot message is received
 */
export const playMessageReceived = () => {
  playTone(600, 0.15, 'sine', 0.08);
  setTimeout(() => playTone(800, 0.1, 'sine', 0.06), 100);
};

/**
 * Sound when connected successfully
 */
export const playConnected = () => {
  playTone(440, 0.1, 'sine', 0.1);
  setTimeout(() => playTone(554, 0.1, 'sine', 0.1), 100);
  setTimeout(() => playTone(659, 0.15, 'sine', 0.1), 200);
};

/**
 * Sound when disconnected or error
 */
export const playError = () => {
  playTone(300, 0.2, 'sawtooth', 0.08);
  setTimeout(() => playTone(200, 0.3, 'sawtooth', 0.06), 150);
};

/**
 * Sound when microphone starts listening
 */
export const playMicStart = () => {
  playTone(880, 0.08, 'sine', 0.06);
};

/**
 * Sound when microphone stops listening
 */
export const playMicStop = () => {
  playTone(440, 0.08, 'sine', 0.06);
};

/**
 * Sound when chat is cleared
 */
export const playClear = () => {
  playTone(1000, 0.05, 'sine', 0.05);
  setTimeout(() => playTone(800, 0.05, 'sine', 0.04), 50);
  setTimeout(() => playTone(600, 0.05, 'sine', 0.03), 100);
};

// Sound enabled state
let soundEnabled = true;

export const setSoundEnabled = (enabled: boolean) => {
  soundEnabled = enabled;
};

export const isSoundEnabled = () => soundEnabled;

// Wrapper that respects sound setting
export const sounds = {
  messageSent: () => soundEnabled && playMessageSent(),
  messageReceived: () => soundEnabled && playMessageReceived(),
  connected: () => soundEnabled && playConnected(),
  error: () => soundEnabled && playError(),
  micStart: () => soundEnabled && playMicStart(),
  micStop: () => soundEnabled && playMicStop(),
  clear: () => soundEnabled && playClear(),
};

export default sounds;
