// Type declarations for packages without TypeScript definitions

declare module 'web-speech-cognitive-services/lib/SpeechServices' {
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
