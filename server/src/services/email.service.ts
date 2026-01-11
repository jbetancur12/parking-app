
import { Resend } from 'resend';

export class EmailService {
    private resend: Resend;

    constructor() {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            console.warn('RESEND_API_KEY is not defined. Email service will not work.');
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
            console.log(`Welcome email sent to ${email}`);
        } catch (error) {
            console.error('Error sending welcome email:', error);
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
            console.log(`Reset email sent to ${email}`);
        } catch (error) {
            console.error('Error sending reset email:', error);
            throw error;
        }
    }
}
