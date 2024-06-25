import nodemailer from 'nodemailer'
import mailtrapConfig from '../config/mailtrap'

const transporter = nodemailer.createTransport(mailtrapConfig);

export async function sendPasswordResetEmail(userEmail: string, resetToken: string) {
    const resetUrl = `https://adminplaces.com/resetPassword?token=${resetToken}&${userEmail}`;

    const mailOptions = {
        from: 'no-reply@adminplaces.com',
        to: userEmail,
        subject: 'Recuperação de Senha',
        html: `<h1>Recuperação de senha</h1><br /><p>Você solicitou a recuperação de senha. Clique no link abaixo para resetar sua senha:</p>
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

export async function sendActivationAccountEmail(email: string, token: string) {
    const activateAccountUrl = `https://adminplaces.com/activateAccount?token=${email}&${token}`;

    const mailOptions = {
        from: 'no-reply@adminplaces.com',
        to: email,
        subject: 'Recuperação de Senha',
        html: `<h1>Ativação de conta</h1><br /><p>Bem vindo ao Admin Places. Clique no link abaixo para ativar sua conta:</p>
           <a href="${activateAccountUrl}">Resetar Senha</a>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email de ativação de conta enviado com sucesso');
        return true; // Indica que o email foi enviado com sucesso
    } catch (error) {
        console.error('Erro ao enviar email de ativação de conta:', error);
        throw new Error('Erro ao enviar email de de ativação de conta');
    }
}
