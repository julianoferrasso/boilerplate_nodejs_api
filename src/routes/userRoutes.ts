import { Router } from 'express';
import { getUserProfile, updateProfilePicture } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/profile', authMiddleware, getUserProfile);
router.put('/updateProfilePicture', authMiddleware, updateProfilePicture);

export default router;