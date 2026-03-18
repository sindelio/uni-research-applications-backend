import { celebrate, Joi } from 'celebrate';
import formats from '../../_common/validators/formats.js';
import commonValidators from '../../_common/validators/validators.js';

const validator = {
  authenticate: commonValidators.credentials,
  update: celebrate({
    body: Joi.object({
      password: formats.password,
      name: formats.name,
    }),
  }),
  paginatedFind: celebrate({
    body: Joi.object({
      model: Joi.string().valid(
        'SuperAdmin',
        'Admin',
        'Participant',
        'Examiner',
        'Project',
        'ErrorLog',
      ),
      query: Joi.object(),
      page: Joi.number()
        .integer()
        .positive(),
    }),
  }),
  createUser: celebrate({
    query: Joi.object({
      model: formats.requiredModel,
    }),
    body: Joi.object({
      email: formats.requiredEmail,
      password: formats.requiredPassword,
      phoneNumber: formats.requiredPhoneNumber,
      institution: formats.requiredInstitution,
      name: formats.requiredName,
    }),
  }),
  readUser: celebrate({
    query: Joi.object({
      model: formats.requiredModel,
      email: formats.requiredEmail,
    }),
  }),
  updateUser: celebrate({
    query: Joi.object({
      model: formats.requiredModel,
      email: formats.requiredEmail,
    }),
    body: Joi.object({
      password: formats.password,
      phoneNumber: formats.phoneNumber,
      institution: formats.requiredInstitution,
      name: formats.requiredName,
      status:formats.status,
    }),
  }),
  deleteUser: celebrate({
    query: Joi.object({
      model: formats.requiredModel,
      email: formats.requiredEmail,
    }),
  }),
};

export default validator;
