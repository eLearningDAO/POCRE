import Joi from 'joi';

export const createCreation = {
  body: Joi.object().keys({
    creation_title: Joi.string().required(),
    creation_description: Joi.string().optional().allow('').allow(null),
    source_id: Joi.string().uuid().required(),
    author_id: Joi.string().uuid().required(),
    tags: Joi.array().items(Joi.string().uuid()).unique().required().min(1),
    materials: Joi.array().items(Joi.string().uuid()).unique().required().min(1),
  }),
};

export const queryCreations = {
  query: Joi.object().keys({
    limit: Joi.number().integer().default(10),
    page: Joi.number().integer().default(1).greater(0),
  }),
};

export const getCreation = {
  params: Joi.object().keys({
    creation_id: Joi.string().uuid().required(),
  }),
};

export const updateCreation = {
  params: Joi.object().keys({
    creation_id: Joi.string().uuid().required(),
  }),
  body: Joi.object()
    .keys({
      creation_title: Joi.string().optional(),
      creation_description: Joi.string().optional().allow('').allow(null),
      source_id: Joi.string().uuid().optional(),
      author_id: Joi.string().uuid().optional(),
      tags: Joi.array().items(Joi.string().uuid()).unique().optional().min(1),
      materials: Joi.array().items(Joi.string().uuid()).unique().optional().min(1),
    })
    .min(1),
};

export const deleteCreation = {
  params: Joi.object().keys({
    creation_id: Joi.string().uuid().required(),
  }),
};
