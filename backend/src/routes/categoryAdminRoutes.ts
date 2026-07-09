import { Router } from 'express';
import { 
  createCategory, 
  getAllCategoriesAdmin, 
  getCategoryTreeAdmin,
  getCategoryById,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
  moveCategory
} from '../controllers/categoryController.js';
import { 
  createCategoryValidator,
  updateCategoryValidator,
  categoryIdValidator,
  moveCategoryValidator,
  updateCategoryStatusValidator,
  deleteCategoryValidator
} from '../validators/categoryValidators.js';

import { authenticate } from '../middlewares/authenticate.js';
import { authorize} from '../middlewares/authorize.js';
import { upload } from '../middlewares/upload.js';

const categoryAdminRouter = Router();
categoryAdminRouter.use(authenticate);
categoryAdminRouter.use(authorize('admin'));
categoryAdminRouter.post('', upload.single('image'), createCategoryValidator, createCategory);
categoryAdminRouter.get('', getAllCategoriesAdmin);
categoryAdminRouter.get('/tree', getCategoryTreeAdmin);
categoryAdminRouter.get('/:id', categoryIdValidator, getCategoryById);
categoryAdminRouter.put('/:id', upload.single('image'), updateCategoryValidator, updateCategory);
categoryAdminRouter.patch('/:id/move', moveCategoryValidator, moveCategory);
categoryAdminRouter.patch('/:id/status', updateCategoryStatusValidator, updateCategoryStatus);
categoryAdminRouter.delete('/:id', deleteCategoryValidator, deleteCategory);

export default categoryAdminRouter;