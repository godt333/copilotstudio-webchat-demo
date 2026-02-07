import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

/**
 * Legal Aid Eligibility Tools
 * Check eligibility for legal aid in England and Wales.
 */

interface LegalAidResult {
  likelyEligible: boolean;
  meansTestRequired: boolean;
  category: string;
  financialEligibility: 'likely_eligible' | 'likely_ineligible' | 'borderline';
  explanation: string;
  nextSteps: string[];
  importantNotes: string[];
}

export function registerLegalAidTools(server: McpServer): void {
  
  // Check legal aid eligibility
  server.tool(
    'check_legal_aid_eligibility',
    'Check if you might be eligible for legal aid in England and Wales. Legal aid provides free legal help for those who qualify.',
    {
      caseType: z.enum([
        'housing_eviction',
        'housing_disrepair',
        'domestic_abuse',
        'family_children',
        'family_divorce',
        'debt',
        'welfare_benefits',
        'immigration',
        'asylum',
        'community_care',
        'mental_health',
        'discrimination',
        'criminal',
        'inquests',
        'judicial_review',
        'education_special_needs',
        'clinical_negligence'
      ]).describe('Type of legal case'),
      
      // Means test - income
      monthlyIncome: z.number().min(0).describe('Your gross monthly income (before tax)'),
      partnerIncome: z.number().optional().describe('Partner\'s gross monthly income if applicable'),
      hasPartner: z.boolean().describe('Do you have a partner you live with?'),
      
      // Means test - capital
      savings: z.number().min(0).describe('Total savings and investments'),
      propertyEquity: z.number().optional().describe('Equity in your home (value minus mortgage)'),
      
      // Means test - outgoings
      monthlyRent: z.number().min(0).describe('Monthly rent or mortgage'),
      councilTax: z.number().min(0).describe('Monthly council tax'),
      childcareCosts: z.number().optional().describe('Monthly childcare costs'),
      numberOfDependants: z.number().min(0).describe('Number of dependent children'),
      
      // Passporting benefits
      receivesPassportingBenefit: z.boolean().describe('Do you receive Income Support, Income-based JSA, Income-related ESA, Universal Credit, or Guarantee Pension Credit?'),
      
      // Special circumstances
      isUnder18: z.boolean().describe('Are you under 18?'),
      domesticAbuseVictim: z.boolean().describe('Are you a victim of domestic abuse?'),
      isAsylumSeeker: z.boolean().describe('Are you an asylum seeker?')
    },
    async (params) => {
      // Categories that ARE in scope for legal aid
      const inScopeCategories = [
        'housing_eviction', // Loss of home
        'housing_disrepair', // Only if serious risk to health/safety
        'domestic_abuse',
        'family_children', // Only child protection/abduction
        'immigration', // Limited scope
        'asylum', // Full scope
        'community_care',
        'mental_health',
        'criminal',
        'inquests', // Limited
        'judicial_review',
        'education_special_needs'
      ];
      
      // Categories generally NOT in scope
      const outOfScopeCategories = [
        'family_divorce', // Generally not covered
        'debt', // Generally not covered (except housing-related)
        'welfare_benefits', // Generally not covered
        'discrimination', // Generally not covered
        'clinical_negligence' // Generally not covered (but CFA available)
      ];
      
      const isInScope = inScopeCategories.includes(params.caseType);
      
      // Special automatic eligibility
      const automaticEligibility = 
        params.domesticAbuseVictim ||
        params.isAsylumSeeker ||
        params.isUnder18 ||
        params.caseType === 'mental_health';
      
      // Means test calculation
      const totalIncome = params.monthlyIncome + (params.hasPartner ? (params.partnerIncome || 0) : 0);
      
      // Disposable income calculation (simplified)
      const dependantAllowance = params.numberOfDependants * 300; // Approximate
      const housingAllowance = Math.min(params.monthlyRent, 545); // Cap
      const taxAllowance = totalIncome * 0.2; // Approximate tax/NI
      
      const disposableIncome = totalIncome - housingAllowance - (params.councilTax || 0) 
        - (params.childcareCosts || 0) - dependantAllowance - taxAllowance;
      
      // Capital calculation
      let assessableCapital = params.savings;
      if (params.propertyEquity && params.propertyEquity > 100000) {
        assessableCapital += params.propertyEquity - 100000; // Equity over £100k counts
      }
      
      // Eligibility thresholds (approximate 2024 figures)
      const incomeThreshold = 733; // Monthly disposable income
      const capitalThreshold = 8000; // Civil cases
      
      // Passporting check
      const passported = params.receivesPassportingBenefit;
      
      // Determine financial eligibility
      let financialEligibility: 'likely_eligible' | 'likely_ineligible' | 'borderline';
      if (passported) {
        financialEligibility = 'likely_eligible';
      } else if (disposableIncome > incomeThreshold * 1.2 || assessableCapital > capitalThreshold) {
        financialEligibility = 'likely_ineligible';
      } else if (disposableIncome < incomeThreshold && assessableCapital < capitalThreshold) {
        financialEligibility = 'likely_eligible';
      } else {
        financialEligibility = 'borderline';
      }
      
      // Overall eligibility
      const likelyEligible = isInScope && (automaticEligibility || financialEligibility === 'likely_eligible');
      
      // Generate explanation
      let explanation = '';
      if (!isInScope) {
        explanation = `Unfortunately, ${params.caseType.replace(/_/g, ' ')} is generally NOT covered by legal aid since the 2012 reforms. However, there may be exceptions.`;
      } else if (automaticEligibility) {
        explanation = 'You may qualify for legal aid without a full means test due to your circumstances.';
      } else if (passported) {
        explanation = 'Because you receive a passporting benefit, you automatically pass the financial test for legal aid.';
      } else if (financialEligibility === 'likely_eligible') {
        explanation = 'Based on your financial information, you appear likely to pass the means test for legal aid.';
      } else if (financialEligibility === 'borderline') {
        explanation = 'Your financial situation is borderline. A full assessment would be needed to confirm eligibility.';
      } else {
        explanation = 'Based on your financial information, you may not qualify for legal aid. However, you may still be eligible for a contribution-based scheme or have other options.';
      }
      
      const result: LegalAidResult = {
        likelyEligible,
        meansTestRequired: !automaticEligibility && !passported,
        category: params.caseType.replace(/_/g, ' ').toUpperCase(),
        financialEligibility,
        explanation,
        nextSteps: likelyEligible ? [
          'Find a legal aid solicitor: gov.uk/legal-aid/find-a-legal-adviser',
          'Call Civil Legal Advice: 0345 345 4345',
          'Gather evidence of income and capital',
          'Collect evidence about your case'
        ] : [
          'Consider other options below',
          'Check if exceptional case funding applies: gov.uk/legal-aid/apply',
          'Look for pro bono help: weareadvocate.org.uk',
          'Check if a law centre can help: lawcentres.org.uk',
          'For injury/negligence: consider "no win, no fee" solicitors'
        ],
        importantNotes: [
          'This is an indicative check only - formal assessment required',
          isInScope ? 'Your case type is generally in scope for legal aid' : 'Your case type is generally NOT in scope - but exceptions exist',
          params.caseType === 'domestic_abuse' ? 'Domestic abuse cases have wider eligibility - evidence of abuse often sufficient' : '',
          params.caseType === 'asylum' ? 'Asylum cases have full legal aid scope' : '',
          financialEligibility === 'borderline' ? 'You may qualify for "contributory" legal aid where you pay some costs' : '',
          'Free initial advice may be available even if full legal aid is not'
        ].filter(Boolean)
      };

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            ...result,
            alternativeHelp: {
              lawCentres: 'https://www.lawcentres.org.uk/ - Free legal advice',
              citizensAdvice: 'https://www.citizensadvice.org.uk - Free advice',
              advocate: 'https://weareadvocate.org.uk/ - Pro bono barristers',
              lawWorks: 'https://www.lawworks.org.uk/ - Free legal clinics',
              civilLegalAdvice: '0345 345 4345 - Free legal advice helpline'
            }
          }, null, 2)
        }]
      };
    }
  );

  // Find legal aid solicitor
  server.tool(
    'find_legal_help',
    'Find sources of free or affordable legal help',
    {
      caseType: z.enum([
        'housing',
        'employment',
        'benefits',
        'debt',
        'family',
        'immigration',
        'consumer',
        'discrimination',
        'crime_victim',
        'general'
      ]).describe('Type of legal issue'),
      postcode: z.string().optional().describe('Your postcode for local services')
    },
    async (params) => {
      const helpSources: Record<string, Array<{ name: string; description: string; contact: string; website: string }>> = {
        housing: [
          { name: 'Shelter', description: 'Expert housing advice and legal help', contact: '0808 800 4444', website: 'https://www.shelter.org.uk' },
          { name: 'Citizens Advice', description: 'Free housing advice', contact: '0800 144 8848', website: 'https://www.citizensadvice.org.uk/housing/' },
          { name: 'Legal Aid', description: 'For eviction cases', contact: '0345 345 4345', website: 'https://www.gov.uk/legal-aid' }
        ],
        employment: [
          { name: 'ACAS', description: 'Employment advice and early conciliation', contact: '0300 123 1100', website: 'https://www.acas.org.uk' },
          { name: 'Citizens Advice', description: 'Employment rights advice', contact: '0800 144 8848', website: 'https://www.citizensadvice.org.uk/work/' },
          { name: 'Working Families', description: 'Work-life balance rights', contact: '0300 012 0312', website: 'https://workingfamilies.org.uk' }
        ],
        benefits: [
          { name: 'Citizens Advice', description: 'Benefits advice and appeals help', contact: '0800 144 8848', website: 'https://www.citizensadvice.org.uk/benefits/' },
          { name: 'Turn2us', description: 'Benefits calculator and grants', contact: 'Online', website: 'https://www.turn2us.org.uk' },
          { name: 'Disability Rights UK', description: 'Disability benefits advice', contact: 'Online', website: 'https://www.disabilityrightsuk.org' }
        ],
        debt: [
          { name: 'StepChange', description: 'Free debt advice and solutions', contact: '0800 138 1111', website: 'https://www.stepchange.org' },
          { name: 'National Debtline', description: 'Free debt advice', contact: '0808 808 4000', website: 'https://www.nationaldebtline.org' },
          { name: 'Money Helper', description: 'Government debt guidance', contact: '0800 138 7777', website: 'https://www.moneyhelper.org.uk' }
        ],
        family: [
          { name: 'Family Mediation Council', description: 'Find a mediator', contact: 'Online', website: 'https://www.familymediationcouncil.org.uk' },
          { name: 'National Domestic Abuse Helpline', description: '24/7 support', contact: '0808 2000 247', website: 'https://www.nationaldahelpline.org.uk' },
          { name: 'Relate', description: 'Relationship advice', contact: '0300 003 0396', website: 'https://www.relate.org.uk' }
        ],
        immigration: [
          { name: 'Right to Remain', description: 'Immigration guidance', contact: 'Online', website: 'https://righttoremain.org.uk' },
          { name: 'Refugee Council', description: 'Refugee support', contact: '020 7346 6700', website: 'https://www.refugeecouncil.org.uk' },
          { name: 'JCWI', description: 'Immigration rights', contact: 'Online', website: 'https://www.jcwi.org.uk' }
        ],
        consumer: [
          { name: 'Citizens Advice Consumer', description: 'Consumer rights helpline', contact: '0808 223 1133', website: 'https://www.citizensadvice.org.uk/consumer/' },
          { name: 'Which?', description: 'Consumer rights guidance', contact: 'Online', website: 'https://www.which.co.uk/consumer-rights/' },
          { name: 'Financial Ombudsman', description: 'Financial complaints', contact: '0800 023 4567', website: 'https://www.financial-ombudsman.org.uk' }
        ],
        discrimination: [
          { name: 'Equality Advisory Service', description: 'Discrimination advice', contact: '0808 800 0082', website: 'https://www.equalityadvisoryservice.com' },
          { name: 'ACAS', description: 'Workplace discrimination', contact: '0300 123 1100', website: 'https://www.acas.org.uk' },
          { name: 'Citizens Advice', description: 'General discrimination advice', contact: '0800 144 8848', website: 'https://www.citizensadvice.org.uk' }
        ],
        crime_victim: [
          { name: 'Victim Support', description: 'Support for crime victims', contact: '0808 168 9111', website: 'https://www.victimsupport.org.uk' },
          { name: 'CICA', description: 'Criminal injuries compensation', contact: '0300 003 3601', website: 'https://www.gov.uk/claim-compensation-criminal-injury' },
          { name: 'Refuge', description: 'Domestic abuse support', contact: '0808 2000 247', website: 'https://www.refuge.org.uk' }
        ],
        general: [
          { name: 'Citizens Advice', description: 'Free advice on any topic', contact: '0800 144 8848', website: 'https://www.citizensadvice.org.uk' },
          { name: 'LawWorks', description: 'Pro bono legal clinics', contact: 'Online', website: 'https://www.lawworks.org.uk' },
          { name: 'Advocate', description: 'Free legal help from barristers', contact: 'Online', website: 'https://weareadvocate.org.uk' },
          { name: 'Law Centres Network', description: 'Free legal advice centres', contact: 'Online', website: 'https://www.lawcentres.org.uk' }
        ]
      };

      const sources = helpSources[params.caseType] || helpSources.general;
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            caseType: params.caseType,
            freeHelpSources: sources,
            generalResources: [
              {
                name: 'Find a Legal Aid Solicitor',
                website: 'https://www.gov.uk/legal-aid/find-a-legal-adviser'
              },
              {
                name: 'Civil Legal Advice',
                contact: '0345 345 4345',
                description: 'Free legal advice if you qualify for legal aid'
              },
              {
                name: 'Law Society - Find a Solicitor',
                website: 'https://solicitors.lawsociety.org.uk/'
              }
            ],
            tip: 'Many organisations offer free initial consultations. Always ask about fees upfront.'
          }, null, 2)
        }]
      };
    }
  );
}
