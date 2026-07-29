import { Router } from 'express';
import { getAllProducts, getProductById, getProductsByCategorySlug } from '../controllers/productController.js';
import { productIdValidator, getAllProductsValidator } from '../validators/productValidators.js';
import reviewRoutes from './reviewRoutes.js';

const productRouter = Router();

productRouter.use('/:id/reviews', reviewRoutes);

productRouter.get('/category/:slug', getProductsByCategorySlug);
productRouter.get('/:id', productIdValidator, getProductById);
productRouter.get('', getAllProductsValidator, getAllProducts);

export default productRouter;
