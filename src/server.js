// Importing modules
import express from 'express';

// Importing Express middleware
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';

// Importing Express routers
import adminRouter from './domains/admin/router.js';
import healthRouter from './domains/health/router.js';
import userRouter from './domains/user/router.js';

// Importing global error handler
import globalErrorHandler from './middlewares/error-handlers/global-error-handler.mid.js';

// Importing handler for endpoints that are not available
import routeNotFoundHandler from './middlewares/error-handlers/404-handler.mid.js';

// Instantiating the app's HTTP server
const server = express();

// Setting middleware (order matters)
server.use(helmet()); // Middleware to set response headers securely
const corsOptions = { origin: '*' };
server.use(cors(corsOptions)); // Middleware to set Cross Origin Resource Sharing
server.use(bodyParser.json({ // Middleware to parse an incoming JSON body as an object
  type: 'application/json',
  limit: '1mb', // Default is 100kb
}));

// API routing
server.use('/v1/admin', adminRouter);
server.use('/v1/health', healthRouter);
server.use('/v1', userRouter);

// Setting global error handler
server.use(globalErrorHandler);

// Setting handler for endpoints that are not available (404 error handler)
server.use(routeNotFoundHandler);

export default server;
