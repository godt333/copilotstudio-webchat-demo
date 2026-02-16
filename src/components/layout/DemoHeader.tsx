/**
 * DemoHeader - Shared navigation header for demo pages
 * 
 * Provides consistent navigation between demo pages with:
 * - Logo/Home link
 * - Demos dropdown menu
 * - Current page indicator
 */
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
  Badge,
} from '@fluentui/react-components';
import {
  Home24Regular,
  Code24Regular,
  ChevronDown16Regular,
  Mic24Regular,
  Chat24Regular,
  PlugConnected24Regular,
  WindowNew24Regular,
  PaintBrush24Regular,
} from '@fluentui/react-icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const useStyles = makeStyles({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalXXL}`,
    backgroundColor: '#1a1a2e',
    color: 'white',
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
    ':hover': {
      opacity: 0.9,
    },
  },
  title: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightBold,
    color: 'white',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
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
  homeButton: {
    color: '#ffffff',
    fontWeight: tokens.fontWeightMedium,
    fontSize: tokens.fontSizeBase300,
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
  },
  currentPage: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: tokens.fontSizeBase300,
  },
  menuItemActive: {
    backgroundColor: 'rgba(13, 92, 99, 0.2)',
  },
});

interface DemoItem {
  label: string;
  path: string;
  description: string;
  icon: React.ReactNode;
}

const demoItems: DemoItem[] = [
  { 
    label: 'Embedded Agent (IFrame)', 
    path: '/embedded-agent', 
    description: 'Simple iframe embed',
    icon: <WindowNew24Regular />,
  },
  { 
    label: 'WebChat Demos', 
    path: '/webchat-demos', 
    description: 'Token Endpoint (Anonymous)',
    icon: <Chat24Regular />,
  },
  { 
    label: 'Agents SDK Demos', 
    path: '/AgentsSDK-demos', 
    description: 'M365 Authenticated',
    icon: <PlugConnected24Regular />,
  },
  { 
    label: 'Branding Demos', 
    path: '/branding-demos', 
    description: 'StyleOptions, StyleSet, Fluent',
    icon: <PaintBrush24Regular />,
  },
  { 
    label: 'Voice Integration Demos', 
    path: '/voice-demos', 
    description: 'Speech-to-text & TTS',
    icon: <Mic24Regular />,
  },
  { 
    label: 'Voice Demos V2', 
    path: '/voice-demos-v2', 
    description: 'Advanced Voice (THR505)',
    icon: <Mic24Regular />,
  },
];

interface DemoHeaderProps {
  title?: string;
}

const DemoHeader = ({ title }: DemoHeaderProps) => {
  const styles = useStyles();
  const navigate = useNavigate();
  const location = useLocation();

  const currentDemo = demoItems.find(item => location.pathname === item.path);

  return (
    <header className={styles.header}>
      <div className={styles.logoSection}>
        <Link to="/" className={styles.logo}>
          <Text className={styles.title}>UK Citizen Advice</Text>
        </Link>
        {currentDemo && (
          <>
            <Text style={{ color: 'rgba(255,255,255,0.5)' }}>|</Text>
            <div className={styles.currentPage}>
              {currentDemo.icon}
              <Text>{title || currentDemo.label}</Text>
            </div>
          </>
        )}
      </div>

      <div className={styles.nav}>
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
                  style={location.pathname === item.path ? { backgroundColor: 'rgba(13, 92, 99, 0.15)' } : undefined}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.icon}
                    {item.label}
                    {location.pathname === item.path && (
                      <Badge appearance="filled" color="brand" size="small">
                        Current
                      </Badge>
                    )}
                  </span>
                </MenuItem>
              ))}
            </MenuList>
          </MenuPopover>
        </Menu>

        <Button
          appearance="subtle"
          icon={<Home24Regular />}
          className={styles.homeButton}
          onClick={() => navigate('/')}
        >
          Home
        </Button>
      </div>
    </header>
  );
};

export default DemoHeader;
