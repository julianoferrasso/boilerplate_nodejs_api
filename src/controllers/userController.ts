import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getUserProfile = async (req: AuthRequest, res: Response) => {
    try {
        const { email } = req.body
        if (!email) {
            return res.status(400).json({ error: 'Email requerido' });
        }
        try {
            const user = await prisma.user.findUnique({
                where: { email: email },
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(400).json({ error: 'Something went wrong' });
        }

    } catch {
        res.status(400).json({ error: 'Something went wrong' });
    }
};