import catchAsync from '../utils/catchAsync';
import * as materialService from '../services/material.service';
import { getSourceById } from '../services/source.service';
import { getUserById } from '../services/user.service';
import { getInvitationById } from '../services/invitation.service';
import { getMaterialTypeById } from '../services/materialType.service';

export const getMaterialById = catchAsync(async (req, res): Promise<void> => {
  const material = await materialService.getMaterialById(req.params.material_id);
  res.send(material);
});

export const createMaterial = catchAsync(async (req, res): Promise<void> => {
  // check if reference docs exist
  await getSourceById(req.body.source_id as string); // verify source, will throw an error if source not found
  await getUserById(req.body.author_id as string); // verify user, will throw an error if user not found
  await getMaterialTypeById(req.body.type_id as string); // verify material type, will throw an error if material type not found
  if (req.body.invite_id) await getInvitationById(req.body.invite_id as string); // verify invitation, will throw an error if invitation not found

  const newMaterial = await materialService.createMaterial(req.body);
  res.send(newMaterial);
});

export const deleteMaterialById = catchAsync(async (req, res): Promise<void> => {
  await materialService.deleteMaterialById(req.params.material_id);
  res.send();
});

export const updateMaterialById = catchAsync(async (req, res): Promise<void> => {
  // check if reference docs exist
  if (req.body.source_id) await getSourceById(req.body.source_id as string); // verify source, will throw an error if source not found
  if (req.body.author_id) await getUserById(req.body.author_id as string); // verify user, will throw an error if user not found
  if (req.body.type_id) await getMaterialTypeById(req.body.type_id as string); // verify material type, will throw an error if material type not found
  if (req.body.invite_id) await getInvitationById(req.body.invite_id as string); // verify invitation, will throw an error if invitation not found

  const material = await materialService.updateMaterialById(req.params.material_id, req.body);
  res.send(material);
});
