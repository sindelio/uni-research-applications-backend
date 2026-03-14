import mongoose from 'mongoose';
import logger from '../../logs/logger.js';

const {
  DB_NAME,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
} = process.env;

async function connectToDatabase() {
  mongoose.set('strictQuery', false);
  const dbUri = `mongodb://${DB_USERNAME}:${DB_PASSWORD}@localhost:${DB_PORT}`;
  const dbOptions = { dbName: DB_NAME };
  await mongoose.connect(dbUri, dbOptions);
  logger.info(`Connected to the database ${DB_NAME}`);
}

export default connectToDatabase;
