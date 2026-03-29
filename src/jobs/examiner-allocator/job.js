import { Project } from '../../database/models.js';
import { CronJob } from 'cron';
import find from '../../helpers/find.js';
import allocateExaminer from '../../domains/_common/helpers/allocate-examiner.js';
import logger from '../../logs/logger.js';

async function allocateExaminersToProjects() {
  logger.info('Running cron job: examiner allocator');
  try {
    const projects = await find(Project, {}, true);
    for (let i = 0; i < projects.length; i += 1) {
      const project = projects[i];
      await allocateExaminer(project);
    }
    logger.info('Cron job finished: examiner allocator');
  } catch (err) {
    logger.info('Error on cron job: examiner allocator');
    logger.error(err);
  }
}

const cronJob = new CronJob(
  // '* * * * * *', // seconds minutes hours dayOfMonth Month dayOfWeek
  // '*/10 * * * * *', // Runs every 10 seconds, for testing
  '0 0 0 * * *', // Runs every day at midnight
  allocateExaminersToProjects,
  null,
  false, // if false, use job.start()
  'America/Sao_Paulo',
);

export default cronJob;
