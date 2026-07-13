import exists from './exists.js';
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
  if (typeof(checkExistence) !== 'boolean') {
    throw new BadRequest('checkExistence type is not boolean');
  }
}

async function find(Model, query, checkExistence = false) {
  await checkParams(Model, query, checkExistence);
  const items = await Model.find(query);
  if (checkExistence === true) {
    if (!Array.isArray(items)) {
      throw new BadRequest('item não é um vetor');
    }
    if (items.length === 0) {
      throw new BadRequest(`Nenhum ${Model.modelName}s foi encontrado com os critérios na base de dados`);
    }
  }
  return items;
}

export default find;
