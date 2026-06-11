import dotenv from 'dotenv';
dotenv.config({ path: '.env.dev' });
import app from './app.js';
import connectDB from './config/database.js';

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running in ${ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};
await startServer();
