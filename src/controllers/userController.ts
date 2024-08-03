import { Response } from 'express';
import prisma from '../prisma/client';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middlewares/authMiddleware';
import { updateProfilePictureS3, getTemporaryUrl, } from '../services/serviceS3AWS'
import fs from 'fs';
import crypto from 'crypto';
import { dataToken } from '../config/jwtConfig';
import axios from 'axios';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);


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
        if (!req.token?.id) {
            return res.status(400).json({ message: 'Token ausente.' });
        }

        const userId = req.token.id;
        const fileFolder = 'profileAvatars';

        if (!req.file) {
            return res.status(400).json({ message: 'Arquivo não encontrado.' });
        }

        const filePath = req.file.path;
        const fileName = req.file.filename;

        // Atualiza avatar no S3
        await updateProfilePictureS3(filePath, fileFolder, fileName);

        // Gera o URL temporária do objeto no S3
        const fileUrl = await getTemporaryUrl(`${fileFolder}/${fileName}`);

        // Atualiza o URL do avatar no banco de dados
        await prisma.user.update({
            where: { id: userId },
            data: { avatarUrl: fileUrl }
        });

        // Remove o arquivo local após o upload
        fs.unlinkSync(filePath);

        return res.status(200).json({ avatarUrl: fileUrl });
    } catch (error) {
        console.error("Erro ao atualizar a foto de perfil:", error);
        return res.status(500).json({ message: 'Erro ao atualizar a foto de perfil.' });
    }
}

export async function updateProfile(req: AuthRequest, res: Response) {
    try {
        if (req?.token?.id) {
            const userId = req?.token?.id
            const attributesUpdate: any = []

            // 1. Construir o Array de Atualização
            Object.entries(req.body).forEach(([key, value]) => {
                attributesUpdate.push({ [key]: value })
            })

            // 2. Construir o Objeto de Atualização para o Prisma
            const updateData = attributesUpdate.reduce((acc: any, curr: any) => {
                return { ...acc, ...curr };
            }, {});

            const updateUser = await prisma.user.update({
                where: { id: userId },
                data: updateData
            });
            res.status(200).json({ message: "Usuário atualizado com sucesso." })
        }
    } catch {
        res.status(500).json({ message: "Algo deu errado" })
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

            // Verifica se a URL do avatar ainda é válida
            const valid = isUrlValid(userFind.avatarUrl);

            console.log("url avatar is valid? ", valid)

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

function isUrlValid(urlString: any) {
    // Função auxiliar para extrair o valor de um parâmetro da URL
    function getQueryParam(url: any, param: any) {
        const regex = new RegExp(`[?&]${param}=([^&#]*)`);
        const match = regex.exec(url);
        return match ? decodeURIComponent(match[1]) : null;
    }

    // Extrair X-Amz-Date e X-Amz-Expires dos parâmetros
    const amzDateStr = getQueryParam(urlString, 'X-Amz-Date');
    const amzExpiresStr = getQueryParam(urlString, 'X-Amz-Expires');

    if (!amzDateStr || !amzExpiresStr) {
        throw new Error("Parâmetros X-Amz-Date ou X-Amz-Expires ausentes na URL");
    }

    // Converter X-Amz-Date para dayjs
    let amzDate;
    try {
        amzDate = dayjs.utc(amzDateStr, 'YYYYMMDDTHHmmss[Z]');
    } catch (error) {
        throw new Error("Formato de X-Amz-Date inválido");
    }

    // Converter X-Amz-Expires para inteiro
    let expiresSeconds;
    try {
        expiresSeconds = parseInt(amzExpiresStr, 10);
    } catch (error) {
        throw new Error("Formato de X-Amz-Expires inválido");
    }

    // Calcular a data e hora de expiração
    const expiryDateTime = amzDate.add(expiresSeconds, 'second');

    // Hora atual em UTC
    const now = dayjs.utc();

    // Verificar se a URL ainda é válida
    return now.isBefore(expiryDateTime);
}

