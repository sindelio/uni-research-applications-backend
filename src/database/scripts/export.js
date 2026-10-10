import mongoose from 'mongoose';
import connectToDatabase from '../scripts/connect.js';
import { Project } from '../models.js';
import fs from 'fs';
import logger from '../../logs/logger.js';

const {
  PROJECT_STATUS_APPROVED,
} = process.env;

connectToDatabase();

const projects = await Project.find({});
const projectObjs = projects.map((project) => {
  const projectObj = project.toObject();
  delete projectObj.photoFile;
  delete projectObj.lastUpdatedAt;
  delete projectObj.createdAt;
  delete projectObj.__v;
  // delete projectObj._id;
  return projectObj;
});

// const filteredProjects = projectObjs.filter((project) => {
//   if (project.status === PROJECT_STATUS_APPROVED) {
//     return true;
//   }
//   return false;
// });

fs.writeFileSync(
  'projects.json',
  JSON.stringify(projectObjs, null, 2)
);

await mongoose.disconnect();

logger.info('Export complete');