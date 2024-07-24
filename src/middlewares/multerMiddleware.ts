import { Request, Response, NextFunction } from 'express'
import multer from 'multer'
import multerConfig from '../config/multerConfig'

export async function multerUploadProfilePictureMiddleware(req: Request, res: Response, next: NextFunction) {
    let uploadProfilePicture;

    try {
        uploadProfilePicture = multer(multerConfig).single('profilePicture');
    } catch (error) {
        console.error("Erro ao configurar o multer: ", error);
        return res.status(500).json({ message: "Erro no servidor, tente mais tarde." });
    }

    uploadProfilePicture(req, res, (error) => {
        if (error instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.error("Erro no multer: ", error.message);
            return res.status(500).json({ message: "Erro no servidor, tente mais tarde." });
        } else if (error) {
            // An unknown error occurred when uploading.
            console.error("Erro desconhecido no upload: ", error.message);
            return res.status(403).json({ error: error.message });
        } else if (!req.file) {
            return res.status(400).send({ error: 'Nenhum arquivo foi enviado.' });
        }
        next();
    });
}