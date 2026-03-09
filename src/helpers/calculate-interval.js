import { differenceInCalendarMonths } from 'date-fns';
import exists from './exists';
import BadRequest from '../errors/bad-request';

async function checkParams(earlierDate, laterDate) {
  if (exists(earlierDate)) {
    if (typeof(earlierDate) !== 'object') {
      throw new BadRequest('earlierDate type is not object');
    }
  }
  if (exists(laterDate)) {
    if (typeof(laterDate) !== 'object') {
      throw new BadRequest('laterDate type is not object');
    }
  }
}

async function calculateInterval(earlierDate, laterDate) {
  await checkParams(earlierDate, laterDate);
  if (!exists(earlierDate)) {
    return 0;
  }
  const earlierYear = earlierDate?.year;
  const earlierMonth = earlierDate?.month || 0;
  const presentDate = new Date();
  const laterYear = laterDate?.year || presentDate.getFullYear();
  const laterMonth = laterDate?.month || presentDate.getMonth();
  const timeIntervalInMonths = differenceInCalendarMonths(
    new Date(laterYear, laterMonth),
    new Date(earlierYear, earlierMonth),
  );
  return timeIntervalInMonths;
}

export default calculateInterval;
