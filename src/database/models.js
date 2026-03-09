import mongoose from 'mongoose';
import {
  adminSchema,
  userSchema,
  errorLogSchema,
} from './schemas.js';

const Admin = mongoose.model('Admin', adminSchema);
const User = mongoose.model('User', userSchema);
const ErrorLog = mongoose.model('ErrorLog', errorLogSchema);

export {
  User,
  Admin,
  ErrorLog,
};
