import mongoose from 'mongoose';
import connectToDatabase from '../scripts/connect.js';
import { Project } from '../models.js';
import fs from 'fs';
import logger from '../../logs/logger.js';

connectToDatabase();

const projects = await Project.find({});
const projectObjs = projects.map((project) => {
  const projectObj = project.toObject();
  delete projectObj.photoFile;
  delete projectObj.lastUpdatedAt;
  delete projectObj._id;
  delete projectObj.__v;
  return projectObj;
});

fs.writeFileSync(
  'projects.json',
  JSON.stringify(projectObjs, null, 2)
);

await mongoose.disconnect();

logger.info('Export complete');