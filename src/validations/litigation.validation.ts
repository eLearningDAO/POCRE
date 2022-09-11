import Joi from 'joi';

export const createLitigation = {
  body: Joi.object().keys({
    litigation_title: Joi.string().required(),
    litigation_description: Joi.string().optional().allow('').allow(null),
    material_id: Joi.string().uuid().required(),
    issuer_id: Joi.string().uuid().required(),
    invitations: Joi.array().items(Joi.string().uuid()).unique().required().min(1),
    decisions: Joi.array().items(Joi.string().uuid()).unique().required().min(1),
    litigation_end: Joi.string().isoDate().optional(),
    reconcilate: Joi.bool().optional(),
  }),
};

export const queryLitigations = {
  query: Joi.object().keys({
    limit: Joi.number().integer().default(10),
    page: Joi.number().integer().default(1).greater(0),
  }),
};

export const getLitigation = {
  params: Joi.object().keys({
    litigation_id: Joi.string().uuid().required(),
  }),
};

export const updateLitigation = {
  params: Joi.object().keys({
    litigation_id: Joi.string().uuid().required(),
  }),
  body: Joi.object()
    .keys({
      litigation_title: Joi.string().optional(),
      litigation_description: Joi.string().optional().allow('').allow(null),
      material_id: Joi.string().uuid().optional(),
      issuer_id: Joi.string().uuid().optional(),
      invitations: Joi.array().items(Joi.string().uuid()).unique().optional().min(1),
      decisions: Joi.array().items(Joi.string().uuid()).unique().optional().min(1),
      litigation_end: Joi.string().isoDate().optional(),
      reconcilate: Joi.bool().optional(),
    })
    .min(1),
};

export const deleteLitigation = {
  params: Joi.object().keys({
    litigation_id: Joi.string().uuid().required(),
  }),
};
