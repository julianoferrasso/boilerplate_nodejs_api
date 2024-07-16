import express, { NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import path from 'path';
import dotenv from 'dotenv';

//dotenv.config();
// Carrega o arquivo .env localizado na raiz do projeto
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const corsOptions = {
    // origin: 'https://seu-dominio-nextjs.com', // Limita as requisições pelo domínio da sua aplicação Next.js
    optionsSuccessStatus: 200
};

const app = express();

app.use(express.json());
app.use(cors(corsOptions));
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// app.use(
//     (error: Error, req: Request, res: Response, next: NextFunction) => {
//     return res.json({
//         status: "Error",
//         message: error.message
//     })
// })

export default app;
