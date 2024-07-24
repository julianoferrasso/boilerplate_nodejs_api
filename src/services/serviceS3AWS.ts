import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
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

export async function updateProfilePictureS3(filePath: string, fileName: string) {
    const fileContent = fs.readFileSync(filePath);
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: fileContent,
        ContentType: 'image/jpeg', // Ajuste isso conforme necessário
    };
    try {
        const data = await s3Client.send(new PutObjectCommand(params));
        return data;
    } catch (err) {
        console.error("Erro ao fazer upload para o S3:", err);
        throw err;
    }

}
