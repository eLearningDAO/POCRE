import catchAsync from '../utils/catchAsync';
import * as litigationService from '../services/litigation.service';
import { getUserById } from '../services/user.service';
import { getMaterialById } from '../services/material.service';
import { getInvitationById } from '../services/invitation.service';
import { getDecisionById } from '../services/decision.service';

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
  await getMaterialById(req.body.material_id as string); // verify material, will throw an error if material not found
  await getUserById(req.body.issuer_id as string); // verify user, will throw an error if user not found
  if (req.body.invitations && req.body.invitations.length > 0) {
    await Promise.all(req.body.invitations.map((id: string) => getInvitationById(id))); // verify invitations, will throw an error if any invitation is not found
  }
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
  if (req.body.material_id) await getMaterialById(req.body.material_id as string); // verify material, will throw an error if material not found
  if (req.body.issuer_id) await getUserById(req.body.issuer_id as string); // verify user, will throw an error if user not found
  if (req.body.invitations && req.body.invitations.length > 0) {
    await Promise.all(req.body.invitations.map((id: string) => getInvitationById(id))); // verify invitations, will throw an error if any invitation is not found
  }
  if (req.body.decisions && req.body.decisions.length > 0) {
    await Promise.all(req.body.decisions.map((id: string) => getDecisionById(id))); // verify decisions, will throw an error if any decision is not found
  }

  const litigation = await litigationService.updateLitigationById(req.params.litigation_id, req.body);
  res.send(litigation);
});
