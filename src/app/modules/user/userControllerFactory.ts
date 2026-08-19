import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

/* eslint-disable no-unused-vars */
type CreateRelatedUser<TProfile, TUser> = (
  profile: TProfile,
  user: TUser
) => Promise<TUser | null>;
/* eslint-enable no-unused-vars */

const createUserHandler = <TProfile, TUser>(
  profileKey: string,
  createUser: CreateRelatedUser<TProfile, TUser>,
  message: string
): RequestHandler =>
  catchAsync(async (req, res) => {
    const { [profileKey]: profile, ...userData } = req.body as Record<
      string,
      unknown
    >;
    const result = await createUser(
      profile as TProfile,
      userData as unknown as TUser
    );

    sendResponse<TUser>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message,
      data: result,
    });
  });

export default createUserHandler;
