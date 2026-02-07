import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

/**
 * Benefits Calculator Tools
 * Provides eligibility checks for UK benefits including PIP, Universal Credit, etc.
 */

// PIP eligibility criteria
interface PIPEligibilityResult {
  eligible: boolean;
  dailyLivingPoints: number;
  mobilityPoints: number;
  dailyLivingRate: 'none' | 'standard' | 'enhanced';
  mobilityRate: 'none' | 'standard' | 'enhanced';
  estimatedWeeklyAmount: number;
  recommendation: string;
  nextSteps: string[];
  importantInfo: string[];
}

// Universal Credit calculation
interface UCCalculationResult {
  eligible: boolean;
  standardAllowance: number;
  childElement: number;
  housingElement: number;
  disabilityElement: number;
  carerElement: number;
  totalMonthlyAmount: number;
  deductions: number;
  netMonthlyAmount: number;
  nextSteps: string[];
}

export function registerBenefitsTools(server: McpServer): void {
  
  // PIP Eligibility Checker
  server.tool(
    'check_pip_eligibility',
    'Check eligibility for Personal Independence Payment (PIP) based on daily living and mobility needs. This provides an indicative assessment - formal assessment is required.',
    {
      age: z.number().min(16).max(150).describe('Age in years (must be 16-66 for new claims)'),
      hasCondition: z.boolean().describe('Do you have a health condition or disability?'),
      conditionDuration: z.enum(['less_than_3_months', '3_to_9_months', 'more_than_9_months']).describe('How long have you had this condition?'),
      expectedDuration: z.enum(['less_than_9_months', '9_months_or_more', 'lifelong']).describe('How long is the condition expected to last?'),
      
      // Daily Living Activities (scoring 0-12 for each)
      preparingFood: z.number().min(0).max(12).describe('Difficulty preparing food (0=none, 4=needs prompting, 8=needs assistance, 12=cannot do)'),
      eatingDrinking: z.number().min(0).max(12).describe('Difficulty eating and drinking'),
      managingTreatments: z.number().min(0).max(12).describe('Difficulty managing treatments/medications'),
      washingBathing: z.number().min(0).max(12).describe('Difficulty washing and bathing'),
      toiletNeeds: z.number().min(0).max(12).describe('Difficulty managing toilet needs'),
      dressingUndressing: z.number().min(0).max(12).describe('Difficulty dressing and undressing'),
      communicating: z.number().min(0).max(12).describe('Difficulty communicating verbally'),
      readingUnderstanding: z.number().min(0).max(12).describe('Difficulty reading and understanding signs'),
      engagingWithOthers: z.number().min(0).max(12).describe('Difficulty engaging with other people'),
      managingMoney: z.number().min(0).max(12).describe('Difficulty making budgeting decisions'),
      
      // Mobility Activities
      planningJourneys: z.number().min(0).max(12).describe('Difficulty planning and following journeys'),
      movingAround: z.number().min(0).max(12).describe('Difficulty moving around (0=50m+, 4=20-50m, 8=1-20m, 12=cannot move)')
    },
    async (params) => {
      // Calculate daily living points
      const dailyLivingPoints = 
        params.preparingFood +
        params.eatingDrinking +
        params.managingTreatments +
        params.washingBathing +
        params.toiletNeeds +
        params.dressingUndressing +
        params.communicating +
        params.readingUnderstanding +
        params.engagingWithOthers +
        params.managingMoney;

      // Calculate mobility points
      const mobilityPoints = params.planningJourneys + params.movingAround;

      // Determine rates
      let dailyLivingRate: 'none' | 'standard' | 'enhanced' = 'none';
      let mobilityRate: 'none' | 'standard' | 'enhanced' = 'none';

      if (dailyLivingPoints >= 12) {
        dailyLivingRate = 'enhanced';
      } else if (dailyLivingPoints >= 8) {
        dailyLivingRate = 'standard';
      }

      if (mobilityPoints >= 12) {
        mobilityRate = 'enhanced';
      } else if (mobilityPoints >= 8) {
        mobilityRate = 'standard';
      }

      // Weekly rates (2024/25 rates)
      const rates = {
        dailyLiving: { standard: 72.65, enhanced: 108.55 },
        mobility: { standard: 28.70, enhanced: 75.75 }
      };

      let weeklyAmount = 0;
      if (dailyLivingRate === 'standard') weeklyAmount += rates.dailyLiving.standard;
      if (dailyLivingRate === 'enhanced') weeklyAmount += rates.dailyLiving.enhanced;
      if (mobilityRate === 'standard') weeklyAmount += rates.mobility.standard;
      if (mobilityRate === 'enhanced') weeklyAmount += rates.mobility.enhanced;

      // Check basic eligibility
      const basicEligibility = 
        params.age >= 16 &&
        params.hasCondition &&
        (params.conditionDuration === 'more_than_9_months' || params.expectedDuration !== 'less_than_9_months');

      const eligible = basicEligibility && (dailyLivingPoints >= 8 || mobilityPoints >= 8);

      const result: PIPEligibilityResult = {
        eligible,
        dailyLivingPoints,
        mobilityPoints,
        dailyLivingRate,
        mobilityRate,
        estimatedWeeklyAmount: weeklyAmount,
        recommendation: eligible 
          ? `Based on your answers, you may be eligible for PIP with ${dailyLivingRate} daily living and ${mobilityRate} mobility components.`
          : 'Based on your answers, you may not currently meet the threshold for PIP. However, this is only an indicative assessment.',
        nextSteps: eligible ? [
          'Call the PIP claim line: 0800 917 2222',
          'Request a PIP claim form (PIP1)',
          'Complete the "How your disability affects you" form (PIP2)',
          'Gather medical evidence from your GP, consultant, or care providers',
          'Attend a face-to-face assessment if requested'
        ] : [
          'Consider requesting a review of a previous decision if applicable',
          'Speak to Citizens Advice for a full benefits check',
          'Check if you qualify for other benefits like Attendance Allowance (if over 65)',
          'Contact a welfare rights adviser for a detailed assessment'
        ],
        importantInfo: [
          'This is an indicative assessment only - the actual decision is made by the DWP',
          'PIP assessments consider how conditions affect you on your worst days',
          'You can claim PIP whether or not you work',
          'PIP is not means-tested - your income and savings don\'t affect eligibility',
          params.age >= 65 ? 'Note: If you\'re over State Pension age, you cannot make a new claim but can continue existing claims' : ''
        ].filter(Boolean)
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
      };
    }
  );

  // Universal Credit Calculator
  server.tool(
    'calculate_universal_credit',
    'Calculate estimated Universal Credit entitlement based on circumstances',
    {
      age: z.number().min(18).max(150).describe('Your age'),
      isSingle: z.boolean().describe('Are you single (not in a couple)?'),
      partnerAge: z.number().optional().describe('Partner\'s age if in a couple'),
      numberOfChildren: z.number().min(0).max(20).describe('Number of dependent children'),
      childrenAges: z.array(z.number()).optional().describe('Ages of children'),
      monthlyEarnings: z.number().min(0).describe('Your monthly earnings after tax'),
      partnerMonthlyEarnings: z.number().optional().describe('Partner\'s monthly earnings if applicable'),
      monthlyRent: z.number().min(0).describe('Monthly rent amount'),
      isInSupportGroup: z.boolean().describe('Are you in the ESA Support Group or have Limited Capability for Work?'),
      hasCarerResponsibilities: z.boolean().describe('Do you have caring responsibilities for a disabled person?'),
      hasChildcare: z.boolean().describe('Do you pay for registered childcare?'),
      monthlyChildcareCosts: z.number().optional().describe('Monthly childcare costs if applicable'),
      localHousingAllowance: z.number().optional().describe('Local Housing Allowance rate for your area (if known)'),
      hasCapital: z.number().min(0).describe('Total savings and capital')
    },
    async (params) => {
      // 2024/25 rates
      const standardAllowances = {
        single_under_25: 311.68,
        single_25_plus: 393.45,
        couple_both_under_25: 489.23,
        couple_one_25_plus: 617.60
      };

      // Determine standard allowance
      let standardAllowance: number;
      if (params.isSingle) {
        standardAllowance = params.age < 25 ? standardAllowances.single_under_25 : standardAllowances.single_25_plus;
      } else {
        const partnerAge = params.partnerAge || 25;
        standardAllowance = (params.age < 25 && partnerAge < 25) 
          ? standardAllowances.couple_both_under_25 
          : standardAllowances.couple_one_25_plus;
      }

      // Child element (first child £333.33, subsequent £285.94)
      let childElement = 0;
      if (params.numberOfChildren > 0) {
        childElement = 333.33 + Math.max(0, params.numberOfChildren - 1) * 285.94;
      }

      // Disabled child additions would go here (simplified)
      
      // Housing element (simplified - uses rent or LHA, whichever is lower)
      const housingElement = Math.min(
        params.monthlyRent,
        params.localHousingAllowance || params.monthlyRent
      );

      // Limited capability for work element
      const disabilityElement = params.isInSupportGroup ? 416.19 : 0;

      // Carer element
      const carerElement = params.hasCarerResponsibilities ? 198.31 : 0;

      // Childcare element (85% of costs up to limits)
      let childcareElement = 0;
      if (params.hasChildcare && params.monthlyChildcareCosts) {
        const maxChildcare = params.numberOfChildren === 1 ? 1014.63 : 1739.37;
        childcareElement = Math.min(params.monthlyChildcareCosts * 0.85, maxChildcare);
      }

      // Total before deductions
      const totalBeforeDeductions = standardAllowance + childElement + housingElement + disabilityElement + carerElement + childcareElement;

      // Calculate earnings deduction (55p for every £1 earned above work allowance)
      const workAllowance = params.monthlyRent > 0 ? 404 : 673; // Lower if getting housing costs
      const totalEarnings = params.monthlyEarnings + (params.partnerMonthlyEarnings || 0);
      const earningsAboveAllowance = Math.max(0, totalEarnings - workAllowance);
      const earningsDeduction = earningsAboveAllowance * 0.55;

      // Capital rules
      let capitalDeduction = 0;
      let capitalEligible = true;
      if (params.hasCapital > 16000) {
        capitalEligible = false;
      } else if (params.hasCapital > 6000) {
        capitalDeduction = Math.floor((params.hasCapital - 6000) / 250) * 4.35;
      }

      const totalDeductions = earningsDeduction + capitalDeduction;
      const netAmount = Math.max(0, totalBeforeDeductions - totalDeductions);

      const result: UCCalculationResult = {
        eligible: capitalEligible && netAmount > 0,
        standardAllowance,
        childElement,
        housingElement,
        disabilityElement,
        carerElement,
        totalMonthlyAmount: totalBeforeDeductions,
        deductions: totalDeductions,
        netMonthlyAmount: netAmount,
        nextSteps: [
          'Apply online at www.gov.uk/apply-universal-credit',
          'You\'ll need: bank details, rent agreement, proof of identity',
          'Book an appointment at your local Jobcentre Plus',
          'Note: First payment is usually 5 weeks after claiming',
          'Ask about an Advance Payment if you need money urgently'
        ]
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
      };
    }
  );

  // Benefits eligibility overview
  server.tool(
    'check_benefits_overview',
    'Get an overview of benefits you might be eligible for based on your circumstances',
    {
      age: z.number().min(0).max(150).describe('Your age'),
      isWorking: z.boolean().describe('Are you currently working?'),
      hoursPerWeek: z.number().optional().describe('Hours worked per week if employed'),
      hasDisability: z.boolean().describe('Do you have a disability or health condition?'),
      hasChildren: z.boolean().describe('Do you have dependent children?'),
      isCarer: z.boolean().describe('Do you care for someone with a disability?'),
      isPregnant: z.boolean().describe('Are you pregnant?'),
      housingStatus: z.enum(['own_outright', 'mortgage', 'renting', 'homeless', 'living_with_family']).describe('Your housing situation'),
      weeklyIncome: z.number().min(0).describe('Your weekly income'),
      savings: z.number().min(0).describe('Total savings')
    },
    async (params) => {
      const potentialBenefits: Array<{ name: string; likelihood: string; description: string; link: string }> = [];

      // Universal Credit
      if (params.savings < 16000 && params.age >= 18) {
        potentialBenefits.push({
          name: 'Universal Credit',
          likelihood: 'high',
          description: 'Main benefit for working-age people on low income',
          link: 'https://www.gov.uk/universal-credit'
        });
      }

      // PIP
      if (params.hasDisability && params.age >= 16 && params.age < 66) {
        potentialBenefits.push({
          name: 'Personal Independence Payment (PIP)',
          likelihood: 'medium',
          description: 'Help with extra living costs if you have a long-term health condition or disability',
          link: 'https://www.gov.uk/pip'
        });
      }

      // Attendance Allowance
      if (params.hasDisability && params.age >= 65) {
        potentialBenefits.push({
          name: 'Attendance Allowance',
          likelihood: 'medium',
          description: 'For people over State Pension age who need help with personal care',
          link: 'https://www.gov.uk/attendance-allowance'
        });
      }

      // Carer's Allowance
      if (params.isCarer && (!params.isWorking || (params.hoursPerWeek || 0) < 35)) {
        potentialBenefits.push({
          name: "Carer's Allowance",
          likelihood: 'high',
          description: 'If you care for someone for at least 35 hours a week',
          link: 'https://www.gov.uk/carers-allowance'
        });
      }

      // Child Benefit
      if (params.hasChildren) {
        potentialBenefits.push({
          name: 'Child Benefit',
          likelihood: 'high',
          description: 'For anyone responsible for children under 16 (or under 20 in education)',
          link: 'https://www.gov.uk/child-benefit'
        });
      }

      // Housing Benefit / UC Housing Element
      if (params.housingStatus === 'renting' && params.savings < 16000) {
        potentialBenefits.push({
          name: 'Help with Housing Costs',
          likelihood: 'high',
          description: 'Help paying rent through Universal Credit housing element',
          link: 'https://www.gov.uk/housing-and-universal-credit'
        });
      }

      // Council Tax Reduction
      if (params.weeklyIncome < 500 || params.hasDisability) {
        potentialBenefits.push({
          name: 'Council Tax Reduction',
          likelihood: 'medium',
          description: 'Reduction in council tax based on income',
          link: 'https://www.gov.uk/council-tax-reduction'
        });
      }

      // State Pension
      if (params.age >= 66) {
        potentialBenefits.push({
          name: 'State Pension',
          likelihood: 'high',
          description: 'Regular payment from the government once you reach State Pension age',
          link: 'https://www.gov.uk/state-pension'
        });
      }

      // Pension Credit
      if (params.age >= 66 && params.weeklyIncome < 300) {
        potentialBenefits.push({
          name: 'Pension Credit',
          likelihood: 'high',
          description: 'Extra money if you\'re over State Pension age and on a low income',
          link: 'https://www.gov.uk/pension-credit'
        });
      }

      // Sure Start Maternity Grant
      if (params.isPregnant && params.savings < 16000) {
        potentialBenefits.push({
          name: 'Sure Start Maternity Grant',
          likelihood: 'medium',
          description: '£500 one-off payment for your first child if on certain benefits',
          link: 'https://www.gov.uk/sure-start-maternity-grant'
        });
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            potentialBenefits,
            recommendation: 'Use the benefits calculator at https://www.entitledto.co.uk for a detailed calculation',
            nextSteps: [
              'Contact Citizens Advice for a full benefits check',
              'Use the Turn2us benefits calculator: https://www.turn2us.org.uk',
              'Check each benefit\'s eligibility criteria on GOV.UK'
            ]
          }, null, 2)
        }]
      };
    }
  );
}
