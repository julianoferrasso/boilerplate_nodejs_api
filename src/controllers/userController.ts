import { Request, Response } from 'express';
import prisma from '../prisma/client';
import jwt from 'jsonwebtoken';
import { dataToken } from '../config/jwtConfig'
import { AuthRequest } from '../middlewares/authMiddleware';

export const getUserProfile = async (req: AuthRequest, res: Response) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader?.split(' ')[1];

        // console.log(`tentando buscar getUser com  token "${token}"`)

        const dataTokenVerified = jwt.verify(token, process.env.JWT_SECRET as string);
        const { id } = dataTokenVerified

        try {
            const userFind = await prisma.user.findUnique({
                where: { id },
            });

            if (!userFind) {
                return res.status(404).json({ message: 'User not found' });
            }
            const user = {
                id: userFind.id,
                name: userFind.name,
                email: userFind.email,
                avatarUrl: userFind.avatarUrl,
                emailVerified: userFind.emailVerified
            };
            res.status(200).json(user);
        } catch (error) {
            res.status(400).json({ message: 'Something went wrong BD user' });
        }

    } catch {
        res.status(400).json({ message: 'Something went wrong Request user' });
    }
};