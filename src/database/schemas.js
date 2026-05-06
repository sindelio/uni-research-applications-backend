import mongoose from 'mongoose';

const { Schema } = mongoose;

const dateFields = {
  readableDate: String,
  isoDate: String,
  year: Number,
  month: Number,
  day: Number,
  hour: Number,
};

const userBaseFields = {
  email: { type: String, index: true },
  password: String,
  phone: String,
  name: String,
  institution: String,
  type: String, // Admin, Participant, Examiner
  status: String, // Pending email confirmation, Email confirmed, Payment confirmed
  passwordRecoveryToken: String,
  createdAt: dateFields,
  lastUpdatedAt: dateFields,
};

const superAdminSchema = new Schema({
  email: { type: String, index: true },
  password: String,
  name: String,
  type: String, // SuperAdmin
  createdAt: dateFields,
  lastUpdatedAt: dateFields,
});

const adminSchema = new Schema(userBaseFields);

const participantSchema = new Schema({
  ...userBaseFields,
  numProjects: Number,
  receiptFile: {
    data: Buffer,
    isSubmitted: Boolean,
  },
});

const examinerSchema = new Schema({
  ...userBaseFields,
  areas: [String],
  numProjects: Number,
  maxProjects: Number, // Minimum 3
});

const projectSchema = new Schema({
  title: String,
  institution: String,
  authors: [String],
  areas: [String],
  description: String,
  type: String, // Convencional or Fotográfico 
  bannerFile: {
    data: Buffer,
    isSubmitted: Boolean,
  },
  participantEmail: String,
  examinerEmail: String,
  status: String, // Waiting examiner, Pending review, Approved or Rejected
  createdAt: dateFields,
  lastUpdatedAt: dateFields,
});

const errorLogSchema = new Schema({
  email: { type: String, index: true },
  errorType: String,
  userType: String,
  url: String,
  httpMethod: String,
  body: String,
  statusCode: Number,
  message: String,
  stack: String,
  createdAt: dateFields,
});

export {
  superAdminSchema,
  adminSchema,
  participantSchema,
  examinerSchema,
  projectSchema,
  errorLogSchema,
};
