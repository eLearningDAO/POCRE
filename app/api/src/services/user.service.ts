import httpStatus from 'http-status';
import { QueryResult } from 'pg';
import { reputation } from '../constants/statusTypes';
import * as db from '../db/pool';
import ApiError from '../utils/ApiError';
import { getCreationsCount, getStar } from '../utils/userStarCalculation';

export interface IUser {
  user_name: string;
  wallet_address?: string;
  user_bio?: string;
  phone?: string;
  email_address?: string;
  verified_id?: string;
  reputation_stars?: number;
  creation_count?: number;
  image_url?: string;
  is_invited?: boolean;
  email_verified?: boolean;
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
export interface IUserDoc {
  user_id: string;
  user_name: string;
  wallet_address: string;
  user_bio: string;
  phone?: string;
  email_address?: string;
  verified_id?: string;
  reputation_stars?: number;
  creation_count?: number;
  authorship_duration?: string;
  date_joined: string;
  total_creations?: string;
  is_invited: boolean;
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
    const result = await db.instance.query(
      `INSERT INTO users 
      (
        user_name,
        wallet_address,
        user_bio,
        phone,
        email_address,
        verified_id,
        reputation_stars,
        image_url,
        is_invited
      ) 
      values 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *;`,
      [
        userBody.user_name,
        userBody.wallet_address,
        userBody.user_bio,
        userBody.phone,
        userBody.email_address,
        userBody.verified_id,
        userBody.reputation_stars,
        userBody.image_url,
        userBody.is_invited,
      ]
    );
    const user = result.rows[0];
    return user;
  } catch {
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
        ? `WHERE ${options.search_fields.map((field) => `LOWER(${field}) LIKE LOWER('%${options.query}%')`).join(' OR ')}`
        : '';

    // list of queries
    const queryModes = {
      default: {
        query: `SELECT * FROM VIEW_users_public_fields ${search} OFFSET $1 LIMIT $2;`,
        count: `SELECT COUNT(*) as total_results FROM VIEW_users_public_fields ${search};`,
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
                VIEW_users_public_fields u 
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
                VIEW_users_public_fields u 
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

    const result = await db.instance.query(options.top_authors ? queryModes.topAuthors.query : queryModes.default.query, [
      options.page === 1 ? '0' : (options.page - 1) * options.limit,
      options.limit,
    ]);
    const users = result.rows;

    const count = await (
      await db.instance.query(options.top_authors ? queryModes.topAuthors.count : queryModes.default.count, [])
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
 * Get user by criteria
 * @param {string} criteria - the criteria to find user
 * @param {string} equals - the value on which criteria matches
 * @returns {Promise<IUserDoc|null>}
 */
export const getUserByCriteria = async (
  criteria: 'user_id' | 'wallet_address' | 'user_name' | 'email_address' | 'phone',
  equals: string,
  return_public_data?: boolean
): Promise<IUserDoc | null> => {
  const user = await (async () => {
    try {
      const result = await db.instance.query(
        `
        SELECT 
        * 
        FROM 
        ${criteria === 'wallet_address' || return_public_data ? 'users' : 'VIEW_users_public_fields'} 
        WHERE 
        ${criteria} = $1 
        LIMIT 1
        ;`,
        [equals]
      );
      return result.rows[0];
    } catch {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
    }
  })();

  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'user not found');

  return user;
};

/**
 * Get user by id
 * @param {string} id
 * @returns {Promise<IUserDoc|null>}
 */
export const getUserById = async (id: string): Promise<IUserDoc | null> => {
  return getUserByCriteria('user_id', id);
};

/**
 * Get user by wallet address
 * @param {string} walletAddress
 * @returns {Promise<IUserDoc|null>}
 */
export const getUserByWalletAddress = async (walletAddress: string): Promise<IUserDoc | null> => {
  return getUserByCriteria('wallet_address', walletAddress);
};

/**
 * Get user by email address
 * @param {string} emailAddress
 * @returns {Promise<IUserDoc|null>}
 */
export const getUserByEmailAddress = async (emailAddress: string): Promise<IUserDoc | null> => {
  return getUserByCriteria('email_address', emailAddress);
};

/**
 * Get user by phone
 * @param {string} phone
 * @returns {Promise<IUserDoc|null>}
 */
export const getUserByPhone = async (phone: string): Promise<IUserDoc | null> => {
  return getUserByCriteria('phone', phone);
};

/**
 * Get user by username
 * @param {string} username
 * @returns {Promise<IUserDoc|null>}
 */
export const getUserByUsername = async (username: string): Promise<IUserDoc | null> => {
  return getUserByCriteria('user_name', username);
};

/**
 * Update user by id
 * @param {string} id
 * @param {Partial<IUser>} updateBody
 * @returns {Promise<IUserDoc|null>}
 */
export const updateUserById = async (id: string, updateBody: Partial<IUser>): Promise<IUserDoc | null> => {
  await getUserById(id); // check if user exists, throws error if not found
  const starCount = await getStar(updateBody,id)
  const creationCount = await getCreationsCount(updateBody,id)
  if (typeof(starCount)==='number') updateBody.reputation_stars = starCount; // update the stars field according to aviable user fields .
  if (typeof(creationCount)==='number') updateBody.creation_count = creationCount;
  // build sql conditions and values
  const conditions: string[] = [];
  const values: (string | number | null | boolean)[] = [];
  Object.entries(updateBody).map(([k, v], index) => {
    conditions.push(`${k} = $${index + 2}`);
    values.push(v);
    return null;
  });
  // update user
  try {
    const updateQry = await db.instance.query(
      `
        UPDATE users SET
        ${conditions.filter(Boolean).join(',')}
        WHERE user_id = $1 RETURNING *;
      `,
      [id, ...values]
    );
    return responseWithAuthorishipDuration(updateQry);
  } catch {
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
    await db.instance.query(`DELETE FROM users WHERE user_id = $1;`, [id]);
    return user;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
  }
};

/**
 * Find onboarded users that pass a defined criteria
 * @param {IUserCriteria} criteria
 * @returns {Promise<Array<IUserDoc>>}
 */
export const getReputedUsers = async (criteria: IUserCriteria): Promise<Array<IUserDoc>> => {
  try {
    const conditions =
      criteria.exclude_users && criteria.exclude_users.length > 0
        ? `WHERE ${criteria.exclude_users?.map((user_id) => `user_id <> '${user_id}'`).join(' AND ')}`
        : '';
    const result = await db.instance.query(
      `SELECT * FROM users ${conditions} ${conditions.length > 0 ? 'AND' : 'WHERE'} is_invited = $1 LIMIT $2;`,
      [false, criteria.required_users]
    );
    const users = result.rows as Array<IUserDoc>;
    return users;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `internal server error`);
  }
};

/**
 * this function is used to update the authorship
 * duration of the user and return the update user object
 *
 */
const responseWithAuthorishipDuration = (queryResult: QueryResult<any>) => {
  const user = queryResult.rows[0];
  const authorship_duration = reputation[user.reputation_stars];
  return { ...user, authorship_duration };
};
