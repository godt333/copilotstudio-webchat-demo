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
  DataArea24Regular,
  BranchFork24Regular,
  Organization24Regular,
} from '@fluentui/react-icons';

// Import demo components
import AgentSDKCdnDemo from '../demos/AgentSDK-cdn-renderwebchat/AgentSDKCdnDemo';
import AgentSDKSimpleReactDemo from '../demos/AgentSDK-simple-react/AgentSDKSimpleReactDemo';
import AgentSDKFlexibleReactDemo from '../demos/AgentSDK-flexible-react/AgentSDKFlexibleReactDemo';
import AgentSDKMiddlewareDemo from '../demos/AgentSDK-middleware/AgentSDKMiddlewareDemo';
import IntegrationComparisonTable from '../components/common/IntegrationComparisonTable';
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
  // Component Architecture Diagram Styles
  componentDiagramContainer: {
    marginTop: tokens.spacingVerticalXL,
  },
  componentDiagramTitle: {
    fontWeight: '600',
    fontSize: '18px',
    color: '#1e293b',
    marginBottom: tokens.spacingVerticalM,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  componentDiagramCard: {
    backgroundColor: 'white',
    ...shorthands.border('1px', 'solid', '#e2e8f0'),
    borderRadius: '12px',
    ...shorthands.padding('24px'),
    fontFamily: 'monospace',
    fontSize: '13px',
    lineHeight: '1.6',
    overflowX: 'auto',
  },
  diagramBox: {
    ...shorthands.border('2px', 'solid', '#e2e8f0'),
    borderRadius: '8px',
    ...shorthands.padding('12px', '16px'),
    marginBottom: '8px',
    backgroundColor: '#f8fafc',
  },
  diagramBoxBlue: {
    ...shorthands.border('2px', 'solid', '#3b82f6'),
    backgroundColor: '#eff6ff',
  },
  diagramBoxGreen: {
    ...shorthands.border('2px', 'solid', '#22c55e'),
    backgroundColor: '#f0fdf4',
  },
  diagramBoxPurple: {
    ...shorthands.border('2px', 'solid', '#8b5cf6'),
    backgroundColor: '#f5f3ff',
  },
  diagramBoxOrange: {
    ...shorthands.border('2px', 'solid', '#f59e0b'),
    backgroundColor: '#fffbeb',
  },
  diagramLabel: {
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '4px',
  },
  diagramSublabel: {
    fontSize: '11px',
    color: '#64748b',
  },
  diagramArrow: {
    textAlign: 'center' as const,
    color: '#64748b',
    fontSize: '14px',
    ...shorthands.padding('4px', '0'),
  },
  diagramLegend: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '16px',
    marginTop: tokens.spacingVerticalM,
    ...shorthands.padding('12px', '16px'),
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
  },
  diagramLegendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
  },
  diagramLegendDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  },
});

// ============================================================================
// TYPES
// ============================================================================

type AuthStatus = 'checking' | 'signed-out' | 'signing-in' | 'signed-in' | 'error';
type TabValue = 'overview' | 'architecture' | 'auth' | 'cdn' | 'simple' | 'flexible' | 'middleware' | 'comparison' | 'decision-flow';

// Code example for config warning
const configCode = `VITE_COPILOT_DIRECT_CONNECT_URL=https://...
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_TENANT_ID=your-tenant-id`;

interface UserInfo {
  name: string;
  email: string;
}

// Demo tab types that require connections
type DemoTabWithConnection = 'cdn' | 'simple' | 'flexible' | 'middleware';

interface DemoOption {
  id: DemoTabWithConnection;
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

  // Connection state - keyed by tab to create separate connections
  const [connections, setConnections] = useState<Record<Exclude<TabValue, 'overview' | 'architecture' | 'auth' | 'comparison' | 'decision-flow'>, CopilotStudioWebChatConnection | null>>({
    cdn: null,
    simple: null,
    flexible: null,
    middleware: null,
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

  // Create connection for the selected tab when signed in (skip for overview, architecture, auth, comparison, decision-flow)
  useEffect(() => {
    const demoTabs: Array<'cdn' | 'simple' | 'flexible' | 'middleware'> = ['cdn', 'simple', 'flexible', 'middleware'];
    if (authStatus !== 'signed-in') return;
    if (!demoTabs.includes(selectedTab as typeof demoTabs[number])) return;
    const tabKey = selectedTab as 'cdn' | 'simple' | 'flexible' | 'middleware';
    if (connections[tabKey] || isCreatingConnection) return;

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
  const demoTabsForConnection: Array<'cdn' | 'simple' | 'flexible' | 'middleware'> = ['cdn', 'simple', 'flexible', 'middleware'];
  const connection = demoTabsForConnection.includes(selectedTab as typeof demoTabsForConnection[number]) 
    ? connections[selectedTab as 'cdn' | 'simple' | 'flexible' | 'middleware'] 
    : null;

  // Handle card click to navigate to demo
  const handleCardClick = (tabId: 'cdn' | 'simple' | 'flexible' | 'middleware') => {
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

        {/* Link to Branding Demos */}
        <Card 
          style={{ 
            marginTop: '32px', 
            background: 'linear-gradient(135deg, #fce7f3 0%, #f3e8ff 100%)',
            borderColor: '#e91e63',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '8px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px', 
              backgroundColor: '#e91e63',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}>
              🎨
            </div>
            <div style={{ flex: 1 }}>
              <Text weight="semibold" size={400}>Looking for Branding & Styling?</Text>
              <Text block style={{ color: '#666', marginTop: '4px' }}>
                Explore StyleOptions, StyleSet, and Fluent Theme customizations on our dedicated Branding Demos page.
              </Text>
            </div>
            <Button 
              appearance="primary" 
              style={{ backgroundColor: '#e91e63' }}
              onClick={() => window.location.href = '/branding-demos'}
            >
              View Branding Demos
            </Button>
          </div>
        </Card>
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

              {/* Row 3: CopilotStudioClient -> Power Platform API -> Copilot Studio */}
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
                <div className={styles.oauthFlowArrow}>
                  <span className={styles.oauthFlowLabel}>4. Route</span>
                  <span>→</span>
                </div>
                <div className={`${styles.oauthFlowBox} ${styles.oauthFlowBoxPurple}`}>
                  <div className={styles.oauthFlowBoxIcon}>🤖</div>
                  <div className={styles.oauthFlowBoxTitle}>Copilot Studio</div>
                  <div className={styles.oauthFlowBoxSub}>User-Aware Agent</div>
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

          {/* Component Architecture Diagram */}
          <div className={styles.componentDiagramContainer}>
            <div className={styles.architectureCardTitle}>
              🏗️ Component Architecture
            </div>
            <div className={styles.architectureCard}>
              {/* Your App Container */}
              <div style={{
                border: '2px solid #e2e8f0',
                borderRadius: '16px',
                padding: '24px',
                backgroundColor: '#f8fafc',
                marginBottom: '16px',
              }}>
                <div style={{
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#475569',
                  marginBottom: '20px',
                  padding: '8px 16px',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '8px',
                  display: 'inline-block',
                  width: '100%',
                }}>
                  🖥️ YOUR APP
                </div>

                {/* Component Flow */}
                <div className={styles.oauthFlowContainer} style={{ padding: '16px 0' }}>
                  {/* Row 1: ReactWebChat */}
                  <div className={styles.oauthFlowRow}>
                    <div className={`${styles.oauthFlowBox} ${styles.oauthFlowBoxBlue}`} style={{ minWidth: '220px' }}>
                      <div className={styles.oauthFlowBoxIcon}>💬</div>
                      <div className={styles.oauthFlowBoxTitle}>ReactWebChat</div>
                      <div className={styles.oauthFlowBoxSub}>botframework-webchat</div>
                    </div>
                    <div style={{ 
                      backgroundColor: '#dbeafe', 
                      padding: '12px 16px', 
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#1e40af',
                      maxWidth: '200px',
                      textAlign: 'left',
                    }}>
                      <strong>🎨 UI Control</strong>
                      <div style={{ marginTop: '4px', fontSize: '11px', opacity: 0.8 }}>
                        Message bubbles, Send box, Typing indicators, Adaptive Cards
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className={styles.oauthFlowArrow} style={{ flexDirection: 'column' }}>
                    <span className={styles.oauthFlowLabel}>directLine={'{'}connection{'}'}</span>
                    <span style={{ fontSize: '20px' }}>↓</span>
                  </div>

                  {/* Row 2: CopilotStudioWebChat */}
                  <div className={styles.oauthFlowRow}>
                    <div className={`${styles.oauthFlowBox}`} style={{ 
                      minWidth: '220px',
                      backgroundColor: '#f59e0b',
                      color: 'white',
                    }}>
                      <div className={styles.oauthFlowBoxIcon}>🔌</div>
                      <div className={styles.oauthFlowBoxTitle}>CopilotStudioWebChat</div>
                      <div className={styles.oauthFlowBoxSub}>.createConnection()</div>
                    </div>
                    <div style={{ 
                      backgroundColor: '#fef3c7', 
                      padding: '12px 16px', 
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#92400e',
                      maxWidth: '200px',
                      textAlign: 'left',
                    }}>
                      <strong>🌉 Adapter / Bridge</strong>
                      <div style={{ marginTop: '4px', fontSize: '11px', opacity: 0.8 }}>
                        Creates DirectLine interface that WebChat expects
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className={styles.oauthFlowArrow} style={{ flexDirection: 'column' }}>
                    <span style={{ fontSize: '20px' }}>↓</span>
                  </div>

                  {/* Row 3: CopilotStudioClient */}
                  <div className={styles.oauthFlowRow}>
                    <div className={`${styles.oauthFlowBox} ${styles.oauthFlowBoxGreen}`} style={{ minWidth: '220px' }}>
                      <div className={styles.oauthFlowBoxIcon}>🔧</div>
                      <div className={styles.oauthFlowBoxTitle}>CopilotStudioClient</div>
                      <div className={styles.oauthFlowBoxSub}>SDK Instance</div>
                    </div>
                    <div style={{ 
                      backgroundColor: '#dcfce7', 
                      padding: '12px 16px', 
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#166534',
                      maxWidth: '200px',
                      textAlign: 'left',
                    }}>
                      <strong>🔧 Connection Engine</strong>
                      <div style={{ marginTop: '4px', fontSize: '11px', opacity: 0.8 }}>
                        Holds auth token, Manages conversation, Sends/receives activities
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* HTTPS Arrow */}
              <div style={{ 
                textAlign: 'center', 
                padding: '12px 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
              }}>
                <span style={{
                  backgroundColor: '#f3f4f6',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  color: '#6b7280',
                }}>
                  HTTPS (Direct Engine Protocol)
                </span>
                <span style={{ fontSize: '24px', color: '#9ca3af' }}>↓</span>
              </div>

              {/* Copilot Studio */}
              <div className={styles.oauthFlowRow} style={{ justifyContent: 'center' }}>
                <div className={`${styles.oauthFlowBox} ${styles.oauthFlowBoxPurple}`} style={{ minWidth: '280px' }}>
                  <div className={styles.oauthFlowBoxIcon}>🤖</div>
                  <div className={styles.oauthFlowBoxTitle}>COPILOT STUDIO</div>
                  <div className={styles.oauthFlowBoxSub}>Your Agent</div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className={styles.diagramLegend}>
              <div className={styles.diagramLegendItem}>
                <div className={styles.diagramLegendDot} style={{ backgroundColor: '#0078d4' }} />
                <span><strong>ReactWebChat</strong> - UI Control (botframework-webchat)</span>
              </div>
              <div className={styles.diagramLegendItem}>
                <div className={styles.diagramLegendDot} style={{ backgroundColor: '#f59e0b' }} />
                <span><strong>CopilotStudioWebChat</strong> - Adapter / Bridge</span>
              </div>
              <div className={styles.diagramLegendItem}>
                <div className={styles.diagramLegendDot} style={{ backgroundColor: '#22c55e' }} />
                <span><strong>CopilotStudioClient</strong> - Connection Engine</span>
              </div>
              <div className={styles.diagramLegendItem}>
                <div className={styles.diagramLegendDot} style={{ backgroundColor: '#8b5cf6' }} />
                <span><strong>Copilot Studio</strong> - Your Agent</span>
              </div>
            </div>

            {/* Code Example */}
            <div style={{ marginTop: '16px' }}>
              <CodeBlockWithModal
                language="typescript"
                title="Component Integration"
                code={`// 1. Import required modules
import { CopilotStudioClient, CopilotStudioWebChat } from '@microsoft/agents-copilotstudio-client';
import ReactWebChat from 'botframework-webchat';

// 2. Create the client (handles auth + communication)
const client = new CopilotStudioClient(
  { directConnectUrl: 'https://...' },  // ConnectionSettings
  token.accessToken                      // JWT from MSAL
);

// 3. Create DirectLine-compatible connection (the adapter)
const directLine = CopilotStudioWebChat.createConnection(client, {
  showTyping: true  // Shows typing indicator
});

// 4. Pass to WebChat (expects DirectLine interface)
<ReactWebChat directLine={directLine} />`}
              >
                <div className={styles.codeBlock}>{`// M365 Agents SDK Integration
const client = new CopilotStudioClient(settings, token);
const directLine = CopilotStudioWebChat.createConnection(client);`}</div>
              </CodeBlockWithModal>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render authentication code example
  const renderAuthentication = () => {
    const msalSetupCode = `// msalConfig.ts - MSAL Configuration
import { Configuration, LogLevel } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    authority: \`https://login.microsoftonline.com/\${import.meta.env.VITE_AZURE_TENANT_ID}\`,
    redirectUri: window.location.origin,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Warning,
    },
  },
};

// Scopes required for Copilot Studio
export const loginRequest = {
  scopes: [
    'https://api.powerplatform.com/CopilotStudio.Copilots.Invoke',
  ],
};`;

    const msalInstanceCode = `// Create MSAL instance (do this once at app startup)
import { PublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser';
import { msalConfig, loginRequest } from './msalConfig';

const msalInstance = new PublicClientApplication(msalConfig);
await msalInstance.initialize();

// Check for existing sessions
const accounts = msalInstance.getAllAccounts();
if (accounts.length > 0) {
  msalInstance.setActiveAccount(accounts[0]);
}`;

    const signInCode = `// Sign in the user (interactive popup)
async function signIn() {
  try {
    const response = await msalInstance.loginPopup(loginRequest);
    msalInstance.setActiveAccount(response.account);
    return response.account;
  } catch (error) {
    console.error('Sign in failed:', error);
    throw error;
  }
}`;

    const acquireTokenCode = `// Acquire access token for Copilot Studio API
async function getAccessToken(): Promise<string> {
  const account = msalInstance.getActiveAccount();
  if (!account) {
    throw new Error('No active account - user must sign in first');
  }

  try {
    // Try silent token acquisition first (from cache)
    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account,
    });
    return response.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      // Cache miss or token expired - need interactive auth
      const response = await msalInstance.acquireTokenPopup(loginRequest);
      return response.accessToken;
    }
    throw error;
  }
}`;

    const fullIntegrationCode = `// Complete integration with CopilotStudioClient
import { CopilotStudioClient, CopilotStudioWebChat } from '@microsoft/agents-copilotstudio-client';
import ReactWebChat from 'botframework-webchat';

async function createChatConnection() {
  // 1. Get the access token from MSAL
  const accessToken = await getAccessToken();
  
  // 2. Create the Copilot Studio client with the token
  const client = new CopilotStudioClient(
    {
      directConnectUrl: import.meta.env.VITE_COPILOT_DIRECT_CONNECT_URL,
      appClientId: import.meta.env.VITE_AZURE_CLIENT_ID,
      tenantId: import.meta.env.VITE_AZURE_TENANT_ID,
    },
    accessToken  // Pass the JWT token here
  );

  // 3. Create DirectLine-compatible connection
  const directLine = CopilotStudioWebChat.createConnection(client, {
    showTyping: true,
  });

  return directLine;
}

// 4. Use in React component
function ChatComponent() {
  const [directLine, setDirectLine] = useState(null);

  useEffect(() => {
    createChatConnection().then(setDirectLine);
  }, []);

  if (!directLine) return <Spinner />;

  return <ReactWebChat directLine={directLine} />;
}`;

    const envConfigCode = `# .env - Environment Variables
VITE_AZURE_CLIENT_ID=your-azure-app-client-id
VITE_AZURE_TENANT_ID=your-azure-tenant-id
VITE_COPILOT_DIRECT_CONNECT_URL=https://your-environment.api.powerplatform.com/copilotstudio/...`;

    return (
      <div>
        {/* MSAL Authentication Section */}
        <div className={styles.architectureSection}>
          <div className={styles.architectureSectionHeader}>
            <div className={styles.architectureSectionIcon} style={{ backgroundColor: '#dbeafe' }}>
              🔐
            </div>
            <div>
              <span className={styles.architectureSectionTitle}>MSAL Authentication Code</span>
              <Badge 
                appearance="filled" 
                style={{ marginLeft: '12px', backgroundColor: '#3b82f6', color: 'white' }}
              >
                REQUIRED FOR M365 AGENTS SDK
              </Badge>
            </div>
          </div>
          <Text className={styles.architectureDescription}>
            The M365 Agents SDK requires Azure AD authentication. Use MSAL (Microsoft Authentication Library)
            to acquire JWT tokens with the <code>CopilotStudio.Copilots.Invoke</code> scope.
          </Text>
        </div>

        {/* Step-by-step code examples */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
          
          {/* Environment Variables */}
          <div className={styles.architectureCard}>
            <div className={styles.architectureCardTitle}>
              📋 Step 1: Environment Configuration
            </div>
            <Text style={{ marginBottom: '16px', color: '#6b7280' }}>
              Configure your Azure AD app registration details in environment variables.
            </Text>
            <CodeBlockWithModal
              language="env"
              title="Environment Variables"
              code={envConfigCode}
            >
              <div className={styles.codeBlock}>{envConfigCode}</div>
            </CodeBlockWithModal>
          </div>

          {/* MSAL Config */}
          <div className={styles.architectureCard}>
            <div className={styles.architectureCardTitle}>
              ⚙️ Step 2: MSAL Configuration
            </div>
            <Text style={{ marginBottom: '16px', color: '#6b7280' }}>
              Create an MSAL configuration file with your Azure AD settings and required scopes.
            </Text>
            <CodeBlockWithModal
              language="typescript"
              title="MSAL Configuration"
              code={msalSetupCode}
            >
              <div className={styles.codeBlock}>{msalSetupCode}</div>
            </CodeBlockWithModal>
          </div>

          {/* MSAL Instance */}
          <div className={styles.architectureCard}>
            <div className={styles.architectureCardTitle}>
              🏗️ Step 3: Initialize MSAL Instance
            </div>
            <Text style={{ marginBottom: '16px', color: '#6b7280' }}>
              Create and initialize the MSAL PublicClientApplication once at app startup.
            </Text>
            <CodeBlockWithModal
              language="typescript"
              title="Initialize MSAL"
              code={msalInstanceCode}
            >
              <div className={styles.codeBlock}>{msalInstanceCode}</div>
            </CodeBlockWithModal>
          </div>

          {/* Sign In */}
          <div className={styles.architectureCard}>
            <div className={styles.architectureCardTitle}>
              👤 Step 4: Sign In User
            </div>
            <Text style={{ marginBottom: '16px', color: '#6b7280' }}>
              Trigger interactive sign-in when the user clicks a "Sign In" button.
            </Text>
            <CodeBlockWithModal
              language="typescript"
              title="Sign In Function"
              code={signInCode}
            >
              <div className={styles.codeBlock}>{signInCode}</div>
            </CodeBlockWithModal>
          </div>

          {/* Acquire Token */}
          <div className={styles.architectureCard}>
            <div className={styles.architectureCardTitle}>
              🎫 Step 5: Acquire Access Token
            </div>
            <Text style={{ marginBottom: '16px', color: '#6b7280' }}>
              Get an access token for the Copilot Studio API. Uses silent acquisition first, falls back to popup if needed.
            </Text>
            <CodeBlockWithModal
              language="typescript"
              title="Token Acquisition"
              code={acquireTokenCode}
            >
              <div className={styles.codeBlock}>{acquireTokenCode}</div>
            </CodeBlockWithModal>
          </div>

          {/* Full Integration */}
          <div className={styles.architectureCard}>
            <div className={styles.architectureCardTitle}>
              🔗 Step 6: Complete Integration
            </div>
            <Text style={{ marginBottom: '16px', color: '#6b7280' }}>
              Put it all together: acquire token, create CopilotStudioClient, and connect to WebChat.
            </Text>
            <CodeBlockWithModal
              language="typescript"
              title="Full Integration Example"
              code={fullIntegrationCode}
            >
              <div className={styles.codeBlock}>{fullIntegrationCode}</div>
            </CodeBlockWithModal>
          </div>

          {/* Key Points */}
          <div className={styles.architectureCard} style={{ backgroundColor: '#f0fdf4', borderColor: '#22c55e' }}>
            <div className={styles.architectureCardTitle}>
              ✅ Key Points
            </div>
            <ul style={{ margin: '12px 0', paddingLeft: '20px', lineHeight: '1.8' }}>
              <li><strong>Token is passed to CopilotStudioClient</strong> - The client holds the token, it doesn't fetch it</li>
              <li><strong>acquireTokenSilent first</strong> - Always try silent acquisition before interactive</li>
              <li><strong>Handle InteractionRequiredAuthError</strong> - Fall back to popup when silent fails</li>
              <li><strong>Scope is critical</strong> - Must request <code>CopilotStudio.Copilots.Invoke</code></li>
              <li><strong>Initialize once</strong> - Create MSAL instance at app startup, not per-component</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // Render Decision Flow content
  const renderDecisionFlow = () => {
    return (
      <div>
        {/* Decision Flow Header */}
        <div className={styles.architectureSection}>
          <div className={styles.architectureSectionHeader}>
            <div className={styles.architectureSectionIcon} style={{ backgroundColor: '#dbeafe' }}>
              🤔
            </div>
            <div>
              <span className={styles.architectureSectionTitle}>WebChat Control Decision Flow</span>
              <Badge 
                appearance="filled" 
                style={{ marginLeft: '12px', backgroundColor: '#3b82f6', color: 'white' }}
              >
                CHOOSE THE RIGHT CONTROL
              </Badge>
            </div>
          </div>
          <Text className={styles.architectureDescription}>
            Use this decision tree to choose the right WebChat control for your scenario.
            Follow the questions from top to bottom to find the recommended approach.
          </Text>
        </div>

        {/* Decision Flow Diagram - High Fidelity HTML */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          borderRadius: '20px',
          padding: '40px',
          marginTop: '24px',
          position: 'relative',
        }}>
          {/* Start Question */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            {/* Question 1: Do you use React? */}
            <div style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '30px',
              fontSize: '18px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              🤔 Do you use React?
            </div>

            {/* Horizontal connector line from question */}
            <svg width="600" height="60" style={{ overflow: 'visible' }}>
              {/* Center vertical line down */}
              <line x1="300" y1="0" x2="300" y2="20" stroke="#6b7280" strokeWidth="2" />
              {/* Horizontal line */}
              <line x1="100" y1="20" x2="500" y2="20" stroke="#6b7280" strokeWidth="2" />
              {/* Left vertical line down */}
              <line x1="100" y1="20" x2="100" y2="50" stroke="#6b7280" strokeWidth="2" />
              {/* Right vertical line down */}
              <line x1="500" y1="20" x2="500" y2="50" stroke="#6b7280" strokeWidth="2" />
            </svg>

            {/* Branches */}
            <div style={{ display: 'flex', gap: '200px', alignItems: 'flex-start', marginTop: '-30px' }}>
              {/* NO Branch - CDN */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  padding: '8px 24px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                }}>
                  NO
                </div>
                <div style={{ width: '2px', height: '30px', backgroundColor: '#6b7280' }} />
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  width: '220px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  border: '3px solid #3b82f6',
                }}>
                  <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '8px' }}>
                    CDN + renderWebChat
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '13px', marginBottom: '12px' }}>
                    Vanilla JavaScript
                  </div>
                  <div style={{ fontSize: '12px', color: '#374151', marginBottom: '12px' }}>
                    CMS, WordPress, quick prototypes, SharePoint
                  </div>
                  <div style={{
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    ✓ Middleware supported
                  </div>
                </div>
              </div>

              {/* YES Branch */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  backgroundColor: '#22c55e',
                  color: 'white',
                  padding: '8px 24px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                }}>
                  YES
                </div>
                <div style={{ width: '2px', height: '30px', backgroundColor: '#6b7280' }} />
                
                {/* Question 2: Need custom components with hooks? */}
                <div style={{
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '24px',
                  fontSize: '15px',
                  fontWeight: '600',
                  textAlign: 'center',
                }}>
                  Need custom components<br/>with WebChat hooks?
                </div>

                {/* Horizontal connector for sub-branches */}
                <svg width="400" height="50" style={{ overflow: 'visible' }}>
                  {/* Center vertical line down */}
                  <line x1="200" y1="0" x2="200" y2="15" stroke="#6b7280" strokeWidth="2" />
                  {/* Horizontal line */}
                  <line x1="70" y1="15" x2="330" y2="15" stroke="#6b7280" strokeWidth="2" />
                  {/* Left vertical line down */}
                  <line x1="70" y1="15" x2="70" y2="40" stroke="#6b7280" strokeWidth="2" />
                  {/* Right vertical line down */}
                  <line x1="330" y1="15" x2="330" y2="40" stroke="#6b7280" strokeWidth="2" />
                </svg>

                {/* Sub-branches */}
                <div style={{ display: 'flex', gap: '60px', alignItems: 'flex-start', marginTop: '-20px' }}>
                  {/* NO - ReactWebChat or FluentThemeProvider + ReactWebChat */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      padding: '6px 16px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}>
                      NO
                    </div>
                    <div style={{ width: '2px', height: '20px', backgroundColor: '#6b7280' }} />
                    <div style={{
                      backgroundColor: '#3b82f6',
                      borderRadius: '16px',
                      padding: '18px',
                      width: '180px',
                      color: 'white',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '6px' }}>
                        ReactWebChat
                      </div>
                      <div style={{ fontSize: '11px', opacity: 0.9, marginBottom: '8px' }}>
                        Simple React
                      </div>
                      <div style={{ fontSize: '10px', opacity: 0.8, marginBottom: '8px' }}>
                        Quick setup, works with FluentThemeProvider
                      </div>
                      <div style={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '9px',
                        marginBottom: '6px',
                      }}>
                        ✓ FluentTheme supported
                      </div>
                      <div style={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '9px',
                      }}>
                        ✓ Middleware supported
                      </div>
                    </div>
                  </div>

                  {/* YES - Composer + BasicWebChat */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      backgroundColor: '#22c55e',
                      color: 'white',
                      padding: '6px 16px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}>
                      YES
                    </div>
                    <div style={{ width: '2px', height: '20px', backgroundColor: '#6b7280' }} />
                    <div style={{
                      backgroundColor: '#ef4444',
                      borderRadius: '16px',
                      padding: '18px',
                      width: '180px',
                      color: 'white',
                      textAlign: 'center',
                      border: '3px solid #fbbf24',
                      position: 'relative',
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '-12px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#fbbf24',
                        color: '#000',
                        padding: '2px 10px',
                        borderRadius: '10px',
                        fontSize: '10px',
                        fontWeight: '700',
                      }}>
                        ⭐ RECOMMENDED
                      </div>
                      <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '6px', marginTop: '8px' }}>
                        Composer + BasicWebChat
                      </div>
                      <div style={{ fontSize: '11px', opacity: 0.9, marginBottom: '8px' }}>
                        Flexible React
                      </div>
                      <div style={{ fontSize: '10px', opacity: 0.8, marginBottom: '8px' }}>
                        Custom status bars, starter prompts, hooks access
                      </div>
                      <div style={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '9px',
                        marginBottom: '6px',
                      }}>
                        ✓ FluentTheme supported
                      </div>
                      <div style={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '9px',
                      }}>
                        ✓ Middleware supported
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div style={{
            marginTop: '30px',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderRadius: '12px',
            padding: '16px 20px',
            border: '1px solid rgba(59, 130, 246, 0.4)',
          }}>
            <div style={{ color: '#93c5fd', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
              💡 Key Insight: FluentThemeProvider works with BOTH patterns!
            </div>
            <div style={{ color: '#d1d5db', fontSize: '12px', lineHeight: '1.6' }}>
              • <strong>ReactWebChat</strong>: Use when you just need Fluent styling without custom components<br/>
              • <strong>Composer + BasicWebChat</strong>: Use when you need custom components (like status bars, starter prompts) that access WebChat hooks
            </div>
          </div>

          {/* Legend */}
          <div style={{
            marginTop: '40px',
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '12px' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#3b82f6', borderRadius: '6px' }} />
              <span>Question / Simple React</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '12px' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#8b5cf6', borderRadius: '6px' }} />
              <span>Sub-question</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '12px' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#ef4444', borderRadius: '6px' }} />
              <span>Flexible React (Recommended)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '12px' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '6px' }} />
              <span>Vanilla JS / CDN</span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '32px' }}>
          {/* CDN + renderWebChat */}
          <div className={styles.architectureCard}>
            <div className={styles.architectureCardTitle}>🌐 CDN + renderWebChat</div>
            <Text style={{ color: '#6b7280', marginBottom: '12px' }}>
              Best for non-React apps, CMS platforms, quick prototypes.
            </Text>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.8' }}>
              <li>No npm install needed</li>
              <li>Works in vanilla HTML/JS</li>
              <li>SharePoint, WordPress</li>
              <li>Middleware supported ✓</li>
            </ul>
          </div>

          {/* ReactWebChat */}
          <div className={styles.architectureCard}>
            <div className={styles.architectureCardTitle}>⚛️ ReactWebChat</div>
            <Text style={{ color: '#6b7280', marginBottom: '12px' }}>
              Simple React component for quick setup with default styling.
            </Text>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.8' }}>
              <li>Single component</li>
              <li>TypeScript support</li>
              <li>Default styling</li>
              <li>Middleware supported ✓</li>
            </ul>
          </div>

          {/* Composer + BasicWebChat */}
          <div className={styles.architectureCard} style={{ borderColor: '#fbbf24', borderWidth: '2px' }}>
            <div className={styles.architectureCardTitle}>
              ⭐ Composer + BasicWebChat
              <Badge appearance="filled" color="warning" style={{ marginLeft: '8px' }}>Recommended</Badge>
            </div>
            <Text style={{ color: '#6b7280', marginBottom: '12px' }}>
              Production-ready with FluentThemeProvider for enterprise apps.
            </Text>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.8' }}>
              <li>FluentTheme support</li>
              <li>Component composition</li>
              <li>Custom UI injection</li>
              <li>Middleware supported ✓</li>
            </ul>
          </div>

          {/* Individual Components */}
          <div className={styles.architectureCard}>
            <div className={styles.architectureCardTitle}>🧩 Individual Components</div>
            <Text style={{ color: '#6b7280', marginBottom: '12px' }}>
              Full control over transcript, sendbox, and layout.
            </Text>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.8' }}>
              <li>Custom transcript</li>
              <li>Custom send box</li>
              <li>Complete flexibility</li>
              <li>Middleware supported ✓</li>
            </ul>
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

    // Auth tab - always show
    if (selectedTab === 'auth') {
      return renderAuthentication();
    }

    // Comparison tab - always show (no auth needed)
    if (selectedTab === 'comparison') {
      return <IntegrationComparisonTable />;
    }

    // Decision Flow tab - always show (no auth needed)
    if (selectedTab === 'decision-flow') {
      return renderDecisionFlow();
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
              WebChat integration patterns with Azure AD authentication
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
            <Tab icon={<Shield24Regular />} value="auth">
              Authentication
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
            <Tab icon={<DataArea24Regular />} value="comparison">
              Comparison
            </Tab>
            <Tab icon={<BranchFork24Regular />} value="decision-flow">
              Decision Flow
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
