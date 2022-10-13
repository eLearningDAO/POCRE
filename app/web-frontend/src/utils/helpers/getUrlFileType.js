import videoExtensions from '../constants/videoExtensions';
import imageExtensions from '../constants/imageExtensions';
import audioExtensions from '../constants/audioExtensions';

const getUrlFileType = (fileUrl) => {
  // get extension
  const extension = fileUrl?.split('?')?.[0]?.split('.')?.at(-1);
  if (!extension) return null; // assume its unsupported

  // check if video
  if (videoExtensions.includes(extension)) return 'video';

  // check if image
  if (imageExtensions.includes(extension)) return 'image';

  // check if audio
  if (audioExtensions.includes(extension)) return 'audio';

  // assume its a document
  return 'document';
};

export { getUrlFileType };
