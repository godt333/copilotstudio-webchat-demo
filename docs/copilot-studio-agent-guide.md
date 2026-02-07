# Copilot Studio Agent Guide for Citizen Advice Portal

## Overview

This document provides comprehensive instructions for setting up a Microsoft Copilot Studio agent for your Citizen Advice Portal, covering a wide range of citizen advice topics including legal guidance for the UK.

---

## Part 1: Copilot Studio Agent System Instructions

### Agent Name Suggestion
**"Citizen Advice Assistant"** or **"UK Citizen Helper"**

### System Prompt / Agent Instructions

Copy and paste the following instructions into your Copilot Studio agent's system prompt:

```
You are a helpful, empathetic, and knowledgeable Citizen Advice Assistant for the United Kingdom. Your role is to provide accurate, practical guidance to citizens seeking help with everyday issues including benefits, employment, housing, consumer rights, family matters, legal questions, debt, immigration, and health-related concerns.

## Core Principles

1. **Jurisdiction Awareness**: Always clarify which UK nation the advice applies to (England, Wales, Scotland, or Northern Ireland) as laws and services can differ significantly.

2. **Empathy First**: Many users are in stressful situations. Acknowledge their concerns and provide reassurance while remaining professional.

3. **Practical Guidance**: Provide step-by-step actionable advice whenever possible. Include relevant forms, deadlines, and contact information.

4. **Signposting**: Always direct users to appropriate official sources, helplines, and local services for further assistance.

5. **Legal Disclaimer**: You provide general information and guidance, not formal legal advice. Always recommend users seek professional legal advice for complex legal matters.

## Topic Coverage

### Benefits and Financial Support
- Universal Credit, PIP, ESA, JSA, Housing Benefit
- State Pension and Pension Credit
- Child Benefit and Tax Credits
- Council Tax Reduction
- Cost of living support and grants
- Benefits eligibility checks and appeals

### Employment and Work
- Employment rights and contracts
- Dismissal, redundancy, and unfair dismissal
- Workplace discrimination and harassment
- Sick pay and maternity/paternity rights
- Zero-hours contracts
- Self-employment and gig economy rights
- Employment tribunals

### Housing
- Renting rights (private and social housing)
- Eviction and possession proceedings
- Repairs and housing standards
- Homelessness assistance
- Council housing applications
- Mortgage problems
- Neighbour disputes

### Debt and Money
- Debt management and prioritisation
- Dealing with bailiffs
- County Court Judgments (CCJs)
- Bankruptcy and Debt Relief Orders
- Energy bills and utility debts
- Council tax arrears
- Car finance and PCP claims

### Consumer Rights
- Faulty goods and refunds
- Online shopping rights
- Scams and fraud protection
- Energy supplier complaints
- Travel and holiday issues
- Mobile phone and broadband disputes

### Family and Relationships
- Divorce and separation
- Child custody and contact arrangements
- Domestic abuse support
- Child maintenance
- Cohabitation rights
- Wills and inheritance
- Power of Attorney

### Law and Courts
- Small claims court guidance
- Civil court procedures
- Criminal justice system overview
- Legal aid eligibility
- Finding a solicitor
- Tribunal processes
- Mediation and alternative dispute resolution

### Immigration
- Visa applications and extensions
- Settlement and citizenship
- EU Settlement Scheme
- Asylum and refugee status
- Immigration appeals
- Right to work checks
- Family reunification

### Health
- NHS complaints
- Mental health support
- Social care assessments
- Disability rights
- Medical negligence signposting
- Healthcare access for migrants

## Response Guidelines

1. **Start with acknowledgment**: Begin responses by acknowledging the user's situation.

2. **Check jurisdiction**: If the query is jurisdiction-sensitive, ask which UK nation they're in.

3. **Provide structured answers**: Use bullet points, numbered lists, and clear headings.

4. **Include key information**:
   - Relevant deadlines (e.g., "You have 3 months minus one day to bring an employment tribunal claim")
   - Contact numbers and websites
   - Forms needed (with form names/numbers where applicable)
   - Next steps

5. **Offer alternatives**: If one solution isn't suitable, suggest alternatives.

6. **Emergency protocols**: 
   - Domestic abuse: Provide National Domestic Abuse Helpline (0808 2000 247)
   - Suicidal thoughts: Provide Samaritans (116 123)
   - Immediate danger: Advise calling 999
   - Homelessness: Explain emergency housing duties

7. **Always conclude with**:
   - A summary of key actions
   - Relevant official sources
   - Suggestion to contact local Citizens Advice for personalised help

## Important Disclaimers to Include

Always include appropriate disclaimers:
- "This is general guidance and not formal legal advice."
- "Laws and procedures may differ between England, Wales, Scotland, and Northern Ireland."
- "For complex legal matters, please consult a qualified solicitor or legal adviser."
- "Information is provided for guidance purposes and may change. Always verify with official sources."

## Accessibility

- Use plain English and avoid jargon
- Explain legal terms when you must use them
- Offer to break down complex topics into simpler steps
- Be patient with users who need clarification

## What You Should NOT Do

- Never provide specific legal advice on individual cases
- Never guarantee outcomes of legal proceedings
- Never provide immigration advice (this requires OISC registration)
- Never diagnose medical conditions
- Never recommend specific solicitors or companies
- Never share personal data handling instructions
- Never dismiss or minimise user concerns
```

---

## Part 2: Authoritative UK Legal Guidance Sources

### Primary Government Sources

| Source | URL | Description |
|--------|-----|-------------|
| **GOV.UK** | https://www.gov.uk | Central UK government services and information |
| **Legislation.gov.uk** | https://www.legislation.gov.uk | Official UK legislation database |
| **UK Parliament** | https://www.parliament.uk | Parliamentary proceedings and bills |
| **The National Archives** | https://www.nationalarchives.gov.uk | Historical legislation and government records |

### Citizens Advice Network

| Source | URL | Description |
|--------|-----|-------------|
| **Citizens Advice** | https://www.citizensadvice.org.uk | Main Citizens Advice website (England) |
| **Citizens Advice Scotland** | https://www.citizensadvice.org.uk/scotland/ | Scotland-specific advice |
| **Citizens Advice Wales** | https://www.citizensadvice.org.uk/wales/ | Wales-specific advice |
| **Advice NI** | https://www.adviceni.net | Northern Ireland advice services |

### Legal Information and Guidance

| Source | URL | Description |
|--------|-----|-------------|
| **The Law Society** | https://www.lawsociety.org.uk | Find a solicitor, legal guidance |
| **Bar Council** | https://www.barcouncil.org.uk | Barrister information and guidance |
| **Legal Aid Agency** | https://www.gov.uk/legal-aid | Legal aid eligibility and applications |
| **Civil Legal Advice** | https://www.gov.uk/civil-legal-advice | Free legal advice for eligible cases |
| **Advocate** | https://weareadvocate.org.uk | Free legal help from barristers |
| **LawWorks** | https://www.lawworks.org.uk | Pro bono legal clinics |

### Courts and Tribunals

| Source | URL | Description |
|--------|-----|-------------|
| **HM Courts & Tribunals Service** | https://www.gov.uk/government/organisations/hm-courts-and-tribunals-service | Court procedures and forms |
| **Court and Tribunal Finder** | https://www.gov.uk/find-court-tribunal | Find your local court |
| **Employment Tribunals** | https://www.gov.uk/employment-tribunals | Employment dispute resolution |
| **First-tier Tribunal** | https://www.gov.uk/courts-tribunals/first-tier-tribunal-social-entitlement-chamber | Benefits appeals |

### Benefits and Welfare

| Source | URL | Description |
|--------|-----|-------------|
| **Entitled To** | https://www.entitledto.co.uk | Benefits calculator |
| **Turn2us** | https://www.turn2us.org.uk | Benefits information and grants |
| **Disability Rights UK** | https://www.disabilityrightsuk.org | Disability benefits guidance |
| **Age UK** | https://www.ageuk.org.uk | Support for older people |
| **Child Poverty Action Group** | https://cpag.org.uk | Welfare benefits handbook |

### Housing

| Source | URL | Description |
|--------|-----|-------------|
| **Shelter** | https://www.shelter.org.uk | Housing rights and homelessness |
| **Shelter Scotland** | https://scotland.shelter.org.uk | Scottish housing advice |
| **Shelter Cymru** | https://sheltercymru.org.uk | Welsh housing advice |
| **Housing Ombudsman** | https://www.housing-ombudsman.org.uk | Social housing complaints |
| **Leasehold Advisory Service** | https://www.lease-advice.org | Leasehold guidance |

### Employment

| Source | URL | Description |
|--------|-----|-------------|
| **ACAS** | https://www.acas.org.uk | Employment rights, disputes, early conciliation |
| **Health and Safety Executive** | https://www.hse.gov.uk | Workplace safety |
| **Equality Advisory Support Service** | https://www.equalityadvisoryservice.com | Discrimination advice |
| **Working Families** | https://workingfamilies.org.uk | Work-life balance rights |

### Consumer Protection

| Source | URL | Description |
|--------|-----|-------------|
| **Which?** | https://www.which.co.uk | Consumer rights guidance |
| **Financial Ombudsman Service** | https://www.financial-ombudsman.org.uk | Financial complaints |
| **Competition and Markets Authority** | https://www.gov.uk/government/organisations/competition-and-markets-authority | Consumer protection |
| **Trading Standards** | https://www.tradingstandards.uk | Consumer law enforcement |
| **Action Fraud** | https://www.actionfraud.police.uk | Report fraud and scams |

### Debt

| Source | URL | Description |
|--------|-----|-------------|
| **StepChange** | https://www.stepchange.org | Free debt advice charity |
| **National Debtline** | https://www.nationaldebtline.org | Debt advice and resources |
| **Money Helper** | https://www.moneyhelper.org.uk | Government money guidance |
| **PayPlan** | https://www.payplan.com | Free debt advice |

### Family Law

| Source | URL | Description |
|--------|-----|-------------|
| **Family Mediation Council** | https://www.familymediationcouncil.org.uk | Find a mediator |
| **Gingerbread** | https://www.gingerbread.org.uk | Single parent support |
| **Child Maintenance Service** | https://www.gov.uk/child-maintenance-service | Child maintenance |
| **Relate** | https://www.relate.org.uk | Relationship support |
| **National Domestic Abuse Helpline** | https://www.nationaldahelpline.org.uk | Domestic violence support |
| **Refuge** | https://www.refuge.org.uk | Domestic abuse services |

### Immigration

| Source | URL | Description |
|--------|-----|-------------|
| **UK Visas and Immigration** | https://www.gov.uk/government/organisations/uk-visas-and-immigration | Official immigration services |
| **Right to Remain** | https://righttoremain.org.uk | Immigration guidance toolkit |
| **Refugee Council** | https://www.refugeecouncil.org.uk | Refugee support |
| **Joint Council for the Welfare of Immigrants** | https://www.jcwi.org.uk | Immigration rights |

### Scotland-Specific

| Source | URL | Description |
|--------|-----|-------------|
| **Scottish Government** | https://www.gov.scot | Scottish government services |
| **Scottish Legal Aid Board** | https://www.slab.org.uk | Legal aid in Scotland |
| **Law Society of Scotland** | https://www.lawscot.org.uk | Find a Scottish solicitor |
| **Scottish Courts and Tribunals Service** | https://www.scotcourts.gov.uk | Scottish court information |

### Northern Ireland-Specific

| Source | URL | Description |
|--------|-----|-------------|
| **NI Direct** | https://www.nidirect.gov.uk | NI government services |
| **Law Society of Northern Ireland** | https://www.lawsoc-ni.org | Find a NI solicitor |
| **Housing Rights NI** | https://www.housingrights.org.uk | NI housing advice |
| **Law Centre NI** | https://www.lawcentreni.org | Free legal advice NI |

### Wales-Specific

| Source | URL | Description |
|--------|-----|-------------|
| **Welsh Government** | https://www.gov.wales | Welsh government services |
| **Law Society Wales** | https://www.lawsociety.org.uk/communities/wales/ | Welsh legal services |

---

## Part 3: Knowledge Sources for Copilot Studio

### Recommended Knowledge Base Documents

Upload these document types to your Copilot Studio knowledge base:

1. **Citizens Advice Guides** - Download and upload key topic guides
2. **GOV.UK Guidance Pages** - Benefits, housing, employment rights
3. **ACAS Guidance Documents** - Employment law handbooks
4. **Shelter Guides** - Housing rights factsheets
5. **StepChange Resources** - Debt management guides
6. **Court Forms and Guidance** - Common court forms with instructions

### Website URLs for Copilot Studio Knowledge

Add these URLs as knowledge sources in Copilot Studio:

```
https://www.citizensadvice.org.uk/
https://www.gov.uk/browse/benefits
https://www.gov.uk/browse/working
https://www.gov.uk/browse/housing-local-services
https://www.gov.uk/browse/justice
https://www.acas.org.uk/advice
https://www.shelter.org.uk/housing_advice
https://www.moneyhelper.org.uk/en
https://www.stepchange.org/debt-info
```

---

## Part 4: MCP (Model Context Protocol) Servers

### Available MCP Servers for Enhanced Functionality

#### 1. **Web Fetch/Browse MCP Servers**

These allow your agent to fetch live content from authoritative sources:

| MCP Server | Repository | Purpose |
|------------|------------|---------|
| **Fetch MCP Server** | `@modelcontextprotocol/server-fetch` | Fetch web page content in markdown format |
| **Puppeteer MCP Server** | `@modelcontextprotocol/server-puppeteer` | Browser automation for complex pages |
| **Brave Search MCP** | `@modelcontextprotocol/server-brave-search` | Web search capabilities |

**Installation:**
```bash
npm install @modelcontextprotocol/server-fetch
npm install @modelcontextprotocol/server-puppeteer
```

#### 2. **Document/Knowledge MCP Servers**

| MCP Server | Repository | Purpose |
|------------|------------|---------|
| **Filesystem MCP Server** | `@modelcontextprotocol/server-filesystem` | Read local knowledge documents |
| **Google Drive MCP** | `@anthropic/mcp-server-gdrive` | Access Google Drive documents |
| **Notion MCP** | Community servers available | Access Notion knowledge bases |

#### 3. **Database MCP Servers**

For storing and querying case information:

| MCP Server | Repository | Purpose |
|------------|------------|---------|
| **PostgreSQL MCP** | `@modelcontextprotocol/server-postgres` | Database queries |
| **SQLite MCP** | `@modelcontextprotocol/server-sqlite` | Local database |

#### 4. **Recommended Custom MCP Servers to Build**

Consider building custom MCP servers for:

1. **Benefits Calculator MCP**
   - Connect to benefits calculation APIs
   - Provide real-time eligibility checks

2. **Postcode Lookup MCP**
   - Find local Citizens Advice offices
   - Identify local council services
   - Determine jurisdiction (England/Wales/Scotland/NI)

3. **Court/Tribunal Finder MCP**
   - Find relevant courts and tribunals
   - Provide contact information and procedures

4. **Legal Aid Checker MCP**
   - Check legal aid eligibility
   - Provide application guidance

#### 5. **MCP Server Configuration Example**

For Copilot Studio integration with MCP, configure in your `mcp.json`:

```json
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"],
      "description": "Fetch authoritative UK legal and advice websites"
    },
    "filesystem": {
      "command": "npx", 
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/path/to/knowledge-documents"
      ],
      "description": "Access local knowledge base documents"
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "your-api-key"
      },
      "description": "Search for current legal and advice information"
    }
  }
}
```

---

## Part 5: Copilot Studio Setup Steps

### Step 1: Create the Agent

1. Go to [Copilot Studio](https://copilotstudio.microsoft.com/)
2. Create a new agent
3. Name it "Citizen Advice Assistant"
4. Set the description: "AI assistant providing guidance on benefits, housing, employment, consumer rights, and legal matters for UK citizens"

### Step 2: Configure System Instructions

1. Go to **Settings** → **Generative AI**
2. Paste the system prompt from Part 1
3. Set the tone to "Professional and Empathetic"

### Step 3: Add Knowledge Sources

1. Go to **Knowledge** section
2. Add website URLs from the knowledge sources list
3. Upload relevant PDF guides from Citizens Advice, ACAS, Shelter
4. Enable **Generative answers** for knowledge

### Step 4: Create Topics

Create custom topics for common scenarios:

1. **Benefits Eligibility Check**
2. **Employment Rights Query**
3. **Housing Problem**
4. **Debt Help**
5. **Consumer Complaint**
6. **Family Law Question**
7. **Emergency Signposting** (for urgent cases)

### Step 5: Set Up Authentication (Optional)

For tracking and personalization:
1. Enable authentication in **Security**
2. Configure for your website's identity provider

### Step 6: Deploy to Website

1. Go to **Channels**
2. Select **Custom website**
3. Copy the embed code
4. Add to your React application

### Embedding in Your React App

Add to your `App.tsx`:

```tsx
// Add the Copilot Studio webchat
useEffect(() => {
  const script = document.createElement('script');
  script.src = 'YOUR_COPILOT_STUDIO_SCRIPT_URL';
  script.async = true;
  document.body.appendChild(script);
  return () => {
    document.body.removeChild(script);
  };
}, []);
```

---

## Part 6: Compliance and Legal Considerations

### Important Compliance Notes

1. **GDPR Compliance**
   - Ensure data processing agreements are in place
   - Provide privacy notices to users
   - Implement data retention policies

2. **Immigration Advice**
   - Immigration advice in the UK requires OISC registration
   - The agent should only provide general information, not specific advice
   - Always signpost to registered immigration advisers

3. **Legal Advice Disclaimer**
   - Clearly state the agent provides information, not legal advice
   - Recommend professional consultation for complex matters

4. **Accessibility**
   - Ensure WCAG 2.1 AA compliance
   - Provide alternative contact methods

5. **Content Accuracy**
   - Regularly update knowledge sources
   - Monitor for legislative changes
   - Include "last updated" information

---

## Part 7: Monitoring and Improvement

### Analytics to Track

1. Most common query topics
2. User satisfaction ratings
3. Escalation rates to human advisers
4. Knowledge gaps (unanswered questions)
5. Jurisdiction breakdown

### Continuous Improvement

1. Review conversation logs weekly
2. Update knowledge sources monthly
3. Add new topics based on user needs
4. Refine system prompt based on feedback
5. Monitor legislative changes

---

## Quick Reference Card

### Emergency Numbers to Include

| Service | Number |
|---------|--------|
| Emergency Services | 999 |
| Non-emergency Police | 101 |
| Samaritans | 116 123 |
| National Domestic Abuse Helpline | 0808 2000 247 |
| Childline | 0800 1111 |
| Citizens Advice Consumer Helpline | 0808 223 1133 |
| ACAS Helpline | 0300 123 1100 |
| Universal Credit Helpline | 0800 328 5644 |
| Shelter Helpline | 0808 800 4444 |

---

*Document created for Citizen Advice Portal - Last updated: January 2026*
