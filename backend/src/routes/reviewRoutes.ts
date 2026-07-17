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

const reviewRouter = Router({ mergeParams: true });

reviewRouter.get('/', productIdValidator, getProductReview);
reviewRouter.use(authenticate);
reviewRouter.post('/', creaateReviewValidator, createReview);
reviewRouter.put('/:reviewId', updateReviewValidator, checkOwnership(ReviewModel, 'userId', 'reviewId'), updateReview);
reviewRouter.delete('/:reviewId', reviewIdValidator, checkOwnership(ReviewModel, 'userId', 'reviewId'), deleteReview);

export default reviewRouter;

