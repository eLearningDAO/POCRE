import Joi from 'joi';
import litigationStatusTypes from '../constants/litigationStatusTypes';
import { litigationDeepFields } from '../db/map';

export const createLitigation = {
  body: Joi.object().keys({
    litigation_title: Joi.string().required(),
    litigation_description: Joi.string().optional().allow('').allow(null),
    creation_id: Joi.string().uuid().required(),
    material_id: Joi.string().uuid().optional(),
    is_draft: Joi.bool().default(false),
  }),
};

export const queryLitigations = {
  query: Joi.object().keys({
    limit: Joi.number().integer().default(10),
    page: Joi.number().integer().default(1).greater(0),
    query: Joi.string().optional(),
    search_fields: Joi.array()
      .items(Joi.string().valid('creation_id', 'material_id', 'assumed_author', 'issuer_id', 'winner'))
      .when('query', {
        is: Joi.string().exist(),
        then: Joi.required(),
        otherwise: Joi.forbidden(),
      }),
    ascend_fields: Joi.array().items(Joi.string().valid('voting_start', 'voting_end')).optional(),
    descend_fields: Joi.array().items(Joi.string().valid('voting_start', 'voting_end')).optional(),
    judged_by: Joi.string().uuid().optional(),
    populate: Joi.alternatives()
      .try(Joi.string().valid(...litigationDeepFields), Joi.array().items(Joi.string().valid(...litigationDeepFields)))
      .optional(),
  }),
};

export const getLitigation = {
  params: Joi.object().keys({
    litigation_id: Joi.string().uuid().required(),
  }),
  query: Joi.object().keys({
    populate: Joi.alternatives()
      .try(Joi.string().valid(...litigationDeepFields), Joi.array().items(Joi.string().valid(...litigationDeepFields)))
      .optional(),
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
      creation_id: Joi.string().uuid().optional(), // [HOTFIX]: this is required if creation in draft
      material_id: Joi.string().uuid().optional(),
      decisions: Joi.array().items(Joi.string().uuid()).unique().optional(),
      assumed_author_response: Joi.string()
        .valid(...Object.values(litigationStatusTypes).filter((x) => x !== litigationStatusTypes.PENDING_RESPONSE))
        .optional(),
      is_draft: Joi.bool().default(false),
    })
    .min(1),
};

export const claimLitigatedItemOwnership = {
  params: Joi.object().keys({
    litigation_id: Joi.string().uuid().required(),
  }),
};

export const deleteLitigation = {
  params: Joi.object().keys({
    litigation_id: Joi.string().uuid().required(),
  }),
};
