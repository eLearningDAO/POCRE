import Joi from 'joi';

export const getMediaType = {
  query: Joi.object().keys({
    link: Joi.string().required(),
  }),
};
