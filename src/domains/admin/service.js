import {
  Admin,
  User,
  Request,
  Invoice,
  EmailAccount,
  LinkedinAccount,
  GithubAccount,
  LinkedinLead,
  ErrorLog,
} from '../../database/models.js';
import jsonWebToken from 'jsonwebtoken';
import Stripe from 'stripe';
import exists from '../../helpers/exists.js';
import setDate from '../../helpers/set-date.js';
import findOne from '../../helpers/find-one.js';
import find from '../../helpers/find.js';
import paginatedFind from '../../helpers/paginated-find.js';
import generateUser from '../_common/helpers/generate-user.js';
import dotifyObject from '../../helpers/dotify.js';
import craftLinkedinUrl from '../user/data-source/linkedin/helpers/craft-url.js';
import generateInvoice from '../_common/helpers/generate-invoice.js';
import generateHtmlMessage from '../../helpers/generate-html-message.js';
import notify from '../../functions/notify.js';
import notifyUserAboutInvoice from '../../functions/notify-user-about-invoice.js';
import requestLinkedinApi from '../user/data-source/linkedin/functions/request-api.js';
import newsletterRecipients from './utils/newsletter-recipients.js';
import logger from '../../logs/logger.js';
import NotFound from '../../errors/not-found.js';
import BadRequest from '../../errors/bad-request.js';

const {
  ENVIRONMENT,
  ADMIN_JWT_SECRET,
  BILLING_PLAN_CONSUMPTION,
  BILLING_PLAN_SUBSCRIPTION,
  STRIPE_SECRET_KEY,
  SENDER_EMAIL,
} = process.env;

const stripe = new Stripe(STRIPE_SECRET_KEY);

async function checkInvoiceBeforeGeneration(user, monthOfReference, yearOfReference) {
  const { email } = user;
  const plan = user.billing.plan;
  if (
    plan !== BILLING_PLAN_CONSUMPTION
    && plan !== BILLING_PLAN_SUBSCRIPTION
  ) {
    throw new BadRequest(
      `User ${email} billing plan is not ${BILLING_PLAN_CONSUMPTION} or ${BILLING_PLAN_SUBSCRIPTION}`
    );
  }
  const date = new Date();
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();
  if (
    (yearOfReference > currentYear)
    || (yearOfReference === currentYear && monthOfReference > currentMonth)
  ) {
    throw new BadRequest('Cannot create an invoice for a month in the future');
  }
  const invoice = await Invoice.findOne({
    email,
    monthOfReference,
    yearOfReference,
  });
  if (exists(invoice)) {
    throw new BadRequest(
      `Invoice for ${email} at ${monthOfReference}/${yearOfReference} already exists in database`,
    );
  }
}

async function checkLinkedinSession(email) {
  const account = await findOne(LinkedinAccount, { email });
  const { linkedinId } = account;
  let isSessionValid = true;
  try {
    const profileUrl = await craftLinkedinUrl(
      `/identity/profiles/${linkedinId}/profileView`
    );
    await requestLinkedinApi(profileUrl, account);
  } catch (err) {
    logger.error(err);
    isSessionValid = false;
  }
  return isSessionValid;
}

const service = {
  async authenticate(email, password) {
    const admin = await findOne(Admin, { email });
    if (admin?.password !== password) {
      throw new BadRequest('Incorrect password, please try again');
    }
    const options = {
      algorithm: 'HS256',
      expiresIn: '24h',
    };
    const credentials = {
      email,
      password,
    };
    const jwt = await jsonWebToken.sign(
      credentials,
      ADMIN_JWT_SECRET,
      options,
    );
    return {
      success: true,
      data: { jwt },
      error: null,
    };
  },
  async read(email) {
    const admin = await findOne(Admin, { email });
    return {
      success: true,
      data: admin,
      error: null,
    };
  },
  async update(email, update) {
    const admin = await findOne(Admin, { email });
    await setDate(update, 'lastUpdatedAt');
    const dotifiedUpdate = dotifyObject(update);
    await admin.updateOne(dotifiedUpdate);
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async stats() {
    const users = await find(User, {});
    const userStats = {
      total: {
        combined: users?.length,
        plan: {
          consumption: 0,
        },
      },
      overTime: [],
    };
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    for (
      let i = 0, month = currentMonth, year = currentYear;
      i <= 12;
      i += 1
    ) {
      const monthStats = {
        month,
        year,
      };
      const usersSignedUpInMonth = users.filter((user) => {
        const createdAt = new Date(user.createdAt.isoDate);
        const createdAtMonth = createdAt.getMonth();
        const createdAtYear = createdAt.getFullYear();
        if (createdAtMonth === month && createdAtYear === year) return true;
        return false;
      });
      const signUpsInMonth = usersSignedUpInMonth.length;
      monthStats.signUps = signUpsInMonth;
      userStats.overTime.push(monthStats);
      month -= 1;
      if (month === 0) {
        month = 12;
        year -= 1;
      }
    }
    users.forEach((user) => {
      if (user.billing.plan === BILLING_PLAN_CONSUMPTION) {
        userStats.total.plan.consumption += 1;
      }
    });
    const requests = await Request.find({});
    const requestStats = {
      total: {
        combined: requests.length,
        source: {
          linkedin: 0,
          github: 0,
          dribbble: 0,
        },
        plan: {
          pasAsYouGo: 0,
        },
      },
      overTime: [],
    };
    for (
      let i = 0, month = currentMonth, year = currentYear;
      i <= 12;
      i += 1
    ) {
      const monthStats = {
        month,
        year,
        combined: 0,
        source: {
          linkedin: 0,
          github: 0,
          dribbble: 0,
        },
      };
      const requestsInMonth = requests.filter((request) => {
        const createdAt = new Date(request.createdAt.isoDate);
        const createdAtMonth = createdAt.getMonth();
        const createdAtYear = createdAt.getFullYear();
        if (
          createdAtMonth === month
          && createdAtYear === year
        ) {
          return true;
        }
        return false;
      });
      monthStats.combined = requestsInMonth.length;
      requestsInMonth.forEach((request) => {
        if (request.source === 'LinkedIn') {
          monthStats.source.linkedin += 1;
        }
        if (request.source === 'GitHub') {
          monthStats.source.github += 1;
        }
        if (request.source === 'Dribbble') {
          monthStats.source.dribbble += 1;
        }
      });
      requestStats.overTime.push(monthStats);
      month -= 1;
      if (month === 0) {
        month = 12;
        year -= 1;
      }
    }
    requests.forEach((request) => {
      if (request.billing.plan === BILLING_PLAN_CONSUMPTION) {
        requestStats.total.plan.consumption += 1;
      }
    });
    requests.forEach((request) => {
      if (request.source === 'LinkedIn') {
        requestStats.total.source.linkedin += 1;
      }
      if (request.source === 'GitHub') {
        requestStats.total.source.github += 1;
      }
      if (request.source === 'Dribbble') {
        requestStats.total.source.dribbble += 1;
      }
    });
    return {
      success: true,
      data: {
        users: userStats,
        requests: requestStats,
      },
      error: null,
    };
  },
  async paginatedFind(type, query, page = 1) {
    let Model = Admin;
    if (type === 'User') Model = User;
    if (type === 'Request') Model = Request;
    if (type === 'Invoice') Model = Invoice;
    if (type === 'EmailAccount') Model = EmailAccount;
    if (type === 'LinkedinAccount') Model = LinkedinAccount;
    if (type === 'GithubAccount') Model = GithubAccount;
    if (type === 'LinkedinLead') Model = LinkedinLead;
    if (type === 'ErrorLog') Model = ErrorLog;
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
  async createUser(email, password) {
    const user = await generateUser(email, password);
    return {
      success: true,
      data: user,
      error: null,
    };
  },
  async readUser(email) {
    const user = await findOne(User, { email });
    return {
      success: true,
      data: user,
      error: null,
    };
  },
  async updateUser(email, update) {
    const user = await findOne(User, { email });
    await setDate(update, 'lastUpdatedAt');
    const dotifiedUpdate = await dotifyObject(update);
    await user.updateOne(dotifiedUpdate);
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async deleteUser(email) {
    const user = await findOne( User, { email });
    await stripe.customers.del(user.billing.stripeCustomerId);
    await User.deleteOne({ email });
    await Request.deleteMany({ email });
    await Invoice.deleteMany({ email });
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async readRequest(id) {
    const request = await findOne(Request, { _id: id });
    return {
      success: true,
      data: request,
      error: null,
    };
  },
  async deleteRequest(id) {
    const request = await findOne(Request, { _id: id });
    await Request.deleteOne({ _id: request.id });
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async createInvoice(email, monthOfReference, yearOfReference) {
    const user = await findOne(User, { email });
    await checkInvoiceBeforeGeneration(
      user,
      monthOfReference,
      yearOfReference,
    );
    const invoice = await generateInvoice(
      user,
      monthOfReference,
      yearOfReference,
    );
    await invoice.save();
    await notifyUserAboutInvoice(user, invoice);
    return {
      success: true,
      data: invoice,
      error: null,
    };
  },
  async createInvoices(monthOfReference, yearOfReference) {
    const users = await find(
      User,
      { $or: [
        { 'billing.plan': BILLING_PLAN_CONSUMPTION },
        { 'billing.plan': BILLING_PLAN_SUBSCRIPTION },
      ] },
      true,
    );
    const promisedInvoices = users.map(async (user) => {
      await checkInvoiceBeforeGeneration(
        user,
        monthOfReference,
        yearOfReference,
      );
      const invoice = await generateInvoice(
        user,
        monthOfReference,
        yearOfReference,
      );
      return invoice;
    });
    const invoices = await Promise.all(promisedInvoices);
    invoices.map(async (invoice) => {
      await invoice.save();
    });
    invoices.map(async (invoice) => {
      const user = await User.findOne({ email: invoice.email });
      await notifyUserAboutInvoice(user, invoice);
    });
    const invoicesIds = invoices.map((invoice) => invoice.id);
    return {
      success: true,
      data: invoicesIds,
      error: null,
    };
  },
  async markInvoiceAsPaid(id) {
    const invoice = await findOne(Invoice, { _id: id });
    invoice.paid = true;
    await setDate(invoice, 'paidAt');
    await invoice.save();
    return {
      success: true,
      data: invoice,
      error: null,
    };
  },
  async readInvoice(id) {
    const invoice = await findOne(Invoice, { _id: id });
    return {
      success: true,
      data: invoice,
      error: null,
    };
  },
  async deleteInvoice(id) {
    const invoice = await findOne(Invoice, { _id: id });
    await Invoice.deleteOne({ _id: invoice.id });
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async createLinkedinAccount(email, password, linkedinId, locale, action, cookies) {
    let account = await findOne(LinkedinAccount, { email }, true);
    account = new LinkedinAccount({
      email,
      password,
      linkedinId,
      locale,
      action,
      cookies,
    });
    await setDate(account, 'createdAt');
    await account.save();
    return {
      success: true,
      data: account,
      error: null,
    };
  },
  async readLinkedinAccount(email) {
    const account = await findOne(LinkedinAccount, { email });
    return {
      success: true,
      data: account,
      error: null,
    };
  },
  async updateLinkedinAccount(email, update) {
    const account = await findOne(LinkedinAccount, { email });
    await setDate(update, 'lastUpdatedAt');
    const dotifiedUpdate = await dotifyObject(update);
    await account.updateOne(dotifiedUpdate);
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async deleteLinkedinAccount(email) {
    const account = await findOne(LinkedinAccount, { email });
    await LinkedinAccount.deleteOne({ email: account.email });
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async testLinkedinAccount(email) {
    const isSessionValid = await checkLinkedinSession(email);
    return {
      success: true,
      data: { isSessionValid },
      error: null,
    };
  },
  async testAllLinkedinAccounts() {
    const accounts = await find(LinkedinAccount, {}, true);
    const promisedSessions = accounts.map(async (account) => {
      const { email } = account;
      const isSessionValid = await checkLinkedinSession(email);
      const accountSession = {
        email,
        isSessionValid,
      };
      return accountSession;
    });
    const sessions = await Promise.all(promisedSessions);
    return {
      success: true,
      data: sessions,
      error: null,
    };
  },
  async saveAllLinkedinAccountsCookies() {
    const env = ENVIRONMENT;
    let accountsInFile = null;
    if (env === 'DEVELOPMENT') {
      accountsInFile = await import('../../database/seeds/accounts/dev.js');
    }
    if (env === 'PRODUCTION') {
      accountsInFile = await import('../../database/seeds/accounts/prod.js');
    }
    const linkedinAccountsInFile = accountsInFile?.default?.linkedin;
    if (!exists(linkedinAccountsInFile)) {
      throw new NotFound('linkedinAccountsInFile is null or undefined');
    }
    if (!Array.isArray(linkedinAccountsInFile)) {
      throw new NotFound('linkedinAccountsInFile is not an array');
    }
    for (let i = 0; i < linkedinAccountsInFile?.length; i += 1) {
      const currentLinkedinAccountInFile = linkedinAccountsInFile[i];
      const email = currentLinkedinAccountInFile.email;
      await this.updateLinkedinAccount(email, currentLinkedinAccountInFile);
    }
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async createNewsletter() {
    const users = await find(User, {});
    const bccRecipients = users.map((user) => {
      const { email } = user;
      return email;
    });
    if (ENVIRONMENT === 'PRODUCTION') {
      bccRecipients.push(...newsletterRecipients);
    }
    const subject = 'TalentSourcery newsletter';
    const htmlMessage = await generateHtmlMessage(
      'Hello partners o/',
      `
        MORE TEXT HERE!!!
        Thank you so much for trusting us!!!<br>
        Kindly,<br>
        -- <br>
      `
    );
    const recipients = [SENDER_EMAIL];
    notify(
      recipients,
      subject,
      htmlMessage,
      [...bccRecipients],
    );
    return {
      success: true,
      data: null,
      error: null,
    };
  },
};

export default service;
