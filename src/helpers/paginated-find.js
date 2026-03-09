import exists from './exists.js';
import BadRequest from '../errors/bad-request.js';

async function checkParams(Model, query, page) {
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
  if (typeof(page) !== 'number') {
    throw new BadRequest('page type is not number');
  }
}

async function paginatedFind(Model, query, page = 1) {
  await checkParams(Model, query, page);
  const items = await Model.find(query);
  const numberOfItems = items.length;
  const itemsInPage = await Model.find(query)
    .sort('-createdAt.isoDate')
    .limit(10)
    .skip((page - 1) * 10);
  return {
    numberOfItems,
    itemsInPage,
  };
}

export default paginatedFind;
