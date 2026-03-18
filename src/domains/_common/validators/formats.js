import { Joi } from 'celebrate';

const formats = {
  model: Joi.string()
    .valid('Admin', 'Participant', 'Examiner'),
  requiredModel: Joi.string()
    .valid('Admin', 'Participant', 'Examiner')
    .required(),
  email: Joi.string()
    .email({ minDomainSegments: 2 })
    .max(64),
  requiredEmail: Joi.string()
    .email({ minDomainSegments: 2 })
    .max(64)
    .required(),
  password: Joi.string()
    .min(8)
    .max(64),
  requiredPassword: Joi.string()
    .min(8)
    .max(64)
    .required(),
  id: Joi.string()
    .length(24)
    .hex(),
  requiredId: Joi.string()
    .length(24)
    .hex()
    .required(),
  phoneNumber: Joi.string()
    .pattern(/^(\+55|55)?\s?(?:\(?([1-9][1-9])\)?)\s?(?:((?:9\d|[2-9])\d{3})\-?(\d{4}))$/)
    .messages({
      'string.pattern.base': 'Please provide a valid Brazilian phone number (e.g., +55 11 99999-9999)',
    }),
  requiredPhoneNumber: Joi.string()
    .pattern(/^(\+55|55)?\s?(?:\(?([1-9][1-9])\)?)\s?(?:((?:9\d|[2-9])\d{3})\-?(\d{4}))$/)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid Brazilian phone number (e.g., +55 11 99999-9999)',
    }),
  name: Joi.string()
    .max(64),
  requiredName: Joi.string()
    .max(64)
    .required(),
  institution: Joi.string()
    .max(128),
  requiredInstitution: Joi.string()
    .max(128)
    .required(),
  status: Joi.string()
    .valid(
      'Pending email confirmation',
      'Email confirmed',
    ),
};

export default formats;
