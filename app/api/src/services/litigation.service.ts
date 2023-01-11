import httpStatus from 'http-status';
import { DatabaseError } from 'pg';
import ApiError from '../utils/ApiError';
import * as db from '../db/pool';
import { getCreationById } from './creation.service';
import { populator } from '../db/plugins/populator';
import litigationStatusTypes from '../constants/litigationStatusTypes';

const types = Object.values(litigationStatusTypes);
type TLitigationStatusTypes = typeof types[number];

interface ILitigation {
  litigation_title: string;
  litigation_description?: string;
  creation_id: string;
  material_id?: string;
  assumed_author: string;
  issuer_id: string;
  recognitions: string[];
  decisions: string[];
  litigation_start: string;
  litigation_end: string;
  litigation_status: TLitigationStatusTypes;
  winner: string;
  ownership_transferred: boolean;
}
interface ILitigationQuery {
  limit: number;
  page: number;
  query?: string;
  search_fields?: string[];
  ascend_fields: string[];
  descend_fields: string[];
  judged_by?: string;
  populate?: string | string[];
  participant_id?: string;
}
interface ILitigationQueryResult {
  results: Array<ILitigationDoc>;
  total_pages: number;
  total_results: number;
  limit: number;
  page: number;
}
interface ILitigationDoc {
  litigation_id: string;
  litigation_title: string;
  litigation_description: string;
  creation_id: string;
  material_id: string;
  assumed_author: string;
  issuer_id: string;
  recognitions: string[];
  decisions: string[];
  litigation_start: string;
  litigation_end: string;
  litigation_status: TLitigationStatusTypes;
  winner: string;
  ownership_transferred: boolean;
}

/**
 * Check if a creation can be litigated
 * @param {string} creation_id
 * @param {string|undefined} material_id
 * @returns {Promise<void>}
 */
export const verifyLitigationPossibilityForCreation = async (creation_id: string, material_id?: string): Promise<void> => {
  const foundCreation = await getCreationById(creation_id);

  // verify if material belongs to creation (if material id, the litigation is for a single material)
  if (material_id && (foundCreation?.materials.length === 0 || !foundCreation?.materials.includes(material_id))) {
    throw new ApiError(httpStatus.CONFLICT, 'material does not belong to creation');
  }

  // if no material id, litigation is for the whole creation
  if (!material_id) {
    // verify if creation has any materials
    if (foundCreation && foundCreation?.materials.length > 0) {
      throw new ApiError(httpStatus.CONFLICT, 'creation with materials are not allowed to be litigated');
    }

    // verify if litigation/s already exists for creation
    const litigations = await (async () => {
      try {
        const result = await db.instance.query(`SELECT * FROM litigation WHERE creation_id = $1;`, [creation_id]);
        return result.rows;
      } catch {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
      }
    })();
    if (litigations.length > 0) throw new ApiError(httpStatus.CONFLICT, 'creation already assigned to a litigation');
  }
};

export const getUserJudgedLitigations = async (user_id?: string) => {
  const resJury = await db.instance.query(`SELECT 
  COUNT(*) as total_results 
  FROM 
  litigation l WHERE
  EXISTS 
  (
    SELECT 
    recognition_id,
    recognition_for 
    FROM 
    recognition 
    WHERE 
    recognition_for = '${user_id}' 
    AND 
    recognition_id = ANY(l.recognitions)
  )`);
  return parseInt(resJury.rows[0].total_results);
}

/**
 * Check if a litigation has duplicate decisions
 * @param {string[]} decisions
 * @param {string|undefined} exclude_litigation
 * @returns {Promise<void>}
 */
export const verifyLitigationDecisionDuplicates = async (
  decisions: string[],
  exclude_litigation?: string
): Promise<void> => {
  const foundDecision = await (async () => {
    try {
      const result = await db.instance.query(
        `SELECT * FROM litigation WHERE decisions && $1 ${exclude_litigation ? 'AND litigation_id <> $2' : ''};`,
        [`{${decisions.reduce((x, y, index) => `${index === 1 ? `"${x}"` : x},"${y}"`)}}`, exclude_litigation].filter(
          Boolean
        )
      );
      return result.rows[0];
    } catch {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
    }
  })();

  if (foundDecision) throw new ApiError(httpStatus.CONFLICT, 'decision already assigned to a litigation');
};

/**
 * Create a litigation
 * @param {ILitigation} litigationBody
 * @returns {Promise<ILitigationDoc>}
 */
export const createLitigation = async (litigationBody: ILitigation): Promise<ILitigationDoc> => {
  // verify if the creation can be litigated
  await verifyLitigationPossibilityForCreation(litigationBody.creation_id, litigationBody.material_id);

  // verify if decision/s already exist for a litigation, throw error if a decision is found
  if (litigationBody.decisions && litigationBody.decisions.length > 0) {
    await verifyLitigationDecisionDuplicates(litigationBody.decisions);
  }

  try {
    const result = await db.instance.query(
      `INSERT INTO litigation
      (
        litigation_title,
        litigation_description,
        creation_id,
        material_id,
        assumed_author,
        issuer_id,
        recognitions,
        decisions,
        litigation_start,
        litigation_end,
        litigation_status,
        winner
      ) 
      values 
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) 
      RETURNING *;`,
      [
        litigationBody.litigation_title,
        litigationBody.litigation_description,
        litigationBody.creation_id,
        litigationBody.material_id,
        litigationBody.assumed_author,
        litigationBody.issuer_id,
        litigationBody.recognitions,
        litigationBody.decisions,
        litigationBody.litigation_start,
        litigationBody.litigation_end,
        litigationBody.litigation_status,
        litigationBody.winner,
      ]
    );
    const litigation = result.rows[0];

    return litigation;
  } catch (e: unknown) {
    const err = e as DatabaseError;
    if (err.message && err.message.includes('duplicate key')) {
      if (err.message.includes('material_id'))
        throw new ApiError(httpStatus.CONFLICT, `material already assigned to a litigation`);
    }

    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `internal server error`);
  }
};

/**
 * Query for litigation
 * @returns {Promise<Array<ILitigation>>}
 */
export const queryLitigations = async (options: ILitigationQuery): Promise<ILitigationQueryResult> => {
  try {
    // search
    const search =
      options.search_fields && options.search_fields.length > 0
        ? `WHERE ${options.search_fields
            .map(
              (field) =>
                `${field} ${
                  ['creation_id', 'material_id', 'assumed_author', 'issuer_id', 'winner'].includes(field)
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

    // validate participant
    const validateParticipant =
      options && options.participant_id
        ? `
        (
          issuer_id = '${options.participant_id}' 
          OR 
          assumed_author = '${options.participant_id}'
          OR
          EXISTS
          (
            SELECT 
            recognition_for 
            FROM 
            recognition 
            WHERE 
            recognition_for = '${options.participant_id}'
            AND
            recognition_id = ANY(l.recognitions)
          )
        )
        `
        : '';

    // list of queries
    const queryModes = {
      default: {
        query: `
                SELECT 
                * 
                ${populator({
                  tableAlias: 'l',
                  fields: typeof options.populate === 'string' ? [options.populate] : options.populate,
                })} 
                FROM 
                litigation l 
                ${search} 
                ${search && validateParticipant ? ' AND ' : validateParticipant ? ' WHERE ' : ''} 
                ${validateParticipant}
                ${order} 
                OFFSET $1 
                LIMIT $2;`,
        count: `
                SELECT 
                COUNT(*) 
                as 
                total_results 
                FROM 
                litigation l
                ${search}
                ${search && validateParticipant ? ' AND ' : validateParticipant ? ' WHERE ' : ''}
                ${validateParticipant};`,
      },
      judged: {
        query: `SELECT 
                * 
                ${populator({
                  tableAlias: 'l',
                  fields: typeof options.populate === 'string' ? [options.populate] : options.populate,
                })}
                FROM 
                litigation l 
                ${search} 
                ${search ? ' AND ' : ' WHERE '} 
                EXISTS 
                (
                  SELECT 
                  recognition_id,
                  recognition_for 
                  FROM 
                  recognition 
                  WHERE 
                  recognition_for = '${options.judged_by}' 
                  AND 
                  recognition_id = ANY(l.recognitions)
                ) 
                ${order} 
                OFFSET $1 
                LIMIT $2;`,
        count: `SELECT 
                COUNT(*) as total_results 
                FROM 
                litigation l 
                ${search} 
                ${search ? ' AND ' : ' WHERE '}  
                EXISTS 
                (
                  SELECT 
                  recognition_id,
                  recognition_for 
                  FROM 
                  recognition 
                  WHERE 
                  recognition_for = '${options.judged_by}' 
                  AND 
                  recognition_id = ANY(l.recognitions)
                )`,
      },
    };

    const result = await db.instance.query(options.judged_by ? queryModes.judged.query : queryModes.default.query, [
      options.page === 1 ? '0' : (options.page - 1) * options.limit,
      options.limit,
    ]);
    const litigations = result.rows;

    const count = await (
      await db.instance.query(options.judged_by ? queryModes.judged.count : queryModes.default.count, [])
    ).rows[0];

    return {
      results: litigations,
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
 * Get litigation by criteria
 * @param {string} criteria - the criteria to find tag
 * @param {string} equals - the value on which criteria matches
 * @param {string|string[]} options.populate - the list of fields to populate
 * @param {string} options.owner_id - returns the litigation that belongs to owner_id
 * @returns {Promise<ILitigationDoc|null>}
 */
export const getLitigationByCriteria = async (
  criteria: 'litigation_id' | 'creation_id',
  equals: string,
  options?: {
    populate?: string | string[];
    owner_id?: string;
    participant_id?: string;
  }
): Promise<ILitigationDoc | null> => {
  const litigation = await (async () => {
    try {
      const result = await db.instance.query(
        `SELECT 
        * 
        ${populator({
          tableAlias: 'l',
          fields: options ? (typeof options.populate === 'string' ? [options.populate] : options.populate) : [],
        })} 
        FROM 
        litigation l 
        WHERE 
        ${criteria} = $1
        ${options && options.owner_id ? 'AND issuer_id = $2' : ''}
        ${
          options && options.participant_id
            ? `
            AND 
            (
              issuer_id = ${!options.owner_id ? '$2' : '$3'}
              OR 
              assumed_author = ${!options.owner_id ? '$2' : '$3'}
              OR
              EXISTS
              (
                SELECT 
                recognition_for 
                FROM 
                recognition 
                WHERE 
                recognition_for = ${!options.owner_id ? '$2' : '$3'}
                AND
                recognition_id = ANY(l.recognitions)
              )
            )
            `
            : ''
        }
        ;`,
        [
          equals,
          options && options.owner_id ? options.owner_id : false,
          options && options.participant_id ? options.participant_id : false,
        ].filter(Boolean)
      );
      return result.rows[0];
    } catch {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
    }
  })();

  if (!litigation) throw new ApiError(httpStatus.NOT_FOUND, 'litigation not found');

  return litigation;
};

/**
 * Get litigation by id
 * @param {string} id
 * @param {string|string[]} options.populate - the list of fields to populate
 * @param {string} options.owner_id - returns the litigation that belongs to owner_id
 * @returns {Promise<ILitigationDoc|null>}
 */
export const getLitigationById = async (
  id: string,
  options?: {
    populate?: string | string[];
    owner_id?: string;
    participant_id?: string;
  }
): Promise<ILitigationDoc | null> => {
  return getLitigationByCriteria('litigation_id', id, options);
};

/**
 * Update litigation by id
 * @param {string} id
 * @param {Partial<ILitigation>} updateBody
 * @param {object} options - optional config object
 * @param {string} options.owner_id - updates the litigation that belongs to owner_id
 * @returns {Promise<ILitigationDoc|null>}
 */
export const updateLitigationById = async (
  id: string,
  updateBody: Partial<ILitigation>,
  options?: { participant_id?: string }
): Promise<ILitigationDoc | null> => {
  // check if litigation exists, throws error if not found
  const foundLitigation = await getLitigationById(id, { participant_id: options?.participant_id });

  // verify if material belongs to creation of this litigation, else throw error
  if (foundLitigation && updateBody.material_id) {
    await verifyLitigationPossibilityForCreation(foundLitigation.creation_id, updateBody.material_id);
  }

  // verify if decision/s already exist for another litigation, throw error if a decision is found
  if (updateBody.decisions && updateBody.decisions.length > 0) {
    await verifyLitigationDecisionDuplicates(updateBody.decisions, id);
  }

  // build sql conditions and values
  const conditions: string[] = [];
  const values: (string | string[] | null | boolean)[] = [];
  Object.entries(updateBody).map(([k, v], index) => {
    conditions.push(`${k} = $${index + 2}`);
    values.push(v);
    return null;
  });

  // update litigation
  try {
    const updateQry = await db.instance.query(
      `
        UPDATE litigation SET
        ${conditions.filter(Boolean).join(',')}
        WHERE litigation_id = $1 RETURNING *;
      `,
      [id, ...values]
    );
    const litigation = updateQry.rows[0];
    return litigation;
  } catch (e: unknown) {
    const err = e as DatabaseError;
    if (err.message && err.message.includes('duplicate key')) {
      if (err.message.includes('material_id'))
        throw new ApiError(httpStatus.CONFLICT, `material already assigned to a litigation`);
    }

    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `internal server error`);
  }
};

/**
 * Delete litigation by id
 * @param {string} id
 * @param {object} options - optional config object
 * @param {string} options.owner_id - deletes the litigation that belongs to owner_id
 * @returns {Promise<ILitigationDoc|null>}
 */
export const deleteLitigationById = async (id: string, options?: { owner_id?: string }): Promise<ILitigationDoc | null> => {
  // check if litigation exists, throws error if not found
  const litigation = await getLitigationById(id, { owner_id: options?.owner_id });

  try {
    await db.instance.query(`DELETE FROM litigation WHERE litigation_id = $1;`, [id]);
    return litigation;
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
  }
};
