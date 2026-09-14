import { Router } from 'express';
import { createOrder, checkOrderStatus, createPaywayPurchase } from '../controllers/orderController.js';
import { authenticate } from '../middlewares/authenticate.js';

const orderRouter = Router();
orderRouter.use(authenticate);
orderRouter.post('/payway-purchase', createPaywayPurchase);
orderRouter.post('/create', createOrder);
orderRouter.get('/check-status/:tran_id', checkOrderStatus);

export default orderRouter;

