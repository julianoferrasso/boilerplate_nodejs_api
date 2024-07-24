import { Response } from 'express';
import prisma from '../prisma/client';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middlewares/authMiddleware';
import { updateProfilePictureS3 } from '../services/serviceS3AWS'
import fs from 'fs';

// pegar id do usuario na request para upload da foto
// atualizar a url da foto do usuario no prisma
// estudar como usar a url da foto, se temporaria ou proteger com permissoes

export async function updateProfilePicture(req: AuthRequest, res: Response) {
    try {
        const userId = req.body.userId;
        console.log("recebeu req. de update profilePicture do userId: ", userId)
        if (req.file) {
            const filePath = req.file.path;
            const fileName = req.file.filename;

            await updateProfilePictureS3(filePath, fileName);

            // Gera o URL permanente do objeto no S3
            const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

            // await prisma.user.update({
            //     where: { id: userId },
            //     data: { profilePicture: filePath }
            // });


            // Remover o arquivo local após o upload
            fs.unlinkSync(filePath);

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

