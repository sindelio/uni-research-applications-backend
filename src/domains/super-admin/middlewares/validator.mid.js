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
      type: Joi.string().valid(
        'SuperAdmin',
        'User',
        'ErrorLog',
      ),
      query: Joi.object(),
      page: Joi.number()
        .integer()
        .positive(),
    }),
  }),
  createUser: celebrate({
    body: Joi.object({
      email: formats.requiredEmail,
      password: formats.requiredPassword,
      phoneNumber: formats.requiredPhoneNumber,
      type: Joi.string().valid(
        'admin',
        'participant',
        'examiner',
      ).required(),
      institution: formats.requiredInstitution,
      name: formats.requiredName,
    }),
  }),
  readUser: commonValidators.queryEmail,
  updateUser: celebrate({
    query: Joi.object({
      email: formats.requiredEmail,
    }),
    body: Joi.object({
      password: formats.password,
      phoneNumber: formats.phoneNumber,
      type: Joi.string().valid(
        'admin',
        'participant',
        'examiner',
      ),
      institution: formats.requiredInstitution,
      name: formats.requiredName,
      status:formats.status,
    }),
  }),
  deleteUser: commonValidators.queryEmail,
};

export default validator;
