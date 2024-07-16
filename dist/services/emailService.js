"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendActivationAccountEmail = exports.sendPasswordResetEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const mailtrap_1 = __importDefault(require("../config/mailtrap"));
const transporter = nodemailer_1.default.createTransport(mailtrap_1.default);
function sendPasswordResetEmail(userEmail, resetToken) {
    return __awaiter(this, void 0, void 0, function* () {
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
            yield transporter.sendMail(mailOptions);
            return true; // Indica que o email foi enviado com sucesso
        }
        catch (error) {
            console.error('Erro ao enviar email de recuperação de senha:', error);
            throw new Error('Erro ao enviar email de recuperação de senha');
        }
    });
}
exports.sendPasswordResetEmail = sendPasswordResetEmail;
function sendActivationAccountEmail(email, token) {
    return __awaiter(this, void 0, void 0, function* () {
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
            yield transporter.sendMail(mailOptions);
            return true; // Indica que o email foi enviado com sucesso
        }
        catch (error) {
            console.error('Erro ao enviar email de ativação de conta:', error);
            throw new Error('Erro ao enviar email de de ativação de conta');
        }
    });
}
exports.sendActivationAccountEmail = sendActivationAccountEmail;
