/* eslint-disable unicorn/no-thenable */
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

const stepTwoMaterialValidation = Joi.object({
  title: Joi.string().required().messages({ 'string.empty': 'Title is required', 'string.required': 'Title is required' }),
  fileType: Joi.string().required().messages({ 'string.empty': 'File type is required', 'string.required': 'File type is required' }),
  link: Joi.string().uri().required().messages({ 'string.empty': 'Link is required', 'string.required': 'Link is required', 'string.uri': 'Link must be a valid url' }),
  author: Joi.array().items(Joi.string()).min(1).max(1)
    .required()
    .messages({
      'string.empty': 'Author is required. Please search and select author from suggestions',
      'string.required': 'Author is required. Please search and select author from suggestions',
      'any.required': 'Author is required. Please search and select author from suggestions',
      'array.min': 'Author is required. Please search and select author from suggestions',
      'array.max': 'More than 1 authors are not allowed',
    }),
});

const stepTwoAuthorInviteValidation = Joi.object({
  inviteMethod: Joi.string().required().messages({ 'string.empty': 'Invite method is required', 'string.required': 'Invite method is required', 'any.required': 'Invite method is required' }),
  username: Joi.string().optional()
    .when('inviteMethod', {
      is: Joi.string().valid('username').exist(),
      then: Joi.string().required().messages({ 'string.empty': 'Username is required', 'string.required': 'Username is required' }),
      otherwise: Joi.string().optional().allow('').allow(null),
    }),
  inviteValue: Joi.string().optional()
    .when('inviteMethod', {
      is: Joi.string().valid('email').exist(),
      then: Joi.string().email({ tlds: { allow: false } }).required().messages({ 'string.empty': 'Email is required', 'string.required': 'Email is required', 'string.email': 'Email must be valid' }),
    })
    .when('inviteMethod', {
      is: Joi.string().valid('phone').exist(),
      then: Joi.string().required().messages({ 'string.empty': 'Phone is required', 'string.required': 'Phone is required' }),
    })
    .when('inviteMethod', {
      is: Joi.string().valid('username').exist(),
      then: Joi.string().optional().allow('').allow(null),
    }),
});

export {
  stepOneValidation,
  stepTwoMaterialValidation,
  stepTwoAuthorInviteValidation,
};
