import httpStatus from 'http-status';
import { DatabaseError } from 'pg';
import ApiError from '../utils/ApiError';
import * as db from '../db/pool';
import statusTypes from '../constants/statusTypes';
import materialTypes from '../constants/materialTypes';
import { populator } from '../db/plugins/populator';

const types = Object.values(materialTypes);
type TMaterialType = typeof types[number];

interface IMaterial {
  material_title: string;
  material_description?: string;
  material_link?: string;
  material_type: TMaterialType;
  recognition_id?: string;
  author_id: string;
  is_claimable: boolean;
}
interface IMaterialQuery {
  limit: number;
  page: number;
  query: string;
  search_fields: string[];
  is_recognized: boolean;
  is_claimed: boolean;
  populate?: string | string[];
}
interface IMaterialQueryResult {
  results: Array<IMaterialDoc>;
  total_pages: number;
  total_results: number;
  limit: number;
  page: number;
}
interface IMaterialDoc {
  material_id: string;
  material_title: string;
  material_description: string;
  material_link: string;
  material_type: TMaterialType;
  recognition_id: string;
  author_id: string;
  is_claimable: boolean;
}

/**
 * Create a material
 * @param {IMaterial} materialBody
 * @returns {Promise<IMaterialDoc>}
 */
export const createMaterial = async (materialBody: IMaterial): Promise<IMaterialDoc> => {
  try {
    const result = await db.query(
      `INSERT INTO material (
        material_title,
        material_description,
        material_link,
        material_type,
        recognition_id,
        author_id,
        is_claimable
      ) 
      values 
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7
      ) 
      RETURNING *;`,
      [
        materialBody.material_title,
        materialBody.material_description,
        materialBody.material_link,
        materialBody.material_type,
        materialBody.recognition_id,
        materialBody.author_id,
        materialBody.is_claimable,
      ]
    );
    const material = result.rows[0];
    return material;
  } catch (e: unknown) {
    const err = e as DatabaseError;
    if (err.message && err.message.includes('duplicate key')) {
      if (err.message.includes('recognition_id'))
        throw new ApiError(httpStatus.CONFLICT, `recognition already assigned to a material`);
    }

    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `internal server error`);
  }
};

/**
 * Query for materials
 * @returns {Promise<Array<IMaterial>>}
 */
export const queryMaterials = async (options: IMaterialQuery): Promise<IMaterialQueryResult> => {
  try {
    // search
    const search =
      options.search_fields && options.search_fields.length > 0
        ? `WHERE ${options.search_fields
            .map(
              (field) =>
                `${field} ${['recognition_id'].includes(field) ? `= '${options.query}'` : `LIKE '%${options.query}%'`}`
            )
            .join(' OR ')}`
        : '';

    // list of queries
    const queryModes = {
      default: {
        query: `SELECT * ${populator({
          tableAlias: 'm',
          fields: typeof options.populate === 'string' ? [options.populate] : options.populate,
        })} FROM material m ${search} OFFSET $1 LIMIT $2;`,
        count: `SELECT COUNT(*) as total_results FROM material ${search};`,
      },
      recognizedOrClaimed: {
        query: `SELECT 
                *
                ${populator({
                  tableAlias: 'm',
                  fields: typeof options.populate === 'string' ? [options.populate] : options.populate,
                })}
                FROM
                material m
                ${search} 
                ${search ? ' AND ' : ' WHERE '}
                ${
                  options.is_recognized === true || options.is_recognized === false
                    ? `
                    ${options.is_recognized === true ? '' : `NOT`}
                    EXISTS
                (
                  SELECT 
                  recognition_id 
                  FROM 
                  recognition
                  WHERE
                  recognition.status = '${statusTypes.ACCEPTED}' 
                  AND recognition_id = m.recognition_id
                )`
                    : ''
                }
                ${
                  (options.is_recognized === true || options.is_recognized === false) &&
                  (options.is_claimed === true || options.is_claimed === false)
                    ? ' AND '
                    : ''
                }
                ${
                  options.is_claimed === true || options.is_claimed === false
                    ? `
                    ${options.is_claimed === true ? '' : `NOT`} 
                    EXISTS
                (
                  SELECT 
                  material_id 
                  FROM 
                  litigation 
                  WHERE 
                  material_id = m.material_id
                )
                `
                    : ''
                } OFFSET $1 LIMIT $2;`,
        count: `SELECT 
                COUNT(*) as total_results
                FROM
                material m
                ${search} 
                ${search ? ' AND ' : ' WHERE '}
                ${
                  options.is_recognized === true || options.is_recognized === false
                    ? `
                    ${options.is_recognized === true ? '' : `NOT`}
                    EXISTS
                (
                  SELECT 
                  recognition_id 
                  FROM 
                  recognition
                  WHERE
                  recognition.status = '${statusTypes.ACCEPTED}'
                  AND recognition_id = m.recognition_id
                )`
                    : ''
                }
                ${
                  (options.is_recognized === true || options.is_recognized === false) &&
                  (options.is_claimed === true || options.is_claimed === false)
                    ? ' AND '
                    : ''
                }
                ${
                  options.is_claimed === true || options.is_claimed === false
                    ? `
                    ${options.is_claimed === true ? '' : `NOT`} 
                    EXISTS
                (
                  SELECT 
                  material_id 
                  FROM 
                  litigation 
                  WHERE 
                  material_id = m.material_id
                )
                `
                    : ''
                }`,
      },
    };

    const result = await db.query(
      options.is_recognized === true ||
        options.is_recognized === false ||
        options.is_claimed === true ||
        options.is_claimed === false
        ? queryModes.recognizedOrClaimed.query
        : queryModes.default.query,
      [options.page === 1 ? '0' : (options.page - 1) * options.limit, options.limit]
    );
    const materials = result.rows;

    const count = await (
      await db.query(
        options.is_recognized === true ||
          options.is_recognized === false ||
          options.is_claimed === true ||
          options.is_claimed === false
          ? queryModes.recognizedOrClaimed.count
          : queryModes.default.count,
        []
      )
    ).rows[0];

    return {
      results: materials,
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
 * Get a material by id
 * @param {string} id
 * @param {object} options - optional config object
 * @param {string|string[]} options.populate - the list of fields to populate
 * @param {string} options.owner_id - returns the material that belongs to owner_id
 * @returns {Promise<IMaterialDoc|null>}
 */
export const getMaterialById = async (
  id: string,
  options?: {
    populate?: string | string[];
    owner_id?: string;
  }
): Promise<IMaterialDoc | null> => {
  const material = await (async () => {
    try {
      const result = await db.query(
        `SELECT 
        * 
        ${populator({
          tableAlias: 'm',
          fields: options ? (typeof options.populate === 'string' ? [options.populate] : options.populate) : [],
        })} 
        FROM 
        material m 
        WHERE 
        material_id = $1
        ${options && options.owner_id ? 'AND author_id = $2' : ''}
        ;`,
        [id, options && options.owner_id ? options.owner_id : false].filter(Boolean)
      );
      return result.rows[0];
    } catch {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
    }
  })();

  if (!material) throw new ApiError(httpStatus.NOT_FOUND, 'material not found');

  return material;
};

/**
 * Update material by id
 * @param {string} id
 * @param {Partial<IMaterial>} updateBody
 * @param {object} options - optional config object
 * @param {string} options.owner_id - updates the material that belongs to owner_id
 * @returns {Promise<IMaterialDoc|null>}
 */
export const updateMaterialById = async (
  id: string,
  updateBody: Partial<IMaterial>,
  options?: { owner_id?: string }
): Promise<IMaterialDoc | null> => {
  // check if material exists, throws error if not found
  await getMaterialById(id, { owner_id: options?.owner_id });

  // build sql conditions and values
  const conditions: string[] = [];
  const values: (string | null | boolean)[] = [];
  Object.entries(updateBody).map(([k, v], index) => {
    conditions.push(`${k} = $${index + 2}`);
    values.push(v);
    return null;
  });

  // update material
  try {
    const updateQry = await db.query(
      `
      UPDATE material SET
      ${conditions.filter(Boolean).join(',')}
      WHERE material_id = $1 RETURNING *;
    `,
      [id, ...values]
    );
    const material = updateQry.rows[0];
    return material;
  } catch (e: unknown) {
    const err = e as DatabaseError;
    if (err.message && err.message.includes('duplicate key')) {
      if (err.message.includes('recognition_id'))
        throw new ApiError(httpStatus.CONFLICT, `recognition already assigned to a material`);
    }

    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `internal server error`);
  }
};

/**
 * Update material in bulk
 * @param {string} field - the field to match and update
 * @param {string} existingValue - the present value of field
 * @param {string} updatedValue - the new value of field
 * @returns {Promise<IMaterialDoc|null>}
 */
export const updateMaterialsInBulk = async (
  field: 'author_id',
  existingValue: string,
  updatedValue: string
): Promise<IMaterialDoc[] | null> => {
  try {
    const updateQry = await db.query(`UPDATE material SET ${field} = $1 WHERE ${field} = $2 RETURNING *;`, [
      updatedValue,
      existingValue,
    ]);
    const materials = updateQry.rows;
    return materials;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `internal server error`);
  }
};

/**
 * Delete material by id
 * @param {string} id
 * @param {object} options - optional config object
 * @param {string} options.owner_id - deletes the material that belongs to owner_id
 * @returns {Promise<IMaterialDoc|null>}
 */
export const deleteMaterialById = async (id: string, options?: { owner_id?: string }): Promise<IMaterialDoc | null> => {
  // check if material exists, throws error if not found
  const material = await getMaterialById(id, { owner_id: options?.owner_id });

  try {
    await db.query(`DELETE FROM material WHERE material_id = $1;`, [id]);
    await db.query(`CALL remove_material_references($1);`, [id]); // remove this material from everywhere it is used
    return material;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
  }
};
