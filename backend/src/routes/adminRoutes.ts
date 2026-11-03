import { Router } from 'express';
import { getBusinessReport, getDashboardAnalytics, getSalesChartsData } from '../controllers/adminController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const adminRouter = Router();
adminRouter.use(authenticate);
adminRouter.use(authorize('admin'));
adminRouter.get('/analytics', getDashboardAnalytics);
adminRouter.get('/charts-data', getSalesChartsData);
adminRouter.get('/business-report', getBusinessReport);

export default adminRouter;
 