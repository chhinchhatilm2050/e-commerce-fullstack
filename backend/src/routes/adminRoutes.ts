import { Router } from 'express';
import { getDashboardAnalytics, getSalesChartsData } from '../controllers/adminController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const adminRouter = Router();
adminRouter.use(authenticate);
adminRouter.use(authorize('admin'));
adminRouter.get('/analytics', getDashboardAnalytics);
adminRouter.get('/charts-data', getSalesChartsData);

export default adminRouter;
 