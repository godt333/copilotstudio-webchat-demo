import {
  makeStyles,
  tokens,
  Text,
  Button,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  MenuDivider,
} from '@fluentui/react-components';
import {
  Navigation24Regular,
  PersonCircle24Regular,
  Search24Regular,
  Code24Regular,
  ChevronDown16Regular,
} from '@fluentui/react-icons';
import { Link, useNavigate } from 'react-router-dom';

const useStyles = makeStyles({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalXXL}`,
    backgroundColor: '#0b0c0c',
    color: tokens.colorNeutralForegroundOnBrand,
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    color: 'white',
    gap: tokens.spacingHorizontalS,
  },
  govTitle: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightBold,
    color: 'white',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalL,
  },
  navLink: {
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightMedium,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderRadius: tokens.borderRadiusMedium,
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      color: '#ffffff',
      textDecoration: 'underline',
      textUnderlineOffset: '4px',
    },
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  iconButton: {
    color: 'white',
    minWidth: 'auto',
    ':hover': {
      backgroundColor: '#ffffff22',
    },
  },
  mobileMenu: {
    display: 'none',
    '@media (max-width: 768px)': {
      display: 'block',
    },
  },
  desktopNav: {
    '@media (max-width: 768px)': {
      display: 'none',
    },
  },
  demosButton: {
    color: '#ffffff',
    fontWeight: tokens.fontWeightMedium,
    fontSize: tokens.fontSizeBase300,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: 'rgba(13, 92, 99, 0.6)',
    ':hover': {
      backgroundColor: 'rgba(13, 92, 99, 0.9)',
    },
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
});

const Header = () => {
  const styles = useStyles();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Benefits', path: '/benefits' },
    { label: 'Housing', path: '/housing' },
    { label: 'Employment', path: '/employment' },
    { label: 'Consumer Rights', path: '/consumer-rights' },
    { label: 'Traffic Appeals', path: '/traffic-appeals' },
  ];

  const demoItems = [
    { label: 'Embedded Agent (IFrame)', path: '/embedded-agent', description: 'Simple iframe embed approach' },
    { label: 'WebChat Demos (Anonymous)', path: '/webchat-demos', description: 'Token Endpoint integration' },
    { label: 'Agents SDK Demos (Auth)', path: '/AgentsSDK-demos', description: 'M365 Agents SDK integration' },
    { label: 'Voice Integration Demos', path: '/voice-demos', description: 'Speech-to-text options' },
    { label: 'Voice Demos v2', path: '/voice-demos-v2', description: 'Advanced voice integration' },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.logoSection}>
        <Link to="/" className={styles.logo}>
          <Text className={styles.govTitle}>UK Citizen Advice</Text>
        </Link>
      </div>

      <nav className={`${styles.nav} ${styles.desktopNav}`}>
        {navItems.map((item) => (
          <Link key={item.path} to={item.path} className={styles.navLink}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className={styles.actions}>
        {/* Demos Dropdown Menu */}
        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <Button
              appearance="subtle"
              className={styles.demosButton}
              icon={<Code24Regular />}
            >
              Demos
              <ChevronDown16Regular />
            </Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              {demoItems.map((item) => (
                <MenuItem 
                  key={item.path} 
                  onClick={() => navigate(item.path)}
                  secondaryContent={item.description}
                >
                  {item.label}
                </MenuItem>
              ))}
            </MenuList>
          </MenuPopover>
        </Menu>

        <Button
          appearance="subtle"
          icon={<Search24Regular />}
          className={styles.iconButton}
          aria-label="Search"
        />
        <Button
          appearance="subtle"
          icon={<PersonCircle24Regular />}
          className={styles.iconButton}
          aria-label="Account"
        />

        <div className={styles.mobileMenu}>
          <Menu>
            <MenuTrigger>
              <Button
                appearance="subtle"
                icon={<Navigation24Regular />}
                className={styles.iconButton}
                aria-label="Menu"
              />
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                {navItems.map((item) => (
                  <MenuItem key={item.path} onClick={() => navigate(item.path)}>
                    {item.label}
                  </MenuItem>
                ))}
                <MenuDivider />
                {demoItems.map((item) => (
                  <MenuItem key={item.path} onClick={() => navigate(item.path)}>
                    {item.label}
                  </MenuItem>
                ))}
              </MenuList>
            </MenuPopover>
          </Menu>
        </div>
      </div>
    </header>
  );
};

export default Header;
