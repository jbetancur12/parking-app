
import { Resend } from 'resend';
import { logger } from '../utils/logger';

export class EmailService {
    private resend: Resend;

    constructor() {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            logger.warn('RESEND_API_KEY is not defined. Email service will not work.');
        }
        this.resend = new Resend(apiKey || 're_123');
    }

    async sendWelcomeEmail(email: string, name: string, token: string) {
        // In production, change this URL to your frontend URL
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}&is_activation=true`;

        try {
            await this.resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || 'Aparca <onboarding@resend.dev>',
                to: email,
                subject: 'Bienvenido a Aparca - Activa tu cuenta',
                html: `
                    <h1>Hola ${name},</h1>
                    <p>Bienvenido a Aparca. Para comenzar a usar la plataforma, por favor activa tu cuenta definiendo tu contraseña:</p>
                    <a href="${resetLink}" style="padding: 10px 20px; background-color: #003B5C; color: white; text-decoration: none; border-radius: 5px;">Activar Cuenta</a>
                    <p>Si no esperabas este correo, puedes ignorarlo.</p>
                `
            });
            logger.info({ email }, 'Welcome email sent');
        } catch (error) {
            logger.error({ error, email }, 'Error sending welcome email');
            throw error;
        }
    }

    async sendPasswordResetEmail(email: string, token: string) {
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

        try {
            await this.resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || 'Aparca <onboarding@resend.dev>',
                to: email,
                subject: 'Recuperación de Contraseña',
                html: `
                    <h1>Recuperar Contraseña</h1>
                    <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
                    <a href="${resetLink}" style="padding: 10px 20px; background-color: #003B5C; color: white; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
                    <p>Este enlace expirará en 1 hora.</p>
                    <p>Si no has solicitado esto, ignora este correo.</p>
                `
            });
            logger.info({ email }, 'Reset email sent');
        } catch (error) {
            logger.error({ error, email }, 'Error sending reset email');
            throw error;
        }
    }

    async sendContactFormEmail(data: { name: string; email: string; message: string }) {
        const toEmail = 'jabetancur12@gmail.com'; // Hardcoded as per request

        try {
            await this.resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || 'Aparca Contacto <onboarding@resend.dev>',
                to: toEmail,
                replyTo: data.email,
                subject: `Nuevo Mensaje de Contacto: ${data.name}`,
                html: `
                    <h1>Nuevo Mensaje desde el Landing Page</h1>
                    <p><strong>Nombre:</strong> ${data.name}</p>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>Mensaje:</strong></p>
                    <blockquote style="background: #f9f9f9; border-left: 5px solid #ccc; margin: 1.5em 10px; padding: 0.5em 10px;">
                        ${data.message.replace(/\n/g, '<br>')}
                    </blockquote>
                `
            });
            logger.info({ fromEmail: data.email }, 'Contact form email sent');
        } catch (error) {
            logger.error({ error, fromEmail: data.email }, 'Error sending contact form email');
            throw error;
        }
    }
    async sendErrorAlert(errorDetails: {
        errorMessage: string;
        errorStack?: string;
        tenantName?: string;
        username?: string;
        url?: string;
        timestamp: Date;
    }) {
        const toEmail = 'jabetancur12@gmail.com'; // Hardcoded Super Admin email

        try {
            await this.resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL_ALERTS || process.env.RESEND_FROM_EMAIL || 'Aparca Alertas <alerts@resend.dev>',
                to: toEmail,
                subject: `🚨 Error Nuevo: ${errorDetails.errorMessage.substring(0, 50)}...`,
                html: `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2 style="color: #D32F2F;">Nuevo Error Reportado</h2>
                        <p><strong>Mensaje:</strong> ${errorDetails.errorMessage}</p>
                        <p><strong>Fecha:</strong> ${errorDetails.timestamp.toLocaleString('es-CO')}</p>
                        <hr />
                        <p><strong>Usuario:</strong> ${errorDetails.username || 'Anónimo'}</p>
                        <p><strong>Empresa:</strong> ${errorDetails.tenantName || 'N/A'}</p>
                        <p><strong>URL:</strong> ${errorDetails.url || 'N/A'}</p>
                        <hr />
                        <h3>Stack Trace:</h3>
                        <pre style="background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; font-size: 12px;">
${errorDetails.errorStack || 'No stack trace available'}
                        </pre>
                        <br />
                        <a href="${process.env.FRONTEND_URL || 'https://aparca.app'}/admin/errors" style="padding: 10px 20px; background-color: #003B5C; color: white; text-decoration: none; border-radius: 5px;">Ver en Dashboard</a>
                    </div>
                `
            });
            logger.info({ to: toEmail }, 'Error alert email sent successfully');
        } catch (error) {
            // We use error level here but we don't throw to avoid loop if this was called from error handler
            logger.error({ error, to: toEmail }, 'Failed to send error alert email');
        }
    }
}
