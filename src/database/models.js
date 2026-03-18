import mongoose from 'mongoose';
import {
  superAdminSchema,
  adminSchema,
  participantSchema,
  examinerSchema,
  projectSchema,
  errorLogSchema,
} from './schemas.js';

const SuperAdmin = mongoose.model('SuperAdmin', superAdminSchema);
const Admin = mongoose.model('Admin', adminSchema);
const Participant = mongoose.model('Participant', participantSchema);
const Examiner = mongoose.model('Examiner', examinerSchema);
const Project = mongoose.model('Project', projectSchema);
const ErrorLog = mongoose.model('ErrorLog', errorLogSchema);

export {
  SuperAdmin,
  Admin,
  Participant,
  Examiner,
  Project,
  ErrorLog,
};
