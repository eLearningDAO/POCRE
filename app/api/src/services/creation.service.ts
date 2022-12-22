import httpStatus from 'http-status';
import statusTypes from '../constants/statusTypes';
import { populator } from '../db/plugins/populator';
import * as db from '../db/pool';
import ApiError from '../utils/ApiError';
import materialTypes from '../constants/materialTypes';

const types = Object.values(materialTypes);
type TCreationType = typeof types[number];

interface ICreation {
  creation_title: string;
  creation_description?: string;
  creation_link: string;
  creation_type: TCreationType;
  author_id: string;
  tags: string[];
  materials?: string[];
  creation_date: string;
  is_draft: boolean;
  is_claimable: boolean;
}
interface ICreationQuery {
  limit: number;
  page: number;
  query: string;
  search_fields: string[];
  ascend_fields: string[];
  descend_fields: string[];
  is_trending?: boolean;
  is_partially_assigned?: boolean;
  is_fully_assigned?: boolean;
  populate?: string | string[];
}
interface ICreationQueryResult {
  results: Array<ICreationDoc>;
  total_pages: number;
  total_results: number;
  limit: number;
  page: number;
}
interface ICreationDoc {
  creation_id: string;
  creation_title: string;
  creation_description: string;
  creation_link: string;
  creation_type: TCreationType;
  author_id: string;
  tags: string[];
  materials: string[];
  creation_date: string;
  is_draft: boolean;
  is_claimable: boolean;
}

/**
 * Check if a creation has duplicate tags
 * @param {string[]} tags
 * @param {string} exclude_creation
 * @returns {Promise<void>}
 */
export const verifyCreationTagDuplicates = async (tags: string[], exclude_creation?: string): Promise<void> => {
  const foundTag = await (async () => {
    try {
      const result = exclude_creation
        ? await db.query(
            `SELECT * FROM creation WHERE creation_id <> $1 AND tags && '{${tags.reduce(
              (x, y, index) => `${index === 1 ? `"${x}"` : x},"${y}"`
            )}}';`,
            [exclude_creation]
          )
        : await db.query(
            `SELECT * FROM creation WHERE tags && '{${tags.reduce(
              (x, y, index) => `${index === 1 ? `"${x}"` : x},"${y}"`
            )}}';`,
            []
          );
      return result.rows[0];
    } catch {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
    }
  })();

  if (foundTag) throw new ApiError(httpStatus.NOT_FOUND, 'tag already assigned to a creation');
};

/**
 * Check if a creation has duplicate materials
 * @param {string[]} materials
 * @param {string} exclude_creation
 * @returns {Promise<void>}
 */
export const verifyCreationMaterialDuplicates = async (materials: string[], exclude_creation?: string): Promise<void> => {
  const foundMaterial = await (async () => {
    try {
      const result = exclude_creation
        ? await db.query(
            `SELECT * FROM creation WHERE creation_id <> $1 AND materials && '{${materials.reduce(
              (x, y, index) => `${index === 1 ? `"${x}"` : x},"${y}"`
            )}}';`,
            [exclude_creation]
          )
        : await db.query(
            `SELECT * FROM creation WHERE materials && '{${materials.reduce(
              (x, y, index) => `${index === 1 ? `"${x}"` : x},"${y}"`
            )}}';`,
            []
          );
      return result.rows[0];
    } catch {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
    }
  })();

  if (foundMaterial) throw new ApiError(httpStatus.NOT_FOUND, 'material already assigned to a creation');
};

/**
 * Create a creation
 * @param {ICreation} creationBody
 * @returns {Promise<ICreationDoc>}
 */
export const createCreation = async (creationBody: ICreation): Promise<ICreationDoc> => {
  // verify if material/s already exist for a creation, throw error if a material is found
  if (creationBody.materials) await verifyCreationMaterialDuplicates(creationBody.materials);

  try {
    const result = await db.query(
      `INSERT INTO creation 
      (
        creation_title,
        creation_description,
        creation_link,
        creation_type,
        author_id,
        tags,
        materials,
        creation_date,
        is_draft,
        is_claimable
      ) 
      values 
      ($1,$2,$3,$4,$5,$6,$7,$8,$9) 
      RETURNING *;`,
      [
        creationBody.creation_title,
        creationBody.creation_description,
        creationBody.creation_link,
        creationBody.creation_type,
        creationBody.author_id,
        creationBody.tags,
        creationBody.materials || [],
        creationBody.creation_date,
        creationBody.is_draft,
        creationBody.is_claimable,
      ]
    );
    const creation = result.rows[0];

    return creation;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `internal server error`);
  }
};

/**
 * Query for creation
 * @returns {Promise<Array<ICreation>}
 */
export const queryCreations = async (options: ICreationQuery): Promise<ICreationQueryResult> => {
  try {
    // search
    const search =
      options.search_fields && options.search_fields.length > 0
        ? `WHERE ${options.search_fields
            .map(
              (field) => `
              ${field === 'material_id' ? `'${options.query}'` : field === 'creation_title' ? `LOWER(${field})` : field} ${
                ['author_id'].includes(field)
                  ? `= '${options.query}'`
                  : ['material_id'].includes(field)
                  ? ` = ANY(materials)`
                  : `LIKE ${field === 'creation_title' ? `LOWER('%${options.query}%')` : `'%${options.query}%'`}`
              }
              `
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

    // list of queries
    const queryModes = {
      default: {
        query: `SELECT * ${populator({
          tableAlias: 'c',
          fields: typeof options.populate === 'string' ? [options.populate] : options.populate,
        })} FROM creation c ${search} ${order} OFFSET $1 LIMIT $2;`,
        count: `SELECT COUNT(*) as total_results FROM creation ${search};`,
      },
      trending: {
        // opened creations without any litigation
        query: `SELECT 
                *
                ${populator({
                  tableAlias: 'c',
                  fields: typeof options.populate === 'string' ? [options.populate] : options.populate,
                })} 
                FROM 
                creation c 
                ${search} 
                ${search ? ' AND ' : ' WHERE '} 
                NOT EXISTS 
                (SELECT creation_id from litigation WHERE creation_id = c.creation_id) 
                ${order} 
                OFFSET $1 LIMIT $2`,
        count: `SELECT 
                COUNT(*) as total_results 
                FROM 
                creation c 
                ${search} 
                ${search ? ' AND ' : ' WHERE '} 
                NOT EXISTS 
                (SELECT creation_id from litigation WHERE creation_id = c.creation_id)`,
      },
      assigned: {
        // opened creations that are partially or fully recognized by co-authors
        query: `SELECT 
                * 
                ${populator({
                  tableAlias: 'c',
                  fields: typeof options.populate === 'string' ? [options.populate] : options.populate,
                })} 
                FROM 
                creation c 
                ${search} 
                ${search ? ' AND ' : ' WHERE '} 
                materials <> '{}' 
                AND 
                EXISTS 
                (SELECT 
                material_id 
                FROM 
                  (SELECT 
                    material.material_id, 
                    material.recognition_id, 
                    recognition.status
                    FROM 
                    material 
                    INNER JOIN 
                    recognition 
                    ON 
                    material.recognition_id = recognition.recognition_id
                  ) 
                as material_recognition 
                WHERE 
                material_recognition.status ${
                  options.is_fully_assigned ? `= '${statusTypes.ACCEPTED}'` : `<> '${statusTypes.DECLINED}'`
                } 
                AND 
                material_recognition.material_id = ANY(materials)
                ) 
                ${order} 
                OFFSET $1 LIMIT $2`,
        count: `SELECT 
                COUNT(*) as total_results 
                FROM 
                creation c 
                ${search} 
                ${search ? ' AND ' : ' WHERE '} 
                materials <> '{}' 
                AND 
                EXISTS 
                (
                  SELECT 
                  material_id 
                  FROM 
                  (
                    SELECT 
                    material.material_id, 
                    material.recognition_id, 
                    recognition.status
                    FROM 
                    material 
                    INNER JOIN 
                    recognition ON 
                    material.recognition_id = recognition.recognition_id
                  ) 
                  as 
                  material_recognition 
                  WHERE 
                  material_recognition.status ${
                    options.is_fully_assigned ? `= '${statusTypes.ACCEPTED}'` : `<> '${statusTypes.DECLINED}'`
                  } 
                  AND 
                  material_recognition.material_id = ANY(materials)
                )`,
      },
    };

    const result = await db.query(
      options.is_trending
        ? queryModes.trending.query
        : options.is_fully_assigned || options.is_partially_assigned
        ? queryModes.assigned.query
        : queryModes.default.query,
      [options.page === 1 ? '0' : (options.page - 1) * options.limit, options.limit]
    );
    const creations = result.rows;

    const count = await (
      await db.query(
        options.is_trending
          ? queryModes.trending.count
          : options.is_fully_assigned || options.is_partially_assigned
          ? queryModes.assigned.count
          : queryModes.default.count,
        []
      )
    ).rows[0];

    return {
      results: creations,
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
 * Get creation by id
 * @param {string} id
 * @param {object} options - optional config object
 * @param {string|string[]} options.populate - the list of fields to populate
 * @param {string} options.owner_id - returns the creation that belongs to owner_id
 * @returns {Promise<ICreationDoc|null>}
 */
export const getCreationById = async (
  id: string,
  options?: {
    populate?: string | string[];
    owner_id?: string;
  }
): Promise<ICreationDoc | null> => {
  const creation = await (async () => {
    try {
      const result = await db.query(
        `SELECT 
        * 
        ${populator({
          tableAlias: 'c',
          fields: options ? (typeof options.populate === 'string' ? [options.populate] : options.populate) : [],
        })} 
        FROM 
        creation c 
        WHERE 
        creation_id = $1
        ${options && options.owner_id ? 'AND author_id = $2' : ''}
        ;`,
        [id, options && options.owner_id ? options.owner_id : false].filter(Boolean)
      );
      return result.rows[0];
    } catch {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
    }
  })();

  if (!creation) throw new ApiError(httpStatus.NOT_FOUND, 'creation not found');

  return creation;
};

/**
 * Update creation by id
 * @param {string} id
 * @param {Partial<ICreation>} updateBody
 * @param {object} options - optional config object
 * @param {string} options.owner_id - updates the creation that belongs to owner_id
 * @returns {Promise<ICreationDoc|null>}
 */
export const updateCreationById = async (
  id: string,
  updateBody: Partial<ICreation>,
  options?: { owner_id?: string }
): Promise<ICreationDoc | null> => {
  // check if creation exists, throws error if not found
  await getCreationById(id, { owner_id: options?.owner_id });

  // verify if material/s already exist for another creation, throw error if a material is found
  if (updateBody.materials && updateBody.materials.length > 0) {
    await verifyCreationMaterialDuplicates(updateBody.materials, id);
  }

  // build sql conditions and values
  const conditions: string[] = [];
  const values: (string | string[] | null | boolean)[] = [];
  Object.entries(updateBody).map(([k, v], index) => {
    conditions.push(`${k} = $${index + 2}`);
    values.push(v);
    return null;
  });

  // update creation
  try {
    const updateQry = await db.query(
      `
        UPDATE creation SET
        ${conditions.filter(Boolean).join(',')}
        WHERE creation_id = $1 RETURNING *;
      `,
      [id, ...values]
    );
    const creation = updateQry.rows[0];
    return creation;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `internal server error`);
  }
};

/**
 * Delete creation by id
 * @param {string} id
 * @param {object} options - optional config object
 * @param {string} options.owner_id - deletes the creation that belongs to owner_id
 * @returns {Promise<ICreationDoc|null>}
 */
export const deleteCreationById = async (id: string, options?: { owner_id?: string }): Promise<ICreationDoc | null> => {
  // check if creation exists, throws error if not found
  const creation = await getCreationById(id, { owner_id: options?.owner_id });

  try {
    await db.query(`DELETE FROM creation WHERE creation_id = $1;`, [id]);
    return creation;
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
  }
};
