import path from 'node:path';
import nodemailer from 'nodemailer';
import exists from '../helpers/exists.js';

const {
  SENDER_EMAIL,
  SENDER_TOKEN,
} = process.env;

async function checkParams(recipients, subject, message, bccRecipients) {
  if (!exists(recipients)) {
    throw new BadRequest('recipients is null or undefined');
  }
  if (!Array.isArray(recipients) && typeof recipients !== 'string') {
    throw new BadRequest('recipients type is not array or string');
  }
  if (!exists(subject)) {
    throw new BadRequest('subject is null or undefined');
  }
  if (typeof(subject) !== 'string') {
    throw new BadRequest('subject type is not string');
  }
  if (!exists(message)) {
    throw new BadRequest('message is null or undefined');
  }
  if (typeof(message) !== 'string') {
    throw new BadRequest('message type is not string');
  }
  if (exists(bccRecipients)) {
    if (!Array.isArray(bccRecipients)) {
      throw new BadRequest('bccRecipients type is not array');
    }
    if (bccRecipients.length === 0) {
      throw new BadRequest('bccRecipients length is 0');
    }
  }
}

async function notify(
  recipients,
  subject,
  message,
  bccRecipients = null,
  dataAttachment = null,
) {
  await checkParams(recipients, subject, message, bccRecipients);
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: SENDER_EMAIL,
      pass: SENDER_TOKEN,
    },
  });
  const currentPath = import.meta.dir;
  const imagesPath = path.join(currentPath, '../utils/images');
  const attachments = [
    {
      path: `${imagesPath}/hat.png`,
      cid: 'hat@talentsourcery.io', // Same content id value as in the html img src
    },
    {
      path: `${imagesPath}/banner.png`,
      cid: 'banner@talentsourcery.io',
    },
  ];
  const html = `
    <div style="font-family: Sans-serif; border: 0.20em solid; border-color: #9333ea; border-radius: 10px; padding: 3%;">
      <img src="cid:hat@talentsourcery.io" style="display: block; margin: 0 auto; width: 64px; height: 64px;"/>
      ${message}
      <img src="cid:banner@talentsourcery.io" style="width: 100%; height: auto; border-radius: 10px;"/>
    </div>`;
  if (exists(dataAttachment)) {
    attachments.push({
      content: dataAttachment,
      filename: 'data.csv',
    });
  }
  const mail = {
    from: SENDER_EMAIL,
    to: recipients,
    subject,
    html,
    attachments,
    bcc: bccRecipients,
  };
  const result = await transporter.sendMail(mail);
  return result;
}

export default notify;
