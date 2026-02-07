/**
 * CodePanel Component
 * ===================
 * Displays the ACTUAL code from this webapp that is being executed
 * during the voice chat demo.
 * 
 * Shows real code snippets from:
 * - useDirectLineSpeechConnection.ts
 * - useDirectLinePonyfillConnection.ts
 * - SpeechPonyfillChat.tsx
 * - DirectLineSpeechChat.tsx
 * 
 * This component helps demonstrate what's happening "under the hood" during
 * the THR505 demo session by showing the real implementation.
 */

import React, { useState, useEffect, useMemo } from 'react';

export type ActiveCodeSection = 
  | 'idle'
  | 'fetching-tokens'
  | 'connecting'
  | 'connected'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'error';

interface CodePanelProps {
  mode: 'directlinespeech' | 'ponyfill';
  activeSection: ActiveCodeSection;
  isVisible: boolean;
  onClose: () => void;
  conversationId?: string | null;
  region?: string | null;
  locale?: string | null;
}

// ACTUAL CODE from useDirectLineSpeechConnection.ts
const DIRECT_LINE_SPEECH_CODE = {
  'idle': {
    title: '🔌 Ready to Connect',
    file: 'hooks/useDirectLineSpeechConnection.ts',
    description: 'Hook initialization and state setup',
    code: `// From: useDirectLineSpeechConnection.ts (lines 55-65)

const [adapters, setAdapters] = useState<DirectLineSpeechAdapters | null>(null);
const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
const [errorMessage, setErrorMessage] = useState<string | null>(null);
const [listeningStatus, setListeningStatus] = useState<ListeningStatus>('idle');
const [tokenInfo, setTokenInfo] = useState<SpeechTokenResponse | null>(null);
const [conversationId, setConversationId] = useState<string | null>(null);
const directLineRef = useRef<{ end?: () => void } | null>(null);`,
  },
  'fetching-tokens': {
    title: '🔑 Fetching Credentials',
    file: 'hooks/useDirectLineSpeechConnection.ts',
    description: 'Parallel token fetching for Direct Line and Speech Services',
    code: `// From: useDirectLineSpeechConnection.ts (lines 72-85)

setConnectionStatus('fetching-token');
setErrorMessage(null);

// Fetch both tokens in parallel
// Use British English voice for this mode
console.log('🔑 Fetching Speech and Direct Line tokens...');
const [speechToken, dlToken] = await Promise.all([
  fetchPonyfillCredentials('en-GB', 'en-GB-SoniaNeural'),
  fetchDirectLineToken()
]);

setTokenInfo(speechToken);
setConversationId(dlToken.conversationId);
console.log(\`✅ Got Speech token for region: \${speechToken.region}\`);`,
  },
  'connecting': {
    title: '🔗 Creating Connections',
    file: 'hooks/useDirectLineSpeechConnection.ts',
    description: 'Creating Direct Line and Speech ponyfill adapters',
    code: `// From: useDirectLineSpeechConnection.ts (lines 87-112)

setConnectionStatus('connecting');

// Create standard Direct Line connection (works with Copilot Studio)
const directLine = createDirectLine({
  token: dlToken.token,
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

const { SpeechRecognition, speechSynthesis, SpeechSynthesisUtterance } = ponyfill;`,
  },
  'connected': {
    title: '✅ Connected & Ready',
    file: 'components/DirectLineSpeechChat.tsx',
    description: 'Rendering Web Chat with voice adapters',
    code: `// From: DirectLineSpeechChat.tsx (lines 370-378)

const renderWebChat = () => {
  if (!adapters) return null;

  return (
    <ReactWebChat
      key={chatKey}
      directLine={(adapters as any).directLine}
      webSpeechPonyfillFactory={(adapters as any).webSpeechPonyfillFactory}
      styleOptions={styleOptions}
      locale={locale || 'en-GB'}  // British English
    />
  );
};`,
  },
  'listening': {
    title: '🎤 Speech Recognition Active',
    file: 'hooks/useDirectLineSpeechConnection.ts',
    description: 'Azure Speech SDK is converting your voice to text',
    code: `// From: useDirectLineSpeechConnection.ts - Ponyfill Factory

const webSpeechPonyfillFactory = () => ({
  SpeechGrammarList,      // Grammar hints for recognition
  SpeechRecognition,       // STT - Speech to Text
  speechSynthesis,         // TTS engine
  SpeechSynthesisUtterance, // TTS utterance builder
});

// The ponyfill intercepts Web Speech API calls and routes
// them through Azure Cognitive Services Speech SDK

// When you speak, SpeechRecognition.onresult fires:
recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  // This transcript is sent via Direct Line to Copilot Studio
};`,
  },
  'processing': {
    title: '⏳ Processing Speech',
    file: 'services/api.ts → Copilot Studio',
    description: 'Message sent via Direct Line to Copilot Studio agent',
    code: `// Message Flow (Direct Line → Copilot Studio):

// 1. Speech recognized by Azure Speech SDK
// 2. Text sent via Direct Line channel:
directLine.postActivity({
  type: 'message',
  text: recognizedText,  // "Tell me about benefits"
  from: { id: userId }
}).subscribe({
  next: (id) => console.log('Message sent:', id),
  error: (err) => console.error('Failed:', err)
});

// 3. Copilot Studio processes the message
// 4. Agent sends response back via Direct Line
// 5. Response triggers TTS via ponyfill`,
  },
  'speaking': {
    title: '🔊 Text-to-Speech Active',
    file: 'hooks/useDirectLineSpeechConnection.ts',
    description: 'Azure Neural Voice (en-GB-SoniaNeural) speaking response',
    code: `// From: useDirectLineSpeechConnection.ts - TTS via ponyfill

// Bot response triggers speech synthesis
const { speechSynthesis, SpeechSynthesisUtterance } = ponyfill;

// Create utterance for bot's response text
const utterance = new SpeechSynthesisUtterance(botResponseText);

// Voice is set based on locale (en-GB-SoniaNeural)
// Rate and pitch can be customized via SSML

// Speak the response
speechSynthesis.speak(utterance);

// Events available:
utterance.onstart = () => setListeningStatus('speaking');
utterance.onend = () => setListeningStatus('idle');`,
  },
  'error': {
    title: '❌ Connection Error',
    file: 'hooks/useDirectLineSpeechConnection.ts',
    description: 'Error handling in the connection hook',
    code: `// From: useDirectLineSpeechConnection.ts (lines 118-126)

} catch (error: unknown) {
  console.error('❌ Failed to establish connection:', error);
  setConnectionStatus('error');
  if (error instanceof Error) {
    setErrorMessage(error.message);
  } else {
    setErrorMessage('Failed to connect to voice services');
  }
}

// Common error causes:
// - Token expired or invalid
// - Network connectivity issues  
// - Speech region unavailable
// - Copilot Studio bot not responding`,
  },
};

// ACTUAL CODE from useDirectLinePonyfillConnection.ts
const SPEECH_PONYFILL_CODE = {
  'idle': {
    title: '🔌 Ready to Connect',
    file: 'hooks/useDirectLinePonyfillConnection.ts',
    description: 'Hook initialization with configurable options',
    code: `// From: useDirectLinePonyfillConnection.ts (lines 45-55)

export function useDirectLinePonyfillConnection(
  options: UseDirectLinePonyfillOptions = {}
): UseDirectLinePonyfillConnectionResult {
  const { userId, userName, locale, voice } = options;

  const [directLine, setDirectLine] = useState<unknown | null>(null);
  const [webSpeechPonyfillFactory, setWebSpeechPonyfillFactory] = useState<unknown | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [listeningStatus, setListeningStatus] = useState<ListeningStatus>('idle');
  const [directLineToken, setDirectLineToken] = useState<DirectLineTokenResponse | null>(null);
  const [speechCredentials, setSpeechCredentials] = useState<SpeechTokenResponse | null>(null);`,
  },
  'fetching-tokens': {
    title: '🔑 Fetching Tokens',
    file: 'hooks/useDirectLinePonyfillConnection.ts',
    description: 'Parallel fetch for efficiency',
    code: `// From: useDirectLinePonyfillConnection.ts (lines 65-80)

setConnectionStatus('fetching-tokens');
setErrorMessage(null);

// Fetch BOTH tokens in parallel for faster connection
const [dlToken, speechCreds] = await Promise.all([
  fetchDirectLineToken(userId, userName),
  fetchPonyfillCredentials(locale, voice),  // e.g., 'en-US', 'en-US-JennyNeural'
]);

setDirectLineToken(dlToken);
setSpeechCredentials(speechCreds);

console.log('Conversation:', dlToken.conversationId);
console.log('Speech region:', speechCreds.region);  // e.g., 'eastus'`,
  },
  'connecting': {
    title: '🔗 Creating Adapters',
    file: 'hooks/useDirectLinePonyfillConnection.ts',
    description: 'Setting up Direct Line and Speech ponyfill',
    code: `// From: useDirectLinePonyfillConnection.ts (lines 82-102)

setConnectionStatus('connecting');

// Create Direct Line connection for messaging
const dl = createDirectLine({
  token: dlToken.token,
});

directLineRef.current = dl as { end?: () => void };

console.log('Creating speech ponyfill...');

// Create Azure Speech ponyfill
const ponyfill = await createSpeechServicesPonyfill({
  credentials: {
    authorizationToken: speechCreds.token,
    region: speechCreds.region,
  },
  speechSynthesisOutputFormat: 'audio-24khz-48kbitrate-mono-mp3',
});`,
  },
  'connected': {
    title: '✅ Connected & Ready',
    file: 'components/SpeechPonyfillChat.tsx',
    description: 'Rendering Web Chat with selected locale',
    code: `// From: SpeechPonyfillChat.tsx (lines 505-517)

const renderWebChat = () => {
  if (!directLine || !webSpeechPonyfillFactory) return null;

  return (
    <div ref={webChatRef} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <ReactWebChat
        key={chatKey}
        directLine={directLine as any}
        webSpeechPonyfillFactory={webSpeechPonyfillFactory as any}
        styleOptions={styleOptions}
        locale={selectedLocale}  // User-selected: en-US, en-GB, es-ES, fr-FR
      />
    </div>
  );
};`,
  },
  'listening': {
    title: '🎤 Listening...',
    file: 'hooks/useDirectLinePonyfillConnection.ts',
    description: 'Speech recognition via Azure Speech SDK',
    code: `// From: useDirectLinePonyfillConnection.ts (lines 98-108)

const ponyfill = await createSpeechServicesPonyfill({
  credentials: {
    authorizationToken: speechCreds.token,
    region: speechCreds.region,
  },
  speechSynthesisOutputFormat: 'audio-24khz-48kbitrate-mono-mp3',
});

// Destructure Web Speech API components
const { SpeechGrammarList, SpeechRecognition, speechSynthesis, SpeechSynthesisUtterance } = ponyfill;

// SpeechRecognition handles microphone input
// Converts speech to text using Azure Speech Services
// Supports continuous recognition and interim results`,
  },
  'processing': {
    title: '⏳ Processing...',
    file: 'Message Flow',
    description: 'Direct Line → Copilot Studio → Response',
    code: `// Message Flow in Speech Ponyfill Mode:

// 1. Speech → Text (Azure Speech STT)
const transcript = event.results[0][0].transcript;

// 2. Text → Direct Line → Copilot Studio
// Web Chat handles this automatically via the directLine adapter

// 3. Agent processes intent & entities
// Copilot Studio matches topic, extracts entities, generates response

// 4. Response → Direct Line → Web Chat
// Received as activity.type === 'message'

// 5. Text → Speech (Azure Neural TTS)
// Web Chat automatically speaks via webSpeechPonyfillFactory`,
  },
  'speaking': {
    title: '🔊 Speaking Response',
    file: 'hooks/useDirectLinePonyfillConnection.ts',
    description: 'TTS with selected neural voice',
    code: `// From: useDirectLinePonyfillConnection.ts - Ponyfill Factory

const ponyfillFactory = () => ({
  SpeechGrammarList,
  SpeechRecognition,
  speechSynthesis,          // TTS engine
  SpeechSynthesisUtterance, // Utterance builder
});

setWebSpeechPonyfillFactory(() => ponyfillFactory);

// Web Chat uses this factory to speak bot responses
// Voice is determined by the 'voice' option passed to hook:
// e.g., 'en-US-JennyNeural', 'en-US-GuyNeural'

// The ponyfill routes all TTS through Azure Speech Services
// providing high-quality neural voices`,
  },
  'error': {
    title: '❌ Error Occurred',
    file: 'hooks/useDirectLinePonyfillConnection.ts',
    description: 'Error handling and recovery',
    code: `// From: useDirectLinePonyfillConnection.ts (lines 114-120)

} catch (error: unknown) {
  console.error('Connection failed:', error);
  setConnectionStatus('error');
  setErrorMessage(error instanceof Error ? error.message : 'Failed to connect');
}

// Retry mechanism:
const retry = useCallback(() => {
  disconnect();
  setTimeout(() => connect(), 500);  // Brief delay before retry
}, [connect, disconnect]);

// User can click "Try Again" to invoke retry()`,
  },
};

/**
 * Syntax highlighting for code display
 * Uses a token-based approach to avoid overlapping highlights
 */
const highlightCode = (code: string): React.ReactNode => {
  const lines = code.split('\n');
  
  return lines.map((line, index) => {
    // Use placeholder tokens to prevent overlapping replacements
    const tokens: { placeholder: string; html: string }[] = [];
    let tokenIndex = 0;
    
    const createToken = (html: string): string => {
      const placeholder = `__TOKEN_${tokenIndex++}__`;
      tokens.push({ placeholder, html });
      return placeholder;
    };
    
    let highlightedLine = line;
    
    // 1. First, handle comments (highest priority - nothing inside should be highlighted)
    highlightedLine = highlightedLine.replace(/(\/\/.*$)/gm, (match) => 
      createToken(`<span class="code-comment">${match}</span>`)
    );
    
    // 2. Handle template literals with expressions
    highlightedLine = highlightedLine.replace(/(`[^`]*`)/g, (match) => 
      createToken(`<span class="code-string">${match}</span>`)
    );
    
    // 3. Handle strings (before other replacements)
    highlightedLine = highlightedLine.replace(/('[^']*'|"[^"]*")/g, (match) => 
      createToken(`<span class="code-string">${match}</span>`)
    );
    
    // 4. Handle JSX components (capitalized tags)
    highlightedLine = highlightedLine.replace(/(<\/?[A-Z][a-zA-Z]*)/g, (match) => 
      createToken(`<span class="code-component">${match}</span>`)
    );
    
    // 5. Keywords
    highlightedLine = highlightedLine.replace(
      /\b(const|let|var|function|async|await|return|if|else|try|catch|new|import|from|export|throw|typeof|instanceof|null|undefined|true|false|this|class|extends|type|interface)\b/g,
      (match) => createToken(`<span class="code-keyword">${match}</span>`)
    );
    
    // 6. Common React/API functions
    highlightedLine = highlightedLine.replace(
      /\b(useEffect|useState|useCallback|useMemo|useRef|connect|disconnect|retry|createDirectLine|createSpeechServicesPonyfill|fetchDirectLineToken|fetchPonyfillCredentials|subscribe|postActivity|setConnectionStatus|setErrorMessage|setListeningStatus|setAdapters|Promise\.all|console\.log|console\.error|console\.warn|setTimeout|clearTimeout)\b/g,
      (match) => createToken(`<span class="code-function">${match}</span>`)
    );
    
    // 7. Object properties/keys (word followed by colon)
    highlightedLine = highlightedLine.replace(/\b(\w+)\s*:/g, (_match, prop) => 
      createToken(`<span class="code-property">${prop}</span>`) + ':'
    );
    
    // 8. Numbers
    highlightedLine = highlightedLine.replace(/\b(\d+\.?\d*)\b/g, (match) => 
      createToken(`<span class="code-number">${match}</span>`)
    );
    
    // 9. Method calls (word followed by parenthesis)
    highlightedLine = highlightedLine.replace(/\.(\w+)\s*\(/g, (_match, method) => 
      '.' + createToken(`<span class="code-function">${method}</span>`) + '('
    );
    
    // 10. Arrow functions
    highlightedLine = highlightedLine.replace(/(=>)/g, (match) => 
      createToken(`<span class="code-keyword">${match}</span>`)
    );
    
    // Restore all tokens
    tokens.forEach(({ placeholder, html }) => {
      highlightedLine = highlightedLine.replace(placeholder, html);
    });
    
    return (
      <div 
        key={index} 
        className="code-line"
        dangerouslySetInnerHTML={{ __html: highlightedLine || '&nbsp;' }}
      />
    );
  });
};

/**
 * CodePanel Component
 */
export const CodePanel: React.FC<CodePanelProps> = ({
  mode,
  activeSection,
  isVisible,
  onClose,
  conversationId,
  region,
  locale,
}) => {
  const [animating, setAnimating] = useState(false);
  const [displayedSection, setDisplayedSection] = useState<ActiveCodeSection>(activeSection);

  // Animate code changes
  useEffect(() => {
    if (activeSection !== displayedSection) {
      setAnimating(true);
      const timer = setTimeout(() => {
        setDisplayedSection(activeSection);
        setAnimating(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [activeSection, displayedSection]);

  // Get appropriate code snippets based on mode
  const codeSnippets = useMemo(() => {
    return mode === 'directlinespeech' ? DIRECT_LINE_SPEECH_CODE : SPEECH_PONYFILL_CODE;
  }, [mode]);

  // Get current code section
  const currentCode = useMemo(() => {
    return codeSnippets[displayedSection] || codeSnippets['idle'];
  }, [codeSnippets, displayedSection]);

  if (!isVisible) return null;

  return (
    <div className="code-panel">
      {/* Header */}
      <div className="code-panel-header">
        <div className="code-panel-title">
          <span className="code-icon">{'</>'}</span>
          <span>Live Code View</span>
          <span className={`code-mode-badge ${mode}`}>
            {mode === 'directlinespeech' ? 'Direct Line Speech' : 'Speech Ponyfill'}
          </span>
        </div>
        <button className="code-panel-close" onClick={onClose} title="Hide code panel">
          ✕
        </button>
      </div>

      {/* Section indicator */}
      <div className="code-section-indicator">
        <div className={`section-badge ${displayedSection}`}>
          {currentCode.title}
        </div>
        <div className="section-file">
          📁 <code>{currentCode.file}</code>
        </div>
        <p className="section-description">{currentCode.description}</p>
      </div>

      {/* Code display */}
      <div className={`code-display ${animating ? 'animating' : ''}`}>
        <pre className="code-block">
          <code>
            {highlightCode(currentCode.code)}
          </code>
        </pre>
      </div>

      {/* Runtime info */}
      <div className="code-runtime-info">
        <div className="runtime-item">
          <span className="runtime-label">Status:</span>
          <span className={`runtime-value status-${displayedSection}`}>
            {displayedSection}
          </span>
        </div>
        {conversationId && (
          <div className="runtime-item">
            <span className="runtime-label">Conversation:</span>
            <span className="runtime-value">{conversationId.substring(0, 12)}...</span>
          </div>
        )}
        {region && (
          <div className="runtime-item">
            <span className="runtime-label">Region:</span>
            <span className="runtime-value">{region}</span>
          </div>
        )}
        {locale && (
          <div className="runtime-item">
            <span className="runtime-label">Locale:</span>
            <span className="runtime-value">{locale}</span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="code-legend">
        <span className="legend-item"><span className="code-keyword">keyword</span></span>
        <span className="legend-item"><span className="code-function">function</span></span>
        <span className="legend-item"><span className="code-string">'string'</span></span>
        <span className="legend-item"><span className="code-property">property</span></span>
        <span className="legend-item"><span className="code-component">Component</span></span>
        <span className="legend-item"><span className="code-number">123</span></span>
        <span className="legend-item"><span className="code-comment">// comment</span></span>
      </div>
    </div>
  );
};

export default CodePanel;
