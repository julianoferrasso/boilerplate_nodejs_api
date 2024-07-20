import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import nodemailer from 'nodemailer';

// Configurar AWS SES Client
const ses = new SESClient({
    region: 'us-east-1', // Substitua pela sua região do SES
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

// Criar transporte Nodemailer com AWS SES
const transporter = nodemailer.createTransport({
    SES: { ses, aws: { SendEmailCommand } },
});

export async function sendPasswordResetEmail(userEmail: string, resetToken: string) {
    const baseUrl = 'https://wejobi.com/resetPassword';
    const url = new URL(baseUrl);
    url.searchParams.append('email', userEmail);
    url.searchParams.append('token', resetToken);
    const resetUrl = url.toString();

    const mailOptions = {
        from: 'no-reply@wejobi.com',
        to: userEmail,
        subject: 'Recuperação de Senha',
        html: `<h1>Recuperação de senha</h1><br /><p>Você solicitou a recuperação de senha. Clique no link abaixo para resetar sua senha:</p>
           <a href="${resetUrl}">Resetar Senha</a>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Erro ao enviar email de recuperação de senha:', error);
        throw new Error('Erro ao enviar email de recuperação de senha');
    }
}

export async function sendActivationAccountEmail(email: string, token: string) {
    const baseUrl = 'https://wejobi.com/activateEmail';
    const url = new URL(baseUrl);
    url.searchParams.append('email', email);
    url.searchParams.append('token', token);
    const activateAccountUrl = url.toString();

    const mailOptions = {
        from: 'no-reply@wejobi.com',
        to: email,
        subject: 'Ativação de Conta',
        html: `<h1>Ativação de conta</h1><br /><p>Bem vindo ao Admin Places. Clique no link abaixo para ativar sua conta:</p>
           <a href="${activateAccountUrl}">Ative sua Conta</a>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Erro ao enviar email de ativação de conta:', error);
        throw new Error('Erro ao enviar email de ativação de conta');
    }
}
