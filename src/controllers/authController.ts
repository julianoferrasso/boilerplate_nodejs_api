import { Request, Response } from 'express';
import prisma from '../prisma/client';
import bcrypt from 'bcryptjs';
import { generateToken, dataToken } from '../config/jwtConfig';
import { sendActivationAccountEmail, sendPasswordResetEmail } from '../services/emailService'
import { compareTokenHash, generateResetTokenHash } from '../services/utils';

const validateEmail = (email: any) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

const delay = (amount = 1000) => new Promise(resolve => setTimeout(resolve, amount))

export const signUp = async (req: Request, res: Response) => {
    try {
        let { name, email, celular, cpf_cnpj, password } = req.body;
        let cpf, cnpj = null
        if (cpf_cnpj > 14) {
            cnpj = cpf_cnpj
        } else {
            cpf = cpf_cnpj
        }
        console.log(`tentando fazer registro com 
            name "${name}", 
            email "${email}", 
            celular "${celular}, 
            cpf "${cpf},
            cnpj "${cnpj},
            password "${password}"
            `)

        if (!email || !password) {
            return res.status(400).json({ error: 'Email e Senha requeridos' });
        }
        email = email.toLowerCase()
        if (!validateEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // encripta a senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        try {
            const userAlreadyExists = await prisma.user.findUnique({
                where: {
                    email: email,
                }
            })
            if (!userAlreadyExists) {
                const user = await prisma.user.create({
                    data: {
                        name,
                        celular,
                        cpf,
                        cnpj,
                        email,
                        password: hashedPassword,
                    },
                });
                res.status(201).json({ message: 'Usuario criado com sucesso', user })
            } else {
                res.status(409).json({ message: 'Email já cadastrado!' })
            }
        } catch (error) {
            console.log(`Erro ao gravar no Banco de Dados em authController: "${error}" `)
            res.status(500).json({ message: 'Estamos enfrentando um problema no servidor. Por favor tente mais tarde. Codigo[BD-1]' });
        }
    } catch (error) {
        console.log(`Erro ao na funçãi SignUp em authController: "${error}" `)
        res.status(500).json({ message: 'Estamos enfrentando um problema no servidor. Por favor tente mais tarde. Codigo[AU-1]' });
    }
};

export const login = async (req: Request, res: Response) => {
    await delay()
    try {
        let { email, password } = req.body;
        // console.log(`tentando fazer login com email "${email}" e password "${password}"`)

        if (!email || !password) {
            return res.status(400).json({ message: 'Email e Senha requeridos' });
        }

        email = email.toLowerCase()

        try {
            const userFind = await prisma.user.findUnique({
                where: { email },
            });

            if (!userFind) {
                return res.status(401).json({ message: 'User or Password incorrect' });
            }
            const validPassword = await bcrypt.compare(password, userFind.password);
            if (!validPassword) {
                return res.status(401).json({ message: 'User or Password incorrect' });
            }
            const token = await generateToken({ email: userFind.email, id: userFind.id } as dataToken);
            const user = { id: userFind.id, name: userFind.name, email: userFind.email, avatarurl: userFind.avatarUrl };
            res.json({ token, user });
        } catch (error) {
            res.status(400).json({ message: 'Something went wrong BD auth' });
        }
    } catch {
        res.status(500).json({ message: 'Something goes wrong auth!' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    await delay()
    try {
        let { email } = req.body;
        let { token } = req.body;
        let { password } = req.body;

        console.log(`tentando recuperar senha com email "${email}"`)
        console.log(`tentando recuperar senha com token "${token}"`)

        // Se tiver os 3 campos então reseta senha
        if (email && token && password) {
            email = email.toLowerCase()
            try {
                const userFind = await prisma.user.findUnique({
                    where: { email },
                });
                // Se nao encontra usuario
                if (!userFind) {
                    return res.status(400).json({ message: 'fail' });
                }
                //Se data expirada
                const now = new Date(Date.now() + 3600000)
                console.log(`User.passwordResetTokenExpires "${userFind.passwordResetTokenExpires}"`)
                console.log(`now "${now}"`)
                if (userFind.passwordResetTokenExpires < now) {
                    return res.status(400).json({ message: 'token expirado' });
                }
                // Se hash nao coincidir com token
                console.log(`User.passwordResetTokenExpires "${userFind.passwordResetHashToken}"`)
                const result = await compareTokenHash(token, userFind.passwordResetHashToken)
                console.log(`Result "${result}"`)
                if (!result) {
                    return res.status(400).json({ message: 'token inválido' });
                }

                if (result) {
                    // Faz o hash do password
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(password, salt);
                    // Salve o hash no banco de dados associado ao usuário
                    await prisma.user.update({
                        where: { email },
                        data: { passwordResetHashToken: null, passwordResetTokenExpires: null, password: hashedPassword }, // zera campos
                    });
                    return res.status(200).json({ message: 'Senha redefinida com sucesso' });
                }
            } catch (error) {
                return res.status(500).json({ message: 'Estamos com problema no momento. Tente mais tarde' });
            }
        }

        if (!email) {
            return res.status(400).json({ message: 'Email requerido' });
        }
        email = email.toLowerCase()

        try {
            const userFind = await prisma.user.findUnique({
                where: { email },
            });

            if (!userFind) {
                return res.status(404).json({ message: 'Email não cadastrado' });
            }

            const { token, hash } = await generateResetTokenHash()

            console.log("gerou o token = ", token)

            // Salve o hash no banco de dados associado ao usuário
            await prisma.user.update({
                where: { email },
                data: { passwordResetHashToken: hash, passwordResetTokenExpires: new Date(Date.now() + 3600000) }, // Token expira em 1 hora
                //data: { passwordReseHashToken: hash, passwordResetTokenExpires: new Date(Date.now() + 60000) }, // Token expira em 1 minuto
            });

            console.log("Enviando email de reset de senha . . .")
            const emailResetPasswordSent = await sendPasswordResetEmail(email, token)

            if (emailResetPasswordSent) {
                res.json({ message: 'Email de recuperação de senha enviado com sucesso' });
            } else {
                res.status(500).json({ message: 'Falha ao enviar email de recuperação de senha' });
            }

        } catch (error) {
            res.status(400).json({ message: 'Something went wrong BD auth' });
        }
    } catch {
        res.status(500).json({ message: 'Something goes wrong auth!' });
    }
};

export const sendEmailActivation = async (req: Request, res: Response) => {

    try {



        console.log("Enviando email de ativação de conta . . .")
        const emailResetPasswordSent = await sendActivationAccountEmail(email, token)

    } catch (error) {

    }
}
