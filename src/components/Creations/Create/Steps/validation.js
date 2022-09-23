import Joi from 'joi';

const stepOneValidation = Joi.object({
  title: Joi.string().required().messages({ 'string.empty': 'Title is required', 'string.required': 'Title is required' }),
  description: Joi.string().optional().allow('', null),
  source: Joi.string().uri().required().messages({ 'string.empty': 'Source is required', 'string.required': 'Source is required', 'string.uri': 'Source must be a valid link' }),
  tags: Joi.array().items(Joi.string()).min(1).required()
    .messages({
      'string.empty': 'At least 1 tag is required',
      'string.required': 'At least 1 tag is required',
      'any.required': 'At least 1 tag is required',
      'array.min': 'At least 1 tag is required',
    }),
  date: Joi.string().required().messages({ 'string.empty': 'Date is required', 'string.required': 'Date is required' }),
});

export {
  stepOneValidation,
};
