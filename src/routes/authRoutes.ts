import { Router } from 'express';
import { signUp, signIn, signOut, resetPassword, resendEmailActivation, verifyEmail } from '../controllers/authController';

const router = Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/signout', signOut);
router.post('/resetpassword', resetPassword);
router.post('/resendemail', resendEmailActivation);
router.post('/verifyemail', verifyEmail)

export default router;

