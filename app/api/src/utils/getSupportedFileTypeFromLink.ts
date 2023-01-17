import got from 'got';
import FileType from 'file-type';
import httpStatus from 'http-status';
import ApiError from './ApiError';
import supportedMediaTypes from '../constants/supportedMediaTypes';

const types = Object.values(supportedMediaTypes);
type TLinkValue = typeof types[number];

/**
 * Checks the supported file type from a link
 * @param {string} url - the link to check
 * @returns {string} - image | video | audio | document | pdf
 */
export const getSupportedFileTypeFromLink = async (url: string): Promise<TLinkValue | null> => {
  try {
    // get stream from url
    const stream = got.stream(url);

    // get file type from stream
    const fileType = await FileType.fromStream(stream);

    // if type is null
    if (!fileType) throw new Error(`invalid media link`);

    // if type is pdf
    if (fileType?.ext === supportedMediaTypes.PDF) return supportedMediaTypes.PDF;

    // if type is image, video or audio
    const mediaType: any = fileType?.mime?.split('/')?.[0];
    if ([supportedMediaTypes.IMAGE, supportedMediaTypes.VIDEO, supportedMediaTypes.AUDIO].includes(mediaType)) {
      return mediaType;
    }

    // return document when file type is not detected
    return supportedMediaTypes.DOCUMENT;
  } catch {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `invalid media link`);
  }
};
