import httpStatus from 'http-status';
import { DatabaseError } from 'pg';
import ApiError from '../utils/ApiError';
import * as db from '../db/pool';
import { getCreationById } from './creation.service';

interface ILitigation {
  litigation_title: string;
  litigation_description?: string;
  creation_id: string;
  material_id?: string;
  issuer_id: string;
  invitations: string[];
  decisions: string[];
  litigation_start: string;
  litigation_end: string;
  reconcilate: boolean;
}
interface ILitigationQuery {
  limit: number;
  page: number;
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
  issuer_id: string;
  invitations: string[];
  decisions: string[];
  litigation_start: string;
  litigation_end: string;
  reconcilate: boolean;
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
        const result = await db.query(`SELECT * FROM litigation WHERE creation_id = $1;`, [creation_id]);
        return result.rows;
      } catch {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
      }
    })();
    if (litigations.length > 0) throw new ApiError(httpStatus.CONFLICT, 'creation already assigned to a litigation');
  }
};

/**
 * Check if a litigation has duplicate invitations
 * @param {string[]} invitations
 * @param {string|undefined} exclude_litigation
 * @returns {Promise<void>}
 */
export const verifyLitigationInvitationDuplicates = async (
  invitations: string[],
  exclude_litigation?: string
): Promise<void> => {
  const foundInvitation = await (async () => {
    try {
      const result = exclude_litigation
        ? await db.query(
            `SELECT * FROM litigation WHERE litigation_id <> $1 AND invitations && '{${invitations.reduce(
              (x, y, index) => `${index === 1 ? `"${x}"` : x},"${y}"`
            )}}';`,
            [exclude_litigation]
          )
        : await db.query(
            `SELECT * FROM litigation WHERE invitations && '{${invitations.reduce(
              (x, y, index) => `${index === 1 ? `"${x}"` : x},"${y}"`
            )}}';`,
            []
          );
      return result.rows[0];
    } catch {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
    }
  })();

  if (foundInvitation) throw new ApiError(httpStatus.CONFLICT, 'invitation already assigned to a litigation');
};

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
      const result = exclude_litigation
        ? await db.query(
            `SELECT * FROM litigation WHERE litigation_id <> $1 AND decisions && '{${decisions.reduce(
              (x, y, index) => `${index === 1 ? `"${x}"` : x},"${y}"`
            )}}';`,
            [exclude_litigation]
          )
        : await db.query(
            `SELECT * FROM litigation WHERE decisions && '{${decisions.reduce(
              (x, y, index) => `${index === 1 ? `"${x}"` : x},"${y}"`
            )}}';`,
            []
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

  // verify if invitation/s already exist for a litigation, throw error if a invitation is found
  if (litigationBody.invitations && litigationBody.invitations.length > 0) {
    await verifyLitigationInvitationDuplicates(litigationBody.invitations);
  }

  // verify if decision/s already exist for a litigation, throw error if a decision is found
  if (litigationBody.decisions && litigationBody.decisions.length > 0) {
    await verifyLitigationDecisionDuplicates(litigationBody.decisions);
  }

  try {
    const result = await db.query(
      `INSERT INTO litigation
      (
        litigation_title,
        litigation_description,
        creation_id,
        material_id,
        issuer_id,
        invitations,
        decisions,
        litigation_start,
        litigation_end,
        reconcilate
      ) 
      values 
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) 
      RETURNING *;`,
      [
        litigationBody.litigation_title,
        litigationBody.litigation_description,
        litigationBody.creation_id,
        litigationBody.material_id,
        litigationBody.issuer_id,
        litigationBody.invitations,
        litigationBody.decisions,
        litigationBody.litigation_start,
        litigationBody.litigation_end,
        litigationBody.reconcilate,
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
 * @returns {Promise<Array<ILitigation>}
 */
export const queryLitigations = async (
  options: ILitigationQuery = { limit: 10, page: 1 }
): Promise<ILitigationQueryResult> => {
  try {
    const result = await db.query(`SELECT * FROM litigation OFFSET $1 LIMIT $2;`, [
      options.page === 1 ? '0' : (options.page - 1) * options.limit,
      options.limit,
    ]);
    const litigations = result.rows;

    const count = await (await db.query(`SELECT COUNT(*) as total_results FROM litigation;`, [])).rows[0];

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
 * Get litigation by id
 * @param {string} id
 * @returns {Promise<ILitigationDoc|null>}
 */
export const getLitigationById = async (id: string): Promise<ILitigationDoc | null> => {
  const litigation = await (async () => {
    try {
      const result = await db.query(`SELECT * FROM litigation WHERE litigation_id = $1;`, [id]);
      return result.rows[0];
    } catch {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
    }
  })();

  if (!litigation) throw new ApiError(httpStatus.NOT_FOUND, 'litigation not found');

  return litigation;
};

/**
 * Update litigation by id
 * @param {string} id
 * @param {Partial<ILitigation>} updateBody
 * @returns {Promise<ILitigationDoc|null>}
 */
export const updateLitigationById = async (id: string, updateBody: Partial<ILitigation>): Promise<ILitigationDoc | null> => {
  const foundLitigation = await getLitigationById(id); // check if litigation exists, throws error if not found

  // verify if material belongs to creation of this litigation, else throw error
  if (foundLitigation && updateBody.material_id) {
    await verifyLitigationPossibilityForCreation(foundLitigation.creation_id, updateBody.material_id);
  }

  // verify if invitation/s already exist for another litigation, throw error if a invitation is found
  if (updateBody.invitations && updateBody.invitations.length > 0) {
    await verifyLitigationInvitationDuplicates(updateBody.invitations, id);
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
    const updateQry = await db.query(
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
 * @returns {Promise<ILitigationDoc|null>}
 */
export const deleteLitigationById = async (id: string): Promise<ILitigationDoc | null> => {
  const litigation = await getLitigationById(id); // check if litigation exists, throws error if not found

  try {
    await db.query(`DELETE FROM litigation WHERE litigation_id = $1;`, [id]);
    return litigation;
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
  }
};
