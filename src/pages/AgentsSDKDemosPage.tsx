/**
 * M365 Agents SDK Demos Page
 * 
 * Authenticated demo page showcasing different WebChat integration patterns
 * using the M365 Agents SDK with Connection String.
 * 
 * Authentication happens once at page level - all demo tabs share the same connection.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  PublicClientApplication,
  InteractionRequiredAuthError,
} from '@azure/msal-browser';
import { CopilotStudioClient, CopilotStudioWebChat } from '@microsoft/agents-copilotstudio-client';
import type { ConnectionSettings, CopilotStudioWebChatConnection } from '@microsoft/agents-copilotstudio-client';
import {
  makeStyles,
  shorthands,
  tokens,
  Tab,
  TabList,
  Text,
  Card,
  Badge,
  Title1,
  Body1,
  Button,
  Spinner,
  Avatar,
} from '@fluentui/react-components';
import {
  Globe24Regular,
  Code24Regular,
  Settings24Regular,
  WindowDevTools24Regular,
  Person24Regular,
  SignOut24Regular,
  Home24Regular,
  Shield24Regular,
  Chat24Regular,
  Color24Regular,
  PaintBrush24Regular,
  DesignIdeas24Regular,
  Organization24Regular,
} from '@fluentui/react-icons';

// Import demo components
import AgentSDKCdnDemo from '../demos/AgentSDK-cdn-renderwebchat/AgentSDKCdnDemo';
import AgentSDKSimpleReactDemo from '../demos/AgentSDK-simple-react/AgentSDKSimpleReactDemo';
import AgentSDKFlexibleReactDemo from '../demos/AgentSDK-flexible-react/AgentSDKFlexibleReactDemo';
import AgentSDKMiddlewareDemo from '../demos/AgentSDK-middleware/AgentSDKMiddlewareDemo';
import AgentSDKMinimizableDemo from '../demos/AgentSDK-minimizable/AgentSDKMinimizableDemo';
import AgentSDKStyleOptionsDemo from '../demos/AgentSDK-styleoptions/AgentSDKStyleOptionsDemo';
import AgentSDKStyleSetDemo from '../demos/AgentSDK-styleset/AgentSDKStyleSetDemo';
import AgentSDKFluentThemeDemo from '../demos/AgentSDK-fluent-theme/AgentSDKFluentThemeDemo';
import DemoHeader from '../components/layout/DemoHeader';
import { CodeBlockWithModal } from '../components/common/CodeModal';

// ============================================================================
// CONFIGURATION
// ============================================================================

const connectionSettings: ConnectionSettings = {
  directConnectUrl: import.meta.env.VITE_COPILOT_DIRECT_CONNECT_URL || '',
  appClientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
  tenantId: import.meta.env.VITE_AZURE_TENANT_ID || '',
};

const msalConfig = {
  auth: {
    clientId: connectionSettings.appClientId || '',
    authority: `https://login.microsoftonline.com/${connectionSettings.tenantId || 'common'}`,
    redirectUri: window.location.origin,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'sessionStorage' as const,
    storeAuthStateInCookie: false,
  },
};

const loginRequest = {
  // Power Platform API scope for CopilotStudio.Copilots.Invoke
  scopes: ['8578e004-a5c6-46e7-913e-12f58912df43/.default'],
};

// ============================================================================
// STYLES
// ============================================================================

const useStyles = makeStyles({
  page: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  header: {
    background: 'linear-gradient(135deg, #0078d4 0%, #106ebe 100%)',
    color: 'white',
    ...shorthands.padding('24px', '48px'),
  },
  headerContent: {
    maxWidth: '1400px',
    marginLeft: 'auto',
    marginRight: 'auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
  },
  headerTitle: {
    color: 'white',
    marginBottom: tokens.spacingVerticalXS,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    backgroundColor: 'rgba(255,255,255,0.15)',
    ...shorthands.padding('8px', '16px'),
    borderRadius: tokens.borderRadiusMedium,
  },
  userName: {
    color: 'white',
  },
  signOutButton: {
    color: 'white',
  },
  badge: {
    marginLeft: tokens.spacingHorizontalM,
  },
  container: {
    maxWidth: '1400px',
    marginLeft: 'auto',
    marginRight: 'auto',
    ...shorthands.padding('24px', '48px'),
  },
  tabsCard: {
    marginBottom: tokens.spacingVerticalL,
  },
  tabList: {
    ...shorthands.padding(tokens.spacingHorizontalM),
    borderBottom: '1px solid #e0e0e0',
  },
  tabContent: {
    ...shorthands.padding(tokens.spacingHorizontalL),
  },
  centeredContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: tokens.spacingVerticalL,
    textAlign: 'center',
  },
  configWarning: {
    backgroundColor: '#fff3cd',
    ...shorthands.border('1px', 'solid', '#ffc107'),
    ...shorthands.padding('24px'),
    borderRadius: tokens.borderRadiusMedium,
    maxWidth: '500px',
  },
  codeBlock: {
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    ...shorthands.padding('16px'),
    borderRadius: tokens.borderRadiusMedium,
    fontFamily: 'Consolas, monospace',
    fontSize: '13px',
    marginTop: tokens.spacingVerticalS,
    textAlign: 'left',
  },
  // Overview styles
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: tokens.spacingHorizontalL,
    marginTop: tokens.spacingVerticalL,
  },
  overviewCard: {
    ...shorthands.padding(tokens.spacingHorizontalL),
    cursor: 'pointer',
    transitionProperty: 'transform, box-shadow',
    transitionDuration: '0.2s',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: tokens.shadow16,
    },
  },
  cardIcon: {
    fontSize: '32px',
    color: '#0078d4',
    marginBottom: tokens.spacingVerticalS,
  },
  cardTitle: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase400,
    marginBottom: tokens.spacingVerticalXS,
  },
  cardDescription: {
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase200,
    marginBottom: tokens.spacingVerticalS,
  },
  cardFeatures: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalXS,
    marginBottom: tokens.spacingVerticalS,
  },
  featureTag: {
    backgroundColor: '#f0f0f0',
    color: '#666',
    ...shorthands.padding('2px', '8px'),
    borderRadius: tokens.borderRadiusMedium,
    fontSize: '11px',
  },
  cardBadge: {
    marginTop: tokens.spacingVerticalXS,
  },
  overviewHeader: {
    marginBottom: tokens.spacingVerticalL,
  },
  authBanner: {
    background: 'linear-gradient(135deg, #107c10 0%, #0b6a0b 100%)',
    color: 'white',
    ...shorthands.padding('16px', '24px'),
    borderRadius: tokens.borderRadiusMedium,
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: tokens.spacingVerticalL,
  },
  // Architecture Page Styles
  architectureSection: {
    marginBottom: tokens.spacingVerticalXL,
  },
  architectureSectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: tokens.spacingVerticalM,
  },
  architectureSectionIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  },
  architectureSectionTitle: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#1f2937',
  },
  architectureBadge: {
    marginLeft: '12px',
    ...shorthands.padding('4px', '12px'),
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  architectureDescription: {
    color: '#6b7280',
    fontSize: '15px',
    marginBottom: tokens.spacingVerticalL,
    maxWidth: '700px',
    lineHeight: '1.6',
  },
  architectureCard: {
    backgroundColor: '#fafafa',
    ...shorthands.border('1px', 'solid', '#e8e8e8'),
    borderRadius: '16px',
    ...shorthands.padding('24px'),
    marginBottom: tokens.spacingVerticalL,
  },
  architectureCardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600',
    fontSize: '16px',
    marginBottom: tokens.spacingVerticalL,
    color: '#374151',
  },
  // OAuth Flow Diagram
  oauthFlowContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    ...shorthands.padding('24px'),
  },
  oauthFlowRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    width: '100%',
    justifyContent: 'center',
  },
  oauthFlowBox: {
    ...shorthands.padding('16px', '24px'),
    borderRadius: '12px',
    textAlign: 'center',
    minWidth: '180px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  oauthFlowBoxBlue: {
    backgroundColor: '#0078d4',
    color: 'white',
  },
  oauthFlowBoxGreen: {
    backgroundColor: '#22c55e',
    color: 'white',
  },
  oauthFlowBoxPurple: {
    backgroundColor: '#8b5cf6',
    color: 'white',
  },
  oauthFlowBoxWhite: {
    backgroundColor: 'white',
    color: '#374151',
    ...shorthands.border('1px', 'solid', '#e5e7eb'),
  },
  oauthFlowBoxIcon: {
    fontSize: '24px',
    marginBottom: '4px',
  },
  oauthFlowBoxTitle: {
    fontWeight: '600',
    fontSize: '14px',
  },
  oauthFlowBoxSub: {
    fontSize: '11px',
    opacity: 0.9,
    marginTop: '2px',
  },
  oauthFlowArrow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#9ca3af',
    fontSize: '12px',
  },
  oauthFlowLabel: {
    backgroundColor: '#f3f4f6',
    ...shorthands.padding('6px', '16px'),
    borderRadius: '20px',
    fontSize: '12px',
    color: '#6b7280',
    whiteSpace: 'nowrap',
  },
  // Azure AD Setup Steps
  azureSetupGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  },
  setupStepsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  setupStepItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
  },
  setupStepNumber: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#0078d4',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '15px',
    flexShrink: 0,
  },
  setupStepContent: {
    flex: 1,
    ...shorthands.padding('4px', '0'),
  },
  setupStepTitle: {
    fontWeight: '600',
    color: '#0078d4',
    fontSize: '15px',
  },
  setupStepDescription: {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '4px',
  },
  setupStepArrow: {
    marginLeft: '17px',
    color: '#0078d4',
    fontSize: '16px',
    ...shorthands.padding('4px', '0'),
  },
  // Required Packages
  packagesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  packageCodeBlock: {
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    ...shorthands.padding('16px', '20px'),
    borderRadius: '12px',
    fontFamily: 'Consolas, Monaco, monospace',
    fontSize: '12px',
    lineHeight: '1.6',
    overflowX: 'auto',
  },
  packageComment: {
    color: '#6a9955',
  },
  packageKeyword: {
    color: '#c586c0',
  },
  packagePackage: {
    color: '#ce9178',
  },
  packageItem: {
    ...shorthands.padding('12px', '16px'),
    borderRadius: '10px',
    borderLeft: '4px solid',
  },
  packageItemMsal: {
    backgroundColor: '#fef3c7',
    borderLeftColor: '#f59e0b',
  },
  packageItemSdk: {
    backgroundColor: '#fef2f2',
    borderLeftColor: '#ef4444',
  },
  packageItemFluent: {
    backgroundColor: '#dcfce7',
    borderLeftColor: '#22c55e',
  },
  packageItemTitle: {
    fontWeight: '600',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  packageItemDescription: {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '4px',
  },
  // Theming & Styling Section
  themingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    marginTop: tokens.spacingVerticalL,
  },
  themingCard: {
    backgroundColor: 'white',
    ...shorthands.border('1px', 'solid', '#e5e7eb'),
    borderRadius: '16px',
    ...shorthands.padding('24px'),
    display: 'flex',
    flexDirection: 'column',
  },
  themingCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacingVerticalM,
  },
  themingCardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600',
    fontSize: '18px',
  },
  themingCardBadge: {
    ...shorthands.padding('4px', '12px'),
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  themingCardBadgeEasy: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  themingCardBadgeMedium: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  themingCardBadgePremium: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  themingCardDescription: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: tokens.spacingVerticalM,
    lineHeight: '1.5',
  },
  themingCodeBlock: {
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    ...shorthands.padding('16px'),
    borderRadius: '12px',
    fontFamily: 'Consolas, Monaco, monospace',
    fontSize: '11px',
    lineHeight: '1.5',
    overflowX: 'auto',
    flex: 1,
  },
  themingCodeKeyword: {
    color: '#c586c0',
  },
  themingCodeString: {
    color: '#ce9178',
  },
  themingCodeProperty: {
    color: '#9cdcfe',
  },
  themingCodeNumber: {
    color: '#b5cea8',
  },
  themingCodeTag: {
    color: '#569cd6',
  },
  themingCodeComponent: {
    color: '#4ec9b0',
  },
  // Comparison Table
  comparisonSection: {
    marginTop: tokens.spacingVerticalXL,
  },
  comparisonTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: tokens.spacingVerticalM,
  },
  comparisonHeader: {
    backgroundColor: '#f9fafb',
    ...shorthands.borderBottom('2px', 'solid', '#e5e7eb'),
  },
  comparisonHeaderCell: {
    ...shorthands.padding('12px', '16px'),
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '14px',
    color: '#374151',
  },
  comparisonRow: {
    ...shorthands.borderBottom('1px', 'solid', '#e5e7eb'),
  },
  comparisonCell: {
    ...shorthands.padding('12px', '16px'),
    fontSize: '14px',
    color: '#4b5563',
  },
  comparisonFeature: {
    fontWeight: '500',
  },
  comparisonCheck: {
    color: '#22c55e',
    fontSize: '20px',
  },
  comparisonX: {
    color: '#ef4444',
    fontSize: '20px',
  },
  proTipBox: {
    backgroundColor: '#fffbeb',
    ...shorthands.border('1px', 'solid', '#fcd34d'),
    borderRadius: '12px',
    ...shorthands.padding('16px', '20px'),
    marginTop: tokens.spacingVerticalL,
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  proTipIcon: {
    fontSize: '20px',
    flexShrink: 0,
  },
  proTipTitle: {
    fontWeight: '600',
    color: '#92400e',
    fontSize: '14px',
  },
  proTipText: {
    fontSize: '13px',
    color: '#78716c',
    marginTop: '4px',
    lineHeight: '1.5',
  },
});

// ============================================================================
// TYPES
// ============================================================================

type AuthStatus = 'checking' | 'signed-out' | 'signing-in' | 'signed-in' | 'error';
type TabValue = 'overview' | 'architecture' | 'cdn' | 'simple' | 'flexible' | 'middleware' | 'minimizable' | 'branding' | 'styleoptions' | 'styleset' | 'fluenttheme';

// Code example for config warning
const configCode = `VITE_COPILOT_DIRECT_CONNECT_URL=https://...
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_TENANT_ID=your-tenant-id`;

interface UserInfo {
  name: string;
  email: string;
}

interface DemoOption {
  id: Exclude<TabValue, 'overview' | 'architecture' | 'branding'>;
  title: string;
  description: string;
  icon: React.ReactNode;
  complexity: 'Easy' | 'Medium' | 'Advanced';
  badgeColor: 'success' | 'warning' | 'danger';
  features: string[];
  category?: 'integration' | 'styling';
}

const demoOptions: DemoOption[] = [
  // Integration Patterns
  {
    id: 'cdn',
    title: 'CDN + renderWebChat',
    description: 'Vanilla JS pattern using createRoot. Best for non-React apps or CMS integration.',
    icon: <Globe24Regular />,
    complexity: 'Easy',
    badgeColor: 'success',
    features: ['No build tools', 'Works in any HTML', 'Quick prototyping'],
    category: 'integration',
  },
  {
    id: 'simple',
    title: 'Simple ReactWebChat',
    description: 'Single component integration. Pass directLine and styleOptions for quick setup.',
    icon: <Code24Regular />,
    complexity: 'Easy',
    badgeColor: 'success',
    features: ['Minimal code', 'TypeScript support', 'All props in one place'],
    category: 'integration',
  },
  {
    id: 'flexible',
    title: 'Flexible React + Fluent Theme',
    description: 'Production-ready with FluentThemeProvider for Teams/M365 styling.',
    icon: <Settings24Regular />,
    complexity: 'Medium',
    badgeColor: 'warning',
    features: ['Microsoft styling', 'Theme customization', 'Component composition'],
    category: 'integration',
  },
  {
    id: 'middleware',
    title: 'Middleware + Custom Cards',
    description: 'Intercept messages with store middleware. Render custom premium response cards.',
    icon: <WindowDevTools24Regular />,
    complexity: 'Advanced',
    badgeColor: 'danger',
    features: ['Activity interception', 'Custom UI rendering', 'Analytics & logging'],
    category: 'integration',
  },
  {
    id: 'minimizable',
    title: 'Minimizable Chat Widget',
    description: 'Floating chat widget for websites. Minimize/maximize with state preservation.',
    icon: <Chat24Regular />,
    complexity: 'Medium',
    badgeColor: 'warning',
    features: ['Floating widget', 'State preservation', 'Position toggle'],
    category: 'integration',
  },
  // Styling & Branding
  {
    id: 'styleoptions',
    title: 'StyleOptions Customization',
    description: 'Simple & effective styling with styleOptions. Change colors, fonts, and avatars.',
    icon: <Color24Regular />,
    complexity: 'Easy',
    badgeColor: 'success',
    features: ['Quick setup', 'Brand colors', 'Avatar styling', 'No CSS needed'],
    category: 'styling',
  },
  {
    id: 'styleset',
    title: 'StyleSet Advanced Styling',
    description: 'Granular control with createStyleSet(). Customize timestamps, typing indicators, and more.',
    icon: <PaintBrush24Regular />,
    complexity: 'Advanced',
    badgeColor: 'danger',
    features: ['Full control', 'Timestamp styling', 'Scrollbar customization', 'CSS-in-JS'],
    category: 'styling',
  },
  {
    id: 'fluenttheme',
    title: 'Fluent UI Theme System',
    description: 'Native Microsoft Copilot-style experience using FluentThemeProvider.',
    icon: <DesignIdeas24Regular />,
    complexity: 'Easy',
    badgeColor: 'success',
    features: ['Copilot look', 'Code highlighting', 'Starter prompts', 'Shadow DOM'],
    category: 'styling',
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function AgentsSDKDemosPage() {
  const styles = useStyles();
  const [selectedTab, setSelectedTab] = useState<TabValue>('overview');

  // Auth state
  const [msalInstance, setMsalInstance] = useState<PublicClientApplication | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [authError, setAuthError] = useState<string>('');

  // Connection state - keyed by tab to create separate connections (excluding overview, architecture, and branding)
  const [connections, setConnections] = useState<Record<Exclude<TabValue, 'overview' | 'architecture' | 'branding'>, CopilotStudioWebChatConnection | null>>({
    cdn: null,
    simple: null,
    flexible: null,
    middleware: null,
    minimizable: null,
    styleoptions: null,
    styleset: null,
    fluenttheme: null,
  });
  const [connectionError, setConnectionError] = useState<string>('');
  const [isCreatingConnection, setIsCreatingConnection] = useState(false);

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

        const response = await msal.handleRedirectPromise();
        if (response) {
          console.log('[MSAL] Login redirect successful');
          // Restore the original URL after successful login
          const returnUrl = sessionStorage.getItem('msal_return_url');
          if (returnUrl) {
            sessionStorage.removeItem('msal_return_url');
            // Only navigate if we're not already on the correct page
            if (window.location.pathname !== returnUrl) {
              window.history.replaceState(null, '', returnUrl);
            }
          }
        }

        setMsalInstance(msal);

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
      // Save the current URL before redirecting
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
      await msalInstance.logoutRedirect({ account: accounts[0] });
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
        // Save the current URL before redirecting
        sessionStorage.setItem('msal_return_url', window.location.href);
        await msalInstance.loginRedirect(loginRequest);
        throw new Error('Redirecting to login...');
      }
      throw err;
    }
  }, [msalInstance]);

  // Create connection for the selected tab when signed in (skip for overview, architecture, and branding)
  useEffect(() => {
    if (authStatus !== 'signed-in' || selectedTab === 'overview' || selectedTab === 'architecture' || selectedTab === 'branding') return;
    if (connections[selectedTab] || isCreatingConnection) return;

    const createConnection = async () => {
      setIsCreatingConnection(true);
      try {
        console.log(`[Chat] Acquiring token for ${selectedTab} tab...`);
        const token = await acquireToken();
        console.log(`[Chat] Token acquired, creating connection for ${selectedTab}...`);

        const client = new CopilotStudioClient(connectionSettings, token);
        const conn = CopilotStudioWebChat.createConnection(client, {
          showTyping: true,
        });

        setConnections(prev => ({ ...prev, [selectedTab]: conn }));
        console.log(`[Chat] Connection created successfully for ${selectedTab}`);
      } catch (err) {
        console.error('[Chat] Connection failed:', err);
        setConnectionError(err instanceof Error ? err.message : 'Failed to connect');
      } finally {
        setIsCreatingConnection(false);
      }
    };

    createConnection();
  }, [authStatus, selectedTab, connections, acquireToken, isCreatingConnection]);

  // Get current connection (only for demo tabs)
  const connection = selectedTab !== 'overview' && selectedTab !== 'architecture' && selectedTab !== 'branding' ? connections[selectedTab] : null;

  // Handle card click to navigate to demo
  const handleCardClick = (tabId: Exclude<TabValue, 'overview' | 'architecture' | 'branding'>) => {
    setSelectedTab(tabId);
  };

  // Render overview content
  const renderOverview = () => {
    const integrationDemos = demoOptions.filter(o => o.category === 'integration');

    return (
      <div>
        <div className={styles.overviewHeader}>
          <Text size={500} weight="semibold">
            Web Chat Integration & Styling Demos
          </Text>
          <Text block style={{ marginTop: '8px', color: '#666' }}>
            Explore different integration patterns and styling approaches for Web Chat. 
            Click on a card to see the live demo and implementation code.
          </Text>
        </div>

        {authStatus === 'signed-in' && userInfo && (
          <div className={styles.authBanner}>
            <Shield24Regular style={{ fontSize: 28 }} />
            <div>
              <Text weight="semibold" style={{ color: 'white' }}>
                Authenticated as {userInfo.name}
              </Text>
              <Text size={200} style={{ color: 'rgba(255,255,255,0.9)' }} block>
                You're signed in with Azure AD. All demos use the M365 Agents SDK with your credentials.
              </Text>
            </div>
          </div>
        )}

        {/* Integration Patterns Section */}
        <Text size={400} weight="semibold" style={{ marginTop: '24px', marginBottom: '12px' }} block>
          📦 Integration Patterns
        </Text>
        <Text size={200} style={{ color: '#666', marginBottom: '16px' }} block>
          Different ways to integrate Web Chat into your application
        </Text>
        <div className={styles.overviewGrid}>
          {integrationDemos.map((option) => (
            <Card
              key={option.id}
              className={styles.overviewCard}
              onClick={() => handleCardClick(option.id)}
            >
              <div className={styles.cardIcon}>{option.icon}</div>
              <Text className={styles.cardTitle}>{option.title}</Text>
              <Text className={styles.cardDescription}>{option.description}</Text>
              <div className={styles.cardFeatures}>
                {option.features.map((feature, idx) => (
                  <span key={idx} className={styles.featureTag}>{feature}</span>
                ))}
              </div>
              <div className={styles.cardBadge}>
                <Badge appearance="filled" color={option.badgeColor}>
                  {option.complexity}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Render architecture content
  const renderArchitecture = () => {
    return (
      <div>
        {/* M365 Agents SDK Architecture Header */}
        <div className={styles.architectureSection}>
          <div className={styles.architectureSectionHeader}>
            <div className={styles.architectureSectionIcon} style={{ backgroundColor: '#fef3c7' }}>
              🔑
            </div>
            <div>
              <span className={styles.architectureSectionTitle}>M365 Agents SDK Architecture</span>
              <Badge 
                appearance="filled" 
                color="warning" 
                className={styles.architectureBadge}
              >
                AUTHENTICATED ACCESS
              </Badge>
            </div>
          </div>
          <Text className={styles.architectureDescription}>
            The M365 Agents SDK enables authenticated chat with Azure AD integration. Provides user identity 
            context and access to enterprise data sources.
          </Text>

          {/* OAuth 2.0 Authentication Flow */}
          <div className={styles.architectureCard}>
            <div className={styles.architectureCardTitle}>
              🔄 OAuth 2.0 Authentication Flow
            </div>
            <div className={styles.oauthFlowContainer}>
              {/* Row 1: User Browser -> Azure AD */}
              <div className={styles.oauthFlowRow}>
                <div className={`${styles.oauthFlowBox} ${styles.oauthFlowBoxBlue}`}>
                  <div className={styles.oauthFlowBoxIcon}>👤</div>
                  <div className={styles.oauthFlowBoxTitle}>User Browser</div>
                  <div className={styles.oauthFlowBoxSub}>React + MSAL</div>
                </div>
                <div className={styles.oauthFlowArrow}>
                  <span className={styles.oauthFlowLabel}>1. Sign In</span>
                  <span>→</span>
                </div>
                <div className={`${styles.oauthFlowBox} ${styles.oauthFlowBoxGreen}`}>
                  <div className={styles.oauthFlowBoxIcon}>🔐</div>
                  <div className={styles.oauthFlowBoxTitle}>Azure AD</div>
                  <div className={styles.oauthFlowBoxSub}>Entra ID</div>
                </div>
              </div>

              {/* Row 2: Access Token -> Scope */}
              <div className={styles.oauthFlowRow}>
                <div className={`${styles.oauthFlowBox} ${styles.oauthFlowBoxBlue}`}>
                  <div className={styles.oauthFlowBoxIcon}>🎫</div>
                  <div className={styles.oauthFlowBoxTitle}>Access Token</div>
                  <div className={styles.oauthFlowBoxSub}>api.powerplatform.com</div>
                </div>
                <div className={styles.oauthFlowArrow}>
                  <span className={styles.oauthFlowLabel}>2. Acquire Token</span>
                  <span>→</span>
                </div>
                <div className={`${styles.oauthFlowBox} ${styles.oauthFlowBoxWhite}`}>
                  <div className={styles.oauthFlowBoxIcon}>📋</div>
                  <div className={styles.oauthFlowBoxTitle}>Scope</div>
                  <div className={styles.oauthFlowBoxSub}>CopilotStudio.Copilots.Invoke</div>
                </div>
              </div>

              {/* Row 3: CopilotStudioClient -> Power Platform API */}
              <div className={styles.oauthFlowRow}>
                <div className={`${styles.oauthFlowBox} ${styles.oauthFlowBoxBlue}`}>
                  <div className={styles.oauthFlowBoxIcon}>📦</div>
                  <div className={styles.oauthFlowBoxTitle}>CopilotStudioClient</div>
                  <div className={styles.oauthFlowBoxSub}>SDK Instance</div>
                </div>
                <div className={styles.oauthFlowArrow}>
                  <span className={styles.oauthFlowLabel}>3. Direct Connect</span>
                  <span>→</span>
                </div>
                <div className={`${styles.oauthFlowBox} ${styles.oauthFlowBoxBlue}`}>
                  <div className={styles.oauthFlowBoxIcon}>☁️</div>
                  <div className={styles.oauthFlowBoxTitle}>Power Platform API</div>
                  <div className={styles.oauthFlowBoxSub}>Authenticated Endpoint</div>
                </div>
              </div>

              {/* Row 4: WebChat -> Copilot Studio */}
              <div className={styles.oauthFlowRow}>
                <div className={`${styles.oauthFlowBox} ${styles.oauthFlowBoxBlue}`}>
                  <div className={styles.oauthFlowBoxIcon}>💬</div>
                  <div className={styles.oauthFlowBoxTitle}>WebChat</div>
                  <div className={styles.oauthFlowBoxSub}>Fluent Theme</div>
                </div>
                <div className={styles.oauthFlowArrow}>
                  <span className={styles.oauthFlowLabel}>4. Chat with Identity</span>
                  <span>→</span>
                </div>
                <div className={`${styles.oauthFlowBox} ${styles.oauthFlowBoxPurple}`}>
                  <div className={styles.oauthFlowBoxIcon}>🤖</div>
                  <div className={styles.oauthFlowBoxTitle}>Copilot Studio</div>
                  <div className={styles.oauthFlowBoxSub}>User-Aware Bot</div>
                </div>
              </div>
            </div>
          </div>

          {/* Azure AD Setup & Required Packages */}
          <div className={styles.azureSetupGrid}>
            {/* Azure AD Setup Steps */}
            <div className={styles.architectureCard}>
              <div className={styles.architectureCardTitle}>
                ⚙️ Azure AD Setup
              </div>
              <div className={styles.setupStepsContainer}>
                <div className={styles.setupStepItem}>
                  <div className={styles.setupStepNumber}>1</div>
                  <div className={styles.setupStepContent}>
                    <div className={styles.setupStepTitle}>Create App Registration</div>
                    <div className={styles.setupStepDescription}>Azure Portal → App registrations → New</div>
                  </div>
                </div>
                <div className={styles.setupStepArrow}>↓</div>
                <div className={styles.setupStepItem}>
                  <div className={styles.setupStepNumber}>2</div>
                  <div className={styles.setupStepContent}>
                    <div className={styles.setupStepTitle}>Configure Redirect URI</div>
                    <div className={styles.setupStepDescription}>SPA → http://localhost:5173</div>
                  </div>
                </div>
                <div className={styles.setupStepArrow}>↓</div>
                <div className={styles.setupStepItem}>
                  <div className={styles.setupStepNumber}>3</div>
                  <div className={styles.setupStepContent}>
                    <div className={styles.setupStepTitle}>Add API Permission</div>
                    <div className={styles.setupStepDescription}>Power Platform API → CopilotStudio.Copilots.Invoke</div>
                  </div>
                </div>
                <div className={styles.setupStepArrow}>↓</div>
                <div className={styles.setupStepItem}>
                  <div className={styles.setupStepNumber}>4</div>
                  <div className={styles.setupStepContent}>
                    <div className={styles.setupStepTitle}>Grant Admin Consent</div>
                    <div className={styles.setupStepDescription}>Admin approval for delegated permissions</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Required Packages */}
            <div className={styles.architectureCard}>
              <div className={styles.architectureCardTitle}>
                📦 Required Packages
              </div>
              <div className={styles.packagesContainer}>
                <div className={styles.packageCodeBlock}>
                  <span className={styles.packageComment}># Core SDK</span>{'\n'}
                  <span className={styles.packageKeyword}>npm install</span> <span className={styles.packagePackage}>@microsoft/agents-copilotstudio-client</span>{'\n\n'}
                  <span className={styles.packageComment}># Authentication</span>{'\n'}
                  <span className={styles.packageKeyword}>npm install</span> <span className={styles.packagePackage}>@azure/msal-browser @azure/msal-react</span>{'\n\n'}
                  <span className={styles.packageComment}># WebChat with Fluent Theme</span>{'\n'}
                  <span className={styles.packageKeyword}>npm install</span> <span className={styles.packagePackage}>botframework-webchat</span>{'\n'}
                  <span className={styles.packageKeyword}>npm install</span> <span className={styles.packagePackage}>botframework-webchat-fluent-theme</span>
                </div>

                <div className={`${styles.packageItem} ${styles.packageItemMsal}`}>
                  <div className={styles.packageItemTitle}>🔐 MSAL</div>
                  <div className={styles.packageItemDescription}>Microsoft Authentication Library for Azure AD</div>
                </div>

                <div className={`${styles.packageItem} ${styles.packageItemSdk}`}>
                  <div className={styles.packageItemTitle}>📦 SDK</div>
                  <div className={styles.packageItemDescription}>CopilotStudioClient for authenticated connections</div>
                </div>

                <div className={`${styles.packageItem} ${styles.packageItemFluent}`}>
                  <div className={styles.packageItemTitle}>✨ Fluent</div>
                  <div className={styles.packageItemDescription}>Microsoft Teams-style theming</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render branding content
  const renderBranding = () => {
    return (
      <div>
        {/* Theming & Styling Options Section */}
        <div className={styles.architectureSection}>
          <div className={styles.architectureSectionHeader}>
            <div className={styles.architectureSectionIcon} style={{ backgroundColor: '#fce7f3' }}>
              🎨
            </div>
            <div>
              <span className={styles.architectureSectionTitle}>Theming & Styling Options</span>
              <Badge 
                appearance="filled" 
                color="danger" 
                className={styles.architectureBadge}
              >
                CUSTOMIZATION
              </Badge>
            </div>
          </div>
          <Text className={styles.architectureDescription}>
            BotFramework WebChat offers multiple approaches to customize the appearance and behavior of your 
            chat interface.
          </Text>

          {/* Three Theming Cards */}
          <div className={styles.themingGrid}>
            {/* Style Options Card */}
            <div className={styles.themingCard}>
              <div className={styles.themingCardHeader}>
                <div className={styles.themingCardTitle}>
                  ⚡ Style Options
                </div>
                <span className={`${styles.themingCardBadge} ${styles.themingCardBadgeEasy}`}>
                  EASY
                </span>
              </div>
              <div className={styles.themingCardDescription}>
                Quick customization via props. Override colors, fonts, spacing, and basic UI elements.
              </div>
              <div className={styles.themingCodeBlock}>
                <span className={styles.themingCodeTag}>&lt;ReactWebChat</span> <span className={styles.themingCodeProperty}>styleOptions</span>={'{'}{'{'}
                {'\n'}  <span className={styles.themingCodeProperty}>primaryFont</span>: <span className={styles.themingCodeString}>'Segoe UI'</span>,
                {'\n'}  <span className={styles.themingCodeProperty}>bubbleBackground</span>: <span className={styles.themingCodeString}>'#0078d4'</span>,
                {'\n'}  <span className={styles.themingCodeProperty}>bubbleFromUserBackground</span>: <span className={styles.themingCodeString}>'#e1f5fe'</span>,
                {'\n'}  <span className={styles.themingCodeProperty}>hideUploadButton</span>: <span className={styles.themingCodeKeyword}>true</span>,
                {'\n'}  <span className={styles.themingCodeProperty}>sendBoxHeight</span>: <span className={styles.themingCodeNumber}>50</span>
                {'\n'}{'}}'} <span className={styles.themingCodeTag}>/&gt;</span>
              </div>
            </div>

            {/* Style Sets Card */}
            <div className={styles.themingCard}>
              <div className={styles.themingCardHeader}>
                <div className={styles.themingCardTitle}>
                  🎨 Style Sets
                </div>
                <span className={`${styles.themingCardBadge} ${styles.themingCardBadgeMedium}`}>
                  MEDIUM
                </span>
              </div>
              <div className={styles.themingCardDescription}>
                Complete CSS-in-JS styling with createStyleSet. Full control over component styles.
              </div>
              <div className={styles.themingCodeBlock}>
                <span className={styles.themingCodeKeyword}>import</span> {'{'} <span className={styles.themingCodeComponent}>createStyleSet</span> {'}'} <span className={styles.themingCodeKeyword}>from</span>
                {'\n'}<span className={styles.themingCodeString}>'botframework-webchat'</span>;
                {'\n\n'}<span className={styles.themingCodeKeyword}>const</span> styleSet =
                {'\n'}<span className={styles.themingCodeComponent}>createStyleSet</span>({'{'}
                {'\n'}  <span className={styles.themingCodeProperty}>bubble</span>: {'{'} <span className={styles.themingCodeProperty}>borderRadius</span>: <span className={styles.themingCodeNumber}>12</span>,
                {'\n'}    <span className={styles.themingCodeProperty}>boxShadow</span>: <span className={styles.themingCodeString}>'0 2px 8px rgba(0,0,0,0.1)'</span>
                {'\n'}  {'}'} {'}'});
              </div>
            </div>

            {/* Fluent Theme Card */}
            <div className={styles.themingCard}>
              <div className={styles.themingCardHeader}>
                <div className={styles.themingCardTitle}>
                  ✨ Fluent Theme
                </div>
                <span className={`${styles.themingCardBadge} ${styles.themingCardBadgePremium}`}>
                  PREMIUM
                </span>
              </div>
              <div className={styles.themingCardDescription}>
                Microsoft Fluent Design System. Teams/M365 look with FluentThemeProvider.
              </div>
              <div className={styles.themingCodeBlock}>
                <span className={styles.themingCodeKeyword}>import</span> {'{'} <span className={styles.themingCodeComponent}>FluentThemeProvider</span> {'}'} <span className={styles.themingCodeKeyword}>from</span>
                {'\n'}<span className={styles.themingCodeString}>'botframework-webchat-fluent-theme'</span>;
                {'\n\n'}<span className={styles.themingCodeTag}>&lt;<span className={styles.themingCodeComponent}>FluentThemeProvider</span>&gt;</span>
                {'\n'}  <span className={styles.themingCodeTag}>&lt;ReactWebChat</span> ... <span className={styles.themingCodeTag}>/&gt;</span>
                {'\n'}<span className={styles.themingCodeTag}>&lt;/<span className={styles.themingCodeComponent}>FluentThemeProvider</span>&gt;</span>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className={styles.comparisonSection}>
            <Text size={400} weight="semibold">
              When to use styleOptions vs styleSet vs Fluent Theme?
            </Text>
            <table className={styles.comparisonTable}>
              <thead className={styles.comparisonHeader}>
                <tr>
                  <th className={styles.comparisonHeaderCell}>Feature</th>
                  <th className={styles.comparisonHeaderCell} style={{ textAlign: 'center' }}>styleOptions</th>
                  <th className={styles.comparisonHeaderCell} style={{ textAlign: 'center' }}>styleSet</th>
                  <th className={styles.comparisonHeaderCell} style={{ textAlign: 'center' }}>Fluent Theme</th>
                </tr>
              </thead>
              <tbody>
                <tr className={styles.comparisonRow}>
                  <td className={`${styles.comparisonCell} ${styles.comparisonFeature}`}>Change bubble background Color</td>
                  <td className={styles.comparisonCell} style={{ textAlign: 'center' }}><span className={styles.comparisonCheck}>✓</span></td>
                  <td className={styles.comparisonCell} style={{ textAlign: 'center' }}><span className={styles.comparisonCheck}>✓</span></td>
                  <td className={styles.comparisonCell} style={{ textAlign: 'center' }}><span className={styles.comparisonCheck}>✓</span></td>
                </tr>
                <tr className={styles.comparisonRow}>
                  <td className={`${styles.comparisonCell} ${styles.comparisonFeature}`}>Change font size & Color globally</td>
                  <td className={styles.comparisonCell} style={{ textAlign: 'center' }}><span className={styles.comparisonCheck}>✓</span></td>
                  <td className={styles.comparisonCell} style={{ textAlign: 'center' }}><span className={styles.comparisonCheck}>✓</span></td>
                  <td className={styles.comparisonCell} style={{ textAlign: 'center' }}><span className={styles.comparisonCheck}>✓</span></td>
                </tr>
                <tr className={styles.comparisonRow}>
                  <td className={`${styles.comparisonCell} ${styles.comparisonFeature}`}>Customize timestamps</td>
                  <td className={styles.comparisonCell} style={{ textAlign: 'center' }}><span className={styles.comparisonX}>✕</span></td>
                  <td className={styles.comparisonCell} style={{ textAlign: 'center' }}><span className={styles.comparisonCheck}>✓</span></td>
                  <td className={styles.comparisonCell} style={{ textAlign: 'center' }}><span className={styles.comparisonCheck}>✓</span></td>
                </tr>
                <tr className={styles.comparisonRow}>
                  <td className={`${styles.comparisonCell} ${styles.comparisonFeature}`}>Modify suggestion action alignment</td>
                  <td className={styles.comparisonCell} style={{ textAlign: 'center' }}><span className={styles.comparisonX}>✕</span></td>
                  <td className={styles.comparisonCell} style={{ textAlign: 'center' }}><span className={styles.comparisonCheck}>✓</span></td>
                  <td className={styles.comparisonCell} style={{ textAlign: 'center' }}><span className={styles.comparisonCheck}>✓</span></td>
                </tr>
                <tr className={styles.comparisonRow}>
                  <td className={`${styles.comparisonCell} ${styles.comparisonFeature}`}>Style the typing indicator</td>
                  <td className={styles.comparisonCell} style={{ textAlign: 'center' }}><span className={styles.comparisonX}>✕</span></td>
                  <td className={styles.comparisonCell} style={{ textAlign: 'center' }}><span className={styles.comparisonCheck}>✓</span></td>
                  <td className={styles.comparisonCell} style={{ textAlign: 'center' }}><span className={styles.comparisonCheck}>✓</span></td>
                </tr>
                <tr className={styles.comparisonRow}>
                  <td className={`${styles.comparisonCell} ${styles.comparisonFeature}`}>Add custom border styles to bubbles</td>
                  <td className={styles.comparisonCell} style={{ textAlign: 'center' }}><span className={styles.comparisonX}>✕</span></td>
                  <td className={styles.comparisonCell} style={{ textAlign: 'center' }}><span className={styles.comparisonCheck}>✓</span></td>
                  <td className={styles.comparisonCell} style={{ textAlign: 'center' }}><span className={styles.comparisonCheck}>✓</span></td>
                </tr>
                <tr className={styles.comparisonRow}>
                  <td className={`${styles.comparisonCell} ${styles.comparisonFeature}`}>Modify scrollbar appearance</td>
                  <td className={styles.comparisonCell} style={{ textAlign: 'center' }}><span className={styles.comparisonX}>✕</span></td>
                  <td className={styles.comparisonCell} style={{ textAlign: 'center' }}><span className={styles.comparisonCheck}>✓</span></td>
                  <td className={styles.comparisonCell} style={{ textAlign: 'center' }}><span className={styles.comparisonCheck}>✓</span></td>
                </tr>
                <tr className={styles.comparisonRow}>
                  <td className={`${styles.comparisonCell} ${styles.comparisonFeature}`}>Microsoft Teams/Copilot look</td>
                  <td className={styles.comparisonCell} style={{ textAlign: 'center' }}><span className={styles.comparisonX}>✕</span></td>
                  <td className={styles.comparisonCell} style={{ textAlign: 'center' }}><span className={styles.comparisonX}>✕</span></td>
                  <td className={styles.comparisonCell} style={{ textAlign: 'center' }}><span className={styles.comparisonCheck}>✓</span></td>
                </tr>
                <tr className={styles.comparisonRow}>
                  <td className={`${styles.comparisonCell} ${styles.comparisonFeature}`}>Code syntax highlighting</td>
                  <td className={styles.comparisonCell} style={{ textAlign: 'center' }}><span className={styles.comparisonX}>✕</span></td>
                  <td className={styles.comparisonCell} style={{ textAlign: 'center' }}><span className={styles.comparisonX}>✕</span></td>
                  <td className={styles.comparisonCell} style={{ textAlign: 'center' }}><span className={styles.comparisonCheck}>✓</span></td>
                </tr>
                <tr className={styles.comparisonRow}>
                  <td className={`${styles.comparisonCell} ${styles.comparisonFeature}`}>Starter prompts / suggestions</td>
                  <td className={styles.comparisonCell} style={{ textAlign: 'center' }}><span className={styles.comparisonX}>✕</span></td>
                  <td className={styles.comparisonCell} style={{ textAlign: 'center' }}><span className={styles.comparisonX}>✕</span></td>
                  <td className={styles.comparisonCell} style={{ textAlign: 'center' }}><span className={styles.comparisonCheck}>✓</span></td>
                </tr>
                <tr className={styles.comparisonRow}>
                  <td className={`${styles.comparisonCell} ${styles.comparisonFeature}`}>Shadow DOM isolation</td>
                  <td className={styles.comparisonCell} style={{ textAlign: 'center' }}><span className={styles.comparisonX}>✕</span></td>
                  <td className={styles.comparisonCell} style={{ textAlign: 'center' }}><span className={styles.comparisonX}>✕</span></td>
                  <td className={styles.comparisonCell} style={{ textAlign: 'center' }}><span className={styles.comparisonCheck}>✓</span></td>
                </tr>
              </tbody>
            </table>

            {/* Pro Tip */}
            <div className={styles.proTipBox}>
              <span className={styles.proTipIcon}>💡</span>
              <div>
                <div className={styles.proTipTitle}>Pro Tip:</div>
                <div className={styles.proTipText}>
                  Start with <code>styleOptions</code> for quick customizations. If you need more control 
                  (timestamps, typing indicator, scrollbar), use <code>styleSet</code>. For a premium 
                  Microsoft Teams/Copilot experience with built-in features, choose <code>Fluent Theme</code>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render content based on auth/connection state
  const renderContent = () => {
    // Overview tab - always show
    if (selectedTab === 'overview') {
      return renderOverview();
    }

    // Architecture tab - always show
    if (selectedTab === 'architecture') {
      return renderArchitecture();
    }

    // Branding tab - always show
    if (selectedTab === 'branding') {
      return renderBranding();
    }

    // Not configured
    if (!isConfigured) {
      return (
        <div className={styles.centeredContainer}>
          <div className={styles.configWarning}>
            <Text weight="semibold" size={500}>⚠️ Configuration Required</Text>
            <Text block style={{ marginTop: '12px' }}>
              Add the following to your <code>.env</code> file:
            </Text>
            <CodeBlockWithModal code={configCode} title="Environment Configuration" language="env">
              <div className={styles.codeBlock}>{configCode}</div>
            </CodeBlockWithModal>
            <Text block style={{ marginTop: '12px', fontSize: '13px' }}>
              Your Azure AD app needs the <code>CopilotStudio.Copilots.Invoke</code> permission.
            </Text>
          </div>
        </div>
      );
    }

    // Checking auth
    if (authStatus === 'checking') {
      return (
        <div className={styles.centeredContainer}>
          <Spinner size="large" label="Checking authentication..." />
        </div>
      );
    }

    // Signed out
    if (authStatus === 'signed-out') {
      return (
        <div className={styles.centeredContainer}>
          <Person24Regular style={{ fontSize: '64px', color: '#0078d4' }} />
          <Text weight="semibold" size={500}>Sign In Required</Text>
          <Text>
            Sign in with your Microsoft account to access the demos.
            <br />
            Authentication is required once for all demos.
          </Text>
          <Button appearance="primary" icon={<Person24Regular />} onClick={handleSignIn} size="large">
            Sign in with Microsoft
          </Button>
        </div>
      );
    }

    // Signing in
    if (authStatus === 'signing-in') {
      return (
        <div className={styles.centeredContainer}>
          <Spinner size="large" label="Signing in..." />
        </div>
      );
    }

    // Auth error
    if (authStatus === 'error') {
      return (
        <div className={styles.centeredContainer}>
          <Text weight="semibold" style={{ color: '#d32f2f' }}>Authentication Error</Text>
          <Text>{authError}</Text>
          <Button appearance="primary" onClick={handleSignIn}>Try Again</Button>
        </div>
      );
    }

    // Connection error
    if (connectionError) {
      return (
        <div className={styles.centeredContainer}>
          <Text weight="semibold" style={{ color: '#d32f2f' }}>Connection Error</Text>
          <Text>{connectionError}</Text>
        </div>
      );
    }

    // Connecting
    if (!connection) {
      return (
        <div className={styles.centeredContainer}>
          <Spinner size="large" label="Creating connection..." />
        </div>
      );
    }

    // Render selected demo - use key to force fresh mount when switching tabs
    // This prevents WebChat state corruption from reusing connection across unmount/remount cycles
    switch (selectedTab) {
      case 'cdn':
        return <AgentSDKCdnDemo key="cdn" connection={connection} />;
      case 'simple':
        return <AgentSDKSimpleReactDemo key="simple" connection={connection} />;
      case 'flexible':
        return <AgentSDKFlexibleReactDemo key="flexible" connection={connection} />;
      case 'middleware':
        return <AgentSDKMiddlewareDemo key="middleware" connection={connection} />;
      case 'minimizable':
        return <AgentSDKMinimizableDemo key="minimizable" connection={connection} />;
      case 'styleoptions':
        return <AgentSDKStyleOptionsDemo key="styleoptions" connection={connection} />;
      case 'styleset':
        return <AgentSDKStyleSetDemo key="styleset" connection={connection} />;
      case 'fluenttheme':
        return <AgentSDKFluentThemeDemo key="fluenttheme" connection={connection} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.page}>
      {/* Demo Navigation Header */}
      <DemoHeader title="M365 Agents SDK Demos" />

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Title1 className={styles.headerTitle}>
              M365 Agents SDK Demos
              <Badge appearance="filled" color="informative" className={styles.badge}>
                Authenticated
              </Badge>
            </Title1>
            <Body1 className={styles.headerSubtitle}>
              WebChat integration patterns and branding customizations with Azure AD authentication
            </Body1>
          </div>
          {userInfo && (
            <div className={styles.headerRight}>
              <div className={styles.userInfo}>
                <Avatar name={userInfo.name} size={32} />
                <Text className={styles.userName}>{userInfo.name}</Text>
              </div>
              <Button
                appearance="subtle"
                icon={<SignOut24Regular />}
                className={styles.signOutButton}
                onClick={handleSignOut}
              >
                Sign out
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={styles.container}>
        <Card className={styles.tabsCard}>
          <TabList
            className={styles.tabList}
            selectedValue={selectedTab}
            onTabSelect={(_, data) => setSelectedTab(data.value as TabValue)}
          >
            <Tab icon={<Home24Regular />} value="overview">
              Overview
            </Tab>
            <Tab icon={<Organization24Regular />} value="architecture">
              Architecture
            </Tab>
            <Tab icon={<Globe24Regular />} value="cdn">
              CDN
            </Tab>
            <Tab icon={<Code24Regular />} value="simple">
              Simple React
            </Tab>
            <Tab icon={<Settings24Regular />} value="flexible">
              Flexible React
            </Tab>
            <Tab icon={<WindowDevTools24Regular />} value="middleware">
              Middleware
            </Tab>
            <Tab icon={<Chat24Regular />} value="minimizable">
              Widget
            </Tab>
            <Tab icon={<PaintBrush24Regular />} value="branding">
              Branding
            </Tab>
            <Tab icon={<Color24Regular />} value="styleoptions">
              StyleOptions
            </Tab>
            <Tab icon={<PaintBrush24Regular />} value="styleset">
              StyleSet
            </Tab>
            <Tab icon={<DesignIdeas24Regular />} value="fluenttheme">
              Fluent Theme
            </Tab>
          </TabList>

          <div className={styles.tabContent}>
            {renderContent()}
          </div>
        </Card>
      </div>
    </div>
  );
}
