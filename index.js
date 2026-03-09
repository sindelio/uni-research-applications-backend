// Importing modules
import mongoose from 'mongoose';
import logger from './src/logs/logger.js';

// Importing the HTTP server built with Express
import server from './src/server.js';

// Reading the environment variables
const {
  ENVIRONMENT,
  DB_NAME,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  SERVER_PORT,
} = process.env;

// Connecting to the database
mongoose.set('strictQuery', false);
await mongoose.connect(
  `mongodb://${DB_USERNAME}:${DB_PASSWORD}@localhost:${DB_PORT}`,
  { dbName: DB_NAME },
);

// Starting the HTTP server
server.listen(SERVER_PORT, () => {
  logger.info(`${ENVIRONMENT} environment`);
  logger.info(`Backend HTTP server is listening on port ${SERVER_PORT}`);
});
