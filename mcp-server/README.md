# Citizen Advice MCP Server

A comprehensive MCP (Model Context Protocol) server for the Citizen Advice Portal, providing:

- 🧮 **Benefits Calculators** - PIP, Universal Credit eligibility checks
- 📍 **Postcode Lookups** - Find local services, determine jurisdiction
- 📅 **Deadline Calculators** - Employment tribunals, benefits appeals, housing
- 🔗 **Court Information** - Find courts, understand processes
- ⚖️ **Legal Aid Checker** - Check eligibility, find free legal help
- 📊 **Case Management** - Track cases, deadlines, and client interactions

## Prerequisites

- Node.js 18 or later
- npm or yarn

## Installation

```bash
cd mcp-server
npm install
```

## Development

Run in development mode with hot reload:

```bash
npm run dev
```

## Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

## Production

Run the compiled server:

```bash
npm start
```

The server will start on port 3001 by default (or `PORT` environment variable).

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/test` | GET | List all available tools |
| `/mcp/sse` | GET | SSE endpoint for MCP connections |
| `/mcp/messages` | POST | Messages endpoint for MCP client requests |

## Copilot Studio Configuration

Once deployed, configure in Copilot Studio:

| Field | Value |
|-------|-------|
| Server name | Citizen Advice MCP Server |
| Server description | Provides benefits calculators, deadline tools, court information, and case management for UK citizen advice |
| Server URL | `https://your-deployment-url.azurewebsites.net/mcp/sse` |
| Authentication | API key (recommended) or None for testing |

**Note:** Copilot Studio requires an SSE endpoint. The server provides this at `/mcp/sse`.

## Tools Available

### Benefits Tools
- `check_pip_eligibility` - Check PIP eligibility based on daily living/mobility needs
- `calculate_universal_credit` - Calculate estimated UC entitlement
- `check_benefits_overview` - Get overview of potential benefit eligibility

### Postcode Tools
- `find_local_services` - Find Citizens Advice, Shelter, legal aid near a postcode
- `get_jurisdiction` - Determine England/Wales/Scotland/NI from postcode
- `find_nearest_court` - Find nearest court or tribunal

### Deadline Tools
- `calculate_employment_tribunal_deadline` - ET claim deadlines
- `calculate_benefits_appeal_deadline` - MR and tribunal deadlines
- `calculate_housing_deadline` - Eviction and housing deadlines
- `calculate_court_deadline` - General court/tribunal deadlines

### Court Tools
- `get_court_info` - Information about different courts and tribunals
- `explain_court_process` - Step-by-step court process explanations

### Legal Aid Tools
- `check_legal_aid_eligibility` - Check if you might qualify for legal aid
- `find_legal_help` - Find free and affordable legal help sources

### Case Management Tools
- `create_case` - Create a new case
- `get_case` - Retrieve case details
- `update_case_status` - Update case status
- `add_case_note` - Add notes and events to cases
- `set_case_deadline` - Set reminders and deadlines
- `search_cases` - Search cases by various criteria
- `get_upcoming_deadlines` - View upcoming deadlines
- `get_case_statistics` - Dashboard statistics

## Deployment to Azure

### Option 1: Azure App Service

1. Create an Azure App Service (Node.js 18+)
2. Configure the following:
   - Startup command: `npm start`
   - Environment variable: `PORT=8080`
3. Deploy using Azure CLI or VS Code Azure extension

```bash
az webapp up --name citizen-advice-mcp --runtime "NODE:18-lts"
```

### Option 2: Azure Container Apps

1. Build Docker image:

```bash
docker build -t citizen-advice-mcp .
```

2. Push to Azure Container Registry
3. Deploy to Container Apps

### Option 3: Azure Functions

For serverless deployment, wrap the Express app in an Azure Function adapter.

## Copilot Studio Configuration

Once deployed, configure in Copilot Studio:

| Field | Value |
|-------|-------|
| Server name | Citizen Advice MCP Server |
| Server description | Provides benefits calculators, deadline tools, court information, and case management for UK citizen advice |
| Server URL | `https://your-deployment-url.azurewebsites.net/mcp` |
| Authentication | API key (recommended) or None for testing |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment | development |

## Database

The server uses SQLite for case management. The database is created automatically at `data/citizen-advice.db`.

For production, consider migrating to:
- Azure SQL Database
- Azure Cosmos DB
- PostgreSQL on Azure

## Contributing

1. Add new tools in `src/tools/`
2. Register them in `src/index.ts`
3. Update this README

## License

MIT
