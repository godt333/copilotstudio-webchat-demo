import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Note: StrictMode is disabled because botframework-webchat
// doesn't work well with React 18/19's double-mount behavior,
// causing duplicate welcome messages from the bot.
createRoot(document.getElementById('root')!).render(
  <App />
)
