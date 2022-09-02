import Joi from 'joi';

export const createUser = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    age: Joi.number().required(),
  }),
};

export const getUsers = {
  query: Joi.object().keys({}),
};

export const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().required(),
  }),
};

export const updateUser = {
  params: Joi.object().keys({
    userId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      age: Joi.number(),
      name: Joi.string(),
    })
    .min(1),
};

export const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().required(),
  }),
};
