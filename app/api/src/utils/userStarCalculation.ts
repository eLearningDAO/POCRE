import { IUserDoc } from '../services/user.service';
import * as db from '../db/pool';

/**
 *  user_name  not allowed to update.
 * @param user
 * @returns number of stars
 */

export const getStar = async (user: Partial<IUserDoc>) => {
  const resultCreations = await db.instance.query(
    `SELECT COUNT(*) as total_results FROM creation where author_id=${user.user_id};`
  );
  const resultJury = await db.instance.query(`SELECT 
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
    recognition_for = '${user.user_id}' 
    AND 
    recognition_id = ANY(l.recognitions)
  )`);
  let creationCount: number = 0;
  if (typeof resultCreations === 'number') creationCount = resultCreations;
  if (typeof resultJury === 'number' && resultJury > 0) return 5;
  else if (user.email_address && user.phone && user.verified_id && creationCount > 1 && creationCount < 10) {
    return 4;
  } else if (user.email_address && user.phone && user.verified_id) {
    return 4;
  } else if (user.email_address && user.phone) {
    return 2;
  } else if (user.email_address || user.phone) {
    return 1;
  }
  return 0;
};
