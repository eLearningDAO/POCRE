import catchAsync from '../utils/catchAsync';
import * as recognitionService from '../services/recognition.service';
import { getUserById } from '../services/user.service';
import { getStatusById } from '../services/status.service';

export const queryRecognitions = catchAsync(async (req, res): Promise<void> => {
  const creation = await recognitionService.queryRecognitions(req.query as any);
  res.send(creation);
});

export const getRecognitionById = catchAsync(async (req, res): Promise<void> => {
  const recognition = await recognitionService.getRecognitionById(
    req.params.recognition_id,
    req.query.populate as string | string[]
  );
  res.send(recognition);
});

export const createRecognition = catchAsync(async (req, res): Promise<void> => {
  await getUserById(req.body.recognition_by); // verify user, will throw an error if user not found
  await getUserById(req.body.recognition_for); // verify user, will throw an error if user not found
  await getStatusById(req.body.status_id); // verify status, will throw an error if status not found

  const newRecognition = await recognitionService.createRecognition(req.body);
  res.send(newRecognition);
});

export const deleteRecognitionById = catchAsync(async (req, res): Promise<void> => {
  await recognitionService.deleteRecognitionById(req.params.recognition_id);
  res.send();
});

export const updateRecognitionById = catchAsync(async (req, res): Promise<void> => {
  if (req.body.recognition_by) await getUserById(req.body.recognition_by); // verify user, will throw an error if user not found
  if (req.body.recognition_for) await getUserById(req.body.recognition_for); // verify user, will throw an error if user not found
  if (req.body.status_id) await getStatusById(req.body.status_id); // verify status, will throw an error if status not found

  const recognition = await recognitionService.updateRecognitionById(req.params.recognition_id, req.body);
  res.send(recognition);
});