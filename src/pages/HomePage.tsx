import { makeStyles, tokens, Text, Button, Card } from '@fluentui/react-components';
import {
  Money24Regular,
  Home24Regular,
  Briefcase24Regular,
  Cart24Regular,
  VehicleCar24Regular,
  Search24Regular,
  Chat24Regular,
} from '@fluentui/react-icons';
import { TopicCard } from '../components/common';

const useStyles = makeStyles({
  hero: {
    background: 'linear-gradient(135deg, #0d5c63 0%, #0a4045 100%)',
    color: 'white',
    padding: `${tokens.spacingVerticalXXXL} ${tokens.spacingHorizontalXXL}`,
    textAlign: 'center',
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  heroTitle: {
    fontWeight: tokens.fontWeightBold,
    marginBottom: tokens.spacingVerticalL,
    color: 'white',
  },
  heroSubtitle: {
    fontSize: tokens.fontSizeBase500,
    marginBottom: tokens.spacingVerticalXL,
    color: '#ffffffcc',
    lineHeight: '1.6',
  },
  searchContainer: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: '1',
    maxWidth: '400px',
    minWidth: '250px',
    padding: tokens.spacingHorizontalM,
    fontSize: tokens.fontSizeBase400,
    borderRadius: tokens.borderRadiusMedium,
    border: 'none',
    outline: 'none',
  },
  searchButton: {
    backgroundColor: '#00703c',
    ':hover': {
      backgroundColor: '#005a30',
    },
  },
  topicsSection: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: `${tokens.spacingVerticalXXXL} ${tokens.spacingHorizontalXXL}`,
  },
  sectionTitle: {
    textAlign: 'center',
    marginBottom: tokens.spacingVerticalXL,
  },
  topicsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: tokens.spacingHorizontalL,
  },
  chatCta: {
    backgroundColor: '#f3f2f1',
    padding: `${tokens.spacingVerticalXXXL} ${tokens.spacingHorizontalXXL}`,
    textAlign: 'center',
  },
  chatCtaContent: {
    maxWidth: '700px',
    margin: '0 auto',
  },
  chatCtaTitle: {
    marginBottom: tokens.spacingVerticalM,
  },
  chatCtaText: {
    color: tokens.colorNeutralForeground2,
    marginBottom: tokens.spacingVerticalL,
    fontSize: tokens.fontSizeBase400,
    lineHeight: '1.6',
  },
  featuresSection: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: `${tokens.spacingVerticalXXXL} ${tokens.spacingHorizontalXXL}`,
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: tokens.spacingHorizontalL,
  },
  featureCard: {
    padding: tokens.spacingHorizontalL,
    textAlign: 'center',
  },
  featureIcon: {
    fontSize: '48px',
    color: '#0d5c63',
    marginBottom: tokens.spacingVerticalM,
  },
  featureTitle: {
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: tokens.spacingVerticalS,
  },
  featureText: {
    color: tokens.colorNeutralForeground2,
    lineHeight: '1.5',
  },
  banner: {
    backgroundColor: '#0d5c63',
    color: 'white',
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalXXL}`,
    textAlign: 'center',
  },
  bannerText: {
    maxWidth: '800px',
    margin: '0 auto',
    fontSize: tokens.fontSizeBase300,
  },
});

const topics = [
  {
    title: 'Benefits',
    description: 'Find out about Universal Credit, housing benefit, pension credit, and other financial support you may be entitled to.',
    icon: <Money24Regular />,
    path: '/benefits',
    color: '#00703c',
  },
  {
    title: 'Housing',
    description: 'Get advice on renting, buying, homelessness, repairs, and your rights as a tenant or homeowner.',
    icon: <Home24Regular />,
    path: '/housing',
    color: '#4c2c92',
  },
  {
    title: 'Employment',
    description: 'Understand your rights at work, including pay, contracts, discrimination, and unfair dismissal.',
    icon: <Briefcase24Regular />,
    path: '/employment',
    color: '#d4351c',
  },
  {
    title: 'Consumer Rights',
    description: 'Know your rights when buying goods and services, getting refunds, and dealing with problems.',
    icon: <Cart24Regular />,
    path: '/consumer-rights',
    color: '#f47738',
  },
  {
    title: 'Traffic Appeals',
    description: 'Learn how to challenge parking tickets, speeding fines, and other motoring penalties.',
    icon: <VehicleCar24Regular />,
    path: '/traffic-appeals',
    color: '#5694ca',
  },
];

const HomePage = () => {
  const styles = useStyles();

  return (
    <div>
      <div className={styles.banner}>
        <Text className={styles.bannerText}>
          🤖 Try our new AI-powered assistant! Click the chat icon in the bottom right corner for instant advice.
        </Text>
      </div>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <Text as="h1" size={900} className={styles.heroTitle} block>
            Citizen Advice
          </Text>
          <Text className={styles.heroSubtitle} block>
            Free, confidential advice on your rights and responsibilities. We help people find a way forward, whatever problem they face.
          </Text>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search for advice..."
              className={styles.searchInput}
              aria-label="Search for advice"
            />
            <Button
              appearance="primary"
              size="large"
              icon={<Search24Regular />}
              className={styles.searchButton}
            >
              Search
            </Button>
          </div>
        </div>
      </section>

      <section className={styles.topicsSection}>
        <div className={styles.sectionTitle}>
          <Text as="h2" size={700} weight="semibold" block>
            What do you need help with?
          </Text>
          <Text size={400} style={{ color: tokens.colorNeutralForeground2 }}>
            Browse our most popular advice topics or use the chat assistant for personalized help.
          </Text>
        </div>
        <div className={styles.topicsGrid}>
          {topics.map((topic) => (
            <TopicCard key={topic.path} {...topic} />
          ))}
        </div>
      </section>

      <section className={styles.chatCta}>
        <div className={styles.chatCtaContent}>
          <Chat24Regular style={{ fontSize: 64, color: '#0d5c63', marginBottom: 16 }} />
          <Text as="h2" size={700} weight="semibold" className={styles.chatCtaTitle} block>
            Ask our AI Assistant
          </Text>
          <Text className={styles.chatCtaText} block>
            Get instant answers to your questions about benefits, housing, employment, consumer rights, and more. 
            Our AI assistant is available 24/7 and powered by Microsoft Copilot to provide accurate, up-to-date advice.
          </Text>
          <Button appearance="primary" size="large" icon={<Chat24Regular />}>
            Start a Conversation
          </Button>
        </div>
      </section>

      <section className={styles.featuresSection}>
        <div className={styles.sectionTitle}>
          <Text as="h2" size={700} weight="semibold" block>
            How we can help
          </Text>
        </div>
        <div className={styles.featuresGrid}>
          <Card className={styles.featureCard}>
            <div className={styles.featureIcon}>📚</div>
            <Text className={styles.featureTitle} size={500} block>
              Comprehensive Guides
            </Text>
            <Text className={styles.featureText}>
              Detailed step-by-step guides covering all aspects of citizen rights and responsibilities in the UK.
            </Text>
          </Card>
          <Card className={styles.featureCard}>
            <div className={styles.featureIcon}>🤖</div>
            <Text className={styles.featureTitle} size={500} block>
              AI-Powered Assistance
            </Text>
            <Text className={styles.featureText}>
              Our intelligent chatbot can answer your questions instantly, any time of day or night.
            </Text>
          </Card>
          <Card className={styles.featureCard}>
            <div className={styles.featureIcon}>✅</div>
            <Text className={styles.featureTitle} size={500} block>
              Trusted Information
            </Text>
            <Text className={styles.featureText}>
              All our advice is based on current UK law and government guidelines, regularly updated.
            </Text>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
