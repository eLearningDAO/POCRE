import catchAsync from '../utils/catchAsync';
import * as litigationService from '../services/litigation.service';
import { getUserById } from '../services/user.service';
import { getMaterialById } from '../services/material.service';
import { getDecisionById } from '../services/decision.service';
import { getCreationById } from '../services/creation.service';

export const queryLitigations = catchAsync(async (req, res): Promise<void> => {
  const litigation = await litigationService.queryLitigations(req.query as any);
  res.send(litigation);
});

export const getLitigationById = catchAsync(async (req, res): Promise<void> => {
  const litigation = await litigationService.getLitigationById(req.params.litigation_id);
  res.send(litigation);
});

export const createLitigation = catchAsync(async (req, res): Promise<void> => {
  // check if reference docs exist
  await getUserById(req.body.issuer_id as string); // verify user, will throw an error if user not found
  await getCreationById(req.body.creation_id as string); // verify creation, will throw an error if creation not found
  if (req.body.material_id) await getMaterialById(req.body.material_id as string); // verify material, will throw an error if material not found
  if (req.body.decisions && req.body.decisions.length > 0) {
    await Promise.all(req.body.decisions.map((id: string) => getDecisionById(id))); // verify decisions, will throw an error if any decision is not found
  }

  const newLitigation = await litigationService.createLitigation(req.body);
  res.send(newLitigation);
});

export const deleteLitigationById = catchAsync(async (req, res): Promise<void> => {
  await litigationService.deleteLitigationById(req.params.litigation_id);
  res.send();
});

export const updateLitigationById = catchAsync(async (req, res): Promise<void> => {
  // check if reference docs exist
  if (req.body.issuer_id) await getUserById(req.body.issuer_id as string); // verify user, will throw an error if user not found
  if (req.body.material_id) await getMaterialById(req.body.material_id as string); // verify material, will throw an error if material not found
  if (req.body.decisions && req.body.decisions.length > 0) {
    await Promise.all(req.body.decisions.map((id: string) => getDecisionById(id))); // verify decisions, will throw an error if any decision is not found
  }

  const litigation = await litigationService.updateLitigationById(req.params.litigation_id, req.body);
  res.send(litigation);
});
