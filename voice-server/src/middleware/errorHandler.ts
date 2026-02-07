/**
 * Error Handling Middleware
 */

import { Request, Response, NextFunction } from 'express';

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

interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
  timestamp: string;
}

export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error(`❌ Error in ${req.method} ${req.path}`);
  console.error(`   Message: ${err.message}`);
  
  if (process.env.NODE_ENV === 'development') {
    console.error(`   Stack: ${err.stack}`);
  }
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  let statusCode = 500;
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
  } else if ((err as any).response?.status) {
    statusCode = (err as any).response.status;
  }

  const errorResponse: ErrorResponse = {
    error: err.name || 'Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An error occurred processing your request'
      : err.message,
    timestamp: new Date().toISOString(),
  };

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
