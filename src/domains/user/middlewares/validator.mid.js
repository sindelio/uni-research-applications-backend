import { celebrate, Joi } from 'celebrate';
import formats from '../../_common/validators/formats.js';
import commonValidators from '../../_common/validators/validators.js';

const validator = {
  create: commonValidators.credentials,
  confirmEmail: celebrate({
    body: Joi.object({
      email: formats.requiredEmail,
    }),
  }),
  recoverPassword: celebrate({
    body: Joi.object({
      email: formats.requiredEmail,
    }),
  }),
  resetPassword: celebrate({
    body: Joi.object({
      email: formats.requiredEmail,
      passwordRecoveryToken: Joi.string()
        .hex()
        .length(16)
        .required(),
      newPassword: formats.requiredPassword,
    }),
  }),
  authenticate: commonValidators.credentials,
  update: celebrate({
    body: Joi.object({
      password: formats.password,
      name: formats.name,
      company: formats.company,
      billing: Joi.object({
        currency: formats.currency,
        financeExecutive: formats.email,
      }),
      usage: Joi.object({
        warningEmails: Joi.array().items(formats.email),
      }),
    }),
  }),
  paginatedFind: celebrate({
    body: Joi.object({
      type: Joi.string()
        .valid(
          'Request',
          'Invoice',
        ),
      query: Joi.object({
        email: Joi.string()
          .forbidden(),
      }),
      page: Joi.number()
        .integer()
        .positive(),
    }),
  }),
  readRequest: commonValidators.queryId,
  payInvoice: celebrate({
    body: Joi.object({
      id: formats.requiredId,
    }),
  }),
  readInvoice: commonValidators.queryId,
  stats: celebrate({
    body: Joi.object({
      year: Joi.number().integer().min(2019),
      month: Joi.number().integer().min(0).max(11),
      day: Joi.number().integer().min(1).max(31),
    }),
  }),
  requestSupport: celebrate({
    body: Joi.object({
      type: Joi.string().valid(
        'support',
        'help',
        'feature',
        'feedback',
        'other',
      ).required(),
      message: Joi.string().max(512),
      videoUrl: Joi.string().uri().max(256).allow(''),
    }),
  }),
};

export default validator;
