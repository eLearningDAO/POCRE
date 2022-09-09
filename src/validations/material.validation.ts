import Joi from 'joi';

export const createMaterial = {
  body: Joi.object().keys({
    material_title: Joi.string().required(),
    material_description: Joi.string().optional().allow('').allow(null),
    material_link: Joi.string().uri().optional().allow('').allow(null),
    source_id: Joi.string().uuid().required(),
    type_id: Joi.string().uuid().required(),
    invite_id: Joi.string().uuid().optional().allow('').allow(null),
    author_id: Joi.string().uuid().required(),
  }),
};

export const getMaterial = {
  params: Joi.object().keys({
    material_id: Joi.string().uuid().required(),
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
      material_link: Joi.string().uri().optional().allow('').allow(null),
      source_id: Joi.string().uuid().optional(),
      type_id: Joi.string().uuid().optional(),
      invite_id: Joi.string().uuid().optional().allow('').allow(null),
      author_id: Joi.string().uuid().optional(),
    })
    .min(1),
};

export const deleteMaterial = {
  params: Joi.object().keys({
    material_id: Joi.string().uuid().required(),
  }),
};
