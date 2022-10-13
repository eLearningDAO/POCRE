import Joi from 'joi';

export const createSource = {
  body: Joi.object().keys({
    source_title: Joi.string().required(),
    source_description: Joi.string().optional().allow('').allow(null),
    site_url: Joi.string().uri().optional().allow('').allow(null),
  }),
};

export const getSource = {
  params: Joi.object().keys({
    source_id: Joi.string().uuid().required(),
  }),
};

export const updateSource = {
  params: Joi.object().keys({
    source_id: Joi.string().uuid().required(),
  }),
  body: Joi.object()
    .keys({
      source_title: Joi.string().optional(),
      source_description: Joi.string().optional().allow('').allow(null),
      site_url: Joi.string().uri().optional().allow('').allow(null),
    })
    .min(1),
};

export const deleteSource = {
  params: Joi.object().keys({
    source_id: Joi.string().uuid().required(),
  }),
};
