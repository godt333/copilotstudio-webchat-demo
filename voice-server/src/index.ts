/**
 * Voice Server
 * ============
 * Express backend for Voice Demos V2.
 * Provides secure token endpoints for Direct Line and Speech Services.
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

function createApp(): Application {
  const app = express();

  // Security
  app.use(helmet({
    contentSecurityPolicy: config.server.nodeEnv === 'production',
  }));

  // CORS
  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      
      if (config.server.corsOrigins.includes(origin)) {
        callback(null, true);
      } else if (config.server.nodeEnv === 'development') {
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

  // Parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging
  app.use(morgan(config.server.nodeEnv === 'development' ? 'dev' : 'combined'));

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: config.server.nodeEnv,
    });
  });

  // API Routes
  app.use('/api/speechservices', speechRoutes);
  app.use('/api/directline', directLineRoutes);

  // API Info
  app.get('/api', (req: Request, res: Response) => {
    res.json({
      name: 'Voice Server API',
      version: '1.0.0',
      description: 'Voice Demos V2 Backend',
      endpoints: {
        health: 'GET /health',
        speechToken: 'GET /api/speechservices/token',
        ponyfillKey: 'GET /api/speechservices/ponyfillKey',
        directLineToken: 'GET /api/directline/token',
        livehubToken: 'GET /api/directline/livehubToken',
        proxyBotToken: 'GET /api/directline/proxyBotToken',
        refreshToken: 'POST /api/directline/refresh',
      },
    });
  });

  // Static files in production
  if (config.server.nodeEnv === 'production') {
    const publicPath = path.join(__dirname, '..', 'public');
    app.use(express.static(publicPath));
    
    app.get('*', (req: Request, res: Response, next) => {
      if (req.path.startsWith('/api')) {
        next();
      } else {
        res.sendFile(path.join(publicPath, 'index.html'));
      }
    });
  }

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

async function startServer(): Promise<void> {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Voice Server - Voice Demos V2 Backend');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  try {
    validateConfig();
    console.log('');

    const app = createApp();
    const port = config.server.port;
    
    app.listen(port, () => {
      console.log('🚀 Server is running!');
      console.log('');
      console.log(`   Local:   http://localhost:${port}`);
      console.log(`   Health:  http://localhost:${port}/health`);
      console.log(`   API:     http://localhost:${port}/api`);
      console.log('');
      console.log('📚 Available endpoints:');
      console.log(`   GET  /api/speechservices/token      - Speech token`);
      console.log(`   GET  /api/speechservices/ponyfillKey - Ponyfill credentials`);
      console.log(`   GET  /api/directline/token          - Direct Line token`);
      console.log(`   GET  /api/directline/proxyBotToken  - Proxy Bot token`);
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

startServer();
