import { IUserDoc } from '../services/user.service';
import { getAuthorCreationsCount } from '../services/creation.service';
import { getUserJudgedLitigations } from '../services/litigation.service';
import * as db from '../db/pool';

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
  juryMembershipCount = await getAuthorCreationsCount(id)
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
