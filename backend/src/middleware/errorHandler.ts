import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error:', err.message);

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode);
  }

  // Prisma errors
  if (err.message.includes('Prisma')) {
    console.error('Prisma Error:', err);
    return sendError(res, 'Database error occurred', 500);
  }

  // JWT errors
  if (err.message.includes('jwt') || err.message.includes('JsonWebToken')) {
    return sendError(res, 'Invalid or expired token', 401);
  }

  // Default
  return sendError(res, 'Internal server error', 500);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
