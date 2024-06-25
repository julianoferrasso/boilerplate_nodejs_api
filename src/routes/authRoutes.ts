import { Router } from 'express';
import { signUp, login, resetPassword } from '../controllers/authController';

const router = Router();

router.post('/signup', signUp);
router.post('/login', login);
router.post('/resetpassword', resetPassword);

export default router;
