import { celebrate, Joi } from 'celebrate';
import formats from '../../_common/validators/formats.js';
import commonValidators from '../../_common/validators/validators.js';
import areas from '../../_common/helpers/areas.js';

const validator = {
  create: celebrate({
    body: Joi.object({
      email: formats.requiredEmail,
      password: formats.requiredPassword,
      phone: formats.requiredPhone,
      institution: formats.requiredInstitution,
      name: formats.requiredName,
      areas: Joi.array()
        .min(1)
        .items(Joi.string().valid(...areas))
        .required(),
      maxProjects: Joi.number()
        .integer()
        .min(3)
        .max(100)
        .required(),
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
      phone: formats.phone,
      institution: formats.institution,
      name: formats.name,
      areas: Joi.array()
        .min(1)
        .items(Joi.string().valid(...areas)),
      maxProjects: Joi.number()
        .integer()
        .min(3)
        .max(100),
    }),
  }),
  stats: celebrate({
    body: Joi.object({}),
  }),
  paginatedFind: celebrate({
    body: Joi.object({
      model: Joi.string()
        .valid('Examiner', 'Project'),
      query: Joi.object({
        email: Joi.string()
          .forbidden(),
      }),
      page: Joi.number()
        .integer()
        .positive(),
    }),
  }),
  readProject: commonValidators.queryId,
  reviewProject: celebrate({
    query: Joi.object({
      id: formats.requiredId,
    }),
    body: Joi.object({
      acceptance: Joi.string().valid('Approved', 'Rejected'),
    }),
  }),
};

export default validator;
