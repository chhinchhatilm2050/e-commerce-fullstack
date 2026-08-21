import { Router } from 'express';
import {
  getProductReview,
  createReview,
  updateReview,
  deleteReview
} from '../controllers/reviewController.js';
import { 
  productIdValidator,
  creaateReviewValidator,
  updateReviewValidator,
  reviewIdValidator
} from '../validators/reviewValidators.js';
import { authenticate } from '../middlewares/authenticate.js';
import { checkOwnership } from '../middlewares/authorize.js';
import ReviewModel from '../model/review.js';
import { upload } from '../middlewares/upload.js';

const reviewRouter = Router();

reviewRouter.get('/:id', productIdValidator, getProductReview);
reviewRouter.use(authenticate);
reviewRouter.post('/:id', upload.array('images', 3), creaateReviewValidator, createReview);
reviewRouter.put('/:reviewId', updateReviewValidator, checkOwnership(ReviewModel, 'userId', 'reviewId'),upload.array('images', 3), updateReview);
reviewRouter.delete('/:reviewId', reviewIdValidator, checkOwnership(ReviewModel, 'userId', 'reviewId'), deleteReview);

export default reviewRouter;

