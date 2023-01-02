import { NextFunction, RequestHandler } from 'express';
import { Request, Response } from 'express-serve-static-core';
import httpStatus from 'http-status';
import passport from 'passport';
import { IUserDoc } from '../services/user.service';
import ApiError from '../utils/ApiError';

type AuthenticateCallback = (err?: any, user?: IUserDoc, info?: any) => Promise<void>;

const verifyCallback = (
  req: Request,
  resolve: (value: void | PromiseLike<void>) => void,
  reject: (reason?: any) => void
): AuthenticateCallback => {
  return async (err?: any, user?: IUserDoc, info?: any): Promise<void> => {
    if (err || info || !user) {
      return reject(new ApiError(httpStatus.UNAUTHORIZED, 'please authenticate'));
    }
    req.user = user;
    resolve();
  };
};

interface IAuthParams {
  is_optional?: boolean;
}

const auth =
  (options: IAuthParams = { is_optional: false }): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject))(req, res, next);
    })
      .then(() => next())
      .catch((err) => (options.is_optional ? next() : next(err)));
  };

export default auth;
