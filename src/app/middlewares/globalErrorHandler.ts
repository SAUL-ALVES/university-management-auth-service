import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import config from '../../config';
import ApiError from '../../errors/ApiError';
import handleCastError from '../../errors/handleCastError';
import handleValidationError from '../../errors/handleValidationError';
import handleZodError from '../../errors/handleZodError';
import { IGenericErrorResponse } from '../../interfaces/common';
import { IGenericErrorMessage } from '../../interfaces/error';
import { errorlogger } from '../../shared/logger';

const DEFAULT_ERROR: IGenericErrorResponse = {
  statusCode: 500,
  message: 'Something went wrong !',
  errorMessages: [],
};

const buildErrorMessages = (
  message: string
): IGenericErrorMessage[] => [
  {
    path: '',
    message,
  },
];

const buildBasicError = (
  message: string,
  statusCode = 500
): IGenericErrorResponse => ({
  statusCode,
  message,
  errorMessages: buildErrorMessages(message),
});

const simplifyError = (error: unknown): IGenericErrorResponse => {
  if (error instanceof ZodError) {
    return handleZodError(error);
  }

  if (error instanceof ApiError) {
    return buildBasicError(error.message, error.statusCode);
  }

  if (!(error instanceof Error)) {
    return DEFAULT_ERROR;
  }

  if (error.name === 'ValidationError') {
    return handleValidationError(
      error as Parameters<typeof handleValidationError>[0]
    );
  }

  if (error.name === 'CastError') {
    return handleCastError(
      error as Parameters<typeof handleCastError>[0]
    );
  }

  return buildBasicError(error.message);
};

const logError = (error: unknown): void => {
  if (config.env === 'development') {
    console.log(`🐱‍🏍 globalErrorHandler ~~`, { error });
    return;
  }

  errorlogger.error(`🐱‍🏍 globalErrorHandler ~~`, error);
};

const globalErrorHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  next
) => {
  void req;
  void next;

  logError(error);

  const {
    statusCode,
    message,
    errorMessages,
  } = simplifyError(error);

  res.status(statusCode).json({
    success: false,
    message,
    errorMessages,
    stack:
      config.env !== 'production'
        ? (error as Error)?.stack
        : undefined,
  });
};

export default globalErrorHandler;
