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
    }),
  }),
  paginatedFind: celebrate({
    body: Joi.object({
      model: Joi.string()
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
  uploadReceipt: celebrate({
    body: Joi.object({
      receiptFile64Encoded: Joi.string().required(),
      nameOnFile: Joi.string().required(),
    }),
  }),
  createProject: celebrate({
    body: Joi.object({
      title: Joi.string().max(500).required(),
      authors: Joi.array()
        .items(Joi.object({
          name: Joi.string().max(500).required(),
          institution: Joi.string().max(500).required(),
          city: Joi.string().max(500).required(),
          state: Joi.string().min(2).max(2).required(),
        }))
        .min(1)
        .max(100)
        .required(),
      areas: Joi.array()
        .items(Joi.string().valid(...areas))
        .min(1)
        .max(2)
        .required(),
      summary: Joi.string().max(2450).required(),
      keywords: Joi.array()
        .items(Joi.string().min(2).max(500))
        .required(),
      references: Joi.array()
        .items(Joi.string().min(3).max(500))
        .required(),
      projectType: Joi.string().valid('Convencional', 'Fotográfico'),
      photoFile64Encoded: Joi.string().allow(''),
    }),
  }),
  readProject: celebrate({
    query: Joi.object({
      projectId: formats.requiredId,
    }),
  }),
  updateProject: celebrate({
    query: Joi.object({
      projectId: formats.requiredId,
    }),
    body: Joi.object({
      title: Joi.string().max(128),
      authors: Joi.array()
        .items(Joi.object({
          name: Joi.string().max(256).required(),
          institution: Joi.string().max(256).required(),
        }))
        .min(1)
        .max(50),
      areas: Joi.array()
        .items(Joi.string().valid(...areas))
        .min(1)
        .max(2),
      summary: Joi.string().max(512),
      keywords: Joi.array().items(Joi.string().min(3).max(256)),
      references: Joi.array().items(Joi.string().min(3).max(256)),
      projectType: Joi.string().valid('Convencional', 'Fotográfico'),
      photoFile64Encoded: Joi.string(),
    }),
  }),
  deleteProject: celebrate({
    query: Joi.object({
      projectId: formats.requiredId,
    }),
  }),
};

export default validator;
