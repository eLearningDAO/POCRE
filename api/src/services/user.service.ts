import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import * as db from '../db/pool';

interface IUser {
  user_name: string;
  wallet_address?: string;
  user_bio?: string;
}
interface IUserDoc {
  user_id: string;
  user_name: string;
  wallet_address: string;
  user_bio: string;
  date_joined: string;
}

/**
 * Create a user
 * @param {IUser} userBody
 * @returns {Promise<IUserDoc>}
 */
export const createUser = async (userBody: IUser): Promise<IUserDoc> => {
  const result = await db.query(`INSERT INTO users (user_name,wallet_address,user_bio) values ($1,$2,$3) RETURNING *;`, [
    userBody.user_name,
    userBody.wallet_address,
    userBody.user_bio,
  ]);
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
 * @param {string} id
 * @returns {Promise<IUserDoc|null>}
 */
export const getUserById = async (id: string): Promise<IUserDoc | null> => {
  const result = await db.query(`SELECT * FROM users WHERE user_id = $1;`, [id]);
  const user = result.rows[0];
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return user;
};

/**
 * Update user by id
 * @param {string} id
 * @param {Partial<IUser>} updateBody
 * @returns {Promise<IUserDoc|null>}
 */
export const updateUserById = async (id: string, updateBody: Partial<IUser>): Promise<IUserDoc | null> => {
  // check if user exists
  const findQry = await db.query(`SELECT user_id FROM users WHERE user_id = $1;`, [id]);
  const foundUser = findQry.rows[0];
  if (!foundUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // build sql conditions and values
  const conditions = [
    updateBody.user_name ? 'user_name = $2' : '',
    updateBody.wallet_address ? 'wallet_address = $3' : '',
    updateBody.user_bio ? 'user_bio = $4' : '',
  ];
  const values = [];
  if (updateBody.user_name != null) values.push(updateBody.user_name);
  if (updateBody.wallet_address != null) values.push(updateBody.wallet_address);
  if (updateBody.user_bio != null) values.push(updateBody.user_bio);

  // update user
  const updateQry = await db.query(
    `
      UPDATE users SET
      ${conditions.filter(Boolean).join(',')}
      WHERE user_id = $1 RETURNING *;
    `,
    [id, ...values]
  );
  const user = updateQry.rows[0];
  return user;
};

/**
 * Delete user by id
 * @param {string} id
 * @returns {Promise<IUserDoc|null>}
 */
export const deleteUserById = async (id: string): Promise<IUserDoc | null> => {
  const result = await db.query(`SELECT user_id FROM users WHERE user_id = $1;`, [id]);
  const user = result.rows[0];
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await db.query(`DELETE FROM users WHERE user_id = $1;`, [id]);
  return user;
};
