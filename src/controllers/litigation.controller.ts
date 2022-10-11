import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import * as litigationService from '../services/litigation.service';
import { getUserById, getReputedUsers } from '../services/user.service';
import { getMaterialById, updateMaterialById } from '../services/material.service';
import { createInvitation } from '../services/invitation.service';
import { getDecisionById } from '../services/decision.service';
import { getCreationById, updateCreationById } from '../services/creation.service';
import { createStatus } from '../services/status.service';
import config from '../config/config';
import ApiError from '../utils/ApiError';

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

  // check if creation can be claimed
  if (!creation?.is_claimable) {
    throw new ApiError(httpStatus.NOT_FOUND, 'creation is not claimable');
  }

  // check if material can be claimed
  if (material && !material?.is_claimable) {
    throw new ApiError(httpStatus.NOT_FOUND, 'material is not claimable');
  }

  // create a new litigation
  const newLitigation = await litigationService.createLitigation({
    ...req.body,
    assumed_author: material ? material.author_id : creation?.author_id,
    winner: req.body.issuer_id,
  });

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

  // make creation not claimable
  if (!material && creation) await updateCreationById(creation.creation_id, { is_claimable: false });

  // make material not claimable
  if (material) await updateMaterialById(material.material_id, { is_claimable: false });

  res.send(newLitigation);
});

export const deleteLitigationById = catchAsync(async (req, res): Promise<void> => {
  await litigationService.deleteLitigationById(req.params.litigation_id);
  res.send();
});

export const updateLitigationById = catchAsync(async (req, res): Promise<void> => {
  const litigation = await litigationService.getLitigationById(req.params.litigation_id);
  let winner = litigation?.winner;

  // check if reference docs exist
  if (req.body.decisions && req.body.decisions.length > 0) {
    const decisions = await Promise.all(req.body.decisions.map((id: string) => getDecisionById(id))); // verify decisions, will throw an error if any decision is not found

    // get decision votes
    const votes = {
      agreed: decisions.filter((x) => x.decision_status === true).length,
      opposed: decisions.filter((x) => x.decision_status === false).length,
    };

    // recalculate winner
    winner = votes.agreed > votes.opposed ? litigation?.issuer_id : litigation?.assumed_author;
  }

  // update litigation
  const updatedLitigation = await litigationService.updateLitigationById(req.params.litigation_id, {
    ...req.body,
    winner,
  });
  res.send(updatedLitigation);
});
