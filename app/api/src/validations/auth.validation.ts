import Joi from 'joi';

export const login = {
  body: Joi.object().keys({
    wallet_address: Joi.string().required(),
  }),
};

export const signup = {
  body: Joi.object().keys({
    invite_token: Joi.string().required(),
    wallet_address: Joi.string().required(),
  }),
};
