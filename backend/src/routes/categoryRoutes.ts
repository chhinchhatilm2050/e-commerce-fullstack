import { Router } from 'express';
import { 
  getTopLevelCategories,
  getCategoryBySlug,
  getCategoryChildren,
  getCategorySyblings
} from '../controllers/categoryController.js';

import { categorySlugValidator } from '../validators/categoryValidators.js';

const categoryRouter = Router();
categoryRouter.get('/top-level', getTopLevelCategories);
categoryRouter.get('/:slug', categorySlugValidator, getCategoryBySlug);
categoryRouter.get('/:slug/children', categorySlugValidator, getCategoryChildren);
categoryRouter.get('/:slug/siblings', categorySlugValidator, getCategorySyblings);

export default categoryRouter;