/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COPILOT_TOKEN_ENDPOINT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
