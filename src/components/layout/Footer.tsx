import { makeStyles, tokens, Text, Link as FluentLink } from '@fluentui/react-components';
import { Link } from 'react-router-dom';

const useStyles = makeStyles({
  footer: {
    backgroundColor: '#f3f2f1',
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalXXL}`,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  topSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: tokens.spacingHorizontalXXL,
    paddingBottom: tokens.spacingVerticalXL,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  columnTitle: {
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: tokens.spacingVerticalS,
    color: tokens.colorNeutralForeground1,
  },
  link: {
    color: tokens.colorNeutralForeground2,
    textDecoration: 'none',
    fontSize: tokens.fontSizeBase200,
    ':hover': {
      color: tokens.colorBrandForeground1,
      textDecoration: 'underline',
    },
  },
  bottomSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: tokens.spacingVerticalL,
    flexWrap: 'wrap',
    gap: tokens.spacingVerticalM,
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  crownLogo: {
    width: '40px',
    height: '34px',
  },
  copyright: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  licenseText: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    maxWidth: '600px',
  },
  ogl: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
});

const Footer = () => {
  const styles = useStyles();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.column}>
            <Text className={styles.columnTitle}>Services</Text>
            <Link to="/benefits" className={styles.link}>Benefits</Link>
            <Link to="/housing" className={styles.link}>Housing</Link>
            <Link to="/employment" className={styles.link}>Employment</Link>
            <Link to="/consumer-rights" className={styles.link}>Consumer Rights</Link>
            <Link to="/traffic-appeals" className={styles.link}>Traffic Appeals</Link>
          </div>
          <div className={styles.column}>
            <Text className={styles.columnTitle}>Support</Text>
            <FluentLink href="#" className={styles.link}>Help Centre</FluentLink>
            <FluentLink href="#" className={styles.link}>Contact Us</FluentLink>
            <FluentLink href="#" className={styles.link}>Accessibility</FluentLink>
            <FluentLink href="#" className={styles.link}>Feedback</FluentLink>
          </div>
          <div className={styles.column}>
            <Text className={styles.columnTitle}>About</Text>
            <FluentLink href="#" className={styles.link}>About Us</FluentLink>
            <FluentLink href="#" className={styles.link}>Terms of Use</FluentLink>
            <FluentLink href="#" className={styles.link}>Privacy Policy</FluentLink>
            <FluentLink href="#" className={styles.link}>Cookies</FluentLink>
          </div>
          <div className={styles.column}>
            <Text className={styles.columnTitle}>Connect</Text>
            <FluentLink href="#" className={styles.link}>Twitter</FluentLink>
            <FluentLink href="#" className={styles.link}>Facebook</FluentLink>
            <FluentLink href="#" className={styles.link}>YouTube</FluentLink>
            <FluentLink href="#" className={styles.link}>Newsletter</FluentLink>
          </div>
        </div>
        <div className={styles.bottomSection}>
          <div className={styles.logoSection}>
            <svg
              className={styles.crownLogo}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 132 97"
              fill="#0b0c0c"
            >
              <path d="M66 0l22 44 44-22-22 44 22 22H0l22-22-22-44 44 22 22-44z" />
              <ellipse cx="66" cy="85" rx="20" ry="10" />
            </svg>
            <Text className={styles.copyright}>
              © Crown copyright
            </Text>
          </div>
          <div className={styles.ogl}>
            <Text className={styles.licenseText}>
              All content is available under the{' '}
              <FluentLink href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/">
                Open Government Licence v3.0
              </FluentLink>
              , except where otherwise stated
            </Text>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
