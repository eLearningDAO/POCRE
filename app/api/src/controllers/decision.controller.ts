import * as decisionService from '../services/decision.service';
import { IUserDoc } from '../services/user.service';
import catchAsync from '../utils/catchAsync';

export const getDecisionById = catchAsync(async (req, res): Promise<void> => {
  const decision = await decisionService.getDecisionById(req.params.decision_id, {
    populate: req.query.populate as string | string[],
  });
  res.send(decision);
});

export const createDecision = catchAsync(async (req, res): Promise<void> => {
  const newDecision = await decisionService.createDecision({
    ...req.body,
    maker_id: (req.user as IUserDoc).user_id,
  });
  res.send(newDecision);
});

export const deleteDecisionById = catchAsync(async (req, res): Promise<void> => {
  await decisionService.deleteDecisionById(req.params.decision_id, {
    owner_id: (req.user as IUserDoc).user_id,
  });
  res.send();
});

export const updateDecisionById = catchAsync(async (req, res): Promise<void> => {
  const updatedDecision = await decisionService.updateDecisionById(req.params.decision_id, req.body, {
    owner_id: (req.user as IUserDoc).user_id,
  });
  res.send(updatedDecision);
});
