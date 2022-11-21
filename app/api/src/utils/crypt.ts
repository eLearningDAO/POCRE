import { createHmac } from 'crypto';
import config from '../config/config';

/**
 * Encrypt a payload
 * @param {string} payload
 * @returns {string}
 */
export const encrypt = (payload: string): string => {
  return createHmac('md5', config.hashing_salt.wallet_address).update(payload).digest('hex');
};
