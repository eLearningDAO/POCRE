import Joi from 'joi';

export const createCreation = {
  body: Joi.object().keys({
    creation_title: Joi.string().required(),
    creation_description: Joi.string().optional().allow('').allow(null),
    source_id: Joi.string().uuid().required(),
    author_id: Joi.string().uuid().required(),
    tags: Joi.array().items(Joi.string().uuid()).unique().required().min(1),
    materials: Joi.array().items(Joi.string().uuid()).unique().optional().min(1),
    creation_date: Joi.string().isoDate().required(),
    is_draft: Joi.bool().default(false),
    is_claimable: Joi.bool().default(true),
  }),
};

export const queryCreations = {
  query: Joi.object().keys({
    limit: Joi.number().integer().default(10),
    page: Joi.number().integer().default(1).greater(0),
    query: Joi.string().optional(),
    search_fields: Joi.array().items(Joi.string().valid('author_id', 'material_id', 'creation_title')).when('query', {
      is: Joi.string().exist(),
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
    ascend_fields: Joi.array().items(Joi.string().valid('creation_date')).optional(),
    descend_fields: Joi.array().items(Joi.string().valid('creation_date')).optional(),
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
      materials: Joi.array().items(Joi.string().uuid()).unique().optional(),
      creation_date: Joi.string().isoDate().optional(),
      is_draft: Joi.bool(),
      is_claimable: Joi.bool(),
    })
    .min(1),
};

export const deleteCreation = {
  params: Joi.object().keys({
    creation_id: Joi.string().uuid().required(),
  }),
};
