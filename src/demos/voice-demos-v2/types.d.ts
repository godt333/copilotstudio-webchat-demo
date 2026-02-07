// Type declarations for web-speech-cognitive-services
declare module 'web-speech-cognitive-services/lib/SpeechServices' {
  interface SpeechServicesPonyfillOptions {
    credentials: {
      authorizationToken?: string;
      subscriptionKey?: string;
      region: string;
    };
    speechSynthesisOutputFormat?: string;
    audioConfig?: unknown;
    speechRecognitionEndpointId?: string;
    speechSynthesisDeploymentId?: string;
    textNormalization?: 'display' | 'itn' | 'lexical' | 'maskeditn';
    referenceGrammars?: string[];
    enableTelemetry?: boolean;
    looseEvents?: boolean;
    language?: string;
    speechRecognitionLanguage?: string;
    speechSynthesisLanguage?: string;
    speechSynthesisVoiceName?: string;
  }

  interface SpeechServicesPonyfill {
    SpeechGrammarList: typeof SpeechGrammarList;
    SpeechRecognition: typeof SpeechRecognition;
    speechSynthesis: SpeechSynthesis;
    SpeechSynthesisUtterance: typeof SpeechSynthesisUtterance;
    then?: (resolve: (ponyfill: SpeechServicesPonyfill) => void) => void;
  }

  function createSpeechServicesPonyfill(
    options: SpeechServicesPonyfillOptions
  ): SpeechServicesPonyfill;

  export default createSpeechServicesPonyfill;
}
