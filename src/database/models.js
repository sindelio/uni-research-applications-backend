import mongoose from 'mongoose';
import {
  superAdminSchema,
  adminSchema,
  participantSchema,
  examinerSchema,
  projectSchema,
  settingsSchema,
  errorLogSchema,
} from './schemas.js';

const SuperAdmin = mongoose.model('SuperAdmin', superAdminSchema);
const Admin = mongoose.model('Admin', adminSchema);
const Participant = mongoose.model('Participant', participantSchema);
const Examiner = mongoose.model('Examiner', examinerSchema);
const Project = mongoose.model('Project', projectSchema);
const Settings = mongoose.model('Settings', settingsSchema);
const ErrorLog = mongoose.model('ErrorLog', errorLogSchema);

export {
  SuperAdmin,
  Admin,
  Participant,
  Examiner,
  Project,
  Settings,
  ErrorLog,
};
