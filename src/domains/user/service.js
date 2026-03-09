import {
  User,
  Request,
  Invoice,
} from '../../database/models.js';
import jsonWebToken from 'jsonwebtoken';
import Stripe from 'stripe';
import crypto from 'crypto';
import { isFuture } from 'date-fns';
import { TZDate } from '@date-fns/tz';
import exists from '../../helpers/exists.js';
import setDate from '../../helpers/set-date.js';
import dotifyObject from '../../helpers/dotify.js';
import findOne from '../../helpers/find-one.js';
import find from '../../helpers/find.js';
import paginatedFind from '../../helpers/paginated-find.js';
import generateUser from '../_common/helpers/generate-user.js';
import generateHtmlMessage from '../../helpers/generate-html-message.js';
import convertCurrency from '../_common/helpers/convert-currency.js';
import {
  totalStats,
  yearStats,
  monthStats,
  hourStats,
} from '../_common/helpers/stats.js';
import notify from '../../functions/notify.js';
import BadRequest from '../../errors/bad-request.js';

const {
  FRONTEND_URL,
  USER_JWT_SECRET,
  BILLING_PLAN_CONSUMPTION,
  BILLING_PLAN_SUBSCRIPTION,
  STRIPE_SECRET_KEY,
  STRIPE_COPY_PRODUCT_ID,
  STRIPE_SEARCH_PRODUCT_ID,
  STRIPE_PARSE_PRODUCT_ID,
  STRIPE_SUBSCRIPTION_PRODUCT_ID,
} = process.env;

const stripe = new Stripe(STRIPE_SECRET_KEY);

const service = {
  async create(email, password) {
    const user = await generateUser(email, password);
    return {
      success: true,
      data: user,
      error: null,
    };
  },
  async confirmEmail(email) {
    const user = await findOne(User, { email });
    if (user.status === 'Email confirmed') {
      throw new BadRequest(`User ${email} already confirmed`);
    }
    if (user.status !== 'Pending email confirmation') {
      throw new BadRequest(`User ${email} status is not pending confirmation`);
    }
    if (user.email === email) {
      user.status = 'Email confirmed';
      await user.save();
    }
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async recoverPassword(email) {
    const user = await findOne(User, { email });
    const token = crypto.randomBytes(8).toString('hex');
    user.passwordRecoveryToken = token;
    await user.save();
    const subject = 'TalentSourcery password recovery';
    const htmlMessage = await generateHtmlMessage(
      'Greetings from TalentSourcery!',
      'You can reset your password by clicking on the link below:',
      `${FRONTEND_URL}/app/password-reset?email=${email}&token=${token}`,
      'Reset password',
    );
    notify(email, subject, htmlMessage);
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async resetPassword(email, passwordRecoveryToken, newPassword) {
    const user = await findOne(User, { email });
    if (!exists(user.passwordRecoveryToken)) {
      throw new BadRequest('There is no request to recover the password');
    }
    if (passwordRecoveryToken !== user.passwordRecoveryToken) {
      throw new BadRequest('Incorrect password recovery token');
    }
    user.password = newPassword;
    user.passwordRecoveryToken = undefined;
    await user.save();
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async authenticate(email, password) {
    const user = await findOne(User, { email });
    if (user.status === 'Pending email confirmation') {
      throw new BadRequest('Please confirm your email before signing in');
    }
    if (password !== user?.password) {
      throw new BadRequest('Incorrect password, please try again');
    }
    const options = {
      algorithm: 'HS256',
      expiresIn: '7d',
    };
    const credentials = {
      email,
      password,
    };
    const jwt = await jsonWebToken.sign(
      credentials,
      USER_JWT_SECRET,
      options,
    );
    return {
      success: true,
      data: { jwt },
      error: null,
    };
  },
  async read(email) {
    const user = await findOne(User, { email });
    user.billing.stripeCustomerId = '***';
    user.passwordRecoveryToken = '***';
    return {
      success: true,
      data: user,
      error: null,
    };
  },
  async update(email, update) {
    const user = await findOne(User, { email });
    await setDate(update, 'lastUpdatedAt');
    await convertCurrency(user, update);
    const dotifiedUpdate = await dotifyObject(update);
    await user.updateOne(dotifiedUpdate);
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async delete(email) {
    await findOne(User, { email });
    await User.deleteOne({ email });
    await Request.deleteMany({ email });
    await Invoice.deleteMany({ email });
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async paginatedFind(type, query, page = 1) {
    let Model = Request;
    if (type === 'Invoice') Model = Invoice;
    const { 
      numberOfItems,
      itemsInPage,
    } = await paginatedFind(
      Model,
      query,
      page,
    );
    return {
      success: true,
      data: {
        numberOfItems,
        itemsInPage,
      },
      error: null,
    };
  },
  async readRequest(email, id) {
    const request = await findOne(Request, { email, _id: id });
    return {
      success: true,
      data: request,
      error: null,
    };
  },
  async payInvoice(email, id) {
    const user = await findOne(User, { email });
    const invoice = await findOne(Invoice, { email, _id: id });
    if (invoice.paid === true) {
      throw new BadRequest(`Invoice ${id} already paid`);
    }
    if (invoice.amount.total < 0.5) {
      throw new BadRequest(`
        Invoice ${id} does not need payment, amount is less than 50 cents
      `);
    }
    const { plan, stripeCustomerId } = user.billing;
    const lineItems = [];
    let unitAmountInCents = 0;
    if (plan === BILLING_PLAN_CONSUMPTION) {
      if (invoice.usage.copy > 0) {
        unitAmountInCents = invoice.consumption.price.copy * 100;
        lineItems.push({
          price_data: {
            currency: invoice.currency,
            product: STRIPE_COPY_PRODUCT_ID,
            unit_amount: unitAmountInCents,
          },
          quantity: invoice.usage.copy,
        });
      }
      if (invoice.usage.parse > 0) {
        unitAmountInCents = invoice.consumption.price.parse * 100;
        lineItems.push({
          price_data: {
            currency: invoice.currency,
            product: STRIPE_PARSE_PRODUCT_ID,
            unit_amount: unitAmountInCents,
          },
          quantity: invoice.usage.parse,
        });
      }
      if (invoice.usage.search > 0) {
        unitAmountInCents = invoice.consumption.price.search * 100;
        lineItems.push({
          price_data: {
            currency: invoice.currency,
            product: STRIPE_SEARCH_PRODUCT_ID,
            unit_amount: unitAmountInCents,
          },
          quantity: invoice.usage.search,
        });
      }
    } else if (plan === BILLING_PLAN_SUBSCRIPTION) {
      unitAmountInCents = invoice.subscription.monthlyAmount.total * 100;
      lineItems.push({
        price_data: {
          currency: invoice.currency,
          product: STRIPE_SUBSCRIPTION_PRODUCT_ID,
          unit_amount: unitAmountInCents,
        },
        quantity: 1,
      });
    }
    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      metadata: {
        type: 'invoice',
        id: invoice.id,
      },
      customer: stripeCustomerId,
      line_items: lineItems,
      mode: 'payment',
      payment_method_types: ['card'],
      success_url: `${FRONTEND_URL}/app/billing/success`,
      cancel_url: `${FRONTEND_URL}/app/billing`,
    });
    const stripeCheckoutSessionUrl = stripeCheckoutSession.url;
    return {
      success: true,
      data: {
        stripeCheckoutSessionUrl,
      },
      error: null,
    };
  },
  async readInvoice(email, id) {
    const invoice = await findOne(Invoice, { email, _id: id });
    return {
      success: true,
      data: invoice,
      error: null,
    };
  },
  async stats(email, year, month, day) {
    const requests = await find(Request, { email, 'createdAt.year': year });
    const requestStats = {
      target: {
        year,
        month,
        day,
      },
      total: {
        combined: requests.length,
        action: {
          copy: 0,
          parse: 0,
        },
      },
      overTime: {
        yearly: [],
        monthly: [],
        daily: [],
      },
    };
    // Current date
    const currentDate = new TZDate(new Date(), 'America/Sao_Paulo');
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();
    // Target date
    let targetYear = currentYear;
    let targetMonth = currentMonth;
    let targetDay = currentDay;
    if (exists(year)) {
      targetYear = year;
    }
    if (exists(month)) {
      targetMonth = month;
    }
    if (exists(day)) {
      targetDay = day;
    }
    const targetDate = new TZDate(new Date(targetYear, targetMonth, targetDay), 'America/Sao_Paulo');
    if (isFuture(targetDate)) {
      throw new BadRequest('Cannot get stats for future dates');
    }
    await Promise.all([
      await totalStats(requests, requestStats),
      await yearStats(requests, requestStats, currentDate, targetDate),
      await monthStats(requests, requestStats, currentDate, targetDate),
      await hourStats(requests, requestStats, currentDate, targetDate),
    ]);
    return {
      success: true,
      data: {
        stats: requestStats,
      },
      error: null,
    };
  },
  async regenerateApiKey(email) {
    const user = await findOne(User, { email });
    const newApiKey = crypto.randomBytes(32).toString('hex');
    user.apiKey = newApiKey;
    await user.save();
    return {
      success: true,
      data: { apiKey: newApiKey },
      error: null,
    };
  },
  async requestSupport(email, type, message, videoUrl) {
    await findOne(User, { email });
    const subject = 'Support request';
    const htmlMessage = await generateHtmlMessage(
      'We received your support request!',
      `
        Type: ${type}<br>
        Message: ${message}<br>
        Video URL: ${videoUrl}<br>
      `,
    );
    notify(email, subject, htmlMessage);
    return {
      success: true,
      data: null,
      error: null,
    };
  },
};

export default service;
