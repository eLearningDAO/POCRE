import httpStatus from 'http-status';
import moment from 'moment';
import config from '../config/config';
import litigationStatusTypes from '../constants/litigationStatusTypes';
import statusTypes from '../constants/statusTypes';
import { getCreationById, updateCreationById } from '../services/creation.service';
import { getDecisionById } from '../services/decision.service';
import * as litigationService from '../services/litigation.service';
import { getMaterialById, updateMaterialById } from '../services/material.service';
import { createRecognition } from '../services/recognition.service';
import { getReputedUsers, IUserDoc } from '../services/user.service';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';

export const queryLitigations = catchAsync(async (req, res): Promise<void> => {
  const litigation = await litigationService.queryLitigations({
    ...(req.query as any),
    participant_id: (req.user as IUserDoc).user_id,
  });
  res.send(litigation);
});

export const getLitigationById = catchAsync(async (req, res): Promise<void> => {
  const litigation = await litigationService.getLitigationById(req.params.litigation_id, {
    populate: req.query.populate as string | string[],
    participant_id: (req.user as IUserDoc).user_id,
  });
  res.send(litigation);
});

export const createLitigation = catchAsync(async (req, res): Promise<void> => {
  // check if reference docs exist
  const creation = await getCreationById(req.body.creation_id as string, { is_draft: false }); // verify creation, will throw an error if creation not found
  let material;
  if (req.body.material_id) {
    material = await getMaterialById(req.body.material_id as string); // verify material, will throw an error if material not found
  }
  if (req.body.decisions && req.body.decisions.length > 0) {
    await Promise.all(req.body.decisions.map((id: string) => getDecisionById(id))); // verify decisions, will throw an error if any decision is not found
  }

  // auth user is the issuer
  const issuerId = (req.user as IUserDoc).user_id;

  // check if assumed author and issuer are same for creation
  if (!material && creation?.author_id === issuerId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'creation is already owned');
  }

  // check if assumed author and issuer are same for material
  if (material?.author_id === issuerId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'material is already owned');
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
    issuer_id: issuerId,
    winner: issuerId,
    // reconcilation days
    reconcilation_start: moment().toISOString(),
    reconcilation_end: moment().add(config.litigation.reconcilation_days, 'days').toISOString(),
    // voting days (start after reconcilation days)
    voting_start: moment().add(config.litigation.reconcilation_days, 'days').toISOString(),
    voting_end: moment()
      .add(config.litigation.reconcilation_days + config.litigation.voting_days, 'days')
      .toISOString(),
  });

  // make recognitions for litigators
  const recognitions = await (async () => {
    // get valid litigators
    const forbiddenLitigators = [newLitigation.issuer_id];
    if (creation) forbiddenLitigators.push(creation.author_id);
    if (material) forbiddenLitigators.push(material.author_id);
    const randomUserLimit = Math.floor(
      Math.random() * (config.litigators.max - config.litigators.min + 1) + config.litigators.min
    );
    const litigators = await getReputedUsers({ required_users: randomUserLimit, exclude_users: forbiddenLitigators });

    // create recognitions for litigators
    return Promise.all(
      litigators.map(async (user) => {
        // create new recognition
        return createRecognition({
          recognition_by: newLitigation.issuer_id,
          recognition_for: user.user_id,
          status: statusTypes.PENDING,
          status_updated: new Date().toISOString(),
        });
      })
    );
  })();

  // update litigation
  newLitigation.recognitions = recognitions.map((recognition) => recognition.recognition_id);
  await litigationService.updateLitigationById(newLitigation.litigation_id, { recognitions: newLitigation.recognitions });

  // make creation not claimable
  if (!material && creation) await updateCreationById(creation.creation_id, { is_claimable: false });

  // make material not claimable
  if (material) await updateMaterialById(material.material_id, { is_claimable: false });

  res.send(newLitigation);
});

export const deleteLitigationById = catchAsync(async (req, res): Promise<void> => {
  await litigationService.deleteLitigationById(req.params.litigation_id, {
    owner_id: (req.user as IUserDoc).user_id,
  });
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

  // transfer ownership to correct author
  const shouldTransferOwnership =
    req.body.ownership_transferred || req.body.litigation_status === litigationStatusTypes.WITHDRAWN;
  if (shouldTransferOwnership) {
    // transfer material
    if (litigation?.material_id) {
      await updateMaterialById(litigation.material_id, {
        author_id: req.body.litigation_status === litigationStatusTypes.WITHDRAWN ? litigation.issuer_id : winner,
      });
    }

    // transfer creation
    else if (litigation?.creation_id) {
      await updateCreationById(litigation.creation_id, {
        author_id: req.body.litigation_status === litigationStatusTypes.WITHDRAWN ? litigation.issuer_id : winner,
      });
    }
  }

  // update litigation
  const updatedLitigation = await litigationService.updateLitigationById(
    req.params.litigation_id,
    {
      ...req.body,
      winner,
      ownership_transferred: shouldTransferOwnership,
    },
    { participant_id: (req.user as IUserDoc).user_id }
  );
  res.send(updatedLitigation);
});
