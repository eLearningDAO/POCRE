import catchAsync from '../utils/catchAsync';
import * as materialService from '../services/material.service';
import { getSourceById } from '../services/source.service';
import { IUserDoc } from '../services/user.service';
import { getRecognitionById } from '../services/recognition.service';
import { getMaterialTypeById } from '../services/materialType.service';

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
  await getSourceById(req.body.source_id as string); // verify source, will throw an error if source not found
  await getMaterialTypeById(req.body.type_id as string); // verify material type, will throw an error if material type not found
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
  if (req.body.source_id) await getSourceById(req.body.source_id as string); // verify source, will throw an error if source not found
  if (req.body.type_id) await getMaterialTypeById(req.body.type_id as string); // verify material type, will throw an error if material type not found
  if (req.body.recognition_id) await getRecognitionById(req.body.recognition_id as string); // verify recognition, will throw an error if recognition not found

  const material = await materialService.updateMaterialById(req.params.material_id, req.body, {
    owner_id: (req.user as IUserDoc).user_id,
  });
  res.send(material);
});
