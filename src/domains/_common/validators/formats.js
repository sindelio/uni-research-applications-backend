import { Joi } from 'celebrate';

const {
  BILLING_PLAN_TRIAL,
  BILLING_PLAN_CONSUMPTION,
  BILLING_PLAN_SUBSCRIPTION,
} = process.env;

const formats = {
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
  name: Joi.string()
    .max(64),
  company: Joi.string()
    .max(64),
  status: Joi.string()
    .valid(
      'Pending email confirmation',
      'Email confirmed',
    ),
  plan: Joi.string()
    .valid(
      BILLING_PLAN_TRIAL,
      BILLING_PLAN_CONSUMPTION,
      BILLING_PLAN_SUBSCRIPTION,
    ),
  currency: Joi.string()
    .valid(
      'BRL',
      'USD',
      'EUR',
    ),
  usage: Joi.number()
    .integer()
    .positive()
    .max(10_000)
    .allow(0),
  amount: Joi.number()
    .positive()
    .max(100_000)
    .allow(0),
  linkedinId: Joi.string()
    .max(64),
  requiredLinkedinId: Joi.string()
    .max(64),
  apiKey: Joi.string()
    .max(512),
  locale: Joi.string()
    .valid('pt_BR', 'en_US'),
  requiredAction: Joi.string()
    .valid('Copy', 'List', 'Parse', 'Search')
    .required(),
  cookies: {
    LI_AT_VALUE: Joi.string().required(),
    JSESSIONID_VALUE: Joi.string().required(),
    CSRF_VALUE: Joi.string().required(),
  },
};

export default formats;
