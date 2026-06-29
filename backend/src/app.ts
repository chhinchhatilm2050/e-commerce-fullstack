import dotenv from 'dotenv';
dotenv.config({ path: '.env.dev' });
import express, { Request, Response, NextFunction } from 'express';
import globalErrorHandler from './middlewares/globalErrorHandler.js';
import notFound from './middlewares/notFound.js';
import requestLogger from './middlewares/logger.js';
import { globalLimiter } from './middlewares/rateLimit.js';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import sanitizeHtml from './middlewares/sanitizeHtml.js';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import router from './routes/index.js';
import passport from 'passport';
import { GoogleStrategy } from './middlewares/googleStrategy.js';
import { FacebookStrategy } from './middlewares/facebookStrategy.js';
import { GitHubStrategy } from './middlewares/githubStrategy.js';
import cors from 'cors';

const app = express();
app.use(cors({origin: process.env.FRONTEND_URL, credentials: true}));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);
app.use(globalLimiter);
app.use((req: Request, res: Response, next: NextFunction) => {
  mongoSanitize.sanitize(req.body, { replaceWith: '_' });   
  mongoSanitize.sanitize(req.params, { replaceWith: '_' }); 
  mongoSanitize.sanitize(req.query, { replaceWith: '_' });
  next();
});
app.use(sanitizeHtml);
app.use(hpp());
passport.use(GoogleStrategy);
passport.use(GitHubStrategy);
passport.use(FacebookStrategy);

app.use('/api', router);
app.use(notFound);

app.use(globalErrorHandler);

export default app;
