// Note: Read and Delete are not reused

import crypto from 'crypto';
import jsonWebToken from 'jsonwebtoken';
import exists from '../../helpers/exists.js';
import findOne from '../../helpers/find-one.js';
import setDate from '../../helpers/set-date.js';
import generateHtmlMessage from '../../helpers/generate-html-message.js';
import dotifyObject from '../../helpers/dotify.js';
import notify from '../../functions/notify.js';
import BadRequest from '../../errors/bad-request.js';

const {
  FRONTEND_URL,
  JWT_SECRET,
  USER_STATUS_PENDING_EMAIL_CONFIRMATION,
  USER_STATUS_EMAIL_CONFIRMED,
} = process.env;

const commonService = {
  async createUser(Model, userInfo) {
    const { email, password, phone, institution, name } = userInfo;
    let user = await findOne(Model, { email }, true);
    user = new Model({ email, password, phone, institution, name });
    user.userType = `${Model?.modelName}`;
    user.status = USER_STATUS_PENDING_EMAIL_CONFIRMATION;
    await setDate(user, 'createdAt');
    await user.save();
    const subject = 'Confirmação de email';
    const htmlMessage = await generateHtmlMessage(
      'Bem vindo(a)!',
      'Por favor confirme seu email clicando no link abaixo:',
      `${FRONTEND_URL}/app/email-confirmation?email=${user.email}&userType=${user.userType}`,
      'Confirmar email',
    );
    notify(email, subject, htmlMessage);
    return user;
  },
  async confirmEmail(Model, email) {
    const user = await findOne(Model, { email });
    if (user.status === 'Email confirmed') {
      throw new BadRequest(`${Model?.modelName} ${email} já confirmado`);
    }
    if (user.status !== 'Pending email confirmation') {
      throw new BadRequest(`${Model?.modelName} ${email} status não é "Aguardando confirmação de email"`);
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
    const { userType } = user;
    const subject = 'TalentSourcery password recovery';
    const htmlMessage = await generateHtmlMessage(
      'Saudações do ENPCV!',
      'Você pode resetar sua senha através do link abaixo:',
      `${FRONTEND_URL}/app/password-reset?email=${email}&userType=${userType}&token=${token}`,
      'Resetar senha',
    );
    notify(email, subject, htmlMessage);
  },
  async resetPassword(Model, email, passwordRecoveryToken, newPassword) {
    const user = await findOne(Model, { email });
    if (!exists(user.passwordRecoveryToken)) {
      throw new BadRequest('Não há pedido de recuperação de senha');
    }
    if (passwordRecoveryToken !== user.passwordRecoveryToken) {
      throw new BadRequest('Token de recuperação de senha incorreto');
    }
    user.password = newPassword;
    user.passwordRecoveryToken = undefined;
    await user.save();
  },
  async authenticate(Model, email, password) {
    const user = await findOne(Model, { email });
    if (user.status === 'Pending email confirmation') {
      throw new BadRequest('Por favor confirme seu e-mail antes de entrar no sistema');
    }
    if (password !== user?.password) {
      throw new BadRequest('Senha incorreta, por favor tente novamente');
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

    // Fix for array fields
    if (update?.areas) {
      user.areas = [];
      await user.save();
    }
    
    const dotifiedUpdate = await dotifyObject(update);
    await user.updateOne(dotifiedUpdate);
  },
};

export default commonService;