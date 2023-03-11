import httpStatus from 'http-status';
import { DatabaseError } from 'pg';
import transactionPurposes from '../constants/transactionPurposes';
import { populator } from '../db/plugins/populator';
import * as db from '../db/pool';
import ApiError from '../utils/ApiError';

const types = Object.values(transactionPurposes);
type TTransactionPurposes = typeof types[number];
interface ITransaction {
  transaction_hash: string;
  transaction_purpose: TTransactionPurposes;
  maker_id: string;
  blocking_issue?: string;
}
interface ITransactionDoc {
  transaction_id: string;
  transaction_hash: string;
  transaction_purpose: TTransactionPurposes;
  is_validated: boolean;
  maker_id: string;
  blocking_issue: string;
  created_at: string;
}

/**
 * Create a transaction
 * @param {ITransaction} transactionBody
 * @returns {Promise<ITransactionDoc>}
 */
export const createTransaction = async (transactionBody: ITransaction): Promise<ITransactionDoc> => {
  try {
    const result = await db.instance.query(
      `
      INSERT 
      INTO 
      transaction 
      (
        transaction_hash,
        transaction_purpose,
        maker_id
      ) 
      values 
      ($1,$2,$3) 
      RETURNING 
      *;
      `,
      [transactionBody.transaction_hash, transactionBody.transaction_purpose, transactionBody.maker_id]
    );
    const transaction = result.rows[0];
    return transaction;
  } catch (e: unknown) {
    const err = e as DatabaseError;
    if (err.message && err.message.includes('duplicate key')) {
      if (err.message.includes('transaction_hash')) throw new ApiError(httpStatus.CONFLICT, `transaction already exists`);
    }

    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `internal server error`);
  }
};

/**
 * Get transaction by criteria
 * @param {string} criteria - the criteria to find transaction
 * @param {string} equals - the value on which criteria matches
 * @param {object} options - optional config object
 * @param {string|string[]} options.populate - the list of fields to populate
 * @param {string} options.owner_id - returns the transaction that belongs to owner_id
 * @returns {Promise<ITransactionDoc|null>}
 */
export const getTransactionByCriteria = async (
  criteria: 'transaction_id' | 'transaction_hash',
  equals: string,
  options?: {
    populate?: string | string[];
    owner_id?: string;
  }
): Promise<ITransactionDoc | null> => {
  const transaction = await (async () => {
    try {
      const result = await db.instance.query(
        `
        SELECT 
        * 
        ${populator({
          tableAlias: 't',
          fields: options ? (typeof options.populate === 'string' ? [options.populate] : options.populate) : [],
        })} 
        FROM 
        transaction t
        WHERE 
        ${criteria} = $1 
        ${options && options.owner_id ? 'AND maker_id = $2' : ''}
        LIMIT 1
        ;`,
        [equals, options && options.owner_id ? options.owner_id : false].filter(Boolean)
      );
      return result.rows[0];
    } catch {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
    }
  })();

  if (!transaction) throw new ApiError(httpStatus.NOT_FOUND, 'transaction not found');

  return transaction;
};

/**
 * Get transaction by id
 * @param {string} id
 * @param {object} options - optional config object
 * @param {string|string[]} options.populate - the list of fields to populate
 * @param {string} options.owner_id - returns the transaction that belongs to owner_id
 * @returns {Promise<ITransactionDoc|null>}
 */
export const getTransactionById = async (
  id: string,
  options?: {
    populate?: string | string[];
    owner_id?: string;
  }
): Promise<ITransactionDoc | null> => {
  return getTransactionByCriteria('transaction_id', id, options);
};

/**
 * Get transaction by hash
 * @param {string} hash
 * @param {object} options - optional config object
 * @param {string|string[]} options.populate - the list of fields to populate
 * @param {string} options.owner_id - returns the transaction that belongs to owner_id
 * @returns {Promise<ITransactionDoc|null>}
 */
export const getTransactionByHash = async (
  id: string,
  options?: {
    populate?: string | string[];
    owner_id?: string;
  }
): Promise<ITransactionDoc | null> => {
  return getTransactionByCriteria('transaction_hash', id, options);
};

/**
 * Update transaction by id
 * @param {string} id
 * @param {Partial<ITransaction>} updateBody
 * @param {object} options - optional config object
 * @param {string} options.owner_id - updates the transaction that belongs to owner_id
 * @returns {Promise<ITransactionDoc|null>}
 */
export const updateTransactionById = async (
  id: string,
  updateBody: Partial<ITransaction>,
  options?: { owner_id?: string }
): Promise<ITransactionDoc | null> => {
  // check if transaction exists, throws error if not found
  await getTransactionById(id, { owner_id: options?.owner_id });

  // build sql conditions and values
  const conditions: string[] = [];
  const values: (string | null)[] = [];
  Object.entries(updateBody).map(([k, v], index) => {
    conditions.push(`${k} = $${index + 2}`);
    values.push(v);
    return null;
  });

  // update transaction
  try {
    const updateQry = await db.instance.query(
      `
      UPDATE transaction SET
      ${conditions.filter(Boolean).join(',')}
      WHERE transaction_id = $1 RETURNING *;
    `,
      [id, ...values]
    );
    const transaction = updateQry.rows[0];
    return transaction;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `internal server error`);
  }
};

/**
 * Delete transaction by id
 * @param {string} id
 * @param {object} options - optional config object
 * @param {string} options.owner_id - deletes the transaction that belongs to owner_id
 * @returns {Promise<ITransactionDoc|null>}
 */
export const deleteTransactionById = async (
  id: string,
  options?: { owner_id?: string }
): Promise<ITransactionDoc | null> => {
  // check if transaction exists, throws error if not found
  const transaction = await getTransactionById(id, { owner_id: options?.owner_id });

  try {
    await db.instance.query(`DELETE FROM transaction WHERE transaction_id = $1;`, [id]);
    return transaction;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
  }
};
