import Joi from 'joi';

export const createStatus = {
  body: Joi.object().keys({
    status_name: Joi.string().required(),
    status_description: Joi.string().optional().allow('').allow(null),
  }),
};

export const getStatus = {
  params: Joi.object().keys({
    status_id: Joi.string().uuid().required(),
  }),
};

export const updateStatus = {
  params: Joi.object().keys({
    status_id: Joi.string().uuid().required(),
  }),
  body: Joi.object()
    .keys({
      status_name: Joi.string().optional(),
      status_description: Joi.string().optional().allow('').allow(null),
    })
    .min(1),
};

export const deleteStatus = {
  params: Joi.object().keys({
    status_id: Joi.string().uuid().required(),
  }),
};
