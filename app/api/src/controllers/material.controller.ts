import catchAsync from '../utils/catchAsync';
import * as materialService from '../services/material.service';
import { IUserDoc } from '../services/user.service';
import { getRecognitionById } from '../services/recognition.service';

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

  const newMaterial = await materialService.createMaterial({
    ...req.body,
    author_id: (req.user as IUserDoc).user_id,
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

  const material = await materialService.updateMaterialById(req.params.material_id, req.body, {
    owner_id: (req.user as IUserDoc).user_id,
  });
  res.send(material);
});
