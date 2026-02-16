// Type declarations for packages without TypeScript definitions

declare module 'web-speech-cognitive-services/lib/SpeechServices' {
  function createSpeechServicesPonyfill(options: {
    credentials: {
      authorizationToken: string;
      region: string;
    };
    speechRecognitionEndpointId?: string;
    textNormalization?: string;
    speechSynthesisOutputFormat?: string;
    speechSynthesisVoiceName?: string;
  }): Promise<any>;
  
  export default createSpeechServicesPonyfill;
  
  export function createSpeechServicesPonyfillFactory(options: {
    credentials: {
      authorizationToken: string;
      region: string;
    };
    speechRecognitionEndpointId?: string;
    textNormalization?: string;
  }): any;
}

declare module 'botframework-directlinespeech-sdk' {
  export function createAdapters(options: any): Promise<{
    directLine: any;
    webSpeechPonyfillFactory: any;
  }>;
}
