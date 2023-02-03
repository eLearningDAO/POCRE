import config from '../config/config';
import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import * as userService from '../services/user.service';
import { encrypt } from '../utils/crypt';
import ApiError from '../utils/ApiError';
import { sendMail } from '../utils/email';

export const queryUsers = catchAsync(async (req, res): Promise<void> => {
  const users = await userService.queryUsers(req.query as any);
  res.send(users);
});

export const getUserById = catchAsync(async (req, res): Promise<void> => {
  const user = await userService.getUserById(req.params.user_id);
  res.send(user);
});

export const verifyUserById = catchAsync(async (req, res): Promise<void> => {
  const user = await userService.getUserById(req.params.user_id);
  res.send(user);
});


export const createUser = catchAsync(async (req, res): Promise<any> => {
  const hashedWalletAddress = encrypt(req.body.wallet_address);

  // check if this user already exists
  const foundUser = await userService.getUserByWalletAddress(hashedWalletAddress).catch(() => null);
  if (foundUser) return res.send(foundUser);

  // create user
  const newUser = await userService.createUser({
    ...req.body,
    user_name: req.body.user_name || 'anonymous',
    wallet_address: hashedWalletAddress,
    is_invited: false,
  });
  res.send(newUser);
});

export const inviteUser = catchAsync(async (req, res): Promise<any> => {
  const { invite_method: inviteMethod, invite_value: inviteValue } = req.body;
  const username = (req.body.invite_method === 'username' ? req.body.invite_value : null) || req.body.user_name;

  const serviceMethod = (() => {
    if (inviteMethod === 'phone') return userService.getUserByPhone;
    if (inviteMethod === 'username') return userService.getUserByUsername;
    if (inviteMethod === 'email') return userService.getUserByEmailAddress;
    return async () => {};
  })();

  // check if the user exists
  const foundUser = await serviceMethod(inviteValue).catch(() => null);

  // check if the user is already invited
  if (foundUser && foundUser.is_invited) return res.send(foundUser);

  // create a new invited user
  const invitedUser = await userService.createUser({
    user_name: username || 'anonymous',
    email_address: inviteMethod === 'email' ? inviteValue : null,
    phone: inviteMethod === 'phone' ? inviteValue : null,
    is_invited: true,
  });
  res.send(invitedUser);
});

export const deleteUserById = catchAsync(async (req, res): Promise<void> => {
  // only allow the auth user to delete itself
  if ((req.user as userService.IUserDoc).user_id !== req.params.user_id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'user not found');
  }

  await userService.deleteUserById(req.params.user_id);
  res.send();
});


export const verifyUserProfileById = catchAsync(async (req, res): Promise<void> => {
  const foundUser = await userService.getUserByCriteria('user_id', req.params.user_id as string, true);
  
  var otpCode = ""
  if (typeof(req.query.otp_code)==='string')
  {
    otpCode = req.query.otp_code
  }
  if ( foundUser && !foundUser.otp_code.includes(otpCode) )
  {
    throw new ApiError(httpStatus.NOT_FOUND, 'wrong otp provided');
  }
  const body = {
    "email_verified":true
  }
  const user = await userService.updateUserById(req.params.user_id, body);
  res.send(user);
});


export const verifyUserEmail = catchAsync(async (req, res): Promise<void> => {
  // only allow the auth user to delete itself
  const foundUser = await userService.getUserByCriteria('user_id', req.body.user_id as string, true);
  if (foundUser && foundUser.email_address) {
    var otp_code = Math.floor(100000 + Math.random() * 900000);
    const body = {
      "otp_code": otp_code.toString()
    }
    const user = await userService.updateUserById(req.body.user_id, body);
    await sendMail({
      to: foundUser.email_address as string,
      subject: `Verify your email`,
      message: `This email need to be verified, Your OTP Code is ${otp_code}, please click on the link ${config.web_client_base_url}/verify?id=${foundUser.user_id}`,
    }).catch(() => null);
  }
  res.send();
});

export const updateUserById = catchAsync(async (req, res): Promise<void> => {
  // only allow the auth user to update itself
  if ((req.user as userService.IUserDoc).user_id !== req.params.user_id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'user not found');
  }

  const user = await userService.updateUserById(req.params.user_id, req.body);
  res.send(user);
});
