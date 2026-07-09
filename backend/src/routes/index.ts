import { Router } from 'express';
import authRouter from './authRoutes.js';
import userRouter from './userRoutes.js';
import categoryAdminRouter from './categoryAdminRoutes.js';
import categoryRouter from './categoryRoutes.js';

const router = Router();
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/categories', categoryRouter);
router.use('/admin/categories', categoryAdminRouter);

export default router;