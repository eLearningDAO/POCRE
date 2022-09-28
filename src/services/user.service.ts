import httpStatus from 'http-status';
import { DatabaseError } from 'pg';
import ApiError from '../utils/ApiError';
import * as db from '../db/pool';

interface IUser {
  user_name: string;
  wallet_address?: string;
  user_bio?: string;
}
interface IUserQuery {
  limit: number;
  page: number;
  query: string;
  search_fields: string[];
}
interface IUserQueryResult {
  results: Array<IUserDoc>;
  total_pages: number;
  total_results: number;
  limit: number;
  page: number;
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
  } catch (e: unknown) {
    const err = e as DatabaseError;
    if (err.message && err.message.includes('duplicate key')) {
      if (err.message.includes('user_name')) throw new ApiError(httpStatus.CONFLICT, `user_name is already taken`);
    }

    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `internal server error`);
  }
};

/**
 * Query for users
 * @returns {Promise<Array<IUser>}
 */
export const queryUsers = async (options: IUserQuery): Promise<IUserQueryResult> => {
  try {
    const search =
      options.search_fields && options.search_fields.length > 0
        ? `WHERE ${options.search_fields.map((field) => `${field} LIKE '%${options.query}%'`).join(' OR ')}`
        : '';

    const result = await db.query(`SELECT * FROM users ${search} OFFSET $1 LIMIT $2;`, [
      options.page === 1 ? '0' : (options.page - 1) * options.limit,
      options.limit,
    ]);
    const users = result.rows;

    const count = await (await db.query(`SELECT COUNT(*) as total_results FROM users ${search};`, [])).rows[0];

    return {
      results: users,
      limit: options.limit,
      page: options.page,
      total_results: count.total_results,
      total_pages: Math.ceil(count.total_results / options.limit),
    };
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
  } catch (e: unknown) {
    const err = e as DatabaseError;
    if (err.message && err.message.includes('duplicate key')) {
      if (err.message.includes('user_name')) throw new ApiError(httpStatus.CONFLICT, `user_name is already taken`);
    }

    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `internal server error`);
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
