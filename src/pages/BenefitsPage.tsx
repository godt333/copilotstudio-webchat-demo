import { makeStyles, tokens, Text, Card, Button, Accordion, AccordionItem, AccordionHeader, AccordionPanel } from '@fluentui/react-components';
import { PageHeader, InfoCard } from '../components/common';
import {
  Money24Regular,
  Checkmark24Regular,
  ArrowRight24Regular,
  Info24Regular,
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
  benefitCard: {
    padding: tokens.spacingHorizontalL,
    marginBottom: tokens.spacingVerticalM,
    borderLeft: '4px solid #00703c',
  },
  benefitTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalS,
  },
  benefitAmount: {
    color: '#00703c',
    fontWeight: tokens.fontWeightBold,
  },
  warningBox: {
    backgroundColor: '#fff7e6',
    borderLeft: '4px solid #f47738',
    padding: tokens.spacingHorizontalL,
    marginBottom: tokens.spacingVerticalL,
  },
  ctaButton: {
    marginTop: tokens.spacingVerticalM,
  },
  accordion: {
    marginTop: tokens.spacingVerticalL,
  },
});

const BenefitsPage = () => {
  const styles = useStyles();

  const benefits = [
    {
      name: 'Universal Credit',
      description: 'A single monthly payment for people in or out of work, replacing 6 legacy benefits.',
      amount: 'Up to £368.74/month (single, 25+)',
      eligibility: ['Aged 18 or over', 'Under State Pension age', 'Living in England, Scotland, or Wales', 'Less than £16,000 in savings'],
    },
    {
      name: 'Housing Benefit',
      description: 'Help with rent if you\'re on a low income or claiming benefits.',
      amount: 'Varies by location and circumstances',
      eligibility: ['Pay rent', 'On low income or benefits', 'Have less than £16,000 in savings'],
    },
    {
      name: 'Pension Credit',
      description: 'Extra money for pensioners on low income.',
      amount: 'Up to £218.15/week (single)',
      eligibility: ['Over State Pension age', 'Living in Great Britain', 'Low income'],
    },
    {
      name: 'Personal Independence Payment (PIP)',
      description: 'Help with extra living costs if you have a long-term illness or disability.',
      amount: '£28.70 to £184.30/week',
      eligibility: ['Aged 16 to State Pension age', 'Have a long-term health condition or disability', 'Difficulty with daily living or getting around'],
    },
  ];

  return (
    <div>
      <PageHeader
        title="Benefits"
        description="Find out what benefits you could be entitled to, how to apply, and get help with your claim."
        breadcrumbs={[{ label: 'Benefits' }]}
      />

      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.mainContent}>
            <Card className={styles.card}>
              <div className={styles.section}>
                <Text as="h2" size={600} weight="semibold" className={styles.sectionTitle}>
                  <Money24Regular /> Overview
                </Text>
                <Text className={styles.paragraph}>
                  The UK benefits system provides financial support to people who need it. You might be able to claim 
                  benefits if you're on a low income, out of work, have a disability or health condition, are a carer, 
                  or have reached State Pension age.
                </Text>
                <Text className={styles.paragraph}>
                  Many people don't claim all the benefits they're entitled to. Use our information below or chat with 
                  our AI assistant to find out what you could claim.
                </Text>
              </div>

              <div className={styles.warningBox}>
                <Text weight="semibold">
                  <Info24Regular /> Important: Benefit rates change each April
                </Text>
                <Text block style={{ marginTop: tokens.spacingVerticalS }}>
                  The amounts shown are for the 2025/26 tax year. Check GOV.UK for the most up-to-date figures.
                </Text>
              </div>

              <div className={styles.section}>
                <Text as="h2" size={600} weight="semibold" className={styles.sectionTitle}>
                  Main Benefits
                </Text>
                
                {benefits.map((benefit, index) => (
                  <Card key={index} className={styles.benefitCard}>
                    <div className={styles.benefitTitle}>
                      <Checkmark24Regular style={{ color: '#00703c' }} />
                      <Text size={500} weight="semibold">{benefit.name}</Text>
                    </div>
                    <Text className={styles.paragraph}>{benefit.description}</Text>
                    <Text className={styles.benefitAmount}>{benefit.amount}</Text>
                    <Text size={300} weight="semibold" style={{ marginTop: tokens.spacingVerticalS }} block>
                      Eligibility:
                    </Text>
                    <ul className={styles.list}>
                      {benefit.eligibility.map((item, i) => (
                        <li key={i} className={styles.listItem}>{item}</li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>

              <Accordion className={styles.accordion} collapsible>
                <AccordionItem value="1">
                  <AccordionHeader>How to apply for Universal Credit</AccordionHeader>
                  <AccordionPanel>
                    <ol className={styles.list}>
                      <li className={styles.listItem}>Create an account on the Universal Credit website</li>
                      <li className={styles.listItem}>Provide information about yourself and your circumstances</li>
                      <li className={styles.listItem}>Verify your identity (online, by phone, or at a Jobcentre)</li>
                      <li className={styles.listItem}>Attend an appointment at your local Jobcentre Plus</li>
                      <li className={styles.listItem}>Accept your Claimant Commitment</li>
                    </ol>
                    <Text className={styles.paragraph}>
                      It usually takes about 5 weeks to receive your first payment. If you need money urgently, 
                      you can apply for an Advance Payment.
                    </Text>
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem value="2">
                  <AccordionHeader>What documents do I need?</AccordionHeader>
                  <AccordionPanel>
                    <ul className={styles.list}>
                      <li className={styles.listItem}>Your National Insurance number</li>
                      <li className={styles.listItem}>Bank, building society, or credit union account details</li>
                      <li className={styles.listItem}>Details of your housing costs (e.g., rent)</li>
                      <li className={styles.listItem}>Details of your income and savings</li>
                      <li className={styles.listItem}>Details about childcare costs if applicable</li>
                    </ul>
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem value="3">
                  <AccordionHeader>Can I appeal a benefits decision?</AccordionHeader>
                  <AccordionPanel>
                    <Text className={styles.paragraph}>
                      Yes, if you disagree with a decision about your benefits, you can:
                    </Text>
                    <ol className={styles.list}>
                      <li className={styles.listItem}>Ask for a Mandatory Reconsideration within one month</li>
                      <li className={styles.listItem}>If still unhappy, appeal to the Social Security Tribunal</li>
                    </ol>
                    <Text className={styles.paragraph}>
                      Get free help with your appeal from Citizens Advice or a welfare rights organization.
                    </Text>
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
                Check what benefits you can claim
              </Button>
            </Card>
          </div>

          <div className={styles.sidebar}>
            <InfoCard
              title="Quick Links"
              variant="info"
              items={[
                { label: 'Universal Credit calculator', href: '#' },
                { label: 'Benefit cap explained', href: '#' },
                { label: 'Report a change in circumstances', href: '#' },
                { label: 'Appeal a decision', href: '#' },
              ]}
            />
            <InfoCard
              title="Need urgent help?"
              variant="warning"
              items={[
                { label: 'Apply for a hardship payment' },
                { label: 'Food bank locations' },
                { label: 'Council emergency support' },
                { label: 'Debt advice services' },
              ]}
            />
            <Card className={styles.card}>
              <Text weight="semibold" size={400} block style={{ marginBottom: tokens.spacingVerticalS }}>
                Related Topics
              </Text>
              <ul className={styles.list}>
                <li className={styles.listItem}>Tax credits</li>
                <li className={styles.listItem}>Child benefit</li>
                <li className={styles.listItem}>Carer's allowance</li>
                <li className={styles.listItem}>Disability benefits</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenefitsPage;
