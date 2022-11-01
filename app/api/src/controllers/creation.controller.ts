import catchAsync from '../utils/catchAsync';
import * as creationService from '../services/creation.service';
import { getSourceById } from '../services/source.service';
import { getUserById } from '../services/user.service';
import { getTagById } from '../services/tag.service';
import { getMaterialById } from '../services/material.service';

export const queryCreations = catchAsync(async (req, res): Promise<void> => {
  const creation = await creationService.queryCreations(req.query as any);
  res.send(creation);
});

export const getCreationById = catchAsync(async (req, res): Promise<void> => {
  const creation = await creationService.getCreationById(req.params.creation_id, req.query.populate as string | string[]);
  res.send(creation);
});

export const getCreationProofById = catchAsync(async (req, res): Promise<void> => {
  const creation = await creationService.getCreationProofById(req.params.creation_id);
  res.send(creation);
});

export const createCreation = catchAsync(async (req, res): Promise<void> => {
  // check if reference docs exist
  await getSourceById(req.body.source_id as string); // verify source, will throw an error if source not found
  await getUserById(req.body.author_id as string); // verify user, will throw an error if user not found
  await Promise.all(req.body.tags.map((id: string) => getTagById(id))); // verify tags, will throw an error if any tag is not found
  if (req.body.materials) await Promise.all(req.body.materials.map((id: string) => getMaterialById(id))); // verify materials, will throw an error if any material is not found

  const newCreation = await creationService.createCreation(req.body);
  res.send(newCreation);
});

export const deleteCreationById = catchAsync(async (req, res): Promise<void> => {
  await creationService.deleteCreationById(req.params.creation_id);
  res.send();
});

export const updateCreationById = catchAsync(async (req, res): Promise<void> => {
  // check if reference docs exist
  if (req.body.source_id) await getSourceById(req.body.source_id as string); // verify source, will throw an error if source not found
  if (req.body.author_id) await getUserById(req.body.author_id as string); // verify user, will throw an error if user not found
  if (req.body.tags) await Promise.all(req.body.tags.map((id: string) => getTagById(id))); // verify tags, will throw an error if any tag is not found
  if (req.body.materials && req.body.materials.length > 0) {
    await Promise.all(req.body.materials.map((id: string) => getMaterialById(id))); // verify materials, will throw an error if any material is not found
  }

  const creation = await creationService.updateCreationById(req.params.creation_id, req.body);
  res.send(creation);
});
