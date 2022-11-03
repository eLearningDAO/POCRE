import Joi from 'joi';

const walletValidation = Joi.object({
  name: Joi.string().optional().allow('').allow(null),
  bio: Joi.string().optional().allow('').allow(null),
  phone: Joi.string().optional().allow('').allow(null),
  email: Joi.string().optional().allow('').allow(null),
});

export {
  walletValidation,
};
