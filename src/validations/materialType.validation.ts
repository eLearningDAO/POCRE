import Joi from 'joi';

export const createMaterialType = {
  body: Joi.object().keys({
    type_name: Joi.string().required(),
    type_description: Joi.string().optional().allow('').allow(null),
  }),
};

export const getMaterialType = {
  params: Joi.object().keys({
    type_id: Joi.string().uuid().required(),
  }),
};

export const updateMaterialType = {
  params: Joi.object().keys({
    type_id: Joi.string().uuid().required(),
  }),
  body: Joi.object()
    .keys({
      type_name: Joi.string().optional(),
      type_description: Joi.string().optional().allow('').allow(null),
    })
    .min(1),
};

export const deleteMaterialType = {
  params: Joi.object().keys({
    type_id: Joi.string().uuid().required(),
  }),
};
