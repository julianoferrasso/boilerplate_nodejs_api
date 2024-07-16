"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const corsOptions = {
    // origin: 'https://seu-dominio-nextjs.com', // Limita as requisições pelo domínio da sua aplicação Next.js
    optionsSuccessStatus: 200
};
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)(corsOptions));
app.use('/api/auth', authRoutes_1.default);
app.use('/api/user', userRoutes_1.default);
// app.use(
//     (error: Error, req: Request, res: Response, next: NextFunction) => {
//     return res.json({
//         status: "Error",
//         message: error.message
//     })
// })
exports.default = app;
