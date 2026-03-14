import mongoose from 'mongoose';
import {
  superAdminSchema,
  userSchema,
  errorLogSchema,
} from './schemas.js';

const SuperAdmin = mongoose.model('SuperAdmin', superAdminSchema);
const User = mongoose.model('User', userSchema);
const ErrorLog = mongoose.model('ErrorLog', errorLogSchema);

export {
  SuperAdmin,
  User,
  ErrorLog,
};
