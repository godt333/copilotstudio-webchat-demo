/**
 * Error Handling Middleware
 * =========================
 * Centralized error handling for the Express application.
 * Provides consistent error responses and logging.
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class with status code
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Error response format
 */
interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
  timestamp: string;
  requestId?: string;
}

/**
 * Global error handling middleware
 * 
 * This middleware catches all errors thrown in route handlers
 * and formats them as consistent JSON responses.
 * 
 * SECURITY NOTE: In production, we avoid exposing internal error details
 * that could reveal implementation specifics.
 */
export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error for debugging (with request context)
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error(`❌ Error in ${req.method} ${req.path}`);
  console.error(`   Message: ${err.message}`);
  
  if (process.env.NODE_ENV === 'development') {
    console.error(`   Stack: ${err.stack}`);
  }
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Determine status code
  let statusCode = 500;
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
  } else if ((err as any).response?.status) {
    // Axios error - use the upstream status code
    statusCode = (err as any).response.status;
  }

  // Build error response
  const errorResponse: ErrorResponse = {
    error: err.name || 'Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An error occurred processing your request'
      : err.message,
    timestamp: new Date().toISOString(),
  };

  // Add details in development mode
  if (process.env.NODE_ENV === 'development') {
    if (err instanceof ApiError && err.details) {
      errorResponse.details = err.details;
    }
    if ((err as any).response?.data) {
      errorResponse.details = (err as any).response.data;
    }
  }

  res.status(statusCode).json(errorResponse);
}

/**
 * Not found handler
 * Catches requests to undefined routes
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const response: ErrorResponse = {
    error: 'NotFound',
    message: `Route not found: ${req.method} ${req.path}`,
    timestamp: new Date().toISOString(),
  };

  res.status(404).json(response);
}
