import httpStatus from 'http-status';
import { DatabaseError } from 'pg';
import ApiError from '../utils/ApiError';
import * as db from '../db/pool';
import { populator } from '../db/plugins/populator';

interface IRecognition {
  recognition_by: string;
  recognition_for: string;
  recognition_description?: string;
  status_id: string;
}
interface IRecognitionQuery {
  limit: number;
  page: number;
  query: string;
  search_fields: string[];
  ascend_fields: string[];
  descend_fields: string[];
  populate?: string | string[];
}
interface IRecognitionQueryResult {
  results: Array<IRecognitionDoc>;
  total_pages: number;
  total_results: number;
  limit: number;
  page: number;
}
interface IRecognitionDoc {
  recognition_id: string;
  recognition_by: string;
  recognition_for: string;
  recognition_description: string;
  recognition_issued: string;
  status_id: string;
}

/**
 * Create a recognition
 * @param {IRecognition} recognitionBody
 * @returns {Promise<IRecognitionDoc>}
 */
export const createRecognition = async (recognitionBody: IRecognition): Promise<IRecognitionDoc> => {
  if (recognitionBody.recognition_by === recognitionBody.recognition_for) {
    throw new ApiError(httpStatus.CONFLICT, `user cannot recognize themselve`);
  }

  try {
    const result = await db.query(
      `INSERT INTO recognition (recognition_by,recognition_for,recognition_description,status_id) values ($1,$2,$3,$4) RETURNING *;`,
      [
        recognitionBody.recognition_by,
        recognitionBody.recognition_for,
        recognitionBody.recognition_description,
        recognitionBody.status_id,
      ]
    );
    const recognition = result.rows[0];
    return recognition;
  } catch (e: unknown) {
    const err = e as DatabaseError;
    if (err.message && err.message.includes('duplicate key')) {
      if (err.message.includes('status_id'))
        throw new ApiError(httpStatus.CONFLICT, `status already assigned to a recognition`);
    }

    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `internal server error`);
  }
};

/**
 * Query for recognitions
 * @returns {Promise<Array<IRecognition>>}
 */
export const queryRecognitions = async (options: IRecognitionQuery): Promise<IRecognitionQueryResult> => {
  try {
    // search
    const search =
      options.search_fields && options.search_fields.length > 0
        ? `WHERE ${options.search_fields
            .map(
              (field) =>
                `${field} ${
                  ['recognition_by', 'recognition_for'].includes(field)
                    ? `= '${options.query}'`
                    : `LIKE '%${options.query}%'`
                }`
            )
            .join(' OR ')}`
        : '';

    // order
    const ascendOrder =
      (options.ascend_fields || []).length > 0 ? `${options.ascend_fields.map((x) => `${x} ASC`).join(', ')}` : '';
    const descendOrder =
      (options.descend_fields || []).length > 0 ? `${options.descend_fields.map((x) => `${x} DESC`).join(', ')}` : '';
    const order =
      (options.ascend_fields || options.descend_fields || []).length > 0
        ? `ORDER BY ${ascendOrder} ${
            (options.ascend_fields || []).length > 0 && (options.descend_fields || []).length > 0 ? ', ' : ''
          } ${descendOrder}`
        : '';

    const result = await db.query(
      `SELECT * ${populator({
        tableAlias: 'r',
        fields: typeof options.populate === 'string' ? [options.populate] : options.populate,
      })} FROM recognition r ${search} ${order} OFFSET $1 LIMIT $2;`,
      [options.page === 1 ? '0' : (options.page - 1) * options.limit, options.limit]
    );
    const recognitions = result.rows;

    const count = await (await db.query(`SELECT COUNT(*) as total_results FROM recognition ${search};`, [])).rows[0];

    return {
      results: recognitions,
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
 * Get recognition by id
 * @param {string} id
 * @returns {Promise<IRecognitionDoc|null>}
 */
export const getRecognitionById = async (id: string, populate?: string | string[]): Promise<IRecognitionDoc | null> => {
  const recognition = await (async () => {
    try {
      const result = await db.query(
        `SELECT * ${populator({
          tableAlias: 'r',
          fields: typeof populate === 'string' ? [populate] : populate,
        })} FROM recognition r WHERE recognition_id = $1;`,
        [id]
      );
      return result.rows[0];
    } catch {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
    }
  })();

  if (!recognition) throw new ApiError(httpStatus.NOT_FOUND, 'recognition not found');

  return recognition;
};

/**
 * Update recognition by id
 * @param {string} id
 * @param {Partial<IRecognition>} updateBody
 * @returns {Promise<IRecognitionDoc|null>}
 */
export const updateRecognitionById = async (
  id: string,
  updateBody: Partial<IRecognition>
): Promise<IRecognitionDoc | null> => {
  const foundRecognition = await getRecognitionById(id); // check if recognition exists, throws error if not found

  if (
    (updateBody.recognition_for &&
      !updateBody.recognition_by &&
      updateBody.recognition_for === foundRecognition?.recognition_by) ||
    (updateBody.recognition_by &&
      !updateBody.recognition_for &&
      updateBody.recognition_by === foundRecognition?.recognition_for) ||
    (updateBody.recognition_by && updateBody.recognition_for && updateBody.recognition_by === updateBody.recognition_for)
  ) {
    throw new ApiError(httpStatus.CONFLICT, `user cannot recognize themselve`);
  }

  // build sql conditions and values
  const conditions: string[] = [];
  const values: (string | null)[] = [];
  Object.entries(updateBody).map(([k, v], index) => {
    conditions.push(`${k} = $${index + 2}`);
    values.push(v);
    return null;
  });

  // update recognition
  try {
    const updateQry = await db.query(
      `
      UPDATE recognition SET
      ${conditions.filter(Boolean).join(',')}
      WHERE recognition_id = $1 RETURNING *;
    `,
      [id, ...values]
    );
    const recognition = updateQry.rows[0];
    return recognition;
  } catch (e: unknown) {
    const err = e as DatabaseError;
    if (err.message && err.message.includes('duplicate key')) {
      if (err.message.includes('status_id'))
        throw new ApiError(httpStatus.CONFLICT, `status already assigned to a recognition`);
    }

    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `internal server error`);
  }
};

/**
 * Delete recognition by id
 * @param {string} id
 * @returns {Promise<IRecognitionDoc|null>}
 */
export const deleteRecognitionById = async (id: string): Promise<IRecognitionDoc | null> => {
  const recognition = await getRecognitionById(id); // check if recognition exists, throws error if not found

  try {
    await db.query(`DELETE FROM recognition WHERE recognition_id = $1;`, [id]);
    await db.query(`CALL remove_recognition_references($1);`, [id]); // remove this recognition from everywhere it is used
    return recognition;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
  }
};
