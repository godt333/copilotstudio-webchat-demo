/**
 * THR505 Demo Server
 * ==================
 * Express backend for the Voice Web Client demo.
 * 
 * This server provides secure token endpoints for:
 * - Direct Line Speech integration
 * - Speech Ponyfill integration
 * - Direct Line messaging
 * - LiveHub telephony integration
 * 
 * All secrets are kept server-side; only short-lived tokens are sent to clients.
 * 
 * @author THR505 Demo
 * @see README.md for setup instructions
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import { config, validateConfig } from './config/env';
import speechRoutes from './routes/speechRoutes';
import directLineRoutes from './routes/directLineRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

/**
 * Create and configure the Express application
 */
function createApp(): Application {
  const app = express();

  // ==========================================================================
  // Security Middleware
  // ==========================================================================
  
  // Helmet adds various HTTP headers for security
  app.use(helmet({
    // Allow inline scripts for development
    contentSecurityPolicy: config.server.nodeEnv === 'production',
  }));

  // ==========================================================================
  // CORS Configuration
  // ==========================================================================
  
  // Allow requests from the frontend development server
  // In production, this should be restricted to your domain
  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) {
        callback(null, true);
        return;
      }
      
      // Check if origin is in the allowed list
      if (config.server.corsOrigins.includes(origin)) {
        callback(null, true);
      } else if (config.server.nodeEnv === 'development') {
        // In development, allow any localhost origin
        if (origin.startsWith('http://localhost')) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

  app.use(cors(corsOptions));

  // ==========================================================================
  // Request Parsing
  // ==========================================================================
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ==========================================================================
  // Request Logging
  // ==========================================================================
  
  // Use 'dev' format for colored output in development
  // SECURITY: morgan is configured to NOT log sensitive data
  app.use(morgan(config.server.nodeEnv === 'development' ? 'dev' : 'combined'));

  // ==========================================================================
  // Health Check Endpoint
  // ==========================================================================
  
  /**
   * GET /health
   * 
   * Health check endpoint for Azure App Service, load balancers, and monitoring.
   * Returns basic server status without exposing sensitive information.
   */
  app.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: config.server.nodeEnv,
    });
  });

  // ==========================================================================
  // API Routes
  // ==========================================================================
  
  /**
   * Speech Services Routes
   * - GET /api/speechservices/token - Direct Line Speech token
   * - GET /api/speechservices/ponyfillKey - Speech Ponyfill credentials
   */
  app.use('/api/speechservices', speechRoutes);

  /**
   * Direct Line Routes
   * - GET /api/directline/token - Standard Direct Line token
   * - GET /api/directline/livehubToken - LiveHub telephony token
   * - POST /api/directline/refresh - Refresh existing token
   */
  app.use('/api/directline', directLineRoutes);

  /**
   * API Information Endpoint
   */
  app.get('/api', (req: Request, res: Response) => {
    res.json({
      name: 'THR505 Demo API',
      version: '1.0.0',
      description: 'Voice Web Client for Copilot Studio',
      endpoints: {
        health: 'GET /health',
        speechToken: 'GET /api/speechservices/token',
        ponyfillKey: 'GET /api/speechservices/ponyfillKey',
        directLineToken: 'GET /api/directline/token',
        livehubToken: 'GET /api/directline/livehubToken',
        refreshToken: 'POST /api/directline/refresh',
      },
      documentation: 'See /docs folder in the repository',
    });
  });

  // ==========================================================================
  // Static Files (Production)
  // ==========================================================================
  
  // In production, serve the built React app from the 'public' folder
  if (config.server.nodeEnv === 'production') {
    const publicPath = path.join(__dirname, '..', 'public');
    app.use(express.static(publicPath));
    
    // Serve index.html for all non-API routes (SPA routing)
    app.get('*', (req: Request, res: Response, next) => {
      if (req.path.startsWith('/api')) {
        next();
      } else {
        res.sendFile(path.join(publicPath, 'index.html'));
      }
    });
  }

  // ==========================================================================
  // Error Handling
  // ==========================================================================
  
  // 404 handler for undefined routes
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
}

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  THR505 Demo Server - Voice Web Client for Copilot Studio');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  try {
    // Validate configuration before starting
    validateConfig();
    console.log('');

    // Create the Express app
    const app = createApp();

    // Start listening
    const port = config.server.port;
    
    app.listen(port, () => {
      console.log('🚀 Server is running!');
      console.log('');
      console.log(`   Local:   http://localhost:${port}`);
      console.log(`   Health:  http://localhost:${port}/health`);
      console.log(`   API:     http://localhost:${port}/api`);
      console.log('');
      console.log('📚 Available endpoints:');
      console.log(`   GET  /api/speechservices/token      - Direct Line Speech token`);
      console.log(`   GET  /api/speechservices/ponyfillKey - Speech Ponyfill credentials`);
      console.log(`   GET  /api/directline/token          - Direct Line token`);
      console.log(`   GET  /api/directline/livehubToken   - LiveHub telephony token`);
      console.log(`   POST /api/directline/refresh        - Refresh token`);
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('  Waiting for requests...');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
    });

  } catch (error: any) {
    console.error('');
    console.error('❌ Failed to start server:');
    console.error(`   ${error.message}`);
    console.error('');
    console.error('Please check your .env file and ensure all required variables are set.');
    console.error('See .env.example for the required configuration.');
    console.error('');
    process.exit(1);
  }
}

// Start the server
startServer();
