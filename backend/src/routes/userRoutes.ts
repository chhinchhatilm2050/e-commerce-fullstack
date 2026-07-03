import { Router } from 'express';
import { getAllUser, getSingleUser, updateUser, deleteUser, promoteToAdmin, getMe, updateMe } from '../controllers/userController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize, checkOwnership } from '../middlewares/authorize.js';
import { updateUserValidation, userIdValidation} from '../validators/userValidators.js';
import UserModel from '../model/user.js';

const userRouter = Router();
userRouter.use(authenticate);
userRouter.get('', authorize('admin'), getAllUser);
userRouter.get('/me', getMe);
userRouter.patch('/me', updateMe);
userRouter.get('/:id', userIdValidation, checkOwnership(UserModel, '_id'), getSingleUser);
userRouter.patch('/:id', updateUserValidation, checkOwnership(UserModel, '_id'), updateUser);
userRouter.patch('/:id/promote', userIdValidation, authorize('admin'), promoteToAdmin);
userRouter.delete('/:id', authorize('admin'), deleteUser);

export default userRouter;