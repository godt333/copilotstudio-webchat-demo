import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'botframework-webchat',
      'botframework-directlinespeech-sdk',
      'web-speech-cognitive-services',
      'microsoft-cognitiveservices-speech-sdk',
      'p-defer-es5',
      'markdown-it-attrs-es5',
      'abort-controller-es5',
    ],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
})
