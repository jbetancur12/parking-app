import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Log the full error stack in server console for debugging
    console.error(`[Error] ${statusCode} - ${message}`);
    if (process.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    }

    // Response structure
    res.status(statusCode).json({
        message,
        // Only return stacktrace in development for security
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        code: err.code || 'INTERNAL_ERROR'
    });
};
