import mongoose from 'mongoose';
import connectToDatabase from '../scripts/connect.js';
import { SuperAdmin } from '../models.js';
import exists from '../../helpers/exists.js';
import setDate from '../../helpers/set-date.js';
import logger from '../../logs/logger.js';

const {
  SUPER_ADMIN_EMAIL,
  SUPER_ADMIN_PASSWORD,
  SUPER_ADMIN_NAME,
} = process.env;

connectToDatabase();

const email = SUPER_ADMIN_EMAIL;
const password = SUPER_ADMIN_PASSWORD;
const name = SUPER_ADMIN_NAME;

let superAdmin = await SuperAdmin.findOne({ email, password, type: 'admin' });
if (exists(superAdmin)) {
  logger.info(`Skipping admin ${email}, already in database`);
} else {
  superAdmin = new SuperAdmin({
    email,
    password,
    name,
    type: SuperAdmin.modelName,
  });
  await setDate(superAdmin, 'createdAt');
  await superAdmin.save();
  logger.info(`Super Admin ${email} added to the database`);
}

await mongoose.disconnect();
