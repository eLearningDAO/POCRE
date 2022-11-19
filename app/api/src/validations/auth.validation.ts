import Joi from 'joi';

export const createSession = {
  body: Joi.object().keys({
    wallet_address: Joi.string().required(),
  }),
};
