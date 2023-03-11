import Joi from 'joi';
import transactionPurposes from '../constants/transactionPurposes';

export const createTransaction = {
  body: Joi.object().keys({
    transaction_hash: Joi.string().required(),
    transaction_purpose: Joi.string()
      .valid(...Object.values(transactionPurposes))
      .required(),
  }),
};
