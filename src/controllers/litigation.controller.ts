import catchAsync from '../utils/catchAsync';
import * as litigationService from '../services/litigation.service';
import { getUserById, getReputedUsers } from '../services/user.service';
import { getMaterialById } from '../services/material.service';
import { createInvitation } from '../services/invitation.service';
import { getDecisionById } from '../services/decision.service';
import { getCreationById } from '../services/creation.service';
import { createStatus } from '../services/status.service';
import config from '../config/config';

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
  const creation = await getCreationById(req.body.creation_id as string); // verify creation, will throw an error if creation not found
  let material;
  if (req.body.material_id) {
    material = await getMaterialById(req.body.material_id as string); // verify material, will throw an error if material not found
  }
  if (req.body.decisions && req.body.decisions.length > 0) {
    await Promise.all(req.body.decisions.map((id: string) => getDecisionById(id))); // verify decisions, will throw an error if any decision is not found
  }

  // create a new litigation
  const newLitigation = await litigationService.createLitigation(req.body);

  // send invites to litigators
  const invitations = await (async () => {
    // get valid litigators
    const forbiddenLitigators = [newLitigation.issuer_id];
    if (creation) forbiddenLitigators.push(creation.author_id);
    if (material) forbiddenLitigators.push(material.author_id);
    const randomUserLimit = Math.floor(
      Math.random() * (config.litigators.max - config.litigators.min + 1) + config.litigators.min
    );
    const litigators = await getReputedUsers({ required_users: randomUserLimit, exclude_users: forbiddenLitigators });

    // create invitations for litigators
    return Promise.all(
      litigators.map(async (user) => {
        // create new status
        const status = await createStatus({
          status_name: newLitigation.litigation_title,
        });

        // create new invitation
        return createInvitation({
          invite_from: newLitigation.issuer_id,
          invite_to: user.user_id,
          status_id: status.status_id,
        });
      })
    );
  })();

  // update litigation
  newLitigation.invitations = invitations.map((invitation) => invitation.invite_id);
  await litigationService.updateLitigationById(newLitigation.litigation_id, { invitations: newLitigation.invitations });

  res.send(newLitigation);
});

export const deleteLitigationById = catchAsync(async (req, res): Promise<void> => {
  await litigationService.deleteLitigationById(req.params.litigation_id);
  res.send();
});

export const updateLitigationById = catchAsync(async (req, res): Promise<void> => {
  // check if reference docs exist
  if (req.body.decisions && req.body.decisions.length > 0) {
    await Promise.all(req.body.decisions.map((id: string) => getDecisionById(id))); // verify decisions, will throw an error if any decision is not found
  }

  const litigation = await litigationService.updateLitigationById(req.params.litigation_id, req.body);
  res.send(litigation);
});
