import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Log error with context using structured logger
    logger.error({
        err,
        statusCode,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('user-agent')
    }, `[Error] ${statusCode} - ${message}`);

    // Response structure
    res.status(statusCode).json({
        message,
        // Only return stacktrace in development for security
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        code: err.code || 'INTERNAL_ERROR'
    });
};
