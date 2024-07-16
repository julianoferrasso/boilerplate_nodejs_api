import nodemailer from 'nodemailer'
import mailtrapConfig from '../config/mailtrap'

const transporter = nodemailer.createTransport(mailtrapConfig);

export async function sendPasswordResetEmail(userEmail: string, resetToken: string) {
    // Construindo a URL com parâmetros
    const baseUrl = 'https://localhost:3000/activateAccount';
    const url = new URL(baseUrl);
    url.searchParams.append('email', userEmail);
    url.searchParams.append('token', resetToken);
    const resetUrl = url.toString();

    const mailOptions = {
        from: 'no-reply@adminplaces.com',
        to: userEmail,
        subject: 'Recuperação de Senha',
        html: `<h1>Recuperação de senha</h1><br /><p>Você solicitou a recuperação de senha. Clique no link abaixo para resetar sua senha:</p>
           <a href="${resetUrl}">Resetar Senha</a>`
    };

    try {
        await transporter.sendMail(mailOptions);
        return true; // Indica que o email foi enviado com sucesso
    } catch (error) {
        console.error('Erro ao enviar email de recuperação de senha:', error);
        throw new Error('Erro ao enviar email de recuperação de senha');
    }
}

export async function sendActivationAccountEmail(email: string, token: string) {
    // Construindo a URL com parâmetros
    const baseUrl = 'https://localhost:3000/activateAccount';
    const url = new URL(baseUrl);
    url.searchParams.append('email', email);
    url.searchParams.append('token', token);
    const activateAccountUrl = url.toString();

    const mailOptions = {
        from: 'no-reply@adminplaces.com',
        to: email,
        subject: 'Recuperação de Senha',
        html: `<h1>Ativação de conta</h1><br /><p>Bem vindo ao Admin Places. Clique no link abaixo para ativar sua conta:</p>
           <a href="${activateAccountUrl}">Resetar Senha</a>`
    };

    try {
        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Erro ao enviar email:', error);
                return;
            }
            console.log('Email enviado:', info.response);
        });
        return true; // Indica que o email foi enviado com sucesso
    } catch (error) {
        console.error('Erro ao enviar email de ativação de conta:', error);
        throw new Error('Erro ao enviar email de de ativação de conta');
    }
}
