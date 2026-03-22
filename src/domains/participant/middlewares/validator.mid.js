import { celebrate, Joi } from 'celebrate';
import formats from '../../_common/validators/formats.js';
import commonValidators from '../../_common/validators/validators.js';
import areas from '../../_common/helpers/areas.js';

const validator = {
  create: celebrate({
    body: Joi.object({
      email: formats.requiredEmail,
      password: formats.requiredPassword,
      phoneNumber: formats.requiredPhoneNumber,
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
  stats: celebrate({
    body: Joi.object({}),
  }),
  paginatedFind: celebrate({
    body: Joi.object({
      model: Joi.string()
        .valid('Examiner'),
      query: Joi.object({
        email: Joi.string()
          .forbidden(),
      }),
      page: Joi.number()
        .integer()
        .positive(),
    }),
  }),
  createProject: celebrate({
    body: Joi.object({
      authors: Joi.array()
        .items(Joi.string().max(128))
        .min(1)
        .max(20)
        .required(),
      title: Joi.string().max(128).required(),
      areas: Joi.array()
        .items(Joi.string().valid(...areas))
        .min(1)
        .max(2)
        .required(),
      description: Joi.string().max(2048).required(),
    }),
  }),
  readProject: commonValidators.queryId,
  updateProject: celebrate({
    query: Joi.object({
      id: formats.requiredId,
    }),
    body: Joi.object({
      authors: Joi.array()
        .items(Joi.string().max(128))
        .min(1)
        .max(20)
        .required(),
      title: Joi.string().max(128).required(),
      areas: Joi.array()
        .items(Joi.string().valid(...areas))
        .min(1)
        .max(2)
        .required(),
      description: Joi.string().max(2048).required(),
    }),
  }),
  deleteProject: commonValidators.queryId,
};

export default validator;
