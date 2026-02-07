import { makeStyles, tokens } from '@fluentui/react-components';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CopilotStudioChat from '../chat/CopilotStudioChat';

const useStyles = makeStyles({
  layout: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  main: {
    flex: 1,
    backgroundColor: tokens.colorNeutralBackground2,
  },
});

const Layout = () => {
  const styles = useStyles();

  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
      <CopilotStudioChat />
    </div>
  );
};

export default Layout;
