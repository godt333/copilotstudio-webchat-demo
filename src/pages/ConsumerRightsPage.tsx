import { makeStyles, tokens, Text, Card, Button, Accordion, AccordionItem, AccordionHeader, AccordionPanel } from '@fluentui/react-components';
import { PageHeader, InfoCard } from '../components/common';
import {
  Cart24Regular,
  ShieldCheckmark24Regular,
  ArrowRight24Regular,
  Clock24Regular,
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
  successBox: {
    backgroundColor: '#e8f5e9',
    borderLeft: '4px solid #00703c',
    padding: tokens.spacingHorizontalL,
    marginBottom: tokens.spacingVerticalL,
  },
  infoBox: {
    backgroundColor: '#e8f4f5',
    borderLeft: '4px solid #0d5c63',
    padding: tokens.spacingHorizontalL,
    marginBottom: tokens.spacingVerticalL,
  },
  timelineCard: {
    padding: tokens.spacingHorizontalL,
    marginBottom: tokens.spacingVerticalM,
    borderLeft: '4px solid #0d5c63',
  },
  timelineTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalS,
    color: '#0d5c63',
  },
  ctaButton: {
    marginTop: tokens.spacingVerticalM,
  },
});

const ConsumerRightsPage = () => {
  const styles = useStyles();

  const keyRights = [
    'Goods must be of satisfactory quality',
    'Goods must be fit for purpose',
    'Goods must match their description',
    'Services must be performed with reasonable care and skill',
    'Services must be provided within a reasonable time if no time is agreed',
    'Digital content must be of satisfactory quality, fit for purpose, and as described',
  ];

  return (
    <div>
      <PageHeader
        title="Consumer Rights"
        description="Know your rights when buying goods and services, getting refunds, and dealing with faulty products."
        breadcrumbs={[{ label: 'Consumer Rights' }]}
      />

      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.mainContent}>
            <Card className={styles.card}>
              <div className={styles.section}>
                <Text as="h2" size={600} weight="semibold" className={styles.sectionTitle}>
                  <Cart24Regular /> The Consumer Rights Act 2015
                </Text>
                <Text className={styles.paragraph}>
                  The Consumer Rights Act 2015 is the main law protecting consumers in the UK. It covers 
                  your rights when you buy goods, services, or digital content from a trader.
                </Text>
                
                <div className={styles.successBox}>
                  <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalS }}>
                    <ShieldCheckmark24Regular /> Your Core Rights
                  </Text>
                  <ul className={styles.list}>
                    {keyRights.map((right, index) => (
                      <li key={index} className={styles.listItem}>{right}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className={styles.section}>
                <Text as="h2" size={600} weight="semibold" className={styles.sectionTitle}>
                  <Clock24Regular /> Time Limits for Refunds
                </Text>
                
                <Card className={styles.timelineCard}>
                  <div className={styles.timelineTitle}>
                    <Text weight="semibold" size={500}>Within 30 days</Text>
                  </div>
                  <Text className={styles.paragraph}>
                    If goods are faulty, you have a short-term right to reject them and get a full refund. 
                    The 30 days start from when you take ownership of the goods.
                  </Text>
                </Card>

                <Card className={styles.timelineCard}>
                  <div className={styles.timelineTitle}>
                    <Text weight="semibold" size={500}>Within 6 months</Text>
                  </div>
                  <Text className={styles.paragraph}>
                    If a fault develops, it's assumed to have been there from the start. The retailer must 
                    prove otherwise. You can ask for a repair or replacement first, then a refund if that fails.
                  </Text>
                </Card>

                <Card className={styles.timelineCard}>
                  <div className={styles.timelineTitle}>
                    <Text weight="semibold" size={500}>After 6 months (up to 6 years)</Text>
                  </div>
                  <Text className={styles.paragraph}>
                    You may still have rights, but you'll need to prove the item was faulty when you bought it. 
                    Consider getting an expert opinion if the item is expensive.
                  </Text>
                </Card>
              </div>

              <div className={styles.infoBox}>
                <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalS }}>
                  Online Shopping: Extra Rights
                </Text>
                <Text className={styles.paragraph}>
                  Under the Consumer Contracts Regulations 2013, when you buy online you have a 14-day 
                  "cooling off" period to change your mind for any reason. This starts from when you 
                  receive the goods.
                </Text>
                <ul className={styles.list}>
                  <li className={styles.listItem}>You don't need to give a reason</li>
                  <li className={styles.listItem}>You have 14 days to tell the seller you want to cancel</li>
                  <li className={styles.listItem}>You then have 14 more days to return the goods</li>
                  <li className={styles.listItem}>You must receive your refund within 14 days of return</li>
                </ul>
              </div>

              <Accordion collapsible>
                <AccordionItem value="1">
                  <AccordionHeader>What if the shop refuses a refund?</AccordionHeader>
                  <AccordionPanel>
                    <Text className={styles.paragraph}>
                      If a retailer refuses to give you a refund you're entitled to, you can:
                    </Text>
                    <ol className={styles.list}>
                      <li className={styles.listItem}>Write a formal complaint letter citing your rights under the Consumer Rights Act</li>
                      <li className={styles.listItem}>Contact the retailer's head office or customer services</li>
                      <li className={styles.listItem}>Use Alternative Dispute Resolution (ADR) if the retailer is a member</li>
                      <li className={styles.listItem}>Report to Trading Standards</li>
                      <li className={styles.listItem}>Take the case to small claims court (claims up to £10,000)</li>
                    </ol>
                    <Text className={styles.paragraph}>
                      If you paid by credit card for goods over £100, you can also make a Section 75 claim 
                      against your card provider.
                    </Text>
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem value="2">
                  <AccordionHeader>Section 75 credit card protection</AccordionHeader>
                  <AccordionPanel>
                    <Text className={styles.paragraph}>
                      Section 75 of the Consumer Credit Act makes your credit card provider jointly liable 
                      with the retailer if something goes wrong with a purchase between £100 and £30,000.
                    </Text>
                    <Text className={styles.paragraph}>
                      This means you can claim from your card company if:
                    </Text>
                    <ul className={styles.list}>
                      <li className={styles.listItem}>The goods are faulty or not as described</li>
                      <li className={styles.listItem}>The company goes bust before delivering</li>
                      <li className={styles.listItem}>The service wasn't provided as agreed</li>
                    </ul>
                    <Text className={styles.paragraph}>
                      For debit card purchases, you may be able to claim through chargeback, but this is 
                      a voluntary scheme with shorter time limits.
                    </Text>
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem value="3">
                  <AccordionHeader>Warranties and guarantees</AccordionHeader>
                  <AccordionPanel>
                    <Text className={styles.paragraph}>
                      Manufacturer warranties and extended guarantees are separate from your statutory rights. 
                      Your statutory rights under the Consumer Rights Act cannot be reduced or taken away.
                    </Text>
                    <Text className={styles.paragraph}>
                      <strong>Remember:</strong> Shops cannot claim "no refunds" on faulty items — this is 
                      against the law. Signs saying "no refunds" only apply to change of mind, not faulty goods.
                    </Text>
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem value="4">
                  <AccordionHeader>Scams and fraud</AccordionHeader>
                  <AccordionPanel>
                    <Text className={styles.paragraph}>
                      If you've been the victim of a scam:
                    </Text>
                    <ul className={styles.list}>
                      <li className={styles.listItem}>Contact your bank immediately</li>
                      <li className={styles.listItem}>Report to Action Fraud (0300 123 2040)</li>
                      <li className={styles.listItem}>Keep all evidence and correspondence</li>
                      <li className={styles.listItem}>Check if you're covered by the Contingent Reimbursement Model (CRM) Code</li>
                    </ul>
                    <Text className={styles.paragraph}>
                      Many banks have signed up to the CRM Code, which means they may reimburse you if 
                      you've been tricked into sending money to a scammer.
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
                Check your consumer rights
              </Button>
            </Card>
          </div>

          <div className={styles.sidebar}>
            <InfoCard
              title="Consumer Topics"
              variant="info"
              items={[
                { label: 'Refunds and returns', href: '#' },
                { label: 'Faulty goods', href: '#' },
                { label: 'Online shopping', href: '#' },
                { label: 'Contracts and subscriptions', href: '#' },
                { label: 'Credit and debt', href: '#' },
              ]}
            />
            <InfoCard
              title="Report Issues"
              variant="warning"
              items={[
                { label: 'Trading Standards' },
                { label: 'Action Fraud: 0300 123 2040' },
                { label: 'Financial Ombudsman' },
                { label: 'Competition & Markets Authority' },
              ]}
            />
            <Card className={styles.card}>
              <Text weight="semibold" size={400} block style={{ marginBottom: tokens.spacingVerticalS }}>
                Useful Templates
              </Text>
              <ul className={styles.list}>
                <li className={styles.listItem}>Complaint letter template</li>
                <li className={styles.listItem}>Refund request letter</li>
                <li className={styles.listItem}>Section 75 claim template</li>
                <li className={styles.listItem}>Small claims court guidance</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsumerRightsPage;
