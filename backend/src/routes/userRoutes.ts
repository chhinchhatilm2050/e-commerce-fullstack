import { Router } from 'express';
import { getAllUser, getSingleUser, updateUser, deleteUser, promoteToAdmin, getMe, updateMe, uploadAvatar, updateUserStatus, getUserStats, deleteUserPermanently, restoreUser } from '../controllers/userController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { updateUserValidation, userIdValidation} from '../validators/userValidators.js';
import { upload } from '../middlewares/upload.js';

const userRouter = Router();
userRouter.use(authenticate);
userRouter.patch('/upload-avatar', upload.single('avatar'), uploadAvatar);
userRouter.get('', authorize('admin'), getAllUser);
userRouter.get('/status', authorize('admin'), getUserStats);
userRouter.get('/me',  getMe);
userRouter.patch('/me', updateUserValidation, updateMe);
userRouter.get('/:id', userIdValidation, authorize('admin'), getSingleUser);
userRouter.patch('/:id', updateUserValidation, authorize('admin'), updateUser);
userRouter.patch('/:id/promote', userIdValidation, authorize('admin'), promoteToAdmin);
userRouter.patch('/:id/status', userIdValidation, authorize('admin'), updateUserStatus);
userRouter.delete('/:id', userIdValidation, authorize('admin'), deleteUser);
userRouter.delete('/:id/permanent', userIdValidation, authorize('admin'), deleteUserPermanently);
userRouter.patch('/:id/restore', userIdValidation, authorize('admin'), restoreUser);

export default userRouter;