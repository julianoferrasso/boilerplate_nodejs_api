import { Request, Response } from 'express';
import prisma from '../prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { generateToken, dataToken } from '../config/jwtConfig';
import { sendActivationAccountEmail, sendPasswordResetEmail } from '../services/emailService'
import { compareTokenHash, generateResetTokenHash } from '../services/utils';

// funcao para validar email
const validateEmail = (email: any) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

//const delay = (amount = 1000) => new Promise(resolve => setTimeout(resolve, amount))
//await delay()

export const signUp = async (req: Request, res: Response) => {
    try {
        let { name, email, celular, cpf_cnpj, password } = req.body;
        let cpf = null, cnpj = null
        if (cpf_cnpj && cpf_cnpj.lenght > 14) {
            cnpj = cpf_cnpj
        } else {
            cpf = cpf_cnpj
        }
        //console.log(`tentando fazer registro com name "${name}", email "${email}", celular "${celular}", cpf "${cpf}", cnpj "${cnpj}", password "${password}"`)

        if (!email || !password) {
            return res.status(400).json({ error: 'Email e Senha requeridos' });
        }
        email = email.toLowerCase()
        if (!validateEmail(email)) {
            return res.status(400).json({ error: 'Email inválido.' });
        }

        // encripta a senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // gera token para verificação de email
        const tokenEmailVerified = uuidv4();
        const tokenEmailVerifiedExpires = new Date(Date.now() + 3600000)

        // testa se email ja esta cadastrado
        try {
            const userAlreadyExists = await prisma.user.findUnique({
                where: {
                    email: email,
                }
            })

            // Se email não estiver cadastrado então cria usuario no Banco de Dados
            if (!userAlreadyExists) {
                const user = await prisma.user.create({
                    data: {
                        name,
                        celular,
                        cpf,
                        cnpj,
                        email,
                        tokenEmailVerified,
                        tokenEmailVerifiedExpires,
                        password: hashedPassword,

                    },
                });

                // cria usuario com dados basico para enviar como resposta ao front end
                // necessario email para funcao de reenviar email caso usuario não receba 
                const userCreated = { name, email }

                // envia email de ativação de conta
                const emailActivationAccunt = await sendActivationAccountEmail(email, tokenEmailVerified)
                console.log(emailActivationAccunt)
                if (emailActivationAccunt) {
                    res.status(201).json({ message: 'Usuario criado com sucesso', userCreated })
                } else {
                    res.status(201).json({ message: 'Usuario criado com sucesso, Mas não foi possivel enviar e-mail de ativação!', userCreated })
                }
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
    try {
        let { email, password } = req.body;
        // console.log(`tentando fazer login com email "${email}" e password "${password}"`)

        if (!email || !password) {
            return res.status(400).json({ message: 'Email e Senha requeridos' });
        }

        email = email.toLowerCase()

        try {
            const findUserByEmail = await prisma.user.findUnique({
                where: { email },
            });

            if (!findUserByEmail) {
                return res.status(401).json({ message: 'Usuário ou senha incorreta' });
            }
            const validPassword = await bcrypt.compare(password, findUserByEmail.password);
            if (!validPassword) {
                return res.status(401).json({ message: 'Usuário ou senha incorreta' });
            }
            if (!findUserByEmail.emailVerified) {
                return res.status(401).json({ message: 'Email não verificado' });
            }
            const token = await generateToken({ email: findUserByEmail.email, id: findUserByEmail.id } as dataToken);
            const user = { id: findUserByEmail.id, name: findUserByEmail.name, email: findUserByEmail.email, avatarurl: findUserByEmail.avatarUrl };
            res.json({ token, user });
        } catch (error) {
            res.status(400).json({ message: 'Estamos enfrentando um problema no servidor. Por favor tente mais tarde. Codigo[BD-2]' });
        }
    } catch {
        res.status(500).json({ message: 'Estamos enfrentando um problema no servidor. Por favor tente mais tarde. Codigo[SI-1]' });
    }
};

export const resendEmailActivation = async (req: Request, res: Response) => {
    try {
        let { email } = req.body
        try {
            if (!email) {
                return res.status(400).json({ message: 'Email inválido' });
            }

            // procura usuario pelo email
            const userByEmail = await prisma.user.findUnique({
                where: {
                    email
                }
            })

            // se nao encontrar usuario return erro 404
            if (!userByEmail) {
                res.status(404).json({ message: "Email não encontrado!" })
            }

            // cria novo token
            const tokenEmailVerified = uuidv4();

            // atualiza token no Banco de Dados
            await prisma.user.update({
                where: { email },
                data: { tokenEmailVerified, tokenEmailVerifiedExpires: new Date(Date.now() + 3600000) }, // Token expira em 1 hora
            });

            const emailResetPasswordSent = await sendActivationAccountEmail(email, tokenEmailVerified)
            if (emailResetPasswordSent) {
                res.status(200).json({ message: "Email de ativação enviado com sucesso!" })
            } else {
                res.status(500).json({ message: "Ocorreu um erro ao enviar o email de ativação. por favor tente mais tarde" })
            }
        } catch (error) {
            console.log("Erro no envio de email:", error)
            res.status(500).json({ message: "Estamos enfrentando um problema no servidor. Por favor tente mais tarde. Codigo[BD-4]" })
        }
    } catch (error) {
        console.log("Erro na função accountActivation:", error)
        res.status(500).json({ message: "Estamos enfrentando um problema no servidor. Por favor tente mais tarde. Codigo[RE-1]" })
    }
}

export const resetPassword = async (req: Request, res: Response) => {
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
                const findUserByEmail = await prisma.user.findUnique({
                    where: { email },
                });
                // Se nao encontra usuario
                if (!findUserByEmail) {
                    return res.status(400).json({ message: 'Email não cadastrado' });
                }

                console.log("token e expg", findUserByEmail.passwordResetHashToken, findUserByEmail.passwordResetTokenExpires)

                // Verifique se o token não é nulo
                if (!findUserByEmail.passwordResetHashToken || !findUserByEmail.passwordResetTokenExpires) {
                    return res.status(400).json({ message: 'Token inválido' });
                }
                //Se data expirada
                const now = new Date(Date.now())
                if (findUserByEmail.passwordResetTokenExpires < now) {
                    return res.status(400).json({ message: 'token expirado' });
                }
                // Se hash nao coincidir com token
                console.log(`User.passwordResetTokenExpires "${findUserByEmail.passwordResetHashToken}"`)
                const result = await compareTokenHash(token, findUserByEmail.passwordResetHashToken)
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

            // Salva o hash no banco de dados associado ao usuário
            await prisma.user.update({
                where: { email },
                data: { passwordResetHashToken: hash, passwordResetTokenExpires: new Date(Date.now() + 3600000) }, // Token expira em 1 hora
            });

            const emailResetPasswordSent = await sendPasswordResetEmail(email, token)

            if (emailResetPasswordSent) {
                res.json({ message: 'Email de recuperação de senha enviado com sucesso' });
            } else {
                res.status(500).json({ message: 'Falha ao enviar email de recuperação de senha' });
            }

        } catch (error) {
            res.status(400).json({ message: 'Estamos enfrentando um problema no servidor. Por favor tente mais tarde. Codigo[BD-3]' });
        }
    } catch {
        res.status(500).json({ message: 'Estamos enfrentando um problema no servidor. Por favor tente mais tarde. Codigo[RP-1]' });
    }
};

export async function verifyEmail(req: Request, res: Response) {
    try {
        const { email, token } = req.body

        // buscar usuario no BD pelo email
        const findUserByEmail = await prisma.user.findUnique({
            where: { email },
        });

        // se nao encontrar email
        if (!findUserByEmail) {
            return res.status(404).json({ message: "Email não cadastrado" })
        }

        // comparar se token do BD é igual ao token recebido na req, senao retorna erro
        const { tokenEmailVerified, tokenEmailVerifiedExpires } = findUserByEmail

        if (tokenEmailVerified != token) {
            return res.status(401).json({ message: "Token inválido" })
        }

        // verificar se tokenEmailVerifiedExpires é < que agora senao retorna erro
        const now = new Date(Date.now())
        if (tokenEmailVerifiedExpires && tokenEmailVerifiedExpires < now) {
            return res.status(401).json({ message: "Token expirado" })
        }

        // se token for igual e nao expirado, atualizar usuario tokenEmailVerified = true e retornar sucesso
        await prisma.user.update({
            where: { email },
            data: { emailVerified: true },
        });

        return res.status(200).json({ message: "Email verificado com sucesso" })
    } catch (error) {
        return res.status(500).json({ message: "Erro" })
    }

}
