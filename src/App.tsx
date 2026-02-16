import { useEffect } from 'react';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { PublicClientApplication } from '@azure/msal-browser';
import { Layout } from './components/layout';
import {
  HomePage,
  BenefitsPage,
  HousingPage,
  EmploymentPage,
  ConsumerRightsPage,
  TrafficAppealsPage,
  AgentsSDKFlexibleReactPage,
  WebChatDemosPage,
  AgentsSDKDemosPage,
  BrandingDemosPage,
  VoiceDemosPage,
  VoiceDemosV2Page,
  EmbeddedAgentPage,
} from './pages';
import './App.css';

// MSAL redirect handler component
function MsalRedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if this is a redirect from MSAL (has auth code in URL)
    const hasAuthCode = location.hash.includes('code=') || location.search.includes('code=');
    const returnUrl = sessionStorage.getItem('msal_return_url');

    if (hasAuthCode && returnUrl) {
      // Initialize MSAL to process the redirect
      const msalConfig = {
        auth: {
          clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
          authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || 'common'}`,
          redirectUri: window.location.origin,
        },
        cache: {
          cacheLocation: 'sessionStorage' as const,
          storeAuthStateInCookie: false,
        },
      };

      const msal = new PublicClientApplication(msalConfig);
      msal.initialize().then(() => {
        msal.handleRedirectPromise().then((response) => {
          if (response) {
            console.log('[App] MSAL redirect processed, navigating to:', returnUrl);
            sessionStorage.removeItem('msal_return_url');
            // Extract just the path from the full URL
            const url = new URL(returnUrl);
            navigate(url.pathname, { replace: true });
          }
        });
      });
    }
  }, [location, navigate]);

  return null;
}

function App() {
  return (
    <FluentProvider theme={webLightTheme}>
      <BrowserRouter>
        <MsalRedirectHandler />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="benefits" element={<BenefitsPage />} />
            <Route path="housing" element={<HousingPage />} />
            <Route path="employment" element={<EmploymentPage />} />
            <Route path="consumer-rights" element={<ConsumerRightsPage />} />
            <Route path="traffic-appeals" element={<TrafficAppealsPage />} />
          </Route>
          {/* Standalone pages without layout */}
          <Route path="AgentsSDK-FlexibleReact" element={<AgentsSDKFlexibleReactPage />} />
          <Route path="webchat-demos" element={<WebChatDemosPage />} />
          <Route path="AgentsSDK-demos" element={<AgentsSDKDemosPage />} />
          <Route path="branding-demos" element={<BrandingDemosPage />} />
          <Route path="voice-demos" element={<VoiceDemosPage />} />
          <Route path="voice-demos-v2" element={<VoiceDemosV2Page />} />
          <Route path="embedded-agent" element={<EmbeddedAgentPage />} />
        </Routes>
      </BrowserRouter>
    </FluentProvider>
  );
}

export default App;
