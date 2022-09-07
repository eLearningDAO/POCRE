import catchAsync from '../utils/catchAsync';
import * as userService from '../services/user.service';

export const queryUsers = catchAsync(async (req, res): Promise<void> => {
  const users = await userService.queryUsers(); // TODO: add pagination params
  res.send(users);
});

export const getUserById = catchAsync(async (req, res): Promise<void> => {
  const user = await userService.getUserById(req.params.user_id);
  res.send(user);
});

export const createUser = catchAsync(async (req, res): Promise<void> => {
  const newUser = await userService.createUser(req.body);
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
