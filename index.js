// Import modules
import logger from './src/logs/logger.js';

// Import the HTTP server built with Express
import server from './src/server.js';
import connectToDatabase from './src/database/scripts/connect.js';

// Import cron jobs
import examinerAllocatorJob from './src/jobs/examiner-allocator/job.js';

// Read environment variables
const {
  ENVIRONMENT,
  SERVER_PORT,
} = process.env;

// Connect to the database
await connectToDatabase();

// Start the HTTP server
server.listen(SERVER_PORT, () => {
  logger.info(`${ENVIRONMENT} environment`);
  logger.info(`Backend HTTP server is listening on port ${SERVER_PORT}`);

  // Set up the cron jobs
  examinerAllocatorJob.start();
  logger.info('Cron job set up: examiner allocator');
});
