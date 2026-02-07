/**
 * Voice Integration Demos Page
 * 
 * Showcases different approaches to adding voice capabilities to WebChat
 * when integrating with Copilot Studio.
 * 
 * Four approaches demonstrated:
 * 1. Overview - Comparison and guidance
 * 2. Speech Ponyfill - Built-in WebChat voice via Azure Speech SDK
 * 3. Custom Speech SDK - Manual Speech SDK integration
 * 4. Direct Line Speech - Unified voice channel (informational)
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
  Title2,
  Body1,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from '@fluentui/react-components';
import {
  Mic24Regular,
  Speaker224Regular,
  Code24Regular,
  Info24Regular,
  Checkmark24Regular,
  Dismiss24Regular,
  Warning24Regular,
  Home24Regular,
  PlugConnected24Regular,
} from '@fluentui/react-icons';

// Import demo components
import VoicePonyfillDemo from '../demos/voice-ponyfill/VoicePonyfillDemo';
import VoiceCustomSDKDemo from '../demos/voice-custom-sdk/VoiceCustomSDKDemo';
import VoiceDirectLineSpeechDemo from '../demos/voice-directline-speech/VoiceDirectLineSpeechDemo';
import DemoHeader from '../components/layout/DemoHeader';
import { CodeBlockWithModal } from '../components/common/CodeModal';

// ============================================================================
// STYLES
// ============================================================================

const useStyles = makeStyles({
  page: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  header: {
    background: 'linear-gradient(135deg, #5c2d91 0%, #8661c5 100%)',
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
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'white',
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
  // Overview styles
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
      transform: 'translateY(-4px)',
      boxShadow: tokens.shadow16,
    },
  },
  cardIcon: {
    fontSize: '32px',
    marginBottom: tokens.spacingVerticalS,
  },
  cardTitle: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase400,
    marginBottom: tokens.spacingVerticalXS,
  },
  cardDescription: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
    lineHeight: '1.5',
  },
  cardBadge: {
    marginTop: tokens.spacingVerticalS,
  },
  // Comparison table
  comparisonSection: {
    marginTop: tokens.spacingVerticalXL,
  },
  sectionTitle: {
    marginBottom: tokens.spacingVerticalM,
  },
  tableWrapper: {
    overflowX: 'auto',
    marginTop: tokens.spacingVerticalM,
  },
  checkIcon: {
    color: '#107c10',
  },
  crossIcon: {
    color: '#d13438',
  },
  warningIcon: {
    color: '#ffaa44',
  },
  // Architecture diagram
  architectureSection: {
    marginTop: tokens.spacingVerticalXL,
    backgroundColor: '#f0f0f0',
    ...shorthands.padding(tokens.spacingHorizontalL),
    borderRadius: tokens.borderRadiusMedium,
  },
  codeBlock: {
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    ...shorthands.padding('16px'),
    borderRadius: tokens.borderRadiusMedium,
    fontFamily: 'Consolas, Monaco, monospace',
    fontSize: '12px',
    whiteSpace: 'pre',
    overflowX: 'auto',
  },
  // Notes section
  notesSection: {
    marginTop: tokens.spacingVerticalXL,
    backgroundColor: '#e8f4fd',
    borderLeft: '4px solid #0078d4',
    ...shorthands.padding(tokens.spacingHorizontalL),
    borderRadius: '0 8px 8px 0',
  },
  notesList: {
    marginTop: tokens.spacingVerticalS,
    paddingLeft: '20px',
  },
});

// Code example for architecture diagram
const architectureDiagram = `┌─────────────────────────────────────────────────────────────────────────────┐
│                              Browser                                         │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Bot Framework WebChat                        │   │
│  │                                                                     │   │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌────────────────┐  │   │
│  │  │ Speech Ponyfill │    │ Custom Speech   │    │ DL Speech      │  │   │
│  │  │                 │    │ SDK             │    │ Adapters       │  │   │
│  │  │ webSpeechPony-  │    │                 │    │                │  │   │
│  │  │ fillFactory     │    │ SpeechRecognizer│    │ createDirect-  │  │   │
│  │  │                 │    │ SpeechSynth     │    │ LineSpeech-    │  │   │
│  │  │                 │    │                 │    │ Adapters       │  │   │
│  │  └────────┬────────┘    └────────┬────────┘    └───────┬────────┘  │   │
│  │           │                      │                      │          │   │
│  │           ▼                      ▼                      ▼          │   │
│  │  ┌─────────────────────────────────────────────────────────────┐  │   │
│  │  │                    Direct Line Connection                    │  │   │
│  │  │              (Token Endpoint / Direct Connect)               │  │   │
│  │  └──────────────────────────────┬──────────────────────────────┘  │   │
│  └─────────────────────────────────┼─────────────────────────────────┘   │
└────────────────────────────────────┼─────────────────────────────────────┘
                                     │
                                     ▼
                    ┌────────────────────────────────┐
                    │       Copilot Studio           │
                    │       (Power Platform)         │
                    └────────────────────────────────┘`;

// ============================================================================
// OVERVIEW COMPONENT
// ============================================================================

interface OverviewProps {
  onSelectTab: (tab: string) => void;
}

function Overview({ onSelectTab }: OverviewProps) {
  const styles = useStyles();

  const demos = [
    {
      id: 'ponyfill',
      title: 'Speech Ponyfill',
      description: 'Built-in WebChat voice integration using Azure Cognitive Services Speech SDK. Adds mic button to send box automatically.',
      icon: <Mic24Regular className={styles.cardIcon} style={{ color: '#0078d4' }} />,
      badge: 'Recommended',
      badgeColor: 'success' as const,
    },
    {
      id: 'custom',
      title: 'Custom Speech SDK',
      description: 'Manual integration using Azure Speech SDK directly. Full control over UI and behavior with custom mic button.',
      icon: <Code24Regular className={styles.cardIcon} style={{ color: '#5c2d91' }} />,
      badge: 'Flexible',
      badgeColor: 'informative' as const,
    },
    {
      id: 'directline',
      title: 'Direct Line Speech',
      description: 'Unified voice channel using createDirectLineSpeechAdapters. Single token for bot + speech. Requires additional Azure setup.',
      icon: <PlugConnected24Regular className={styles.cardIcon} style={{ color: '#107c10' }} />,
      badge: 'Advanced',
      badgeColor: 'warning' as const,
    },
  ];

  return (
    <div>
      <Title2>Voice Integration Options for Copilot Studio WebChat</Title2>
      <Body1 style={{ marginTop: tokens.spacingVerticalS, color: tokens.colorNeutralForeground3 }}>
        Compare different approaches to adding voice capabilities to your WebChat integration.
        Choose the approach that best fits your requirements and infrastructure.
      </Body1>

      {/* Demo Cards */}
      <div className={styles.overviewGrid}>
        {demos.map((demo) => (
          <Card
            key={demo.id}
            className={styles.overviewCard}
            onClick={() => onSelectTab(demo.id)}
          >
            {demo.icon}
            <Text className={styles.cardTitle}>{demo.title}</Text>
            <Text className={styles.cardDescription}>{demo.description}</Text>
            <div className={styles.cardBadge}>
              <Badge appearance="filled" color={demo.badgeColor}>{demo.badge}</Badge>
            </div>
          </Card>
        ))}
      </div>

      {/* Comparison Table */}
      <div className={styles.comparisonSection}>
        <Title2 className={styles.sectionTitle}>Feature Comparison</Title2>
        <div className={styles.tableWrapper}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Feature</TableHeaderCell>
                <TableHeaderCell>Speech Ponyfill</TableHeaderCell>
                <TableHeaderCell>Custom Speech SDK</TableHeaderCell>
                <TableHeaderCell>Direct Line Speech</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><strong>Works with Token Endpoint</strong></TableCell>
                <TableCell><Checkmark24Regular className={styles.checkIcon} /></TableCell>
                <TableCell><Checkmark24Regular className={styles.checkIcon} /></TableCell>
                <TableCell><Dismiss24Regular className={styles.crossIcon} /></TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Copilot Studio Compatible</strong></TableCell>
                <TableCell><Checkmark24Regular className={styles.checkIcon} /></TableCell>
                <TableCell><Checkmark24Regular className={styles.checkIcon} /></TableCell>
                <TableCell><Warning24Regular className={styles.warningIcon} /> Extra setup</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Setup Complexity</strong></TableCell>
                <TableCell>Low</TableCell>
                <TableCell>Medium</TableCell>
                <TableCell>High</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Built-in Mic Button</strong></TableCell>
                <TableCell><Checkmark24Regular className={styles.checkIcon} /></TableCell>
                <TableCell><Dismiss24Regular className={styles.crossIcon} /> Custom UI</TableCell>
                <TableCell><Checkmark24Regular className={styles.checkIcon} /></TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Token/Auth Required</strong></TableCell>
                <TableCell>DL Token + Speech Key</TableCell>
                <TableCell>DL Token + Speech Key</TableCell>
                <TableCell>Unified DL Speech Token</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Voice Processing</strong></TableCell>
                <TableCell>Client-side</TableCell>
                <TableCell>Client-side</TableCell>
                <TableCell>Server-side + Client</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>UI Customization</strong></TableCell>
                <TableCell>Limited (styleOptions)</TableCell>
                <TableCell>Full control</TableCell>
                <TableCell>Limited (styleOptions)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Text-to-Speech (Bot Response)</strong></TableCell>
                <TableCell><Checkmark24Regular className={styles.checkIcon} /></TableCell>
                <TableCell><Checkmark24Regular className={styles.checkIcon} /> Manual</TableCell>
                <TableCell><Checkmark24Regular className={styles.checkIcon} /></TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Azure Resources Needed</strong></TableCell>
                <TableCell>Speech Service</TableCell>
                <TableCell>Speech Service</TableCell>
                <TableCell>Speech Service + Bot Service + DL Speech Channel</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Best For</strong></TableCell>
                <TableCell>Quick integration</TableCell>
                <TableCell>Custom experiences</TableCell>
                <TableCell>Enterprise / Telephony</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Architecture */}
      <div className={styles.architectureSection}>
        <Title2 className={styles.sectionTitle}>Architecture Overview</Title2>
        <CodeBlockWithModal code={architectureDiagram} title="Voice Architecture Overview" language="text">
          <pre className={styles.codeBlock}>{architectureDiagram}</pre>
        </CodeBlockWithModal>
      </div>

      {/* Notes */}
      <div className={styles.notesSection}>
        <Title2 className={styles.sectionTitle}>
          <Info24Regular style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Important Notes
        </Title2>
        <ul className={styles.notesList}>
          <li><strong>Speech Ponyfill</strong> is recommended for most Copilot Studio web chat scenarios</li>
          <li><strong>Custom Speech SDK</strong> is ideal when you need custom voice UI or special behaviors</li>
          <li><strong>Direct Line Speech</strong> requires Azure Bot Service and is better suited for telephony/IVR scenarios</li>
          <li>All approaches require an <strong>Azure Speech Services</strong> resource</li>
          <li>Voice features work best with a quiet environment and clear microphone input</li>
          <li>Consider adding voice-specific topics (Silence detection, Speech unrecognized) in Copilot Studio for better UX</li>
        </ul>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

type TabValue = 'overview' | 'ponyfill' | 'custom' | 'directline';

export default function VoiceDemosPage() {
  const styles = useStyles();
  const [selectedTab, setSelectedTab] = useState<TabValue>('overview');

  const handleTabSelect = (tab: string) => {
    setSelectedTab(tab as TabValue);
  };

  return (
    <div className={styles.page}>
      {/* Demo Navigation Header */}
      <DemoHeader title="Voice Integration Demos" />

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Title1 className={styles.headerTitle}>
              <Mic24Regular style={{ marginRight: '12px', verticalAlign: 'middle' }} />
              Voice Integration Demos
            </Title1>
            <Text className={styles.headerSubtitle}>
              Explore different approaches to adding voice capabilities to Copilot Studio WebChat
            </Text>
          </div>
          <div className={styles.headerRight}>
            <a 
              href="/voice-demos-v2" 
              style={{ 
                color: 'white', 
                textDecoration: 'none',
                padding: '8px 16px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              🚀 Try Voice Demos V2 →
            </a>
            <Badge className={styles.badge} appearance="outline">
              <Speaker224Regular style={{ marginRight: '4px' }} />
              Azure Speech Services
            </Badge>
          </div>
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
            <Tab value="overview" icon={<Home24Regular />}>
              Overview
            </Tab>
            <Tab value="ponyfill" icon={<Mic24Regular />}>
              Speech Ponyfill
            </Tab>
            <Tab value="custom" icon={<Code24Regular />}>
              Custom Speech SDK
            </Tab>
            <Tab value="directline" icon={<PlugConnected24Regular />}>
              Direct Line Speech
            </Tab>
          </TabList>

          <div className={styles.tabContent}>
            {selectedTab === 'overview' && <Overview onSelectTab={handleTabSelect} />}
            {selectedTab === 'ponyfill' && <VoicePonyfillDemo />}
            {selectedTab === 'custom' && <VoiceCustomSDKDemo />}
            {selectedTab === 'directline' && <VoiceDirectLineSpeechDemo />}
          </div>
        </Card>
      </div>
    </div>
  );
}
