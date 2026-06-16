import AppError from './appError.js';

export interface CastError {
  path: string;
  value: unknown;
}

export interface DuplicateFieldError {
  keyValue: Record<string, unknown>;
}

const handleCastError = (err: CastError): AppError => {
  return new AppError(`Invalid ${err.path}: ${String(err.value)}.`, 400);
};

const handleDuplicateError = (err: DuplicateFieldError): AppError => {
  const field = Object.values(err.keyValue)[0];
  return new AppError(
    `Duplicate field value: ${String(field)}. Please use another value!`,
    409,
  );
};

export { handleCastError, handleDuplicateError };
