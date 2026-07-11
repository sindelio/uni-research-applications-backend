import jsonwebtoken from 'jsonwebtoken';
import exists from '../../helpers/exists.js';
import Unauthorized from '../../errors/unauthorized.js';

const {
  JWT_SECRET,
} = process.env;

async function identityVerifier(req, _res, next) {
  const authHeader = req?.headers?.authorization;
  if (authHeader === '' || !exists(authHeader)) {
    throw new Unauthorized('Cabeçalho de autorização é null, undefined ou ""');
  }
  const token = authHeader?.split('Bearer ')[1];
  if (token === '' || !exists(token)) {
    throw new Unauthorized('Um token deve ser provido no formato: "Bearer $TOKEN"');
  }
  try {
    req.user = jsonwebtoken.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    throw new Unauthorized(err.message);
  }
}

export default identityVerifier;
