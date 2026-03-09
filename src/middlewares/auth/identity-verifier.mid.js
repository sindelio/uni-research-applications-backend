import { User } from '../../database/models.js';
import jsonwebtoken from 'jsonwebtoken';
import exists from '../../helpers/exists.js';
import Unauthorized from '../../errors/unauthorized.js';

const {
  USER_JWT_SECRET,
  ADMIN_JWT_SECRET,
} = process.env;

async function identityVerifier(req, _res, next) {
  const authHeader = req?.headers?.authorization;
  if (authHeader === '' || !exists(authHeader)) {
    throw new Unauthorized('authorization header is null, undefined or ""');
  }
  const ApiKeyOrToken = authHeader?.split('Bearer ')[1];
  if (ApiKeyOrToken === '' || !exists(ApiKeyOrToken)) {
    throw new Unauthorized('An API key must be provided in the format: "Bearer $API_KEY"');
  }
  let secret = USER_JWT_SECRET;
  if (req.originalUrl.includes('/v1/admin')) {
    secret = ADMIN_JWT_SECRET;
  }
  let user = await User.findOne({ apiKey: ApiKeyOrToken });
  if (!exists(user)) {
    try {
      user = await jsonwebtoken.verify(ApiKeyOrToken, secret);
    } catch (err) {
      throw new Unauthorized(err.message);
    }
  }
  req.user = user;
  next();
}

export default identityVerifier;
