/**
 * Environment Configuration
 * =========================
 * Centralized configuration management for the THR505 Demo backend.
 * All secrets and configuration values are loaded from environment variables.
 * 
 * SECURITY NOTE: Never log or expose these values to clients!
 */

import dotenv from 'dotenv';

// Load environment variables from .env file in development
dotenv.config();

/**
 * Validates that a required environment variable is present
 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Gets an optional environment variable with a default value
 */
function optionalEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

/**
 * Application configuration object
 * All values are loaded at startup to fail fast if configuration is missing
 */
export const config = {
  // Server configuration
  server: {
    port: parseInt(optionalEnv('PORT', '3001'), 10),
    nodeEnv: optionalEnv('NODE_ENV', 'development'),
    corsOrigins: optionalEnv('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3000').split(','),
  },

  // Azure Speech Services configuration
  // Used for both Direct Line Speech and Speech Ponyfill approaches
  speech: {
    // The subscription key for Azure Speech Services (optional if using Azure AD)
    // Get this from: Azure Portal > Speech Resource > Keys and Endpoint
    // Set to 'USE_AZURE_AD' to use Azure AD authentication instead
    key: optionalEnv('SPEECH_KEY', 'USE_AZURE_AD'),
    
    // The Azure region where your Speech resource is deployed
    // Examples: westus2, eastus, westeurope
    region: requireEnv('SPEECH_REGION'),
    
    // The custom resource endpoint for Azure AD auth (optional)
    // Format: https://your-resource-name.cognitiveservices.azure.com
    resourceEndpoint: optionalEnv('SPEECH_RESOURCE_ENDPOINT', ''),
    
    // Default locale for speech recognition
    defaultLocale: optionalEnv('DEFAULT_LOCALE', 'en-US'),
    
    // Default voice for TTS
    defaultVoice: optionalEnv('DEFAULT_VOICE', 'en-US-JennyNeural'),
  },

  // Direct Line configuration for Copilot Studio
  directLine: {
    // The Direct Line secret from Copilot Studio (optional if using token endpoint)
    // Get this from: Copilot Studio > Settings > Channels > Direct Line
    secret: optionalEnv('DIRECT_LINE_SECRET', ''),
    
    // Token Endpoint URL from Copilot Studio (alternative to secret)
    // Get this from: Copilot Studio > Settings > Channels > Mobile app
    tokenEndpoint: optionalEnv('DIRECT_LINE_TOKEN_ENDPOINT', ''),
    
    // Optional: Bot ID for display/logging purposes
    botId: optionalEnv('BOT_ID', 'copilot-studio-agent'),
    
    // Bot Name for display
    botName: optionalEnv('BOT_NAME', 'Copilot Studio Agent'),
  },

  // LiveHub telephony configuration (optional)
  liveHub: {
    // Separate Direct Line secret for LiveHub (can be same as main secret)
    // Using a separate secret allows for independent rotation and auditing
    directLineSecret: optionalEnv('LIVEHUB_DIRECT_LINE_SECRET', process.env.DIRECT_LINE_SECRET || ''),
  },

  // Proxy Bot configuration (Azure Bot Service that forwards to Copilot Studio)
  proxyBot: {
    // Direct Line secret for the proxy bot (thr505-dls-proxy)
    // This enables the "Proxy Bot" tab to show bot middleware architecture
    directLineSecret: optionalEnv('PROXY_BOT_DIRECT_LINE_SECRET', ''),
  },

  // Token configuration
  tokens: {
    // Speech tokens are valid for 10 minutes, we report slightly less
    speechTokenExpiresInSeconds: 540,
    
    // Direct Line tokens are valid for 30 minutes
    directLineTokenExpiresInSeconds: 1800,
  },
};

/**
 * Validates the configuration at startup
 * Throws descriptive errors if required values are missing
 */
export function validateConfig(): void {
  console.log('🔧 Validating configuration...');
  
  // Check that either Direct Line secret OR token endpoint is configured
  if (!config.directLine.secret && !config.directLine.tokenEndpoint) {
    throw new Error('Either DIRECT_LINE_SECRET or DIRECT_LINE_TOKEN_ENDPOINT must be configured');
  }
  
  console.log(`✅ Configuration validated successfully`);
  console.log(`   - Speech Region: ${config.speech.region}`);
  console.log(`   - Default Locale: ${config.speech.defaultLocale}`);
  console.log(`   - Server Port: ${config.server.port}`);
  console.log(`   - Environment: ${config.server.nodeEnv}`);
  console.log(`   - Bot Name: ${config.directLine.botName}`);
  
  // Log Direct Line configuration method
  if (config.directLine.tokenEndpoint) {
    console.log(`   - Direct Line: Using Token Endpoint`);
  } else {
    console.log(`   - Direct Line: Using Secret Key`);
  }
  
  // Log whether LiveHub secret is configured
  if (config.liveHub.directLineSecret) {
    console.log(`   - LiveHub: Configured`);
  } else {
    console.log(`   - LiveHub: Not configured (using main Direct Line secret)`);
  }
}
