import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dataToken } from '../config/jwtConfig'

export interface AuthRequest extends Request {
    token?: dataToken;
    user?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Access Denied' });
    }

    try {
        const dataTokenVerified = jwt.verify(token, process.env.JWT_SECRET as string) as dataToken;
        req.token = dataTokenVerified;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};
