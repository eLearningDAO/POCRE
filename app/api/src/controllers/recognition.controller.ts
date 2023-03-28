import httpStatus from 'http-status';
import statusTypes from '../constants/statusTypes';
import * as recognitionService from '../services/recognition.service';
import { getTransactionById } from '../services/transaction.service';
import { getUserById, IUserDoc } from '../services/user.service';
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/ApiError';
import transactionPurposes from '../constants/transactionPurposes';

export const queryRecognitions = catchAsync(async (req, res): Promise<void> => {
  const creation = await recognitionService.queryRecognitions(req.query as any);
  res.send(creation);
});

export const getRecognitionById = catchAsync(async (req, res): Promise<void> => {
  const recognition = await recognitionService.getRecognitionById(req.params.recognition_id, {
    populate: req.query.populate as string | string[],
  });
  res.send(recognition);
});

export const createRecognition = catchAsync(async (req, res): Promise<void> => {
  await getUserById(req.body.recognition_for); // verify user, will throw an error if user not found

  const newRecognition = await recognitionService.createRecognition({
    ...req.body,
    recognition_by: (req.user as IUserDoc).user_id,
  });
  res.send(newRecognition);
});

export const deleteRecognitionById = catchAsync(async (req, res): Promise<void> => {
  await recognitionService.deleteRecognitionById(req.params.recognition_id, {
    owner_id: (req.user as IUserDoc).user_id,
  });
  res.send();
});

export const updateRecognitionById = catchAsync(async (req, res): Promise<void> => {
  const reqUser = req.user as IUserDoc;

  // check if reference docs exist
  if (req.body.recognition_for) await getUserById(req.body.recognition_for); // verify user, will throw an error if user not found

  const recognition = await recognitionService.updateRecognitionById(req.params.recognition_id, req.body, {
    participant_id: reqUser.user_id,
  });
  res.send(recognition);
});

export const respondToRecognition = catchAsync(async (req, res): Promise<void> => {
  const reqUser = req.user as IUserDoc;

  // verify recognition, will throw an error if recognition is not found
  const foundRecognition = await recognitionService.getRecognitionById(req.params.recognition_id);

  // verify transaction, will throw an error if transaction is not found
  const foundTransaction =
    req.body.status === statusTypes.ACCEPTED
      ? await getTransactionById(req.body.transaction_id, {
          owner_id: reqUser.user_id,
        })
      : null;

  // check if transaction has correct purpose
  if (foundTransaction && !(foundTransaction.transaction_purpose === transactionPurposes.ACCEPT_RECOGNITION)) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `invalid transaction purpose for recognition`);
  }

  // check if original recognition already has this transaction
  if (
    foundRecognition &&
    foundRecognition.transaction_id &&
    foundTransaction &&
    foundTransaction.transaction_id !== foundRecognition.transaction_id
  ) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `transaction already registered for recognition`);
  }

  // update recognition
  const recognition = await recognitionService.updateRecognitionById(
    req.params.recognition_id,
    {
      ...req.body,
      status:
        req.body.status === statusTypes.ACCEPTED && !foundTransaction?.is_validated ? statusTypes.PENDING : req.body.status,
    },
    {
      participant_id: reqUser.user_id,
    }
  );

  res.send(recognition);
});
