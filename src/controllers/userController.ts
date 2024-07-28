import { Response } from 'express';
import prisma from '../prisma/client';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middlewares/authMiddleware';
import { updateProfilePictureS3, getTemporaryUrl } from '../services/serviceS3AWS'
import fs from 'fs';
import crypto from 'crypto';
import { dataToken } from '../config/jwtConfig';

// atualizar a url da foto do usuario no prisma
// estudar como usar a url da foto, se temporaria ou proteger com permissoes

// Função para criar um hash SHA-256 a partir do userId
async function hashUserId(userId: string) {
    const hash = crypto.createHash('sha256');
    hash.update(userId);
    return hash.digest('hex');
}

export async function updateProfilePicture(req: AuthRequest, res: Response) {
    try {
        if (req?.token?.id) {
            const userId = req?.token?.id
            const fileFolder = 'profileAvatars'
            // desativado hash do userId
            // const hashedUserId = await hashUserId(userId);
            if (req.file) {
                const filePath = req.file.path;
                // trata nome do arquivo
                const fileName = req.file.filename;

                // atualiza avatar no S3
                await updateProfilePictureS3(filePath, fileFolder, fileName);

                // Gera o URL temporaria do objeto no S3
                const fileUrl = await getTemporaryUrl(`${fileFolder}/${fileName}`);

                await prisma.user.update({
                    where: { id: userId },
                    data: { avatarUrl: fileUrl }
                });

                // Remover o arquivo local após o upload
                fs.unlinkSync(filePath);

                res.status(200).json({ avatarUrl: fileUrl });
            }
        }
    } catch (error) {
        console.log("algo deu errado")
        console.log(error)
    }
}

export const getUserProfile = async (req: AuthRequest, res: Response) => {
    try {
        const id = req?.token?.id
        if (id) {
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
        }

    } catch {
        res.status(400).json({ message: 'Something went wrong with the request' });
    }
};

