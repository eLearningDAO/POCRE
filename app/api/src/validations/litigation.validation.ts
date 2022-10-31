import Joi from 'joi';

export const createLitigation = {
  body: Joi.object().keys({
    litigation_title: Joi.string().required(),
    litigation_description: Joi.string().optional().allow('').allow(null),
    creation_id: Joi.string().uuid().required(),
    material_id: Joi.string().uuid().optional(),
    issuer_id: Joi.string().uuid().required(),
    decisions: Joi.array().items(Joi.string().uuid()).unique().default([]),
    litigation_start: Joi.date().iso().required(),
    litigation_end: Joi.date().iso().greater(Joi.ref('litigation_start')).required(),
    reconcilate: Joi.bool().optional(),
  }),
};

export const queryLitigations = {
  query: Joi.object().keys({
    limit: Joi.number().integer().default(10),
    page: Joi.number().integer().default(1).greater(0),
    query: Joi.string().optional(),
    search_fields: Joi.array()
      .items(Joi.string().valid('creation_id', 'material_id', 'assumed_author', 'issuer_id', 'winner'))
      .when('query', {
        is: Joi.string().exist(),
        then: Joi.required(),
        otherwise: Joi.forbidden(),
      }),
    ascend_fields: Joi.array().items(Joi.string().valid('litigation_start', 'litigation_end')).optional(),
    descend_fields: Joi.array().items(Joi.string().valid('litigation_start', 'litigation_end')).optional(),
    judged_by: Joi.string().uuid().optional(),
    populate: Joi.alternatives()
      .try(
        Joi.string().valid(
          'creation_id',
          'material_id',
          'assumed_author',
          'issuer_id',
          'winner',
          'invitations',
          'decisions'
        ),
        Joi.array().items(
          Joi.alternatives().try(
            Joi.string().valid(
              'creation_id',
              'material_id',
              'assumed_author',
              'issuer_id',
              'winner',
              'invitations',
              'decisions'
            ),
            Joi.array()
              .items(Joi.string())
              .ordered(
                Joi.string().valid(
                  'creation_id',
                  'material_id',
                  'assumed_author',
                  'issuer_id',
                  'winner',
                  'invitations',
                  'decisions'
                ),
                Joi.string()
              )
              .min(2)
              .max(2)
          )
        )
      )
      .optional(),
  }),
};

export const getLitigation = {
  params: Joi.object().keys({
    litigation_id: Joi.string().uuid().required(),
  }),
  query: Joi.object().keys({
    populate: Joi.alternatives()
      .try(
        Joi.string().valid(
          'creation_id',
          'material_id',
          'assumed_author',
          'issuer_id',
          'winner',
          'invitations',
          'decisions'
        ),
        Joi.array().items(
          Joi.alternatives().try(
            Joi.string().valid(
              'creation_id',
              'material_id',
              'assumed_author',
              'issuer_id',
              'winner',
              'invitations',
              'decisions'
            ),
            Joi.array()
              .items(Joi.string())
              .ordered(
                Joi.string().valid(
                  'creation_id',
                  'material_id',
                  'assumed_author',
                  'issuer_id',
                  'winner',
                  'invitations',
                  'decisions'
                ),
                Joi.string()
              )
              .min(2)
              .max(2)
          )
        )
      )
      .optional(),
  }),
};

export const updateLitigation = {
  params: Joi.object().keys({
    litigation_id: Joi.string().uuid().required(),
  }),
  body: Joi.object()
    .keys({
      litigation_title: Joi.string().optional(),
      litigation_description: Joi.string().optional().allow('').allow(null),
      decisions: Joi.array().items(Joi.string().uuid()).unique().optional(),
      litigation_start: Joi.date().iso().optional(),
      litigation_end: Joi.date().iso().greater(Joi.ref('litigation_start')).optional(),
      reconcilate: Joi.bool().optional(),
      ownership_transferred: Joi.bool().optional(),
    })
    .min(1),
};

export const deleteLitigation = {
  params: Joi.object().keys({
    litigation_id: Joi.string().uuid().required(),
  }),
};
