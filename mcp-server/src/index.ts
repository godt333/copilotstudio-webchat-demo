import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { registerBenefitsTools } from './tools/benefits.js';
import { registerPostcodeTools } from './tools/postcode.js';
import { registerDeadlineTools } from './tools/deadlines.js';
import { registerCourtTools } from './tools/courts.js';
import { registerLegalAidTools } from './tools/legalAid.js';
import { registerCaseTools } from './tools/cases.js';
import { initDatabase } from './database/init.js';

const PORT = process.env.PORT || 3001;

async function main() {
  // Initialize the database
  await initDatabase();

  // Create Express app for HTTP transport
  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Store transports for each session
  const transports = new Map<string, SSEServerTransport>();

  // SSE endpoint for MCP connections
  app.get('/mcp/sse', async (_req, res) => {
    console.log('New SSE connection');
    
    // Create MCP server for this connection
    const server = new McpServer({
      name: 'citizen-advice-mcp-server',
      version: '1.0.0'
    });

    // Register all tools
    registerBenefitsTools(server);
    registerPostcodeTools(server);
    registerDeadlineTools(server);
    registerCourtTools(server);
    registerLegalAidTools(server);
    registerCaseTools(server);

    // Create SSE transport
    const transport = new SSEServerTransport('/mcp/messages', res);
    const sessionId = transport.sessionId;
    transports.set(sessionId, transport);
    
    console.log(`Session ${sessionId} connected`);
    
    res.on('close', () => {
      console.log(`Session ${sessionId} disconnected`);
      transports.delete(sessionId);
    });

    await server.connect(transport);
  });

  // Messages endpoint for client-to-server messages
  app.post('/mcp/messages', async (req, res) => {
    const sessionId = req.query.sessionId as string;
    const transport = transports.get(sessionId);
    
    if (!transport) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    await transport.handlePostMessage(req, res);
  });

  // Simple test endpoint to verify tools are working
  app.get('/test', async (_req, res) => {
    res.json({
      message: 'Citizen Advice MCP Server is running',
      tools: [
        'check_pip_eligibility',
        'calculate_universal_credit',
        'check_benefits_overview',
        'find_local_services',
        'get_jurisdiction',
        'find_nearest_court',
        'calculate_employment_tribunal_deadline',
        'calculate_benefits_appeal_deadline',
        'calculate_housing_deadline',
        'calculate_court_deadline',
        'get_court_info',
        'explain_court_process',
        'check_legal_aid_eligibility',
        'find_legal_help',
        'create_case',
        'get_case',
        'update_case_status',
        'add_case_note',
        'set_case_deadline',
        'search_cases',
        'get_upcoming_deadlines',
        'get_case_statistics'
      ]
    });
  });

  app.listen(PORT, () => {
    console.log(`🚀 Citizen Advice MCP Server running on port ${PORT}`);
    console.log(`📍 MCP SSE endpoint: http://localhost:${PORT}/mcp/sse`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
    console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
  });
}

main().catch(console.error);
