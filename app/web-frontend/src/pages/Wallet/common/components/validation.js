import Joi from 'joi';

const updateProfileValidation = Joi.object({
  user_name: Joi.string().required().messages({ 'string.empty': 'Username is required', 'string.required': 'Username is required' }),
  image_url: Joi.string().optional().allow('').allow(null),
  user_bio: Joi.string().optional().allow('').allow(null),
  phone: Joi.string().optional().allow('').allow(null),
  email_address: Joi.string().optional().allow('').allow(null),
});

export {
  updateProfileValidation,
};
