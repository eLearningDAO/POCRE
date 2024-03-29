import Joi from 'joi';

export const createTag = {
  body: Joi.object().keys({
    tag_name: Joi.string().required(),
    tag_description: Joi.string().optional().allow('').allow(null),
  }),
};

export const queryTags = {
  query: Joi.object().keys({
    limit: Joi.number().integer().default(10),
    page: Joi.number().integer().default(1).greater(0),
    query: Joi.string().optional(),
    search_fields: Joi.array().items(Joi.string().valid('tag_name')).when('query', {
      is: Joi.string().exist(),
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
  }),
};

export const getTag = {
  params: Joi.object().keys({
    tag_id: Joi.string().uuid().required(),
  }),
};

export const updateTag = {
  params: Joi.object().keys({
    tag_id: Joi.string().uuid().required(),
  }),
  body: Joi.object()
    .keys({
      tag_name: Joi.string().optional(),
      tag_description: Joi.string().optional().allow('').allow(null),
    })
    .min(1),
};

export const deleteTag = {
  params: Joi.object().keys({
    tag_id: Joi.string().uuid().required(),
  }),
};
