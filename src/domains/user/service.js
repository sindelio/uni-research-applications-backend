import {
  User,
} from '../../database/models.js';
import jsonWebToken from 'jsonwebtoken';
import crypto from 'crypto';
import exists from '../../helpers/exists.js';
import generateUser from '../_common/helpers/generate-user.js';
import generateHtmlMessage from '../../helpers/generate-html-message.js';
import setDate from '../../helpers/set-date.js';
import dotifyObject from '../../helpers/dotify.js';
import findOne from '../../helpers/find-one.js';
import paginatedFind from '../../helpers/paginated-find.js';
import notify from '../../functions/notify.js';
import BadRequest from '../../errors/bad-request.js';

const {
  FRONTEND_URL,
  JWT_SECRET,
} = process.env;

const service = {
  async create(userInfo) {
    const user = await generateUser(userInfo);
    return {
      success: true,
      data: user,
      error: null,
    };
  },
  async confirmEmail(email) {
    const user = await findOne(User, { email });
    if (user.status !== 'Pending email confirmation') {
      throw new BadRequest(`User ${email} status is not pending confirmation`);
    }
    if (user.status === 'Email confirmed') {
      throw new BadRequest(`User ${email} already confirmed`);
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
    const jwt = jsonWebToken.sign(credentials, JWT_SECRET, options);
    return {
      success: true,
      data: { jwt },
      error: null,
    };
  },
  async read(email) {
    const user = await findOne(User, { email });
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
    return {
      success: true,
      data: null,
      error: null,
    };
  },
  async paginatedFind(type, query, page = 1) {
    const Model = User;
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
  async stats(email, year, month, day) {
    return {
      success: true,
      data: {
        stats: null,
      },
      error: null,
    };
  },
};

export default service;
