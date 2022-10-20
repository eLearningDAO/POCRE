import httpStatus from 'http-status';
import { DatabaseError } from 'pg';
import ApiError from '../utils/ApiError';
import * as db from '../db/pool';

interface IUser {
  user_name: string;
  wallet_address?: string;
  user_bio?: string;
  phone?: string;
  email_address?: string;
  verified_Id?: string;
}
interface IUserQuery {
  limit: number;
  page: number;
  query: string;
  search_fields: string[];
  top_authors?: boolean;
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
  phone?: string;
  email_address?: string;
  verified_Id?: string;
  date_joined: string;
  total_creations?: string;
}
interface IUserCriteria {
  required_users: number;
  exclude_users?: string[];
}

/**
 * Create a user
 * @param {IUser} userBody
 * @returns {Promise<IUserDoc>}
 */
export const createUser = async (userBody: IUser): Promise<IUserDoc> => {
  try {
    const result = await db.query(`INSERT INTO users (user_name,wallet_address,user_bio,phone,email_address, verified_Id) values ($1,$2,$3,$4,$5,$6) RETURNING *;`, [
      userBody.user_name,
      userBody.wallet_address,
      userBody.user_bio,
      userBody.phone,
      userBody.email_address,
      userBody.verified_Id,
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
    // search
    const search =
      options.search_fields && options.search_fields.length > 0
        ? `WHERE ${options.search_fields.map((field) => `${field} LIKE '%${options.query}%'`).join(' OR ')}`
        : '';

    // list of queries
    const queryModes = {
      default: {
        query: `SELECT * FROM users ${search} OFFSET $1 LIMIT $2;`,
        count: `SELECT COUNT(*) as total_results FROM users ${search};`,
      },
      topAuthors: {
        // users with most number of creations
        query: `SELECT 
                *, 
                (
                  SELECT 
                  COUNT(author_id) value_occurrence 
                  FROM 
                  creation 
                  WHERE 
                  author_id = u.user_id
                ) 
                as total_creations
                FROM 
                users u 
                ${search}
                WHERE 
                u.user_id = ANY(
                              ARRAY(
                                SELECT 
                                author_id 
                                FROM (
                                  SELECT 
                                  author_id, 
                                  COUNT(author_id) value_occurrence 
                                  FROM 
                                  creation 
                                  GROUP BY 
                                  author_id 
                                  ORDER BY 
                                  value_occurrence 
                                  DESC
                                )
                                AS authors
                              )
                            )
                  ORDER BY 
                  total_creations
                  DESC
                  OFFSET $1 
                  LIMIT $2;
                  `,
        count: `SELECT 
                COUNT(*) as total_results 
                FROM 
                users u 
                ${search}
                WHERE 
                u.user_id = ANY(
                              ARRAY(
                                SELECT 
                                author_id 
                                FROM (
                                  SELECT 
                                  author_id, 
                                  COUNT(author_id) value_occurrence 
                                  FROM 
                                  creation 
                                  GROUP BY 
                                  author_id 
                                  ORDER BY 
                                  value_occurrence 
                                  DESC
                                )
                                AS authors
                              )
                            );
                  `,
      },
    };

    const result = await db.query(options.top_authors ? queryModes.topAuthors.query : queryModes.default.query, [
      options.page === 1 ? '0' : (options.page - 1) * options.limit,
      options.limit,
    ]);
    const users = result.rows;

    const count = await (
      await db.query(options.top_authors ? queryModes.topAuthors.count : queryModes.default.count, [])
    ).rows[0];

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

/**
 * Find users that pass a defined criteria
 * @param {IUserCriteria} criteria
 * @returns {Promise<Array<IUserDoc>>}
 */
export const getReputedUsers = async (criteria: IUserCriteria): Promise<Array<IUserDoc>> => {
  try {
    const conditions =
      criteria.exclude_users && criteria.exclude_users.length > 0
        ? `WHERE ${criteria.exclude_users?.map((user_id) => `user_id <> '${user_id}'`).join(' AND ')}`
        : '';
    const result = await db.query(`SELECT * FROM users ${conditions} LIMIT $1;`, [criteria.required_users]);
    const users = result.rows as Array<IUserDoc>;
    return users;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `internal server error`);
  }
};
