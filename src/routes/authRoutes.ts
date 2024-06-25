import { Router } from 'express';
import { signUp, login, resetPassword, accountActivation } from '../controllers/authController';

const router = Router();

router.post('/signup', signUp);
router.post('/login', login);
router.post('/resetpassword', resetPassword);
router.post('/accountactivation', accountActivation);

export default router;
