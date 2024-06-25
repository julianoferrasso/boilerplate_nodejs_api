import { Router } from 'express';
import { signUp, login, resetPassword, resendEmailActivation } from '../controllers/authController';

const router = Router();

router.post('/signup', signUp);
router.post('/login', login);
router.post('/resetpassword', resetPassword);
router.post('/resendemail', resendEmailActivation);

export default router;
