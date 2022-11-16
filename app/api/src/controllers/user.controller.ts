import catchAsync from '../utils/catchAsync';
import * as userService from '../services/user.service';
import { encrypt } from '../utils/crypt';

export const queryUsers = catchAsync(async (req, res): Promise<void> => {
  const users = await userService.queryUsers(req.query as any);
  res.send(users);
});

export const getUserById = catchAsync(async (req, res): Promise<void> => {
  const user = await userService.getUserById(req.params.user_id);
  res.send(user);
});

export const createUser = catchAsync(async (req, res): Promise<void> => {
  const hashedWalletAddress = encrypt(req.body.wallet_address);
  const newUser = await userService.createUser({ ...req.body, wallet_address: hashedWalletAddress });
  res.send(newUser);
});

export const deleteUserById = catchAsync(async (req, res): Promise<void> => {
  await userService.deleteUserById(req.params.user_id);
  res.send();
});

export const updateUserById = catchAsync(async (req, res): Promise<void> => {
  const user = await userService.updateUserById(req.params.user_id, req.body);
  res.send(user);
});
