import Joi from 'joi';

export const createToken = {
  body: Joi.object().keys({
    payload: Joi.string().required(),
  }),
};
