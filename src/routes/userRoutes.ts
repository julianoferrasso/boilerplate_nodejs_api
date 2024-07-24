import { Router } from 'express';
import { getUserProfile, updateProfilePicture } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { multerUploadProfilePictureMiddleware } from '../middlewares/multerMiddleware'

const router = Router();

router.get('/profile', authMiddleware, getUserProfile);
router.put('/updateProfilePicture', authMiddleware, multerUploadProfilePictureMiddleware, updateProfilePicture);

export default router;
