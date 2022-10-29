import Joi from 'joi';

export const createMaterial = {
  body: Joi.object().keys({
    material_title: Joi.string().required(),
    material_description: Joi.string().optional().allow('').allow(null),
    material_link: Joi.string().uri().optional().allow('').allow(null),
    source_id: Joi.string().uuid().required(),
    type_id: Joi.string().uuid().required(),
    invite_id: Joi.string().uuid().optional().allow('').allow(null),
    author_id: Joi.string().uuid().required(),
    is_claimable: Joi.bool().default(true),
  }),
};

export const queryMaterials = {
  query: Joi.object().keys({
    limit: Joi.number().integer().default(10),
    page: Joi.number().integer().default(1).greater(0),
    query: Joi.string().optional(),
    search_fields: Joi.array().items(Joi.string().valid('invite_id')).when('query', {
      is: Joi.string().exist(),
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
    is_recognized: Joi.bool().optional(),
    is_claimed: Joi.bool().optional(),
    populate: Joi.alternatives()
      .try(
        Joi.string().valid('source_id', 'type_id', 'invite_id', 'author_id'),
        Joi.array().items(
          Joi.alternatives().try(
            Joi.string().valid('source_id', 'type_id', 'invite_id', 'author_id'),
            Joi.array()
              .items(Joi.string())
              .ordered(Joi.string().valid('source_id', 'type_id', 'invite_id', 'author_id'), Joi.string())
              .min(2)
              .max(2)
          )
        )
      )
      .optional(),
  }),
};

export const getMaterial = {
  params: Joi.object().keys({
    material_id: Joi.string().uuid().required(),
  }),
  query: Joi.object().keys({
    populate: Joi.alternatives()
      .try(
        Joi.string().valid('source_id', 'type_id', 'invite_id', 'author_id'),
        Joi.array().items(
          Joi.alternatives().try(
            Joi.string().valid('source_id', 'type_id', 'invite_id', 'author_id'),
            Joi.array()
              .items(Joi.string())
              .ordered(Joi.string().valid('source_id', 'type_id', 'invite_id', 'author_id'), Joi.string())
              .min(2)
              .max(2)
          )
        )
      )
      .optional(),
  }),
};

export const updateMaterial = {
  params: Joi.object().keys({
    material_id: Joi.string().uuid().required(),
  }),
  body: Joi.object()
    .keys({
      material_title: Joi.string().optional(),
      material_description: Joi.string().optional().allow('').allow(null),
      material_link: Joi.string().uri().optional().allow('').allow(null),
      source_id: Joi.string().uuid().optional(),
      type_id: Joi.string().uuid().optional(),
      invite_id: Joi.string().uuid().optional().allow('').allow(null),
      author_id: Joi.string().uuid().optional(),
      is_claimable: Joi.bool(),
    })
    .min(1),
};

export const deleteMaterial = {
  params: Joi.object().keys({
    material_id: Joi.string().uuid().required(),
  }),
};
