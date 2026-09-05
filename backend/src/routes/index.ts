import { Router } from 'express';
import authRouter from './authRoutes.js';
import userRouter from './userRoutes.js';
import categoryAdminRouter from './categoryAdminRoutes.js';
import categoryRouter from './categoryRoutes.js';
import reviewRouter from './reviewRoutes.js';
import productRouter from './productRoutes.js';
import adminProductRouter from './adminProductRoutes.js';
import wishlistRouter from './wishlistRoutes.js';
import cartRouter from './cartRoutes.js';
import addressRouter from './addressRoutes.js';

const router = Router();
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/categories', categoryRouter);
router.use('/admin/categories', categoryAdminRouter);
router.use('/reviews', reviewRouter);
router.use('/products', productRouter);
router.use('/admin/products', adminProductRouter);
router.use('/wishlists', wishlistRouter);
router.use('/carts', cartRouter);
router.use('/addresses', addressRouter);

export default router;