import Joi from 'joi';

export const createDecision = {
  body: Joi.object().keys({
    decision_status: Joi.bool().required(),
    maker_id: Joi.string().uuid().required(),
  }),
};

export const getDecision = {
  params: Joi.object().keys({
    decision_id: Joi.string().uuid().required(),
  }),
};

export const updateDecision = {
  params: Joi.object().keys({
    decision_id: Joi.string().uuid().required(),
  }),
  body: Joi.object()
    .keys({
      decision_status: Joi.bool().optional(),
      maker_id: Joi.string().uuid().optional(),
    })
    .min(1),
};

export const deleteDecision = {
  params: Joi.object().keys({
    decision_id: Joi.string().uuid().required(),
  }),
};
