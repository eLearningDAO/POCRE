import catchAsync from '../utils/catchAsync';
import * as materialService from '../services/material.service';
import { IUserDoc, getUserById } from '../services/user.service';
import { getRecognitionById } from '../services/recognition.service';
import { getFileTypeFromLink } from '../utils/getFileTypeFromLink';

export const queryMaterials = catchAsync(async (req, res): Promise<void> => {
  const creation = await materialService.queryMaterials(req.query as any);
  res.send(creation);
});

export const getMaterialById = catchAsync(async (req, res): Promise<void> => {
  const material = await materialService.getMaterialById(req.params.material_id, {
    populate: req.query.populate as string | string[],
  });
  res.send(material);
});

export const createMaterial = catchAsync(async (req, res): Promise<void> => {
  // check if reference docs exist
  if (req.body.recognition_id) await getRecognitionById(req.body.recognition_id as string); // verify recognition, will throw an error if recognition not found
  if (req.body.author_id && req.body.author_id !== (req.user as IUserDoc).user_id) {
    await getUserById(req.body.author_id as string); // verify author id (if present), will throw an error if not found
  }
  const material_type: string | undefined = await getFileTypeFromLink(req.body.material_link);
  if (!material_type) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `invalid file type`);
  }

  const newMaterial = await materialService.createMaterial({
    ...req.body,
    author_id: req.body.author_id || (req.user as IUserDoc).user_id,
    material_type: material_type
  });
  res.send(newMaterial);
});

export const deleteMaterialById = catchAsync(async (req, res): Promise<void> => {
  await materialService.deleteMaterialById(req.params.material_id, {
    owner_id: (req.user as IUserDoc).user_id,
  });
  res.send();
});

export const updateMaterialById = catchAsync(async (req, res): Promise<void> => {
  // check if reference docs exist
  if (req.body.recognition_id) await getRecognitionById(req.body.recognition_id as string); // verify recognition, will throw an error if recognition not found

  const material_type: string | undefined = await getFileTypeFromLink(req.body.material_link);
  if (!material_type) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `invalid file type`);
  }
  const material = await materialService.updateMaterialById(req.params.material_id, { ...req.body, material_type: material_type }, {
    owner_id: (req.user as IUserDoc).user_id,
  });
  res.send(material);
});
