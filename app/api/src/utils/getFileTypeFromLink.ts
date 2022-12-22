import got from 'got';
import FileType from 'file-type';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';

type LinkValue = string | undefined;

export const getFileTypeFromLink = async (url: string): Promise<LinkValue> => {
    try {
        const stream = got.stream(url);
        const fileType = await FileType.fromStream(stream);
        if(fileType?.ext === "pdf")
        {
            return "pdf";
        }
        const result = fileType?.mime.split('/')[0];
        return result;   
    } catch (error) {
        throw new ApiError(httpStatus.FORBIDDEN, `invalid file type`);
    }  
};