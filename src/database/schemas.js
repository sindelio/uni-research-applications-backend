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
  name: String,
  createdAt: dateFields,
  lastUpdatedAt: dateFields,
};

const adminSchema = new Schema(userBaseFields);

const userSchema = new Schema({
  ...userBaseFields,
  company: String,
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
  adminSchema,
  userSchema,
  errorLogSchema,
};
