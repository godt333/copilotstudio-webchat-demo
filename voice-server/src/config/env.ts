/**
 * Environment Configuration
 * =========================
 * Centralized configuration management for the Voice Server backend.
 */

import dotenv from 'dotenv';

// Load environment variables from .env file
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
 */
export const config = {
  // Server configuration
  server: {
    port: parseInt(optionalEnv('PORT', '3001'), 10),
    nodeEnv: optionalEnv('NODE_ENV', 'development'),
    corsOrigins: optionalEnv('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3000').split(','),
  },

  // Azure Speech Services configuration
  speech: {
    key: optionalEnv('SPEECH_KEY', 'USE_AZURE_AD'),
    region: requireEnv('SPEECH_REGION'),
    resourceEndpoint: optionalEnv('SPEECH_RESOURCE_ENDPOINT', ''),
    defaultLocale: optionalEnv('DEFAULT_LOCALE', 'en-US'),
    defaultVoice: optionalEnv('DEFAULT_VOICE', 'en-US-JennyNeural'),
  },

  // Direct Line configuration for Copilot Studio
  directLine: {
    secret: optionalEnv('DIRECT_LINE_SECRET', ''),
    tokenEndpoint: optionalEnv('DIRECT_LINE_TOKEN_ENDPOINT', ''),
    botId: optionalEnv('BOT_ID', 'copilot-studio-agent'),
    botName: optionalEnv('BOT_NAME', 'Copilot Studio Agent'),
  },

  // LiveHub telephony configuration (optional)
  liveHub: {
    directLineSecret: optionalEnv('LIVEHUB_DIRECT_LINE_SECRET', process.env.DIRECT_LINE_SECRET || ''),
  },

  // Proxy Bot configuration
  proxyBot: {
    directLineSecret: optionalEnv('PROXY_BOT_DIRECT_LINE_SECRET', ''),
  },

  // Token configuration
  tokens: {
    speechTokenExpiresInSeconds: 540,
    directLineTokenExpiresInSeconds: 1800,
  },
};

/**
 * Validates the configuration at startup
 */
export function validateConfig(): void {
  console.log('🔧 Validating configuration...');
  
  if (!config.directLine.secret && !config.directLine.tokenEndpoint) {
    throw new Error('Either DIRECT_LINE_SECRET or DIRECT_LINE_TOKEN_ENDPOINT must be configured');
  }
  
  console.log(`✅ Configuration validated successfully`);
  console.log(`   - Speech Region: ${config.speech.region}`);
  console.log(`   - Default Locale: ${config.speech.defaultLocale}`);
  console.log(`   - Server Port: ${config.server.port}`);
  console.log(`   - Environment: ${config.server.nodeEnv}`);
  console.log(`   - Bot Name: ${config.directLine.botName}`);
  
  if (config.directLine.tokenEndpoint) {
    console.log(`   - Direct Line: Using Token Endpoint`);
  } else {
    console.log(`   - Direct Line: Using Secret Key`);
  }
}
