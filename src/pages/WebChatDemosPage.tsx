/**
 * WebChat Demos Showcase Page
 * 
 * A tabbed interface showcasing different ways to integrate
 * Bot Framework WebChat with Copilot Studio.
 */
import { useState } from 'react';
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
} from '@fluentui/react-components';
import {
  Globe24Regular,
  Code24Regular,
  Settings24Regular,
  WindowDevTools24Regular,
} from '@fluentui/react-icons';

// Import demo components
import CdnDirectLineDemo from '../demos/cdn-directline/CdnDirectLineDemo';
import SimpleReactWebChatDemo from '../demos/simple-react/SimpleReactWebChatDemo';
import MiddlewareCustomUIDemo from '../demos/middleware-custom-ui/MiddlewareCustomUIDemo';
import RenderWebChatDemo from '../demos/render-function/RenderWebChatDemo';
import DemoHeader from '../components/layout/DemoHeader';

const useStyles = makeStyles({
  page: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  header: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    color: 'white',
    ...shorthands.padding('32px', '48px'),
  },
  headerContent: {
    maxWidth: '1400px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  headerTitle: {
    color: 'white',
    marginBottom: tokens.spacingVerticalS,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    maxWidth: '800px',
  },
  badge: {
    marginLeft: tokens.spacingHorizontalM,
  },
  container: {
    maxWidth: '1400px',
    marginLeft: 'auto',
    marginRight: 'auto',
    ...shorthands.padding('32px', '48px'),
  },
  tabsCard: {
    ...shorthands.padding('0'),
    marginBottom: tokens.spacingVerticalXL,
    overflow: 'hidden',
  },
  tabList: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
    ...shorthands.padding('0', tokens.spacingHorizontalL),
  },
  tabContent: {
    ...shorthands.padding(tokens.spacingVerticalXL, tokens.spacingHorizontalXL),
    backgroundColor: '#fff',
    minHeight: '600px',
  },
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: tokens.spacingHorizontalL,
    marginTop: tokens.spacingVerticalL,
  },
  overviewCard: {
    ...shorthands.padding(tokens.spacingHorizontalL),
    cursor: 'pointer',
    transitionProperty: 'transform, box-shadow',
    transitionDuration: '0.2s',
    ':hover': {
      transform: 'translateY(-2px)',
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
    marginBottom: tokens.spacingVerticalXS,
  },
  cardDescription: {
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase200,
  },
  cardBadge: {
    marginTop: tokens.spacingVerticalS,
  },
  // Architecture Overview Section Styles
  sectionContainer: {
    marginTop: tokens.spacingVerticalXXL,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: tokens.spacingVerticalM,
  },
  sectionIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1f2937',
  },
  sectionBadge: {
    marginLeft: '8px',
  },
  sectionDescription: {
    color: '#6b7280',
    marginBottom: tokens.spacingVerticalL,
    maxWidth: '800px',
  },
  architectureCard: {
    backgroundColor: '#fafafa',
    ...shorthands.border('1px', 'solid', '#e8e8e8'),
    borderRadius: tokens.borderRadiusXLarge,
    ...shorthands.padding('24px'),
    marginBottom: tokens.spacingVerticalL,
  },
  architectureCardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600',
    fontSize: '16px',
    marginBottom: tokens.spacingVerticalM,
    color: '#374151',
  },
  // High-Level Architecture Layers
  layersStack: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto',
    gap: '0',
  },
  layer: {
    ...shorthands.padding('16px', '24px'),
    textAlign: 'center',
  },
  layerTitle: {
    fontWeight: '600',
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  layerDescription: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
  },
  uiLayer: {
    backgroundColor: '#dbeafe',
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
    borderBottom: '1px solid #bfdbfe',
  },
  connectionLayer: {
    backgroundColor: '#dcfce7',
    borderBottom: '1px solid #bbf7d0',
  },
  authLayer: {
    backgroundColor: '#fef3c7',
    borderBottom: '1px solid #fde68a',
  },
  cloudLayer: {
    backgroundColor: '#f3e8ff',
    borderBottom: '1px solid #e9d5ff',
  },
  aiLayer: {
    backgroundColor: '#e0f2fe',
    borderBottomLeftRadius: '12px',
    borderBottomRightRadius: '12px',
  },
  // Token Endpoint Architecture
  tokenEndpointGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: tokens.spacingHorizontalXL,
  },
  flowDiagram: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    ...shorthands.padding('16px'),
  },
  flowBox: {
    ...shorthands.padding('16px', '24px'),
    borderRadius: '12px',
    textAlign: 'center',
    minWidth: '160px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  flowBoxTitle: {
    fontWeight: '600',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
  flowBoxSub: {
    fontSize: '11px',
    opacity: 0.8,
    marginTop: '2px',
  },
  flowArrow: {
    color: '#9ca3af',
    fontSize: '20px',
  },
  flowLabel: {
    fontSize: '11px',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    ...shorthands.padding('4px', '12px'),
    borderRadius: '20px',
  },
  flowRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  implementationSteps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  stepItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
  },
  stepNumber: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#0078d4',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '14px',
    flexShrink: 0,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontWeight: '600',
    color: '#0078d4',
    fontSize: '14px',
  },
  stepDescription: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '2px',
  },
  stepArrow: {
    marginLeft: '15px',
    color: '#9ca3af',
  },
  // Integration Options Cards
  integrationOptionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: tokens.spacingHorizontalL,
    marginTop: tokens.spacingVerticalL,
  },
  integrationOptionCard: {
    ...shorthands.padding('16px', '20px'),
    borderRadius: '12px',
    borderLeft: '4px solid',
  },
  tokenEndpointCard: {
    backgroundColor: '#fffbeb',
    borderLeftColor: '#f59e0b',
  },
  m365SdkCard: {
    backgroundColor: '#fef2f2',
    borderLeftColor: '#ef4444',
  },
  voiceCard: {
    backgroundColor: '#f0fdf4',
    borderLeftColor: '#22c55e',
  },
  optionTitle: {
    fontWeight: '600',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  optionDescription: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '6px',
    lineHeight: '1.5',
  },
  // Important Configuration Warning
  importantConfig: {
    ...shorthands.border('1px', 'solid', '#e5e7eb'),
    borderRadius: '12px',
    ...shorthands.padding('16px', '20px'),
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginTop: tokens.spacingVerticalL,
    backgroundColor: '#fffbeb',
    borderLeftWidth: '4px',
    borderLeftColor: '#f59e0b',
  },
  warningIcon: {
    fontSize: '24px',
    flexShrink: 0,
  },
  warningTitle: {
    fontWeight: '600',
    color: '#b45309',
    fontSize: '14px',
  },
  warningText: {
    color: '#78716c',
    fontSize: '13px',
    marginTop: '4px',
    lineHeight: '1.5',
  },
});

type TabValue = 'overview' | 'cdn' | 'simple' | 'middleware' | 'render';

interface DemoOption {
  id: TabValue;
  title: string;
  description: string;
  icon: React.ReactNode;
  complexity: 'Easy' | 'Medium' | 'Advanced';
  badgeColor: 'success' | 'warning' | 'danger';
}

const demoOptions: DemoOption[] = [
  {
    id: 'cdn',
    title: 'CDN with Direct Line',
    description: 'Load WebChat from CDN and render using vanilla JavaScript. Best for non-React apps.',
    icon: <Globe24Regular />,
    complexity: 'Easy',
    badgeColor: 'success',
  },
  {
    id: 'simple',
    title: 'Simple ReactWebChat',
    description: 'Direct integration using ReactWebChat component. Minimal configuration required.',
    icon: <Code24Regular />,
    complexity: 'Easy',
    badgeColor: 'success',
  },
  {
    id: 'middleware',
    title: 'Middleware & Custom UI',
    description: 'ReactWebChat with createStore middleware for message interception and custom styling.',
    icon: <Settings24Regular />,
    complexity: 'Medium',
    badgeColor: 'warning',
  },
  {
    id: 'render',
    title: 'renderWebChat Function',
    description: 'Imperative rendering with full DOM control. Maximum customization flexibility.',
    icon: <WindowDevTools24Regular />,
    complexity: 'Advanced',
    badgeColor: 'danger',
  },
];

export default function WebChatDemosPage() {
  const styles = useStyles();
  const [selectedTab, setSelectedTab] = useState<TabValue>('overview');

  const handleCardClick = (tabId: TabValue) => {
    setSelectedTab(tabId);
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return (
          <div>
            <Text size={500} weight="semibold">
              Choose a WebChat Integration Approach
            </Text>
            <Text block style={{ marginTop: '8px', color: '#666' }}>
              Each approach offers different levels of customization and complexity. 
              Click on a card to see the live demo and implementation code.
            </Text>
            <div className={styles.overviewGrid}>
              {demoOptions.map((option) => (
                <Card
                  key={option.id}
                  className={styles.overviewCard}
                  onClick={() => handleCardClick(option.id)}
                >
                  <div className={styles.cardIcon}>{option.icon}</div>
                  <Text className={styles.cardTitle}>{option.title}</Text>
                  <Text className={styles.cardDescription}>{option.description}</Text>
                  <div className={styles.cardBadge}>
                    <Badge
                      appearance="filled"
                      color={option.badgeColor}
                    >
                      {option.complexity}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>

            {/* Architecture Overview Section */}
            <div className={styles.sectionContainer}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon} style={{ backgroundColor: '#dbeafe' }}>
                  🏗️
                </div>
                <div>
                  <span className={styles.sectionTitle}>Architecture Overview</span>
                  <Badge appearance="filled" color="brand" className={styles.sectionBadge}>
                    INTEGRATION PATTERNS
                  </Badge>
                </div>
              </div>
              <Text className={styles.sectionDescription}>
                Microsoft Copilot Studio provides multiple integration approaches for embedding conversational AI 
                into web applications. Each approach has distinct authentication mechanisms, capabilities, and use cases.
              </Text>

              <div className={styles.architectureCard}>
                <div className={styles.architectureCardTitle}>
                  📊 High-Level Architecture
                </div>
                <div className={styles.layersStack}>
                  <div className={`${styles.layer} ${styles.uiLayer}`}>
                    <div className={styles.layerTitle}>🖥️ User Interface Layer</div>
                    <div className={styles.layerDescription}>React Application • BotFramework WebChat • Fluent UI</div>
                  </div>
                  <div className={`${styles.layer} ${styles.connectionLayer}`}>
                    <div className={styles.layerTitle}>🔗 Connection Layer</div>
                    <div className={styles.layerDescription}>DirectLine Protocol • CopilotStudioWebChat Connection</div>
                  </div>
                  <div className={`${styles.layer} ${styles.authLayer}`}>
                    <div className={styles.layerTitle}>🔐 Authentication Layer</div>
                    <div className={styles.layerDescription}>Token Endpoint (Anonymous) • MSAL/Azure AD (Authenticated)</div>
                  </div>
                  <div className={`${styles.layer} ${styles.cloudLayer}`}>
                    <div className={styles.layerTitle}>☁️ Microsoft Cloud Services</div>
                    <div className={styles.layerDescription}>Copilot Studio • Power Platform API • Azure Bot Service</div>
                  </div>
                  <div className={`${styles.layer} ${styles.aiLayer}`}>
                    <div className={styles.layerTitle}>🤖 AI & Knowledge Layer</div>
                    <div className={styles.layerDescription}>Topics & Dialogs • Generative AI • Knowledge Sources • Power Automate</div>
                  </div>
                </div>
              </div>

              {/* Integration Options */}
              <div className={styles.integrationOptionsGrid}>
                <div className={`${styles.integrationOptionCard} ${styles.tokenEndpointCard}`}>
                  <div className={styles.optionTitle}>
                    🎫 Token Endpoint
                  </div>
                  <div className={styles.optionDescription}>
                    Anonymous access for public websites. No user sign-in required. Simple integration with DirectLine.
                  </div>
                </div>
                <div className={`${styles.integrationOptionCard} ${styles.m365SdkCard}`}>
                  <div className={styles.optionTitle}>
                    🔑 M365 Agents SDK
                  </div>
                  <div className={styles.optionDescription}>
                    Authenticated access with Azure AD. User identity aware. Access to enterprise data sources.
                  </div>
                </div>
                <div className={`${styles.integrationOptionCard} ${styles.voiceCard}`}>
                  <div className={styles.optionTitle}>
                    🎤 Voice Integration
                  </div>
                  <div className={styles.optionDescription}>
                    Speech-to-text and text-to-speech capabilities using Azure Cognitive Services or DirectLine Speech.
                  </div>
                </div>
              </div>
            </div>

            {/* Token Endpoint Architecture Section */}
            <div className={styles.sectionContainer}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon} style={{ backgroundColor: '#dcfce7' }}>
                  🎫
                </div>
                <div>
                  <span className={styles.sectionTitle}>Token Endpoint Architecture</span>
                  <Badge appearance="filled" color="success" className={styles.sectionBadge}>
                    ANONYMOUS ACCESS
                  </Badge>
                </div>
              </div>
              <Text className={styles.sectionDescription}>
                The Token Endpoint approach enables anonymous chat without user authentication. Ideal for public-facing 
                websites and citizen services.
              </Text>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Authentication Flow */}
                <div className={styles.architectureCard}>
                  <div className={styles.architectureCardTitle}>
                    🔄 Authentication Flow
                  </div>
                  <div className={styles.flowDiagram}>
                    <div className={styles.flowBox} style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>
                      <div className={styles.flowBoxTitle}>🌐 Web Browser</div>
                      <div className={styles.flowBoxSub}>React App</div>
                    </div>
                    <div className={styles.flowArrow}>↓</div>
                    <div className={styles.flowLabel}>1. GET /token</div>
                    <div className={styles.flowArrow}>↓</div>
                    <div className={styles.flowBox} style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                      <div className={styles.flowBoxTitle}>🎫 Token Endpoint</div>
                      <div className={styles.flowBoxSub}>No Auth Required</div>
                    </div>
                    <div className={styles.flowArrow}>↓</div>
                    <div className={styles.flowLabel}>2. DirectLine Token</div>
                    <div className={styles.flowArrow}>↓</div>
                    <div className={styles.flowRow}>
                      <div className={styles.flowBox} style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>
                        <div className={styles.flowBoxTitle}>💬 WebChat</div>
                        <div className={styles.flowBoxSub}>createDirectLine()</div>
                      </div>
                      <span style={{ color: '#9ca3af' }}>→</span>
                      <div className={styles.flowLabel}>3. Connect</div>
                      <span style={{ color: '#9ca3af' }}>→</span>
                      <div className={styles.flowBox} style={{ backgroundColor: '#f3e8ff', color: '#7c3aed' }}>
                        <div className={styles.flowBoxTitle}>🤖 Copilot Studio</div>
                        <div className={styles.flowBoxSub}>Bot Service</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Implementation Steps */}
                <div className={styles.architectureCard}>
                  <div className={styles.architectureCardTitle}>
                    📋 Implementation Steps
                  </div>
                  <div className={styles.implementationSteps}>
                    <div className={styles.stepItem}>
                      <div className={styles.stepNumber}>1</div>
                      <div className={styles.stepContent}>
                        <div className={styles.stepTitle}>Get Token Endpoint URL</div>
                        <div className={styles.stepDescription}>Copilot Studio → Channels → Mobile App</div>
                      </div>
                    </div>
                    <div className={styles.stepArrow}>↓</div>
                    <div className={styles.stepItem}>
                      <div className={styles.stepNumber}>2</div>
                      <div className={styles.stepContent}>
                        <div className={styles.stepTitle}>Fetch DirectLine Token</div>
                        <div className={styles.stepDescription}>Simple GET request, no credentials</div>
                      </div>
                    </div>
                    <div className={styles.stepArrow}>↓</div>
                    <div className={styles.stepItem}>
                      <div className={styles.stepNumber}>3</div>
                      <div className={styles.stepContent}>
                        <div className={styles.stepTitle}>Create DirectLine Connection</div>
                        <div className={styles.stepDescription}>createDirectLine({'{ token }'})</div>
                      </div>
                    </div>
                    <div className={styles.stepArrow}>↓</div>
                    <div className={styles.stepItem}>
                      <div className={styles.stepNumber}>4</div>
                      <div className={styles.stepContent}>
                        <div className={styles.stepTitle}>Render WebChat</div>
                        <div className={styles.stepDescription}>&lt;ReactWebChat directLine={'{...}'} /&gt;</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Configuration Warning */}
              <div className={styles.importantConfig}>
                <div className={styles.warningIcon}>⚠️</div>
                <div>
                  <div className={styles.warningTitle}>Important Configuration</div>
                  <div className={styles.warningText}>
                    For Token Endpoint to work, your Copilot Studio agent must be configured with "<strong>No authentication</strong>" in Settings → Security. 
                    Do not use SharePoint or Dataverse knowledge sources as they require authentication.
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'cdn':
        return <CdnDirectLineDemo />;
      case 'simple':
        return <SimpleReactWebChatDemo />;
      case 'middleware':
        return <MiddlewareCustomUIDemo />;
      case 'render':
        return <RenderWebChatDemo />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.page}>
      {/* Demo Navigation Header */}
      <DemoHeader title="WebChat Demos" />

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Title1 className={styles.headerTitle}>
            Copilot Studio Web Chat Integration
            <Badge appearance="filled" color="brand" className={styles.badge}>
              Demos
            </Badge>
          </Title1>
          <Body1 className={styles.headerSubtitle}>
            Explore different approaches to integrate Bot Framework WebChat with Microsoft Copilot Studio.
            Each demo includes live examples, implementation code, and pros/cons analysis.
          </Body1>
        </div>
      </div>

      {/* Content */}
      <div className={styles.container}>
        <Card className={styles.tabsCard}>
          {/* Tabs */}
          <TabList
            className={styles.tabList}
            selectedValue={selectedTab}
            onTabSelect={(_, data) => setSelectedTab(data.value as TabValue)}
          >
            <Tab value="overview">Overview</Tab>
            <Tab value="cdn">CDN + Direct Line</Tab>
            <Tab value="simple">Simple ReactWebChat</Tab>
            <Tab value="middleware">Middleware + Custom UI</Tab>
            <Tab value="render">renderWebChat</Tab>
          </TabList>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {renderTabContent()}
          </div>
        </Card>
      </div>
    </div>
  );
}
