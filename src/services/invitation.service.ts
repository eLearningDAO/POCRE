import httpStatus from 'http-status';
import { DatabaseError } from 'pg';
import ApiError from '../utils/ApiError';
import * as db from '../db/pool';

interface IInvitation {
  invite_from: string;
  invite_to: string;
  invite_description?: string;
  status_id: string;
}
interface IInvitationDoc {
  invite_id: string;
  invite_from: string;
  invite_to: string;
  invite_description: string;
  invite_issued: string;
  status_id: string;
}

/**
 * Create an invitation
 * @param {IInvitation} invitationBody
 * @returns {Promise<IInvitationDoc>}
 */
export const createInvitation = async (invitationBody: IInvitation): Promise<IInvitationDoc | void> => {
  try {
    const result = await db.query(
      `INSERT INTO invitation (invite_from,invite_to,invite_description,status_id) values ($1,$2,$3,$4) RETURNING *;`,
      [invitationBody.invite_from, invitationBody.invite_to, invitationBody.invite_description, invitationBody.status_id]
    );
    const invitation = result.rows[0];
    return invitation;
  } catch (e: unknown) {
    const err = e as DatabaseError;
    if (err.message && err.message.includes('duplicate key')) {
      if (err.message.includes('status_id'))
        throw new ApiError(httpStatus.CONFLICT, `status already assigned to an invitation`);
      if (err.message.includes('invite_from')) throw new ApiError(httpStatus.CONFLICT, `user already sent an invitation`);
      if (err.message.includes('invite_to'))
        throw new ApiError(httpStatus.CONFLICT, `user already invited to an invitation`);
    }

    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `internal server error`);
  }
};

/**
 * Get invitation by id
 * @param {string} id
 * @returns {Promise<IInvitationDoc|null>}
 */
export const getInvitationById = async (id: string): Promise<IInvitationDoc | null> => {
  const invitation = await (async () => {
    try {
      const result = await db.query(`SELECT * FROM invitation WHERE invite_id = $1;`, [id]);
      return result.rows[0];
    } catch {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
    }
  })();

  if (!invitation) throw new ApiError(httpStatus.NOT_FOUND, 'invitation not found');

  return invitation;
};

/**
 * Update invitation by id
 * @param {string} id
 * @param {Partial<IInvitation>} updateBody
 * @returns {Promise<IInvitationDoc|null>}
 */
export const updateInvitationById = async (id: string, updateBody: Partial<IInvitation>): Promise<IInvitationDoc | null> => {
  await getInvitationById(id); // check if invitation exists, throws error if not found

  // build sql conditions and values
  const conditions: string[] = [];
  const values: (string | null)[] = [];
  Object.entries(updateBody).map(([k, v], index) => {
    conditions.push(`${k} = $${index + 2}`);
    values.push(v);
    return null;
  });

  // update invitation
  try {
    const updateQry = await db.query(
      `
      UPDATE invitation SET
      ${conditions.filter(Boolean).join(',')}
      WHERE invite_id = $1 RETURNING *;
    `,
      [id, ...values]
    );
    const invitation = updateQry.rows[0];
    return invitation;
  } catch (e: unknown) {
    const err = e as DatabaseError;
    if (err.message && err.message.includes('duplicate key')) {
      if (err.message.includes('status_id'))
        throw new ApiError(httpStatus.CONFLICT, `status already assigned to an invitation`);
      if (err.message.includes('invite_from')) throw new ApiError(httpStatus.CONFLICT, `user already sent an invitation`);
      if (err.message.includes('invite_to'))
        throw new ApiError(httpStatus.CONFLICT, `user already invited to an invitation`);
    }

    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `internal server error`);
  }
};

/**
 * Delete invitation by id
 * @param {string} id
 * @returns {Promise<IInvitationDoc|null>}
 */
export const deleteInvitationById = async (id: string): Promise<IInvitationDoc | null> => {
  const invitation = await getInvitationById(id); // check if invitation exists, throws error if not found

  try {
    await db.query(`DELETE FROM invitation WHERE invite_id = $1;`, [id]);
    return invitation;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
  }
};
