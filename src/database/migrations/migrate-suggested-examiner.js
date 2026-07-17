import mongoose from 'mongoose';
import connectToDatabase from '../scripts/connect.js';
import { Project } from '../models.js';
import exists from '../../helpers/exists.js';
import setDate from '../../helpers/set-date.js';
import logger from '../../logs/logger.js';
import suggestExaminer from '../../domains/_common/helpers/suggest-examiner.js';

connectToDatabase();

const projects = await Project.find({});

for (let i = 0; i < projects.length; i++) {
  logger.info(`i = ${i}`);
  const project = projects[i];
  await suggestExaminer(project);
}

await mongoose.disconnect();
