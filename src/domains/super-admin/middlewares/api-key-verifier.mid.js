import Unauthorized from '../../../errors/unauthorized.js';

const {
  SUPER_ADMIN_API_KEY,
} = process.env;

function apiKeyVerifier(req, _res, next) {
  const superAdminApiKey = req.headers['super-admin-api-key'];
  if (superAdminApiKey === SUPER_ADMIN_API_KEY) {
    next();
  } else {
    throw new Unauthorized('Unauthorized API access');
  }
}

export default apiKeyVerifier;