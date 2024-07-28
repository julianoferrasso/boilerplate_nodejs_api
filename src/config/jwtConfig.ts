import jwt from 'jsonwebtoken';

export interface dataToken extends jwt.JwtPayload {
    id: string;
}

export const generateToken = async (id: string): Promise<string | null> => {
    try {
        return jwt.sign({ id }, process.env.JWT_SECRET as string, {
            subject: id,
            expiresIn: '30d',
        });
    } catch (error) {
        return null;
    }
};

export const verifyToken = async (token: string): Promise<dataToken | null> => {
    try {
        console.log('Verifying token: ' + JSON.stringify(token));
        return jwt.verify(token, process.env.JWT_SECRET as string) as dataToken;
    } catch (error) {
        return null;
    }
};