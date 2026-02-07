import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

/**
 * Court Finder and Information Tools
 * Provides information about UK courts and tribunals.
 */

interface CourtInfo {
  name: string;
  type: string;
  jurisdiction: string;
  handles: string[];
  website: string;
  findYourCourt: string;
  fees?: string;
  helpline?: string;
}

export function registerCourtTools(server: McpServer): void {
  
  // Get court information by type
  server.tool(
    'get_court_info',
    'Get information about different types of UK courts and tribunals',
    {
      courtType: z.enum([
        'county_court',
        'magistrates_court',
        'crown_court',
        'high_court',
        'family_court',
        'employment_tribunal',
        'benefits_tribunal',
        'immigration_tribunal',
        'property_tribunal',
        'small_claims'
      ]).describe('Type of court or tribunal')
    },
    async (params) => {
      const courtInfo: Record<string, CourtInfo> = {
        county_court: {
          name: 'County Court',
          type: 'Civil Court',
          jurisdiction: 'England and Wales',
          handles: [
            'Debt recovery and money claims',
            'Personal injury claims (under £100,000)',
            'Housing and property disputes',
            'Contract disputes',
            'Consumer disputes',
            'Landlord and tenant issues',
            'Injunctions'
          ],
          website: 'https://www.gov.uk/courts-tribunals/county-court-business-centre',
          findYourCourt: 'https://www.gov.uk/find-court-tribunal',
          fees: 'Varies by claim value (£35-£10,000+). Fee help available.',
          helpline: '0300 123 1057'
        },
        magistrates_court: {
          name: "Magistrates' Court",
          type: 'Criminal Court',
          jurisdiction: 'England and Wales',
          handles: [
            'Less serious criminal offences ("summary offences")',
            'Preliminary hearings for serious offences',
            'Licensing applications',
            'Some civil matters (council tax, TV licence)',
            'Youth court cases',
            'Bail applications'
          ],
          website: 'https://www.gov.uk/courts-tribunals/magistrates-court',
          findYourCourt: 'https://www.gov.uk/find-court-tribunal',
          helpline: '0300 123 1057'
        },
        crown_court: {
          name: 'Crown Court',
          type: 'Criminal Court',
          jurisdiction: 'England and Wales',
          handles: [
            'Serious criminal offences (murder, rape, robbery)',
            'Cases sent from magistrates\' court',
            'Appeals against magistrates\' court decisions',
            'Sentencing for serious cases'
          ],
          website: 'https://www.gov.uk/courts-tribunals/crown-court',
          findYourCourt: 'https://www.gov.uk/find-court-tribunal'
        },
        high_court: {
          name: 'High Court of Justice',
          type: 'Superior Court',
          jurisdiction: 'England and Wales',
          handles: [
            'Complex civil cases',
            'Large value claims (over £100,000)',
            'Judicial review of government decisions',
            'Appeals from lower courts',
            'Specialist cases (commercial, admiralty, etc.)'
          ],
          website: 'https://www.gov.uk/courts-tribunals/high-court',
          findYourCourt: 'https://www.gov.uk/find-court-tribunal',
          fees: 'Higher than County Court. Fee remission available.'
        },
        family_court: {
          name: 'Family Court',
          type: 'Family Court',
          jurisdiction: 'England and Wales',
          handles: [
            'Divorce and dissolution of civil partnerships',
            'Child arrangements (custody, contact)',
            'Adoption',
            'Care proceedings',
            'Domestic abuse protection orders',
            'Financial orders after separation',
            'Forced marriage protection'
          ],
          website: 'https://www.gov.uk/courts-tribunals/family-court',
          findYourCourt: 'https://www.gov.uk/find-court-tribunal',
          fees: 'Divorce: £593. Other fees vary. Fee remission available.',
          helpline: '0300 123 1057'
        },
        employment_tribunal: {
          name: 'Employment Tribunal',
          type: 'Tribunal',
          jurisdiction: 'England, Wales and Scotland (separate for NI)',
          handles: [
            'Unfair dismissal claims',
            'Discrimination claims',
            'Unpaid wages and holiday pay',
            'Breach of contract (up to £25,000)',
            'Redundancy pay disputes',
            'Whistleblowing claims',
            'Equal pay claims'
          ],
          website: 'https://www.gov.uk/courts-tribunals/employment-tribunal',
          findYourCourt: 'https://www.gov.uk/find-court-tribunal',
          fees: 'Currently FREE (fees were abolished)',
          helpline: 'ACAS: 0300 123 1100'
        },
        benefits_tribunal: {
          name: 'First-tier Tribunal (Social Entitlement Chamber)',
          type: 'Tribunal',
          jurisdiction: 'England, Wales and Scotland',
          handles: [
            'PIP appeals',
            'Universal Credit appeals',
            'ESA appeals',
            'Housing Benefit appeals',
            'Child Benefit appeals',
            'Tax Credit appeals',
            'Criminal injuries compensation appeals'
          ],
          website: 'https://www.gov.uk/appeal-benefit-decision',
          findYourCourt: 'https://www.gov.uk/find-court-tribunal',
          fees: 'FREE to appeal',
          helpline: '0300 123 1142'
        },
        immigration_tribunal: {
          name: 'First-tier Tribunal (Immigration and Asylum Chamber)',
          type: 'Tribunal',
          jurisdiction: 'UK-wide',
          handles: [
            'Immigration appeals',
            'Asylum appeals',
            'Deportation appeals',
            'Entry clearance appeals',
            'Human rights claims',
            'EU Settlement Scheme appeals'
          ],
          website: 'https://www.gov.uk/courts-tribunals/first-tier-tribunal-immigration-and-asylum',
          findYourCourt: 'https://www.gov.uk/find-court-tribunal',
          fees: 'Varies. Fee waiver available.',
          helpline: '0300 123 1711'
        },
        property_tribunal: {
          name: 'First-tier Tribunal (Property Chamber)',
          type: 'Tribunal',
          jurisdiction: 'England',
          handles: [
            'Rent disputes (regulated tenancies)',
            'Leasehold disputes',
            'Service charge disputes',
            'Right to Manage applications',
            'Park homes disputes',
            'Housing conditions'
          ],
          website: 'https://www.gov.uk/courts-tribunals/first-tier-tribunal-property-chamber',
          findYourCourt: 'https://www.gov.uk/find-court-tribunal',
          fees: 'Varies by case type',
          helpline: '0300 123 0504'
        },
        small_claims: {
          name: 'Small Claims Court',
          type: 'Track within County Court',
          jurisdiction: 'England and Wales',
          handles: [
            'Claims up to £10,000',
            'Personal injury claims up to £1,000',
            'Consumer disputes',
            'Faulty goods claims',
            'Unpaid invoices',
            'Deposit disputes'
          ],
          website: 'https://www.gov.uk/make-court-claim-for-money',
          findYourCourt: 'https://www.gov.uk/find-court-tribunal',
          fees: '£35 (up to £300) to £455 (£5,001-£10,000). Online claims are cheaper.',
          helpline: '0300 123 1057'
        }
      };

      const info = courtInfo[params.courtType];
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            ...info,
            guidance: [
              'Always check if you need legal representation',
              'Many tribunals are designed for people to represent themselves',
              'Fee remission/waiver is available if you\'re on low income or benefits',
              'Free legal advice may be available from Citizens Advice, Law Centres, or pro bono clinics'
            ],
            usefulLinks: {
              courtFinder: 'https://www.gov.uk/find-court-tribunal',
              feeRemission: 'https://www.gov.uk/get-help-with-court-fees',
              freeLegalHelp: 'https://www.gov.uk/legal-aid',
              citizensAdvice: 'https://www.citizensadvice.org.uk/law-and-courts/'
            }
          }, null, 2)
        }]
      };
    }
  );

  // Understand court process
  server.tool(
    'explain_court_process',
    'Explain the court or tribunal process for a specific type of case',
    {
      caseType: z.enum([
        'small_claims',
        'employment_tribunal',
        'benefits_appeal',
        'eviction_defence',
        'divorce',
        'child_arrangements',
        'debt_claim'
      ]).describe('Type of case')
    },
    async (params) => {
      const processes: Record<string, { steps: string[]; timeline: string; tips: string[] }> = {
        small_claims: {
          steps: [
            '1. Send a "letter before action" giving 14 days to resolve',
            '2. Start claim online at moneyclaims.service.gov.uk (or form N1)',
            '3. Pay court fee (£35-£455 depending on amount)',
            '4. Court sends claim to defendant (14 days to respond)',
            '5. If defended: directions questionnaire sent to both parties',
            '6. Possible mediation offered (1 hour, free, by phone)',
            '7. If no settlement: hearing date set',
            '8. Prepare evidence bundle and witness statements',
            '9. Attend hearing (usually 1-3 hours)',
            '10. Judge makes decision (often on the day)'
          ],
          timeline: '3-6 months from claim to hearing',
          tips: [
            'Use the online service - it\'s cheaper and faster',
            'Keep all evidence: receipts, emails, photos, contracts',
            'Be prepared to negotiate - most cases settle',
            'Mediation has high success rate - use it',
            'You can\'t usually recover legal costs, so represent yourself',
            'Bring 3 copies of everything to the hearing'
          ]
        },
        employment_tribunal: {
          steps: [
            '1. Contact ACAS for Early Conciliation (mandatory)',
            '2. ACAS tries to settle for up to 6 weeks',
            '3. Receive ACAS certificate (needed to proceed)',
            '4. Submit ET1 claim form online',
            '5. Employer submits ET3 response (28 days)',
            '6. Case management preliminary hearing',
            '7. Disclosure of documents',
            '8. Exchange witness statements',
            '9. Final hearing (1-5 days depending on complexity)',
            '10. Reserved judgment or decision on the day'
          ],
          timeline: '9-12 months from claim to final hearing',
          tips: [
            'ACAS Early Conciliation is FREE and mandatory',
            'Keep detailed records of everything',
            'Time limits are strict: 3 months minus 1 day from event',
            'Consider union support if you\'re a member',
            'Free representation may be available from Law Centres',
            'Most claimants represent themselves successfully'
          ]
        },
        benefits_appeal: {
          steps: [
            '1. Request Mandatory Reconsideration (MR) from DWP',
            '2. Wait for MR decision (usually 2-4 weeks)',
            '3. If unsuccessful, appeal to tribunal (form SSCS1)',
            '4. Tribunal acknowledges appeal',
            '5. DWP sends "response" with evidence',
            '6. You can submit additional evidence',
            '7. Hearing date set (can request paper hearing)',
            '8. Attend hearing (usually 30-60 mins)',
            '9. Decision often given on the day'
          ],
          timeline: '3-9 months from MR to tribunal decision',
          tips: [
            'Get help from Citizens Advice or welfare rights adviser',
            'About 70% of PIP appeals are successful!',
            'Medical evidence is crucial - get it from GP/consultant',
            'Describe your worst days, not your best',
            'Tribunal panel includes a medical professional',
            'You can bring a friend or family member for support'
          ]
        },
        eviction_defence: {
          steps: [
            '1. Receive notice from landlord (Section 21 or Section 8)',
            '2. Check if notice is valid (many have errors)',
            '3. Do NOT leave - wait for court papers',
            '4. Receive court claim (14 days to respond)',
            '5. Complete defence form',
            '6. Attend court hearing',
            '7. If order made: apply for stay if needed',
            '8. Only leave when bailiffs attend with warrant'
          ],
          timeline: 'Minimum 3-6 months from notice to eviction',
          tips: [
            'Check notice validity - many are defective',
            'Get advice from Shelter immediately: 0808 800 4444',
            'Apply for legal aid if available for housing',
            'Never ignore court papers',
            'You can ask for more time at the hearing',
            'Council has duty if you become homeless'
          ]
        },
        divorce: {
          steps: [
            '1. Apply online at gov.uk/apply-for-divorce (£593)',
            '2. No need to give reason since April 2022',
            '3. Court checks application',
            '4. Other party acknowledges (or not)',
            '5. Wait 20 weeks from application',
            '6. Apply for Conditional Order',
            '7. Court grants Conditional Order',
            '8. Wait 6 weeks',
            '9. Apply for Final Order',
            '10. Receive Final Order - divorced!'
          ],
          timeline: 'Minimum 6 months (26 weeks)',
          tips: [
            'Financial matters are separate from divorce',
            'Consider mediation for finances and children',
            'You can apply jointly (cheaper and easier)',
            'Get a consent order to make financial agreement binding',
            'Child arrangements don\'t require court if you agree'
          ]
        },
        child_arrangements: {
          steps: [
            '1. Try to agree with other parent first',
            '2. Attend Mediation Information Assessment Meeting (MIAM)',
            '3. Try mediation (if appropriate)',
            '4. If no agreement: apply to court (form C100)',
            '5. Cafcass officer conducts safeguarding checks',
            '6. First Hearing Dispute Resolution Appointment',
            '7. May resolve at this stage or continue',
            '8. Possible Cafcass report',
            '9. Further hearings if needed',
            '10. Final hearing and order if not agreed'
          ],
          timeline: '6-18 months (complex cases longer)',
          tips: [
            'Court should be last resort',
            'Focus on child\'s needs, not "winning"',
            'Cafcass is there to help the child',
            'Courts prefer parents to agree',
            'Consider child\'s wishes (age appropriate)',
            'Domestic abuse exemptions for MIAM exist'
          ]
        },
        debt_claim: {
          steps: [
            '1. Creditor sends letter before action (14 days)',
            '2. Creditor starts court claim',
            '3. You receive claim pack',
            '4. Respond within 14 days (acknowledge or file defence)',
            '5. Options: Admit (payment plan), Defend, or Part-admit',
            '6. If defended: allocated to track',
            '7. Possible mediation',
            '8. Hearing if not settled',
            '9. Judgment and any enforcement'
          ],
          timeline: '2-6 months from claim to judgment',
          tips: [
            'Don\'t ignore debt claims - respond!',
            'Admit and offer payment plan if you owe the debt',
            'Check the debt is valid and not time-barred (6 years)',
            'Get debt advice: StepChange 0800 138 1111',
            'Court can\'t send you to prison for civil debt',
            'Consider whether the debt is statute-barred'
          ]
        }
      };

      const process = processes[params.caseType];
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            caseType: params.caseType.replace(/_/g, ' ').toUpperCase(),
            ...process,
            resources: {
              citizensAdvice: 'https://www.citizensadvice.org.uk/law-and-courts/',
              courtGuides: 'https://www.gov.uk/government/collections/court-guides',
              legalAid: 'https://www.gov.uk/legal-aid',
              freeLegalHelp: 'https://weareadvocate.org.uk/'
            }
          }, null, 2)
        }]
      };
    }
  );
}
