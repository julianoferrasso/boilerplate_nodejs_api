import { Response } from 'express';
import prisma from '../prisma/client';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middlewares/authMiddleware';


export async function updateProfilePicture(req: AuthRequest, res: Response) {
    try {
        if (req.file) {
            // Logica para atualizar a foto de perfil do usuário no banco de dados
            //const userId = req.user.id; // Assumindo que `req.user` contém as informações do usuário autenticado
            const filePath = req.file.path;

            console.log("filePath - ", filePath)

            // await prisma.user.update({
            //     where: { id: userId },
            //     data: { profilePicture: filePath }
            // });

            console.log("Tratando upload")
            res.status(204).send();
        }
    } catch (error) {
        console.log("algo deu errado")
        console.log(error)
    }
}

export const getUserProfile = async (req: AuthRequest, res: Response) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token is missing' });
        }

        console.log(`tentando buscar getUser com  token "${token}"`)

        const dataTokenVerified = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
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
                celular: userFind.celular,
                avatarUrl: userFind.avatarUrl,
                emailVerified: userFind.emailVerified
            };
            res.status(200).json(user);
        } catch (error) {
            res.status(400).json({ message: 'Something went wrong with the database query' });
        }

    } catch {
        res.status(400).json({ message: 'Something went wrong with the request' });
    }
};

