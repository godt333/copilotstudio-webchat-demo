/**
 * Embedded Agent (IFrame) Page
 * 
 * Demonstrates the simplest way to embed a Copilot Studio agent
 * using the iframe embed code approach.
 */
import {
  makeStyles,
  shorthands,
  tokens,
  Text,
  Card,
  Title1,
  Title2,
  Body1,
  Badge,
} from '@fluentui/react-components';
import {
  WindowNew24Regular,
  Checkmark24Regular,
  Dismiss24Regular,
  Info24Regular,
  Code24Regular,
  Lightbulb24Regular,
} from '@fluentui/react-icons';
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
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: tokens.spacingHorizontalXL,
    '@media (max-width: 1024px)': {
      gridTemplateColumns: '1fr',
    },
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  card: {
    ...shorthands.padding(tokens.spacingHorizontalL),
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalM,
  },
  prosConsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: tokens.spacingHorizontalL,
    marginTop: tokens.spacingVerticalM,
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
  prosCard: {
    backgroundColor: '#f0fdf4',
    ...shorthands.borderLeft('4px', 'solid', '#22c55e'),
    ...shorthands.padding(tokens.spacingHorizontalM),
    borderRadius: tokens.borderRadiusMedium,
  },
  consCard: {
    backgroundColor: '#fef2f2',
    ...shorthands.borderLeft('4px', 'solid', '#ef4444'),
    ...shorthands.padding(tokens.spacingHorizontalM),
    borderRadius: tokens.borderRadiusMedium,
  },
  listTitle: {
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: tokens.spacingVerticalS,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  list: {
    listStyle: 'none',
    ...shorthands.padding('0'),
    ...shorthands.margin('0'),
    '& li': {
      display: 'flex',
      alignItems: 'flex-start',
      gap: tokens.spacingHorizontalS,
      marginBottom: tokens.spacingVerticalXS,
      fontSize: tokens.fontSizeBase200,
    },
  },
  checkIcon: {
    color: '#22c55e',
    flexShrink: 0,
    marginTop: '2px',
  },
  crossIcon: {
    color: '#ef4444',
    flexShrink: 0,
    marginTop: '2px',
  },
  codeBlock: {
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    ...shorthands.padding(tokens.spacingHorizontalM),
    borderRadius: tokens.borderRadiusMedium,
    fontFamily: 'Consolas, Monaco, monospace',
    fontSize: '13px',
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
  iframeContainer: {
    width: '100%',
    height: '500px',
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
    borderRadius: tokens.borderRadiusMedium,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  iframe: {
    width: '100%',
    height: '100%',
    ...shorthands.border('none'),
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    ...shorthands.borderLeft('4px', 'solid', '#3b82f6'),
    ...shorthands.padding(tokens.spacingHorizontalM),
    borderRadius: tokens.borderRadiusMedium,
    marginTop: tokens.spacingVerticalM,
  },
  infoTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: tokens.spacingVerticalXS,
    color: '#1d4ed8',
  },
  stepsList: {
    counterReset: 'step',
    listStyle: 'none',
    ...shorthands.padding('0'),
    ...shorthands.margin('0'),
    '& li': {
      counterIncrement: 'step',
      display: 'flex',
      alignItems: 'flex-start',
      gap: tokens.spacingHorizontalM,
      marginBottom: tokens.spacingVerticalM,
      '&::before': {
        content: 'counter(step)',
        backgroundColor: '#0078d4',
        color: 'white',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 'bold',
        flexShrink: 0,
      },
    },
  },
  tipBox: {
    backgroundColor: '#fefce8',
    ...shorthands.borderLeft('4px', 'solid', '#eab308'),
    ...shorthands.padding(tokens.spacingHorizontalM),
    borderRadius: tokens.borderRadiusMedium,
    marginTop: tokens.spacingVerticalM,
  },
  tipTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: tokens.spacingVerticalXS,
    color: '#a16207',
  },
});

// Replace this with your actual Copilot Studio iframe URL
const IFRAME_URL = 'https://copilotstudio.microsoft.com/environments/1ff773fc-c7de-ee40-939e-6d65bfe58f18/bots/copilots_header_79c18/webchat?__version__=2';

const EmbeddedAgentPage = () => {
  const styles = useStyles();

  const embedCode = `<!DOCTYPE html>
<html>
<body>
  <iframe 
    src="${IFRAME_URL}" 
    frameborder="0" 
    style="width: 100%; height: 100%;">
  </iframe>
</body>
</html>`;

  return (
    <div className={styles.page}>
      <DemoHeader />
      
      {/* Page Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Title1 className={styles.headerTitle}>
            <WindowNew24Regular style={{ marginRight: '12px' }} />
            Embedded Agent (IFrame)
            <Badge 
              appearance="filled" 
              color="success" 
              className={styles.badge}
            >
              Simplest
            </Badge>
          </Title1>
          <Body1 className={styles.headerSubtitle}>
            The quickest way to embed a Copilot Studio agent into any web page. 
            Simply copy and paste the iframe code from Copilot Studio - no backend required.
          </Body1>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.container}>
        <div className={styles.contentGrid}>
          {/* Left Column - Information */}
          <div className={styles.leftColumn}>
            {/* Overview Card */}
            <Card className={styles.card}>
              <div className={styles.cardTitle}>
                <Info24Regular />
                <Title2>Overview</Title2>
              </div>
              <Body1>
                The iframe embed approach is Microsoft's recommended method for quickly 
                adding a Copilot Studio agent to any website. It requires zero coding 
                knowledge and works with any web platform including WordPress, Wix, 
                Squarespace, or custom HTML sites.
              </Body1>

              {/* Pros and Cons */}
              <div className={styles.prosConsGrid}>
                <div className={styles.prosCard}>
                  <div className={styles.listTitle}>
                    <Checkmark24Regular />
                    Pros
                  </div>
                  <ul className={styles.list}>
                    <li>
                      <Checkmark24Regular className={styles.checkIcon} style={{ fontSize: '14px' }} />
                      <span>Zero backend setup required</span>
                    </li>
                    <li>
                      <Checkmark24Regular className={styles.checkIcon} style={{ fontSize: '14px' }} />
                      <span>Copy & paste implementation</span>
                    </li>
                    <li>
                      <Checkmark24Regular className={styles.checkIcon} style={{ fontSize: '14px' }} />
                      <span>Auto-updates with Copilot Studio</span>
                    </li>
                    <li>
                      <Checkmark24Regular className={styles.checkIcon} style={{ fontSize: '14px' }} />
                      <span>Works on any website platform</span>
                    </li>
                    <li>
                      <Checkmark24Regular className={styles.checkIcon} style={{ fontSize: '14px' }} />
                      <span>Microsoft-hosted infrastructure</span>
                    </li>
                  </ul>
                </div>

                <div className={styles.consCard}>
                  <div className={styles.listTitle}>
                    <Dismiss24Regular />
                    Cons
                  </div>
                  <ul className={styles.list}>
                    <li>
                      <Dismiss24Regular className={styles.crossIcon} style={{ fontSize: '14px' }} />
                      <span>No UI customization</span>
                    </li>
                    <li>
                      <Dismiss24Regular className={styles.crossIcon} style={{ fontSize: '14px' }} />
                      <span>Limited branding options</span>
                    </li>
                    <li>
                      <Dismiss24Regular className={styles.crossIcon} style={{ fontSize: '14px' }} />
                      <span>No access to conversation events</span>
                    </li>
                    <li>
                      <Dismiss24Regular className={styles.crossIcon} style={{ fontSize: '14px' }} />
                      <span>Cannot add custom middleware</span>
                    </li>
                    <li>
                      <Dismiss24Regular className={styles.crossIcon} style={{ fontSize: '14px' }} />
                      <span>Fixed chat experience</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* How to Get Your Code */}
            <Card className={styles.card}>
              <div className={styles.cardTitle}>
                <Code24Regular />
                <Title2>How to Get Your Embed Code</Title2>
              </div>
              <ol className={styles.stepsList}>
                <li>
                  <div>
                    <Text weight="semibold">Open Copilot Studio</Text>
                    <Body1>Navigate to your agent in Copilot Studio</Body1>
                  </div>
                </li>
                <li>
                  <div>
                    <Text weight="semibold">Go to Channels</Text>
                    <Body1>Click on "Channels" in the left sidebar</Body1>
                  </div>
                </li>
                <li>
                  <div>
                    <Text weight="semibold">Select Web App</Text>
                    <Body1>Choose "Web app" under "Other channels"</Body1>
                  </div>
                </li>
                <li>
                  <div>
                    <Text weight="semibold">Copy Embed Code</Text>
                    <Body1>Copy the iframe code snippet provided</Body1>
                  </div>
                </li>
                <li>
                  <div>
                    <Text weight="semibold">Paste in Your Website</Text>
                    <Body1>Add the code to your HTML page</Body1>
                  </div>
                </li>
              </ol>
            </Card>

            {/* Code Sample */}
            <Card className={styles.card}>
              <div className={styles.cardTitle}>
                <Code24Regular />
                <Title2>Embed Code</Title2>
              </div>
              <pre className={styles.codeBlock}>{embedCode}</pre>

              <div className={styles.tipBox}>
                <div className={styles.tipTitle}>
                  <Lightbulb24Regular />
                  Tip
                </div>
                <Body1>
                  Adjust the <code>width</code> and <code>height</code> styles to fit 
                  your page layout. You can use percentage values like <code>100%</code> or 
                  fixed pixel values like <code>400px</code>.
                </Body1>
              </div>
            </Card>
          </div>

          {/* Right Column - Live Demo */}
          <div className={styles.rightColumn}>
            <Card className={styles.card}>
              <div className={styles.cardTitle}>
                <WindowNew24Regular />
                <Title2>Live Demo</Title2>
                <Badge appearance="tint" color="informative">
                  Anonymous Auth
                </Badge>
              </div>
              <Body1 style={{ marginBottom: tokens.spacingVerticalM }}>
                This is a live embedded Copilot Studio agent using the iframe approach. 
                Try chatting with it!
              </Body1>
              <div className={styles.iframeContainer}>
                <iframe
                  className={styles.iframe}
                  src={IFRAME_URL}
                  title="Copilot Studio Agent"
                  allow="microphone"
                />
              </div>

              <div className={styles.infoBox}>
                <div className={styles.infoTitle}>
                  <Info24Regular />
                  Note
                </div>
                <Body1>
                  This demo uses anonymous authentication. The agent is configured in 
                  Copilot Studio to not require end user authentication, which means 
                  anyone can chat with it without signing in.
                </Body1>
              </div>
            </Card>

            {/* When to Use */}
            <Card className={styles.card}>
              <div className={styles.cardTitle}>
                <Lightbulb24Regular />
                <Title2>When to Use This Approach</Title2>
              </div>
              <ul className={styles.list} style={{ marginTop: tokens.spacingVerticalS }}>
                <li>
                  <Checkmark24Regular className={styles.checkIcon} />
                  <span>Quick prototypes and demos</span>
                </li>
                <li>
                  <Checkmark24Regular className={styles.checkIcon} />
                  <span>Internal portals with basic chat needs</span>
                </li>
                <li>
                  <Checkmark24Regular className={styles.checkIcon} />
                  <span>Non-technical teams who need to add chat</span>
                </li>
                <li>
                  <Checkmark24Regular className={styles.checkIcon} />
                  <span>When default Copilot Studio UI is acceptable</span>
                </li>
                <li>
                  <Checkmark24Regular className={styles.checkIcon} />
                  <span>Platforms without backend access (Wix, WordPress)</span>
                </li>
              </ul>

              <div className={styles.tipBox}>
                <div className={styles.tipTitle}>
                  <Lightbulb24Regular />
                  Need More Control?
                </div>
                <Body1>
                  If you need custom styling, branding, or advanced features like 
                  middleware, check out the <strong>WebChat Demos</strong> or 
                  <strong> Agents SDK Demos</strong> for more powerful integration options.
                </Body1>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmbeddedAgentPage;
