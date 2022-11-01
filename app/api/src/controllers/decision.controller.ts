import catchAsync from '../utils/catchAsync';
import { getUserById } from '../services/user.service';
import * as decisionService from '../services/decision.service';

export const getDecisionById = catchAsync(async (req, res): Promise<void> => {
  const decision = await decisionService.getDecisionById(
    req.params.decision_id,
    req.query.populate as string | (string | string[])[]
  );
  res.send(decision);
});

export const createDecision = catchAsync(async (req, res): Promise<void> => {
  await getUserById(req.body.maker_id); // verify user, will throw an error if user not found

  const newDecision = await decisionService.createDecision(req.body);
  res.send(newDecision);
});

export const deleteDecisionById = catchAsync(async (req, res): Promise<void> => {
  await decisionService.deleteDecisionById(req.params.decision_id);
  res.send();
});

export const updateDecisionById = catchAsync(async (req, res): Promise<void> => {
  if (req.body.maker_id) {
    await getUserById(req.body.maker_id); // verify user, will throw an error if user not found
  }

  const decision = await decisionService.updateDecisionById(req.params.decision_id, req.body);
  res.send(decision);
});
