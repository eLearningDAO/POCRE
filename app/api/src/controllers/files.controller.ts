import catchAsync from '../utils/catchAsync';
import { getSupportedFileTypeFromLink } from '../utils/getSupportedFileTypeFromLink';

export const getMediaType = catchAsync(async (req, res): Promise<void> => {
  const mediaType = await getSupportedFileTypeFromLink(req.query.link as string);

  res.send({ media_type: mediaType });
});
