import mongoose from 'mongoose';
import { Admin } from '../models.js';
import exists from '../../helpers/exists.js';
import logger from '../../logs/logger.js';

const {
  DB_NAME,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ADMIN_NAME,
} = process.env;

mongoose.set('strictQuery', false);
await mongoose.connect(
  `mongodb://${DB_USERNAME}:${DB_PASSWORD}@localhost:${DB_PORT}`,
  { dbName: DB_NAME },
);

const email = ADMIN_EMAIL;
const password = ADMIN_PASSWORD;
const name = ADMIN_NAME;

let admin = await Admin.findOne({ email, password });
if (exists(admin)) {
  logger.info(`Skipping admin ${email}, already in database`);
} else {
  const date = new Date();
  admin = new Admin({
    email,
    password,
    name,
    createdAt: {
      readableDate: date.toUTCString(),
      isoDate: date.toISOString(),
      month: date.getMonth(),
      year: date.getFullYear(),
    },
  });
  await admin.save();
  logger.info(`Admin ${email} added to the database`);
}

await mongoose.disconnect();
