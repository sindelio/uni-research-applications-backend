import { celebrate, Joi } from 'celebrate';
import formats from '../../_common/validators/formats.js';
import commonValidators from '../../_common/validators/validators.js';
import areas from '../../_common/helpers/areas.js';

const {
  PROJECT_STATUS_WAITING_EXAMINER,
  PROJECT_STATUS_PENDING_REVIEW,
  PROJECT_STATUS_APPROVED,
  PROJECT_STATUS_REJECTED,
} = process.env;

const validator = {
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
  stats: celebrate({
    body: Joi.object({}),
  }),
  paginatedFind: celebrate({
    body: Joi.object({
      model: Joi.string()
        .valid('Admin', 'Participant', 'Examiner', 'Project'),
      query: Joi.object({
        email: Joi.string()
          .forbidden(),
      }),
      page: Joi.number()
        .integer()
        .positive(),
    }),
  }),
  createUser: celebrate({
    body: Joi.object({
      email: formats.requiredEmail,
      password: formats.requiredPassword,
      phone: formats.requiredPhone,
      institution: formats.requiredInstitution,
      name: formats.requiredName,
    }),
  }),
  readUser: celebrate({
    query: Joi.object({
      email: formats.requiredEmail,
    }),
  }),
  updateAdmin: celebrate({
    query: Joi.object({
      email: formats.requiredEmail,
    }),
    body: Joi.object({
      password: formats.password,
      phone: formats.phone,
      institution: formats.requiredInstitution,
      name: formats.requiredName,
      status: formats.status,
    }),
  }),
  updateExaminer: celebrate({
    query: Joi.object({
      email: formats.requiredEmail,
    }),
    body: Joi.object({
      password: formats.password,
      phone: formats.phone,
      institution: formats.requiredInstitution,
      name: formats.requiredName,
      areas: Joi.array()
        .min(1)
        .items(Joi.string().valid(...areas)),
      maxProjects: Joi.number()
        .integer()
        .min(3)
        .max(100),
      status: formats.status,
      hasAdminAuthorization: Joi.boolean(),
    }),
  }),
  updateParticipant: celebrate({
    query: Joi.object({
      email: formats.requiredEmail,
    }),
    body: Joi.object({
      password: formats.password,
      phone: formats.phone,
      institution: formats.requiredInstitution,
      name: formats.requiredName,
      status: formats.status,
    }),
  }),
  deleteUser: celebrate({
    query: Joi.object({
      email: formats.requiredEmail,
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
      status: Joi.string().valid(
        PROJECT_STATUS_WAITING_EXAMINER,
        PROJECT_STATUS_PENDING_REVIEW,
        PROJECT_STATUS_APPROVED,
        PROJECT_STATUS_REJECTED,
      ),
      evaluation: Joi.object({
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
  }),
  deleteProject: celebrate({
    query: Joi.object({
      projectId: formats.requiredId,
    }),
  }),
  allocateExaminerToProject: celebrate({
    query: Joi.object({
      projectId: formats.requiredId,
    }),
    body: Joi.object({
      examinerEmail: formats.requiredEmail,
    }),
  }),
};

export default validator;
