import Router from 'express';
import { getMyAddress, saveMyAddress, deleteMyAddress } from '../controllers/addressController.js';
import { saveAddressValidator } from '../validators/addressValidators.js';
import { authenticate } from '../middlewares/authenticate.js';

const addressRouter = Router();
addressRouter.use(authenticate);
addressRouter.get('/me', getMyAddress);
addressRouter.post('/me', saveAddressValidator, saveMyAddress);
addressRouter.delete('/me', deleteMyAddress);

export default addressRouter;