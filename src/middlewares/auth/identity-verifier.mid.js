import jsonwebtoken from 'jsonwebtoken';
import exists from '../../helpers/exists.js';
import Unauthorized from '../../errors/unauthorized.js';

const {
  JWT_SECRET,
} = process.env;

async function identityVerifier(req, _res, next) {
  const authHeader = req?.headers?.authorization;
  if (authHeader === '' || !exists(authHeader)) {
    throw new Unauthorized('authorization header is null, undefined or ""');
  }
  const token = authHeader?.split('Bearer ')[1];
  if (token === '' || !exists(token)) {
    throw new Unauthorized('A token must be provided in the format: "Bearer $API_KEY"');
  }
  try {
    req.user = jsonwebtoken.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    throw new Unauthorized(err.message);
  }
}

export default identityVerifier;
