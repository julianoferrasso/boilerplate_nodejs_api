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

        const dataTokenVerified = jwt.verify(token, process.env.JWT_SECRET as string) as dataToken;
        const { id } = dataTokenVerified

        try {
            const user = await prisma.user.findUnique({
                where: { id },
            });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json({
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
                emailVerified: user.emailVerified
            });
        } catch (error) {
            res.status(400).json({ message: 'Something went wrong BD user' });
        }

    } catch {
        res.status(400).json({ message: 'Something went wrong Request user' });
    }
};