import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import * as userService from '../services/user.service';
import { encrypt } from '../utils/crypt';
import ApiError from '../utils/ApiError';

export const queryUsers = catchAsync(async (req, res): Promise<void> => {
  const users = await userService.queryUsers(req.query as any);
  res.send(users);
});

export const getUserById = catchAsync(async (req, res): Promise<void> => {
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

export const updateUserById = catchAsync(async (req, res): Promise<void> => {
  // only allow the auth user to update itself
  if ((req.user as userService.IUserDoc).user_id !== req.params.user_id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'user not found');
  }

  const user = await userService.updateUserById(req.params.user_id, req.body);
  res.send(user);
});
