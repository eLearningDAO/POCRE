import Joi from 'joi';

export const createLitigation = {
  body: Joi.object().keys({
    litigation_title: Joi.string().required(),
    litigation_description: Joi.string().optional().allow('').allow(null),
    creation_id: Joi.string().uuid().required(),
    material_id: Joi.string().uuid().optional(),
    issuer_id: Joi.string().uuid().required(),
    decisions: Joi.array().items(Joi.string().uuid()).unique().default([]),
    litigation_start: Joi.string().isoDate().required(),
    litigation_end: Joi.string().isoDate().required(),
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
      decisions: Joi.array().items(Joi.string().uuid()).unique().optional().min(1),
      litigation_start: Joi.string().isoDate().optional(),
      litigation_end: Joi.string().isoDate().optional(),
      reconcilate: Joi.bool().optional(),
      ownership_transferred: Joi.bool().optional(),
    })
    .min(1),
};

export const deleteLitigation = {
  params: Joi.object().keys({
    litigation_id: Joi.string().uuid().required(),
  }),
};
