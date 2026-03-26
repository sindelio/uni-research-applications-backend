import {
  Examiner,
} from '../../../database/models.js';

async function allocateExaminer(project) {
  const projectAreas = project.areas;
  const projectArea0 = projectAreas[0];
  const projectArea1 = projectAreas[1];
  const examiners = await Examiner.find({})
    .sort({ numProjects: 1 }); // ascending

  const eligibleExaminers = examiners.filter((examiner) => {
    const { maxProjects, numProjects } = examiner;
    if (numProjects >= maxProjects) {
      return false;
    }
    const examinerAreas = examiner.areas;
    if (!examinerAreas.includes(projectArea0) && !examinerAreas.includes(projectArea1)) {
      return false;
    } 
    return true;
  });

  if (eligibleExaminers.length > 0) {
    const allocatedExaminer = eligibleExaminers[0];
    project.examinerEmail = allocatedExaminer.email;
    project.status = 'Pending review';
    allocatedExaminer.numProjects += 1;
    await allocatedExaminer.save();
    // TODO: SEND EMAIL
  }
}

export default allocateExaminer;
