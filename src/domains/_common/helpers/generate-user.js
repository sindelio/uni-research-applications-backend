import { User } from '../../../database/models.js';
import findOne from '../../../helpers/find-one.js';
import setDate from '../../../helpers/set-date.js';
import generateHtmlMessage from '../../../helpers/generate-html-message.js';
import notify from '../../../functions/notify.js';

const {
  FRONTEND_URL,
} = process.env;

async function generateUser(userInfo) {
  const {
    email,
    password,
    phoneNumber,
    type,
    institution,
    name,
  } = userInfo;
  let user = await findOne(User, { email }, true);
  user = new User({ email, password, phoneNumber, type, institution, name });
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
}

export default generateUser;
