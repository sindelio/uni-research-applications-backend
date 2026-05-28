import { celebrate, Joi } from 'celebrate';
import formats from '../../_common/validators/formats.js';
import commonValidators from '../../_common/validators/validators.js';
import areas from '../../_common/helpers/areas.js';

const {
  PROJECT_APPROVED,
  PROJECT_REJECTED,
} = process.env;

const validator = {
  create: celebrate({
    body: Joi.object({
      email: formats.requiredEmail,
      password: formats.requiredPassword,
      phone: formats.requiredPhone,
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
      query: Joi.object(),
      page: Joi.number()
        .integer()
        .positive(),
    }),
  }),
  readProject: celebrate({
    query: Joi.object({
      projectId: formats.requiredId,
    }),
  }),
  evaluateProject: celebrate({
    query: Joi.object({
      projectId: formats.requiredId,
    }),
    body: Joi.object({
      status: Joi.string()
        .valid(PROJECT_APPROVED, PROJECT_REJECTED)
        .required(),
      title: Joi.boolean().required(),
      authors: Joi.boolean().required(),
      areas: Joi.boolean().required(),
      summary: Joi.boolean().required(),
      keywords: Joi.boolean().required(),
      references: Joi.boolean().required(),
      projectType: Joi.boolean().required(),
      banner: Joi.boolean().required(),
      commentaries: Joi.string().required(),
      caveats: Joi.string().required(),
    }),
  }),
};

export default validator;
