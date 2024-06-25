import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import dotenv from 'dotenv';

dotenv.config();

const corsOptions = {
    // origin: 'https://seu-dominio-nextjs.com', // Limita as requisições pelo domínio da sua aplicação Next.js
    optionsSuccessStatus: 200
};

const app = express();

app.use(express.json());
app.use(cors(corsOptions));
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

export default app;
