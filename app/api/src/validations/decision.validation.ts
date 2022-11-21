import Joi from 'joi';
import { decisionDeepFields } from '../db/map';

export const createDecision = {
  body: Joi.object().keys({
    decision_status: Joi.bool().required(),
  }),
};

export const getDecision = {
  params: Joi.object().keys({
    decision_id: Joi.string().uuid().required(),
  }),
  query: Joi.object().keys({
    populate: Joi.alternatives()
      .try(Joi.string().valid(...decisionDeepFields), Joi.array().items(Joi.string().valid(...decisionDeepFields)))
      .optional(),
  }),
};

export const updateDecision = {
  params: Joi.object().keys({
    decision_id: Joi.string().uuid().required(),
  }),
  body: Joi.object()
    .keys({
      decision_status: Joi.bool().optional(),
    })
    .min(1),
};

export const deleteDecision = {
  params: Joi.object().keys({
    decision_id: Joi.string().uuid().required(),
  }),
};
