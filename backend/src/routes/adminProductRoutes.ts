import { Router } from 'express';
import { 
  createProduct,
  getAllProductsAdmin,
  getProductByIdAdmin,
  updateProduct,
  updateProductStatus,
  updateProductStock,
  addProductImages,
  removeProductImage,
  deleteProduct,
  restoreProduct,
  getDeletedProducts
} from '../controllers/productController.js';

import {
  createProductValidator,
  updateProductValidator,
  productIdValidator,
  updateStatusValidator,
  updateStockValidator,
  removeImageValidator,
  getAllProductsValidator,
} from '../validators/productValidators.js';

import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { upload } from '../middlewares/upload.js';

const adminProductRouter = Router();

adminProductRouter.use(authenticate, authorize('admin'));

adminProductRouter.get('/trash', getDeletedProducts);
adminProductRouter.post('', upload.array('images', 6),  createProductValidator, createProduct );
adminProductRouter.get('', getAllProductsValidator, getAllProductsAdmin);
adminProductRouter.get('/:id', productIdValidator, getProductByIdAdmin);
adminProductRouter.put('/:id', updateProductValidator, updateProduct);
adminProductRouter.patch('/:id/status', updateStatusValidator, updateProductStatus);
adminProductRouter.patch('/:id/stock', updateStockValidator, updateProductStock);
adminProductRouter.post('/:id/images', productIdValidator, upload.array('images', 6), addProductImages);
adminProductRouter.delete('/:id/image', removeImageValidator, removeProductImage);
adminProductRouter.patch('/:id/restore', productIdValidator, restoreProduct);
adminProductRouter.delete('/:id', productIdValidator, deleteProduct);

export default adminProductRouter;

