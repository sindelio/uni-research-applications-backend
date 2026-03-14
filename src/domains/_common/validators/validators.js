import { celebrate, Joi } from 'celebrate';
import formats from './formats';

const commonValidators = {
  queryId: celebrate({
    query: Joi.object({
      id: formats.requiredId,
    }),
  }),
  queryEmail: celebrate({
    query: Joi.object({
      email: formats.requiredEmail,
    }),
  }),
  credentials: celebrate({
    body: Joi.object({
      email: formats.requiredEmail,
      password: formats.requiredPassword,
    }),
  }),
};

export default commonValidators;