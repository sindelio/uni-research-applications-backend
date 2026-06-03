import { Examiner } from '../../../database/models.js';
import exists from '../../../helpers/exists.js';

async function suggestExaminer(project) {
  const { examinerEmail, areas: projectAreas } = project;

  // Exit if project already has an examiner
  if (exists(examinerEmail)) {
    return null;
  }

  const projectArea0 = projectAreas[0];
  const projectArea1 = projectAreas[1];
  const examiners = await Examiner
    .find({})
    .sort({ numProjects: 1 }); // ascending

  const eligibleExaminers = examiners.filter((examiner) => {
    const { maxProjects, numProjects, areas: examinerAreas } = examiner;
    if (numProjects >= maxProjects) {
      return false;
    }
    if (!examinerAreas.includes(projectArea0) && !examinerAreas.includes(projectArea1)) {
      return false;
    } 
    return true;
  });

  if (eligibleExaminers.length > 0) {
    // Get suggested examiner
    const suggestedExaminer = eligibleExaminers[0];

    // Update project
    project.suggestedExaminerEmail = suggestedExaminer.email;
    await project.save();
  }
}

export default suggestExaminer;
