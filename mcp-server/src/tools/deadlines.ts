import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

/**
 * Deadline Calculator Tools
 * Calculate important legal deadlines for tribunals, appeals, and court proceedings.
 */

interface DeadlineResult {
  deadlineType: string;
  calculatedDeadline: string;
  daysRemaining: number;
  isUrgent: boolean;
  description: string;
  warnings: string[];
  nextSteps: string[];
  relevantRules: string;
}

// Helper to add business days (excluding weekends)
function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      added++;
    }
  }
  return result;
}

// Helper to add calendar days
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Helper to subtract days
function subtractDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

// Format date for display
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// Calculate days remaining
function daysUntil(deadline: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = deadline.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function registerDeadlineTools(server: McpServer): void {
  
  // Employment Tribunal deadline calculator
  server.tool(
    'calculate_employment_tribunal_deadline',
    'Calculate the deadline for making an Employment Tribunal claim. Claims must generally be made within 3 months minus 1 day of the act complained of.',
    {
      eventDate: z.string().describe('Date of the event/dismissal/discrimination (YYYY-MM-DD format)'),
      eventType: z.enum([
        'dismissal',
        'discrimination',
        'unpaid_wages',
        'redundancy_payment',
        'equal_pay',
        'whistleblowing'
      ]).describe('Type of employment claim'),
      hasContactedAcas: z.boolean().describe('Have you already contacted ACAS for Early Conciliation?'),
      acasCertificateDate: z.string().optional().describe('Date ACAS certificate was issued (if applicable, YYYY-MM-DD)')
    },
    async (params) => {
      const eventDate = new Date(params.eventDate);
      
      // Standard time limit: 3 months minus 1 day
      let standardDeadline = new Date(eventDate);
      standardDeadline.setMonth(standardDeadline.getMonth() + 3);
      standardDeadline.setDate(standardDeadline.getDate() - 1);
      
      // Special cases
      let timeLimit = '3 months minus 1 day';
      if (params.eventType === 'redundancy_payment') {
        standardDeadline = new Date(eventDate);
        standardDeadline.setMonth(standardDeadline.getMonth() + 6);
        timeLimit = '6 months';
      } else if (params.eventType === 'equal_pay') {
        standardDeadline = new Date(eventDate);
        standardDeadline.setMonth(standardDeadline.getMonth() + 6);
        timeLimit = '6 months (or within 6 months of leaving employment)';
      }
      
      // ACAS Early Conciliation extends time
      let acasExtension = '';
      let finalDeadline = standardDeadline;
      
      if (params.hasContactedAcas && params.acasCertificateDate) {
        // Time stops during ACAS EC and adds at least 1 month
        const certDate = new Date(params.acasCertificateDate);
        if (certDate > standardDeadline) {
          finalDeadline = addDays(certDate, 30);
          acasExtension = 'Extended by ACAS Early Conciliation period';
        }
      }
      
      const remaining = daysUntil(finalDeadline);
      const isUrgent = remaining <= 14;
      
      const result: DeadlineResult = {
        deadlineType: 'Employment Tribunal Claim',
        calculatedDeadline: formatDate(finalDeadline),
        daysRemaining: remaining,
        isUrgent,
        description: `Based on an event date of ${formatDate(eventDate)}, the deadline for your ${params.eventType.replace('_', ' ')} claim is ${timeLimit} from that date.`,
        warnings: [
          remaining <= 0 ? '⚠️ DEADLINE MAY HAVE PASSED - Seek urgent legal advice' : '',
          remaining <= 7 ? '🚨 URGENT: Less than 1 week remaining' : '',
          remaining <= 14 ? '⚠️ Limited time remaining - act quickly' : '',
          !params.hasContactedAcas ? '📞 You MUST contact ACAS for Early Conciliation before making a claim' : '',
          acasExtension
        ].filter(Boolean),
        nextSteps: [
          !params.hasContactedAcas ? 'Contact ACAS immediately: 0300 123 1100 or www.acas.org.uk/early-conciliation' : '',
          'Gather evidence: contract, payslips, emails, witness details',
          'Complete ET1 form online at www.gov.uk/employment-tribunals/make-a-claim',
          'Consider seeking legal advice from a solicitor or Citizens Advice',
          'Check if you qualify for legal aid: www.gov.uk/legal-aid'
        ].filter(Boolean),
        relevantRules: 'Employment Tribunals (Constitution and Rules of Procedure) Regulations 2013'
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
      };
    }
  );

  // Benefits appeal deadline calculator
  server.tool(
    'calculate_benefits_appeal_deadline',
    'Calculate the deadline for appealing a benefits decision (PIP, UC, ESA, etc.)',
    {
      decisionDate: z.string().describe('Date on the decision letter (YYYY-MM-DD format)'),
      benefitType: z.enum([
        'pip',
        'universal_credit',
        'esa',
        'housing_benefit',
        'council_tax_reduction',
        'child_benefit',
        'state_pension',
        'attendance_allowance',
        'carers_allowance'
      ]).describe('Type of benefit'),
      hasMandatoryReconsideration: z.boolean().describe('Have you already requested a Mandatory Reconsideration?'),
      mandatoryReconsiderationDate: z.string().optional().describe('Date of MR decision letter (if applicable)')
    },
    async (params) => {
      const decisionDate = new Date(params.decisionDate);
      
      // Step 1: Mandatory Reconsideration deadline (1 month from decision)
      const mrDeadline = addDays(decisionDate, 30); // Usually "one month" interpreted as ~30 days
      
      let appealDeadline: Date;
      let currentStep: string;
      let deadlineDescription: string;
      
      if (!params.hasMandatoryReconsideration) {
        // User needs to do MR first
        appealDeadline = mrDeadline;
        currentStep = 'Mandatory Reconsideration';
        deadlineDescription = 'You must request a Mandatory Reconsideration before you can appeal to a tribunal.';
      } else if (params.mandatoryReconsiderationDate) {
        // User has MR, calculate tribunal appeal deadline (1 month from MR decision)
        const mrDate = new Date(params.mandatoryReconsiderationDate);
        appealDeadline = addDays(mrDate, 30);
        currentStep = 'Tribunal Appeal';
        deadlineDescription = 'You can now appeal to the First-tier Tribunal (Social Entitlement Chamber).';
      } else {
        // Has MR but no date - use decision date + 2 months as estimate
        appealDeadline = addDays(decisionDate, 60);
        currentStep = 'Tribunal Appeal (estimated)';
        deadlineDescription = 'Please provide your MR decision date for an accurate deadline.';
      }
      
      const remaining = daysUntil(appealDeadline);
      const isUrgent = remaining <= 14;
      
      const result: DeadlineResult = {
        deadlineType: `${params.benefitType.toUpperCase()} ${currentStep}`,
        calculatedDeadline: formatDate(appealDeadline),
        daysRemaining: remaining,
        isUrgent,
        description: deadlineDescription,
        warnings: [
          remaining <= 0 ? '⚠️ DEADLINE MAY HAVE PASSED - Late appeals are sometimes accepted with good reason' : '',
          remaining <= 7 ? '🚨 URGENT: Less than 1 week remaining' : '',
          remaining <= 14 ? '⚠️ Limited time remaining - act quickly' : '',
          'Keep your benefits claim going while you appeal',
          params.benefitType === 'pip' || params.benefitType === 'esa' ? 'You may be able to get the assessment component while appealing' : ''
        ].filter(Boolean),
        nextSteps: !params.hasMandatoryReconsideration ? [
          'Write to DWP requesting a Mandatory Reconsideration',
          'Explain why you think the decision is wrong',
          'Include any new medical evidence',
          'Keep a copy of everything you send',
          'Send by recorded delivery or keep proof of posting',
          'Call the benefit helpline to confirm they received it'
        ] : [
          'Complete form SSCS1 to appeal to the tribunal',
          'Submit online at www.gov.uk/appeal-benefit-decision',
          'Include the Mandatory Reconsideration notice',
          'Gather medical evidence to support your appeal',
          'Consider getting help from Citizens Advice or a welfare rights adviser',
          'You can request an oral hearing or paper-based decision'
        ],
        relevantRules: 'Tribunal Procedure (First-tier Tribunal) (Social Entitlement Chamber) Rules 2008'
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
      };
    }
  );

  // Housing/Eviction deadline calculator
  server.tool(
    'calculate_housing_deadline',
    'Calculate important housing-related deadlines including eviction notice periods and response times',
    {
      noticeType: z.enum([
        'section_21', // No-fault eviction (AST)
        'section_8', // Breach of tenancy
        'section_21_post_reform', // After Renters Reform
        'rent_increase',
        'disrepair_complaint',
        'housing_benefit_appeal',
        'homelessness_review'
      ]).describe('Type of housing notice or deadline'),
      noticeDate: z.string().describe('Date the notice was served/received (YYYY-MM-DD)'),
      tenancyType: z.enum(['assured_shorthold', 'assured', 'regulated', 'council', 'housing_association']).optional().describe('Type of tenancy'),
      additionalInfo: z.string().optional().describe('Any additional relevant information')
    },
    async (params) => {
      const noticeDate = new Date(params.noticeDate);
      let deadline: Date;
      let description: string;
      let nextSteps: string[];
      
      switch (params.noticeType) {
        case 'section_21':
          // Section 21 requires 2 months notice (may change with reform)
          deadline = addDays(noticeDate, 60);
          description = 'Section 21 "no-fault" eviction notice. The landlord must give at least 2 months\' notice. You do not have to leave until a court orders possession.';
          nextSteps = [
            'Check the notice is valid (correct form, deposit protected, etc.)',
            'You do NOT have to leave on the date in the notice',
            'Landlord must get a court order to evict you',
            'Get advice from Shelter: 0808 800 4444',
            'Contact your council about housing options',
            'Check if you can challenge the notice (revenge eviction, disrepair, etc.)'
          ];
          break;
          
        case 'section_8':
          // Section 8 varies by ground - using 2 weeks for rent arrears
          deadline = addDays(noticeDate, 14);
          description = 'Section 8 eviction for breach of tenancy. Notice period varies by ground (2 weeks to 2 months). Landlord must prove grounds in court.';
          nextSteps = [
            'Check which grounds the landlord is using',
            'Seek legal advice immediately',
            'If rent arrears: try to pay off arrears before court',
            'You have the right to defend the claim in court',
            'Apply for legal aid if eligible',
            'Contact Shelter for advice: 0808 800 4444'
          ];
          break;
          
        case 'rent_increase':
          deadline = addDays(noticeDate, 30);
          description = 'Rent increase notice. You may be able to challenge it if it\'s above market rate.';
          nextSteps = [
            'Check if your tenancy allows rent increases',
            'Compare with local market rents',
            'You can refer to a Tribunal within the notice period',
            'Apply to First-tier Tribunal (Property Chamber)',
            'Get advice from Citizens Advice on challenging increases'
          ];
          break;
          
        case 'homelessness_review':
          deadline = addDays(noticeDate, 21);
          description = 'You have 21 days to request a review of a homelessness decision.';
          nextSteps = [
            'Write to the council requesting a review within 21 days',
            'Explain why you think the decision is wrong',
            'Get help from Shelter or local advice service',
            'Ask for temporary accommodation while review is pending',
            'Gather evidence to support your case'
          ];
          break;
          
        default:
          deadline = addDays(noticeDate, 28);
          description = 'General housing deadline. Please specify the notice type for accurate information.';
          nextSteps = ['Contact Shelter or Citizens Advice for specific guidance'];
      }
      
      const remaining = daysUntil(deadline);
      const isUrgent = remaining <= 7;
      
      const result: DeadlineResult = {
        deadlineType: params.noticeType.replace(/_/g, ' ').toUpperCase(),
        calculatedDeadline: formatDate(deadline),
        daysRemaining: remaining,
        isUrgent,
        description,
        warnings: [
          remaining <= 0 ? '⚠️ DEADLINE MAY HAVE PASSED - Seek urgent advice' : '',
          remaining <= 7 ? '🚨 URGENT: Seek advice immediately' : '',
          params.noticeType.includes('section') ? '🏠 You do NOT have to leave until bailiffs arrive with a court order' : '',
          'Never ignore court papers - always respond'
        ].filter(Boolean),
        nextSteps,
        relevantRules: 'Housing Act 1988 (as amended)'
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
      };
    }
  );

  // General court/tribunal deadline calculator
  server.tool(
    'calculate_court_deadline',
    'Calculate general court and tribunal deadlines',
    {
      deadlineType: z.enum([
        'small_claims_response', // 14 days to respond
        'county_court_response', // 14 days
        'appeal_county_court', // 21 days
        'judicial_review', // 3 months
        'personal_injury_claim', // 3 years
        'contract_dispute', // 6 years
        'immigration_appeal', // 14 days
        'parking_charge_appeal' // 28 days
      ]).describe('Type of court deadline'),
      relevantDate: z.string().describe('Relevant date (claim served, judgment date, etc.) in YYYY-MM-DD format')
    },
    async (params) => {
      const startDate = new Date(params.relevantDate);
      
      const deadlineConfig: Record<string, { days: number; description: string; nextSteps: string[] }> = {
        small_claims_response: {
          days: 14,
          description: 'You have 14 days from service to respond to a small claims court claim.',
          nextSteps: [
            'Complete the response form (N9)',
            'State whether you admit, part-admit, or defend the claim',
            'If defending, explain your defence clearly',
            'Send response to the court by the deadline',
            'Keep copies of all documents'
          ]
        },
        county_court_response: {
          days: 14,
          description: 'You have 14 days from service to acknowledge/respond to a County Court claim.',
          nextSteps: [
            'File acknowledgement of service if you need more time (gives extra 14 days)',
            'Complete defence form (N9B)',
            'Consider whether to make a counterclaim',
            'Seek legal advice for complex claims',
            'Consider mediation as an alternative'
          ]
        },
        appeal_county_court: {
          days: 21,
          description: 'You have 21 days from the judgment date to appeal a County Court decision.',
          nextSteps: [
            'You need permission to appeal',
            'Complete form N161 (appeal notice)',
            'Explain grounds for appeal (judge made legal error)',
            'Pay the appeal fee',
            'Consider whether appeal has realistic prospect of success'
          ]
        },
        judicial_review: {
          days: 90,
          description: 'Judicial review claims must normally be filed within 3 months of the decision.',
          nextSteps: [
            'This is a strict deadline - act promptly',
            'Send pre-action letter to public body',
            'Seek specialist public law advice',
            'Check legal aid eligibility',
            'Some cases have shorter time limits (e.g., planning - 6 weeks)'
          ]
        },
        personal_injury_claim: {
          days: 1095, // 3 years
          description: 'Personal injury claims must generally be started within 3 years of the injury/knowledge.',
          nextSteps: [
            'See a solicitor - most offer free initial consultation',
            'Many personal injury solicitors work on "no win, no fee"',
            'Gather evidence: medical records, photos, witness details',
            'Keep records of all expenses and losses',
            'Time limits can be extended in some circumstances'
          ]
        },
        contract_dispute: {
          days: 2190, // 6 years
          description: 'Contract disputes must be brought within 6 years of the breach.',
          nextSteps: [
            'Send a letter before action',
            'Consider mediation first',
            'Gather all contract documents and correspondence',
            'Calculate your losses',
            'Consider whether small claims court applies (under £10,000)'
          ]
        },
        immigration_appeal: {
          days: 14,
          description: 'Immigration appeals must be lodged within 14 days of the decision (28 days if abroad).',
          nextSteps: [
            'This is a STRICT deadline',
            'Complete the appeal form immediately',
            'Seek immigration legal advice urgently',
            'Check if you qualify for legal aid',
            'Gather supporting evidence'
          ]
        },
        parking_charge_appeal: {
          days: 28,
          description: 'You have 28 days to appeal a parking charge notice.',
          nextSteps: [
            'Check which appeals service to use (POPLA or IAS)',
            'Gather evidence: photos, signage, ticket',
            'Common grounds: unclear signage, overstay due to emergency',
            'Appeal is free',
            'See Money Saving Expert guide for templates'
          ]
        }
      };
      
      const config = deadlineConfig[params.deadlineType];
      const deadline = addDays(startDate, config.days);
      const remaining = daysUntil(deadline);
      const isUrgent = remaining <= Math.min(7, config.days / 2);
      
      const result: DeadlineResult = {
        deadlineType: params.deadlineType.replace(/_/g, ' ').toUpperCase(),
        calculatedDeadline: formatDate(deadline),
        daysRemaining: remaining,
        isUrgent,
        description: config.description,
        warnings: [
          remaining <= 0 ? '⚠️ DEADLINE MAY HAVE PASSED - Seek urgent legal advice about extensions' : '',
          remaining <= 3 ? '🚨 CRITICAL: Less than 3 days remaining' : '',
          remaining <= 7 ? '⚠️ URGENT: Act immediately' : '',
          'Court deadlines are strictly enforced'
        ].filter(Boolean),
        nextSteps: config.nextSteps,
        relevantRules: 'Civil Procedure Rules / Tribunal Procedure Rules'
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
      };
    }
  );
}
