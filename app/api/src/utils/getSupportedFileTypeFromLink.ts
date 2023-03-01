import got from 'got';
import FileType from 'file-type';
import httpStatus from 'http-status';
import ApiError from './ApiError';
import supportedMediaTypes from '../constants/supportedMediaTypes';
var http = require('http');

const types = Object.values(supportedMediaTypes);
type TLinkValue = typeof types[number];

/**
 * Checks the supported file type from a link
 * @param {string} url - the link to check
 * @returns {string} - image | video | audio | document | pdf
 */
export const getIdIfYoutubeLink = (url: string) => {
  const urlArray = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  return (urlArray[2] !== undefined) ? urlArray[2].split(/[^0-9a-z_\-]/i)[0] : urlArray[0];
}


export const isValidYoutubeID = async (youtubeID:string) => {
  let options = {
    method: 'HEAD',
    host: 'img.youtube.com',
    path: '/vi/' + youtubeID + '/0.jpg'
  };
  let isValidVideo = false
  var req = await http.request(options, function(res:any) {
    console.log("THis is the fucking res of the youtube vido ", res)
    if (res.statusCode == 200){
      isValidVideo = true
    } else {
      isValidVideo = false
    }
  });
  return isValidVideo
}
export const getSupportedFileTypeFromLink = async (url: string): Promise<TLinkValue | null> => {
  try {
    // get stream from url
    const stream = got.stream(url);

    const youtubeId = getIdIfYoutubeLink(url)

    if(youtubeId)
    {
      console.log("DOes it even comer here afater getting video id")
      let isYoutubeVideo = await isValidYoutubeID(youtubeId)
      console.log("DOes it even comer here afater getting video id",isYoutubeVideo)
      if(typeof isYoutubeVideo === "boolean" && isYoutubeVideo === true)
      {
        return supportedMediaTypes.VIDEO
      }
    }

    console.log("THis is teh youtube id", youtubeId)

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
