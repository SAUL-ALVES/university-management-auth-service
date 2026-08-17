import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { AuthService } from './auth.service';
import {
  sendAuthResponse,
  setRefreshTokenCookie,
} from './authControllerHelpers';

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);

  setRefreshTokenCookie(res, result.refreshToken);
  sendAuthResponse(res, 'User logged in successfully !', result);
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  const result = await AuthService.refreshToken(refreshToken);

  setRefreshTokenCookie(res, refreshToken);
  sendAuthResponse(res, 'Token refreshed successfully !', result);
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  await AuthService.changePassword(req.user, req.body);
  sendAuthResponse(res, 'Password changed successfully !');
});

const forgotPass = catchAsync(async (req: Request, res: Response) => {
  await AuthService.forgotPass(req.body);
  sendAuthResponse(res, 'Check your email!');
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization || '';
  await AuthService.resetPassword(req.body, token);
  sendAuthResponse(res, 'Account recovered!');
});

export const AuthController = {
  loginUser,
  refreshToken,
  changePassword,
  forgotPass,
  resetPassword,
};
