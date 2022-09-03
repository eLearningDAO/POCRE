import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import * as db from '../db/pool';

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
  const result = await db.query(`INSERT INTO users (name,age) values ($1,$2) RETURNING *;`, [userBody.name, userBody.age]);
  const user = result.rows[0];
  return user;
};

/**
 * Query for users
 * @returns {Promise<Array<IUser>}
 */
export const queryUsers = async (): Promise<Array<IUserDoc>> => {
  const result = await db.query(`SELECT * FROM users;`, []); // TODO: pagination
  const users = result.rows;
  return users;
};

/**
 * Get user by id
 * @param {number} id
 * @returns {Promise<IUserDoc|null>}
 */
export const getUserById = async (id: number): Promise<IUserDoc | null> => {
  const result = await db.query(`SELECT * FROM users WHERE id = $1;`, [id]);
  const user = result.rows[0];
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
  // check if user exists
  const findQry = await db.query(`SELECT id FROM users WHERE id = $1;`, [id]);
  const userExists = findQry.rows[0];
  if (!userExists) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // build sql conditions and values
  const conditions = [updateBody.name ? 'name = $2' : '', updateBody.age ? 'age = $3' : ''];
  const values = [];
  if (updateBody.name != null) values.push(updateBody.name);
  if (updateBody.age && updateBody.age >= 0) values.push(updateBody.age);

  // update user
  const updateQry = await db.query(
    `
      UPDATE users SET 
      ${conditions.filter(Boolean).join(',')} 
      WHERE id = $1 RETURNING *;
    `,
    [id, ...values]
  );
  const user = updateQry.rows[0];
  return user;
};

/**
 * Delete user by id
 * @param {number} id
 * @returns {Promise<IUserDoc|null>}
 */
export const deleteUserById = async (id: number): Promise<IUserDoc | null> => {
  const result = await db.query(`SELECT id FROM users WHERE id = $1;`, [id]);
  const user = result.rows[0];
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await db.query(`DELETE FROM users WHERE id = $1;`, [id]);
  return user;
};
