import Joi from 'joi';

export const createUser = {
  body: Joi.object().keys({
    user_name: Joi.string().required(),
    wallet_address: Joi.string().optional().allow('').allow(null),
    user_bio: Joi.string().optional().allow('').allow(null),
    phone: Joi.string().optional().allow('').allow(null),
    email_address: Joi.string().optional().allow('').allow(null),
    verified_id: Joi.string().optional().allow('').allow(null),
    reputation_stars: Joi.number().optional().allow(0).allow(null),
    image_url: Joi.string().optional().allow('').allow(null),
  }),
};

export const queryUsers = {
  query: Joi.object().keys({
    limit: Joi.number().integer().default(10),
    page: Joi.number().integer().default(1).greater(0),
    query: Joi.string().optional(),
    search_fields: Joi.array().items(Joi.string().valid('user_name')).when('query', {
      is: Joi.string().exist(),
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
    top_authors: Joi.bool().optional(),
  }),
};

export const getUser = {
  params: Joi.object().keys({
    user_id: Joi.string().uuid().required(),
  }),
};

export const updateUser = {
  params: Joi.object().keys({
    user_id: Joi.string().uuid().required(),
  }),
  body: Joi.object()
    .keys({
      user_name: Joi.string().optional(),
      user_bio: Joi.string().optional().allow('').allow(null),
      phone: Joi.string().optional().allow('').allow(null),
      email_address: Joi.string().optional().allow('').allow(null),
      verified_id: Joi.string().optional().allow('').allow(null),
      reputation_stars: Joi.number().optional().allow(0).allow(null),
      image_url: Joi.string().optional().allow('').allow(null),
    })
    .min(1),
};

export const deleteUser = {
  params: Joi.object().keys({
    user_id: Joi.string().uuid().required(),
  }),
};
