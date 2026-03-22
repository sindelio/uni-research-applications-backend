// Note: Read and Delete are not reused

import crypto from 'crypto';
import jsonWebToken from 'jsonwebtoken';
import exists from '../../helpers/exists.js';
import findOne from '../../helpers/find-one.js';
import setDate from '../../helpers/set-date.js';
import generateHtmlMessage from '../../helpers/generate-html-message.js';
import notify from '../../functions/notify.js';
import dotifyObject from '../../helpers/dotify.js';
import BadRequest from '../../errors/bad-request.js';

const {
  FRONTEND_URL,
  JWT_SECRET,
} = process.env;

const commonService = {
  async createUser(Model, userInfo) {
    const { email, password, phoneNumber, institution, name } = userInfo;
    let user = await findOne(Model, { email }, true);
    user = new Model({ email, password, phoneNumber, institution, name });
    user.type = `${Model?.modelName}`;
    user.status = 'Pending email confirmation';
    await setDate(user, 'createdAt');
    await user.save();
    const subject = 'Email confirmation';
    const htmlMessage = await generateHtmlMessage(
      'Welcome!',
      'Please confirm your email by clicking the link below:',
      `${FRONTEND_URL}/app/email-confirmation?email=${user.email}`,
      'Confirm email',
    );
    notify(email, subject, htmlMessage);
    return user;
  },
  async confirmEmail(Model, email) {
    const user = await findOne(Model, { email });
    if (user.status === 'Email confirmed') {
      throw new BadRequest(`${Model?.modelName} ${email} already confirmed`);
    }
    if (user.status !== 'Pending email confirmation') {
      throw new BadRequest(`${Model?.modelName} ${email} status is not pending confirmation`);
    }
    if (user.email === email) {
      user.status = 'Email confirmed';
      await user.save();
    }
  },
  async recoverPassword(Model, email) {
    const user = await findOne(Model, { email });
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
  },
  async resetPassword(Model, email, passwordRecoveryToken, newPassword) {
    const user = await findOne(Model, { email });
    if (!exists(user.passwordRecoveryToken)) {
      throw new BadRequest('There is no request to recover the password');
    }
    if (passwordRecoveryToken !== user.passwordRecoveryToken) {
      throw new BadRequest('Incorrect password recovery token');
    }
    user.password = newPassword;
    user.passwordRecoveryToken = undefined;
    await user.save();
  },
  async authenticate(Model, email, password) {
    const user = await findOne(Model, { email });
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
    return jwt;
  },
  async updateUser(Model, email, update) {
    const user = await findOne(Model, { email });
    await setDate(update, 'lastUpdatedAt');
    const dotifiedUpdate = await dotifyObject(update);
    await user.updateOne(dotifiedUpdate);
  },
};

export default commonService;