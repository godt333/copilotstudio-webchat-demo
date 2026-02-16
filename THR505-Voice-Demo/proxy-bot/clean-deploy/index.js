"use strict";
/**
 * DLS Proxy Bot - Entry Point
 * ============================
 * Main entry point for the Direct Line Speech proxy bot.
 *
 * This server:
 * - Hosts the Bot Framework messaging endpoint
 * - Handles authentication with Azure Bot Service
 * - Routes activities to the ProxyBot
 *
 * The bot is designed to be deployed to Azure App Service
 * and connected to a Direct Line Speech channel.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const restify = __importStar(require("restify"));
const botbuilder_1 = require("botbuilder");
const bot_1 = require("./bot");
const copilotClient_1 = require("./copilotClient");
// Load environment variables
dotenv.config();
// Validate required environment variables
function validateEnv() {
    const required = ['MICROSOFT_APP_ID', 'MICROSOFT_APP_PASSWORD'];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    if (!process.env.COPILOT_TOKEN_ENDPOINT && !process.env.COPILOT_DIRECT_LINE_SECRET) {
        throw new Error('Either COPILOT_TOKEN_ENDPOINT or COPILOT_DIRECT_LINE_SECRET must be set');
    }
}
// Main startup
async function main() {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  DLS Proxy Bot - Direct Line Speech to Copilot Studio Bridge');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    // Validate environment
    validateEnv();
    console.log('✅ Environment validated');
    // Bot Framework authentication configuration
    const botAuthConfig = {
        MicrosoftAppId: process.env.MICROSOFT_APP_ID,
        MicrosoftAppPassword: process.env.MICROSOFT_APP_PASSWORD,
        MicrosoftAppType: process.env.MICROSOFT_APP_TYPE || 'MultiTenant',
        MicrosoftAppTenantId: process.env.MICROSOFT_APP_TENANT_ID,
    };
    const botFrameworkAuth = new botbuilder_1.ConfigurationBotFrameworkAuthentication(botAuthConfig);
    const adapter = new botbuilder_1.CloudAdapter(botFrameworkAuth);
    // Error handler
    adapter.onTurnError = async (context, error) => {
        console.error('❌ Bot error:', error);
        // Send error message to user
        await context.sendActivity({
            type: 'message',
            text: 'Sorry, something went wrong. Please try again.',
            speak: 'Sorry, something went wrong. Please try again.',
        });
    };
    // Create storage and state management
    // In production, use Azure Blob Storage or Cosmos DB
    const storage = new botbuilder_1.MemoryStorage();
    const conversationState = new botbuilder_1.ConversationState(storage);
    const userState = new botbuilder_1.UserState(storage);
    // Create Copilot Studio client
    const copilotClient = new copilotClient_1.CopilotClient({
        tokenEndpoint: process.env.COPILOT_TOKEN_ENDPOINT,
        directLineSecret: process.env.COPILOT_DIRECT_LINE_SECRET,
    });
    console.log('✅ Copilot Studio client initialized');
    // Create the bot
    const bot = new bot_1.ProxyBot(copilotClient, conversationState, userState);
    console.log('✅ Proxy bot created');
    // Create HTTP server
    const server = restify.createServer();
    server.use(restify.plugins.bodyParser());
    // Health check endpoint
    server.get('/health', (req, res, next) => {
        res.send(200, {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'dls-proxy-bot',
        });
        return next();
    });
    // Bot Framework messaging endpoint
    server.post('/api/messages', async (req, res) => {
        await adapter.process(req, res, (context) => bot.run(context));
    });
    // Start server
    const port = process.env.PORT || 3978;
    server.listen(port, () => {
        console.log('');
        console.log(`🚀 Proxy bot is running!`);
        console.log('');
        console.log(`   Messaging endpoint: http://localhost:${port}/api/messages`);
        console.log(`   Health check:       http://localhost:${port}/health`);
        console.log('');
        console.log('📋 Configuration:');
        console.log(`   App ID:     ${process.env.MICROSOFT_APP_ID?.substring(0, 8)}...`);
        console.log(`   App Type:   ${process.env.MICROSOFT_APP_TYPE || 'MultiTenant'}`);
        console.log(`   Copilot:    ${process.env.COPILOT_TOKEN_ENDPOINT ? 'Token Endpoint' : 'Direct Line Secret'}`);
        console.log('');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('  Waiting for Direct Line Speech connections...');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
    });
}
// Run
main().catch((error) => {
    console.error('❌ Failed to start proxy bot:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map