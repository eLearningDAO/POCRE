import { IUser } from "../services/user.service";

/**
 *  user_name  not allowed to update.
 * @param user 
 * @returns number of stars
 */

export const getStar = (user: Partial<IUser>) => {
    if (user.email_address && user.phone && user.verified_id) {
        return 4
    }
    else if (user.email_address && user.phone) {
        return 2;
    }
    else if (user.email_address) {
        return 1
    }
    return 0
}