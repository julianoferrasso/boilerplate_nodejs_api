import nodemailer from 'nodemailer'
import mailtrapConfig from '../config/mailtrap'

const transporter = nodemailer.createTransport(mailtrapConfig);

export async function sendPasswordResetEmail(userEmail: string, resetToken: string) {
    const resetUrl = `https://adminplaces.com/resetPassword?token=${resetToken}`;

    const mailOptions = {
        from: 'no-reply@adminplaces.com',
        to: userEmail,
        subject: 'Recuperação de Senha',
        html: `<p>Você solicitou a recuperação de senha. Clique no link abaixo para resetar sua senha:</p>
           <a href="${resetUrl}">Resetar Senha</a>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email de recuperação de senha enviado com sucesso');
        return true; // Indica que o email foi enviado com sucesso
    } catch (error) {
        console.error('Erro ao enviar email de recuperação de senha:', error);
        throw new Error('Erro ao enviar email de recuperação de senha');
    }
}
