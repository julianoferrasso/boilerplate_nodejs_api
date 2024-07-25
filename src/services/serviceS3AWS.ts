import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';

// Configuração do cliente S3
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function updateProfilePictureS3(filePath: string, fileFolder: string, fileName: string) {
    const fileContent = fs.readFileSync(filePath);
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${fileFolder}/${fileName}`,
        Body: fileContent,
        ContentType: 'image/jpeg',
    };
    try {
        const data = await s3Client.send(new PutObjectCommand(params));
        return data;
    } catch (err) {
        console.error("Erro ao fazer upload para o S3:", err);
        throw err;
    }

}

export async function getTemporaryUrl(key: string) {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
    };

    const command = new GetObjectCommand(params);
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL válida por 1 hora
    return url;
}
