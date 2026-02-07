/**
 * VoiceSettingsPanel Component
 * ============================
 * A settings panel that displays configurable voice features for both
 * Direct Line Speech and Speech Ponyfill modes.
 * 
 * This component helps demonstrate the key features available in each mode
 * during the THR505 demo session.
 */

import React, { useState } from 'react';

export type VoiceMode = 'directlinespeech' | 'ponyfill';

// Voice options for different locales (used in ponyfill mode)
export const VOICE_OPTIONS = {
  'en-US': [
    { id: 'en-US-JennyNeural', name: 'Jenny (Female)', style: 'friendly' },
    { id: 'en-US-GuyNeural', name: 'Guy (Male)', style: 'newscast' },
    { id: 'en-US-AriaNeural', name: 'Aria (Female)', style: 'cheerful' },
    { id: 'en-US-DavisNeural', name: 'Davis (Male)', style: 'calm' },
  ],
  'en-GB': [
    { id: 'en-GB-SoniaNeural', name: 'Sonia (Female)', style: 'friendly' },
    { id: 'en-GB-RyanNeural', name: 'Ryan (Male)', style: 'cheerful' },
    { id: 'en-GB-LibbyNeural', name: 'Libby (Female)', style: 'friendly' },
  ],
  'es-ES': [
    { id: 'es-ES-ElviraNeural', name: 'Elvira (Female)', style: 'friendly' },
    { id: 'es-ES-AlvaroNeural', name: 'Alvaro (Male)', style: 'friendly' },
  ],
  'fr-FR': [
    { id: 'fr-FR-DeniseNeural', name: 'Denise (Female)', style: 'friendly' },
    { id: 'fr-FR-HenriNeural', name: 'Henri (Male)', style: 'friendly' },
  ],
};

export const LOCALE_OPTIONS = [
  { id: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { id: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { id: 'es-ES', name: 'Spanish (Spain)', flag: '🇪🇸' },
  { id: 'fr-FR', name: 'French (France)', flag: '🇫🇷' },
];

// Settings interfaces
export interface DirectLineSpeechSettings {
  bargeInEnabled: boolean;
  bargeInSensitivity: 'low' | 'medium' | 'high';
  autoResumeListening: boolean;
  latencyMessageEnabled: boolean;
  latencyMessageText: string;
  silenceTimeoutMs: number;
  ssmlEnabled: boolean;
  ssmlProsodyRate: string;
  ssmlProsodyPitch: string;
}

export interface PonyfillSettings {
  locale: string;
  voice: string;
  bargeInEnabled: boolean;
  bargeInSensitivity: 'low' | 'medium' | 'high';
  continuousRecognition: boolean;
  interimResults: boolean;
  speechRate: number;
  speechPitch: number;
  autoStartMic: boolean;
  autoResumeListening: boolean;
  silenceTimeoutMs: number;
}

interface VoiceSettingsPanelProps {
  mode: VoiceMode;
  isVisible: boolean;
  onClose: () => void;
  // Direct Line Speech props
  dlsSettings?: DirectLineSpeechSettings;
  onDlsSettingsChange?: (settings: DirectLineSpeechSettings) => void;
  // Ponyfill props
  ponyfillSettings?: PonyfillSettings;
  onPonyfillSettingsChange?: (settings: PonyfillSettings) => void;
}

/**
 * Feature info cards for documentation
 * These are REAL features of Azure Speech SDK and Copilot Studio
 * that can be configured in production applications.
 */
const DLS_FEATURES = [
  {
    id: 'barge-in',
    icon: '🛑',
    title: 'Barge-In',
    description: 'Allow users to interrupt the bot while it\'s speaking. When the user starts talking, the bot\'s speech stops immediately.',
    settingKey: 'bargeInEnabled',
    type: 'toggle' as const,
    hasSensitivity: true,
    docLink: 'Copilot Studio → Settings → Voice',
  },
  {
    id: 'auto-resume',
    icon: '🔄',
    title: 'Auto-Resume Listening',
    description: 'Automatically start listening again after the bot finishes speaking. Creates a natural conversation flow.',
    settingKey: 'autoResumeListening',
    type: 'toggle' as const,
    docLink: 'Web Chat → styleOptions.speechRecognitionContinuous',
  },
  {
    id: 'latency-message',
    icon: '⏳',
    title: 'Latency Message',
    description: 'Show a message when processing takes time. Configured in Copilot Studio topic flow.',
    settingKey: 'latencyMessageEnabled',
    type: 'toggle' as const,
    hasTextInput: true,
    textSettingKey: 'latencyMessageText',
    docLink: 'Copilot Studio → Topics → Send Message node',
  },
  {
    id: 'silence-detection',
    icon: '🔇',
    title: 'Silence Detection Timeout',
    description: 'How long to wait for speech before stopping recognition. Shorter = faster response, longer = more patience.',
    settingKey: 'silenceTimeoutMs',
    type: 'range' as const,
    min: 1000,
    max: 10000,
    step: 500,
    unit: 'ms',
    docLink: 'Azure Speech SDK → SpeechConfig.setProperty()',
  },
  {
    id: 'ssml',
    icon: '🎭',
    title: 'SSML (Speech Synthesis Markup Language)',
    description: 'Control voice prosody - rate, pitch, emphasis, pauses. Used in Copilot Studio Message nodes.',
    settingKey: 'ssmlEnabled',
    type: 'toggle' as const,
    hasAdvanced: true,
    docLink: 'learn.microsoft.com/azure/ai-services/speech-service/speech-synthesis-markup',
  },
];

const PONYFILL_FEATURES = [
  {
    id: 'barge-in',
    icon: '🛑',
    title: 'Barge-In',
    description: 'Allow users to interrupt the bot while it\'s speaking. When the user starts talking, the bot\'s speech stops immediately.',
    settingKey: 'bargeInEnabled',
    type: 'toggle' as const,
    hasSensitivity: true,
    docLink: 'SpeechSynthesis.cancel() on speech detected',
  },
  {
    id: 'continuous-recognition',
    icon: '🔄',
    title: 'Continuous Recognition',
    description: 'Keep microphone open for natural conversation. Azure Speech SDK continuous mode.',
    settingKey: 'continuousRecognition',
    type: 'toggle' as const,
    docLink: 'web-speech-cognitive-services ponyfill',
  },
  {
    id: 'auto-resume',
    icon: '🎤',
    title: 'Auto-Resume Listening',
    description: 'Automatically start listening again after the bot finishes speaking. Creates a hands-free experience.',
    settingKey: 'autoResumeListening',
    type: 'toggle' as const,
    docLink: 'SpeechSynthesisUtterance.onend → start recognition',
  },
  {
    id: 'interim-results',
    icon: '✍️',
    title: 'Interim Results',
    description: 'Show real-time transcription as user speaks. SpeechRecognition.interimResults property.',
    settingKey: 'interimResults',
    type: 'toggle' as const,
    docLink: 'Web Speech API → SpeechRecognition',
  },
  {
    id: 'silence-detection',
    icon: '🔇',
    title: 'Silence Timeout',
    description: 'How long to wait for speech before stopping recognition.',
    settingKey: 'silenceTimeoutMs',
    type: 'range' as const,
    min: 1000,
    max: 10000,
    step: 500,
    unit: 'ms',
    docLink: 'Azure Speech SDK → segmentationSilenceTimeoutMs',
  },
  {
    id: 'speech-rate',
    icon: '⏩',
    title: 'Speech Rate',
    description: 'TTS speed control. SpeechSynthesisUtterance.rate property (0.5x - 2.0x).',
    settingKey: 'speechRate',
    type: 'range' as const,
    min: 0.5,
    max: 2.0,
    step: 0.1,
    unit: 'x',
    docLink: 'Web Speech API → SpeechSynthesisUtterance.rate',
  },
  {
    id: 'speech-pitch',
    icon: '🎵',
    title: 'Speech Pitch',
    description: 'TTS pitch control. SpeechSynthesisUtterance.pitch property (0.5x - 2.0x).',
    settingKey: 'speechPitch',
    type: 'range' as const,
    min: 0.5,
    max: 2.0,
    step: 0.1,
    unit: 'x',
    docLink: 'Web Speech API → SpeechSynthesisUtterance.pitch',
  },
  {
    id: 'auto-start-mic',
    icon: '🚀',
    title: 'Auto-Start on Load',
    description: 'Automatically start listening when the chat loads. Great for voice-first interfaces.',
    settingKey: 'autoStartMic',
    type: 'toggle' as const,
    docLink: 'Web Chat → onStartDictation',
  },
];

/**
 * VoiceSettingsPanel Component
 */
export const VoiceSettingsPanel: React.FC<VoiceSettingsPanelProps> = ({
  mode,
  isVisible,
  onClose,
  dlsSettings,
  onDlsSettingsChange,
  ponyfillSettings,
  onPonyfillSettingsChange,
}) => {
  const [activeTab, setActiveTab] = useState<'features' | 'voice' | 'advanced'>('features');

  if (!isVisible) return null;

  const features = mode === 'directlinespeech' ? DLS_FEATURES : PONYFILL_FEATURES;
  const settings = mode === 'directlinespeech' ? dlsSettings : ponyfillSettings;

  const handleToggle = (settingKey: string) => {
    if (mode === 'directlinespeech' && dlsSettings && onDlsSettingsChange) {
      onDlsSettingsChange({
        ...dlsSettings,
        [settingKey]: !dlsSettings[settingKey as keyof DirectLineSpeechSettings],
      });
    } else if (mode === 'ponyfill' && ponyfillSettings && onPonyfillSettingsChange) {
      onPonyfillSettingsChange({
        ...ponyfillSettings,
        [settingKey]: !ponyfillSettings[settingKey as keyof PonyfillSettings],
      });
    }
  };

  const handleRangeChange = (settingKey: string, value: number) => {
    if (mode === 'directlinespeech' && dlsSettings && onDlsSettingsChange) {
      onDlsSettingsChange({
        ...dlsSettings,
        [settingKey]: value,
      });
    } else if (mode === 'ponyfill' && ponyfillSettings && onPonyfillSettingsChange) {
      onPonyfillSettingsChange({
        ...ponyfillSettings,
        [settingKey]: value,
      });
    }
  };

  const handleTextChange = (settingKey: string, value: string) => {
    if (mode === 'directlinespeech' && dlsSettings && onDlsSettingsChange) {
      onDlsSettingsChange({
        ...dlsSettings,
        [settingKey]: value,
      });
    } else if (mode === 'ponyfill' && ponyfillSettings && onPonyfillSettingsChange) {
      onPonyfillSettingsChange({
        ...ponyfillSettings,
        [settingKey]: value,
      });
    }
  };

  const handleSensitivityChange = (value: 'low' | 'medium' | 'high') => {
    if (mode === 'directlinespeech' && dlsSettings && onDlsSettingsChange) {
      onDlsSettingsChange({
        ...dlsSettings,
        bargeInSensitivity: value,
      });
    } else if (mode === 'ponyfill' && ponyfillSettings && onPonyfillSettingsChange) {
      onPonyfillSettingsChange({
        ...ponyfillSettings,
        bargeInSensitivity: value,
      });
    }
  };

  const handleVoiceChange = (locale: string, voice: string) => {
    if (mode === 'ponyfill' && ponyfillSettings && onPonyfillSettingsChange) {
      onPonyfillSettingsChange({
        ...ponyfillSettings,
        locale,
        voice,
      });
    }
  };

  const renderFeatureCard = (feature: typeof DLS_FEATURES[0]) => {
    const settingValue = settings?.[feature.settingKey as keyof typeof settings];
    const isEnabled = typeof settingValue === 'boolean' ? settingValue : true;
    const sensitivityValue = mode === 'directlinespeech' 
      ? (dlsSettings as DirectLineSpeechSettings)?.bargeInSensitivity 
      : (ponyfillSettings as PonyfillSettings)?.bargeInSensitivity;

    return (
      <div key={feature.id} className={`feature-card ${isEnabled ? 'enabled' : 'disabled'}`}>
        <div className="feature-header">
          <span className="feature-icon">{feature.icon}</span>
          <h4 className="feature-title">{feature.title}</h4>
          {feature.type === 'toggle' && (
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={() => handleToggle(feature.settingKey)}
              />
              <span className="toggle-slider"></span>
            </label>
          )}
        </div>
        <p className="feature-description">{feature.description}</p>
        
        {/* Barge-in sensitivity controls */}
        {feature.hasSensitivity && isEnabled && (
          <div className="sensitivity-controls">
            <label className="sensitivity-label">Sensitivity:</label>
            <div className="sensitivity-buttons">
              <button
                className={`sensitivity-btn ${sensitivityValue === 'low' ? 'active' : ''}`}
                onClick={() => handleSensitivityChange('low')}
                title="More delay before interruption - fewer false triggers"
              >
                🐢 Low
              </button>
              <button
                className={`sensitivity-btn ${sensitivityValue === 'medium' ? 'active' : ''}`}
                onClick={() => handleSensitivityChange('medium')}
                title="Balanced interruption detection"
              >
                ⚖️ Medium
              </button>
              <button
                className={`sensitivity-btn ${sensitivityValue === 'high' ? 'active' : ''}`}
                onClick={() => handleSensitivityChange('high')}
                title="Quick interruption - may trigger on background noise"
              >
                🐇 High
              </button>
            </div>
            <p className="sensitivity-description">
              {sensitivityValue === 'low' && 'Wait 500ms before interrupting - reduces false triggers'}
              {sensitivityValue === 'medium' && 'Wait 200ms before interrupting - balanced'}
              {sensitivityValue === 'high' && 'Wait 50ms before interrupting - very responsive'}
            </p>
          </div>
        )}
        
        {feature.type === 'range' && (
          <div className="feature-range">
            <input
              type="range"
              min={feature.min}
              max={feature.max}
              step={feature.step}
              value={(settingValue as number | undefined) ?? feature.min}
              onChange={(e) => handleRangeChange(feature.settingKey, parseFloat(e.target.value))}
            />
            <span className="range-value">
              {(settingValue as number | undefined) ?? feature.min}{feature.unit}
            </span>
          </div>
        )}

        {feature.hasTextInput && isEnabled && (
          <div className="feature-text-input">
            <input
              type="text"
              placeholder="Enter message..."
              value={(dlsSettings as any)?.[feature.textSettingKey!] || ''}
              onChange={(e) => handleTextChange(feature.textSettingKey!, e.target.value)}
            />
          </div>
        )}

        {feature.hasAdvanced && feature.id === 'ssml' && isEnabled && (
          <div className="ssml-controls">
            <div className="ssml-control">
              <label>Rate</label>
              <select
                value={dlsSettings?.ssmlProsodyRate || 'medium'}
                onChange={(e) => handleTextChange('ssmlProsodyRate', e.target.value)}
              >
                <option value="x-slow">Extra Slow</option>
                <option value="slow">Slow</option>
                <option value="medium">Medium</option>
                <option value="fast">Fast</option>
                <option value="x-fast">Extra Fast</option>
              </select>
            </div>
            <div className="ssml-control">
              <label>Pitch</label>
              <select
                value={dlsSettings?.ssmlProsodyPitch || 'medium'}
                onChange={(e) => handleTextChange('ssmlProsodyPitch', e.target.value)}
              >
                <option value="x-low">Extra Low</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="x-high">Extra High</option>
              </select>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderVoiceSettings = () => {
    if (mode !== 'ponyfill' || !ponyfillSettings) return null;

    const currentLocale = ponyfillSettings.locale;
    const voices = VOICE_OPTIONS[currentLocale as keyof typeof VOICE_OPTIONS] || [];

    return (
      <div className="voice-settings-section">
        <div className="voice-setting-group">
          <label>
            <span className="setting-icon">🌍</span>
            Language / Locale
          </label>
          <div className="locale-buttons">
            {LOCALE_OPTIONS.map((locale) => (
              <button
                key={locale.id}
                className={`locale-btn ${currentLocale === locale.id ? 'active' : ''}`}
                onClick={() => {
                  const newVoices = VOICE_OPTIONS[locale.id as keyof typeof VOICE_OPTIONS];
                  handleVoiceChange(locale.id, newVoices?.[0]?.id || '');
                }}
              >
                <span className="locale-flag">{locale.flag}</span>
                <span className="locale-name">{locale.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="voice-setting-group">
          <label>
            <span className="setting-icon">🗣️</span>
            Voice
          </label>
          <div className="voice-grid">
            {voices.map((voice) => (
              <button
                key={voice.id}
                className={`voice-btn ${ponyfillSettings.voice === voice.id ? 'active' : ''}`}
                onClick={() => handleVoiceChange(currentLocale, voice.id)}
              >
                <span className="voice-name">{voice.name}</span>
                <span className="voice-style">{voice.style}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderAdvancedSSML = () => {
    if (mode !== 'directlinespeech') return null;

    return (
      <div className="advanced-ssml-section">
        <h4>SSML Examples</h4>
        <p className="ssml-intro">
          Speech Synthesis Markup Language (SSML) gives you fine-grained control over the bot's voice.
        </p>
        
        <div className="ssml-examples">
          <div className="ssml-example">
            <h5>Adding Pauses</h5>
            <code>{`<break time="500ms"/>`}</code>
            <p>Insert a 500ms pause in speech</p>
          </div>
          
          <div className="ssml-example">
            <h5>Emphasis</h5>
            <code>{`<emphasis level="strong">important</emphasis>`}</code>
            <p>Add emphasis to specific words</p>
          </div>
          
          <div className="ssml-example">
            <h5>Prosody Control</h5>
            <code>{`<prosody rate="slow" pitch="low">text</prosody>`}</code>
            <p>Control rate, pitch, and volume</p>
          </div>
          
          <div className="ssml-example">
            <h5>Say As</h5>
            <code>{`<say-as interpret-as="date">2026-02-05</say-as>`}</code>
            <p>Control pronunciation of dates, numbers, etc.</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="settings-panel-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="settings-panel-header">
          <div className="settings-title">
            <span className="settings-icon">⚙️</span>
            <h3>
              {mode === 'directlinespeech' ? 'Direct Line Speech Settings' : 'Speech Ponyfill Settings'}
            </h3>
          </div>
          <button className="settings-close" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="settings-tabs">
          <button
            className={`settings-tab ${activeTab === 'features' ? 'active' : ''}`}
            onClick={() => setActiveTab('features')}
          >
            🎛️ Features
          </button>
          {mode === 'ponyfill' && (
            <button
              className={`settings-tab ${activeTab === 'voice' ? 'active' : ''}`}
              onClick={() => setActiveTab('voice')}
            >
              🗣️ Voice
            </button>
          )}
          {mode === 'directlinespeech' && (
            <button
              className={`settings-tab ${activeTab === 'advanced' ? 'active' : ''}`}
              onClick={() => setActiveTab('advanced')}
            >
              📝 SSML Guide
            </button>
          )}
        </div>

        {/* Content */}
        <div className="settings-content">
          {activeTab === 'features' && (
            <div className="features-grid">
              {features.map(renderFeatureCard)}
            </div>
          )}
          {activeTab === 'voice' && renderVoiceSettings()}
          {activeTab === 'advanced' && renderAdvancedSSML()}
        </div>

        {/* Footer */}
        <div className="settings-footer">
          <div className="settings-mode-badge">
            {mode === 'directlinespeech' ? '🎤 Direct Line Speech' : '🔊 Speech Ponyfill'}
          </div>
          <button className="settings-done-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceSettingsPanel;
