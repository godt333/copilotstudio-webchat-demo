import { makeStyles, tokens, Text, Card, Button, Accordion, AccordionItem, AccordionHeader, AccordionPanel } from '@fluentui/react-components';
import { PageHeader, InfoCard } from '../components/common';
import {
  Briefcase24Regular,
  Money24Regular,
  Document24Regular,
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
  infoBox: {
    backgroundColor: '#e8f4f5',
    borderLeft: '4px solid #0d5c63',
    padding: tokens.spacingHorizontalL,
    marginBottom: tokens.spacingVerticalL,
  },
  warningBox: {
    backgroundColor: '#fef3f2',
    borderLeft: '4px solid #d4351c',
    padding: tokens.spacingHorizontalL,
    marginBottom: tokens.spacingVerticalL,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: tokens.spacingVerticalL,
  },
  th: {
    backgroundColor: tokens.colorNeutralBackground3,
    padding: tokens.spacingHorizontalM,
    textAlign: 'left',
    fontWeight: tokens.fontWeightSemibold,
    borderBottom: `2px solid ${tokens.colorNeutralStroke1}`,
  },
  td: {
    padding: tokens.spacingHorizontalM,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  ctaButton: {
    marginTop: tokens.spacingVerticalM,
  },
});

const EmploymentPage = () => {
  const styles = useStyles();

  const keyRights = [
    'Written statement of employment terms (within 2 months of starting)',
    'National Minimum Wage or National Living Wage',
    'Paid annual leave (at least 28 days including bank holidays)',
    'Rest breaks during the working day',
    'Weekly rest periods',
    'Protection from discrimination',
    'Safe working conditions',
    'Statutory sick pay when off work due to illness',
    'Maternity, paternity, and parental leave',
  ];

  return (
    <div>
      <PageHeader
        title="Employment"
        description="Understand your rights at work, including pay, contracts, dismissal, discrimination, and more."
        breadcrumbs={[{ label: 'Employment' }]}
      />

      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.mainContent}>
            <Card className={styles.card}>
              <div className={styles.section}>
                <Text as="h2" size={600} weight="semibold" className={styles.sectionTitle}>
                  <Briefcase24Regular /> Your Rights at Work
                </Text>
                <Text className={styles.paragraph}>
                  Employment law in the UK protects workers from unfair treatment and ensures minimum 
                  standards. Whether you're an employee, worker, or self-employed, you have certain rights.
                </Text>
                <ul className={styles.list}>
                  {keyRights.map((right, index) => (
                    <li key={index} className={styles.listItem}>{right}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.section}>
                <Text as="h2" size={600} weight="semibold" className={styles.sectionTitle}>
                  <Money24Regular /> Minimum Wage Rates (April 2025)
                </Text>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Age Group</th>
                      <th className={styles.th}>Hourly Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className={styles.td}>21 and over (National Living Wage)</td>
                      <td className={styles.td}>£12.21</td>
                    </tr>
                    <tr>
                      <td className={styles.td}>18 to 20</td>
                      <td className={styles.td}>£10.00</td>
                    </tr>
                    <tr>
                      <td className={styles.td}>Under 18</td>
                      <td className={styles.td}>£7.55</td>
                    </tr>
                    <tr>
                      <td className={styles.td}>Apprentice</td>
                      <td className={styles.td}>£7.55</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className={styles.infoBox}>
                <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalS }}>
                  <Document24Regular /> Written Statement of Terms
                </Text>
                <Text>
                  Since April 2020, all employees and workers have the right to a written statement of 
                  their main terms and conditions on their first day of work. This should include pay, 
                  hours, holiday entitlement, and notice periods.
                </Text>
              </div>

              <Accordion collapsible>
                <AccordionItem value="1">
                  <AccordionHeader>Unfair Dismissal</AccordionHeader>
                  <AccordionPanel>
                    <Text className={styles.paragraph}>
                      You may be able to claim unfair dismissal if you've worked for your employer for 
                      at least 2 years and were dismissed without a fair reason or proper procedure.
                    </Text>
                    <Text className={styles.paragraph}>
                      <strong>Fair reasons for dismissal include:</strong>
                    </Text>
                    <ul className={styles.list}>
                      <li className={styles.listItem}>Conduct</li>
                      <li className={styles.listItem}>Capability or performance</li>
                      <li className={styles.listItem}>Redundancy</li>
                      <li className={styles.listItem}>Legal reasons (e.g., loss of driving licence for a driver)</li>
                      <li className={styles.listItem}>Some other substantial reason</li>
                    </ul>
                    <Text className={styles.paragraph}>
                      You have 3 months minus 1 day from your dismissal date to start Early Conciliation 
                      with ACAS before taking your case to an employment tribunal.
                    </Text>
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem value="2">
                  <AccordionHeader>Workplace Discrimination</AccordionHeader>
                  <AccordionPanel>
                    <Text className={styles.paragraph}>
                      It's unlawful to discriminate against someone because of:
                    </Text>
                    <ul className={styles.list}>
                      <li className={styles.listItem}>Age</li>
                      <li className={styles.listItem}>Disability</li>
                      <li className={styles.listItem}>Gender reassignment</li>
                      <li className={styles.listItem}>Marriage and civil partnership</li>
                      <li className={styles.listItem}>Pregnancy and maternity</li>
                      <li className={styles.listItem}>Race</li>
                      <li className={styles.listItem}>Religion or belief</li>
                      <li className={styles.listItem}>Sex</li>
                      <li className={styles.listItem}>Sexual orientation</li>
                    </ul>
                    <Text className={styles.paragraph}>
                      Discrimination protection applies to job applicants, employees, contractors, and 
                      former employees.
                    </Text>
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem value="3">
                  <AccordionHeader>Redundancy</AccordionHeader>
                  <AccordionPanel>
                    <Text className={styles.paragraph}>
                      If you're made redundant, you may be entitled to:
                    </Text>
                    <ul className={styles.list}>
                      <li className={styles.listItem}>Statutory redundancy pay (if employed 2+ years)</li>
                      <li className={styles.listItem}>A notice period</li>
                      <li className={styles.listItem}>Time off to look for a new job</li>
                      <li className={styles.listItem}>Consultation with your employer</li>
                    </ul>
                    <Text className={styles.paragraph}>
                      <strong>Statutory redundancy pay:</strong>
                    </Text>
                    <ul className={styles.list}>
                      <li className={styles.listItem}>0.5 week's pay for each full year under age 22</li>
                      <li className={styles.listItem}>1 week's pay for each full year aged 22 to 40</li>
                      <li className={styles.listItem}>1.5 week's pay for each full year aged 41 or over</li>
                    </ul>
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem value="4">
                  <AccordionHeader>Whistleblowing</AccordionHeader>
                  <AccordionPanel>
                    <Text className={styles.paragraph}>
                      You're protected by law if you report wrongdoing in the workplace (whistleblowing). 
                      Protected disclosures include:
                    </Text>
                    <ul className={styles.list}>
                      <li className={styles.listItem}>Criminal offences</li>
                      <li className={styles.listItem}>Health and safety dangers</li>
                      <li className={styles.listItem}>Environmental damage</li>
                      <li className={styles.listItem}>Miscarriage of justice</li>
                      <li className={styles.listItem}>Company law breaches</li>
                      <li className={styles.listItem}>Cover-ups of any of the above</li>
                    </ul>
                    <Text className={styles.paragraph}>
                      It's automatically unfair to dismiss someone for whistleblowing, regardless of 
                      length of service.
                    </Text>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>

              <div className={styles.warningBox}>
                <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalS }}>
                  Time Limits for Employment Tribunal Claims
                </Text>
                <Text>
                  Most employment tribunal claims must be started within 3 months minus 1 day of the 
                  issue you're complaining about. Contact ACAS for Early Conciliation first — this is 
                  mandatory and will pause the time limit.
                </Text>
              </div>

              <Button
                appearance="primary"
                size="large"
                icon={<ArrowRight24Regular />}
                iconPosition="after"
                className={styles.ctaButton}
              >
                Check your employment rights
              </Button>
            </Card>
          </div>

          <div className={styles.sidebar}>
            <InfoCard
              title="Employment Topics"
              variant="info"
              items={[
                { label: 'Contracts and pay', href: '#' },
                { label: 'Holiday and sick leave', href: '#' },
                { label: 'Dismissal and redundancy', href: '#' },
                { label: 'Discrimination at work', href: '#' },
                { label: 'Starting a new job', href: '#' },
              ]}
            />
            <InfoCard
              title="Need Help Now?"
              variant="warning"
              items={[
                { label: 'ACAS helpline: 0300 123 1100' },
                { label: 'Employment tribunal information' },
                { label: 'Free legal advice' },
              ]}
            />
            <Card className={styles.card}>
              <Text weight="semibold" size={400} block style={{ marginBottom: tokens.spacingVerticalS }}>
                Useful Templates
              </Text>
              <ul className={styles.list}>
                <li className={styles.listItem}>Grievance letter template</li>
                <li className={styles.listItem}>Flexible working request</li>
                <li className={styles.listItem}>Resignation letter</li>
                <li className={styles.listItem}>Subject access request</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmploymentPage;
