import { Response } from 'express';
import httpStatus from 'http-status';
import config from '../../../config';
import sendResponse from '../../../shared/sendResponse';

export const setRefreshTokenCookie = (
  res: Response,
  refreshToken: string | undefined
): void => {
  res.cookie('refreshToken', refreshToken, {
    secure: config.env === 'production',
    httpOnly: true,
  });
};

export const sendAuthResponse = <T>(
  res: Response,
  message: string,
  data?: T
): void => {
  sendResponse<T>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message,
    data,
  });
};
