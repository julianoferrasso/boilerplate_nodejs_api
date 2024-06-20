import { Request, Response } from 'express';
import prisma from '../prisma/client';
import jwt from 'jsonwebtoken';
import { dataToken } from '../config/jwtConfig'
import { AuthRequest } from '../middlewares/authMiddleware';

export const getUserProfile = async (req: AuthRequest, res: Response) => {
    try {
        const token = req.headers['authorization'];

        const dataTokenVerified = jwt.verify(token, process.env.JWT_SECRET as string) as dataToken;
        const { id } = dataTokenVerified

        try {
            const user = await prisma.user.findUnique({
                where: { id },
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.status(200).json({
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
                emailVerified: user.emailVerified
            });
        } catch (error) {
            res.status(400).json({ error: 'Something went wrong BD' });
        }

    } catch {
        res.status(400).json({ error: 'Something went wrong Request' });
    }
};