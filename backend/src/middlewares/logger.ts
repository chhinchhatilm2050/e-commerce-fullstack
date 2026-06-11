import morgan from 'morgan';

const requestLogger = morgan(
  process.env.NODE_ENV === 'development' ? 'dev' : 'combined',
);

export default requestLogger;
