import { makeStyles, tokens, Text, Card, Button, Accordion, AccordionItem, AccordionHeader, AccordionPanel } from '@fluentui/react-components';
import { PageHeader, InfoCard } from '../components/common';
import {
  Home24Regular,
  Shield24Regular,
  Warning24Regular,
  ArrowRight24Regular,
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalXXL}`,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: tokens.spacingHorizontalXL,
    '@media (max-width: 900px)': {
      gridTemplateColumns: '1fr',
    },
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  section: {
    marginBottom: tokens.spacingVerticalXL,
  },
  sectionTitle: {
    marginBottom: tokens.spacingVerticalM,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  card: {
    padding: tokens.spacingHorizontalL,
  },
  paragraph: {
    lineHeight: '1.7',
    marginBottom: tokens.spacingVerticalM,
    color: tokens.colorNeutralForeground1,
  },
  list: {
    paddingLeft: tokens.spacingHorizontalL,
    marginBottom: tokens.spacingVerticalM,
  },
  listItem: {
    lineHeight: '1.7',
    marginBottom: tokens.spacingVerticalS,
  },
  rightBox: {
    backgroundColor: '#e8f5e9',
    borderLeft: '4px solid #00703c',
    padding: tokens.spacingHorizontalL,
    marginBottom: tokens.spacingVerticalL,
  },
  warningBox: {
    backgroundColor: '#fef3f2',
    borderLeft: '4px solid #d4351c',
    padding: tokens.spacingHorizontalL,
    marginBottom: tokens.spacingVerticalL,
  },
  topicCard: {
    padding: tokens.spacingHorizontalL,
    marginBottom: tokens.spacingVerticalM,
    cursor: 'pointer',
    transition: 'box-shadow 0.2s',
    ':hover': {
      boxShadow: tokens.shadow8,
    },
  },
  topicTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalS,
  },
  ctaButton: {
    marginTop: tokens.spacingVerticalM,
  },
});

const HousingPage = () => {
  const styles = useStyles();

  const tenantRights = [
    'Live in a property that\'s safe and in a good state of repair',
    'Have your deposit protected in a government-approved scheme',
    'Challenge excessively high charges',
    'Know who your landlord is',
    'Live in the property undisturbed',
    'Be protected from unfair eviction and unfair rent',
    'Have a written agreement if you have a fixed-term tenancy of more than 3 years',
    'Get at least 24 hours\' notice before your landlord visits',
  ];

  const landlordResponsibilities = [
    'Keep the property safe and free from health hazards',
    'Make sure all gas and electrical equipment is safely installed and maintained',
    'Provide an Energy Performance Certificate',
    'Protect your deposit in a government-approved scheme',
    'Give you a copy of the "How to rent" checklist',
  ];

  return (
    <div>
      <PageHeader
        title="Housing"
        description="Get advice on renting, buying, repairs, homelessness, and understanding your rights as a tenant or homeowner."
        breadcrumbs={[{ label: 'Housing' }]}
      />

      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.mainContent}>
            <Card className={styles.card}>
              <div className={styles.section}>
                <Text as="h2" size={600} weight="semibold" className={styles.sectionTitle}>
                  <Home24Regular /> Your Rights as a Tenant
                </Text>
                <Text className={styles.paragraph}>
                  As a tenant in England and Wales, you have important rights that your landlord must respect. 
                  Whether you're in private rented housing, social housing, or a house share, knowing your 
                  rights can help you resolve problems and protect yourself.
                </Text>
              </div>

              <div className={styles.rightBox}>
                <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalS }}>
                  <Shield24Regular /> Key Tenant Rights
                </Text>
                <ul className={styles.list}>
                  {tenantRights.map((right, index) => (
                    <li key={index} className={styles.listItem}>{right}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.section}>
                <Text as="h2" size={600} weight="semibold" className={styles.sectionTitle}>
                  Landlord Responsibilities
                </Text>
                <Text className={styles.paragraph}>
                  Your landlord has legal obligations to ensure your home is safe and habitable. 
                  They must:
                </Text>
                <ul className={styles.list}>
                  {landlordResponsibilities.map((resp, index) => (
                    <li key={index} className={styles.listItem}>{resp}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.warningBox}>
                <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalS }}>
                  <Warning24Regular /> Facing Eviction?
                </Text>
                <Text>
                  If your landlord wants you to leave, they must follow the correct legal process. 
                  You cannot be forced out without a court order. Get advice immediately if you receive 
                  an eviction notice.
                </Text>
              </div>

              <Accordion collapsible>
                <AccordionItem value="1">
                  <AccordionHeader>Deposit Protection</AccordionHeader>
                  <AccordionPanel>
                    <Text className={styles.paragraph}>
                      If you have an Assured Shorthold Tenancy (AST) that started after 6 April 2007, 
                      your landlord must protect your deposit in a government-approved scheme within 30 days.
                    </Text>
                    <Text className={styles.paragraph}>
                      The three approved schemes are:
                    </Text>
                    <ul className={styles.list}>
                      <li className={styles.listItem}>Deposit Protection Service (DPS)</li>
                      <li className={styles.listItem}>MyDeposits</li>
                      <li className={styles.listItem}>Tenancy Deposit Scheme (TDS)</li>
                    </ul>
                    <Text className={styles.paragraph}>
                      If your deposit isn't protected, you may be able to claim up to 3 times the deposit amount in compensation.
                    </Text>
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem value="2">
                  <AccordionHeader>Repairs and Maintenance</AccordionHeader>
                  <AccordionPanel>
                    <Text className={styles.paragraph}>
                      Your landlord is responsible for most repairs, including:
                    </Text>
                    <ul className={styles.list}>
                      <li className={styles.listItem}>Structure and exterior (walls, roof, windows, doors)</li>
                      <li className={styles.listItem}>Heating and hot water systems</li>
                      <li className={styles.listItem}>Basins, sinks, baths, and toilets</li>
                      <li className={styles.listItem}>Electrical wiring and gas pipes</li>
                    </ul>
                    <Text className={styles.paragraph}>
                      Report repairs in writing and keep a copy. If your landlord doesn't respond, 
                      you may be able to contact your local council for help.
                    </Text>
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem value="3">
                  <AccordionHeader>Section 21 and Section 8 Notices</AccordionHeader>
                  <AccordionPanel>
                    <Text className={styles.paragraph}>
                      <strong>Section 21 Notice:</strong> A "no-fault" eviction notice. Your landlord must give 
                      you at least 2 months' notice and follow specific rules for the notice to be valid. 
                      Note: The government plans to abolish Section 21 evictions.
                    </Text>
                    <Text className={styles.paragraph}>
                      <strong>Section 8 Notice:</strong> Used when a tenant has broken their tenancy agreement 
                      (e.g., rent arrears, anti-social behavior). Notice periods vary depending on the reason.
                    </Text>
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem value="4">
                  <AccordionHeader>Housing Benefit and Support</AccordionHeader>
                  <AccordionPanel>
                    <Text className={styles.paragraph}>
                      If you're struggling to pay rent, you may be able to get help through:
                    </Text>
                    <ul className={styles.list}>
                      <li className={styles.listItem}>Universal Credit housing element</li>
                      <li className={styles.listItem}>Housing Benefit (if not on Universal Credit)</li>
                      <li className={styles.listItem}>Discretionary Housing Payments</li>
                      <li className={styles.listItem}>Local council support schemes</li>
                    </ul>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>

              <Button
                appearance="primary"
                size="large"
                icon={<ArrowRight24Regular />}
                iconPosition="after"
                className={styles.ctaButton}
              >
                Check your housing rights
              </Button>
            </Card>
          </div>

          <div className={styles.sidebar}>
            <InfoCard
              title="Housing Topics"
              variant="info"
              items={[
                { label: 'Private renting', href: '#' },
                { label: 'Council and social housing', href: '#' },
                { label: 'Buying a home', href: '#' },
                { label: 'Homelessness', href: '#' },
                { label: 'Repairs and maintenance', href: '#' },
              ]}
            />
            <InfoCard
              title="Emergency Housing"
              variant="warning"
              items={[
                { label: 'Homeless tonight?' },
                { label: 'Emergency accommodation' },
                { label: 'Shelter helpline: 0808 800 4444' },
              ]}
            />
            <Card className={styles.card}>
              <Text weight="semibold" size={400} block style={{ marginBottom: tokens.spacingVerticalS }}>
                Useful Templates
              </Text>
              <ul className={styles.list}>
                <li className={styles.listItem}>Repair request letter</li>
                <li className={styles.listItem}>Deposit return letter</li>
                <li className={styles.listItem}>Rent arrears plan</li>
                <li className={styles.listItem}>Landlord complaint letter</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HousingPage;
