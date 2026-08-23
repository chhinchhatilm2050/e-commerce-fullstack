import { Router } from 'express';
import { productIdValidator } from '../validators/wishlistValidator.js';
import { getWishlist, deleteWishlist, addWishlist } from '../controllers/wishlistController.js';
import { authenticate } from '../middlewares/authenticate.js';

const wishlistRouter = Router();
wishlistRouter.use(authenticate);
wishlistRouter.get('', getWishlist);
wishlistRouter.post('/:productId', productIdValidator, addWishlist);
wishlistRouter.delete('/:productId', productIdValidator, deleteWishlist);

export default wishlistRouter;