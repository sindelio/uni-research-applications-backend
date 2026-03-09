import exists from './exists';
import BadRequest from '../errors/bad-request';

async function checkParams(itemsArray) {
  if (!exists(itemsArray)) {
    throw new BadRequest('itemsArray is null or undefined');
  }
  if (!Array.isArray(itemsArray)) {
    throw new BadRequest('itemsArray type is not array');
  }
}

async function deduplicate(itemsArray) {
  await checkParams(itemsArray);
  const set = new Set(itemsArray);
  const uniqueItems = [...set];
  return uniqueItems;
}

export default deduplicate;