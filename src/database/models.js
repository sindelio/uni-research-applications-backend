import mongoose from 'mongoose';
import {
  superAdminSchema,
  userSchema,
  projectSchema,
  errorLogSchema,
} from './schemas.js';

const SuperAdmin = mongoose.model('SuperAdmin', superAdminSchema);
const User = mongoose.model('User', userSchema);
const Project = mongoose.model('Project', projectSchema);
const ErrorLog = mongoose.model('ErrorLog', errorLogSchema);

export {
  SuperAdmin,
  User,
  Project,
  ErrorLog,
};
