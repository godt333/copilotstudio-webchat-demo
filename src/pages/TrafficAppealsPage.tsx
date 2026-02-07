import { makeStyles, tokens, Text, Card, Button, Accordion, AccordionItem, AccordionHeader, AccordionPanel } from '@fluentui/react-components';
import { PageHeader, InfoCard } from '../components/common';
import {
  VehicleCar24Regular,
  DocumentBulletList24Regular,
  Gavel24Regular,
  ArrowRight24Regular,
  Warning24Regular,
  Checkmark24Regular,
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
  warningBox: {
    backgroundColor: '#fff7e6',
    borderLeft: '4px solid #f47738',
    padding: tokens.spacingHorizontalL,
    marginBottom: tokens.spacingVerticalL,
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
  comparisonGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalL,
    '@media (max-width: 600px)': {
      gridTemplateColumns: '1fr',
    },
  },
  comparisonCard: {
    padding: tokens.spacingHorizontalM,
  },
  comparisonTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalS,
    fontWeight: tokens.fontWeightSemibold,
  },
  stepCard: {
    padding: tokens.spacingHorizontalL,
    marginBottom: tokens.spacingVerticalS,
    borderLeft: '4px solid #0d5c63',
  },
  stepNumber: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#0d5c63',
    color: 'white',
    fontWeight: tokens.fontWeightSemibold,
    marginRight: tokens.spacingHorizontalS,
  },
  ctaButton: {
    marginTop: tokens.spacingVerticalM,
  },
});

const TrafficAppealsPage = () => {
  const styles = useStyles();

  const commonGrounds = [
    'The signage was unclear, hidden, or missing',
    'The road markings were faded or confusing',
    'The parking meter or machine was faulty',
    'You had a valid permit that wasn\'t visible',
    'You were loading/unloading (where permitted)',
    'There were mitigating circumstances (medical emergency)',
    'The notice was issued incorrectly (wrong vehicle details)',
    'You weren\'t the driver at the time (for moving traffic offences)',
  ];

  return (
    <div>
      <PageHeader
        title="Traffic Appeals"
        description="Learn how to challenge parking tickets, speeding fines, and other motoring penalties."
        breadcrumbs={[{ label: 'Traffic Appeals' }]}
      />

      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.mainContent}>
            <Card className={styles.card}>
              <div className={styles.section}>
                <Text as="h2" size={600} weight="semibold" className={styles.sectionTitle}>
                  <VehicleCar24Regular /> Understanding Parking Tickets
                </Text>
                <Text className={styles.paragraph}>
                  There are two main types of parking tickets in the UK, and the appeal process is different 
                  for each. It's important to know which type you have before challenging it.
                </Text>
              </div>

              <div className={styles.comparisonGrid}>
                <Card className={styles.comparisonCard}>
                  <div className={styles.comparisonTitle}>
                    <Gavel24Regular style={{ color: '#0d5c63' }} />
                    <Text>Penalty Charge Notice (PCN)</Text>
                  </div>
                  <Text className={styles.paragraph}>
                    Issued by councils and Transport for London for parking on public roads and in council car parks.
                  </Text>
                  <ul className={styles.list}>
                    <li className={styles.listItem}>Has legal backing</li>
                    <li className={styles.listItem}>Usually £50-£130</li>
                    <li className={styles.listItem}>50% discount if paid within 14 days</li>
                    <li className={styles.listItem}>Appeal to council, then tribunal</li>
                  </ul>
                </Card>
                <Card className={styles.comparisonCard}>
                  <div className={styles.comparisonTitle}>
                    <DocumentBulletList24Regular style={{ color: '#f47738' }} />
                    <Text>Parking Charge Notice</Text>
                  </div>
                  <Text className={styles.paragraph}>
                    Issued by private parking companies on private land (supermarkets, retail parks, etc.).
                  </Text>
                  <ul className={styles.list}>
                    <li className={styles.listItem}>An invoice, not a fine</li>
                    <li className={styles.listItem}>Usually £60-£100</li>
                    <li className={styles.listItem}>Appeal to the parking company</li>
                    <li className={styles.listItem}>Then to POPLA or IAS</li>
                  </ul>
                </Card>
              </div>

              <div className={styles.warningBox}>
                <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalS }}>
                  <Warning24Regular /> Important Time Limits
                </Text>
                <ul className={styles.list}>
                  <li className={styles.listItem}><strong>Council PCN:</strong> Challenge within 28 days (14 days for 50% discount)</li>
                  <li className={styles.listItem}><strong>Private charges:</strong> Check the notice for deadlines (usually 28 days)</li>
                  <li className={styles.listItem}><strong>Speeding fines:</strong> Must respond within 28 days of Notice of Intended Prosecution</li>
                </ul>
              </div>

              <div className={styles.section}>
                <Text as="h2" size={600} weight="semibold" className={styles.sectionTitle}>
                  <Checkmark24Regular /> Common Grounds for Appeal
                </Text>
                <ul className={styles.list}>
                  {commonGrounds.map((ground, index) => (
                    <li key={index} className={styles.listItem}>{ground}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.section}>
                <Text as="h2" size={600} weight="semibold" className={styles.sectionTitle}>
                  How to Appeal a Council Parking Ticket
                </Text>
                
                <Card className={styles.stepCard}>
                  <Text weight="semibold" size={400}>
                    <span className={styles.stepNumber}>1</span>
                    Make an Informal Challenge
                  </Text>
                  <Text className={styles.paragraph} style={{ marginTop: tokens.spacingVerticalS }}>
                    Write to the council within 14 days explaining why you think the ticket was wrong. 
                    Include any evidence (photos, receipts, medical notes). This pauses the 50% discount period.
                  </Text>
                </Card>

                <Card className={styles.stepCard}>
                  <Text weight="semibold" size={400}>
                    <span className={styles.stepNumber}>2</span>
                    Wait for Notice to Owner
                  </Text>
                  <Text className={styles.paragraph} style={{ marginTop: tokens.spacingVerticalS }}>
                    If your informal challenge is rejected, the council sends a Notice to Owner. 
                    You now have 28 days to make a formal representation.
                  </Text>
                </Card>

                <Card className={styles.stepCard}>
                  <Text weight="semibold" size={400}>
                    <span className={styles.stepNumber}>3</span>
                    Make a Formal Representation
                  </Text>
                  <Text className={styles.paragraph} style={{ marginTop: tokens.spacingVerticalS }}>
                    Submit detailed written arguments with all your evidence. The council must respond 
                    within 56 days or cancel the ticket.
                  </Text>
                </Card>

                <Card className={styles.stepCard}>
                  <Text weight="semibold" size={400}>
                    <span className={styles.stepNumber}>4</span>
                    Appeal to the Traffic Penalty Tribunal
                  </Text>
                  <Text className={styles.paragraph} style={{ marginTop: tokens.spacingVerticalS }}>
                    If your formal representation is rejected, you can appeal to an independent tribunal. 
                    This is free and can be done online, by phone, or in person. Around 50% of appeals succeed.
                  </Text>
                </Card>
              </div>

              <Accordion collapsible>
                <AccordionItem value="1">
                  <AccordionHeader>Appealing private parking charges</AccordionHeader>
                  <AccordionPanel>
                    <Text className={styles.paragraph}>
                      For private parking charges (from companies like ParkingEye, APCOA, etc.):
                    </Text>
                    <ol className={styles.list}>
                      <li className={styles.listItem}>Appeal to the parking company first (follow their appeal process)</li>
                      <li className={styles.listItem}>If rejected, appeal to POPLA or the Independent Appeals Service (IAS)</li>
                      <li className={styles.listItem}>The independent appeal is free and binding on the parking company</li>
                      <li className={styles.listItem}>If you lose, the company may take you to court (but many don't)</li>
                    </ol>
                    <Text className={styles.paragraph}>
                      <strong>Tip:</strong> Private parking companies cannot clamp your car or add unlimited charges. 
                      The Protection of Freedoms Act 2012 caps charges and restricts clamping on private land.
                    </Text>
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem value="2">
                  <AccordionHeader>Speeding fines and points</AccordionHeader>
                  <AccordionPanel>
                    <Text className={styles.paragraph}>
                      If you're caught speeding, you'll receive a Notice of Intended Prosecution (NIP) within 
                      14 days. You must respond within 28 days.
                    </Text>
                    <Text className={styles.paragraph}>
                      <strong>Possible outcomes:</strong>
                    </Text>
                    <ul className={styles.list}>
                      <li className={styles.listItem}>Speed awareness course (no points, if eligible)</li>
                      <li className={styles.listItem}>Fixed penalty: £100 fine and 3 points</li>
                      <li className={styles.listItem}>Court summons for higher speeds</li>
                    </ul>
                    <Text className={styles.paragraph}>
                      You can challenge a speeding ticket if: the NIP arrived more than 14 days after the 
                      offence, the speed camera wasn't properly calibrated, or signage was inadequate.
                    </Text>
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem value="3">
                  <AccordionHeader>Bus lane and yellow box fines</AccordionHeader>
                  <AccordionPanel>
                    <Text className={styles.paragraph}>
                      Fines for driving in bus lanes or stopping in yellow box junctions are usually caught 
                      on camera. The process for appealing is similar to parking tickets.
                    </Text>
                    <Text className={styles.paragraph}>
                      <strong>Common grounds for appeal:</strong>
                    </Text>
                    <ul className={styles.list}>
                      <li className={styles.listItem}>Signs weren't visible or clear</li>
                      <li className={styles.listItem}>Road markings were worn or confusing</li>
                      <li className={styles.listItem}>You entered to avoid an accident or emergency</li>
                      <li className={styles.listItem}>The camera captured the wrong vehicle</li>
                      <li className={styles.listItem}>You were directed by traffic officers</li>
                    </ul>
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem value="4">
                  <AccordionHeader>ULEZ and Clean Air Zone charges</AccordionHeader>
                  <AccordionPanel>
                    <Text className={styles.paragraph}>
                      If you've received a penalty for not paying ULEZ (London) or a Clean Air Zone charge:
                    </Text>
                    <ul className={styles.list}>
                      <li className={styles.listItem}>Check if you're eligible for a grace period or exemption</li>
                      <li className={styles.listItem}>You can appeal if you didn't receive adequate warning</li>
                      <li className={styles.listItem}>Mitigating circumstances may reduce the penalty</li>
                      <li className={styles.listItem}>Check for low-income or disabled person exemptions</li>
                    </ul>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>

              <div className={styles.successBox}>
                <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalS }}>
                  Tips for a Successful Appeal
                </Text>
                <ul className={styles.list}>
                  <li className={styles.listItem}>Take photos of the scene as soon as possible</li>
                  <li className={styles.listItem}>Keep a copy of everything you send</li>
                  <li className={styles.listItem}>Be factual and polite in your appeal</li>
                  <li className={styles.listItem}>Include all relevant evidence (photos, receipts, witness statements)</li>
                  <li className={styles.listItem}>Quote relevant laws and regulations where applicable</li>
                  <li className={styles.listItem}>Never ignore a ticket – it won't go away</li>
                </ul>
              </div>

              <Button
                appearance="primary"
                size="large"
                icon={<ArrowRight24Regular />}
                iconPosition="after"
                className={styles.ctaButton}
              >
                Start your appeal
              </Button>
            </Card>
          </div>

          <div className={styles.sidebar}>
            <InfoCard
              title="Types of Penalties"
              variant="info"
              items={[
                { label: 'Council parking tickets (PCN)', href: '#' },
                { label: 'Private parking charges', href: '#' },
                { label: 'Speeding fines', href: '#' },
                { label: 'Bus lane fines', href: '#' },
                { label: 'ULEZ charges', href: '#' },
              ]}
            />
            <InfoCard
              title="Appeal Services"
              variant="warning"
              items={[
                { label: 'Traffic Penalty Tribunal (council)' },
                { label: 'POPLA (private parking)' },
                { label: 'IAS (private parking)' },
              ]}
            />
            <Card className={styles.card}>
              <Text weight="semibold" size={400} block style={{ marginBottom: tokens.spacingVerticalS }}>
                Useful Templates
              </Text>
              <ul className={styles.list}>
                <li className={styles.listItem}>PCN appeal letter template</li>
                <li className={styles.listItem}>Private charge appeal template</li>
                <li className={styles.listItem}>Evidence checklist</li>
                <li className={styles.listItem}>Tribunal preparation guide</li>
              </ul>
            </Card>
            <Card className={styles.card}>
              <Text weight="semibold" size={400} block style={{ marginBottom: tokens.spacingVerticalS }}>
                Key Statistics
              </Text>
              <Text className={styles.paragraph}>
                <strong>~50%</strong> of parking ticket appeals to the Traffic Penalty Tribunal are successful.
              </Text>
              <Text className={styles.paragraph}>
                Many private parking companies don't pursue unpaid charges to court.
              </Text>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficAppealsPage;
