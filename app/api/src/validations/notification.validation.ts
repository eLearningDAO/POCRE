import Joi from 'joi';
import supportedStatusTypes from '../constants/notificationStatusTypes';
import supportedMediaTypes from '../constants/supportedMediaTypes';

export const createNotification = {
  body: Joi.object().keys({
    notification_title: Joi.string().required(),
    notification_description: Joi.string().optional().allow('').allow(null),
    notification_for: Joi.string().uuid().optional(),
    status: Joi.string()
    .valid(...Object.values(supportedStatusTypes)),
    creation_type: Joi.string()
      .valid(...Object.values(supportedMediaTypes))
      .optional(),
    creation_link: Joi.string().required(),
    notification_link: Joi.string().required(),
  }),
};

export const queryNotifications = {
  query: Joi.object().keys({
    limit: Joi.number().integer().default(10),
    page: Joi.number().integer().default(1).greater(0),
    query: Joi.string().optional(),
    search_fields: Joi.array().items(Joi.string().valid('notification_for')).when('query', {
      is: Joi.string().exist(),
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
    descend_fields: Joi.array().items(Joi.string().valid('created_at')).optional(),
    ascend_fields: Joi.array().items(Joi.string().valid('created_at')).optional(),
    status: Joi.string()
      .valid(...Object.values(supportedStatusTypes))
      .optional()
  }),
};

export const getNotification = {
  params: Joi.object().keys({
    notification_id: Joi.string().uuid().required(),
  }),
};

export const updateNotification = {
  params: Joi.object().keys({
    notification_id: Joi.string().uuid().required(),
  }),
  body: Joi.object()
    .keys({
      notification_title: Joi.string().optional(),
      notification_description: Joi.string().optional().allow('').allow(null),
      notification_for: Joi.string().uri().optional(),
      recognition_id: Joi.string().uuid().optional().allow('').allow(null),
      status: Joi.string()
      .valid(...Object.values(supportedStatusTypes)),
    })
    .min(1),
};

export const deleteNotification = {
  params: Joi.object().keys({
    notification_id: Joi.string().uuid().required(),
  }),
};
