import got from 'got';
import httpStatus from 'http-status';
import config from '../config/config';
import ApiError from './ApiError';

interface IObject {
  [fieldName: string]: any;
}

/**
 * Pins json data to ipfs
 * @param {string} json - the json to pin
 * @returns {string} an ipfs hash string
 */
export const pinJSON = async (json: IObject): Promise<string | void> => {
  try {
    const response: any = await got
      .post(config.pinata.urls.json_pin, {
        json,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.pinata.jwt_secret}`,
        },
      })
      .json();

    // make sure we have ipfs hash
    if (!response.IpfsHash) throw new Error();

    return response.IpfsHash;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'failed to pin json');
  }
};

/**
 * Unpins json data from ipfs
 * @param {string} cid - the content identifier hash
 * @returns {boolean} indicates if unpin is successful
 */
export const unpinData = async (cid: string): Promise<boolean> => {
  try {
    const response = await got.delete(`${config.pinata.urls.unpin}/${cid}`, {
      headers: {
        Authorization: `Bearer ${config.pinata.jwt_secret}`,
      },
    });

    // make sure the request is successful
    if (response.body !== 'OK') throw new Error();

    return true;
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'failed to unpin data');
  }
};
