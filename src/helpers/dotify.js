import exists from './exists.js';
import BadRequest from '../errors/bad-request.js';

async function checkParams(object) {
  if (!exists(object)) {
    throw new BadRequest('object is null or undefined');
  }
  if (typeof(object) !== 'object') {
    throw new BadRequest('object type is not object');
  }
}

async function dotifyObject(object) {
  await checkParams(object);
  const result = {};
  function recursion(object, prefix) {
    const entries = Object.entries(object);
    for (const [key, value] of entries) {
      let newKey = null;
      if (exists(prefix)) {
        newKey = prefix + '.' + key;
      } else {
        newKey = key;
      }
      if (typeof value === 'object') {
        recursion(value, newKey);
      } else {
        result[newKey] = value;
      }
    }
  }
  recursion(object, null);
  return result;
}

export default dotifyObject;
