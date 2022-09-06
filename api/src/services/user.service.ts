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
  try {
    const result = await db.query(`INSERT INTO users (user_name,wallet_address,user_bio) values ($1,$2,$3) RETURNING *;`, [
      userBody.user_name,
      userBody.wallet_address,
      userBody.user_bio,
    ]);
    const user = result.rows[0];
    return user;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
  }
};

/**
 * Query for users
 * @returns {Promise<Array<IUser>}
 */
export const queryUsers = async (): Promise<Array<IUserDoc>> => {
  try {
    const result = await db.query(`SELECT * FROM users;`, []); // TODO: pagination
    const users = result.rows;
    return users;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
  }
};

/**
 * Get user by id
 * @param {string} id
 * @returns {Promise<IUserDoc|null>}
 */
export const getUserById = async (id: string): Promise<IUserDoc | null> => {
  const user = await (async () => {
    try {
      const result = await db.query(`SELECT * FROM users WHERE user_id = $1;`, [id]);
      return result.rows[0];
    } catch {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
    }
  })();

  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'user not found');

  return user;
};

/**
 * Update user by id
 * @param {string} id
 * @param {Partial<IUser>} updateBody
 * @returns {Promise<IUserDoc|null>}
 */
export const updateUserById = async (id: string, updateBody: Partial<IUser>): Promise<IUserDoc | null> => {
  await getUserById(id); // check if user exists, throws error if not found

  // build sql conditions and values
  const conditions: string[] = [];
  const values: (string | null)[] = [];
  Object.entries(updateBody).map(([k, v], index) => {
    conditions.push(`${k} = $${index + 2}`);
    values.push(v);
    return null;
  });

  // update user
  try {
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
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
  }
};

/**
 * Delete user by id
 * @param {string} id
 * @returns {Promise<IUserDoc|null>}
 */
export const deleteUserById = async (id: string): Promise<IUserDoc | null> => {
  const user = await getUserById(id); // check if user exists, throws error if not found

  try {
    await db.query(`DELETE FROM users WHERE user_id = $1;`, [id]);
    return user;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
  }
};
