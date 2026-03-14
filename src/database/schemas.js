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

const superAdminSchema = new Schema({
  email: { type: String, index: true },
  password: String,
  name: String,
  createdAt: dateFields,
  lastUpdatedAt: dateFields,
});

const userSchema = new Schema({
  email: { type: String, index: true },
  password: String,
  type: String, // admin, participant or examiner
  phoneNumber: String,
  name: String,
  institution: String,
  createdAt: dateFields,
  lastUpdatedAt: dateFields,
  status: String,
  passwordRecoveryToken: String,
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
  userSchema,
  errorLogSchema,
};
