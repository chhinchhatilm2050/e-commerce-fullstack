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

const app = express();
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

app.use('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Api is healthy',
  });
});

app.use(notFound);
app.use(globalErrorHandler);

export default app;
