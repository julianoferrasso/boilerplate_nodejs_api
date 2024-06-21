import { Request, Response } from 'express';
import prisma from '../prisma/client';
import bcrypt from 'bcryptjs';
import { generateToken, dataToken } from '../config/jwtConfig';

const validateEmail = (email: any) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

const delay = (amount = 1000) => new Promise(resolve => setTimeout(resolve, amount))

export const register = async (req: Request, res: Response) => {
    try {
        let { email, password } = req.body;
        console.log(`tentando fazer registro com email "${email}" e password "${password}"`)
        if (!email || !password) {
            return res.status(400).json({ error: 'Email e Senha requeridos' });
        }

        email = email.toLowerCase()

        if (!validateEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

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
                        email,
                        password: hashedPassword,
                    },
                });
                res.status(201).json({ message: 'User created successfully', user })
            } else {
                res.status(409).json({ error: 'Email already in used!' })
            }
        } catch (error) {
            res.status(500).json({ error: 'Something goes wrong!' });
        }
    } catch {
        res.status(500).json({ error: 'Something goes wrong!' });
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
                return res.status(400).json({ message: 'User or Password incorrect' });
            }
            const validPassword = await bcrypt.compare(password, userFind.password);
            if (!validPassword) {
                return res.status(400).json({ message: 'User or Password incorrect' });
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
