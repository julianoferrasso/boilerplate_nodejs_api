import { Router } from 'express';
import { register, login, recoverPassword } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/recoverPassword', recoverPassword);

export default router;
