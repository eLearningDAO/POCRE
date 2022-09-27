import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import * as db from '../db/pool';

interface ITag {
  tag_name: string;
  tag_description: string;
}
interface ITagQuery {
  limit: number;
  page: number;
  query: string;
  search_fields: string[];
}
interface ITagQueryResult {
  results: Array<ITag>;
  total_pages: number;
  total_results: number;
  limit: number;
  page: number;
}
interface ITagDoc {
  tag_id: string;
  tag_name: string;
  tag_description: string;
  tag_created: string;
}

/**
 * Create a tag
 * @param {ITag} tagBody
 * @returns {Promise<ITagDoc>}
 */
export const createTag = async (tagBody: ITag): Promise<ITagDoc> => {
  try {
    const result = await db.query(`INSERT INTO tag (tag_name,tag_description) values ($1,$2) RETURNING *;`, [
      tagBody.tag_name,
      tagBody.tag_description,
    ]);
    const tag = result.rows[0];
    return tag;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
  }
};

/**
 * Query for tags
 * @returns {Promise<Array<ITag>}
 */
export const queryTags = async (options: ITagQuery): Promise<ITagQueryResult> => {
  try {
    const search =
      options.search_fields && options.search_fields.length > 0
        ? `WHERE ${options.search_fields.map((field) => `${field} LIKE '%${options.query}%'`).join(' OR ')}`
        : '';

    const result = await db.query(`SELECT * FROM tag ${search} OFFSET $1 LIMIT $2;`, [
      options.page === 1 ? '0' : (options.page - 1) * options.limit,
      options.limit,
    ]);
    const tags = result.rows;

    const count = await (await db.query(`SELECT COUNT(*) as total_results FROM tag ${search};`, [])).rows[0];

    return {
      results: tags,
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
 * Get tag by id
 * @param {string} id
 * @returns {Promise<ITagDoc|null>}
 */
export const getTagById = async (id: string): Promise<ITagDoc | null> => {
  const tag = await (async () => {
    try {
      const result = await db.query(`SELECT * FROM tag WHERE tag_id = $1;`, [id]);
      return result.rows[0];
    } catch {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
    }
  })();

  if (!tag) throw new ApiError(httpStatus.NOT_FOUND, 'tag not found');

  return tag;
};

/**
 * Update tag by id
 * @param {string} id
 * @param {Partial<ITag>} updateBody
 * @returns {Promise<ITagDoc|null>}
 */
export const updateTagById = async (id: string, updateBody: Partial<ITag>): Promise<ITagDoc | null> => {
  await getTagById(id); // check if tag exists, throws error if not found

  // build sql conditions and values
  const conditions: string[] = [];
  const values: (string | null)[] = [];
  Object.entries(updateBody).map(([k, v], index) => {
    conditions.push(`${k} = $${index + 2}`);
    values.push(v);
    return null;
  });

  // update tag
  try {
    const updateQry = await db.query(
      `
        UPDATE tag SET
        ${conditions.filter(Boolean).join(',')}
        WHERE tag_id = $1 RETURNING *;
      `,
      [id, ...values]
    );
    const tag = updateQry.rows[0];
    return tag;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
  }
};

/**
 * Delete tag by id
 * @param {string} id
 * @returns {Promise<ITagDoc|null>}
 */
export const deleteTagById = async (id: string): Promise<ITagDoc | null> => {
  const tag = await getTagById(id); // check if tag exists, throws error if not found

  try {
    await db.query(`DELETE FROM tag WHERE tag_id = $1;`, [id]);
    await db.query(`CALL remove_tag_references($1);`, [id]); // remove this tag from everywhere it is used
    return tag;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
  }
};
