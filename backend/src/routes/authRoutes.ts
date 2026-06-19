import { Router, RequestHandler  } from 'express';
import { login, logout, refresh, googleCallBack, githubCallBack, facebookCallBack } from '../controllers/authController.js';
import { authLimiter } from '../middlewares/rateLimit.js';
import { authenticate } from '../middlewares/authenticate.js';
import passport from 'passport';

const authRouter = Router();
authRouter.post('/login', authLimiter, login);
authRouter.post('/logout', authenticate, logout);
authRouter.post('/refresh', refresh);
authRouter.get('/google', passport.authenticate('google', {session: false}) as RequestHandler);
authRouter.get('/google/callback', passport.authenticate('google', {session: false, failureRedirect: '/loign'}) as RequestHandler, googleCallBack);
authRouter.get('/github',passport.authenticate('github', { session: false}) as RequestHandler);
authRouter.get('/github/callback', passport.authenticate('github', {session: false, failureRedirect: '/login'}) as RequestHandler, githubCallBack );
authRouter.get('/facebook', passport.authenticate('facebook', {session: false}) as RequestHandler);
authRouter.get('/facebook/callback', passport.authenticate('facebook', {session: false, failureRedirect: '/login'}) as RequestHandler, facebookCallBack);

export default authRouter;