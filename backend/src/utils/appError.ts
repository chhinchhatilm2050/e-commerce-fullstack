class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  code?: number;
  path?: string;
  value?: unknown;
  keyValue?: Record<string, unknown>;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
