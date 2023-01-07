import { IUserDoc } from '../services/user.service';
import * as db from '../db/pool';

/**
 *  user_name  not allowed to update.
 * @param user
 * @returns number of stars
 */

export const getStar = async (user: Partial<IUserDoc>, user_id?: string) => {
  let id = user_id || user.user_id;
  const resCreation = await db.instance.query(`SELECT COUNT(*) as total_results FROM creation where author_id='${id}';`);
  let creationCount: number = 0;
  let juryMembershipCount: number = 0;
  creationCount = parseInt(resCreation.rows[0].total_results);
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
    recognition_for = '${id}' 
    AND 
    recognition_id = ANY(l.recognitions)
  )`);
  juryMembershipCount = parseInt(resJury.rows[0].total_results);
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
