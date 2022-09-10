import httpStatus from 'http-status';
import { DatabaseError } from 'pg';
import ApiError from '../utils/ApiError';
import * as db from '../db/pool';

interface IMaterial {
  material_title: string;
  material_description?: string;
  material_link?: string;
  source_id: string;
  type_id: string;
  invite_id?: string;
  author_id: string;
}
interface IMaterialDoc {
  material_id: string;
  material_title: string;
  material_description: string;
  material_link: string;
  source_id: string;
  type_id: string;
  invite_id: string;
  author_id: string;
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
        source_id,
        type_id,
        invite_id,
        author_id
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
        materialBody.source_id,
        materialBody.type_id,
        materialBody.invite_id,
        materialBody.author_id,
      ]
    );
    const material = result.rows[0];
    return material;
  } catch (e: unknown) {
    const err = e as DatabaseError;
    if (err.message && err.message.includes('duplicate key')) {
      if (err.message.includes('source_id'))
        throw new ApiError(httpStatus.CONFLICT, `source already assigned to a material`);
      if (err.message.includes('author_id'))
        throw new ApiError(httpStatus.CONFLICT, `author already assigned to a material`);
      if (err.message.includes('type_id')) throw new ApiError(httpStatus.CONFLICT, `type already assigned to a material`);
      if (err.message.includes('invite_id'))
        throw new ApiError(httpStatus.CONFLICT, `invitation already assigned to a material`);
    }

    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `internal server error`);
  }
};

/**
 * Get a material by id
 * @param {string} id
 * @returns {Promise<IMaterialDoc|null>}
 */
export const getMaterialById = async (id: string): Promise<IMaterialDoc | null> => {
  const material = await (async () => {
    try {
      const result = await db.query(`SELECT * FROM material WHERE material_id = $1;`, [id]);
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
 * @returns {Promise<IMaterialDoc|null>}
 */
export const updateMaterialById = async (id: string, updateBody: Partial<IMaterial>): Promise<IMaterialDoc | null> => {
  await getMaterialById(id); // check if material exists, throws error if not found

  // build sql conditions and values
  const conditions: string[] = [];
  const values: (string | null)[] = [];
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
      if (err.message.includes('source_id'))
        throw new ApiError(httpStatus.CONFLICT, `source already assigned to a material`);
      if (err.message.includes('author_id'))
        throw new ApiError(httpStatus.CONFLICT, `author already assigned to a material`);
      if (err.message.includes('type_id')) throw new ApiError(httpStatus.CONFLICT, `type already assigned to a material`);
      if (err.message.includes('invite_id'))
        throw new ApiError(httpStatus.CONFLICT, `invitation already assigned to a material`);
    }

    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `internal server error`);
  }
};

/**
 * Delete material by id
 * @param {string} id
 * @returns {Promise<IMaterialDoc|null>}
 */
export const deleteMaterialById = async (id: string): Promise<IMaterialDoc | null> => {
  const material = await getMaterialById(id); // check if material exists, throws error if not found

  try {
    await db.query(`DELETE FROM material WHERE material_id = $1;`, [id]);
    await db.query(`CALL remove_material_references($1);`, [id]); // remove this material from everywhere it is used
    return material;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
  }
};
