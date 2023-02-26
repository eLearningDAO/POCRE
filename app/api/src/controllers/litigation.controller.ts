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

export const createLitigation = catchAsync(async (req, res): Promise<void | any> => {
  // check if reference docs exist
  const creation = await getCreationById(req.body.creation_id as string, { is_draft: false }); // verify creation, will throw an error if creation not found
  const material = req.body.material_id ? await getMaterialById(req.body.material_id as string) : null; // verify material, will throw an error if material not found

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
  const isCAWPassed = creation && moment().isAfter(moment(new Date(creation?.creation_authorship_window)));
  if (!creation?.is_claimable || isCAWPassed) {
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
    assumed_author_response: litigationStatusTypes.PENDING_RESPONSE,
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
    is_draft: req.body.is_draft,
  });

  // when not draft then make associated items non claimable
  if (!req.body.is_draft) {
    // make creation not claimable
    if (!material && creation) {
      await updateCreationById(creation.creation_id, {
        is_claimable: false,
        // add max litigation days to caw window (we want to keep litigation time out of caw time)
        creation_authorship_window: moment(new Date(creation.creation_authorship_window))
          .add(config.litigation.reconcilation_days + config.litigation.voting_days, 'days')
          .toISOString(),
      });
    }

    // make material not claimable
    if (material) await updateMaterialById(material.material_id, { is_claimable: false });
  }

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

  // setup litigation if it remains in draft or just got out of draft (only issuer can update)
  if (
    participantId === litigation.issuer_id &&
    ((litigation.is_draft && req.body.is_draft) || (litigation.is_draft && !req.body.is_draft))
  ) {
    // check if reference docs exist
    const creation = await getCreationById(req.body.creation_id as string, { is_draft: false }); // verify creation, will throw an error if creation not found
    const material = req.body.material_id ? await getMaterialById(req.body.material_id as string) : null; // verify material, will throw an error if material not found

    // check if assumed author and issuer are same for creation
    if (!material && creation?.author_id === litigation.issuer_id) {
      throw new ApiError(httpStatus.NOT_FOUND, 'creation is already owned');
    }

    // check if assumed author and issuer are same for material
    if (material?.author_id === litigation.issuer_id) {
      throw new ApiError(httpStatus.NOT_FOUND, 'material is already owned');
    }

    // check if creation can be claimed
    const isCAWPassed = creation && moment().isAfter(moment(new Date(creation?.creation_authorship_window)));
    if (!creation?.is_claimable || isCAWPassed) {
      throw new ApiError(httpStatus.NOT_FOUND, 'creation is not claimable');
    }

    // check if material can be claimed
    if (material && !material?.is_claimable) {
      throw new ApiError(httpStatus.NOT_FOUND, 'material is not claimable');
    }

    // update litigation
    const updatedLitigation = await litigationService.updateLitigationById(
      req.params.litigation_id,
      {
        litigation_title: req.body.litigation_title || litigation.litigation_title,
        litigation_description: req.body.litigation_description || litigation.litigation_description,
        assumed_author: material ? material.author_id : creation?.author_id,
        ...(litigation.is_draft &&
          !req.body.is_draft && {
            // reconcilation days
            reconcilation_start: moment().toISOString(),
            reconcilation_end: moment().add(config.litigation.reconcilation_days, 'days').toISOString(),
            // voting days (start after reconcilation days)
            voting_start: moment().add(config.litigation.reconcilation_days, 'days').toISOString(),
            voting_end: moment()
              .add(config.litigation.reconcilation_days + config.litigation.voting_days, 'days')
              .toISOString(),
            is_draft: false,
          }),
      },
      { participant_id: participantId }
    );

    // when not draft then make associated items non claimable
    if (!req.body.is_draft) {
      // make creation not claimable
      if (!material && creation) {
        await updateCreationById(creation.creation_id, {
          is_claimable: false,
          // add max litigation days to caw window (we want to keep litigation time out of caw time)
          creation_authorship_window: moment(new Date(creation.creation_authorship_window))
            .add(config.litigation.reconcilation_days + config.litigation.voting_days, 'days')
            .toISOString(),
        });
      }

      // make material not claimable
      if (material) await updateMaterialById(material.material_id, { is_claimable: false });
    }

    res.send(updatedLitigation);
    return;
  }

  // block update if litigation was moved from live to draft
  if (!litigation.is_draft && req.body.is_draft) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `published litigation cannot be drafted`);
  }

  // get the votes if any
  const decisions =
    req.body.decisions && req.body.decisions.length > 0
      ? await Promise.all(
          req.body.decisions.map((id: string) => getDecisionById(id)) // verify decisions, will throw an error if any decision is not found
        )
      : null;

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
    participantId === litigation?.assumed_author &&
    req.body.assumed_author_response === litigationStatusTypes.WITHDRAW_CLAIM; // the assumed author withdrew their claim
  const isToLitigate =
    participantId === litigation?.assumed_author &&
    req.body.assumed_author_response === litigationStatusTypes.START_LITIGATION; // the assumed author decided to litigate
  const isOwnershipAlreadyTransferred = !!litigation?.ownership_transferred;
  const assumedAuthorResponse =
    participantId === litigation?.assumed_author && req.body.assumed_author_response
      ? req.body.assumed_author_response
      : litigation?.assumed_author_response;

  // if not voting phase, block votes
  if (!isVotingPhase && decisions && decisions.length > 0) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `vote only allowed in voting phase`);
  }

  // if assumed author did not respond in reconilate phase, block votes
  if (
    !isReconcilatePhase &&
    litigation.assumed_author_response === litigationStatusTypes.PENDING_RESPONSE &&
    decisions &&
    decisions.length > 0
  ) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `vote only allowed in voting phase`);
  }

  // if not reconcilate phase, block reconcilation
  if (
    !isReconcilatePhase &&
    req.body.assumed_author_response &&
    litigation?.assumed_author_response !== req.body.assumed_author_response
  ) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `reconcilation only allowed in reconcilate phase`);
  }

  // if reconcilate phase, dont allow to change already set reconcilation status
  if (
    isReconcilatePhase &&
    req.body.assumed_author_response &&
    ((litigation?.assumed_author_response === litigationStatusTypes.START_LITIGATION &&
      req.body.assumed_author_response === litigationStatusTypes.WITHDRAW_CLAIM) ||
      (litigation?.assumed_author_response === litigationStatusTypes.WITHDRAW_CLAIM &&
        req.body.assumed_author_response === litigationStatusTypes.START_LITIGATION))
  ) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `cannot change already set reconcilation status`);
  }

  // only allow the claimer to claim
  if (litigation.issuer_id !== participantId && [true, false].includes(req.body.ownership_transferred)) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `litigated item can only be claimed by the litigation issuer`);
  }

  // if litigation was in voting phase and voting is not finised, block issuer from claiming
  if (
    litigation?.assumed_author_response !== litigationStatusTypes.PENDING_RESPONSE &&
    !isVotingDone &&
    [true, false].includes(req.body.ownership_transferred)
  ) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `litigated item can only be claimed after voting phase`);
  }

  // if litigation is in reconcilation phase, block issuer from claiming
  if (isReconcilatePhase && [true, false].includes(req.body.ownership_transferred)) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `litigated item can only be claimed after voting phase`);
  }

  // select jury if required
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
      const validLitigatorIds = await (async () => {
        const { litigators } = config.litigation;
        const requiredUsersLimit = Math.floor(
          Math.random() * (litigators.jury_count.max - litigators.jury_count.min + 1) + litigators.jury_count.min
        );

        // if algo is enabled, find the litigators that match criteria
        const validLitigators = config.litigation.jury_selection_algo_enabled
          ? await getReputedUsers({
              required_users: requiredUsersLimit,
              exclude_users: forbiddenLitigators,
              reputation_stars: litigators.required_stars_for_jury,
            })
          : [];

        // if algo is not enabled OR valid litigators are not enough in number, pick default judges
        const defaultJudges =
          !config.litigation.jury_selection_algo_enabled || validLitigators.length < requiredUsersLimit
            ? await getReputedUsers({
                // if algo is not enabled AND valid litigators are not enough in number
                ...(config.litigation.jury_selection_algo_enabled &&
                  validLitigators.length < requiredUsersLimit && {
                    required_users: requiredUsersLimit - validLitigators.length,
                    exclude_users: [...forbiddenLitigators, ...validLitigators.map((x) => x.user_id)],
                  }),
                // if algo is not enabled
                ...(!config.litigation.jury_selection_algo_enabled && {
                  required_users: requiredUsersLimit,
                  exclude_users: forbiddenLitigators,
                }),
                only_default_judges: true,
              })
            : [];

        const litigatorIds = [...validLitigators.map((x) => x.user_id), ...defaultJudges.map((x) => x.user_id)];

        // verify if there are enough litigators
        if (litigatorIds.length === 0) {
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `not enough jury members`);
        }

        return litigatorIds;
      })();

      // create recognitions for valid litigators
      return Promise.all(
        validLitigatorIds.map(async (id) => {
          // create new recognition
          return createRecognition({
            recognition_by: litigation.issuer_id,
            recognition_for: id,
            status: statusTypes.ACCEPTED, // jury members cannot declined participation
            status_updated: new Date().toISOString(),
          });
        })
      );
    })();

    return tempRecognitions.map((recognition) => recognition.recognition_id);
  })();

  // find reconcilation end date
  const dates = (() => {
    const tempDates = {
      reconcilation_start: litigation.reconcilation_start,
      reconcilation_end: litigation.reconcilation_end,
      voting_start: litigation.voting_start,
      voting_end: litigation.voting_end,
    };

    // if assumed author reconcilated, set reconcilation end to current date
    if (
      req.body.assumed_author_response &&
      [litigationStatusTypes.START_LITIGATION, litigationStatusTypes.WITHDRAW_CLAIM].includes(
        req.body.assumed_author_response
      )
    ) {
      tempDates.reconcilation_end = moment().toISOString();
    }

    // if assumed author reconcilated for litigation
    if (req.body.assumed_author_response && req.body.assumed_author_response === litigationStatusTypes.START_LITIGATION) {
      tempDates.voting_start = moment().toISOString();
      tempDates.voting_end = moment().add(config.litigation.voting_days, 'days').toISOString();
    }

    return tempDates;
  })();

  // find litigation winner
  const winner = (() => {
    if (isWithdrawn && isReconcilatePhase) return litigation?.issuer_id; // if withdrawn in reconcilate phase, the issuer is the winner

    // if assumed author did not respond in reconilate phase, issuer is the winner
    if (
      !isReconcilatePhase &&
      litigation.assumed_author_response === litigationStatusTypes.PENDING_RESPONSE &&
      litigation.issuer_id === participantId &&
      req.body.ownership_transferred === true
    ) {
      return litigation.issuer_id;
    }

    // find new winner based on votes (only in voting phase)
    if (isVotingPhase && decisions && decisions.length > 0) {
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

    // transfer ownership if assumed author did not respond in reconilate phase, and issuer is claiming
    if (
      !isReconcilatePhase &&
      litigation.assumed_author_response === litigationStatusTypes.PENDING_RESPONSE &&
      litigation.issuer_id === participantId &&
      req.body.ownership_transferred === true
    ) {
      tempShouldTransferOwnership = true;
    }

    // allow the issuer to claim authorship after voting phase
    if (
      isVotingDone &&
      !isOwnershipAlreadyTransferred &&
      litigation.issuer_id === participantId &&
      req.body.ownership_transferred === true
    ) {
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
      creation_id: litigation.creation_id,
      material_id: litigation.material_id,
      recognitions: recognitionIds,
      assumed_author_response: assumedAuthorResponse,
      ownership_transferred: isOwnershipAlreadyTransferred,
      ...dates,
      ...(shouldTransferOwnership && { ownership_transferred: true }),
    },
    { participant_id: participantId }
  );
  res.send(updatedLitigation);
});
