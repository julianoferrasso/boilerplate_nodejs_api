import jwt from 'jsonwebtoken';

export interface dataToken extends jwt.JwtPayload {
    id: string;
    email: string;
}

export const generateToken = async ({ id, email }: dataToken): Promise<string | null> => {
    try {
        return jwt.sign({ id, email }, process.env.JWT_SECRET as string, {
            subject: id,
            expiresIn: '48h',
        });
    } catch (error) {
        return null;
    }
};

export const verifyToken = async (token: string): Promise<dataToken | null> => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET as string) as dataToken;
    } catch (error) {
        return null;
    }
};