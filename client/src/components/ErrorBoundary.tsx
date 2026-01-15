import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    reportStatus: 'idle' | 'reporting' | 'success' | 'error';
    reportId: string | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            reportStatus: 'idle',
            reportId: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null,
            reportStatus: 'idle',
            reportId: null
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
            // Automatically trigger reporting when error is caught
            reportStatus: 'reporting'
        }, () => {
            this.handleReportError(true);
        });
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    handleReportError = async (isAutoReport: boolean = false) => {
        const { error, errorInfo, reportStatus } = this.state;

        // Prevent duplicate manual reports if already successful or currently reporting (unless retrying on error)
        if (!isAutoReport && (reportStatus === 'success' || reportStatus === 'reporting')) {
            return;
        }

        this.setState({ reportStatus: 'reporting' });

        try {
            // Dynamically import service to avoid circular dependencies
            const { errorLogService } = await import('../services/errorLog.service');

            // Try to get user info from localStorage since we are outside AuthContext
            let userId: number | undefined;
            let tenantId: string | undefined;

            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    userId = user.id;
                    if (user.tenants && user.tenants.length > 0) {
                        tenantId = user.tenants[0].id;
                    }
                }
            } catch (e) {
                console.error('Failed to parse user from localStorage', e);
            }

            const response = await errorLogService.reportError({
                errorMessage: error?.message || 'Unknown error',
                errorStack: error?.stack || undefined,
                componentStack: errorInfo?.componentStack || undefined,
                userAgent: navigator.userAgent,
                url: window.location.href,
                userId,
                tenantId
            });

            this.setState({
                reportStatus: 'success',
                reportId: response.id
            });

            // Show success toast (import dynamically to avoid issues)
            // Only show toast if manual, or valid UX decision?
            // User requested to know it's reported. 
            // If auto-reported, maybe a subtle toast or just update the UI button is enough.
            // Let's show toast for visibility.
            const { toast } = await import('sonner');
            toast.success('Error reportado automáticamente', {
                description: `ID del reporte: ${response.id}`
            });

        } catch (err: any) {
            console.error('Failed to report error:', err);
            this.setState({ reportStatus: 'error' });

            // Only fallback to mailto if it was a manual click, otherwise just show error state
            if (!isAutoReport) {
                const subject = encodeURIComponent('Error en Aparca');
                const body = encodeURIComponent(
                    `Ha ocurrido un error en la aplicación:\n\n` +
                    `Error: ${error?.message}\n\n` +
                    `Stack: ${error?.stack}`
                );
                window.location.href = `mailto:soporte@aparca.com?subject=${subject}&body=${body}`;
            }
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-brand-blue to-blue-900 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 md:p-12">
                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="bg-red-100 rounded-full p-6">
                                <AlertTriangle size={64} className="text-red-600" />
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl font-display font-bold text-brand-blue text-center mb-4">
                            ¡Ups! Algo salió mal
                        </h1>

                        {/* Description */}
                        <p className="text-gray-600 text-center mb-8">
                            Lo sentimos, la aplicación encontró un error inesperado.
                            {this.state.reportStatus === 'success'
                                ? ' El error ha sido reportado automáticamente a nuestro equipo.'
                                : ' Nuestro equipo ha sido notificado y trabajaremos para solucionarlo pronto.'}
                        </p>

                        {/* Error details (only in development) */}
                        {import.meta.env.DEV && this.state.error && (
                            <details className="bg-gray-50 rounded-lg p-4 mb-8 border border-gray-200">
                                <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                                    Detalles técnicos (desarrollo)
                                </summary>
                                <div className="mt-4 space-y-2">
                                    <div className="text-sm">
                                        <strong className="text-red-600">Error:</strong>
                                        <pre className="mt-1 bg-white p-2 rounded border border-red-200 overflow-x-auto text-xs">
                                            {this.state.error.message}
                                        </pre>
                                    </div>
                                    {this.state.error.stack && (
                                        <div className="text-sm">
                                            <strong className="text-red-600">Stack:</strong>
                                            <pre className="mt-1 bg-white p-2 rounded border border-red-200 overflow-x-auto text-xs">
                                                {this.state.error.stack}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </details>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={this.handleReload}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-yellow text-brand-blue font-bold rounded-lg hover:bg-yellow-400 transition-colors"
                            >
                                <RefreshCw size={20} />
                                Recargar Página
                            </button>

                            <button
                                onClick={this.handleGoHome}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue text-white font-bold rounded-lg hover:bg-blue-800 transition-colors"
                            >
                                <Home size={20} />
                                Ir al Inicio
                            </button>

                            {/* Report Button - Changes based on status */}
                            <button
                                onClick={() => this.handleReportError(false)}
                                disabled={this.state.reportStatus === 'success' || this.state.reportStatus === 'reporting'}
                                className={`flex items-center justify-center gap-2 px-6 py-3 border-2 font-bold rounded-lg transition-colors ${this.state.reportStatus === 'success'
                                        ? 'border-green-500 text-green-600 bg-green-50 cursor-default'
                                        : 'border-brand-blue text-brand-blue hover:bg-blue-50'
                                    }`}
                            >
                                {this.state.reportStatus === 'reporting' && <RefreshCw size={20} className="animate-spin" />}
                                {this.state.reportStatus === 'success' && <div className="flex items-center gap-2">✅ Reportado</div>}
                                {this.state.reportStatus === 'error' && <><Mail size={20} /> Reintentar</>}
                                {this.state.reportStatus === 'idle' && <><Mail size={20} /> Reportar Error</>}
                            </button>
                        </div>

                        {/* Report ID reference */}
                        {this.state.reportId && (
                            <div className="mt-8 text-center text-xs text-gray-400">
                                Ref: {this.state.reportId}
                            </div>
                        )}

                        {/* Footer */}
                        {!this.state.reportId && (
                            <div className="mt-8 text-center text-sm text-gray-500">
                                <p>¿Necesitas ayuda? Contacta a soporte.</p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
export default ErrorBoundary;
