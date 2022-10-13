import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import * as db from '../db/pool';

interface IStatus {
  status_name: string;
  status_description?: string;
}
interface IStatusDoc {
  status_id: string;
  status_name: string;
  status_description: string;
  action_made: string;
}

/**
 * Create a status
 * @param {IStatus} statusBody
 * @returns {Promise<IStatusDoc>}
 */
export const createStatus = async (statusBody: IStatus): Promise<IStatusDoc> => {
  try {
    const result = await db.query(`INSERT INTO status (status_name,status_description) values ($1,$2) RETURNING *;`, [
      statusBody.status_name,
      statusBody.status_description,
    ]);
    const status = result.rows[0];
    return status;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
  }
};

/**
 * Get status by id
 * @param {string} id
 * @returns {Promise<IStatusDoc|null>}
 */
export const getStatusById = async (id: string): Promise<IStatusDoc | null> => {
  const status = await (async () => {
    try {
      const result = await db.query(`SELECT * FROM status WHERE status_id = $1;`, [id]);
      return result.rows[0];
    } catch {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
    }
  })();

  if (!status) throw new ApiError(httpStatus.NOT_FOUND, 'status not found');

  return status;
};

/**
 * Update status by id
 * @param {string} id
 * @param {Partial<IStatus>} updateBody
 * @returns {Promise<IStatusDoc|null>}
 */
export const updateStatusById = async (id: string, updateBody: Partial<IStatus>): Promise<IStatusDoc | null> => {
  await getStatusById(id); // check if status exists, throws error if not found

  // build sql conditions and values
  const conditions: string[] = [];
  const values: (string | null)[] = [];
  Object.entries(updateBody).map(([k, v], index) => {
    conditions.push(`${k} = $${index + 2}`);
    values.push(v);
    return null;
  });

  // update status
  try {
    const updateQry = await db.query(
      `
      UPDATE status SET
      ${conditions.filter(Boolean).join(',')}
      WHERE status_id = $1 RETURNING *;
    `,
      [id, ...values]
    );
    const status = updateQry.rows[0];
    return status;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
  }
};

/**
 * Delete status by id
 * @param {string} id
 * @returns {Promise<IStatusDoc|null>}
 */
export const deleteStatusById = async (id: string): Promise<IStatusDoc | null> => {
  const status = await getStatusById(id); // check if status exists, throws error if not found

  try {
    await db.query(`DELETE FROM status WHERE status_id = $1;`, [id]);
    return status;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
  }
};
