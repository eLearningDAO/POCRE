import Joi from 'joi';

const stepOneValidation = Joi.object({
  title: Joi.string().required().messages({ 'string.empty': 'Title is required', 'string.required': 'Title is required' }),
  description: Joi.string().optional().allow('', null),
  creation: Joi.string().optional().allow('', null),
  material: Joi.string().optional().allow('', null),
  author: Joi.string().required().messages({ 'string.empty': 'Author is required', 'string.required': 'Author is required' }),
  publicDate: Joi.string().required().messages({ 'string.empty': 'Public Date is required', 'string.required': 'Public Date is required' }),
  endDate: Joi.string().required().messages({ 'string.empty': 'End Date is required', 'string.required': 'End Date is required' }),
});

export {
  stepOneValidation,
};
