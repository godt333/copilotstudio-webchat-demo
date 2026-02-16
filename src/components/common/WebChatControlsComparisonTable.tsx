/**
 * WebChatControlsComparisonTable
 * 
 * Comparison of different WebChat controls/components:
 * - CDN renderWebChat() - Vanilla JS function via window.WebChat.renderWebChat()
 * - ReactWebChat - React component from botframework-webchat npm package  
 * - npm renderWebChat() - Advanced imperative API for React apps
 * - BasicWebChat - Low-level component for UI recomposition (advanced)
 * 
 * FluentThemeProvider is a WRAPPER (from botframework-webchat-fluent-theme) that 
 * wraps ReactWebChat to apply Fluent UI styling - it's not a control itself.
 * 
 * Middleware (createStore) is an ENHANCEMENT that works with ALL controls.
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
  Title3,
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components';
import {
  CheckmarkCircle24Filled,
  DismissCircle24Filled,
  Warning24Filled,
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  container: {
    marginTop: tokens.spacingVerticalXL,
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
    backgroundColor: '#dbeafe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  tableCard: {
    ...shorthands.padding('0'),
    overflow: 'hidden',
    marginBottom: tokens.spacingVerticalL,
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
    ...shorthands.padding('14px', '12px'),
    borderBottom: '2px solid #e2e8f0',
    verticalAlign: 'top',
  },
  controlHeader: {
    minWidth: '160px',
  },
  featureHeader: {
    minWidth: '180px',
    backgroundColor: '#1e293b',
    color: 'white',
  },
  cell: {
    ...shorthands.padding('10px', '12px'),
    verticalAlign: 'middle',
    borderBottom: '1px solid #e2e8f0',
    fontSize: tokens.fontSizeBase200,
  },
  featureCell: {
    backgroundColor: '#f8fafc',
    fontWeight: tokens.fontWeightMedium,
  },
  controlTitle: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
    marginBottom: '2px',
  },
  controlSubtitle: {
    fontSize: tokens.fontSizeBase100,
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
  categoryRow: {
    backgroundColor: '#f1f5f9',
  },
  categoryCell: {
    fontWeight: tokens.fontWeightBold,
    color: '#475569',
    fontSize: tokens.fontSizeBase200,
  },
  noteText: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
    marginTop: '2px',
  },
  badgeContainer: {
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap',
    marginTop: '4px',
  },
  legendContainer: {
    display: 'flex',
    gap: tokens.spacingHorizontalXL,
    marginTop: tokens.spacingVerticalM,
    marginBottom: tokens.spacingVerticalL,
    flexWrap: 'wrap',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    fontSize: tokens.fontSizeBase200,
  },
  recommendationCard: {
    ...shorthands.padding(tokens.spacingHorizontalL),
    marginTop: tokens.spacingVerticalL,
  },
  recommendationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: tokens.spacingHorizontalL,
    marginTop: tokens.spacingVerticalM,
  },
  recommendationItem: {
    ...shorthands.padding(tokens.spacingHorizontalM),
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: '#f8fafc',
    borderLeft: '4px solid',
  },
  recTitle: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
    marginBottom: '4px',
  },
  recDescription: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
  },
  infoNote: {
    marginBottom: tokens.spacingVerticalL,
  },
  fluentNote: {
    marginBottom: tokens.spacingVerticalM,
    backgroundColor: '#f0f9ff',
  },
});

type SupportLevel = 'full' | 'partial' | 'none';

interface ControlFeature {
  name: string;
  cdnRenderWebChat: { level: SupportLevel; note?: string };
  reactWebChat: { level: SupportLevel; note?: string };
  npmRenderWebChat: { level: SupportLevel; note?: string };
  basicWebChat: { level: SupportLevel; note?: string };
}

interface FeatureCategory {
  category: string;
  features: ControlFeature[];
}

const featureData: FeatureCategory[] = [
  {
    category: '🛠️ Setup & Environment',
    features: [
      {
        name: 'Works without React',
        cdnRenderWebChat: { level: 'full', note: 'Vanilla JS/HTML' },
        reactWebChat: { level: 'none', note: 'Requires React' },
        npmRenderWebChat: { level: 'none', note: 'Requires React' },
        basicWebChat: { level: 'none', note: 'Requires React' },
      },
      {
        name: 'React 18+ Compatible',
        cdnRenderWebChat: { level: 'partial', note: 'Can conflict' },
        reactWebChat: { level: 'full' },
        npmRenderWebChat: { level: 'partial', note: 'Uses legacy API' },
        basicWebChat: { level: 'full' },
      },
      {
        name: 'No npm Install Required',
        cdnRenderWebChat: { level: 'full', note: 'CDN script tag' },
        reactWebChat: { level: 'none' },
        npmRenderWebChat: { level: 'none' },
        basicWebChat: { level: 'none' },
      },
      {
        name: 'TypeScript Support',
        cdnRenderWebChat: { level: 'none' },
        reactWebChat: { level: 'full' },
        npmRenderWebChat: { level: 'full' },
        basicWebChat: { level: 'full' },
      },
      {
        name: 'Package Source',
        cdnRenderWebChat: { level: 'full', note: 'webchat.js CDN' },
        reactWebChat: { level: 'full', note: 'botframework-webchat' },
        npmRenderWebChat: { level: 'full', note: 'botframework-webchat' },
        basicWebChat: { level: 'full', note: 'webchat-component' },
      },
    ],
  },
  {
    category: '🎨 Styling & Theming',
    features: [
      {
        name: 'styleOptions',
        cdnRenderWebChat: { level: 'full' },
        reactWebChat: { level: 'full' },
        npmRenderWebChat: { level: 'full' },
        basicWebChat: { level: 'full' },
      },
      {
        name: 'styleSets (CSS Classes)',
        cdnRenderWebChat: { level: 'full' },
        reactWebChat: { level: 'full' },
        npmRenderWebChat: { level: 'full' },
        basicWebChat: { level: 'full' },
      },
      {
        name: 'FluentThemeProvider*',
        cdnRenderWebChat: { level: 'none' },
        reactWebChat: { level: 'full', note: 'Wrap component' },
        npmRenderWebChat: { level: 'partial' },
        basicWebChat: { level: 'full', note: 'Wrap component' },
      },
      {
        name: 'Custom Branding',
        cdnRenderWebChat: { level: 'full' },
        reactWebChat: { level: 'full' },
        npmRenderWebChat: { level: 'full' },
        basicWebChat: { level: 'full' },
      },
    ],
  },
  {
    category: '⚙️ Features & Customization',
    features: [
      {
        name: 'Middleware (createStore)',
        cdnRenderWebChat: { level: 'full', note: 'window.WebChat' },
        reactWebChat: { level: 'full' },
        npmRenderWebChat: { level: 'full' },
        basicWebChat: { level: 'full' },
      },
      {
        name: 'Activity Interception',
        cdnRenderWebChat: { level: 'full' },
        reactWebChat: { level: 'full' },
        npmRenderWebChat: { level: 'full' },
        basicWebChat: { level: 'full' },
      },
      {
        name: 'Custom Activity Renderer',
        cdnRenderWebChat: { level: 'partial', note: 'More complex' },
        reactWebChat: { level: 'full' },
        npmRenderWebChat: { level: 'full' },
        basicWebChat: { level: 'full' },
      },
      {
        name: 'Custom Attachment Renderer',
        cdnRenderWebChat: { level: 'partial' },
        reactWebChat: { level: 'full' },
        npmRenderWebChat: { level: 'full' },
        basicWebChat: { level: 'full' },
      },
      {
        name: 'Hooks (useActivities, etc.)',
        cdnRenderWebChat: { level: 'none' },
        reactWebChat: { level: 'full' },
        npmRenderWebChat: { level: 'partial' },
        basicWebChat: { level: 'full' },
      },
      {
        name: 'UI Recomposition',
        cdnRenderWebChat: { level: 'none' },
        reactWebChat: { level: 'partial' },
        npmRenderWebChat: { level: 'partial' },
        basicWebChat: { level: 'full', note: 'Full control' },
      },
      {
        name: 'Adaptive Cards',
        cdnRenderWebChat: { level: 'full' },
        reactWebChat: { level: 'full' },
        npmRenderWebChat: { level: 'full' },
        basicWebChat: { level: 'full' },
      },
    ],
  },
  {
    category: '📊 Use Case Fit',
    features: [
      {
        name: 'Setup Complexity',
        cdnRenderWebChat: { level: 'full', note: 'Simplest' },
        reactWebChat: { level: 'full', note: 'Easy' },
        npmRenderWebChat: { level: 'partial', note: 'Medium' },
        basicWebChat: { level: 'none', note: 'Advanced' },
      },
      {
        name: 'Quick Prototype',
        cdnRenderWebChat: { level: 'full' },
        reactWebChat: { level: 'full' },
        npmRenderWebChat: { level: 'partial' },
        basicWebChat: { level: 'none' },
      },
      {
        name: 'Production React App',
        cdnRenderWebChat: { level: 'none' },
        reactWebChat: { level: 'full' },
        npmRenderWebChat: { level: 'partial' },
        basicWebChat: { level: 'full', note: 'For advanced' },
      },
      {
        name: 'Non-React Website',
        cdnRenderWebChat: { level: 'full' },
        reactWebChat: { level: 'none' },
        npmRenderWebChat: { level: 'none' },
        basicWebChat: { level: 'none' },
      },
      {
        name: 'Custom UI Layout',
        cdnRenderWebChat: { level: 'none' },
        reactWebChat: { level: 'partial' },
        npmRenderWebChat: { level: 'partial' },
        basicWebChat: { level: 'full', note: 'Best choice' },
      },
    ],
  },
];

const SupportIcon = ({ level, note }: { level: SupportLevel; note?: string }) => {
  const styles = useStyles();
  
  const icons = {
    full: <CheckmarkCircle24Filled className={styles.checkIcon} />,
    partial: <Warning24Filled className={styles.partialIcon} />,
    none: <DismissCircle24Filled className={styles.crossIcon} />,
  };

  return (
    <div>
      {icons[level]}
      {note && <div className={styles.noteText}>{note}</div>}
    </div>
  );
};

export default function WebChatControlsComparisonTable() {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerIcon}>🎛️</div>
        <div>
          <Title2>WebChat Controls Comparison</Title2>
          <Text style={{ color: '#64748b' }}>
            Compare the 4 main WebChat controls and their capabilities
          </Text>
        </div>
      </div>

      {/* Middleware Note */}
      <MessageBar intent="info" className={styles.infoNote}>
        <MessageBarBody>
          <strong>💡 Note about Middleware:</strong> The <code>createStore()</code> middleware is an <strong>enhancement</strong>, 
          not a separate control. It can be used with <strong>all four</strong> WebChat controls to intercept activities, 
          add logging, or customize behavior.
        </MessageBarBody>
      </MessageBar>

      {/* FluentThemeProvider Note */}
      <MessageBar intent="info" className={styles.fluentNote}>
        <MessageBarBody>
          <strong>✨ FluentThemeProvider:</strong> This is a <strong>wrapper component</strong> from <code>botframework-webchat-fluent-theme</code> 
          that wraps <code>ReactWebChat</code> or <code>BasicWebChat</code> to apply Fluent UI / Copilot styling. 
          It is not a control itself - it enhances the controls marked with * in the table.
        </MessageBarBody>
      </MessageBar>

      {/* Comparison Table */}
      <Card className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <Table className={styles.table}>
            <TableHeader>
              <TableRow>
                <TableHeaderCell className={`${styles.headerCell} ${styles.featureHeader}`}>
                  Feature
                </TableHeaderCell>
                <TableHeaderCell className={`${styles.headerCell} ${styles.controlHeader}`}>
                  <div className={styles.controlTitle}>🌐 CDN renderWebChat</div>
                  <div className={styles.controlSubtitle}>window.WebChat.renderWebChat()</div>
                  <div className={styles.badgeContainer}>
                    <Badge appearance="filled" color="success" size="small">Vanilla JS</Badge>
                    <Badge appearance="tint" color="informative" size="small">No Build</Badge>
                  </div>
                </TableHeaderCell>
                <TableHeaderCell className={`${styles.headerCell} ${styles.controlHeader}`}>
                  <div className={styles.controlTitle}>⚛️ ReactWebChat</div>
                  <div className={styles.controlSubtitle}>&lt;ReactWebChat /&gt; component</div>
                  <div className={styles.badgeContainer}>
                    <Badge appearance="filled" color="brand" size="small">Standard</Badge>
                    <Badge appearance="tint" color="informative" size="small">React</Badge>
                  </div>
                </TableHeaderCell>
                <TableHeaderCell className={`${styles.headerCell} ${styles.controlHeader}`}>
                  <div className={styles.controlTitle}>🎯 npm renderWebChat</div>
                  <div className={styles.controlSubtitle}>renderWebChat() function</div>
                  <div className={styles.badgeContainer}>
                    <Badge appearance="filled" color="warning" size="small">Imperative</Badge>
                    <Badge appearance="tint" color="informative" size="small">Legacy</Badge>
                  </div>
                </TableHeaderCell>
                <TableHeaderCell className={`${styles.headerCell} ${styles.controlHeader}`}>
                  <div className={styles.controlTitle}>🔧 BasicWebChat</div>
                  <div className={styles.controlSubtitle}>&lt;Composer&gt; + Components</div>
                  <div className={styles.badgeContainer}>
                    <Badge appearance="filled" color="severe" size="small">Advanced</Badge>
                    <Badge appearance="tint" color="informative" size="small">Recompose</Badge>
                  </div>
                </TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {featureData.map((category) => (
                <>
                  <TableRow key={category.category} className={styles.categoryRow}>
                    <TableCell colSpan={5} className={`${styles.cell} ${styles.categoryCell}`}>
                      {category.category}
                    </TableCell>
                  </TableRow>
                  {category.features.map((feature) => (
                    <TableRow key={feature.name}>
                      <TableCell className={`${styles.cell} ${styles.featureCell}`}>
                        {feature.name}
                      </TableCell>
                      <TableCell className={styles.cell}>
                        <SupportIcon level={feature.cdnRenderWebChat.level} note={feature.cdnRenderWebChat.note} />
                      </TableCell>
                      <TableCell className={styles.cell}>
                        <SupportIcon level={feature.reactWebChat.level} note={feature.reactWebChat.note} />
                      </TableCell>
                      <TableCell className={styles.cell}>
                        <SupportIcon level={feature.npmRenderWebChat.level} note={feature.npmRenderWebChat.note} />
                      </TableCell>
                      <TableCell className={styles.cell}>
                        <SupportIcon level={feature.basicWebChat.level} note={feature.basicWebChat.note} />
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
      </div>

      {/* Recommendations */}
      <Card className={styles.recommendationCard}>
        <Title3>📋 Which Control Should You Use?</Title3>
        <div className={styles.recommendationGrid}>
          <div className={styles.recommendationItem} style={{ borderLeftColor: '#22c55e' }}>
            <div className={styles.recTitle}>🚀 Quick Demo / Non-React</div>
            <div className={styles.recDescription}>
              Use <strong>CDN renderWebChat</strong>. Works with any website - WordPress, static HTML, SharePoint.
            </div>
          </div>
          <div className={styles.recommendationItem} style={{ borderLeftColor: '#3b82f6' }}>
            <div className={styles.recTitle}>⚛️ Standard React App</div>
            <div className={styles.recDescription}>
              Use <strong>ReactWebChat</strong> component. Good balance of simplicity and customization.
            </div>
          </div>
          <div className={styles.recommendationItem} style={{ borderLeftColor: '#f59e0b' }}>
            <div className={styles.recTitle}>🎯 Legacy/Imperative API</div>
            <div className={styles.recDescription}>
              Use <strong>npm renderWebChat</strong> for imperative rendering. Note: uses legacy ReactDOM.render().
            </div>
          </div>
          <div className={styles.recommendationItem} style={{ borderLeftColor: '#8b5cf6' }}>
            <div className={styles.recTitle}>🔧 Custom UI Layout</div>
            <div className={styles.recDescription}>
              Use <strong>BasicWebChat</strong> with Composer for full UI recomposition and custom layouts.
            </div>
          </div>
          <div className={styles.recommendationItem} style={{ borderLeftColor: '#ec4899' }}>
            <div className={styles.recTitle}>✨ Fluent UI / Copilot Style</div>
            <div className={styles.recDescription}>
              Wrap <strong>ReactWebChat</strong> or <strong>BasicWebChat</strong> with <strong>FluentThemeProvider</strong>.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
