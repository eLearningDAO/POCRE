import httpStatus from 'http-status';
import { User } from '../entities/User';
import ApiError from '../utils/ApiError';

interface IUser {
  name: string;
  age: number;
}
interface IUserDoc {
  id: number;
  name: string;
  age: number;
}

/**
 * Create a user
 * @param {IUser} userBody
 * @returns {Promise<IUserDoc>}
 */
export const createUser = async (userBody: IUser): Promise<IUserDoc> => {
  const user = new User();
  user.name = userBody.name;
  user.age = userBody.age;
  await user.save();
  return user;
};

/**
 * Query for users
 * @returns {Promise<Array<IUser>}
 */
export const queryUsers = async (): Promise<Array<IUserDoc>> => {
  const users = await User.find(); // TODO: pagination
  return users;
};

/**
 * Get user by id
 * @param {number} id
 * @returns {Promise<IUserDoc|null>}
 */
export const getUserById = async (id: number): Promise<IUserDoc | null> => {
  const user = await User.findOneBy({ id });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return user;
};

/**
 * Update user by id
 * @param {number} id
 * @param {Partial<IUser>} updateBody
 * @returns {Promise<IUserDoc|null>}
 */
export const updateUserById = async (id: number, updateBody: Partial<IUser>): Promise<IUserDoc | null> => {
  const user = await User.findOneBy({ id });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {number} id
 * @returns {Promise<IUserDoc|null>}
 */
export const deleteUserById = async (id: number): Promise<IUserDoc | null> => {
  const user = await User.findOneBy({ id });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};
