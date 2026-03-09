import { TZDate } from '@date-fns/tz';
import exists from './exists.js';
import BadRequest from '../errors/bad-request.js';

async function checkParams(object, property) {
  if (!exists(object)) {
    throw new BadRequest('object is null or undefined');
  }
  if (typeof(object) !== 'object') {
    throw new BadRequest('object type is not object');
  }
  if (!exists(property)) {
    throw new BadRequest('property is null or undefined');
  }
  if (typeof(property) !== 'string') {
    throw new BadRequest('object type is not string');
  }
}

async function setDate(object, property) {
  await checkParams(object, property);
  const tzDate = new TZDate(new Date(), 'America/Sao_Paulo');
  object[property] = {
    readableDate: tzDate.toString(),
    isoDate: tzDate.toISOString(),
    year: tzDate.getFullYear(),
    month: tzDate.getMonth(),
    day: tzDate.getDate(),
    hour: tzDate.getHours(),
  };
}

export default setDate;
