import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { runQuery } from '../database/init.js';

/**
 * Postcode Lookup Tools
 * Find local services based on postcode including Citizens Advice offices,
 * housing services, legal aid providers, and more.
 */

interface LocalService {
  service_type: string;
  service_name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  opening_hours: string | null;
  distance?: string;
}

interface PostcodeInfo {
  postcode: string;
  postcodeArea: string;
  region: string;
  country: 'England' | 'Wales' | 'Scotland' | 'Northern Ireland';
  localAuthority: string;
}

// UK postcode to region/country mapping (simplified)
const postcodeRegions: Record<string, { region: string; country: 'England' | 'Wales' | 'Scotland' | 'Northern Ireland' }> = {
  'AB': { region: 'North East Scotland', country: 'Scotland' },
  'B': { region: 'West Midlands', country: 'England' },
  'BA': { region: 'South West', country: 'England' },
  'BB': { region: 'North West', country: 'England' },
  'BD': { region: 'Yorkshire', country: 'England' },
  'BL': { region: 'North West', country: 'England' },
  'BN': { region: 'South East', country: 'England' },
  'BR': { region: 'London', country: 'England' },
  'BS': { region: 'South West', country: 'England' },
  'BT': { region: 'Northern Ireland', country: 'Northern Ireland' },
  'CA': { region: 'North West', country: 'England' },
  'CB': { region: 'East of England', country: 'England' },
  'CF': { region: 'South Wales', country: 'Wales' },
  'CH': { region: 'North West', country: 'England' },
  'CM': { region: 'East of England', country: 'England' },
  'CO': { region: 'East of England', country: 'England' },
  'CR': { region: 'London', country: 'England' },
  'CT': { region: 'South East', country: 'England' },
  'CV': { region: 'West Midlands', country: 'England' },
  'CW': { region: 'North West', country: 'England' },
  'DA': { region: 'London', country: 'England' },
  'DD': { region: 'East Scotland', country: 'Scotland' },
  'DE': { region: 'East Midlands', country: 'England' },
  'DG': { region: 'South Scotland', country: 'Scotland' },
  'DH': { region: 'North East', country: 'England' },
  'DL': { region: 'North East', country: 'England' },
  'DN': { region: 'Yorkshire', country: 'England' },
  'DT': { region: 'South West', country: 'England' },
  'DY': { region: 'West Midlands', country: 'England' },
  'E': { region: 'London', country: 'England' },
  'EC': { region: 'London', country: 'England' },
  'EH': { region: 'East Scotland', country: 'Scotland' },
  'EN': { region: 'London', country: 'England' },
  'EX': { region: 'South West', country: 'England' },
  'FK': { region: 'Central Scotland', country: 'Scotland' },
  'FY': { region: 'North West', country: 'England' },
  'G': { region: 'West Scotland', country: 'Scotland' },
  'GL': { region: 'South West', country: 'England' },
  'GU': { region: 'South East', country: 'England' },
  'HA': { region: 'London', country: 'England' },
  'HD': { region: 'Yorkshire', country: 'England' },
  'HG': { region: 'Yorkshire', country: 'England' },
  'HP': { region: 'South East', country: 'England' },
  'HR': { region: 'West Midlands', country: 'England' },
  'HS': { region: 'Highlands and Islands', country: 'Scotland' },
  'HU': { region: 'Yorkshire', country: 'England' },
  'HX': { region: 'Yorkshire', country: 'England' },
  'IG': { region: 'London', country: 'England' },
  'IP': { region: 'East of England', country: 'England' },
  'IV': { region: 'Highlands and Islands', country: 'Scotland' },
  'KA': { region: 'West Scotland', country: 'Scotland' },
  'KT': { region: 'London', country: 'England' },
  'KW': { region: 'Highlands and Islands', country: 'Scotland' },
  'KY': { region: 'East Scotland', country: 'Scotland' },
  'L': { region: 'North West', country: 'England' },
  'LA': { region: 'North West', country: 'England' },
  'LD': { region: 'Mid Wales', country: 'Wales' },
  'LE': { region: 'East Midlands', country: 'England' },
  'LL': { region: 'North Wales', country: 'Wales' },
  'LN': { region: 'East Midlands', country: 'England' },
  'LS': { region: 'Yorkshire', country: 'England' },
  'LU': { region: 'East of England', country: 'England' },
  'M': { region: 'North West', country: 'England' },
  'ME': { region: 'South East', country: 'England' },
  'MK': { region: 'South East', country: 'England' },
  'ML': { region: 'West Scotland', country: 'Scotland' },
  'N': { region: 'London', country: 'England' },
  'NE': { region: 'North East', country: 'England' },
  'NG': { region: 'East Midlands', country: 'England' },
  'NN': { region: 'East Midlands', country: 'England' },
  'NP': { region: 'South Wales', country: 'Wales' },
  'NR': { region: 'East of England', country: 'England' },
  'NW': { region: 'London', country: 'England' },
  'OL': { region: 'North West', country: 'England' },
  'OX': { region: 'South East', country: 'England' },
  'PA': { region: 'West Scotland', country: 'Scotland' },
  'PE': { region: 'East of England', country: 'England' },
  'PH': { region: 'Highlands and Islands', country: 'Scotland' },
  'PL': { region: 'South West', country: 'England' },
  'PO': { region: 'South East', country: 'England' },
  'PR': { region: 'North West', country: 'England' },
  'RG': { region: 'South East', country: 'England' },
  'RH': { region: 'South East', country: 'England' },
  'RM': { region: 'London', country: 'England' },
  'S': { region: 'Yorkshire', country: 'England' },
  'SA': { region: 'South Wales', country: 'Wales' },
  'SE': { region: 'London', country: 'England' },
  'SG': { region: 'East of England', country: 'England' },
  'SK': { region: 'North West', country: 'England' },
  'SL': { region: 'South East', country: 'England' },
  'SM': { region: 'London', country: 'England' },
  'SN': { region: 'South West', country: 'England' },
  'SO': { region: 'South East', country: 'England' },
  'SP': { region: 'South West', country: 'England' },
  'SR': { region: 'North East', country: 'England' },
  'SS': { region: 'East of England', country: 'England' },
  'ST': { region: 'West Midlands', country: 'England' },
  'SW': { region: 'London', country: 'England' },
  'SY': { region: 'West Midlands', country: 'England' },
  'TA': { region: 'South West', country: 'England' },
  'TD': { region: 'South Scotland', country: 'Scotland' },
  'TF': { region: 'West Midlands', country: 'England' },
  'TN': { region: 'South East', country: 'England' },
  'TQ': { region: 'South West', country: 'England' },
  'TR': { region: 'South West', country: 'England' },
  'TS': { region: 'North East', country: 'England' },
  'TW': { region: 'London', country: 'England' },
  'UB': { region: 'London', country: 'England' },
  'W': { region: 'London', country: 'England' },
  'WA': { region: 'North West', country: 'England' },
  'WC': { region: 'London', country: 'England' },
  'WD': { region: 'East of England', country: 'England' },
  'WF': { region: 'Yorkshire', country: 'England' },
  'WN': { region: 'North West', country: 'England' },
  'WR': { region: 'West Midlands', country: 'England' },
  'WS': { region: 'West Midlands', country: 'England' },
  'WV': { region: 'West Midlands', country: 'England' },
  'YO': { region: 'Yorkshire', country: 'England' },
  'ZE': { region: 'Shetland', country: 'Scotland' },
};

function extractPostcodeArea(postcode: string): string {
  const cleaned = postcode.toUpperCase().replace(/\s/g, '');
  // Match 1-2 letters at the start
  const match = cleaned.match(/^([A-Z]{1,2})/);
  return match ? match[1] : '';
}

function getPostcodeInfo(postcode: string): PostcodeInfo {
  const area = extractPostcodeArea(postcode);
  const regionInfo = postcodeRegions[area] || { region: 'Unknown', country: 'England' as const };
  
  return {
    postcode: postcode.toUpperCase(),
    postcodeArea: area,
    region: regionInfo.region,
    country: regionInfo.country,
    localAuthority: 'Contact local council for details'
  };
}

export function registerPostcodeTools(server: McpServer): void {
  
  // Find local services by postcode
  server.tool(
    'find_local_services',
    'Find local advice services, Citizens Advice offices, housing support, and other services near a postcode',
    {
      postcode: z.string().describe('UK postcode to search near'),
      serviceType: z.enum([
        'all',
        'citizens_advice',
        'housing',
        'legal_aid',
        'employment',
        'debt_advice',
        'food_bank',
        'mental_health'
      ]).optional().default('all').describe('Type of service to find')
    },
    async (params) => {
      const postcodeInfo = getPostcodeInfo(params.postcode);
      
      // Query local services
      let query = `
        SELECT service_type, service_name, address, phone, email, website, opening_hours
        FROM local_services
        WHERE postcode_area = ?
      `;
      const queryParams: unknown[] = [postcodeInfo.postcodeArea];
      
      if (params.serviceType !== 'all') {
        query += ' AND service_type = ?';
        queryParams.push(params.serviceType);
      }
      
      const services = runQuery<LocalService>(query, queryParams);
      
      // Add national services based on country
      const nationalServices: LocalService[] = [];
      
      // Citizens Advice contact based on country
      if (postcodeInfo.country === 'Scotland') {
        nationalServices.push({
          service_type: 'citizens_advice',
          service_name: 'Citizens Advice Scotland Helpline',
          address: null,
          phone: '0800 028 1456',
          email: null,
          website: 'https://www.citizensadvice.org.uk/scotland/',
          opening_hours: 'Mon-Fri 9am-5pm'
        });
      } else if (postcodeInfo.country === 'Northern Ireland') {
        nationalServices.push({
          service_type: 'citizens_advice',
          service_name: 'Advice NI',
          address: null,
          phone: '0800 915 4604',
          email: null,
          website: 'https://www.adviceni.net',
          opening_hours: 'Mon-Fri 9am-5pm'
        });
      } else if (postcodeInfo.country === 'Wales') {
        nationalServices.push({
          service_type: 'citizens_advice',
          service_name: 'Citizens Advice Wales',
          address: null,
          phone: '0800 702 2020',
          email: null,
          website: 'https://www.citizensadvice.org.uk/wales/',
          opening_hours: 'Mon-Fri 9am-5pm'
        });
      } else {
        nationalServices.push({
          service_type: 'citizens_advice',
          service_name: 'Citizens Advice National Helpline',
          address: null,
          phone: '0800 144 8848',
          email: null,
          website: 'https://www.citizensadvice.org.uk',
          opening_hours: 'Mon-Fri 9am-5pm'
        });
      }
      
      // Add Shelter based on country
      nationalServices.push({
        service_type: 'housing',
        service_name: postcodeInfo.country === 'Scotland' ? 'Shelter Scotland' : 'Shelter England',
        address: null,
        phone: postcodeInfo.country === 'Scotland' ? '0808 800 4444' : '0808 800 4444',
        email: null,
        website: postcodeInfo.country === 'Scotland' ? 'https://scotland.shelter.org.uk' : 'https://www.shelter.org.uk',
        opening_hours: 'Mon-Fri 8am-8pm, Weekends 9am-5pm'
      });
      
      // StepChange for debt
      nationalServices.push({
        service_type: 'debt_advice',
        service_name: 'StepChange Debt Charity',
        address: null,
        phone: '0800 138 1111',
        email: null,
        website: 'https://www.stepchange.org',
        opening_hours: 'Mon-Fri 8am-8pm, Sat 8am-4pm'
      });
      
      // Mind for mental health
      nationalServices.push({
        service_type: 'mental_health',
        service_name: 'Mind Infoline',
        address: null,
        phone: '0300 123 3393',
        email: 'info@mind.org.uk',
        website: 'https://www.mind.org.uk',
        opening_hours: 'Mon-Fri 9am-6pm'
      });
      
      // Samaritans
      nationalServices.push({
        service_type: 'mental_health',
        service_name: 'Samaritans (24/7)',
        address: null,
        phone: '116 123',
        email: 'jo@samaritans.org',
        website: 'https://www.samaritans.org',
        opening_hours: '24 hours, 7 days a week'
      });

      const allServices = [...services, ...nationalServices];
      
      // Filter by service type if specified
      const filteredServices = params.serviceType === 'all' 
        ? allServices 
        : allServices.filter(s => s.service_type === params.serviceType);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            postcodeInfo,
            services: filteredServices,
            note: 'Services shown include local and national options. Local availability may vary.',
            findMoreLink: `https://www.citizensadvice.org.uk/about-us/contact-us/contact-us/search-for-your-local-citizens-advice/?q=${encodeURIComponent(params.postcode)}`
          }, null, 2)
        }]
      };
    }
  );

  // Get jurisdiction info from postcode
  server.tool(
    'get_jurisdiction',
    'Determine the legal jurisdiction (England, Wales, Scotland, or Northern Ireland) from a postcode. Important because laws differ between UK nations.',
    {
      postcode: z.string().describe('UK postcode')
    },
    async (params) => {
      const info = getPostcodeInfo(params.postcode);
      
      const jurisdictionInfo = {
        ...info,
        legalSystem: info.country === 'Scotland' ? 'Scots Law' : 
                     info.country === 'Northern Ireland' ? 'Northern Ireland Law' : 
                     'English Law (applies to England and Wales)',
        courtSystem: info.country === 'Scotland' ? 'Scottish Courts and Tribunals Service' :
                     info.country === 'Northern Ireland' ? 'Northern Ireland Courts and Tribunals Service' :
                     'HM Courts and Tribunals Service',
        legalAidProvider: info.country === 'Scotland' ? 'Scottish Legal Aid Board (SLAB)' :
                          info.country === 'Northern Ireland' ? 'Legal Services Agency Northern Ireland' :
                          'Legal Aid Agency',
        citizensAdvice: info.country === 'Scotland' ? 'Citizens Advice Scotland' :
                        info.country === 'Northern Ireland' ? 'Advice NI' :
                        info.country === 'Wales' ? 'Citizens Advice Cymru' :
                        'Citizens Advice England',
        importantNotes: [
          `Laws and procedures in ${info.country} may differ from other parts of the UK`,
          info.country === 'Scotland' ? 'Scotland has its own legal system with different courts, procedures, and some different laws' : '',
          info.country === 'Wales' ? 'Some Welsh laws differ from English laws, particularly around housing and social care' : '',
          info.country === 'Northern Ireland' ? 'Northern Ireland has distinct laws in many areas including employment and social security' : ''
        ].filter(Boolean)
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(jurisdictionInfo, null, 2) }]
      };
    }
  );

  // Find nearest court
  server.tool(
    'find_nearest_court',
    'Find the nearest court or tribunal based on postcode and case type',
    {
      postcode: z.string().describe('UK postcode'),
      caseType: z.enum([
        'county_court',
        'magistrates',
        'crown_court',
        'family_court',
        'employment_tribunal',
        'first_tier_tribunal',
        'immigration_tribunal'
      ]).describe('Type of court or tribunal needed')
    },
    async (params) => {
      const info = getPostcodeInfo(params.postcode);
      
      // In a real implementation, this would call the GOV.UK court finder API
      // For now, we provide guidance on how to find the right court
      
      const courtFinderUrl = `https://www.gov.uk/find-court-tribunal`;
      
      const courtTypes = {
        county_court: {
          name: 'County Court',
          handles: ['Civil disputes', 'Debt recovery', 'Housing possession', 'Personal injury claims under £100,000'],
          finderUrl: 'https://www.gov.uk/find-court-tribunal'
        },
        magistrates: {
          name: "Magistrates' Court",
          handles: ['Minor criminal offences', 'Licensing', 'Some civil matters'],
          finderUrl: 'https://www.gov.uk/find-court-tribunal'
        },
        crown_court: {
          name: 'Crown Court',
          handles: ['Serious criminal offences', 'Appeals from magistrates\' court'],
          finderUrl: 'https://www.gov.uk/find-court-tribunal'
        },
        family_court: {
          name: 'Family Court',
          handles: ['Divorce', 'Child arrangements', 'Adoption', 'Domestic violence orders'],
          finderUrl: 'https://www.gov.uk/find-court-tribunal'
        },
        employment_tribunal: {
          name: 'Employment Tribunal',
          handles: ['Unfair dismissal', 'Discrimination', 'Unpaid wages', 'Redundancy disputes'],
          finderUrl: 'https://www.gov.uk/courts-tribunals/employment-tribunal'
        },
        first_tier_tribunal: {
          name: 'First-tier Tribunal (Social Entitlement Chamber)',
          handles: ['Benefits appeals (PIP, UC, ESA)', 'Criminal injuries compensation'],
          finderUrl: 'https://www.gov.uk/appeal-benefit-decision'
        },
        immigration_tribunal: {
          name: 'First-tier Tribunal (Immigration and Asylum Chamber)',
          handles: ['Immigration appeals', 'Asylum appeals', 'Deportation appeals'],
          finderUrl: 'https://www.gov.uk/courts-tribunals/first-tier-tribunal-immigration-and-asylum'
        }
      };

      const courtInfo = courtTypes[params.caseType];

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            jurisdiction: info.country,
            courtType: courtInfo,
            searchUrl: `${courtFinderUrl}?postcode=${encodeURIComponent(params.postcode)}`,
            guidance: [
              `Use the GOV.UK court finder to locate your nearest ${courtInfo.name}`,
              info.country === 'Scotland' ? 'Scotland has a separate court system - visit scotcourts.gov.uk' : '',
              info.country === 'Northern Ireland' ? 'Northern Ireland has separate courts - visit nidirect.gov.uk/contacts/courts-and-tribunals' : '',
              'Contact the court directly for opening hours and specific procedures'
            ].filter(Boolean)
          }, null, 2)
        }]
      };
    }
  );
}
