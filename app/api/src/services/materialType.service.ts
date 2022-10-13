import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import * as db from '../db/pool';

interface IMaterialType {
  type_name: string;
  type_description: string;
}
interface IMaterialTypeDoc {
  type_id: string;
  type_name: string;
  type_description: string;
}

/**
 * Create a material type
 * @param {IMaterialType} materialTypeBody
 * @returns {Promise<IMaterialTypeDoc>}
 */
export const createMaterialType = async (materialTypeBody: IMaterialType): Promise<IMaterialTypeDoc> => {
  try {
    const result = await db.query(`INSERT INTO material_type (type_name,type_description) values ($1,$2) RETURNING *;`, [
      materialTypeBody.type_name,
      materialTypeBody.type_description,
    ]);
    const materialType = result.rows[0];
    return materialType;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
  }
};

/**
 * Get a material type by id
 * @param {string} id
 * @returns {Promise<IMaterialTypeDoc|null>}
 */
export const getMaterialTypeById = async (id: string): Promise<IMaterialTypeDoc | null> => {
  const materialType = await (async () => {
    try {
      const result = await db.query(`SELECT * FROM material_type WHERE type_id = $1;`, [id]);
      return result.rows[0];
    } catch {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
    }
  })();

  if (!materialType) throw new ApiError(httpStatus.NOT_FOUND, 'material type not found');

  return materialType;
};

/**
 * Update material type by id
 * @param {string} id
 * @param {Partial<IMaterialType>} updateBody
 * @returns {Promise<IMaterialTypeDoc|null>}
 */
export const updateMaterialTypeById = async (
  id: string,
  updateBody: Partial<IMaterialType>
): Promise<IMaterialTypeDoc | null> => {
  await getMaterialTypeById(id); // check if material type exists, throws error if not found

  // build sql conditions and values
  const conditions: string[] = [];
  const values: (string | null)[] = [];
  Object.entries(updateBody).map(([k, v], index) => {
    conditions.push(`${k} = $${index + 2}`);
    values.push(v);
    return null;
  });

  // update material type
  try {
    const updateQry = await db.query(
      `
      UPDATE material_type SET
      ${conditions.filter(Boolean).join(',')}
      WHERE type_id = $1 RETURNING *;
    `,
      [id, ...values]
    );
    const materialType = updateQry.rows[0];
    return materialType;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
  }
};

/**
 * Delete material type by id
 * @param {string} id
 * @returns {Promise<IMaterialTypeDoc|null>}
 */
export const deleteMaterialTypeById = async (id: string): Promise<IMaterialTypeDoc | null> => {
  const materialType = await getMaterialTypeById(id); // check if material type exists, throws error if not found

  try {
    await db.query(`DELETE FROM material_type WHERE type_id = $1;`, [id]);
    return materialType;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'internal server error');
  }
};
