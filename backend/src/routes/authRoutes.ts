import dotenv from 'dotenv';
dotenv.config({ path: '.env.dev' });
import { Router, RequestHandler, Request, Response, NextFunction } from 'express';
import { login, logout, refresh, googleCallBack, githubCallBack, facebookCallBack, getMe } from '../controllers/authController.js';
import { authLimiter } from '../middlewares/rateLimit.js';
import { authenticate } from '../middlewares/authenticate.js';
import passport from 'passport';

const authRouter = Router();

const frontendUrl = process.env.FRONTEND_URL;

const oauthCallback = (strategy: string) => (req: Request, res: Response, next: NextFunction): void => {
  (passport.authenticate(strategy, { session: false }, (err: Error | null, user: Express.User | false) => {
    if (err || !user) {
      res.redirect(`${frontendUrl}?error=true`);
      return;
    }
    req.user = user;
    next();
  }) as RequestHandler)(req, res, next);
};

authRouter.post('/login', authLimiter, login);
authRouter.post('/logout', authenticate, logout);
authRouter.post('/refresh', refresh);

authRouter.get('/google', passport.authenticate('google', { session: false }) as RequestHandler);
authRouter.get('/google/callback', oauthCallback('google'), googleCallBack);

authRouter.get('/github', passport.authenticate('github', { session: false }) as RequestHandler);
authRouter.get('/github/callback', oauthCallback('github'), githubCallBack);

authRouter.get('/facebook', passport.authenticate('facebook', { session: false }) as RequestHandler);
authRouter.get('/facebook/callback', oauthCallback('facebook'), facebookCallBack);

authRouter.get('/me', authenticate, getMe); 

export default authRouter;