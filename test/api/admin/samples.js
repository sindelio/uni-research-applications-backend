import jsonWebToken from 'jsonwebtoken';

const {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ADMIN_NAME,
  ADMIN_API_KEY,
  USER_EMAIL,
  USER_PASSWORD,
  USER_NAME,
  JWT_SECRET,
} = process.env;

const ADMIN = {
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
  name: ADMIN_NAME,
  _id: '625451aed62002acfc01803a',
  __v: 0,
};

const CREDENTIALS = {
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
};

const JWT_OPTIONS = {
  algorithm: 'HS256',
  expiresIn: '24h',
};

const JWT = await jsonWebToken.sign(CREDENTIALS, JWT_SECRET, JWT_OPTIONS);

const USER = {
  email: USER_EMAIL,
  password: USER_PASSWORD,
  name: USER_NAME,
  company: 'TalentSourcery',
  status: 'Email confirmed',
  apiToken: '0123456789abcef',
  billing: {
    plan: 'Pay ahead',
    credits: 5,
    stripeCustomerId: '***',
  },
  createdAt: {
    readableDate: 'Thu, 29 Dec 2022 17:48:38 GMT',
    isoDate: '2022-12-29T17:48:38.318Z',
  },
  lastUpdatedAt: {
    readableDate: 'Thu, 29 Dec 2022 19:44:39 GMT',
    isoDate: '2022-12-29T19:44:39.323Z',
  },
  _id: '63add2f678a81575a0627f8f',
  __v: 0,
};

export {
  ADMIN,
  CREDENTIALS,
  JWT,
  ADMIN_API_KEY,
  USER,
};
