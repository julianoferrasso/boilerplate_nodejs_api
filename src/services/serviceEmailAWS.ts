import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// Configuração do cliente SES
const sesClient = new SESClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
});

// Função para enviar e-mail de recuperação de senha
export async function sendPasswordResetEmail(userEmail: string, resetToken: string) {
    const baseUrl = 'https://wejobi.com/resetPassword';
    const url = new URL(baseUrl);
    url.searchParams.append('email', userEmail);
    url.searchParams.append('token', resetToken);
    const resetUrl = url.toString();

    const mailOptions = {
        Source: 'suporte@wejobi.com', // Substitua pelo seu endereço de e-mail verificado
        Destination: {
            ToAddresses: [userEmail],
        },
        Message: {
            Subject: {
                Data: 'Recuperação de Senha',
            },
            Body: {
                Html: {
                    Data: `<h1>Recuperação de senha</h1><br /><p>Você solicitou a recuperação de senha. Clique no link abaixo para resetar sua senha:</p>
                          <a href="${resetUrl}">Resetar Senha</a>`,
                },
            },
        },
    };

    try {
        const command = new SendEmailCommand(mailOptions);
        await sesClient.send(command);
        return true; // Indica que o email foi enviado com sucesso
    } catch (error) {
        console.error('Erro ao enviar email de recuperação de senha:', error);
        throw new Error('Erro ao enviar email de recuperação de senha');
    }
}

// Função para enviar e-mail de ativação de conta
export async function sendActivationAccountEmail(email: string, token: string) {
    const baseUrl = 'https://wejobi.com/activateEmail';
    const url = new URL(baseUrl);
    url.searchParams.append('email', email);
    url.searchParams.append('token', token);
    const activateAccountUrl = url.toString();

    const mailOptions = {
        Source: 'suporte@wejobi.com', // Substitua pelo seu endereço de e-mail verificado
        Destination: {
            ToAddresses: [email],
        },
        Message: {
            Subject: {
                Data: 'Ativação de Conta',
            },
            Body: {
                Html: {
                    Data: `<h1>Ativação de conta</h1><br /><p>Bem vindo ao Admin Places. Clique no link abaixo para ativar sua conta:</p>
                          <a href="${activateAccountUrl}">Ative sua Conta</a>`,
                },
            },
        },
    };

    try {
        const command = new SendEmailCommand(mailOptions);
        await sesClient.send(command);
        return true; // Indica que o email foi enviado com sucesso
    } catch (error) {
        console.error('Erro ao enviar email de ativação de conta:', error);
        throw new Error('Erro ao enviar email de ativação de conta');
    }
}
