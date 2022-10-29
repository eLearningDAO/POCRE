import Joi from 'joi';

export const createInvitation = {
  body: Joi.object().keys({
    invite_from: Joi.string().uuid().required(),
    invite_to: Joi.string().uuid().required(),
    invite_description: Joi.string().optional().allow('').allow(null),
    status_id: Joi.string().uuid().required(),
  }),
};

export const queryInvitations = {
  query: Joi.object().keys({
    limit: Joi.number().integer().default(10),
    page: Joi.number().integer().default(1).greater(0),
    query: Joi.string().optional(),
    search_fields: Joi.array().items(Joi.string().valid('invite_from', 'invite_to')).when('query', {
      is: Joi.string().exist(),
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
    ascend_fields: Joi.array().items(Joi.string().valid('invite_issued')).optional(),
    descend_fields: Joi.array().items(Joi.string().valid('invite_issued')).optional(),
    populate: Joi.alternatives()
      .try(
        Joi.string().valid('invite_from', 'invite_to', 'status_id'),
        Joi.array().items(
          Joi.alternatives().try(
            Joi.string().valid('invite_from', 'invite_to', 'status_id'),
            Joi.array()
              .items(Joi.string())
              .ordered(Joi.string().valid('invite_from', 'invite_to', 'status_id'), Joi.string())
              .min(2)
              .max(2)
          )
        )
      )
      .optional(),
  }),
};

export const getInvitation = {
  params: Joi.object().keys({
    invite_id: Joi.string().uuid().required(),
  }),
  query: Joi.object().keys({
    populate: Joi.alternatives()
      .try(
        Joi.string().valid('invite_from', 'invite_to', 'status_id'),
        Joi.array().items(
          Joi.alternatives().try(
            Joi.string().valid('invite_from', 'invite_to', 'status_id'),
            Joi.array()
              .items(Joi.string())
              .ordered(Joi.string().valid('invite_from', 'invite_to', 'status_id'), Joi.string())
              .min(2)
              .max(2)
          )
        )
      )
      .optional(),
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
