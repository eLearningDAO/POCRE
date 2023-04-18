import httpStatus from 'http-status';
import moment from 'moment';
import config from '../config/config';
import publishPlatforms from '../constants/publishPlatforms';
import reputationStarTimeWindows from '../constants/reputationStarTimeWindows';
import statusTypes from '../constants/statusTypes';
import transactionPurposes from '../constants/transactionPurposes';
import * as creationService from '../services/creation.service';
import * as litigationService from '../services/litigation.service';
import { getMaterialById, updateMaterialById } from '../services/material.service';
import { createNotification } from '../services/notification.service';
import { createRecognition } from '../services/recognition.service';
import { getTagById } from '../services/tag.service';
import { getTransactionById } from '../services/transaction.service';
import { getUserByCriteria, IUserDoc } from '../services/user.service';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import { sendMail } from '../utils/email';
import { generateProofOfCreation } from '../utils/generateProofOfCreation';
import { getSupportedFileTypeFromLink } from '../utils/getSupportedFileTypeFromLink';
import { pinJSON, unpinData } from '../utils/ipfs';
import { encode } from '../utils/jwt';

export const queryCreations = catchAsync(async (req, res): Promise<void> => {
  // when req user is requesting their own creations (search_fields has author_id, and query matches auth user id)
  const shouldReturnDraftCreations =
    req.user &&
    req.query.search_fields &&
    req.query.search_fields.length &&
    req.query.search_fields.length > 0 &&
    (req.query?.search_fields as string[]).includes('author_id') &&
    req.query.query === (req.user as IUserDoc).user_id;

  const creation = await creationService.queryCreations({
    ...(req.query as any),
    ...(!shouldReturnDraftCreations && { is_draft: false }),
  });
  res.send(creation);
});

export const getCreationById = catchAsync(async (req, res): Promise<void> => {
  const creation = await creationService.getCreationById(req.params.creation_id, {
    populate: req.query.populate as string | string[],
  });
  res.send(creation);
});

export const getCreationProofById = catchAsync(async (req, res): Promise<void | any> => {
  const creation = await creationService.getCreationById(req.params.creation_id, {
    populate: [
      'author_id',
      'tags',
      'materials',
      'materials.author_id',
      'materials.recognition_id',
      'materials.recognition_id.recognition_by',
      'materials.recognition_id.recognition_for',
    ],
  });

  // proof object
  const creationProof = {
    ...creation,
    published_at: `${
      (config.creation_details_web_base_url as string).endsWith('/')
        ? config.creation_details_web_base_url.slice(0, -1)
        : config.creation_details_web_base_url
    }/${creation?.creation_id}`,
  };

  // when json is required
  if (req.query.format === 'json') return res.send(creationProof);

  // when document/web format is required
  if (req.query.format === 'web') {
    const document = await generateProofOfCreation(creationProof);
    return res.send(document);
  }
});

export const createCreation = catchAsync(async (req, res): Promise<void> => {
  const reqUser = req.user as IUserDoc;
  const reqUserReputation = `${reqUser.reputation_stars || 0}` as unknown as keyof typeof reputationStarTimeWindows;

  // check if reference docs exist
  await Promise.all(req.body.tags.map((id: string) => getTagById(id))); // verify tags, will throw an error if any tag is not found
  if (req.body.materials) await Promise.all(req.body.materials.map((id: string) => getMaterialById(id))); // verify materials, will throw an error if any material is not found

  // get the creation type from link
  const creationType = await getSupportedFileTypeFromLink(req.body.creation_link);

  // make the creation
  const newCreation = await creationService.createCreation({
    ...req.body,
    creation_type: creationType,
    author_id: reqUser.user_id,
    creation_authorship_window: moment()
      .add(
        reputationStarTimeWindows[reqUserReputation].value,
        reputationStarTimeWindows[reqUserReputation].type as 'months' | 'month' | 'days' | 'day'
      )
      .toISOString(),
    is_fully_owned: false,
    is_draft: true,
    is_claimable: true,
  });

  res.send(newCreation);
});

export const deleteCreationById = catchAsync(async (req, res): Promise<void> => {
  // get the creation
  const foundCreation = await creationService.getCreationById(req.params.creation_id, {
    populate: ['materials.recognition_id'],
  });

  // check if the creation has ongoing material recognition process
  if (
    !foundCreation?.is_draft &&
    foundCreation?.materials &&
    foundCreation.materials.length > 0 &&
    foundCreation.materials.filter((x: any) => x?.recognition?.status === statusTypes.PENDING).length > 0
  ) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `creation has ongoing material recognition process`);
  }

  // check if the creation has ongoing litigation process
  const foundLitigation = await litigationService
    .getLitigationByCriteria('creation_id', req.params.creation_id)
    .catch(() => null);
  if (foundLitigation && !foundLitigation.ownership_transferred) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `creation has ongoing litigation process`);
  }

  // delete the creation from ipfs
  if (foundCreation?.ipfs_hash) await unpinData(foundCreation.ipfs_hash as string).catch(() => null);

  // delete the creation from db
  await creationService.deleteCreationById(req.params.creation_id, {
    owner_id: (req.user as IUserDoc).user_id,
  });
  res.send();
});

export const updateCreationById = catchAsync(async (req, res): Promise<void> => {
  const reqUser = req.user as IUserDoc;
  const reqUserReputation = `${reqUser.reputation_stars || 0}` as unknown as keyof typeof reputationStarTimeWindows;

  // check if reference docs exist
  if (req.body.tags) await Promise.all(req.body.tags.map((id: string) => getTagById(id))); // verify tags, will throw an error if any tag is not found
  if (req.body.materials && req.body.materials.length > 0) {
    await Promise.all(req.body.materials.map((id: string) => getMaterialById(id))); // verify materials, will throw an error if any material is not found
  }

  // get original creation
  const foundCreation = await creationService.getCreationById(req.params.creation_id);

  // block update if creation is published
  if (!foundCreation?.is_draft) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `published creation cannot be updated`);
  }

  // get the creation type from link
  const creationType = req.body.creation_link
    ? await getSupportedFileTypeFromLink(req.body.creation_link)
    : foundCreation.creation_type;

  // update creation
  const updatedCreation = await creationService.updateCreationById(
    req.params.creation_id,
    {
      ...req.body,
      creation_type: creationType,
      creation_authorship_window: moment()
        .add(
          reputationStarTimeWindows[reqUserReputation].value,
          reputationStarTimeWindows[reqUserReputation].type as 'months' | 'month' | 'days' | 'day'
        )
        .toISOString(),
    },
    {
      owner_id: reqUser.user_id,
    }
  );

  res.send(updatedCreation);
});

export const publishCreation = catchAsync(async (req, res): Promise<void> => {
  const reqUser = req.user as IUserDoc;

  // get original creation
  const foundCreation = await creationService.getCreationById(req.params.creation_id, {
    owner_id: reqUser.user_id,
  });

  const updateBody = await (async () => {
    // remove from draft and upload to ipfs (assuming the 'publish_creation' transaction is now validated)
    if (req.body.publish_on === publishPlatforms.IPFS) {
      const tempUpdateBody = { is_draft: false };

      // prepare creation json
      const jsonForIPFS: any = { ...foundCreation, ...tempUpdateBody };
      delete jsonForIPFS.ipfs_hash;

      // store on ipfs
      const hash = await pinJSON(jsonForIPFS).catch(() => null);
      if (!hash) throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `failed to upload creation to ipfs`);

      // send recognitions to material authors since the creation is now published
      if (foundCreation && foundCreation.materials.length > 0) {
        // get all materials
        // eslint-disable-next-line @typescript-eslint/return-await
        const materials = await Promise.all(foundCreation.materials.map(async (id: string) => await getMaterialById(id)));

        await Promise.all(
          materials.map(async (m: any) => {
            const foundAuthor = await getUserByCriteria('user_id', m.author_id, true);
            // send invitation emails to new authors
            if (foundAuthor && foundAuthor.is_invited && foundAuthor.email_address) {
              await sendMail({
                to: foundAuthor?.email_address as string,
                subject: `Invitation to recognize authorship of "${m.material_title}"`,
                message: `You were recognized as author of "${m.material_title}" by ${
                  (req.user as IUserDoc)?.user_name
                }. Please signup on ${config.web_client_base_url}/signup?token=${encode(
                  foundAuthor.user_id
                )} to be recognized as the author.`,
              }).catch(() => null);
            }
            // send notification to old authors
            await createNotification({
              "notification_title": `New Invitation for "${m.material_title}`,
              "notification_description": `You were recognized as author of "${m.material_title}" by ${
                (req.user as IUserDoc)?.user_name
              }.`,
              "notification_for":  m.author_id,
              "creation_type":foundCreation.creation_type,
              "creation_link":foundCreation.creation_link,
              "notification_link":"/creations/"+foundCreation.creation_id,
              "status": "unread"
            })
            // send recognition
            const recognition = await createRecognition({
              recognition_for: m.author_id,
              recognition_by: (req.user as IUserDoc).user_id,
              status: 'pending',
              status_updated: new Date().toISOString(),
            });

            // update material with recognition
            await updateMaterialById(m.material_id, {
              recognition_id: recognition.recognition_id,
            });
          })
        );
      }

      return { ipfs_hash: hash, ...tempUpdateBody };
    }

    // set fully owned status (assuming the 'finalize_creation' transaction is now validated)
    if (req.body.publish_on === publishPlatforms.BLOCKCHAIN) {
      return { is_fully_owned: true };
    }
  })();

  // update creation
  const updatedCreation = await creationService.updateCreationById(
    req.params.creation_id,
    { ...(updateBody || {}) },
    {
      owner_id: (req.user as IUserDoc).user_id,
    }
  );

  res.send(updatedCreation);
});

export const registerCreationTransaction = catchAsync(async (req, res): Promise<void> => {
  const reqUser = req.user as IUserDoc;

  // verify transaction, will throw an error if transaction is not found
  const foundTransaction = await getTransactionById(req.body.transaction_id, {
    owner_id: reqUser.user_id,
  });

  // verify creation, will throw an error if creation is not found
  const foundCreation = await creationService.getCreationById(req.params.creation_id, {
    populate: ['transactions'],
    owner_id: reqUser.user_id,
  });

  // check if transaction has correct purposes
  if (
    foundTransaction &&
    !(
      foundTransaction.transaction_purpose === transactionPurposes.FINALIZE_CREATION ||
      foundTransaction.transaction_purpose === transactionPurposes.PUBLISH_CREATION
    )
  ) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `invalid transaction purpose for creation`);
  }

  // check if caw has passed if transaction purpose is to finalize creation
  if (
    foundTransaction &&
    foundTransaction.transaction_purpose === transactionPurposes.FINALIZE_CREATION &&
    foundCreation &&
    moment().isBefore(moment(new Date(foundCreation.creation_authorship_window)))
  ) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `finalization only allowed after creation authorship window`);
  }

  // check if original creation already has this transaction
  if (
    foundCreation &&
    foundCreation.transactions &&
    foundTransaction &&
    foundCreation.transactions.find(
      (x: any) =>
        x.transaction_id === foundTransaction.transaction_id ||
        x.transaction_purpose === foundTransaction.transaction_purpose
    )
  ) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `transaction already registered for creation`);
  }

  // update creation
  const updatedCreation = await creationService.updateCreationById(
    req.params.creation_id,
    { transactions: [...(foundCreation?.transactions || []).map((x: any) => x.transaction_id), req.body.transaction_id] },
    {
      owner_id: (req.user as IUserDoc).user_id,
    }
  );

  res.send(updatedCreation);
});
