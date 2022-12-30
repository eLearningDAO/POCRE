import Joi from 'joi';
import supportedMediaTypes from '../constants/supportedMediaTypes';
import { materialDeepFields } from '../db/map';

export const createMaterial = {
  body: Joi.object().keys({
    material_title: Joi.string().required(),
    material_description: Joi.string().optional().allow('').allow(null),
    material_link: Joi.string().uri().required(),
    recognition_id: Joi.string().uuid().optional().allow('').allow(null),
    author_id: Joi.string().uuid().optional(),
    is_claimable: Joi.bool().default(true),
  }),
};

export const queryMaterials = {
  query: Joi.object().keys({
    limit: Joi.number().integer().default(10),
    page: Joi.number().integer().default(1).greater(0),
    query: Joi.string().optional(),
    search_fields: Joi.array().items(Joi.string().valid('recognition_id')).when('query', {
      is: Joi.string().exist(),
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
    is_recognized: Joi.bool().optional(),
    is_claimed: Joi.bool().optional(),
    material_type: Joi.string()
      .valid(...Object.values(supportedMediaTypes))
      .optional(),
    top_authors: Joi.bool().default(false).optional(),
    populate: Joi.alternatives()
      .try(Joi.string().valid(...materialDeepFields), Joi.array().items(Joi.string().valid(...materialDeepFields)))
      .optional(),
  }),
};

export const getMaterial = {
  params: Joi.object().keys({
    material_id: Joi.string().uuid().required(),
  }),
  query: Joi.object().keys({
    populate: Joi.alternatives()
      .try(Joi.string().valid(...materialDeepFields), Joi.array().items(Joi.string().valid(...materialDeepFields)))
      .optional(),
  }),
};

export const updateMaterial = {
  params: Joi.object().keys({
    material_id: Joi.string().uuid().required(),
  }),
  body: Joi.object()
    .keys({
      material_title: Joi.string().optional(),
      material_description: Joi.string().optional().allow('').allow(null),
      material_link: Joi.string().uri().optional(),
      recognition_id: Joi.string().uuid().optional().allow('').allow(null),
      is_claimable: Joi.bool(),
    })
    .min(1),
};

export const deleteMaterial = {
  params: Joi.object().keys({
    material_id: Joi.string().uuid().required(),
  }),
};
