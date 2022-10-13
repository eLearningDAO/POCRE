import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import * as db from '../db/pool';

interface ISource {
  source_title: string;
  source_description?: string;
  site_url?: string;
}
interface ISourceDoc {
  source_id: string;
  source_title: string;
  source_description: string;
  site_url: string;
}

/**
 * Create a source
 * @param {ISource} sourceBody
 * @returns {Promise<ISourceDoc>}
 */
export const createSource = async (sourceBody: ISource): Promise<ISourceDoc> => {
  try {
    const result = await db.query(
      `INSERT INTO source (source_title,source_description,site_url) values ($1,$2,$3) RETURNING *;`,
      [sourceBody.source_title, sourceBody.source_description, sourceBody.site_url]
    );
    const source = result.rows[0];
    return source;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
  }
};

/**
 * Get source by id
 * @param {string} id
 * @returns {Promise<ISourceDoc|null>}
 */
export const getSourceById = async (id: string): Promise<ISourceDoc | null> => {
  const source = await (async () => {
    try {
      const result = await db.query(`SELECT * FROM source WHERE source_id = $1;`, [id]);
      return result.rows[0];
    } catch {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
    }
  })();

  if (!source) throw new ApiError(httpStatus.NOT_FOUND, 'source not found');

  return source;
};

/**
 * Update source by id
 * @param {string} id
 * @param {Partial<ISource>} updateBody
 * @returns {Promise<ISourceDoc|null>}
 */
export const updateSourceById = async (id: string, updateBody: Partial<ISource>): Promise<ISourceDoc | null> => {
  await getSourceById(id); // check if source exists, throws error if not found

  // build sql conditions and values
  const conditions: string[] = [];
  const values: (string | null)[] = [];
  Object.entries(updateBody).map(([k, v], index) => {
    conditions.push(`${k} = $${index + 2}`);
    values.push(v);
    return null;
  });

  // update source
  try {
    const updateQry = await db.query(
      `
      UPDATE source SET
      ${conditions.filter(Boolean).join(',')}
      WHERE source_id = $1 RETURNING *;
    `,
      [id, ...values]
    );
    const source = updateQry.rows[0];
    return source;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
  }
};

/**
 * Delete source by id
 * @param {string} id
 * @returns {Promise<ISourceDoc|null>}
 */
export const deleteSoucreById = async (id: string): Promise<ISourceDoc | null> => {
  const source = await getSourceById(id); // check if source exists, throws error if not found

  try {
    await db.query(`DELETE FROM source WHERE source_id = $1;`, [id]);
    return source;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
  }
};
