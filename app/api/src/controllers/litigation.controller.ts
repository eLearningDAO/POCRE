import httpStatus from 'http-status';
import moment from 'moment';
import config from '../config/config';
import litigationStatusTypes from '../constants/litigationStatusTypes';
import statusTypes from '../constants/statusTypes';
import transactionPurposes from '../constants/transactionPurposes';
import { getCreationById, updateCreationById } from '../services/creation.service';
import { getDecisionById } from '../services/decision.service';
import * as litigationService from '../services/litigation.service';
import { getMaterialById, updateMaterialById } from '../services/material.service';
import { createRecognition } from '../services/recognition.service';
import { getTransactionById } from '../services/transaction.service';
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
  if ((material && !material?.is_claimable) || isCAWPassed || (creation.is_draft && material)) {
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

  // update litigation
  const updatedLitigation = await litigationService.updateLitigationById(
    req.params.litigation_id,
    {
      ...req.body,
      winner: litigation.issuer_id,
      creation_id: litigation.creation_id,
      material_id: litigation.material_id,
    },
    { participant_id: participantId }
  );
  res.send(updatedLitigation);
});

export const respondToLitigationById = catchAsync(async (req, res): Promise<void> => {
  const assumedAuthorId = (req.user as IUserDoc).user_id; // get req user id

  // get the litigation
  const litigation: any = await litigationService.getLitigationById(req.params.litigation_id, {
    participant_id: assumedAuthorId,
    populate: ['transactions'],
  });

  // verify transaction, will throw an error if transaction not found
  const foundExistingTransaction = req.body.transaction_id
    ? await getTransactionById(req.body.transaction_id, {
        owner_id: assumedAuthorId,
      })
    : null;

  // check if transaction has correct purpose
  if (foundExistingTransaction && foundExistingTransaction.transaction_purpose !== transactionPurposes.START_LITIGATION) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `invalid transaction purpose for litigation`);
  }

  // verify if another 'start_litigation' transaction exists for this litigation
  const hasSimilarTransaction = (litigation.transactions || []).find(
    (x: any) =>
      foundExistingTransaction &&
      x.transaction_id !== foundExistingTransaction.transaction_id &&
      x.transaction_purpose === transactionPurposes.START_LITIGATION
  );
  if (hasSimilarTransaction) throw new ApiError(httpStatus.NOT_ACCEPTABLE, `transaction already registered for litigation`);

  // throw error if litigation is in draft
  if (litigation.is_draft) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `litigation not found`);
  }

  // only allow the assumed author to respond
  if (litigation.issuer_id !== assumedAuthorId) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `only assumed author can respond to litigated item`);
  }

  // check if not already responded to this litigation
  if (litigation.assumed_author_response !== litigationStatusTypes.PENDING_RESPONSE) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `already responded to this litigation`);
  }

  // calculate litigation phases/flags
  const now = moment();
  const toDate = (date: string) => new Date(date);
  const isReconcilatePhase =
    moment(toDate(litigation?.reconcilation_start)).isBefore(now) &&
    moment(toDate(litigation?.reconcilation_end)).isAfter(now);
  const isWithdrawn = req.body.assumed_author_response === litigationStatusTypes.WITHDRAW_CLAIM; // the assumed author withdrew their claim
  const isOwnershipAlreadyTransferred = !!litigation?.ownership_transferred;
  const assumedAuthorResponse =
    assumedAuthorId === litigation?.assumed_author && req.body.assumed_author_response
      ? req.body.assumed_author_response
      : litigation?.assumed_author_response;

  // if not reconcilate phase, block reconcilation
  if (!isReconcilatePhase) {
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

  // verify if the transaction verification is pending for started litigation
  if (
    foundExistingTransaction &&
    !foundExistingTransaction.is_validated &&
    req.body.assumed_author_response === litigationStatusTypes.START_LITIGATION
  ) {
    // update litigation and wait for transaction success
    const updatedLitigation = await litigationService.updateLitigationById(
      req.params.litigation_id,
      {
        ...req.body,
        transactions: [
          ...(litigation.transactions || []).map((x: any) => x.transaction_id),
          foundExistingTransaction.transaction_id,
        ],
      },
      { participant_id: assumedAuthorId }
    );
    res.send(updatedLitigation);
    return;
  }

  // select jury if required
  const recognitionIds = await (async () => {
    // if litigation is not required then dont make jury recognitions
    if (req.body.assumed_author_response === litigationStatusTypes.WITHDRAW_CLAIM) return litigation.recognitions;

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

    // if assumed author voted to start litigation
    if (req.body.assumed_author_response && req.body.assumed_author_response === litigationStatusTypes.START_LITIGATION) {
      tempDates.voting_start = moment().toISOString();
      tempDates.voting_end = moment().add(config.litigation.voting_days, 'days').toISOString();
    }

    return tempDates;
  })();

  // check if ownership needs to be transferred
  const shouldTransferOwnership = isWithdrawn && isReconcilatePhase && !isOwnershipAlreadyTransferred;

  // transfer ownership to correct author
  if (shouldTransferOwnership) {
    if (litigation?.material_id) {
      // if there is material, only transfer material
      await updateMaterialById(litigation?.material_id, { author_id: litigation.issuer_id });
    } else if (litigation?.creation_id) {
      // else transfer creation
      await updateCreationById(litigation?.creation_id, { author_id: litigation.issuer_id });
    }
  }

  // update caw time window based on assumed author response
  await (async () => {
    if (litigation.material_id) return; // only update creation caw if litigation has no material

    const creation: any = await getCreationById(litigation.creation_id);

    let newCAW = moment(new Date(creation?.creation_authorship_window));

    // new reconcilation days (the total days from litigation reconcilation start until today)
    const totalReconcilationDays = moment().diff(moment(new Date(litigation.reconcilation_start)), 'days');

    // if assumed author withdrew claim - remove old reconcilation + voting days and add new total days for reconcilation
    if (
      req.body.assumed_author_response &&
      req.body.assumed_author_response === litigationStatusTypes.WITHDRAW_CLAIM &&
      litigation.assumed_author_response !== litigationStatusTypes.WITHDRAW_CLAIM
    ) {
      newCAW = newCAW
        .subtract(config.litigation.voting_days + config.litigation.reconcilation_days, 'days')
        .add(totalReconcilationDays, 'days');
    }

    // if assumed author voted to start litigation - remove old reconcilation days and add new total days for reconcilation
    if (
      req.body.assumed_author_response &&
      req.body.assumed_author_response === litigationStatusTypes.START_LITIGATION &&
      litigation.assumed_author_response !== litigationStatusTypes.START_LITIGATION
    ) {
      newCAW = newCAW.subtract(config.litigation.reconcilation_days, 'days').add(totalReconcilationDays, 'days');
    }

    await updateCreationById(creation?.creation_id, {
      creation_authorship_window: newCAW.toISOString(),
    });
  })();

  // update litigation
  const updatedLitigation = await litigationService.updateLitigationById(
    req.params.litigation_id,
    {
      ...req.body,
      winner:
        req.body.assumed_author_response === litigationStatusTypes.WITHDRAW_CLAIM ? litigation.issuer_id : litigation.winner,
      recognitions: recognitionIds,
      assumed_author_response: assumedAuthorResponse,
      ...dates,
      ...(shouldTransferOwnership && { ownership_transferred: true }),
    },
    { participant_id: assumedAuthorId }
  );
  res.send(updatedLitigation);
});

export const voteOnLitigationById = catchAsync(async (req, res): Promise<void> => {
  const voterId = (req.user as IUserDoc).user_id; // get req user id

  // verify litigation, will throw an error if litigation not found
  const litigation: any = await litigationService.getLitigationById(req.params.litigation_id, {
    participant_id: voterId,
    populate: ['recognitions', 'decisions'],
  });

  // verify decision, will throw an error if decision not found
  const decision = await getDecisionById(req.body.decision_id, {
    owner_id: voterId,
  });

  // throw error if litigation is in draft
  if (litigation.is_draft) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `litigation not found`);
  }

  // only allow a jury member to vote
  if (!(litigation?.recognitions || []).find((x: any) => x.recognition_for === voterId)) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `only a jury member can vote on a litigation`);
  }

  // check if this decision already exists or this voter already has a decision
  const foundExistingDecision = (litigation.decisions || []).find(
    (x: any) => x.decision_id === decision?.decision_id || x.maker_id === voterId
  );
  if (foundExistingDecision) throw new ApiError(httpStatus.NOT_ACCEPTABLE, `already voted on this litigation`);

  // calculate litigation phases/flags
  const now = moment();
  const toDate = (date: string) => new Date(date);
  const isReconcilatePhase =
    moment(toDate(litigation?.reconcilation_start)).isBefore(now) &&
    moment(toDate(litigation?.reconcilation_end)).isAfter(now);
  const isVotingPhase =
    moment(toDate(litigation?.voting_start)).isBefore(now) && moment(toDate(litigation?.voting_end)).isAfter(now);

  if (
    // if not voting phase, block votes
    !isVotingPhase ||
    // if assumed author did not respond in reconilate phase, block votes
    (!isReconcilatePhase && litigation.assumed_author_response === litigationStatusTypes.PENDING_RESPONSE)
  ) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `vote only allowed in voting phase`);
  }

  // agregate decisions
  const decisions = [...(litigation.decisions || []), decision];

  // find litigation winner
  const winner = (() => {
    // find new winner based on votes (only in voting phase)
    const votes = {
      agreed: decisions.filter((x: any) => x.decision_status === true).length,
      opposed: decisions.filter((x: any) => x.decision_status === false).length,
    };

    return votes.agreed > votes.opposed ? litigation?.issuer_id : litigation?.assumed_author;
  })();

  // update litigation
  const updatedLitigation = await litigationService.updateLitigationById(
    req.params.litigation_id,
    {
      decisions,
      winner,
    },
    { participant_id: voterId }
  );
  res.send(updatedLitigation);
});

export const claimLitigatedItemOwnershipById = catchAsync(async (req, res): Promise<void> => {
  const issuerId = (req.user as IUserDoc).user_id; // get req user id

  // get the litigation
  const litigation: any = await litigationService.getLitigationById(req.params.litigation_id, {
    participant_id: issuerId,
    populate: ['transactions'],
  });

  // verify transaction, will throw an error if transaction is not found
  const foundTransaction = await getTransactionById(req.body.transaction_id, {
    owner_id: issuerId,
  });

  // check if transaction has correct purpose
  if (foundTransaction && foundTransaction.transaction_purpose !== transactionPurposes.REDEEM_LITIGATED_ITEM) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `invalid transaction purpose for litigation`);
  }

  // verify if another 'redeem_litigation' transaction exists for this litigation
  const hasSimilarTransaction = (litigation.transactions || []).find(
    (x: any) =>
      foundTransaction &&
      x.transaction_id !== foundTransaction.transaction_id &&
      x.transaction_purpose === transactionPurposes.REDEEM_LITIGATED_ITEM
  );
  if (hasSimilarTransaction) throw new ApiError(httpStatus.NOT_ACCEPTABLE, `transaction already registered for litigation`);

  // throw error if litigation is in draft
  if (litigation.is_draft) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `litigation not found`);
  }

  // only allow the claimer to claim
  if (litigation.issuer_id !== issuerId) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `litigated item can only be claimed by the litigation issuer`);
  }

  // check if not already redeemed the litigated item
  if (litigation.ownership_transferred) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `already redeemed the litigated item`);
  }

  const now = moment();
  const toDate = (date: string) => new Date(date);
  const isReconcilatePhase =
    moment(toDate(litigation?.reconcilation_start)).isBefore(now) &&
    moment(toDate(litigation?.reconcilation_end)).isAfter(now);
  const isVotingDone = moment(toDate(litigation?.voting_end)).isBefore(now);

  // if litigation was in voting phase and voting is not finised, block issuer from claiming
  if (!isVotingDone && litigation?.assumed_author_response !== litigationStatusTypes.PENDING_RESPONSE) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `litigated item can only be claimed after voting phase`);
  }

  // if litigation is in reconcilation phase, block issuer from claiming
  if (isReconcilatePhase) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `litigated item can only be claimed after voting phase`);
  }

  // if transaction is not verified, update litigation and wait for transaction verification
  if (foundTransaction && !foundTransaction.is_validated) {
    const updatedLitigation = await litigationService.updateLitigationById(
      req.params.litigation_id,
      {
        transactions: [
          ...(litigation.transactions || []).map((x: any) => x.transaction_id),
          foundTransaction.transaction_id,
        ],
      },
      { participant_id: issuerId }
    );
    res.send(updatedLitigation);
    return;
  }

  // transfer ownership to correct author
  if (litigation?.material_id) {
    // if there is material, only transfer material
    await updateMaterialById(litigation?.material_id, { author_id: litigation.issuer_id });
  } else if (litigation?.creation_id) {
    // else transfer creation
    await updateCreationById(litigation?.creation_id, { author_id: litigation.issuer_id });
  }

  // update caw time window based on assumed author response
  await (async () => {
    if (litigation.material_id) return; // only update creation caw if litigation has no material

    const creation: any = await getCreationById(litigation.creation_id);

    let newCAW = moment(new Date(creation?.creation_authorship_window));

    // if assumed author did not respond in reconilate phase, and issuer is claiming, remove the voting days from caw
    if (!isReconcilatePhase && litigation.assumed_author_response === litigationStatusTypes.PENDING_RESPONSE) {
      newCAW = newCAW.subtract(config.litigation.voting_days, 'days');
    }

    await updateCreationById(creation?.creation_id, {
      creation_authorship_window: newCAW.toISOString(),
    });
  })();

  // update litigation
  const updatedLitigation = await litigationService.updateLitigationById(
    req.params.litigation_id,
    {
      winner: litigation.issuer_id,
      ownership_transferred: true,
    },
    { participant_id: issuerId }
  );
  res.send(updatedLitigation);
});
