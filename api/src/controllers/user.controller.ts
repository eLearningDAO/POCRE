import catchAsync from '../utils/catchAsync';
import * as userService from '../services/user.service';

export const getUsers = catchAsync(async (req, res): Promise<void> => {
  const users = await userService.queryUsers(); // TODO: add pagination params
  res.send(users);
});

export const getUserByID = catchAsync(async (req, res): Promise<void> => {
  const user = await userService.getUserById(req.params.userId as any);
  res.send(user);
});

export const createUser = catchAsync(async (req, res): Promise<void> => {
  const newUser = await userService.createUser(req.body);
  res.send(newUser);
});

export const deleteUserByID = catchAsync(async (req, res): Promise<void> => {
  await userService.deleteUserById(req.params.userId as any);
  res.send();
});

export const updateUserByID = catchAsync(async (req, res): Promise<void> => {
  const user = await userService.updateUserById(req.params.userId as any, req.body as any);
  res.send(user);
});
