import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import * as db from '../db/pool';
import { populator } from '../db/plugins/populator';

interface IDecision {
  decision_status: boolean;
  maker_id: string;
}
interface IDecisionDoc {
  decision_id: string;
  decision_status: boolean;
  maker_id: string;
}

/**
 * Create a decision
 * @param {IDecision} decisionBody
 * @returns {Promise<IDecisionDoc>}
 */
export const createDecision = async (decisionBody: IDecision): Promise<IDecisionDoc> => {
  try {
    const result = await db.instance.query(`INSERT INTO decision (decision_status,maker_id) values ($1,$2) RETURNING *;`, [
      decisionBody.decision_status,
      decisionBody.maker_id,
    ]);
    const decision = result.rows[0];
    return decision;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `internal server error`);
  }
};

/**
 * Get decision by id
 * @param {string} id
 * @param {object} options - optional config object
 * @param {string|string[]} options.populate - the list of fields to populate
 * @param {string} options.owner_id - returns the decision that belongs to owner_id
 * @returns {Promise<IDecisionDoc|null>}
 */
export const getDecisionById = async (
  id: string,
  options?: {
    populate?: string | string[];
    owner_id?: string;
  }
): Promise<IDecisionDoc | null> => {
  const decision = await (async () => {
    try {
      const result = await db.instance.query(
        `SELECT 
        * 
        ${populator({
          tableAlias: 'd',
          fields: options ? (typeof options.populate === 'string' ? [options.populate] : options.populate) : [],
        })} 
        FROM 
        decision d 
        WHERE 
        decision_id = $1 
        ${options && options.owner_id ? 'AND maker_id = $2' : ''}
        ;`,
        [id, options && options.owner_id ? options.owner_id : false].filter(Boolean)
      );
      return result.rows[0];
    } catch {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
    }
  })();

  if (!decision) throw new ApiError(httpStatus.NOT_FOUND, 'decision not found');

  return decision;
};

/**
 * Update decision by id
 * @param {string} id
 * @param {Partial<IDecision>} updateBody
 * @param {object} options - optional config object
 * @param {string} options.owner_id - updates the decision that belongs to owner_id
 * @returns {Promise<IDecisionDoc|null>}
 */

/**
 * Delete decision by id
 * @param {string} id
 * @param {object} options - optional config object
 * @param {string} options.owner_id - deletes the decision that belongs to owner_id
 * @returns {Promise<IDecisionDoc|null>}
 */
export const deleteDecisionById = async (id: string, options?: { owner_id?: string }): Promise<IDecisionDoc | null> => {
  // check if decision exists, throws error if not found
  const decision = await getDecisionById(id, {
    owner_id: options?.owner_id,
  });

  try {
    await db.instance.query(`DELETE FROM decision WHERE decision_id = $1;`, [id]);
    await db.instance.query(`CALL remove_decision_references($1);`, [id]); // remove this decision from everywhere it is used
    return decision;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
  }
};
