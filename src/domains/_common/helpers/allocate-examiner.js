import { Examiner } from '../../../database/models.js';
import exists from '../../../helpers/exists.js';
import generateHtmlMessage from '../../../helpers/generate-html-message.js';
import notify from '../../../functions/notify.js';

const {
  FRONTEND_URL,
} = process.env;

async function allocateExaminer(project) {
  const { participantEmail, examinerEmail, areas: projectAreas } = project;

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
    // Update examiner
    const allocatedExaminer = eligibleExaminers[0];
    allocatedExaminer.numProjects += 1;
    await allocatedExaminer.save();

    // Update project
    project.examinerEmail = allocatedExaminer.email;
    project.status = 'Pending review';
    await project.save();

    // Notify
    const subject = 'Projeto enviado para análise';
    const htmlMessage = await generateHtmlMessage(
      'Você recebeu um projeto para análise',
      'Visualize o projeto na plataforma:',
      `${FRONTEND_URL}/app/signin`,
      'Login',
    );
    notify(participantEmail, subject, htmlMessage);
  }
}

export default allocateExaminer;
