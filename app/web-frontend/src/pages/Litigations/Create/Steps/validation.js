import Joi from 'joi';

const stepOneValidation = Joi.object({
  title: Joi.string().required().messages({ 'string.empty': 'Title is required', 'string.required': 'Title is required' }),
  description: Joi.string().optional().allow('', null),
  creation: Joi.string().optional().allow('', null),
  material: Joi.string().optional().allow('', null),
});

export {
  stepOneValidation,
};
