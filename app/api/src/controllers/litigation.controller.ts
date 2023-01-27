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
  const participantId = (req.user as IUserDoc).user_id; // get req user id

  // get the litigation
  const litigation: any = await litigationService.getLitigationById(req.params.litigation_id, {
    participant_id: participantId,
  });

  // get the votes if any
  const decisions = await Promise.all(
    req.body.decisions && req.body.decisions.length > 0
      ? req.body.decisions.map((id: string) => getDecisionById(id)) // verify decisions, will throw an error if any decision is not found
      : null
  );

  // calculate litigation phases/flags
  const now = moment();
  const toDate = (date: string) => new Date(date);
  const isReconcilatePhase =
    moment(toDate(litigation?.reconcilation_start)).isBefore(now) &&
    moment(toDate(litigation?.reconcilation_end)).isAfter(now);
  const isVotingPhase =
    moment(toDate(litigation?.voting_start)).isBefore(now) && moment(toDate(litigation?.voting_end)).isAfter(now);
  const isVotingDone = moment(toDate(litigation?.voting_end)).isBefore(now);
  const isWithdrawn =
    participantId === litigation?.assumed_author && req.body.litigation_status === litigationStatusTypes.WITHDRAWN; // the assumed author withdrew their claim
  const isToLitigate =
    participantId === litigation?.assumed_author && req.body.litigation_status === litigationStatusTypes.WITHDRAWN; // the assumed author decided to litigate
  const isOwnershipAlreadyTransferred = !!litigation?.ownership_transferred;
  const litigationStatus =
    participantId === litigation?.assumed_author ? req.body.litigation_status : litigation?.litigation_status;

  // if not voting phase, block votes
  if (!isVotingPhase && decisions && decisions.length > 0) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `vote only allowed in voting phase`);
  }

  // if not reconcilate phase, block reconcilation
  if (!isReconcilatePhase && litigation?.litigation_status !== req.body.litigation_status) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `reconcilation only allowed in reconcilate phase`);
  }

  // if voting is not finised, block issuer from claiming
  if (!isVotingDone && req.body.ownership_transferred === true) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `litigated item can only be claimed after voting phase`);
  }

  // check if jury needs to be picked
  const recognitionIds = await (async () => {
    // if litigation is not required then dont make jury recognitions
    if (!(isToLitigate && isReconcilatePhase)) return litigation.recognitions;

    // create recognition for jury
    const tempRecognitions = await (async () => {
      // find forbidden litigators
      const forbiddenLitigators = [litigation.issuer_id];

      // add creation author to forbidden litigators
      const creation = await getCreationById(litigation.creation_id);
      if (creation) forbiddenLitigators.push(creation.author_id);

      // add material author to forbidden litigators
      if (litigation.material_id) {
        const material = await getMaterialById(litigation.material_id);
        if (material) forbiddenLitigators.push(material.author_id);
      }

      // find valid litigators
      const randomUserLimit = Math.floor(
        Math.random() * (config.litigators.max - config.litigators.min + 1) + config.litigators.min
      );
      const validLitigators = await getReputedUsers({ required_users: randomUserLimit, exclude_users: forbiddenLitigators });

      // create recognitions for valid litigators
      return Promise.all(
        validLitigators.map(async (user) => {
          // create new recognition
          return createRecognition({
            recognition_by: litigation.issuer_id,
            recognition_for: user.user_id,
            status: statusTypes.ACCEPTED, // jury members cannot declined participation
            status_updated: new Date().toISOString(),
          });
        })
      );
    })();

    return tempRecognitions.map((recognition) => recognition.recognition_id);
  })();

  // find litigation winner
  const winner = (() => {
    if (isWithdrawn && isReconcilatePhase) return litigation?.issuer_id; // if withdrawn in reconcilate phase, the issuer is the winner

    // find new winner based on votes
    if (decisions && decisions.length > 0) {
      const votes = {
        agreed: decisions.filter((x) => x.decision_status === true).length,
        opposed: decisions.filter((x) => x.decision_status === false).length,
      };

      return votes.agreed > votes.opposed ? litigation?.issuer_id : litigation?.assumed_author;
    }

    return litigation?.winner; // return the current winner
  })();

  // check if ownership needs to be transferred
  const shouldTransferOwnership = (() => {
    let tempShouldTransferOwnership = false;

    // transfer ownership if assumed author withdrew their claim in reconcilation phase
    if (isWithdrawn && isReconcilatePhase && !isOwnershipAlreadyTransferred) tempShouldTransferOwnership = true;

    // allow the issuer to claim authorship after voting phase
    if (isVotingDone && !isOwnershipAlreadyTransferred && req.body.ownership_transferred === true) {
      tempShouldTransferOwnership = true;
    }

    return tempShouldTransferOwnership;
  })();

  // transfer ownership to correct author
  if (shouldTransferOwnership) {
    // if there is material, only transfer material
    if (litigation?.material_id) {
      await updateMaterialById(litigation?.material_id, { author_id: winner });
    }

    // else transfer creation
    else if (litigation?.creation_id) {
      await updateCreationById(litigation?.creation_id, { author_id: winner });
    }
  }

  // update litigation
  const updatedLitigation = await litigationService.updateLitigationById(
    req.params.litigation_id,
    {
      ...req.body,
      winner,
      ownership_transferred: isOwnershipAlreadyTransferred,
      litigation_status: litigationStatus,
      ...(shouldTransferOwnership && { ownership_transferred: true }),
      recognitions: recognitionIds,
    },
    { participant_id: (req.user as IUserDoc).user_id }
  );
  res.send(updatedLitigation);
});
