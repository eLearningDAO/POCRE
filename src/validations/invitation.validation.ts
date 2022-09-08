import Joi from 'joi';

export const createInvitation = {
  body: Joi.object().keys({
    invite_from: Joi.string().uuid().required(),
    invite_to: Joi.string().uuid().required(),
    invite_description: Joi.string().optional().allow('').allow(null),
    status_id: Joi.string().uuid().required(),
  }),
};

export const getInvitation = {
  params: Joi.object().keys({
    invite_id: Joi.string().uuid().required(),
  }),
};

export const updateInvitation = {
  params: Joi.object().keys({
    invite_id: Joi.string().uuid().required(),
  }),
  body: Joi.object()
    .keys({
      invite_from: Joi.string().uuid().optional(),
      invite_to: Joi.string().uuid().optional(),
      invite_description: Joi.string().optional().allow('').allow(null),
      status_id: Joi.string().uuid().optional(),
    })
    .min(1),
};

export const deleteInvitation = {
  params: Joi.object().keys({
    invite_id: Joi.string().uuid().required(),
  }),
};
