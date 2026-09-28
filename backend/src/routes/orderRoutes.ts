import { Router } from 'express';
import { createOrder, checkOrderStatus, createPaywayPurchase, getMyOrder, 
  getOrderDetail, cancelOrder, getAllOrdersAdmin, updateOrderStatus, getOrderStats,
  deleteOrder} from '../controllers/orderController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { isMongoIdValidator, updateOrderStatusValidator } from '../validators/orderValidators.js';

const orderRouter = Router();
orderRouter.use(authenticate);
orderRouter.post('/payway-purchase', createPaywayPurchase);
orderRouter.post('/create', createOrder);
orderRouter.get('/check-status/:tran_id', checkOrderStatus);
orderRouter.get('/my-orders', getMyOrder);
orderRouter.get('/my-orders/:id',isMongoIdValidator, getOrderDetail);
orderRouter.patch('/cancel/:id', isMongoIdValidator, cancelOrder);
orderRouter.get('/admin/all', authorize('admin'), getAllOrdersAdmin);
orderRouter.patch('/status/:id', updateOrderStatusValidator, authorize('admin'), updateOrderStatus);
orderRouter.delete('/:id', isMongoIdValidator, authorize('admin'), deleteOrder);
orderRouter.get('/order-status', authorize('admin'), getOrderStats);

export default orderRouter;

