/**
 * Microsoft 365 Agents SDK - Flexible React Approach
 * 
 * This page demonstrates the Flexible React pattern using:
 * - Composer + BasicWebChat from botframework-webchat
 * - FluentThemeProvider from botframework-webchat-fluent-theme
 * - CopilotStudioClient from @microsoft/agents-copilotstudio-client
 * 
 * This approach requires Azure AD authentication (user sign-in).
 * It separates context provider (Composer) from UI (BasicWebChat),
 * enabling FluentThemeProvider for Teams/M365 styling.
 */
import { useState, useEffect, useCallback } from 'react';
import ReactWebChat from 'botframework-webchat';
import { FluentThemeProvider } from 'botframework-webchat-fluent-theme';
import { CopilotStudioClient, CopilotStudioWebChat } from '@microsoft/agents-copilotstudio-client';
import type { ConnectionSettings, CopilotStudioWebChatConnection } from '@microsoft/agents-copilotstudio-client';
import {
  PublicClientApplication,
  InteractionRequiredAuthError,
} from '@azure/msal-browser';
import {
  makeStyles,
  shorthands,
  tokens,
  Button,
  Text,
  Spinner,
  Card,
  Title2,
  Body1,
  Badge,
} from '@fluentui/react-components';
import {
  Chat24Filled,
  Person24Regular,
  SignOut24Regular,
  Info24Regular,
  ArrowSync24Regular,
} from '@fluentui/react-icons';

// ============================================================================
// CONFIGURATION
// ============================================================================

// Connection settings for Copilot Studio
const connectionSettings: ConnectionSettings = {
  // Direct connect URL from Copilot Studio > Channels > Web app
  directConnectUrl: import.meta.env.VITE_COPILOT_DIRECT_CONNECT_URL || '',
  // Azure AD App Registration
  appClientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
  tenantId: import.meta.env.VITE_AZURE_TENANT_ID || '',
};

// Derive the environment-specific scope from the Direct Connect URL
// Format: https://{environment}.environment.api.powerplatform.com/.default
const getEnvironmentScope = (directConnectUrl: string): string => {
  if (!directConnectUrl) return '';
  try {
    const url = new URL(directConnectUrl);
    return `https://${url.host}/.default`;
  } catch {
    return '';
  }
};

const environmentScope = getEnvironmentScope(connectionSettings.directConnectUrl || '');
console.log('[Config] Environment scope:', environmentScope);

// MSAL Configuration
const msalConfig = {
  auth: {
    clientId: connectionSettings.appClientId || '',
    authority: `https://login.microsoftonline.com/${connectionSettings.tenantId || 'common'}`,
    // Use base origin - Azure doesn't allow paths in SPA redirect URIs
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'sessionStorage' as const,
    storeAuthStateInCookie: false,
  },
};

// Use the environment-specific scope
const loginRequest = {
  scopes: environmentScope ? [environmentScope] : [],
};

// ============================================================================
// STYLES
// ============================================================================

const useStyles = makeStyles({
  page: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    background: 'linear-gradient(135deg, #0078d4 0%, #106ebe 100%)',
    color: 'white',
    ...shorthands.padding('24px', '32px'),
  },
  headerContent: {
    maxWidth: '1200px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  headerTitle: {
    color: 'white',
    marginBottom: tokens.spacingVerticalS,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
  },
  badge: {
    marginLeft: tokens.spacingHorizontalM,
  },
  container: {
    maxWidth: '1200px',
    marginLeft: 'auto',
    marginRight: 'auto',
    ...shorthands.padding('32px'),
    flex: 1,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '32px',
    '@media (max-width: 900px)': {
      gridTemplateColumns: '1fr',
    },
  },
  infoCard: {
    ...shorthands.padding('24px'),
  },
  infoSection: {
    marginBottom: tokens.spacingVerticalL,
  },
  infoTitle: {
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: tokens.spacingVerticalS,
    color: '#0078d4',
  },
  infoText: {
    color: tokens.colorNeutralForeground2,
    lineHeight: '1.6',
  },
  codeBlock: {
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    ...shorthands.padding('16px'),
    borderRadius: tokens.borderRadiusMedium,
    fontFamily: 'Consolas, monospace',
    fontSize: '13px',
    overflowX: 'auto',
    marginTop: tokens.spacingVerticalS,
  },
  chatCard: {
    ...shorthands.padding('0'),
    overflow: 'hidden',
    height: '600px',
    display: 'flex',
    flexDirection: 'column',
  },
  chatHeader: {
    background: 'linear-gradient(135deg, #0078d4 0%, #106ebe 100%)',
    color: 'white',
    ...shorthands.padding('16px', '20px'),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  chatTitle: {
    fontWeight: tokens.fontWeightSemibold,
    color: 'white',
  },
  chatStatus: {
    fontSize: tokens.fontSizeBase200,
    color: 'rgba(255,255,255,0.8)',
  },
  chatBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
  },
  centeredContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: tokens.spacingVerticalL,
    ...shorthands.padding('32px'),
    textAlign: 'center',
  },
  signInButton: {
    minWidth: '200px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    backgroundColor: 'rgba(255,255,255,0.1)',
    ...shorthands.padding('8px', '12px'),
    borderRadius: tokens.borderRadiusMedium,
  },
  userName: {
    color: 'white',
    fontSize: tokens.fontSizeBase200,
  },
  signOutButton: {
    color: 'white',
    minWidth: 'auto',
  },
  webChatWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  configWarning: {
    backgroundColor: '#fff3cd',
    ...shorthands.border('1px', 'solid', '#ffc107'),
    ...shorthands.padding('16px'),
    borderRadius: tokens.borderRadiusMedium,
    marginBottom: tokens.spacingVerticalM,
  },
  configList: {
    marginTop: tokens.spacingVerticalS,
    paddingLeft: '20px',
  },
});

// ============================================================================
// TYPES
// ============================================================================

type AuthStatus = 'checking' | 'signed-out' | 'signing-in' | 'signed-in' | 'error';
type ChatStatus = 'idle' | 'connecting' | 'ready' | 'error';

interface UserInfo {
  name: string;
  email: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function AgentsSDKFlexibleReactPage() {
  const styles = useStyles();
  
  // Auth state
  const [msalInstance, setMsalInstance] = useState<PublicClientApplication | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [authError, setAuthError] = useState<string>('');
  
  // Chat state
  const [chatStatus, setChatStatus] = useState<ChatStatus>('idle');
  const [directLine, setDirectLine] = useState<CopilotStudioWebChatConnection | null>(null);
  const [chatError, setChatError] = useState<string>('');

  // Check if configured
  const isConfigured = Boolean(
    connectionSettings.directConnectUrl &&
    connectionSettings.appClientId &&
    connectionSettings.tenantId
  );

  // Initialize MSAL
  useEffect(() => {
    if (!isConfigured) {
      setAuthStatus('signed-out');
      return;
    }

    const initMsal = async () => {
      try {
        const msal = new PublicClientApplication(msalConfig);
        await msal.initialize();
        
        // Handle redirect response
        const response = await msal.handleRedirectPromise();
        if (response) {
          console.log('[MSAL] Login redirect successful');
          // Redirect back to this page after successful login
          const returnUrl = sessionStorage.getItem('msal_return_url');
          if (returnUrl) {
            sessionStorage.removeItem('msal_return_url');
            window.location.href = returnUrl;
            return;
          }
        }

        setMsalInstance(msal);

        // Check if already signed in
        const accounts = msal.getAllAccounts();
        if (accounts.length > 0) {
          setUserInfo({
            name: accounts[0].name || accounts[0].username,
            email: accounts[0].username,
          });
          setAuthStatus('signed-in');
        } else {
          setAuthStatus('signed-out');
        }
      } catch (err) {
        console.error('[MSAL] Initialization failed:', err);
        setAuthError(err instanceof Error ? err.message : 'Failed to initialize');
        setAuthStatus('error');
      }
    };

    initMsal();
  }, [isConfigured]);

  // Sign in
  const handleSignIn = useCallback(async () => {
    if (!msalInstance) return;

    setAuthStatus('signing-in');
    setAuthError('');

    try {
      // Save current URL to return after login
      sessionStorage.setItem('msal_return_url', window.location.href);
      await msalInstance.loginRedirect(loginRequest);
    } catch (err) {
      console.error('[MSAL] Login failed:', err);
      setAuthError(err instanceof Error ? err.message : 'Login failed');
      setAuthStatus('error');
    }
  }, [msalInstance]);

  // Sign out
  const handleSignOut = useCallback(async () => {
    if (!msalInstance) return;

    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      await msalInstance.logoutRedirect({
        account: accounts[0],
      });
    }
  }, [msalInstance]);

  // Acquire token
  const acquireToken = useCallback(async (): Promise<string> => {
    if (!msalInstance) throw new Error('MSAL not initialized');

    const accounts = msalInstance.getAllAccounts();
    if (accounts.length === 0) throw new Error('No account signed in');

    try {
      const response = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });
      return response.accessToken;
    } catch (err) {
      if (err instanceof InteractionRequiredAuthError) {
        await msalInstance.loginRedirect(loginRequest);
        throw new Error('Redirecting to login...');
      }
      throw err;
    }
  }, [msalInstance]);

  // Initialize chat when signed in
  const initializeChat = useCallback(async () => {
    if (authStatus !== 'signed-in' || !isConfigured) return;

    setChatStatus('connecting');
    setChatError('');

    try {
      console.log('[Chat] Acquiring token...');
      const token = await acquireToken();
      console.log('[Chat] Token acquired, creating client...');

      // Create Copilot Studio client
      const client = new CopilotStudioClient(connectionSettings, token);
      
      // Create DirectLine-compatible connection using CopilotStudioWebChat
      const connection = CopilotStudioWebChat.createConnection(client, {
        showTyping: true
      });
      console.log('[Chat] WebChat connection created');

      setDirectLine(connection);
      setChatStatus('ready');
    } catch (err) {
      console.error('[Chat] Initialization failed:', err);
      setChatError(err instanceof Error ? err.message : 'Failed to connect');
      setChatStatus('error');
    }
  }, [authStatus, isConfigured, acquireToken]);

  // Auto-initialize chat when signed in
  useEffect(() => {
    if (authStatus === 'signed-in' && chatStatus === 'idle') {
      initializeChat();
    }
  }, [authStatus, chatStatus, initializeChat]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Title2 className={styles.headerTitle}>
            Microsoft 365 Agents SDK
            <Badge appearance="filled" color="informative" className={styles.badge}>
              Flexible React
            </Badge>
          </Title2>
          <Body1 className={styles.headerSubtitle}>
            Composer + BasicWebChat + FluentThemeProvider Pattern
          </Body1>
        </div>
      </div>

      {/* Content */}
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Info Panel */}
          <div>
            <Card className={styles.infoCard}>
              <div className={styles.infoSection}>
                <Text className={styles.infoTitle}>
                  <Info24Regular style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  About This Approach
                </Text>
                <Text className={styles.infoText} block>
                  The Flexible React approach uses the M365 Agents SDK with FluentThemeProvider 
                  for Microsoft styling. This enables authenticated access to Copilot Studio 
                  with Teams/M365-like theming.
                </Text>
              </div>

              <div className={styles.infoSection}>
                <Text className={styles.infoTitle}>When to Use</Text>
                <ul className={styles.configList}>
                  <li>Need Microsoft Fluent styling</li>
                  <li>Require user authentication (Azure AD)</li>
                  <li>Want access to user identity in bot</li>
                  <li>Building enterprise integrations</li>
                </ul>
              </div>

              <div className={styles.infoSection}>
                <Text className={styles.infoTitle}>Architecture</Text>
                <div className={styles.codeBlock}>
{`// M365 Agents SDK + FluentThemeProvider
const client = new CopilotStudioClient(settings, token);
const connection = CopilotStudioWebChat.createConnection(client);

<FluentThemeProvider>
  <ReactWebChat directLine={connection} />
</FluentThemeProvider>`}
                </div>
              </div>

              <div className={styles.infoSection}>
                <Text className={styles.infoTitle}>Required Configuration</Text>
                <Text className={styles.infoText} block>
                  This approach requires Azure AD authentication:
                </Text>
                <ul className={styles.configList}>
                  <li><code>VITE_COPILOT_DIRECT_CONNECT_URL</code> - From Copilot Studio</li>
                  <li><code>VITE_AZURE_CLIENT_ID</code> - Azure AD App ID</li>
                  <li><code>VITE_AZURE_TENANT_ID</code> - Azure AD Tenant ID</li>
                </ul>
                <Text className={styles.infoText} block style={{ marginTop: '12px' }}>
                  <strong>Important:</strong> Your Azure AD app needs the <code>CopilotStudio.Copilots.Invoke</code> permission 
                  from the Power Platform API. If this API isn't available in your tenant, an admin must register it first.
                </Text>
              </div>

              {!isConfigured && (
                <div className={styles.configWarning}>
                  <Text weight="semibold">⚠️ Not Configured</Text>
                  <Text block style={{ marginTop: '8px' }}>
                    Add the following to your <code>.env</code> file:
                  </Text>
                  <div className={styles.codeBlock}>
{`VITE_COPILOT_DIRECT_CONNECT_URL=https://...
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_TENANT_ID=your-tenant-id`}
                  </div>
                  <Text block style={{ marginTop: '12px', fontSize: '13px' }}>
                    <strong>Note:</strong> If Power Platform API is not in your tenant, run this as admin:
                  </Text>
                  <div className={styles.codeBlock}>
{`# Register Power Platform API in tenant
Connect-AzureAD
New-AzureADServicePrincipal -AppId 8578e004-a5c6-46e7-913e-12f58912df43`}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Chat Panel */}
          <Card className={styles.chatCard}>
            {/* Chat Header */}
            <div className={styles.chatHeader}>
              <div className={styles.chatHeaderLeft}>
                <Chat24Filled />
                <div>
                  <Text className={styles.chatTitle}>Citizen Advice</Text>
                  <Text className={styles.chatStatus}>
                    {authStatus === 'signed-in' && chatStatus === 'ready' && 'Connected'}
                    {authStatus === 'signed-in' && chatStatus === 'connecting' && 'Connecting...'}
                    {authStatus === 'signed-out' && 'Sign in required'}
                    {authStatus === 'checking' && 'Checking...'}
                  </Text>
                </div>
              </div>
              {userInfo && (
                <div className={styles.userInfo}>
                  <Person24Regular />
                  <Text className={styles.userName}>{userInfo.name}</Text>
                  <Button
                    appearance="subtle"
                    icon={<SignOut24Regular />}
                    className={styles.signOutButton}
                    onClick={handleSignOut}
                    title="Sign out"
                  />
                </div>
              )}
            </div>

            {/* Chat Body */}
            <div className={styles.chatBody}>
              {/* Not Configured */}
              {!isConfigured && (
                <div className={styles.centeredContainer}>
                  <Info24Regular style={{ fontSize: '48px', color: '#0078d4' }} />
                  <Text weight="semibold" size={500}>Configuration Required</Text>
                  <Text>
                    Please configure Azure AD and Copilot Studio settings in your .env file.
                  </Text>
                </div>
              )}

              {/* Checking Auth */}
              {isConfigured && authStatus === 'checking' && (
                <div className={styles.centeredContainer}>
                  <Spinner size="large" label="Checking authentication..." />
                </div>
              )}

              {/* Sign In Required */}
              {isConfigured && authStatus === 'signed-out' && (
                <div className={styles.centeredContainer}>
                  <Person24Regular style={{ fontSize: '48px', color: '#0078d4' }} />
                  <Text weight="semibold" size={500}>Sign In Required</Text>
                  <Text>
                    This approach uses Azure AD authentication.
                    <br />
                    Sign in with your Microsoft account to continue.
                  </Text>
                  <Button
                    appearance="primary"
                    icon={<Person24Regular />}
                    className={styles.signInButton}
                    onClick={handleSignIn}
                  >
                    Sign in with Microsoft
                  </Button>
                </div>
              )}

              {/* Signing In */}
              {isConfigured && authStatus === 'signing-in' && (
                <div className={styles.centeredContainer}>
                  <Spinner size="large" label="Signing in..." />
                </div>
              )}

              {/* Auth Error */}
              {authStatus === 'error' && (
                <div className={styles.centeredContainer}>
                  <Text weight="semibold" style={{ color: '#d32f2f' }}>
                    Authentication Error
                  </Text>
                  <Text>{authError}</Text>
                  <Button appearance="primary" onClick={handleSignIn}>
                    Try Again
                  </Button>
                </div>
              )}

              {/* Connecting */}
              {authStatus === 'signed-in' && chatStatus === 'connecting' && (
                <div className={styles.centeredContainer}>
                  <Spinner size="large" label="Connecting to Copilot..." />
                </div>
              )}

              {/* Chat Error */}
              {authStatus === 'signed-in' && chatStatus === 'error' && (
                <div className={styles.centeredContainer}>
                  <Text weight="semibold" style={{ color: '#d32f2f' }}>
                    Connection Error
                  </Text>
                  <Text>{chatError}</Text>
                  <Button
                    appearance="primary"
                    icon={<ArrowSync24Regular />}
                    onClick={initializeChat}
                  >
                    Retry
                  </Button>
                </div>
              )}

              {/* Ready - Flexible React Pattern with FluentThemeProvider */}
              {authStatus === 'signed-in' && chatStatus === 'ready' && directLine && (
                <div className={styles.webChatWrapper}>
                  <FluentThemeProvider>
                    <ReactWebChat
                      directLine={directLine}
                      locale="en-GB"
                      styleOptions={{
                        hideUploadButton: true,
                      }}
                    />
                  </FluentThemeProvider>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
