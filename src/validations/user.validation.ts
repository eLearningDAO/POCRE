import Joi from 'joi';

export const createUser = {
  body: Joi.object().keys({
    user_name: Joi.string().required(),
    wallet_address: Joi.string().optional().allow('').allow(null),
    user_bio: Joi.string().optional().allow('').allow(null),
  }),
};

export const queryUsers = {
  query: Joi.object().keys({}), // TODO: add pagination params
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
      wallet_address: Joi.string().optional().allow('').allow(null),
      user_bio: Joi.string().optional().allow('').allow(null),
    })
    .min(1),
};

export const deleteUser = {
  params: Joi.object().keys({
    user_id: Joi.string().uuid().required(),
  }),
};
