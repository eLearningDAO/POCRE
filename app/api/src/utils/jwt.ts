import jwt from 'jsonwebtoken';
import moment from 'moment';
import config from '../config/config';

/**
 * Encode a payload as jwt
 * @param {string} sub
 * @returns {string}
 */
export const encode = (sub: string): string => {
  return jwt.sign({ sub, iat: moment().unix() }, config.jwt.secret);
};

/**
 * Decodes a jwt encoded payload
 * @param {string} token
 * @returns {string}
 */
export const decode = (token: string): string => {
  const payload = jwt.verify(token, config.jwt.secret);
  return (typeof payload.sub === 'function' ? payload?.sub() : payload.sub) as string;
};
