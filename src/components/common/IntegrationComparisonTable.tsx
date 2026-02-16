/**
 * IntegrationComparisonTable
 * 
 * Comprehensive comparison of all Copilot Studio integration approaches:
 * - IFrame (Embedded Agent)
 * - WebChat Demos (Anonymous - Token Endpoint)
 * - Agents SDK Demos (Authenticated - M365)
 */
import {
  makeStyles,
  shorthands,
  tokens,
  Text,
  Badge,
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Card,
  Title2,
} from '@fluentui/react-components';
import {
  CheckmarkCircle24Filled,
  DismissCircle24Filled,
  Circle24Regular,
  Warning24Filled,
} from '@fluentui/react-icons';
import WebChatControlsComparisonTable from './WebChatControlsComparisonTable';

const useStyles = makeStyles({
  container: {
    marginTop: tokens.spacingVerticalXXL,
    marginBottom: tokens.spacingVerticalXXL,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalL,
  },
  headerIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#e0f2fe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  tableCard: {
    ...shorthands.padding('0'),
    overflow: 'hidden',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    minWidth: '1000px',
    width: '100%',
  },
  headerCell: {
    backgroundColor: '#f8fafc',
    fontWeight: tokens.fontWeightSemibold,
    ...shorthands.padding('16px', '12px'),
    borderBottom: '2px solid #e2e8f0',
  },
  approachHeader: {
    minWidth: '180px',
  },
  featureHeader: {
    minWidth: '200px',
    backgroundColor: '#1e293b',
    color: 'white',
  },
  cell: {
    ...shorthands.padding('12px'),
    verticalAlign: 'middle',
    borderBottom: '1px solid #e2e8f0',
  },
  featureCell: {
    backgroundColor: '#f8fafc',
    fontWeight: tokens.fontWeightMedium,
  },
  approachTitle: {
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: '4px',
  },
  approachSubtitle: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  checkIcon: {
    color: '#22c55e',
  },
  crossIcon: {
    color: '#ef4444',
  },
  partialIcon: {
    color: '#f59e0b',
  },
  naIcon: {
    color: '#9ca3af',
  },
  legendContainer: {
    display: 'flex',
    gap: tokens.spacingHorizontalXL,
    marginTop: tokens.spacingVerticalL,
    flexWrap: 'wrap',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    fontSize: tokens.fontSizeBase200,
  },
  categoryRow: {
    backgroundColor: '#f1f5f9',
  },
  categoryCell: {
    fontWeight: tokens.fontWeightBold,
    color: '#475569',
    fontSize: tokens.fontSizeBase300,
  },
  noteText: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    marginTop: '2px',
  },
  badgeContainer: {
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap',
    marginTop: '4px',
  },
});

type SupportLevel = 'full' | 'partial' | 'none' | 'na';

interface FeatureSupport {
  iframe: SupportLevel;
  webchat: SupportLevel;
  agentssdk: SupportLevel;
  iframeNote?: string;
  webchatNote?: string;
  agentssdkNote?: string;
}

interface Feature {
  name: string;
  support: FeatureSupport;
}

interface FeatureCategory {
  category: string;
  features: Feature[];
}

const featureData: FeatureCategory[] = [
  {
    category: '🔐 Authentication',
    features: [
      {
        name: 'Anonymous Access',
        support: {
          iframe: 'full',
          webchat: 'full',
          agentssdk: 'none',
          iframeNote: 'Default',
          webchatNote: 'Token Endpoint',
          agentssdkNote: 'Requires Azure AD',
        },
      },
      {
        name: 'Authenticated (Azure AD)',
        support: {
          iframe: 'partial',
          webchat: 'none',
          agentssdk: 'full',
          iframeNote: 'Shows sign-in prompt',
          webchatNote: 'Not supported',
          agentssdkNote: 'MSAL integration',
        },
      },
      {
        name: 'User Identity Aware',
        support: {
          iframe: 'partial',
          webchat: 'none',
          agentssdk: 'full',
          agentssdkNote: 'Access claims & user info',
        },
      },
      {
        name: 'SSO with M365',
        support: {
          iframe: 'none',
          webchat: 'none',
          agentssdk: 'full',
        },
      },
    ],
  },
  {
    category: '🎨 UI Customization',
    features: [
      {
        name: 'StyleOptions',
        support: {
          iframe: 'none',
          webchat: 'full',
          agentssdk: 'full',
          webchatNote: 'Colors, fonts, avatars',
          agentssdkNote: 'Colors, fonts, avatars',
        },
      },
      {
        name: 'StyleSets',
        support: {
          iframe: 'none',
          webchat: 'full',
          agentssdk: 'full',
          webchatNote: 'CSS class overrides',
          agentssdkNote: 'CSS class overrides',
        },
      },
      {
        name: 'Fluent UI Theme',
        support: {
          iframe: 'none',
          webchat: 'partial',
          agentssdk: 'full',
          webchatNote: 'Manual integration',
          agentssdkNote: 'Native support',
        },
      },
      {
        name: 'Custom Branding',
        support: {
          iframe: 'none',
          webchat: 'full',
          agentssdk: 'full',
        },
      },
      {
        name: 'Custom Components',
        support: {
          iframe: 'none',
          webchat: 'full',
          agentssdk: 'full',
          webchatNote: 'Activity renderer',
          agentssdkNote: 'Activity renderer',
        },
      },
      {
        name: 'Minimizable/Widget Mode',
        support: {
          iframe: 'partial',
          webchat: 'full',
          agentssdk: 'full',
          iframeNote: 'Manual CSS',
        },
      },
    ],
  },
  {
    category: '⚙️ Advanced Features',
    features: [
      {
        name: 'Middleware',
        support: {
          iframe: 'none',
          webchat: 'full',
          agentssdk: 'full',
          webchatNote: 'createStore()',
          agentssdkNote: 'createStore()',
        },
      },
      {
        name: 'Activity Interception',
        support: {
          iframe: 'none',
          webchat: 'full',
          agentssdk: 'full',
        },
      },
      {
        name: 'Custom Send Box',
        support: {
          iframe: 'none',
          webchat: 'full',
          agentssdk: 'full',
        },
      },
      {
        name: 'Adaptive Cards',
        support: {
          iframe: 'full',
          webchat: 'full',
          agentssdk: 'full',
          iframeNote: 'Default styling',
          webchatNote: 'Customizable',
          agentssdkNote: 'Customizable',
        },
      },
      {
        name: 'Voice / Speech',
        support: {
          iframe: 'none',
          webchat: 'full',
          agentssdk: 'full',
          webchatNote: 'Cognitive Services',
          agentssdkNote: 'Cognitive Services',
        },
      },
      {
        name: 'File Attachments',
        support: {
          iframe: 'full',
          webchat: 'full',
          agentssdk: 'full',
        },
      },
    ],
  },
  {
    category: '🔧 Development',
    features: [
      {
        name: 'Setup Complexity',
        support: {
          iframe: 'full',
          webchat: 'partial',
          agentssdk: 'none',
          iframeNote: 'Copy & paste',
          webchatNote: 'npm + config',
          agentssdkNote: 'Azure AD + npm',
        },
      },
      {
        name: 'Backend Required',
        support: {
          iframe: 'full',
          webchat: 'full',
          agentssdk: 'partial',
          iframeNote: 'No',
          webchatNote: 'No (direct endpoint)',
          agentssdkNote: 'Azure AD app reg',
        },
      },
      {
        name: 'React Integration',
        support: {
          iframe: 'partial',
          webchat: 'full',
          agentssdk: 'full',
          iframeNote: 'Via iframe element',
        },
      },
      {
        name: 'Non-React / Vanilla JS',
        support: {
          iframe: 'full',
          webchat: 'full',
          agentssdk: 'partial',
          webchatNote: 'CDN + renderWebChat',
          agentssdkNote: 'Possible but complex',
        },
      },
      {
        name: 'TypeScript Support',
        support: {
          iframe: 'na',
          webchat: 'full',
          agentssdk: 'full',
        },
      },
    ],
  },
  {
    category: '📊 Data & Security',
    features: [
      {
        name: 'SharePoint Knowledge',
        support: {
          iframe: 'partial',
          webchat: 'none',
          agentssdk: 'full',
          iframeNote: 'Requires auth',
          webchatNote: 'Requires auth',
        },
      },
      {
        name: 'Dataverse Access',
        support: {
          iframe: 'partial',
          webchat: 'none',
          agentssdk: 'full',
          iframeNote: 'Requires auth',
        },
      },
      {
        name: 'Enterprise Data Sources',
        support: {
          iframe: 'partial',
          webchat: 'none',
          agentssdk: 'full',
        },
      },
      {
        name: 'Conversation Logging',
        support: {
          iframe: 'partial',
          webchat: 'full',
          agentssdk: 'full',
          iframeNote: 'Copilot Studio only',
          webchatNote: 'Custom middleware',
          agentssdkNote: 'Custom middleware',
        },
      },
    ],
  },
];

const SupportIcon = ({ level, note }: { level: SupportLevel; note?: string }) => {
  const styles = useStyles();
  
  switch (level) {
    case 'full':
      return (
        <div>
          <CheckmarkCircle24Filled className={styles.checkIcon} />
          {note && <div className={styles.noteText}>{note}</div>}
        </div>
      );
    case 'partial':
      return (
        <div>
          <Warning24Filled className={styles.partialIcon} />
          {note && <div className={styles.noteText}>{note}</div>}
        </div>
      );
    case 'none':
      return (
        <div>
          <DismissCircle24Filled className={styles.crossIcon} />
          {note && <div className={styles.noteText}>{note}</div>}
        </div>
      );
    case 'na':
      return (
        <div>
          <Circle24Regular className={styles.naIcon} />
          {note && <div className={styles.noteText}>{note}</div>}
        </div>
      );
  }
};

export default function IntegrationComparisonTable() {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerIcon}>📊</div>
        <div>
          <Title2>Integration Approaches Comparison</Title2>
          <Text style={{ color: '#64748b' }}>
            Choose the right approach based on your requirements
          </Text>
        </div>
      </div>

      {/* Comparison Table */}
      <Card className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <Table className={styles.table}>
            <TableHeader>
              <TableRow>
                <TableHeaderCell className={`${styles.headerCell} ${styles.featureHeader}`}>
                  Feature
                </TableHeaderCell>
                <TableHeaderCell className={`${styles.headerCell} ${styles.approachHeader}`}>
                  <div className={styles.approachTitle}>🖼️ IFrame Embed</div>
                  <div className={styles.approachSubtitle}>Copilot Studio Hosted</div>
                  <div className={styles.badgeContainer}>
                    <Badge appearance="filled" color="success" size="small">Simplest</Badge>
                    <Badge appearance="tint" color="informative" size="small">Anonymous</Badge>
                  </div>
                </TableHeaderCell>
                <TableHeaderCell className={`${styles.headerCell} ${styles.approachHeader}`}>
                  <div className={styles.approachTitle}>💬 WebChat Demos</div>
                  <div className={styles.approachSubtitle}>Token Endpoint</div>
                  <div className={styles.badgeContainer}>
                    <Badge appearance="filled" color="warning" size="small">Flexible</Badge>
                    <Badge appearance="tint" color="informative" size="small">Anonymous</Badge>
                  </div>
                </TableHeaderCell>
                <TableHeaderCell className={`${styles.headerCell} ${styles.approachHeader}`}>
                  <div className={styles.approachTitle}>🔐 Agents SDK Demos</div>
                  <div className={styles.approachSubtitle}>M365 Authenticated</div>
                  <div className={styles.badgeContainer}>
                    <Badge appearance="filled" color="danger" size="small">Full Control</Badge>
                    <Badge appearance="tint" color="severe" size="small">Auth Required</Badge>
                  </div>
                </TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {featureData.map((category) => (
                <>
                  {/* Category Row */}
                  <TableRow key={category.category} className={styles.categoryRow}>
                    <TableCell colSpan={4} className={`${styles.cell} ${styles.categoryCell}`}>
                      {category.category}
                    </TableCell>
                  </TableRow>
                  {/* Feature Rows */}
                  {category.features.map((feature) => (
                    <TableRow key={feature.name}>
                      <TableCell className={`${styles.cell} ${styles.featureCell}`}>
                        {feature.name}
                      </TableCell>
                      <TableCell className={styles.cell}>
                        <SupportIcon 
                          level={feature.support.iframe} 
                          note={feature.support.iframeNote} 
                        />
                      </TableCell>
                      <TableCell className={styles.cell}>
                        <SupportIcon 
                          level={feature.support.webchat} 
                          note={feature.support.webchatNote} 
                        />
                      </TableCell>
                      <TableCell className={styles.cell}>
                        <SupportIcon 
                          level={feature.support.agentssdk} 
                          note={feature.support.agentssdkNote} 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Legend */}
      <div className={styles.legendContainer}>
        <div className={styles.legendItem}>
          <CheckmarkCircle24Filled className={styles.checkIcon} />
          <span>Full Support</span>
        </div>
        <div className={styles.legendItem}>
          <Warning24Filled className={styles.partialIcon} />
          <span>Partial / Limited</span>
        </div>
        <div className={styles.legendItem}>
          <DismissCircle24Filled className={styles.crossIcon} />
          <span>Not Supported</span>
        </div>
        <div className={styles.legendItem}>
          <Circle24Regular className={styles.naIcon} />
          <span>Not Applicable</span>
        </div>
      </div>

      {/* WebChat Controls Comparison */}
      <WebChatControlsComparisonTable />
    </div>
  );
}
