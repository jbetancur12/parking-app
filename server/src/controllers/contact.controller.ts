import { Request, Response } from 'express';
import { EmailService } from '../services/email.service';

const emailService = new EmailService();

export const sendContactEmail = async (req: Request, res: Response) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Por favor complete todos los campos (nombre, email, mensaje).'
            });
        }

        await emailService.sendContactFormEmail({ name, email, message });

        return res.status(200).json({
            success: true,
            message: 'Mensaje enviado correctamente. Nos pondremos en contacto pronto.'
        });
    } catch (error) {
        console.error('Error in sendContactEmail controller:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al enviar el mensaje. Intente de nuevo más tarde.'
        });
    }
};
