import Joi from 'joi';
import { recognitionDeepFields } from '../db/map';
import statusTypes from '../constants/statusTypes';

export const createRecognition = {
  body: Joi.object().keys({
    recognition_for: Joi.string().uuid().required(),
    recognition_description: Joi.string().optional().allow('').allow(null),
    status: Joi.string()
      .valid(...Object.values(statusTypes))
      .required()
      .default(statusTypes.PENDING),
    status_updated: Joi.string().isoDate().optional().default(new Date().toISOString()),
  }),
};

export const queryRecognitions = {
  query: Joi.object().keys({
    limit: Joi.number().integer().default(10),
    page: Joi.number().integer().default(1).greater(0),
    query: Joi.string().optional(),
    search_fields: Joi.array().items(Joi.string().valid('recognition_by', 'recognition_for')).when('query', {
      is: Joi.string().exist(),
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
    ascend_fields: Joi.array().items(Joi.string().valid('recognition_issued')).optional(),
    descend_fields: Joi.array().items(Joi.string().valid('recognition_issued')).optional(),
    populate: Joi.alternatives()
      .try(Joi.string().valid(...recognitionDeepFields), Joi.array().items(Joi.string().valid(...recognitionDeepFields)))
      .optional(),
  }),
};

export const getRecognition = {
  params: Joi.object().keys({
    recognition_id: Joi.string().uuid().required(),
  }),
  query: Joi.object().keys({
    populate: Joi.alternatives()
      .try(Joi.string().valid(...recognitionDeepFields), Joi.array().items(Joi.string().valid(...recognitionDeepFields)))
      .optional(),
  }),
};

export const updateRecognition = {
  params: Joi.object().keys({
    recognition_id: Joi.string().uuid().required(),
  }),
  body: Joi.object()
    .keys({
      recognition_for: Joi.string().uuid().optional(),
      recognition_description: Joi.string().optional().allow('').allow(null),
      status: Joi.string()
        .valid(...Object.values(statusTypes))
        .optional(),
      status_updated: Joi.string().isoDate().optional(),
    })
    .min(1),
};

export const deleteRecognition = {
  params: Joi.object().keys({
    recognition_id: Joi.string().uuid().required(),
  }),
};
