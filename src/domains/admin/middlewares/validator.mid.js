import { celebrate, Joi } from 'celebrate';
import formats from '../../_common/validators/formats.js';
import commonValidators from '../../_common/validators/validators.js';
import { is } from 'date-fns/locale';

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
        'Admin',
        'User',
        'Request',
        'Invoice',
        'EmailAccount',
        'LinkedinAccount',
        'GithubAccount',
        'LinkedinLead',
        'ErrorLog',
      ),
      query: Joi.object(),
      page: Joi.number()
        .integer()
        .positive(),
    }),
  }),
  createUser: commonValidators.credentials,
  readUser: commonValidators.queryEmail,
  updateUser: celebrate({
    query: Joi.object({
      email: formats.requiredEmail,
    }),
    body: Joi.object({
      password: formats.password,
      name: formats.name,
      company: formats.company,
      status:formats.status,
      billing: Joi.object({
        plan: formats.plan,
        trial: Joi.object({
          credits: {
            copy: formats.usage,
            parse: formats.usage,
            search: formats.usage,
          },
        }),
        consumption: Joi.object({
          price: {
            copy: formats.amount,
            parse: formats.amount,
            search: formats.amount,
          },
        }),
        subscription: Joi.object({
          monthlyAmount: {
            copy: formats.amount,
            parse: formats.amount,
            search: formats.amount,
            total: formats.amount,
          },
        }),
        currency: formats.currency,
        financeExecutive: formats.email,
      }),
      usage: Joi.object({
        warningEmails: Joi.array().items(formats.email),
        copy: Joi.object({
          isCopyWarningSent: Joi.boolean(),
          dailyUsage: formats.usage,
          dailyLimit: formats.usage,
        }),
        parse: Joi.object({
          isParseWarningSent: Joi.boolean(),
          dailyUsage: formats.usage,
          dailyLimit: formats.usage,
        }),
        search: Joi.object({
          isSearchWarningSent: Joi.boolean(),
          dailyUsage: formats.usage,
          dailyLimit: formats.usage,
        }),
      }),
      apiKey: formats.apiKey,
    }),
  }),
  deleteUser: commonValidators.queryEmail,
  readRequest: commonValidators.queryId,
  deleteRequest: commonValidators.queryId,
  createInvoice: celebrate({
    body: Joi.object({
      email: formats.requiredEmail,
      month: Joi.number().valid(
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
      ).required(),
      year: Joi.number()
        .integer()
        .greater(2022)
        .required(),
    }),
  }),
  createInvoices: celebrate({
    body: Joi.object({
      month: Joi.number().valid(
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
      ).required(),
      year: Joi.number()
        .integer()
        .greater(2023)
        .required(),
    }),
  }),
  markInvoiceAsPaid: commonValidators.queryId,
  readInvoice: commonValidators.queryId,
  deleteInvoice: commonValidators.queryId,
  createLinkedinAccount: celebrate({
    body: Joi.object({
      email: formats.requiredEmail,
      password: formats.requiredPassword,
      linkedinId: formats.requiredLinkedinId,
      locale: formats.locale,
      action: formats.requiredAction,
      cookies: formats.cookies,
    }),
  }),
  readLinkedinAccount: commonValidators.queryEmail,
  updateLinkedinAccount: celebrate({
    query: Joi.object({
      email: formats.requiredEmail,
    }),
    body: Joi.object({
      password: formats.password,
      linkedinId: formats.linkedinId,
      locale: formats.locale,
      action: formats.requiredAction,
      cookies: formats.cookies,
    }),
  }),
  deleteLinkedinAccount: commonValidators.queryEmail,
  testLinkedinAccount: commonValidators.queryEmail,
};

export default validator;
