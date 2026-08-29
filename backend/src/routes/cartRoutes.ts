import { Router } from 'express';
import { addToCart, getCart, mergeGuestCart, removeCartItem, updateCartItem } from '../controllers/cartController.js';
import { authenticate } from '../middlewares/authenticate.js';

const cartRouter = Router();
cartRouter.use(authenticate);
cartRouter.get('', getCart);
cartRouter.post('/add/:productId', addToCart);
cartRouter.patch('/item/:itemId', updateCartItem);
cartRouter.delete('/item/:itemId', removeCartItem);
cartRouter.post('/merge', mergeGuestCart);
export default cartRouter;