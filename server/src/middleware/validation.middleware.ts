import { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

/**
 * Middleware to validate request body against a DTO class
 * @param dtoClass - The DTO class to validate against
 * @param skipMissingProperties - Whether to skip validation of missing properties
 */
export function validateBody(dtoClass: any, skipMissingProperties = false) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Transform plain object to class instance
            const dtoInstance = plainToClass(dtoClass, req.body);

            // Validate the instance
            const errors: ValidationError[] = await validate(dtoInstance, {
                skipMissingProperties,
                whitelist: true, // Strip properties that don't have decorators
                forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
            });

            if (errors.length > 0) {
                // Format errors for response
                const formattedErrors = errors.map(error => ({
                    field: error.property,
                    constraints: error.constraints,
                    value: error.value,
                }));

                return res.status(400).json({
                    message: 'Validation failed',
                    errors: formattedErrors,
                });
            }

            // Replace req.body with validated and transformed DTO
            req.body = dtoInstance;
            next();
        } catch (error) {
            console.error('Validation middleware error:', error);
            return res.status(500).json({
                message: 'Internal validation error',
            });
        }
    };
}

/**
 * Middleware to validate query parameters
 */
export function validateQuery(dtoClass: any) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const dtoInstance = plainToClass(dtoClass, req.query as object);
            const errors: ValidationError[] = await validate(dtoInstance as object, {
                whitelist: true,
                forbidNonWhitelisted: true,
            });

            if (errors.length > 0) {
                const formattedErrors = errors.map(error => ({
                    field: error.property,
                    constraints: error.constraints,
                }));

                return res.status(400).json({
                    message: 'Query validation failed',
                    errors: formattedErrors,
                });
            }

            req.query = dtoInstance as any;
            next();
        } catch (error) {
            console.error('Query validation error:', error);
            return res.status(500).json({
                message: 'Internal validation error',
            });
        }
    };
}

/**
 * Middleware to validate route parameters
 */
export function validateParams(dtoClass: any) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const dtoInstance = plainToClass(dtoClass, req.params as object);
            const errors: ValidationError[] = await validate(dtoInstance as object);

            if (errors.length > 0) {
                const formattedErrors = errors.map(error => ({
                    field: error.property,
                    constraints: error.constraints,
                }));

                return res.status(400).json({
                    message: 'Parameter validation failed',
                    errors: formattedErrors,
                });
            }

            req.params = dtoInstance as any;
            next();
        } catch (error) {
            console.error('Params validation error:', error);
            return res.status(500).json({
                message: 'Internal validation error',
            });
        }
    };
}
