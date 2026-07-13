import { Router } from 'express';
import { getAllUser, getSingleUser, updateUser, deleteUser, promoteToAdmin, getMe, updateMe } from '../controllers/userController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { updateUserValidation, userIdValidation} from '../validators/userValidators.js';

const userRouter = Router();
userRouter.use(authenticate);
userRouter.get('', authorize('admin'), getAllUser);
userRouter.get('/me',  getMe);
userRouter.patch('/me', updateUserValidation, updateMe);
userRouter.get('/:id', userIdValidation, authorize('admin'), getSingleUser);
userRouter.patch('/:id', updateUserValidation, authorize('admin'), updateUser);
userRouter.patch('/:id/promote', userIdValidation, authorize('admin'), promoteToAdmin);
userRouter.delete('/:id', authorize('admin'), deleteUser);

export default userRouter;