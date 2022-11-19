import Joi from 'joi';

const loginValidation = Joi.object({
  wallet: Joi.string().required().messages({ 'string.empty': 'Wallet is required', 'string.required': 'Wallet is required' }),
});

export {
  loginValidation,
};
