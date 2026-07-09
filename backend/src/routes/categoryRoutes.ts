import { Router } from 'express';
import { 
  getTopLevelCategories,
  getCategoryBySlugg,
  getCategoryChildren
} from '../controllers/categoryController.js';

import { categorySlugValidator } from '../validators/categoryValidators.js';

const categoryRouter = Router();
categoryRouter.get('/top-level', getTopLevelCategories);
categoryRouter.get('/:slug', categorySlugValidator, getCategoryBySlugg);
categoryRouter.get('/:slug/children', categorySlugValidator, getCategoryChildren);

export default categoryRouter;