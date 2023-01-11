import httpStatus from 'http-status';
import statusTypes from '../constants/statusTypes';
import { populator } from '../db/plugins/populator';
import * as db from '../db/pool';
import { getUserByCriteria,IUser,IUserDoc, updateUserById } from './user.service';
import { getUserJudgedLitigationsCount } from './litigation.service';
import ApiError from '../utils/ApiError';
import supportedMediaTypes from '../constants/supportedMediaTypes';

const types = Object.values(supportedMediaTypes);
type TCreationTypes = typeof types[number];

interface ICreation {
  creation_title: string;
  creation_description?: string;
  creation_link: string;
  creation_type: TCreationTypes;
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
  top_authors?: boolean;
  is_partially_assigned?: boolean;
  is_fully_assigned?: boolean;
  populate?: string | string[];
  is_draft: boolean;
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
  creation_type: TCreationTypes;
  author_id: string;
  tags: string[];
  materials: string[];
  creation_date: string;
  is_draft: boolean;
  is_claimable: boolean;
}

/**
 *  user_name  not allowed to update.
 * @param user
 * @returns number of stars
 */

export const getStar = async (user: Partial<IUserDoc>, user_id?: string) => {
  let id = user_id || user.user_id;
  let creationCount: number = 0;
  let juryMembershipCount: number = 0;
  creationCount = await getAuthorCreationsCount(id)
  juryMembershipCount = await getUserJudgedLitigationsCount(id)
  if (typeof juryMembershipCount === 'number' && juryMembershipCount > 0) return 5;
  else if (user.email_address && user.phone && user.verified_id && creationCount >= 10) {
    return 4;
  } else if (user.email_address && user.phone && creationCount > 0 && creationCount < 10) {
    return 3;
  } else if (user.email_address && user.phone) {
    return 2;
  } else if (user.email_address || user.phone) {
    return 1;
  }
  return 0;
};
/**
 * Check if a creation has duplicate tags
 * @param {string[]} tags
 * @param {string} exclude_creation
 * @returns {Promise<void>}
 */
export const verifyCreationTagDuplicates = async (tags: string[], exclude_creation?: string): Promise<void> => {
  const foundTag = await (async () => {
    try {
      const result = await db.instance.query(
        `SELECT * FROM creation WHERE tags && $1 ${exclude_creation ? 'AND creation_id <> $2' : ''};`,
        [`{${tags.reduce((x, y, index) => `${index === 1 ? `"${x}"` : x},"${y}"`)}}`, exclude_creation].filter(Boolean)
      );
      return result.rows[0];
    } catch {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
    }
  })();

  if (foundTag) throw new ApiError(httpStatus.NOT_FOUND, 'tag already assigned to a creation');
};

export const getAuthorCreationsCount = async (author_id?: string) => {
  const resCreation = await db.instance.query(`SELECT COUNT(*) as total_results FROM creation where author_id = $1;`, [author_id]);
  return parseInt(resCreation.rows[0].total_results);
}
/**
 * Check if a creation has duplicate materials
 * @param {string[]} materials
 * @param {string} exclude_creation
 * @returns {Promise<void>}
 */
export const verifyCreationMaterialDuplicates = async (materials: string[], exclude_creation?: string): Promise<void> => {
  const foundMaterial = await (async () => {
    try {
      const result = await db.instance.query(
        `SELECT * FROM creation WHERE materials && $1 ${exclude_creation ? 'AND creation_id <> $2' : ''};`,
        [`{${materials.reduce((x, y, index) => `${index === 1 ? `"${x}"` : x},"${y}"`)}}`, exclude_creation].filter(Boolean)
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
  const user:Partial<IUserDoc | null> = await getUserByCriteria('user_id',creationBody.author_id,true);
  try {
    const result = await db.instance.query(
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
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) 
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
    // when the updateUserById is called it recalculates the stars
    // recalling it after creation of material
    if(user) await updateUserById(creationBody.author_id,user)
    return creation;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `internal server error`);
  }
};

/**
 * Query for creation
 * @returns {Promise<Array<ICreation>>}
 */
export const queryCreations = async (options: ICreationQuery): Promise<ICreationQueryResult> => {
  try {
    // search
    const search = (() => {
      let baseSearch = '';

      // search fields with search term
      baseSearch =
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

      // search status
      if (options.is_draft === true || options.is_draft === false) {
        baseSearch += `${baseSearch.length > 0 ? ' AND ' : ' WHERE '} is_draft = ${options.is_draft}`;
      }

      return baseSearch;
    })();

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
      topAuthors: {
        query: `SELECT * ${populator({
          tableAlias: 'c',
          fields: typeof options.populate === 'string' ? [options.populate] : options.populate,
        })} FROM creation c where not exists (SELECT creation_id from litigation WHERE creation_id = c.creation_id)  and exists 
        (SELECT user_id, 
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
                        VIEW_users_public_fields u  WHERE 
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
                          DESC)
                ${order} 
                OFFSET $1 LIMIT $2`,
        count: `SELECT COUNT(*) as total_results FROM creation c where not exists (SELECT creation_id from litigation WHERE creation_id = c.creation_id)  and exists 
                (SELECT user_id, 
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
                                VIEW_users_public_fields u  WHERE 
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
                                  DESC)
                        ${order} 
                        OFFSET $1 LIMIT $2`,
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

    const result = await db.instance.query(
      options.top_authors
        ? queryModes.topAuthors.query
        : options.is_trending
        ? queryModes.trending.query
        : options.is_fully_assigned || options.is_partially_assigned
        ? queryModes.assigned.query
        : queryModes.default.query,
      [options.page === 1 ? '0' : (options.page - 1) * options.limit, options.limit]
    );
    const creations = result.rows;

    const count = await (
      await db.instance.query(
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
    is_draft?: boolean;
  }
): Promise<ICreationDoc | null> => {
  const creation = await (async () => {
    try {
      const result = await db.instance.query(
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
        ${options?.is_draft === true || options?.is_draft === false ? `AND is_draft = ${options.is_draft}` : ''}
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
    const updateQry = await db.instance.query(
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
    await db.instance.query(`DELETE FROM creation WHERE creation_id = $1;`, [id]);
    return creation;
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
  }
};
