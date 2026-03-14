import { celebrate, Joi } from 'celebrate';
import formats from '../../_common/validators/formats.js';
import commonValidators from '../../_common/validators/validators.js';

const validator = {
  create: celebrate({
    body: Joi.object({
      email: formats.requiredEmail,
      password: formats.requiredPassword,
      phoneNumber: formats.requiredPhoneNumber,
      type: Joi.string().valid(
        'participant',
        'examiner',
      ).required(),
      institution: formats.requiredInstitution,
      name: formats.requiredName,
    }),
  }),
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
      phoneNumber: formats.phoneNumber,
      institution: formats.requiredInstitution,
      name: formats.requiredName,
    }),
  }),
  paginatedFind: celebrate({
    body: Joi.object({
      type: Joi.string()
        .valid('Project'),
      query: Joi.object({
        email: Joi.string()
          .forbidden(),
      }),
      page: Joi.number()
        .integer()
        .positive(),
    }),
  }),
  stats: celebrate({
    body: Joi.object({}),
  }),
};

export default validator;
