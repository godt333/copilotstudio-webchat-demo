/**
 * Branding Demos Page
 * 
 * Showcases different styling and branding approaches for WebChat
 * using the M365 Agents SDK with Azure AD authentication.
 * 
 * This page focuses on visual customization:
 * - StyleOptions (simple property-based styling)
 * - StyleSet (CSS-in-JS customization)
 * - Fluent Theme (Microsoft Fluent UI integration)
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
  Person24Regular,
  SignOut24Regular,
  Home24Regular,
  Color24Regular,
  PaintBrush24Regular,
  DesignIdeas24Regular,
  Chat24Regular,
} from '@fluentui/react-icons';

// Import demo components
import AgentSDKStyleOptionsDemo from '../demos/AgentSDK-styleoptions/AgentSDKStyleOptionsDemo';
import AgentSDKStyleSetDemo from '../demos/AgentSDK-styleset/AgentSDKStyleSetDemo';
import AgentSDKFluentThemeDemo from '../demos/AgentSDK-fluent-theme/AgentSDKFluentThemeDemo';
import AgentSDKMinimizableDemo from '../demos/AgentSDK-minimizable/AgentSDKMinimizableDemo';
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
    background: 'linear-gradient(135deg, #e91e63 0%, #9c27b0 100%)',
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
    ...shorthands.borderBottom('1px', 'solid', '#e0e0e0'),
    ...shorthands.padding('0', '16px'),
  },
  tabContent: {
    ...shorthands.padding('24px'),
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
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.padding('24px'),
    maxWidth: '600px',
  },
  codeBlock: {
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    ...shorthands.padding('16px'),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    fontFamily: 'Consolas, monospace',
    fontSize: '13px',
    marginTop: tokens.spacingVerticalM,
    textAlign: 'left',
    whiteSpace: 'pre',
  },
  // Overview styles
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    marginTop: tokens.spacingVerticalL,
  },
  overviewCard: {
    backgroundColor: 'white',
    ...shorthands.border('1px', 'solid', '#e5e7eb'),
    borderRadius: '16px',
    ...shorthands.padding('24px'),
    cursor: 'pointer',
    transitionProperty: 'transform, box-shadow',
    transitionDuration: '0.2s',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
    },
  },
  overviewCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  overviewCardIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  },
  overviewCardTitle: {
    fontWeight: '600',
    fontSize: '18px',
  },
  overviewCardBadge: {
    ...shorthands.padding('4px', '12px'),
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  overviewCardDescription: {
    color: '#6b7280',
    marginBottom: '16px',
    lineHeight: '1.5',
  },
  overviewCardFeatures: {
    listStyleType: 'none',
    ...shorthands.padding('0'),
    ...shorthands.margin('0'),
    '& li': {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '8px',
      fontSize: '14px',
      color: '#374151',
    },
  },
  // Architecture section styles
  architectureSection: {
    marginBottom: tokens.spacingVerticalXL,
  },
  architectureSectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
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
    fontWeight: '600',
    fontSize: '20px',
  },
  architectureDescription: {
    color: '#6b7280',
    marginBottom: tokens.spacingVerticalM,
    lineHeight: '1.6',
  },
  architectureCard: {
    backgroundColor: 'white',
    ...shorthands.border('1px', 'solid', '#e5e7eb'),
    borderRadius: '16px',
    ...shorthands.padding('24px'),
    marginBottom: tokens.spacingVerticalL,
  },
  architectureCardTitle: {
    fontWeight: '600',
    fontSize: '16px',
    marginBottom: tokens.spacingVerticalM,
  },
  // Theming Grid
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
});

// ============================================================================
// TYPES
// ============================================================================

type AuthStatus = 'checking' | 'signed-out' | 'signing-in' | 'signed-in' | 'error';
type TabValue = 'overview' | 'styleoptions' | 'styleset' | 'fluenttheme' | 'widget';

const configCode = `VITE_COPILOT_DIRECT_CONNECT_URL=https://...
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_TENANT_ID=your-tenant-id`;

interface UserInfo {
  name: string;
  email: string;
}

interface DemoOption {
  id: Exclude<TabValue, 'overview'>;
  title: string;
  description: string;
  icon: string;
  iconBg: string;
  complexity: 'Easy' | 'Medium' | 'Advanced';
  badgeClass: string;
  features: string[];
}

const demoOptions: DemoOption[] = [
  {
    id: 'styleoptions',
    title: 'StyleOptions',
    description: 'Simple property-based customization using a configuration object.',
    icon: '🎨',
    iconBg: '#dbeafe',
    complexity: 'Easy',
    badgeClass: 'themingCardBadgeEasy',
    features: ['Colors & fonts', 'Bubble styling', 'Avatar customization', 'Quick setup'],
  },
  {
    id: 'styleset',
    title: 'StyleSet',
    description: 'CSS-in-JS approach for fine-grained control over every element.',
    icon: '🖌️',
    iconBg: '#fce7f3',
    complexity: 'Medium',
    badgeClass: 'themingCardBadgeMedium',
    features: ['Full CSS control', 'Pseudo-selectors', 'Animations', 'Component targeting'],
  },
  {
    id: 'fluenttheme',
    title: 'Fluent Theme',
    description: 'Microsoft Fluent UI integration for enterprise-grade styling.',
    icon: '✨',
    iconBg: '#fef3c7',
    complexity: 'Advanced',
    badgeClass: 'themingCardBadgePremium',
    features: ['Fluent Design System', 'Theme tokens', 'Accessibility', 'Dark mode support'],
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function BrandingDemosPage() {
  const styles = useStyles();
  const [selectedTab, setSelectedTab] = useState<TabValue>('overview');
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');
  const [authError, setAuthError] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [msalInstance, setMsalInstance] = useState<PublicClientApplication | null>(null);
  const [connections, setConnections] = useState<Record<string, CopilotStudioWebChatConnection | null>>({});
  const [connectionError, setConnectionError] = useState('');

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
        setMsalInstance(msal);

        const accounts = msal.getAllAccounts();
        if (accounts.length > 0) {
          const account = accounts[0];
          msal.setActiveAccount(account);
          setUserInfo({
            name: account.name || account.username,
            email: account.username,
          });
          setAuthStatus('signed-in');
        } else {
          setAuthStatus('signed-out');
        }
      } catch (error) {
        console.error('MSAL init error:', error);
        setAuthError(error instanceof Error ? error.message : 'Failed to initialize');
        setAuthStatus('error');
      }
    };

    initMsal();
  }, [isConfigured]);

  // Create connection for current tab
  useEffect(() => {
    if (authStatus !== 'signed-in' || selectedTab === 'overview') return;
    if (connections[selectedTab]) return;

    const createConnection = async () => {
      if (!msalInstance) return;

      try {
        const account = msalInstance.getActiveAccount();
        if (!account) {
          setAuthStatus('signed-out');
          return;
        }

        let tokenResponse;
        try {
          tokenResponse = await msalInstance.acquireTokenSilent({
            ...loginRequest,
            account,
          });
        } catch (silentError) {
          if (silentError instanceof InteractionRequiredAuthError) {
            tokenResponse = await msalInstance.acquireTokenPopup(loginRequest);
          } else {
            throw silentError;
          }
        }

        const client = new CopilotStudioClient(connectionSettings, tokenResponse.accessToken);
        const connection = CopilotStudioWebChat.createConnection(client, { showTyping: true });

        setConnections(prev => ({ ...prev, [selectedTab]: connection }));
      } catch (error) {
        console.error('Connection error:', error);
        setConnectionError(error instanceof Error ? error.message : 'Failed to connect');
      }
    };

    createConnection();
  }, [authStatus, selectedTab, msalInstance, connections]);

  const handleSignIn = useCallback(async () => {
    if (!msalInstance) return;

    setAuthStatus('signing-in');
    try {
      const response = await msalInstance.loginPopup(loginRequest);
      msalInstance.setActiveAccount(response.account);
      setUserInfo({
        name: response.account.name || response.account.username,
        email: response.account.username,
      });
      setAuthStatus('signed-in');
    } catch (error) {
      console.error('Sign in error:', error);
      setAuthError(error instanceof Error ? error.message : 'Sign in failed');
      setAuthStatus('error');
    }
  }, [msalInstance]);

  const handleSignOut = useCallback(async () => {
    if (!msalInstance) return;

    try {
      await msalInstance.logoutPopup();
      setUserInfo(null);
      setAuthStatus('signed-out');
      setConnections({});
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, [msalInstance]);

  const connection = selectedTab !== 'overview' ? connections[selectedTab] : null;

  // Render overview content
  const renderOverview = () => {
    return (
      <div>
        {/* Introduction */}
        <div className={styles.architectureSection}>
          <div className={styles.architectureSectionHeader}>
            <div className={styles.architectureSectionIcon} style={{ backgroundColor: '#fce7f3' }}>
              🎨
            </div>
            <div>
              <span className={styles.architectureSectionTitle}>Branding & Styling</span>
              <Badge 
                appearance="filled" 
                style={{ marginLeft: '12px', backgroundColor: '#e91e63', color: 'white' }}
              >
                CUSTOMIZATION
              </Badge>
            </div>
          </div>
          <Text className={styles.architectureDescription}>
            BotFramework WebChat offers multiple approaches to customize the appearance and behavior of your 
            chat interface. Choose the right approach based on your customization needs and complexity requirements.
          </Text>
        </div>

        {/* Demo Cards */}
        <div className={styles.overviewGrid}>
          {demoOptions.map((demo) => (
            <div
              key={demo.id}
              className={styles.overviewCard}
              onClick={() => setSelectedTab(demo.id)}
            >
              <div className={styles.overviewCardHeader}>
                <div className={styles.overviewCardIcon} style={{ backgroundColor: demo.iconBg }}>
                  {demo.icon}
                </div>
                <div>
                  <div className={styles.overviewCardTitle}>{demo.title}</div>
                  <span className={`${styles.overviewCardBadge} ${styles[demo.badgeClass as keyof typeof styles]}`}>
                    {demo.complexity}
                  </span>
                </div>
              </div>
              <div className={styles.overviewCardDescription}>{demo.description}</div>
              <ul className={styles.overviewCardFeatures}>
                {demo.features.map((feature, idx) => (
                  <li key={idx}>✓ {feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Comparison Section */}
        <div className={styles.architectureCard} style={{ marginTop: '32px' }}>
          <div className={styles.architectureCardTitle}>
            📊 Choosing the Right Approach
          </div>
          <div className={styles.themingGrid}>
            <div className={styles.themingCard}>
              <div className={styles.themingCardHeader}>
                <span className={styles.themingCardTitle}>
                  <Color24Regular /> StyleOptions
                </span>
                <span className={`${styles.themingCardBadge} ${styles.themingCardBadgeEasy}`}>
                  Easy
                </span>
              </div>
              <div className={styles.themingCardDescription}>
                Best for quick branding changes. Pass a configuration object with colors, fonts, and sizes.
              </div>
              <div className={styles.themingCodeBlock}>
{`<ReactWebChat
  styleOptions={{
    bubbleBackground: '#F0F0F0',
    bubbleFromUserBackground: '#0078d4',
    bubbleFromUserTextColor: '#fff',
    botAvatarInitials: 'AI',
    userAvatarInitials: 'ME',
  }}
/>`}
              </div>
            </div>

            <div className={styles.themingCard}>
              <div className={styles.themingCardHeader}>
                <span className={styles.themingCardTitle}>
                  <PaintBrush24Regular /> StyleSet
                </span>
                <span className={`${styles.themingCardBadge} ${styles.themingCardBadgeMedium}`}>
                  Medium
                </span>
              </div>
              <div className={styles.themingCardDescription}>
                Fine-grained CSS control. Use createStyleSet() and target specific components.
              </div>
              <div className={styles.themingCodeBlock}>
{`const styleSet = createStyleSet({
  bubbleFromUserBackground: '#0078d4',
});
styleSet.textContent = {
  ...styleSet.textContent,
  fontFamily: "'Segoe UI', sans-serif",
};
<ReactWebChat styleSet={styleSet} />`}
              </div>
            </div>

            <div className={styles.themingCard}>
              <div className={styles.themingCardHeader}>
                <span className={styles.themingCardTitle}>
                  <DesignIdeas24Regular /> Fluent Theme
                </span>
                <span className={`${styles.themingCardBadge} ${styles.themingCardBadgePremium}`}>
                  Advanced
                </span>
              </div>
              <div className={styles.themingCardDescription}>
                Full Microsoft Fluent UI integration with theme tokens and design system.
              </div>
              <div className={styles.themingCodeBlock}>
{`import { FluentThemeProvider }
  from 'botframework-webchat-fluent-theme';

<FluentThemeProvider>
  <ReactWebChat directLine={...} />
</FluentThemeProvider>`}
              </div>
            </div>
          </div>
        </div>

        {/* Link back to Integration Demos */}
        <div className={styles.architectureCard} style={{ backgroundColor: '#eff6ff', borderColor: '#3b82f6' }}>
          <div className={styles.architectureCardTitle}>
            🔗 Need Integration Patterns?
          </div>
          <Text style={{ marginBottom: '16px' }}>
            Looking for WebChat integration patterns (CDN, React, Middleware)? Visit the M365 Agents SDK Demos page.
          </Text>
          <Button
            appearance="primary"
            onClick={() => window.location.href = '/AgentsSDK-demos'}
          >
            Go to Integration Demos
          </Button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    // Overview tab - always show
    if (selectedTab === 'overview') {
      return renderOverview();
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
          <Person24Regular style={{ fontSize: '64px', color: '#e91e63' }} />
          <Text weight="semibold" size={500}>Sign In Required</Text>
          <Text>Sign in with your Microsoft account to access the branding demos.</Text>
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

    // Render selected demo
    switch (selectedTab) {
      case 'styleoptions':
        return <AgentSDKStyleOptionsDemo key="styleoptions" connection={connection} />;
      case 'styleset':
        return <AgentSDKStyleSetDemo key="styleset" connection={connection} />;
      case 'fluenttheme':
        return <AgentSDKFluentThemeDemo key="fluenttheme" connection={connection} />;
      case 'widget':
        return <AgentSDKMinimizableDemo key="widget" connection={connection} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.page}>
      {/* Demo Navigation Header */}
      <DemoHeader title="Branding Demos" />

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Title1 className={styles.headerTitle}>
              Branding & Styling Demos
              <Badge appearance="filled" color="informative" className={styles.badge}>
                Customization
              </Badge>
            </Title1>
            <Body1 className={styles.headerSubtitle}>
              Visual customization options for WebChat with Azure AD authentication
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

      {/* Main Content */}
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
            <Tab icon={<Color24Regular />} value="styleoptions">
              StyleOptions
            </Tab>
            <Tab icon={<PaintBrush24Regular />} value="styleset">
              StyleSet
            </Tab>
            <Tab icon={<DesignIdeas24Regular />} value="fluenttheme">
              Fluent Theme
            </Tab>
            <Tab icon={<Chat24Regular />} value="widget">
              Widget
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
