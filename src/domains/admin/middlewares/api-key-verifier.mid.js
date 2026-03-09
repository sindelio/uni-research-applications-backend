import Unauthorized from '../../../errors/unauthorized.js';

const {
  ADMIN_API_KEY,
} = process.env;

function apiKeyVerifier(req, _res, next) {
  const adminApiKey = req.headers['admin-api-key'];
  if (adminApiKey === ADMIN_API_KEY) {
    next();
  } else {
    throw new Unauthorized('Unauthorized API access');
  }
}

export default apiKeyVerifier;