import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dataToken } from '../config/jwtConfig'

export interface AuthRequest extends Request {
    token?: dataToken;
    user?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    // substituido Bearer token por cookies do header por causa do httpOnly
    // const authHeader = req.headers['authorization'];
    // const token = authHeader?.split(' ')[1];
    const cookies = req.headers.cookie
    if (cookies) {
        const token = cookies.split('; ').find(row => row.startsWith('session_token='))?.split('=')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token ausente.' });
        }

        try {
            const dataTokenVerified = jwt.verify(token, process.env.JWT_SECRET as string) as dataToken;
            req.token = dataTokenVerified;
            next();
        } catch (error) {
            res.status(401).json({ message: `Token inválido.` });
        }
    } else {
        return res.status(401).json({ message: 'Token ausente.' });
    }
};
