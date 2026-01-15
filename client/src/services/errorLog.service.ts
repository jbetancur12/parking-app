import api from './api';

export interface ErrorLogData {
    errorMessage: string;
    errorStack?: string;
    componentStack?: string;
    userAgent?: string;
    url?: string;
    tenantId?: string;
    userId?: number;
}

export interface ErrorLogResponse {
    id: string;
    errorMessage: string;
    errorStack?: string;
    componentStack?: string;
    userAgent?: string;
    url?: string;
    timestamp: string;
    resolved: boolean;
    tenant?: {
        id: string;
        name: string;
    };
    user?: {
        id: number;
        username: string;
    };
}

class ErrorLogService {
    /**
     * Report an error to the backend
     * Public endpoint - doesn't require authentication
     */
    async reportError(errorData: ErrorLogData): Promise<{ message: string; id: string }> {
        const response = await api.post('/error-logs', errorData);
        return response.data;
    }

    /**
     * Get all error logs (Super Admin only)
     */
    async getErrorLogs(params?: {
        resolved?: boolean;
        limit?: number;
        offset?: number;
    }): Promise<{
        errorLogs: ErrorLogResponse[];
        total: number;
        limit: number;
        offset: number;
    }> {
        const response = await api.get('/error-logs', { params });
        return response.data;
    }

    /**
     * Mark an error as resolved (Super Admin only)
     */
    async resolveError(id: string): Promise<{ message: string; errorLog: ErrorLogResponse }> {
        const response = await api.patch(`/error-logs/${id}/resolve`);
        return response.data;
    }
}

export const errorLogService = new ErrorLogService();
