import exists from './exists.js';
import NotFound from '../errors/not-found.js';
import BadRequest from '../errors/bad-request.js';

async function checkParams(Model, query, checkExistence) {
  if (!exists(Model)) {
    throw new BadRequest('Model is null or undefined');
  }
  if (typeof(Model) !== 'function') {
    throw new BadRequest('Model type is not function');
  }
  if (!exists(query)) {
    throw new BadRequest('query is null or undefined');
  }
  if (typeof(query) !== 'object') {
    throw new BadRequest('query type is not object');
  }
  if (
    checkExistence !== true
    && checkExistence !== false
  ) {
    throw new BadRequest('checkExistence is not true or false');
  }
}

async function findOne(Model, query, checkExistence = false) {
  await checkParams(Model, query, checkExistence);
  const item = await Model.findOne(query);
  if (checkExistence) {
    if (exists(item)) {
      throw new BadRequest(`${Model?.modelName} already exists in database`);
    }
  } else {
    if (!exists(item)) {
      throw new NotFound(`${Model?.modelName} not found in database`);
    }
  }
  return item;
}

export default findOne;
